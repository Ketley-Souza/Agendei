const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const servico = new Schema({
  salaoId : {
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
  status : {
       type: String,
       required: true,
       enum: ['Disponível', 'Indisponível', 'Excluído'],
       default: 'Disponível'
  },
  dataCadastro : {
       type: Date,
       default: Date.now,
  },
  
});

module.exports = mongoose.model('Servico', servico);