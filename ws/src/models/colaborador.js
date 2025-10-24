const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const colaborador = new Schema({
    nome : {
       type: String,
       required: true 
      },
    email : {
       type: String,
       required: true 
      },
   senha : {
       type: String,
       required: true 
      },
    telefone : {
       type: String,
       required: true 
      },
    sexo : {
       type: String,
       enum: ['Masculino', 'Feminino'],
       required: true 
      },
    dataNascimento : {
        type: String,
        required: true
    },
    status : {
       type: String,
       required: true,
       enum: ['Disponível', 'Indisponível'],
       default: 'Disponível'
      },
    dataCadastro : {
       type: Date,
       default: Date.now,
      },
});

module.exports = mongoose.model('Colaborador', colaborador);