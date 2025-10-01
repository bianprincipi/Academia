const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'No autorizado' 
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    next();
  };
};

module.exports = checkRole;