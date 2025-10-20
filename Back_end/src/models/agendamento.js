const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const agendamento = new Schema({
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
  servicoId : {
        type: mongoose.Types.ObjectId,
        ref: 'Servico',
        required: true,
      },
  colaboradorId : {
        type: mongoose.Types.ObjectId,
        ref: 'Colaborador',
        required: true,
      },
  data : {
    type : Date,
    required : true
  },
  preco : {
    type : Number,
    required : true
  },
  dataCadastro : {
       type: Date,
       default: Date.now,
  },
});

module.exports = mongoose.model('Agendamento', agendamento);