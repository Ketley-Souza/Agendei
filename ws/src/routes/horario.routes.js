const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Horario = require('../models/horario');
const Especialidade = require('../models/relations/especialidade');

router.post('/', async (req, res) => {
    try {
        // VERIFICAR SE EXISTE ALGUM HORARIO, NAQUELE DIA, PRAQUELE SALÃO
        const { salaoId, dias, inicio, fim } = req.body;

        //Validamdo
        if (!salaoId || !dias || !Array.isArray(dias) || dias.length === 0 || !inicio || !fim) {
            return res.status(400).json({ 
                error: true, 
                message: 'salaoId, dias (array), inicio e fim são obrigatórios' 
            });
        }
        //Ver se já tem algo do mesmo tipo marcado apra aquele dia e horário no salão
        const inicioDate = new Date(inicio);
        const fimDate = new Date(fim);

        for (const dia of dias) {
            const horarioExistente = await Horario.findOne({
                salaoId,
                dias: { $in: [dia] },
                $or: [
                    //Começa quando já existe mesmo tipo acontecendo
                    { 
                        inicio: { $lte: inicioDate }, 
                        fim: { $gte: inicioDate } 
                    },
                    //Termina quando mesmo tipo está acontecendo
                    { 
                        inicio: { $lte: fimDate }, 
                        fim: { $gte: fimDate } 
                    },
                    //Tenta entrar em um horário inteiro onde o mesmo tipo est´a aconteccendo
                    { 
                        inicio: { $gte: inicioDate }, 
                        fim: { $lte: fimDate } 
                    }
                ]
            });
            if (horarioExistente) {
                return res.json({ 
                    error: true, 
                    message: `Já existe um horário cadastrado para este período no dia da semana ${dia}!` 
                });
            }
        }
        //Caso não tenha conflito
        await new Horario(req.body).save();

        res.json({ error: false });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.get('/salao/:salaoId', async (req, res) => {
    try {
        const { salaoId } = req.params;
        //Validando
        if (!mongoose.Types.ObjectId.isValid(salaoId)) {
            return res.status(400).json({ error: true, message: 'salaoId inválido' });
        }

        const horarios = await Horario.find({
            salaoId,
        });

        res.json({ error: false, horarios });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.put('/:horarioId', async (req, res) => {
    try {
        const { horarioId } = req.params;
        const horario = req.body;
        //SE NÃO HOUVER, ATUALIZA
        //Validando
        if (!mongoose.Types.ObjectId.isValid(horarioId)) {
            return res.status(400).json({ error: true, message: 'horarioId inválido' });
        }

        const horarioAtualizado = await Horario.findByIdAndUpdate(horarioId, horario, { new: true });

        if (!horarioAtualizado) {
            return res.status(404).json({ error: true, message: 'Horário não encontrado' });
        }

        res.json({ error: false, horario: horarioAtualizado });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.post('/colaboradores', async (req, res) => {
    try {
        //Validadno caso de array vazio
        if (!Array.isArray(req.body.servicos) || req.body.servicos.length === 0) {
            return res.json({ 
                error: true, 
                message: 'serviços não pode ser um array vazio!' 
            });
        }

        const colaboradores = await Especialidade.find({
            servicoId: { $in: req.body.servicos },
            status: 'Disponivel', //Disponível e não 'A'
        })
            .populate('colaboradorId', 'nome')
            .select('colaboradorId -_id');

        const listaColaboradores = Array.from(
            new Map(
                colaboradores.map((c) => [c.colaboradorId._id.toString(), c])
            ).values()
        ).map((c) => ({
            label: c.colaboradorId.nome,
            value: c.colaboradorId._id,
        }));


        res.json({ error: false, colaboradores: listaColaboradores });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.delete('/:horarioId', async (req, res) => {
    try {
        const { horarioId } = req.params;
        //validando
        if (!mongoose.Types.ObjectId.isValid(horarioId)) {
            return res.status(400).json({ error: true, message: 'horarioId inválido!' });
        }
        const horario = await Horario.findByIdAndDelete(horarioId);
        if (!horario) {
            return res.status(404).json({ error: true, message: 'Horário não encontrado!' });
        }
        res.json({ error: false, message: 'Horário removido com sucesso!' });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});
module.exports = router;