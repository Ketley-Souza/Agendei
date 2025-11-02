const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agendamento = new Schema({
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
  servicoId: {
    type: mongoose.Types.ObjectId,
    ref: 'Servico',
    required: true,
  },
  colaboradorId: {
    type: mongoose.Types.ObjectId,
    ref: 'Colaborador',
    required: true,
  },
  data: {
    type: Date,
    required: true
  },
  preco: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['A', 'I'],
    required: true,
    default: 'A',
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

//Indices
agendamento.index({ salaoId: 1, data: 1, status: 1 }); //Filtro salão, data e status
agendamento.index({ colaboradorId: 1, data: 1 }); //Busca agendamentos por colaborador e data
agendamento.index({ status: 1 }); //Filtro por status
agendamento.index({ clienteId: 1 }); //Busca agendamento cliente

module.exports = mongoose.model('Agendamento', agendamento);