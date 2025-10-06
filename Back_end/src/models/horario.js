const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const horario = new Schema({
  salaoId : {
        type: mongoose.Types.ObjectId,
        ref: 'Salao',
        required: true,
      },
  especialidades : [{
      type: mongoose.Types.ObjectId,
      ref: 'Servico',
      required: true,
    }],
  colaboradores : [{
      type: mongoose.Types.ObjectId,
      ref: 'Colaborador',
      required: true,
    }],
  diasSemana : {
    type : [Number],
    required : true,
  },
  inicio : {
    type: Date,
    required: true,
  },
  término : {
    type: Date,
    required: true,
  },
  dataCadastro : {
       type: Date,
       default: Date.now,
  },
});

module.exports = mongoose.model('Horario', horario);