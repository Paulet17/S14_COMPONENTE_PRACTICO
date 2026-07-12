const mongoose = require('mongoose');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');

// Busca un producto ya sea por su _id real de Mongo o por su codigoMenu
// (id estatico que usa el diseno del frontend, ej. 'b1', 't3')
const buscarProducto = async (referencia) => {
  if (mongoose.isValidObjectId(referencia)) {
    const porId = await Producto.findById(referencia);
    if (porId) return porId;
  }
  return Producto.findOne({ codigoMenu: referencia });
};

// @desc    Crear un nuevo pedido
// @route   POST /api/pedidos
// @access  Privado
const crearPedido = async (req, res, next) => {
  try {
    const { items, cliente, mesa, notas, metodoPago } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ mensaje: 'El pedido debe incluir al menos un producto' });
    }

    // Reconstruir items desde la base de datos para evitar precios manipulados
    const itemsProcesados = [];
    let total = 0;

    for (const item of items) {
      const producto = await buscarProducto(item.producto);
      if (!producto) {
        return res.status(404).json({ mensaje: `Producto ${item.producto} no encontrado` });
      }
      const cantidad = item.cantidad || 1;
      itemsProcesados.push({
        producto: producto._id,
        nombre: producto.nombre,
        precioUnitario: producto.precio,
        cantidad,
        personalizacion: item.personalizacion || '',
      });
      total += producto.precio * cantidad;
    }

    const ultimoPedido = await Pedido.findOne().sort({ numero: -1 });
    const siguienteNumero = ultimoPedido ? ultimoPedido.numero + 1 : 1;

    const pedido = await Pedido.create({
      numero: siguienteNumero,
      items: itemsProcesados,
      total,
      cliente,
      mesa,
      notas,
      metodoPago,
      creadoPor: req.usuario.id,
    });

    res.status(201).json(pedido);
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener todos los pedidos (con filtro opcional por estado)
// @route   GET /api/pedidos?estado=pendiente
// @access  Privado
const obtenerPedidos = async (req, res, next) => {
  try {
    const filtro = {};
    if (req.query.estado) filtro.estado = req.query.estado;

    const pedidos = await Pedido.find(filtro)
      .populate('creadoPor', 'nombre email')
      .sort({ createdAt: -1 });

    res.json(pedidos);
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener un pedido por id
// @route   GET /api/pedidos/:id
// @access  Privado
const obtenerPedidoPorId = async (req, res, next) => {
  try {
    const pedido = await Pedido.findById(req.params.id).populate('creadoPor', 'nombre email');
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    res.json(pedido);
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar el estado (u otros datos) de un pedido
// @route   PUT /api/pedidos/:id
// @access  Privado
const actualizarPedido = async (req, res, next) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    const campos = ['estado', 'cliente', 'mesa', 'notas'];
    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) pedido[campo] = req.body[campo];
    });

    const pedidoActualizado = await pedido.save();
    res.json(pedidoActualizado);
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar un pedido
// @route   DELETE /api/pedidos/:id
// @access  Privado (admin)
const eliminarPedido = async (req, res, next) => {
  try {
    const pedido = await Pedido.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }

    await pedido.deleteOne();
    res.json({ mensaje: 'Pedido eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearPedido,
  obtenerPedidos,
  obtenerPedidoPorId,
  actualizarPedido,
  eliminarPedido,
};
