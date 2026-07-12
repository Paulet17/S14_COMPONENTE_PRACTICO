const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifica que el request incluya un token valido
const protegerRuta = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.usuario = await User.findById(decoded.id).select('-password');

      if (!req.usuario) {
        return res.status(401).json({ mensaje: 'Usuario no encontrado' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ mensaje: 'Token invalido o expirado' });
    }
  }

  if (!token) {
    return res.status(401).json({ mensaje: 'No autorizado, token no proporcionado' });
  }
};

// Restringe el acceso segun el rol del usuario
const autorizarRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permisos para esta accion' });
    }
    next();
  };
};

module.exports = { protegerRuta, autorizarRoles };
