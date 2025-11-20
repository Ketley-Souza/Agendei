const mongoose = require('mongoose');

const URI = process.env.MONGODB_URI;

mongoose.connect(URI)
    .then(() => {})
    .catch((err) => console.error('Erro ao conectar ao banco:', err));

module.exports = mongoose;
