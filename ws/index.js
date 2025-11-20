require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

// DATABASE
require('./database');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('port', 8000);


app.use('/auth', require('./src/routes/auth.routes'));
app.use('/agendamento', require('./src/routes/agendamento.routes'));
app.use('/cliente', require('./src/routes/cliente.routes'));
app.use('/colaborador', require('./src/routes/colaborador.routes'));
app.use('/horario', require('./src/routes/horario.routes'));
app.use('/servico', require('./src/routes/servico.routes'));
app.use('/salao', require('./src/routes/salao.routes'));


app.listen(app.get('port'), () => {
    console.log(`Servidor na porta ${app.get('port')}`);
});

