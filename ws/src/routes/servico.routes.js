const express = require('express');
const router = express.Router();
const multer = require('multer');
const Servico = require('../models/servico');
const { servicoStorage } = require('../config/cloudinary');

const upload = multer({
    storage: servicoStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // limite: 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens (JPEG, JPG, PNG, WEBP) são permitidas.'));
        }
    },
});

router.post('/', upload.single('imagem'), async (req, res) => {
    try {
        
        if (req.body.servico) {
            jsonServico = typeof req.body.servico === 'string' 
                ? JSON.parse(req.body.servico) 
                : req.body.servico;
        } else {
            jsonServico = req.body;
        }

        if (!jsonServico.nomeServico || !jsonServico.preco || !jsonServico.duracao || !req.body.salaoId) {
            return res.status(400).json({ 
                error: true, 
                message: 'nomeServico, preco, duracao e salaoId são obrigatórios!' 
            });
        }
        if (!require('mongoose').Types.ObjectId.isValid(req.body.salaoId)) {
            return res.status(400).json({ error: true, message: 'salaoId inválido' });
        }

        jsonServico.salaoId = req.body.salaoId;
        jsonServico.imagem = req.file ? req.file.path : null;

        const servico = await new Servico(jsonServico).save();

        return res.status(201).json({ error: false, servico });
    } catch (err) {
        console.error('Erro ao criar serviço:', err);
        return res.status(500).json({ error: true, message: err.message });
    }
});

router.get('/salao/:salaoId', async (req, res) => {
    try {
        const { salaoId } = req.params;
        if (!require('mongoose').Types.ObjectId.isValid(salaoId)) {
            return res.status(400).json({ error: true, message: 'salaoId inválido' });
        }
        const servicos = await Servico.find({
            salaoId,
            status: { $ne: 'Excluido' },
        });
        return res.json({ error: false, servicos });
    } catch (err) {
        console.error('Erro ao listar serviços:', err);
        return res.status(500).json({ error: true, message: err.message });
    }
});

router.put('/:id', upload.single('imagem'), async (req, res) => {
    try {
        const { id } = req.params;
        //Validando
        if (!require('mongoose').Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: true, message: 'ID inválido' });
        }
        
        let jsonServico;
        if (req.body.servico) {
            jsonServico = typeof req.body.servico === 'string' 
                ? JSON.parse(req.body.servico) 
                : req.body.servico;
        } else {
            jsonServico = req.body;
        }
        
        if (req.file) {
            jsonServico.imagem = req.file.path;
        }
        
        const servico = await Servico.findByIdAndUpdate(id, jsonServico, { new: true });
        if (!servico) {
            return res.status(404).json({ error: true, message: 'Serviço não encontrado!' });
        }
        return res.json({ error: false, servico });
    } catch (err) {
        console.error('Não foi possivel atualizar o serviço:', err);
        return res.status(500).json({ error: true, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        //Validando
        if (!require('mongoose').Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: true, message: 'id inválido!' });
        }
        const servico = await Servico.findByIdAndUpdate(id, { status: 'Excluido' }, { new: true });
        if (!servico) {
            return res.status(404).json({ error: true, message: 'Serviço não encontrado!' });
        }
        return res.json({ error: false, message: 'Serviço excluído com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir serviço:', err);
        return res.status(500).json({ error: true, message: err.message });
    }
});

module.exports = router;
