const mongoose = require('mongoose');
require('dotenv').config(); // carrega as variáveis do .env

const URI = process.env.MONGODB_URI;

mongoose.connect(URI)
    .then(() => console.log('Banco de dados conectado!'))
    .catch((err) => console.error('Erro ao conectar ao banco:', err));

module.exports = mongoose;
