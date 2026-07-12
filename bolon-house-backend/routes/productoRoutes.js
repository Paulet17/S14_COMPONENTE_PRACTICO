const express = require('express');
const router = express.Router();
const {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
} = require('../controllers/productoController');
const { protegerRuta, autorizarRoles } = require('../middleware/authMiddleware');

// Rutas publicas (consultar menu no requiere sesion)
router.get('/', obtenerProductos);
router.get('/:id', obtenerProductoPorId);

// Rutas privadas, solo administradores gestionan el menu
router.post('/', protegerRuta, autorizarRoles('admin'), crearProducto);
router.put('/:id', protegerRuta, autorizarRoles('admin'), actualizarProducto);
router.delete('/:id', protegerRuta, autorizarRoles('admin'), eliminarProducto);

module.exports = router;
