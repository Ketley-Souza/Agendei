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
  servicosAdicionais: [{
    type: mongoose.Types.ObjectId,
    ref: 'Servico',
  }],
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

//Para calcular duração total
agendamento.virtual('duracaoTotal').get(function() {
  let total = 0;
  if (this.servicoId && this.servicoId.duracao) {
    total += this.servicoId.duracao;
  }
  if (this.servicosAdicionais && Array.isArray(this.servicosAdicionais)) {
    this.servicosAdicionais.forEach(servico => {
      if (servico.duracao) {
        total += servico.duracao;
      }
    });
  }
  return total;
});
agendamento.set('toJSON', { virtuals: true });
agendamento.set('toObject', { virtuals: true });

//Indices
agendamento.index({ salaoId: 1, data: 1, status: 1 }); //Filtro salão, data e status
agendamento.index({ colaboradorId: 1, data: 1 }); //Busca agendamentos por colaborador e data
agendamento.index({ status: 1 }); //Filtro por status
agendamento.index({ clienteId: 1 }); //Busca agendamento cliente

module.exports = mongoose.model('Agendamento', agendamento);