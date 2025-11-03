const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Servico = require('../models/servico');

// CONFIGURAÇÃO DO MULTER 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Caminho da pasta onde os arquivos serão salvos
        const dir = path.join(__dirname, '..', '..', 'uploads', 'servicos');

        // Cria a pasta se não existir
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Gera nome único pra evitar conflito
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // limite: 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens (JPEG, JPG, PNG, WEBP) são permitidas.'));
        }
    },
});

// CRIAR SERVIÇO
router.post('/', upload.single('imagem'), async (req, res) => {
    try {
        //Pra testar com o Thunder
        let jsonServico;
        
        if (req.body.servico) {
            //Formdata
            jsonServico = typeof req.body.servico === 'string' 
                ? JSON.parse(req.body.servico) 
                : req.body.servico;
        } else {
            //Json puro
            jsonServico = req.body;
        }

        //Validação
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
        jsonServico.imagem = req.file ? `/uploads/servicos/${req.file.filename}` : null;

        const servico = await new Servico(jsonServico).save();

        return res.status(201).json({ error: false, servico });
    } catch (err) {
        console.error('Erro ao criar serviço:', err);
        return res.status(500).json({ error: true, message: err.message });
    }
});

// LISTAR SERVIÇOS
router.get('/salao/:salaoId', async (req, res) => {
    try {
        const { salaoId } = req.params;
        //Validando
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
/*=====
ATUALIZAR SERVIÇO
=====*/  
router.put('/:id', upload.single('imagem'), async (req, res) => {
    try {
        const { id } = req.params;
        //Validando
        if (!require('mongoose').Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: true, message: 'ID inválido' });
        }
        
        //Aceitando Json e Formdata
        let jsonServico;
        if (req.body.servico) {
            jsonServico = typeof req.body.servico === 'string' 
                ? JSON.parse(req.body.servico) 
                : req.body.servico;
        } else {
            jsonServico = req.body;
        }
        
        //Atualizar imagem
        if (req.file) {
            jsonServico.imagem = `/uploads/servicos/${req.file.filename}`;
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
/*=====
DELETAR SERVIÇO
=====*/
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
