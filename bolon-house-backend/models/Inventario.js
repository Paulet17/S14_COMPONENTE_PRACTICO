const mongoose = require('mongoose');

const inventarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del insumo es obligatorio'],
      trim: true,
    },
    unidad: {
      type: String,
      required: [true, 'La unidad de medida es obligatoria'],
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    stockMinimo: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    categoria: {
      type: String,
      trim: true,
      default: 'General',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventario', inventarioSchema);
