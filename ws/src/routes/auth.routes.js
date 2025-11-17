const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Cliente = require('../models/cliente');
const Colaborador = require('../models/colaborador');
const Salao = require('../models/salao');
const StatusCliente = require('../models/relations/statusCliente');
const StatusColaborador = require('../models/relations/statusColaborador');
const Especialidade = require('../models/relations/especialidade');

/*=====
Cadastro cliente
=====*/
router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha, telefone, dataNascimento, sexo, salaoId, endereco } = req.body;
    //validando
    if (!nome || !email || !senha || !telefone) {
      return res.status(400).json({
        error: true,
        message: 'Nome, email, senha e telefone são obrigatórios!',
      });
    }
    //Vendo se o email existe no bd
    const clienteExistente = await Cliente.findOne({ email });
    if (clienteExistente) {
      return res.status(400).json({
        error: true,
        message: 'Email já cadastrado!',
      });
    }
    //Cria cliente
    const novoCliente = await new Cliente({
      nome,
      email,
      senha, //senha hardcoded temporaria
      telefone,
      dataNascimento: dataNascimento || new Date(),
      sexo: sexo || 'Masculino',
      status: 'Disponivel',
      endereco: endereco || {},
    }).save();

    if (salaoId) {
      await new StatusCliente({
        salaoId,
        clienteId: novoCliente._id,
        status: 'Disponivel',
      }).save();
    }

    res.status(201).json({
      error: false,
      message: 'Cliente cadastrado com sucesso!',
      usuario: {
        id: novoCliente._id,
        nome: novoCliente.nome,
        email: novoCliente.email,
        telefone: novoCliente.telefone,
        tipo: 'cliente',
      },
    });
  } catch (err) {
    console.error('Erro ao cadastrar cliente:', err);
    res.status(500).json({
      error: true,
      message: err.message || 'Erro ao cadastrar cliente!',
    });
  }
});

/*=====
Login geral
=====*/
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: true,
        message: 'Email e senha devem estar preenchidos!',
      });
    }

    //Ver se tem um cliente primeiro
    let usuario = await Cliente.findOne({ email });
    let tipo = 'cliente';

    //Se não for cliente olha emm colaborador
    if (!usuario) {
      usuario = await Colaborador.findOne({ email });
      tipo = 'colaborador';
    }

    // Se ainda não encontrou, busca em Salão
    if (!usuario) {
      usuario = await Salao.findOne({ email });
      tipo = 'salao';
    }

    //Vê se achou algum usuário
    if (!usuario) {
      return res.status(401).json({
        error: true,
        message: 'Email ou senha incorretos.',
      });
    }

    //Valida senha
    if (usuario.senha !== senha) {
      return res.status(401).json({
        error: true,
        message: 'Email ou senha incorretos.',
      });
    }

    //Verificar status (se é cliente ou colaborador)
    if ((tipo === 'cliente' || tipo === 'colaborador') && usuario.status === 'Indisponivel') {
      return res.status(403).json({
        error: true,
        message: `${tipo === 'cliente' ? 'Cliente' : 'Colaborador'} inativo. Entre em contato com o salão!`,
      });
    }
    //Esquema de resposta
    const respostaUsuario = {
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone || '',
      tipo,
    };

    //Caso for colaborador:
    if (tipo === 'colaborador') {
      respostaUsuario.foto = usuario.foto || null;
    }
    if (tipo === 'salao' && usuario.endereco) {
      respostaUsuario.endereco = usuario.endereco;
    }

    res.json({
      error: false,
      message: 'Login realizado com sucesso!',
      usuario: respostaUsuario,
    });
  } catch (err) {
    console.error('Erro ao fazer login:', err);
    res.status(500).json({
      error: true,
      message: 'Erro ao fazer login.',
    });
  }
});

/*=====
Listar todos clientes teste
 =====*/
router.get('/listar/clientes', async (req, res) => {
  try {
    const clientes = await Cliente.find().select('-senha').sort({ dataCadastro: -1 });
    res.json({
      error: false,
      total: clientes.length,
      clientes,
    });
  } catch (err) {
    console.error('Erro ao listar clientes:', err);
    res.status(500).json({
      error: true,
      message: 'Erro ao listar clientes!',
    });
  }
});

/*=====
Listar todos colaboradores teste
 =====*/
router.get('/listar/colaboradores', async (req, res) => {
  try {
    const colaboradores = await Colaborador.find().select('-senha').sort({ dataCadastro: -1 });
    res.json({
      error: false,
      total: colaboradores.length,
      colaboradores,
    });
  } catch (err) {
    console.error('Erro ao listar colaboradores:', err);
    res.status(500).json({
      error: true,
      message: 'Erro ao listar colaboradores!',
    });
  }
});
/*=====
salão listar teste 
 =====*/
router.get('/listar/saloes', async (req, res) => {
  try {
    const saloes = await Salao.find().select('-senha').sort({ dataCadastro: -1 });
    res.json({
      error: false,
      total: saloes.length,
      saloes,
    });
  } catch (err) {
    console.error('Erro ao listar salões:', err);
    res.status(500).json({
      error: true,
      message: 'Erro ao listar salões!',
    });
  }
});
/*=====
Busca de dados usuario
 =====*/
router.post('/verificar', async (req, res) => {
  try {
    const { id, tipo } = req.body;
    if (!id || !tipo) {
      return res.status(400).json({
        error: true,
        message: 'ID e tipo são obrigatórios!',
      });
    }
    let usuario = null;
    //Busca de dados usuario
    switch (tipo) {
      case 'cliente':
        usuario = await Cliente.findById(id).select('-senha');
        break;
      case 'colaborador':
        usuario = await Colaborador.findById(id).select('-senha');
        break;
      case 'salao':
        usuario = await Salao.findById(id).select('-senha');
        break;
      default:
        return res.status(400).json({
          error: true,
          message: 'Tipo inválido. Use: cliente, colaborador ou salao!',
        });
    }
    //Vendo se o usuario existe
    if (!usuario) {
      return res.status(404).json({
        error: true,
        message: 'Usuário não encontrado!',
      });
    }
    //Retorna dados do usuario menos senha
    res.json({
      error: false,
      usuario: {
        ...usuario._doc,
        tipo,
      },
    });
  } catch (err) {
    console.error('Erro ao verificar usuário:', err);
    res.status(500).json({
      error: true,
      message: 'Erro ao verificar usuário.',
    });
  }
});
module.exports = router;

