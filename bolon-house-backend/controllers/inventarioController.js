const Inventario = require('../models/Inventario');

// @desc    Crear un insumo de inventario
// @route   POST /api/inventario
// @access  Privado (admin)
const crearInsumo = async (req, res, next) => {
  try {
    const { nombre, unidad, stock, stockMinimo, categoria } = req.body;

    if (!nombre || !unidad) {
      return res.status(400).json({ mensaje: 'Nombre y unidad son obligatorios' });
    }

    const insumo = await Inventario.create({ nombre, unidad, stock, stockMinimo, categoria });
    res.status(201).json(insumo);
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener todo el inventario
// @route   GET /api/inventario
// @access  Privado
const obtenerInventario = async (req, res, next) => {
  try {
    const inventario = await Inventario.find().sort({ categoria: 1, nombre: 1 });
    res.json(inventario);
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar un insumo (stock, minimo, etc.)
// @route   PUT /api/inventario/:id
// @access  Privado (admin)
const actualizarInsumo = async (req, res, next) => {
  try {
    const insumo = await Inventario.findById(req.params.id);
    if (!insumo) {
      return res.status(404).json({ mensaje: 'Insumo no encontrado' });
    }

    const campos = ['nombre', 'unidad', 'stock', 'stockMinimo', 'categoria'];
    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) insumo[campo] = req.body[campo];
    });

    const insumoActualizado = await insumo.save();
    res.json(insumoActualizado);
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar un insumo
// @route   DELETE /api/inventario/:id
// @access  Privado (admin)
const eliminarInsumo = async (req, res, next) => {
  try {
    const insumo = await Inventario.findById(req.params.id);
    if (!insumo) {
      return res.status(404).json({ mensaje: 'Insumo no encontrado' });
    }

    await insumo.deleteOne();
    res.json({ mensaje: 'Insumo eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = { crearInsumo, obtenerInventario, actualizarInsumo, eliminarInsumo };
