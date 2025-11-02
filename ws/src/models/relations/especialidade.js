const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const especialidade = new Schema({
  colaboradorId: {
    type: mongoose.Types.ObjectId,
    ref: 'Colaborador',
    required: true,
  },
  servicoId: {
    type: mongoose.Types.ObjectId,
    ref: 'Servico',
    required: true,
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
especialidade.index({ colaboradorId: 1, status: 1 }); //Busca especialidades por colaborador
especialidade.index({ servicoId: 1, status: 1 }); //Busca colaborador por serviço
especialidade.index({ servicoId: 1, colaboradorId: 1 }); //Busca combinada

module.exports = mongoose.model('Especialidade', especialidade);