const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const salao = new Schema({
  nome : {
    type : String,
    required : [true, 'Nome do seu salão é obrigatório!!'],
  },
  email : {
    type : String,
    required : [true, 'Email para o seu salão é obrigatório!!'],
  },
  senha : {
    type : String,
    default : null,
  },
  telefone : String,
  endereco : {
    cidade : String,
    cep : String,
    numero : String,
  },
  dataCadastro : {
    type : Date,
    default : Date.now,
  },
});

module.exports = mongoose.model('Salao', salao);