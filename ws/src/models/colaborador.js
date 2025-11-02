const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const colaborador = new Schema({
   nome: {
      type: String,
      required: true
   },
   email: {
      type: String,
      required: true
   },
   senha: {
      type: String,
      required: true
   },
   telefone: {
      type: String,
      required: true
   },
   foto: {
      type: String,
      default: null,
   },
   sexo: {
      type: String,
      enum: ['Masculino', 'Feminino'],
      required: true
   },
   dataNascimento: {
      type: Date,
      required: true
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
colaborador.index({ email: 1 });
colaborador.index({ telefone: 1 });

module.exports = mongoose.model('Colaborador', colaborador);