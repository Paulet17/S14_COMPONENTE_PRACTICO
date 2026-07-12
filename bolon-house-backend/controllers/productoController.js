const Producto = require('../models/Producto');

// @desc    Crear un nuevo producto
// @route   POST /api/productos
// @access  Privado (admin)
const crearProducto = async (req, res, next) => {
  try {
    const { nombre, categoria, descripcion, tipoMasa, precio, disponible, codigoMenu } = req.body;

    if (!nombre || !categoria || precio === undefined) {
      return res.status(400).json({ mensaje: 'Nombre, categoria y precio son obligatorios' });
    }

    const producto = await Producto.create({
      nombre,
      categoria,
      descripcion,
      tipoMasa,
      precio,
      disponible,
      codigoMenu,
    });

    res.status(201).json(producto);
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener todos los productos (con filtro opcional por categoria)
// @route   GET /api/productos?categoria=Bolones
// @access  Publico
const obtenerProductos = async (req, res, next) => {
  try {
    const filtro = {};
    if (req.query.categoria) filtro.categoria = req.query.categoria;
    if (req.query.disponible) filtro.disponible = req.query.disponible === 'true';

    const productos = await Producto.find(filtro).sort({ categoria: 1, nombre: 1 });
    res.json(productos);
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener un producto por id
// @route   GET /api/productos/:id
// @access  Publico
const obtenerProductoPorId = async (req, res, next) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar un producto
// @route   PUT /api/productos/:id
// @access  Privado (admin)
const actualizarProducto = async (req, res, next) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    const campos = ['nombre', 'categoria', 'descripcion', 'tipoMasa', 'precio', 'disponible'];
    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) producto[campo] = req.body[campo];
    });

    const productoActualizado = await producto.save();
    res.json(productoActualizado);
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar un producto
// @route   DELETE /api/productos/:id
// @access  Privado (admin)
const eliminarProducto = async (req, res, next) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    await producto.deleteOne();
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto,
};
