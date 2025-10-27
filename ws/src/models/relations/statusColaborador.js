const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statusColaborador = new Schema({
  salaoId: {
    type: mongoose.Types.ObjectId,
    ref: 'Salao',
    required: true,
  },
  colaboradorId: {
    type: mongoose.Types.ObjectId,
    ref: 'Colaborador',
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Disponivel', 'Indisponivel', 'Excluido'],
    default: 'Disponivel'
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StatusColaborador', statusColaborador);