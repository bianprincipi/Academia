const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No autorizado. Token no proporcionado' 
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['contraseña', 'reset_token', 'reset_token_expire'] }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado o inactivo' 
      });
    }

    // Agregar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    res.status(500).json({ error: 'Error en autenticación' });
  }
};

module.exports = auth;