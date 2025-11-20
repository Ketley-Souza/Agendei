const express = require('express');
const router = express.Router();
const Salao = require('../models/salao');
const Servico = require('../models/servico');
const Horario = require('../models/horario');
const util = require('../util');

router.post('/', async (req, res) => {
    try {
        const salao = await new Salao(req.body).save();

        res.json({ salao });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.get('/servicos/:salaoId', async (req, res) => {
    try {
        const { salaoId } = req.params;

        const servicos = await Servico.find({
            salaoId,
            status: 'Disponivel',
        }).select('_id nomeServico');

        // Retorna os serviços no formato { label: nome, value: id }
        res.json({
            error: false,
            servicos: servicos.map((s) => ({ label: s.nomeServico, value: s._id })),
        });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.post('/filter/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: true, message: 'ID inválido' });
        }
        const salao = await Salao.findById(id).select(req.body.fields);

        if (!salao) {
            return res.status(404).json({ error: true, message: 'Salão não encontrado' });
        }
        const horarios = await Horario.find({
            salaoId: id,
        }).select('dias inicio fim');
        const isOpened = await util.isOpened(horarios);

        res.json({ error: false, salao: { ...salao._doc, isOpened } });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

module.exports = router;
