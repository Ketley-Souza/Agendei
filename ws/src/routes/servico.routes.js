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
        // Se o front enviar JSON em string (ex: via FormData)
        const jsonServico = req.body.servico ? JSON.parse(req.body.servico) : req.body;

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
        const servicos = await Servico.find({
            salaoId: req.params.salaoId,
            status: { $ne: 'Excluido' },
        });

        return res.json({ error: false, servicos });
    } catch (err) {
        console.error('Erro ao listar serviços:', err);
        return res.status(500).json({ error: true, message: err.message });
    }
});

// DELETAR SERVIÇO
router.delete('/:id', async (req, res) => {
    try {
        await Servico.findByIdAndUpdate(req.params.id, { status: 'Excluido' });
        return res.json({ error: false, message: 'Serviço excluído com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir serviço:', err);
        return res.status(500).json({ error: true, message: err.message });
    }
});

module.exports = router;
