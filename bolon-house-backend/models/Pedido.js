const mongoose = require('mongoose');

const itemPedidoSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true,
    },
    nombre: {
      type: String,
      required: true,
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: 0,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    personalizacion: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const pedidoSchema = new mongoose.Schema(
  {
    numero: {
      type: Number,
      required: true,
      unique: true,
    },
    items: {
      type: [itemPedidoSchema],
      validate: [(arr) => arr.length > 0, 'El pedido debe tener al menos un producto'],
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    estado: {
      type: String,
      enum: ['pendiente', 'en_proceso', 'listo', 'completado', 'cancelado'],
      default: 'pendiente',
    },
    cliente: {
      type: String,
      trim: true,
      default: 'Consumidor final',
    },
    mesa: {
      type: String,
      trim: true,
      default: '',
    },
    metodoPago: {
      type: String,
      enum: ['efectivo', 'transferencia'],
      default: 'efectivo',
    },
    notas: {
      type: String,
      trim: true,
      default: '',
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pedido', pedidoSchema);
