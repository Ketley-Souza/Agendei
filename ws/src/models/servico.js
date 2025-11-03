const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const servico = new Schema({
  salaoId: {
    type: mongoose.Types.ObjectId,
    ref: 'Salao',
    required: true,
  },
  nomeServico: {
    type: String,
    required: true,
  },
  preco: {
    type: Number,
    required: true,
  },
  duracao: {
    type: Number,
    required: true,
  },
  descricao: {
    type: String,
    required: true,
  },
  imagem: {
    type: String,
    default: null,
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

// Virtual para formatar duração para exibição
servico.virtual('duracaoFormatada').get(function() {
  const horas = Math.floor(this.duracao / 60);
  const minutos = this.duracao % 60;
  
  if (horas > 0 && minutos > 0) {
    return `${horas}h${minutos.toString().padStart(2, '0')}min`;
  } else if (horas > 0) {
    return `${horas}h00min`;
  } else {
    return `${minutos}min`;
  }
});
servico.set('toJSON', { virtuals: true });
servico.set('toObject', { virtuals: true });

//Indices
servico.index({ salaoId: 1, status: 1 }); //Busca serviço no salão status

module.exports = mongoose.model('Servico', servico);