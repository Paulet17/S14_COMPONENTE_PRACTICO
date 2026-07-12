const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
    },
    codigoMenu: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    categoria: {
      type: String,
      required: [true, 'La categoria es obligatoria'],
      enum: [
        'Bolones',
        'Tigrillos',
        'Tortas de bolon',
        'Tortillas',
        'Especiales',
        'Patacones',
        'Bebidas',
        'Extras',
      ],
    },
    descripcion: {
      type: String,
      trim: true,
      default: '',
    },
    tipoMasa: {
      type: String,
      enum: ['Verde', 'Mixta', 'No aplica'],
      default: 'No aplica',
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    disponible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Producto', productoSchema);
