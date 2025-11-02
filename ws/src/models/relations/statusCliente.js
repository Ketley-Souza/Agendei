const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statusCliente = new Schema({
  salaoId: {
    type: mongoose.Types.ObjectId,
    ref: 'Salao',
    required: true,
  },
  clienteId: {
    type: mongoose.Types.ObjectId,
    ref: 'Cliente',
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Disponivel', 'Indisponivel'],
    default: 'Disponivel'
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

//Indices
statusCliente.index({ salaoId: 1, status: 1 }); //Busca cliente no salão status
statusCliente.index({ clienteId: 1 }); //Busca cliente

module.exports = mongoose.model('StatusCliente', statusCliente);