const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { startOfDay, endOfDay, addDays, getDay, format } = require('date-fns');
const { ptBR } = require('date-fns/locale');

const Horario = require('../models/horario');
const Agendamento = require('../models/agendamento');
const Cliente = require('../models/cliente');
const Salao = require('../models/salao');
const Servico = require('../models/servico');
const Colaborador = require('../models/colaborador');
const util = require('../util');

// -----------------------------
// FILTRAR AGENDAMENTOS
// -----------------------------
router.post('/filter', async (req, res) => {
    try {
        const { range, salaoId } = req.body;
        if (!range || !range.start || !range.end || !salaoId) {
            return res.status(400).json({ 
                error: true, 
                message: 'Início e fim e SalãoId obrigatórios!' 
            });
        }

        const agendamentos = await Agendamento.find({
            status: 'A',
            salaoId,
            data: {
                $gte: startOfDay(new Date(range.start)),
                $lte: endOfDay(new Date(range.end)),
            },
        }).populate([
            { path: 'servicoId', select: 'nomeServico duracao' },
            { path: 'colaboradorId', select: 'nome' },
            { path: 'clienteId', select: 'nome' },
        ]);

        res.json({ error: false, agendamentos });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

// -----------------------------
// CRIAR AGENDAMENTO
// -----------------------------
router.post('/', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { clienteId, salaoId, servicoId, colaboradorId, data } = req.body;

        //VAlidando
        if (!clienteId || !salaoId || !servicoId || !colaboradorId || !data) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ 
                error: true, 
                message: 'Falta um ou mais campos obrigatorios: clienteId, salaoId, servicoId, colaboradorId, data!!' 
            });
        }

        //Validação para caso de data no passado
        const dataAgendamento = new Date(data);
        if (dataAgendamento < new Date()) {
            await session.abortTransaction();
            session.endSession();
            return res.json({ 
                error: true, 
                message: 'Data do agendamento inválida!' 
            });
        }

        const cliente = await Cliente.findById(clienteId).select('nome endereco');
        const salao = await Salao.findById(salaoId).select('nome');
        const servico = await Servico.findById(servicoId).select('nomeServico preco duracao comissao');
        const colaborador = await Colaborador.findById(colaboradorId).select('nome');

        if (!cliente || !salao || !servico || !colaborador) {
            await session.abortTransaction();
            session.endSession();
            return res.json({ error: true, message: 'Dados inválidos para criar o agendamento.' });
        }

        //Ver se horario está ocupado
        const servicoDuracaoMinutos = util.hourToMinutes(
            new Date(servico.duracao).toISOString().substring(11, 16)
        );
        const fimAgendamento = new Date(dataAgendamento.getTime() + servicoDuracaoMinutos * 60000);

        const conflito = await Agendamento.findOne({
            colaboradorId,
            status: 'A',
            data: {
                $gte: dataAgendamento,
                $lt: fimAgendamento
            }
        });

        if (conflito) {
            await session.abortTransaction();
            session.endSession();
            return res.json({ 
                error: true, 
                message: 'Colaborador já está ocupado neste horário!' 
            });
        }

        const novoAgendamento = new Agendamento({
            ...req.body,
            preco: servico.preco,
            status: 'A',
        });

        await novoAgendamento.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.json({ error: false, agendamento: novoAgendamento });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.json({ error: true, message: err.message });
    }
});

