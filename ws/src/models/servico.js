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
    type: String,
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

//Indices
servico.index({ salaoId: 1, status: 1 }); //Busca serviço no salão status

module.exports = mongoose.model('Servico', servico);