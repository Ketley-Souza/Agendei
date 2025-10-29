const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Cliente = require('../models/cliente');
const StatusCliente = require('../models/relations/statusCliente');

// Criar cliente e vincular ao salão
router.post('/', async (req, res) => {
    const db = mongoose.connection;
    const session = await db.startSession();
    session.startTransaction();

    try {
        const { cliente, salaoId } = req.body;
        let newClient = null;

        // Verifica se o cliente já existe pelo email ou telefone
        const existentClient = await Cliente.findOne({
            $or: [
                { email: cliente.email },
                { telefone: cliente.telefone },
            ],
        });

        // Se não existir, cria novo cliente
        if (!existentClient) {
            newClient = await new Cliente(cliente).save({ session });
        }

        const clienteId = existentClient ? existentClient._id : newClient._id;

        // Verifica se já existe vínculo entre salão e cliente
        const existentRelationship = await StatusCliente.findOne({
            salaoId,
            clienteId,
        });

        // Se não existir, cria novo vínculo
        if (!existentRelationship) {
            await new StatusCliente({
                salaoId,
                clienteId,
                status: 'Disponivel',
            }).save({ session });
        }

        // Se já existe e está "Indisponivel", reativa para "Disponivel"
        if (existentRelationship && existentRelationship.status === 'Indisponivel') {
            await StatusCliente.findOneAndUpdate(
                { salaoId, clienteId },
                { status: 'Disponivel' },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        // Retorna mensagens adequadas
        if (
            existentRelationship &&
            existentRelationship.status === 'Disponivel' &&
            existentClient
        ) {
            res.json({ error: true, message: 'Cliente já cadastrado neste salão!' });
        } else {
            res.json({ error: false, message: 'Cliente cadastrado com sucesso!' });
        }
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.json({ error: true, message: err.message });
    }
});

// Filtrar clientes
router.post('/filter', async (req, res) => {
    try {
        const clientes = await Cliente.find(req.body.filters);
        res.json({ error: false, clientes });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

// Listar clientes de um salão
router.get('/salao/:salaoId', async (req, res) => {
    try {
        const clientes = await StatusCliente.find({
            salaoId: req.params.salaoId,
            status: 'Disponivel',
        })
            .populate('clienteId')
            .select('clienteId dataCadastro');

        res.json({
            error: false,
            clientes: clientes.map((c) => ({
                ...c.clienteId._doc,
                vinculoId: c._id,
                // Formatando a data nativamente (sem moment)
                dataCadastro: new Date(c.dataCadastro).toLocaleDateString('pt-BR'),
            })),
        });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

// Desvincular cliente (tornar Indisponivel)
router.delete('/vinculo/:id', async (req, res) => {
    try {
        await StatusCliente.findByIdAndUpdate(req.params.id, { status: 'Indisponivel' });
        res.json({ error: false, message: 'Cliente desvinculado com sucesso!' });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

module.exports = router;
