const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Error de validacion de Mongoose
  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ mensaje: mensajes.join(', ') });
  }

  // Error de duplicado (unique) en Mongoose
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue)[0];
    return res.status(400).json({ mensaje: `El valor de '${campo}' ya esta registrado` });
  }

  // Error de ID invalido en Mongoose
  if (err.name === 'CastError') {
    return res.status(400).json({ mensaje: 'ID invalido' });
  }

  res.status(err.statusCode || 500).json({
    mensaje: err.message || 'Error interno del servidor',
  });
};

module.exports = errorHandler;
