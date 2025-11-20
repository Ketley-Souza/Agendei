const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Cliente = require('../models/cliente');
const StatusCliente = require('../models/relations/statusCliente');

router.post('/', async (req, res) => {
    const db = mongoose.connection;
    const session = await db.startSession();
    session.startTransaction();

    try {
        let cliente;
        let salaoId;
        
        if (req.body.cliente) {
            cliente = typeof req.body.cliente === 'string' 
                ? JSON.parse(req.body.cliente) 
                : req.body.cliente;
            salaoId = req.body.salaoId;
        } else {
            const { salaoId: id, ...clienteData } = req.body;
            cliente = clienteData;
            salaoId = id;
        }
        
        let newClient = null;

        const existentClient = await Cliente.findOne({
            $or: [
                { email: cliente.email },
                { telefone: cliente.telefone },
            ],
        });

        if (!existentClient) {
            newClient = await new Cliente(cliente).save({ session });
        }

        const clienteId = existentClient ? existentClient._id : newClient._id;

        const existentRelationship = await StatusCliente.findOne({
            salaoId,
            clienteId,
        });

        if (!existentRelationship) {
            await new StatusCliente({
                salaoId,
                clienteId,
                status: 'Disponivel',
            }).save({ session });
        }

        if (existentRelationship && existentRelationship.status === 'Indisponivel') {
            await StatusCliente.findOneAndUpdate(
                { salaoId, clienteId },
                { status: 'Disponivel' },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

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

router.post('/filter', async (req, res) => {
    try {
        const clientes = await Cliente.find(req.body.filters);
        res.json({ error: false, clientes });
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

        const clientes = await StatusCliente.find({
            salaoId,
            status: 'Disponivel',
        })
            .populate('clienteId')
            .select('clienteId dataCadastro');

        res.json({
            error: false,
            clientes: clientes.map((c) => ({
                ...c.clienteId._doc,
                vinculoId: c._id,
                dataCadastro: new Date(c.dataCadastro).toLocaleDateString('pt-BR'),
            })),
        });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.delete('/vinculo/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: true, message: 'ID inválido' });
        }

        const vinculo = await StatusCliente.findByIdAndUpdate(id, { status: 'Indisponivel' }, { new: true });

        if (!vinculo) {
            return res.status(404).json({ error: true, message: 'Vínculo não encontrado' });
        }

        res.json({ error: false, message: 'Cliente desvinculado com sucesso!' });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

module.exports = router;
