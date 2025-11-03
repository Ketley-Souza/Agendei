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

        const agendamentos = await Agendamento.find({
            status: 'A',
            salaoId,
            data: {
                $gte: startOfDay(new Date(range.start)),
                $lte: endOfDay(new Date(range.end)),
            },
        }).populate([
            { path: 'servicoId', select: 'nomeServico duracao preco' },
            { path: 'servicosAdicionais', select: 'nomeServico duracao preco' },
            { path: 'colaboradorId', select: 'nome' },
            { path: 'clienteId', select: 'nome' },
        ]);

        res.json({ error: false, agendamentos });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

// -----------------------------
// CRIAR AGENDAMENTO (ajustado para UTC−3)
// -----------------------------
router.post('/', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { clienteId, salaoId, servicoId, servicosAdicionais, colaboradorId, data } = req.body;

        // === AJUSTE DE FUSO HORÁRIO ===
        const ajustarParaHorarioLocal = (dateString) => {
            const d = new Date(dateString);
            const offset = d.getTimezoneOffset();
            return new Date(d.getTime() - offset * 60000);
        };

        const dataLocal = data ? ajustarParaHorarioLocal(data) : null;

        // === VALIDAÇÕES ===
        const cliente = await Cliente.findById(clienteId).select('nome endereco');
        const salao = await Salao.findById(salaoId).select('nome');
        const servico = await Servico.findById(servicoId).select('nomeServico preco duracao');
        const colaborador = await Colaborador.findById(colaboradorId).select('nome');

        if (!cliente || !salao || !servico || !colaborador)
            throw new Error('Dados inválidos para criar o agendamento.');

        //Buscar outros serviçõs
        let servicosAdicionaisData = [];
        let precoTotal = servico.preco;

        if (servicosAdicionais && Array.isArray(servicosAdicionais) && servicosAdicionais.length > 0) {
            servicosAdicionaisData = await Servico.find({
                _id: { $in: servicosAdicionais }
            }).select('nomeServico preco duracao');
            
            //Somar preço total
            precoTotal += servicosAdicionaisData.reduce((sum, s) => sum + s.preco, 0);
        }

        // === CRIA E SALVA AGENDAMENTO ===
        const novoAgendamento = new Agendamento({
            salaoId,
            clienteId,
            servicoId,
            servicosAdicionais: servicosAdicionaisData.map(s => s._id),
            colaboradorId,
            data: dataLocal,
            preco: precoTotal,
            status: 'A',
            dataCadastro: new Date(),
        });

        await novoAgendamento.save({ session });
        await session.commitTransaction();
        session.endSession();

        // Retornar com populate
        const agendamentoPopulado = await Agendamento.findById(novoAgendamento._id)
            .populate('servicoId', 'nomeServico duracao preco')
            .populate('servicosAdicionais', 'nomeServico duracao preco')
            .populate('clienteId', 'nome')
            .populate('colaboradorId', 'nome');

        res.json({ error: false, agendamento: agendamentoPopulado });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.json({ error: true, message: err.message });
    }
});

// -----------------------------
// DIAS DISPONÍVEIS (inalterado)
// -----------------------------
router.post('/dias-disponiveis', async (req, res) => {
    try {
        const { data, salaoId, servicoId } = req.body;

        const horarios = await Horario.find({ salaoId });
        const servico = await Servico.findById(servicoId).select('duracao');

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
                for (let colaboradorKey of Object.keys(todosHorariosDia)) {
                    const agendamentos = await Agendamento.find({
                        colaboradorId: colaboradorKey,
                        data: {
                            $gte: startOfDay(lastDay),
                            $lte: endOfDay(lastDay),
                        },
                    }).select('data -_id');

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

module.exports = router;
