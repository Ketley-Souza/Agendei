const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cliente = new Schema({
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
   sexo: {
      type: String,
      enum: ['Masculino', 'Feminino'],
      required: true
   },
   dataNascimento: {
      type: String,
      required: true
   },
   foto: {
      type: String,
      default: ''
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
cliente.index({ email: 1 }); //Busca email
cliente.index({ telefone: 1 }); //Busca telefone

module.exports = mongoose.model('Cliente', cliente);