const express = require('express');
const mongoose = require('mongoose');
const { format } = require('date-fns');
const { ptBR } = require('date-fns/locale');

const router = express.Router();

const Colaborador = require('../models/colaborador');
const StatusColaborador = require('../models/relations/statusColaborador');
const Especialidade = require('../models/relations/especialidade');

// ===================================================
// CRIAR COLABORADOR (SEM PAGAMENTO)
// ===================================================
router.post('/', async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { colaborador, salaoId } = req.body;
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
                }))
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
        let listaColaboradores = [];

        // Buscar relacionamentos (StatusColaborador)
        const colaboradores = await StatusColaborador.find({
            salaoId,
            status: { $ne: 'Excluido' },
        })
            .populate('colaboradorId')
            .select('colaboradorId dataCadastro status');

        // Montar lista com especialidades
        for (let colaborador of colaboradores) {
            const especialidades = await Especialidade.find({
                colaboradorId: colaborador.colaboradorId._id,
            });

            listaColaboradores.push({
                ...colaborador._doc,
                especialidades: especialidades.map((e) => e.servicoId),
            });
        }

        // Montar resposta final
        res.json({
            error: false,
            colaboradores: listaColaboradores.map((c) => ({
                ...c.colaboradorId._doc,
                vinculoId: c._id,
                vinculo: c.status,
                especialidades: c.especialidades,
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
router.put('/:colaboradorId', async (req, res) => {
    try {
        const { vinculo, vinculoId, especialidades } = req.body;
        const { colaboradorId } = req.params;

        // Atualizar dados principais
        await Colaborador.findByIdAndUpdate(colaboradorId, req.body);

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
        await StatusColaborador.findByIdAndUpdate(req.params.id, {
            status: 'Excluido',
        });
        res.json({ error: false });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

module.exports = router;
