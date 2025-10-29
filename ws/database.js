const mongoose = require('mongoose');

const URI = 'mongodb+srv://ketley_db:ZCsHSrkZNZtNM3hJ@agendei-db.rha1m75.mongodb.net/nosso_espaco?appName=Agendei-db';


mongoose.connect(URI)
    .then(() => console.log('Banco de dados conectado!'))
    .catch((err) => console.error('Erro ao conectar ao banco:', err));

module.exports = mongoose;