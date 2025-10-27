const mongoose = require('mongoose');

const URI = 'mongodb+srv://ketley_db:btLyk0sdjmjSjpwy@agendei-db.rha1m75.mongodb.net/nosso_espaco?appName=Agendei-db';


mongoose.connect(URI)
    .then(() => console.log('Banco de dados conectado!'))
    .catch((err) => console.error('Erro ao conectar ao banco:', err));

module.exports = mongoose;