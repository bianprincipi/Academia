const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { sendResetPasswordEmail } = require('../services/email.service');
const { error } = require('console');
const { where } = require('sequelize');

// Generar JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'  // Valor fijo en lugar de leer del .env
  });
};
//POST /auth/register
const register = async (req, res) => {
    try {
        const { nombre, correo, contraseña, rol } = req.body;

        //validaciones
        if (!nombre || !correo || !contraseña || !rol) {
            return res.status(400).json({
                error: 'Todos los campos son requeridos.'
            });
        }

        //verificar si el correo ya existw
        const existingUser = await User.findOne({ where: { correo } });
        if (existingUser) {
            return res.status(400).json({
                error: 'El correo ya está registrado.'
            });
        }

        // crear usuario
        const user = await User.create({
            nombre,
            correo,
            contraseña,
            rol
        });

        //generar token
        const token = generateToken(user.id);

        res.status(201).json({
            message: 'Usuario registrado exitosamente!',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                correo: user.correo,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ error: 'Error al registrar el usuario.' });
    }
};

//POST /auth/login
const login = async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        //validaciones
        if (!correo || !contraseña) {
            return res.status(400).json({
                error: 'Correo y Contraseña son requeridos.'
            });
        }

        //buscar usuario
        const user = await User.findOne({ where: { correo } });
        if (!user) {
            return res.status(401).json({
                error: 'Credenciales inválidas.'
            });
        }

        //verificar si está activo
        if (!user.is_active) {
            return res.status(401).json({
                error: 'Usuario inactivo.'
            });
        }

        //verificar contraseña
        const isMatch = await user.comparePassword(contraseña);
        if (!isMatch) {
            return res.status(401).json({
                error: 'Credenciales inválidas.'
            });
        }

        //generar token
        const token = generateToken(user.id);

        res.json({
            message: 'Login exitoso!',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                correo: user.correo,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
};

// POST /auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const { correo } = req.body;

        if (!correo) {
            return res.status(400).json({
                error: 'El correo es requerido.'
            });
        }

        const user = await User.findOne({ where: { correo } });
        if (!user) {
            //no se revela si el correo existe por seguridad
            return res.json({
                message: 'Si el correo existe, recibirás un enlace de recuperación.'
            });
        }

        //generar token de recuperacion
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpire = new Date(Date.now() + 3600000); //1h

        //gurardar token en bd
        user.reset_token = resetToken;
        user.reset_token_expire = resetTokenExpire;
        await user.save();

        //enviar email
        await sendResetPasswordEmail(user.correo, user.nombre, resetToken);

        res.json({
            message: 'Si el correo existe, recibirás un enlace de recuperación.'
        });
    } catch (error) {
        console.error('Error en forgotPassword:', error);
        res.status(500).json({ error: 'Error al procesar solicitud.' });
    }
};


//post /auth/reset-password
const resetPassword = async (req, res) => {
    try {
        const { token, nuevaContraseña } = req.body;

        if (!token || !nuevaContraseña) {
            return res.status(400).json({
                error: 'Token y nueva contraseña son requeridos.'
            });
        }

        // buscar usuario con token valido
        const user = await User.findOne({
            where: {
                reset_token: token,
                reset_token_expire: {
                    [require('sequelize').Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                error: 'Token inválido o expirado.'
            });
        }

        //actualizar contraseña
        user.contraseña = nuevaContraseña;
        user.reset_token = null;
        user.reset_token_expire = null;
        await user.save();

        res.json({
            message: 'Contraseña actualizada exitosamente!'
        });
    } catch (error) {
        console.error('Error en resetPassword:', error);
        rest.status(500).json({ error: 'Error al restablecer contraseña.' });
    }
};

module.exports = {
    register,
    login,
    forgotPassword,
    resetPassword
};
