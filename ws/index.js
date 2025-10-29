const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');

// DATABASE
require('./database');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Necessário pro Multer / uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.set('port', 8000);

/* ROTAS */
app.use('/salao', require('./src/routes/salao.routes'));
app.use('/servico', require('./src/routes/servico.routes'));
app.use('/cliente', require('./src/routes/cliente.routes'));


app.listen(app.get('port'), () => {
    console.log(`Servidor na porta ${app.get('port')}`);
});