// -----------------------------
// DIAS DISPONÍVEIS
// -----------------------------
router.post('/dias-disponiveis', async (req, res) => {
    try {
        const { data, salaoId, servicoId } = req.body;

        //Validar dados obrigatorios
        if (!data || !salaoId || !servicoId) {
            return res.json({ error: true, message: 'data, salaoId e servicoId são obrigatórios' });
        }

        const horarios = await Horario.find({ salaoId });
        const servico = await Servico.findById(servicoId).select('duracao');

        // Validar se serviço existe
        if (!servico) {
            return res.json({ error: true, message: 'Serviço não encontrado!' });
        }

        let colaboradores = [];
        let agenda = [];
        let lastDay = new Date(data);

        const servicoDuracao = util.hourToMinutes(
            new Date(servico.duracao).toISOString().substring(11, 16)
        );

        for (let i = 0; i <= 365 && agenda.length <= 7; i++) {
            const diaSemana = getDay(lastDay);

            const espacosValidos = horarios.filter(h =>
                h.dias.includes(diaSemana) && h.especialidades.includes(servicoId)
            );

            if (espacosValidos.length > 0) {
                let todosHorariosDia = {};

                for (let espaco of espacosValidos) {
                    for (let colaborador of espaco.colaboradores) {
                        if (!todosHorariosDia[colaborador._id])
                            todosHorariosDia[colaborador._id] = [];

                        const inicio = util.mergeDateTime(lastDay, espaco.inicio);
                        const fim = util.mergeDateTime(lastDay, espaco.fim);
                        const slots = util.sliceMinutes(inicio, fim, util.SLOT_DURATION);
                        todosHorariosDia[colaborador._id].push(...slots);
                    }
                }

                // Remover horários ocupados
                //Mias um caso de (N+1), implementando mapeamento
                const colaboradorIds = Object.keys(todosHorariosDia);
                const todosAgendamentos = await Agendamento.find({
                    colaboradorId: { $in: colaboradorIds },
                    data: {
                        $gte: startOfDay(lastDay),
                        $lte: endOfDay(lastDay),
                    },
                }).select('data colaboradorId -_id');

                //Criar mapa para consulta fim do loop
                const agendamentosPorColaborador = {};
                todosAgendamentos.forEach(a => {
                    const id = a.colaboradorId.toString();
                    if (!agendamentosPorColaborador[id]) {
                        agendamentosPorColaborador[id] = [];
                    }
                    agendamentosPorColaborador[id].push(a);
                });

                //Inserindo o uso do mapa
                for (let colaboradorKey of Object.keys(todosHorariosDia)) {
                    const agendamentos = agendamentosPorColaborador[colaboradorKey] || [];

                    const ocupados = agendamentos
                        .map(a => {
                            const inicio = new Date(a.data);
                            const fim = new Date(inicio.getTime() + servicoDuracao * 60000);
                            return util.sliceMinutes(inicio, fim, util.SLOT_DURATION, false);
                        })
                        .flat();

                    const livres = todosHorariosDia[colaboradorKey].filter(h => !ocupados.includes(h));

                    if (livres.length === 0) delete todosHorariosDia[colaboradorKey];
                    else todosHorariosDia[colaboradorKey] = livres;
                }

                if (Object.keys(todosHorariosDia).length > 0) {
                    colaboradores.push(Object.keys(todosHorariosDia));
                    agenda.push({
                        [format(lastDay, 'yyyy-MM-dd')]: todosHorariosDia,
                    });
                }
            }

            lastDay = addDays(lastDay, 1);
        }

        colaboradores = await Colaborador.find({
            _id: { $in: [...new Set(colaboradores.flat())] },
        }).select('nome foto');

        colaboradores = colaboradores.map(c => ({
            ...c._doc,
            nome: c.nome.split(' ')[0],
        }));

        res.json({ error: false, colaboradores, agenda });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});
/*=====
ATUALIZAR AGENDAMENTO
=====*/
router.put('/:id', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;

        //Validadno
        if (!mongoose.Types.ObjectId.isValid(id)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: true, message: 'ID inválido!' });
        }

        const agendamento = await Agendamento.findByIdAndUpdate(
            id,
            req.body,
            { new: true, session }
        );

        if (!agendamento) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: true, message: 'Agendamento não encontrado!' });
        }

        await session.commitTransaction();
        session.endSession();
        res.json({ error: false, agendamento });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.json({ error: true, message: err.message });
    }
});

/*=====
CANCELAR AGENDAMENTO
router.put('/:id/cancelar', async (req, res) => {
    try {
        const { id } = req.params;

        // Validação de ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: true, message: 'ID inválido' });
        }

        const agendamento = await Agendamento.findByIdAndUpdate(
            id,
            { status: 'I' },
            { new: true }
        );

        if (!agendamento) {
            return res.status(404).json({ error: true, message: 'Agendamento não encontrado' });
        }

        res.json({ error: false, message: 'Agendamento cancelado com sucesso', agendamento });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});
=====*/

module.exports = router;
