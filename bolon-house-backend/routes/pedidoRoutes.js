const express = require('express');
const router = express.Router();
const {
  crearPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
  actualizarPedido,
  eliminarPedido,
} = require('../controllers/pedidoController');
const { protegerRuta, autorizarRoles } = require('../middleware/authMiddleware');

// Todas las rutas de pedidos requieren sesion iniciada
router.use(protegerRuta);

router.post('/', crearPedido);
router.get('/', obtenerPedidos);
router.get('/:id', obtenerPedidoPorId);
router.put('/:id', actualizarPedido);
router.delete('/:id', autorizarRoles('admin'), eliminarPedido);

module.exports = router;
