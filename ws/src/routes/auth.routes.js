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
router.post('/cadastro/cliente', async (req, res) => {
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
Cadastro colaborador
 =====*/
router.post('/cadastro/colaborador', async (req, res) => {
  try {
    const { nome, email, senha, telefone, dataNascimento, sexo, salaoId, especialidades } = req.body;
    //Validando
    if (!nome || !email || !senha || !telefone || !salaoId) {
      return res.status(400).json({
        error: true,
        message: 'Nome, email, senha, telefone e salaoId são obrigatórios!',
      });
    }
    //Vendo se o email existe no bd
    const colaboradorExistente = await Colaborador.findOne({ email });
    if (colaboradorExistente) {
      return res.status(400).json({
        error: true,
        message: 'Email já cadastrado.',
      });
    }
    //Cria colaborador
    const novoColaborador = await new Colaborador({
      nome,
      email,
      senha, //senha hardcoded temporaria
      telefone,
      dataNascimento: dataNascimento || new Date(),
      sexo: sexo || 'Masculino',
      status: 'Disponivel',
    }).save();

    //Para testar vinculo com salão
    await new StatusColaborador({
      salaoId,
      colaboradorId: novoColaborador._id,
      status: 'Disponivel',
    }).save();
    //Escolher especialidades
    if (especialidades && Array.isArray(especialidades) && especialidades.length > 0) {
      await Especialidade.insertMany(
        especialidades.map((servicoId) => ({
          servicoId,
          colaboradorId: novoColaborador._id,
          status: 'Disponivel',
        }))
      );
    }
    res.status(201).json({
      error: false,
      message: 'Colaborador cadastrado com sucesso!',
      usuario: {
        id: novoColaborador._id,
        nome: novoColaborador.nome,
        email: novoColaborador.email,
        telefone: novoColaborador.telefone,
        tipo: 'colaborador',
      },
    });
  } catch (err) {
    console.error('Erro ao cadastrar colaborador:', err);
    res.status(500).json({
      error: true,
      message: err.message || 'Erro ao cadastrar colaborador!',
    });
  }
});

/*=====
Cadastro salão, admin
 =====*/
router.post('/cadastro/salao', async (req, res) => {
  try {
    const { nome, email, senha, telefone, endereco } = req.body;
    //Validando
    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: true,
        message: 'Nome, email e senha são obrigatórios.',
      });
    }
    //Vendo se o email existe no bd
    const salaoExistente = await Salao.findOne({ email });
    if (salaoExistente) {
      return res.status(400).json({
        error: true,
        message: 'Email já cadastrado.',
      });
    }
    //Cria salão
    const novoSalao = await new Salao({
      nome,
      email,
      senha, //senha hardcoded temporaria
      telefone: telefone || '',
      endereco: endereco || {},
    }).save();
    res.status(201).json({
      error: false,
      message: 'Salão cadastrado com sucesso!',
      usuario: {
        id: novoSalao._id,
        nome: novoSalao.nome,
        email: novoSalao.email,
        telefone: novoSalao.telefone,
        tipo: 'salao',
      },
    });
  } catch (err) {
    console.error('Erro ao cadastrar salão:', err);
    res.status(500).json({
      error: true,
      message: err.message || 'Erro ao cadastrar salão1',
    });
  }
});

/*=====
Login cliente
 =====*/
router.post('/login/cliente', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: true,
        message: 'Email e senha são obrigatórios.',
      });
    }
    //Busca cliente por email
    const cliente = await Cliente.findOne({ email });
    //Vendo se o cliente existe
    if (!cliente) {
      return res.status(401).json({
        error: true,
        message: 'Email ou senha incorretos.',
      });
    }
    //Vendo se a senha é correta (texto puro temporario)
    if (cliente.senha !== senha) {
      return res.status(401).json({
        error: true,
        message: 'Email ou senha incorretos.',
      });
    }
    //Vendo se o cliente está disponivel
    if (cliente.status === 'Indisponivel') {
      return res.status(403).json({
        error: true,
        message: 'Cliente inativo. Entre em contato com o salão!',
      });
    }
    //Retorna dados do cliente menos senha
    res.json({
      error: false,
      message: 'Login realizado com sucesso!',
      usuario: {
        id: cliente._id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        tipo: 'cliente',
      },
    });
  } catch (err) {
    console.error('Erro ao fazer login cliente:', err);
    res.status(500).json({
      error: true,
      message: 'Erro ao fazer login.',
    });
  }
});

/*=====
Login colaborador
 =====*/
router.post('/login/colaborador', async (req, res) => {
  try {
    const { email, senha } = req.body;
    //Validando
    if (!email || !senha) {
      return res.status(400).json({
        error: true,
        message: 'Email e senha são obrigatórios.',
      });
    }
    //Busca colaborador por email
    const colaborador = await Colaborador.findOne({ email });
    //Vendo se o colaborador existe
    if (!colaborador) {
      return res.status(401).json({
        error: true,
        message: 'Email ou senha incorretos.',
      });
    }
    //Vendo se a senha é correta (texto puro temporario)
    if (colaborador.senha !== senha) {
      return res.status(401).json({
        error: true,
        message: 'Email ou senha incorretos.',
      });
    }
    //Vendo se o colaborador está disponivel
    if (colaborador.status === 'Indisponivel') {
      return res.status(403).json({
        error: true,
        message: 'Colaborador inativo.',
      });
    }
    //Retorna dados do colaborador menos senha
    res.json({
      error: false,
      message: 'Login realizado com sucesso!',
      usuario: {
        id: colaborador._id,
        nome: colaborador.nome,
        email: colaborador.email,
        telefone: colaborador.telefone,
        foto: colaborador.foto,
        tipo: 'colaborador',
      },
    });
  } catch (err) {
    console.error('Erro ao fazer login colaborador:', err);
    res.status(500).json({
      error: true,
      message: 'Erro ao fazer login.',
    });
  }
});

/*=====
Login salão admin
 =====*/
router.post('/login/salao', async (req, res) => {
  try {
    const { email, senha } = req.body;
    //Validando
    if (!email || !senha) {
      return res.status(400).json({
        error: true,
        message: 'Email e senha são obrigatórios.',
      });
    }
    //Busca salão por email
    const salao = await Salao.findOne({ email });
    //Vendo se o salão existe
    if (!salao) {
      return res.status(401).json({
        error: true,
        message: 'Email ou senha incorretos.',
      });
    }
    //Vendo se o salão tem senha cadastrada
    if (!salao.senha) {
      return res.status(400).json({
        error: true,
        message: 'Salão sem senha cadastrada. Configure uma senha primeiro!',
      });
    }
    //Vendo se a senha é correta 
    if (salao.senha !== senha) {
      return res.status(401).json({
        error: true,
        message: 'Email ou senha incorretos.',
      });
    }
    //Retorna dados do salão menos senha
    res.json({
      error: false,
      message: 'Login realizado com sucesso!',
      usuario: {
        id: salao._id,
        nome: salao.nome,
        email: salao.email,
        telefone: salao.telefone,
        endereco: salao.endereco,
        tipo: 'salao',
      },
    });
  } catch (err) {
    console.error('Erro ao fazer login salão:', err);
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

