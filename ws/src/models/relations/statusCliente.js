const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statusCliente = new Schema({
  salaoId : {
        type: mongoose.Types.ObjectId,
        ref: 'Salao',
        required: true,
      },
  clienteId : {
        type: mongoose.Types.ObjectId,
        ref: 'Cliente',
        required: true,
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

module.exports = mongoose.model('StatusCliente', statusCliente);