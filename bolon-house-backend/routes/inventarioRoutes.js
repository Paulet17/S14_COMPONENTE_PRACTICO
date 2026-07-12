const express = require('express');
const router = express.Router();
const {
  crearInsumo,
  obtenerInventario,
  actualizarInsumo,
  eliminarInsumo,
} = require('../controllers/inventarioController');
const { protegerRuta, autorizarRoles } = require('../middleware/authMiddleware');

router.use(protegerRuta);

router.get('/', obtenerInventario);
router.post('/', autorizarRoles('admin'), crearInsumo);
router.put('/:id', autorizarRoles('admin'), actualizarInsumo);
router.delete('/:id', autorizarRoles('admin'), eliminarInsumo);

module.exports = router;
