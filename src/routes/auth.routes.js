const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword } = require('../controllers/auth.controller');

// POST /auth/register - Registro de usuarios
router.post('/register', register);

// POST /auth/login - Login
router.post('/login', login);

// POST /auth/forgot-password - Solicitar recuperación de contraseña
router.post('/forgot-password', forgotPassword);

// POST /auth/reset-password - Restablecer contraseña
router.post('/reset-password', resetPassword);

module.exports = router;