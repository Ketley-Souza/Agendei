const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');

// DATABASE
require('./database');

app.use(morgan('dev'));
app.use(express.json());

//Necessário pro Multer / uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));

app.set('port', 8000);

/* ROTAS */
app.use('/salao', require('./src/routes/salao.routes'));
app.use('/servico', require('./src/routes/servico.routes'));

app.listen(app.get('port'), () => {
    console.log(`Servidor na porta ${app.get('port')}`);
});

