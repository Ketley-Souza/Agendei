const express = require('express');
const router = express.Router();
const Salao = require('../models/salao');
const Servico = require('../models/servico');
const Horario = require('../models/horario');

// Rota para criar um novo salão
router.post('/', async (req, res) => {
    try {
        // Cria um novo salão com os dados enviados no corpo da requisição (req.body)
        const salao = await new Salao(req.body).save();

        // Retorna o salão criado em formato JSON
        res.json({ salao });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

// Rota para listar os serviços de um salão
router.get('/servicos/:salaoId', async (req, res) => {
    try {
        // Pega o ID do salão que vem pela URL
        const { salaoId } = req.params;

        // Busca no banco de dados todos os serviços ativos ('A') do salão
        const servicos = await Servico.find({
            salaoId,
            status: 'Disponivel',
        }).select('_id titulo'); // seleciona apenas o ID e o título

        // Retorna os serviços no formato { label: nome, value: id }
        res.json({
            error: false,
            servicos: servicos.map((s) => ({ label: s.titulo, value: s._id })),
        });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

// Rota para filtrar dados de um salão
router.post('/filter/:id', async (req, res) => {
    try {
        // Busca o salão pelo ID enviado na URL e seleciona apenas os campos solicitados no corpo da requisição
        const salao = await Salao.findById(req.params.id).select(req.body.fields);

        // Busca os horários de funcionamento do salão no banco
        const horarios = await Horario.find({
            salaoId: req.params.id,
        }).select('dias inicio fim'); // apenas os campos dias, início e fim

        // Usa uma função auxiliar (util.isOpened) para saber se o salão está aberto agora
        const isOpened = await util.isOpened(horarios);

        // Retorna as informações do salão junto com o status de aberto/fechado
        res.json({ error: false, salao: { ...salao._doc, isOpened } });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

module.exports = router;
