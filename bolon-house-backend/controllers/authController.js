const User = require('../models/User');
const generarToken = require('../utils/generarToken');

// @desc    Registrar un nuevo usuario
// @route   POST /api/auth/register
// @access  Publico
const registrarUsuario = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, correo y contrasena son obligatorios' });
    }

    const existeUsuario = await User.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: 'Ya existe un usuario con ese correo' });
    }

    const usuario = await User.create({ nombre, email, password, rol });

    res.status(201).json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      token: generarToken(usuario._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Iniciar sesion
// @route   POST /api/auth/login
// @access  Publico
const iniciarSesion = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Correo y contrasena son obligatorios' });
    }

    const usuario = await User.findOne({ email }).select('+password');
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales invalidas' });
    }

    const passwordCorrecta = await usuario.compararPassword(password);
    if (!passwordCorrecta) {
      return res.status(401).json({ mensaje: 'Credenciales invalidas' });
    }

    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      token: generarToken(usuario._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cerrar sesion (invalidacion en el cliente)
// @route   POST /api/auth/logout
// @access  Privado
const cerrarSesion = async (req, res) => {
  // Con JWT sin estado, el logout real ocurre en el cliente eliminando el token.
  // Este endpoint existe para mantener un flujo explicito y poder registrar la accion.
  res.json({ mensaje: 'Sesion cerrada correctamente' });
};

// @desc    Obtener datos del usuario autenticado
// @route   GET /api/auth/me
// @access  Privado
const obtenerPerfil = async (req, res, next) => {
  try {
    const usuario = await User.findById(req.usuario.id);
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

// @desc    Listar todos los usuarios registrados
// @route   GET /api/auth/usuarios
// @access  Privado (admin)
const obtenerUsuarios = async (req, res, next) => {
  try {
    const usuarios = await User.find().sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar rol u otros datos de un usuario
// @route   PUT /api/auth/usuarios/:id
// @access  Privado (admin)
const actualizarUsuario = async (req, res, next) => {
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const campos = ['nombre', 'rol'];
    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) usuario[campo] = req.body[campo];
    });

    const usuarioActualizado = await usuario.save();
    res.json(usuarioActualizado);
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar un usuario
// @route   DELETE /api/auth/usuarios/:id
// @access  Privado (admin)
const eliminarUsuario = async (req, res, next) => {
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (String(usuario._id) === String(req.usuario.id)) {
      return res.status(400).json({ mensaje: 'No puedes eliminar tu propio usuario' });
    }

    await usuario.deleteOne();
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  obtenerPerfil,
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario,
};
