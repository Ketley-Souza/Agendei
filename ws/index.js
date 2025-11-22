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

// Rotas com prefixo /api
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/agendamento', require('./src/routes/agendamento.routes'));
app.use('/api/cliente', require('./src/routes/cliente.routes'));
app.use('/api/colaborador', require('./src/routes/colaborador.routes'));
app.use('/api/horario', require('./src/routes/horario.routes'));
app.use('/api/servico', require('./src/routes/servico.routes'));
app.use('/api/salao', require('./src/routes/salao.routes'));

// Rota de health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API rodando' });
});

// Exporta para Vercel
module.exports = app;

// Servidor local
if (require.main === module) {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Servidor na porta ${PORT}`);
    });
}

