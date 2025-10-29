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
            { path: 'servicoId', select: 'titulo duracao' },
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
        const { clienteId, salaoId, servicoId, colaboradorId } = req.body;

        const cliente = await Cliente.findById(clienteId).select('nome endereco');
        const salao = await Salao.findById(salaoId).select('nome');
        const servico = await Servico.findById(servicoId).select('titulo preco duracao comissao');
        const colaborador = await Colaborador.findById(colaboradorId).select('nome');

        if (!cliente || !salao || !servico || !colaborador)
            throw new Error('Dados inválidos para criar o agendamento.');

        const novoAgendamento = new Agendamento({
            ...req.body,
            valor: servico.preco,
            comissao: servico.comissao,
            status: 'A',
            criadoEm: new Date(),
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
