const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { format } = require('date-fns');
const { ptBR } = require('date-fns/locale');

const router = express.Router();

const Colaborador = require('../models/colaborador');
const StatusColaborador = require('../models/relations/statusColaborador');
const Especialidade = require('../models/relations/especialidade');
const Servico = require('../models/servico');

const { colaboradorStorage } = require('../config/cloudinary');

const upload = multer({
    storage: colaboradorStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // limite: 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas.'));
        }
    },
});

router.post('/', upload.single('foto'), async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        let colaboradorData = req.body.colaborador
            ? typeof req.body.colaborador === 'string'
                ? JSON.parse(req.body.colaborador)
                : req.body.colaborador
            : req.body;

        const salaoId = req.body.salaoId || colaboradorData.salaoId;

        if (req.file) {
            colaboradorData.foto = req.file.path;
        }

        const colaborador = colaboradorData;
        let newColaborador = null;

        const existentColaborador = await Colaborador.findOne({
            $or: [
                { email: colaborador.email },
                { telefone: colaborador.telefone },
            ],
        });

        if (!existentColaborador) {
            newColaborador = await new Colaborador({
                ...colaborador,
                criadoEm: new Date(),
            }).save({ session });
        }

        const colaboradorId = existentColaborador
            ? existentColaborador._id
            : newColaborador._id;

        const existentRelationship = await StatusColaborador.findOne({
            salaoId,
            colaboradorId,
        });

        if (!existentRelationship) {
            await new StatusColaborador({
                salaoId,
                colaboradorId,
                status: colaborador.vinculo || 'Disponivel',
                dataCadastro: new Date(),
            }).save({ session });
        } else if (existentRelationship.status === 'Indisponivel') {
            await StatusColaborador.findOneAndUpdate(
                { salaoId, colaboradorId },
                { status: 'Disponivel' },
                { session }
            );
        }

        const especialidadesArray = Array.isArray(colaborador.especialidades)
            ? colaborador.especialidades
            : typeof colaborador.especialidades === 'string' && colaborador.especialidades.trim()
                ? [colaborador.especialidades.trim()]
                : [];

        if (especialidadesArray.length > 0) {
            await Especialidade.insertMany(
                especialidadesArray.map((servicoId) => ({
                    servicoId,
                    colaboradorId,
                    status: 'Disponivel',
                })),
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        if (existentRelationship && existentColaborador) {
            res.json({ error: true, message: 'Colaborador já cadastrado!' });
        } else {
            res.json({ error: false });
        }
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.json({ error: true, message: err.message });
    }
});

router.post('/filter', async (req, res) => {
    try {
        const colaboradores = await Colaborador.find(req.body.filters);
        res.json({ error: false, colaboradores });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.get('/salao/:salaoId', async (req, res) => {
    try {
        const { salaoId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(salaoId)) {
            return res.status(400).json({ error: true, message: 'salaoId inválido' });
        }

        let listaColaboradores = [];

        const colaboradores = await StatusColaborador.find({
            salaoId,
            status: { $ne: 'Excluido' },
        })
            .populate('colaboradorId')
            .select('colaboradorId dataCadastro status');

        const colaboradoresValidos = colaboradores.filter(c => c.colaboradorId);

        if (colaboradoresValidos.length === 0) {
            return res.json({ error: false, colaboradores: [] });
        }

        const colaboradorIds = colaboradoresValidos.map(c => c.colaboradorId._id);
        const todasEspecialidades = await Especialidade.find({
            colaboradorId: { $in: colaboradorIds }
        }).populate('servicoId');

        const servicoIds = [...new Set(
            todasEspecialidades
                .map(e => e.servicoId?._id?.toString() || e.servicoId?.toString())
                .filter(Boolean)
        )];

        const servicosMap = {};
        if (servicoIds.length > 0) {
            const servicos = await Servico.find({ _id: { $in: servicoIds } });
            servicos.forEach(s => {
                servicosMap[s._id.toString()] = s.nomeServico;
            });
        }

        const especialidadesPorColaborador = {};
        todasEspecialidades.forEach(e => {
            const id = e.colaboradorId.toString();
            if (!especialidadesPorColaborador[id]) {
                especialidadesPorColaborador[id] = [];
            }
            const servicoId = e.servicoId?._id?.toString() || e.servicoId?.toString();
            if (servicoId && servicosMap[servicoId]) {
                especialidadesPorColaborador[id].push({
                    _id: servicoId,
                    nomeServico: servicosMap[servicoId]
                });
            }
        });

        for (let colaborador of colaboradoresValidos) {
            const colaboradorIdStr = colaborador.colaboradorId._id.toString();
            const especialidades = especialidadesPorColaborador[colaboradorIdStr] || [];

            listaColaboradores.push({
                ...colaborador._doc,
                especialidades,
            });
        }

        res.json({
            error: false,
            colaboradores: listaColaboradores.map((c) => ({
                ...c.colaboradorId._doc,
                vinculoId: c._id,
                vinculo: c.status,
                especialidades: c.especialidades.map(esp => esp.nomeServico || esp),
                especialidadesIds: c.especialidades.map(esp => esp._id || esp),
                dataCadastro: c.dataCadastro
                    ? format(new Date(c.dataCadastro), 'dd/MM/yyyy', { locale: ptBR })
                    : '',
            })),
        });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.put('/:colaboradorId', upload.single('foto'), async (req, res) => {
    try {
        const { colaboradorId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(colaboradorId)) {
            return res.status(400).json({ error: true, message: 'colaboradorId inválido!' });
        }

        let jsonColaborador;
        if (req.body.colaborador) {
            jsonColaborador = typeof req.body.colaborador === 'string'
                ? JSON.parse(req.body.colaborador)
                : req.body.colaborador;
        } else {
            jsonColaborador = req.body;
        }

        const { vinculo, vinculoId, especialidades } = jsonColaborador;

        if (req.file) {
            jsonColaborador.foto = req.file.path;
        }

        delete jsonColaborador.vinculo;
        delete jsonColaborador.vinculoId;
        delete jsonColaborador.especialidades;
        delete jsonColaborador.especialidadesIds;
        delete jsonColaborador.dataCadastro;

        const colaborador = await Colaborador.findByIdAndUpdate(
            colaboradorId,
            jsonColaborador,
            { new: true }
        );

        if (!colaborador) {
            return res.status(404).json({ error: true, message: 'Colaborador não encontrado!' });
        }

        if (vinculo && vinculoId) {
            await StatusColaborador.findByIdAndUpdate(vinculoId, { status: vinculo });
        }

        if (especialidades && Array.isArray(especialidades)) {
            await Especialidade.deleteMany({ colaboradorId });

            if (especialidades.length > 0) {
                await Especialidade.insertMany(
                    especialidades.map((servicoId) => ({
                        servicoId,
                        colaboradorId,
                        status: 'Disponivel',
                    }))
                );
            }
        }

        return res.json({ error: false, colaborador });
    } catch (err) {
        console.error('Erro ao atualizar colaborador:', err);
        return res.status(500).json({ error: true, message: err.message });
    }
});

router.delete('/vinculo/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: true, message: 'ID inválido' });
        }

        const vinculo = await StatusColaborador.findByIdAndUpdate(
            id,
            { status: 'Excluido' },
            { new: true }
        );

        if (!vinculo) {
            return res.status(404).json({ error: true, message: 'Relação não encontrada!' });
        }

        res.json({ error: false, message: 'Colaborador desrrelacionado com sucesso!' });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

module.exports = router;
