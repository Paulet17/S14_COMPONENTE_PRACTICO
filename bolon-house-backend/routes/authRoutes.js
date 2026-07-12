const express = require('express');
const router = express.Router();
const {
  registrarUsuario,
  iniciarSesion,
  cerrarSesion,
  obtenerPerfil,
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario,
} = require('../controllers/authController');
const { protegerRuta, autorizarRoles } = require('../middleware/authMiddleware');

router.post('/register', registrarUsuario);
router.post('/login', iniciarSesion);
router.post('/logout', protegerRuta, cerrarSesion);
router.get('/me', protegerRuta, obtenerPerfil);
router.get('/usuarios', protegerRuta, autorizarRoles('admin'), obtenerUsuarios);
router.put('/usuarios/:id', protegerRuta, autorizarRoles('admin'), actualizarUsuario);
router.delete('/usuarios/:id', protegerRuta, autorizarRoles('admin'), eliminarUsuario);

module.exports = router;
