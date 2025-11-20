const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage para Colaboradores
const colaboradorStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'agendei/colaboradores',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
});

// Storage para Serviços
const servicoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'agendei/servicos',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }],
    },
});

// Storage para Clientes
const clienteStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'agendei/clientes',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
});

module.exports = {
    cloudinary,
    colaboradorStorage,
    servicoStorage,
    clienteStorage,
};
