const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { format } = require('date-fns');
const { ptBR } = require('date-fns/locale');

const router = express.Router();

const Colaborador = require('../models/colaborador');
const StatusColaborador = require('../models/relations/statusColaborador');
const Especialidade = require('../models/relations/especialidade');
const Servico = require('../models/servico');

//Foto colaborador
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', '..', 'uploads', 'colaboradores');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
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
            cb(new Error('Apenas imagens são permitidas.'));
        }
    },
});

// ===================================================
// CRIAR COLABORADOR (SEM PAGAMENTO)
// ===================================================
router.post('/', upload.single('foto'), async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //Json para string
        let colaboradorData;
        if (req.body.colaborador) {
            try {
                colaboradorData = typeof req.body.colaborador === 'string' 
                    ? JSON.parse(req.body.colaborador) 
                    : req.body.colaborador;
            } catch (e) {
                colaboradorData = req.body.colaborador;
            }
        } else {
            colaboradorData = req.body;
        }
        
        const salaoId = req.body.salaoId || colaboradorData.salaoId;
        
        //Adicionar foto se foi enviada
        if (req.file) {
            colaboradorData.foto = `/uploads/colaboradores/${req.file.filename}`;
        }
        
        const colaborador = colaboradorData;
        let newColaborador = null;

        // Verificar se já existe colaborador
        const existentColaborador = await Colaborador.findOne({
            $or: [
                { email: colaborador.email },
                { telefone: colaborador.telefone },
                // { cpf: colaborador.cpf },
            ],
        });

        // Criar novo colaborador se não existir
        if (!existentColaborador) {
            newColaborador = await new Colaborador({
                ...colaborador,
                criadoEm: new Date(),
            }).save({ session });
        }

        const colaboradorId = existentColaborador
            ? existentColaborador._id
            : newColaborador._id;

        // Criar ou atualizar vínculo (StatusColaborador)
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

        // Cadastrar especialidades (serviços)
        if (colaborador.especialidades?.length > 0) {
            await Especialidade.insertMany(
                colaborador.especialidades.map((servicoId) => ({
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

// ===================================================
// FILTRAR COLABORADORES
// ===================================================
router.post('/filter', async (req, res) => {
    try {
        const colaboradores = await Colaborador.find(req.body.filters);
        res.json({ error: false, colaboradores });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

// ===================================================
// LISTAR COLABORADORES DE UM SALÃO
// ===================================================
router.get('/salao/:salaoId', async (req, res) => {
    try {
        const { salaoId } = req.params;

        //Validando
        if (!mongoose.Types.ObjectId.isValid(salaoId)) {
            return res.status(400).json({ error: true, message: 'salaoId inválido' });
        }

        let listaColaboradores = [];

        // Buscar relacionamentos (StatusColaborador)
        const colaboradores = await StatusColaborador.find({
            salaoId,
            status: { $ne: 'Excluido' },
        })
            .populate('colaboradorId')
            .select('colaboradorId dataCadastro status');

            // Montar lista com especialidades

            //Problema de caso (N+1), uma querry para cada 
        const colaboradorIds = colaboradores.map(c => c.colaboradorId._id);
        const todasEspecialidades = await Especialidade.find({
            colaboradorId: { $in: colaboradorIds }
        }).populate('servicoId');

        //Buscar serviço
        const servicoIds = [...new Set(todasEspecialidades.map(e => {
            if (e.servicoId?._id) return e.servicoId._id.toString();
            if (e.servicoId) return e.servicoId.toString();
            return null;
        }).filter(Boolean))];
        
        const servicosMap = {};
        if (servicoIds.length > 0) {
            const servicos = await Servico.find({ _id: { $in: servicoIds } });
            servicos.forEach(s => {
                servicosMap[s._id.toString()] = s.nomeServico;
            });
        }
        //Mapear especialidade
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

        //Lista consultando mapa
        for (let colaborador of colaboradores) {
            const colaboradorIdStr = colaborador.colaboradorId._id.toString();
            const especialidades = especialidadesPorColaborador[colaboradorIdStr] || [];

            listaColaboradores.push({
                ...colaborador._doc,
                especialidades: especialidades,
            });
        }

        // Montar resposta final
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

// ===================================================
// ATUALIZAR COLABORADOR
// ===================================================
router.put('/:colaboradorId', upload.single('foto'), async (req, res) => {
    try {
        //Json para string
        let bodyData;
        if (req.body.colaborador) {
            try {
                bodyData = typeof req.body.colaborador === 'string' 
                    ? JSON.parse(req.body.colaborador) 
                    : req.body.colaborador;
            } catch (e) {
                bodyData = req.body.colaborador;
            }
        } else {
            bodyData = req.body;
        }
        
        const { vinculo, vinculoId, especialidades } = bodyData;
        const { colaboradorId } = req.params;

        //Validando
        if (!mongoose.Types.ObjectId.isValid(colaboradorId)) {
            return res.status(400).json({ error: true, message: 'colaboradorId inválido!' });
        }

        // Atualizar foto se foi enviada
        if (req.file) {
            bodyData.foto = `/uploads/colaboradores/${req.file.filename}`;
        }

        // Remover campos que não devem ser atualizados diretamente no colaborador
        const { vinculo: _, vinculoId: __, especialidades: ___, ...colaboradorData } = bodyData;

        // Atualizar dados principais
        const colaborador = await Colaborador.findByIdAndUpdate(colaboradorId, colaboradorData, { new: true });

        if (!colaborador) {
            return res.status(404).json({ error: true, message: 'Colaborador não encontrado!' });
        }

        // Atualizar vínculo (StatusColaborador)
        if (vinculo) {
            await StatusColaborador.findByIdAndUpdate(vinculoId, { status: vinculo });
        }

        // Atualizar especialidades (serviços)
        if (especialidades) {
            await Especialidade.deleteMany({ colaboradorId });

            await Especialidade.insertMany(
                especialidades.map((servicoId) => ({
                    servicoId,
                    colaboradorId,
                    status: 'Disponivel',
                }))
            );
        }

        res.json({ error: false });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

// ===================================================
// EXCLUIR (DESVINCULAR) COLABORADOR DO SALÃO
// ===================================================
router.delete('/vinculo/:id', async (req, res) => {
    try {
        const { id } = req.params;
        //Validando
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
