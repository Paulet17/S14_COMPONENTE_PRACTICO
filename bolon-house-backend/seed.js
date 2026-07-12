require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Producto = require('./models/Producto');
const User = require('./models/User');
const Inventario = require('./models/Inventario');

// Mismos productos, ids y precios que el diseno oficial (src/app/data/menu.ts)
const productos = [
  // Bolones
  { codigoMenu: 'b1', nombre: 'Bolón Sencillo', categoria: 'Bolones', descripcion: 'De queso, chicharrón o mixto', precio: 2.50 },
  { codigoMenu: 'b2', nombre: 'Bolón + Huevo Frito', categoria: 'Bolones', descripcion: 'De queso, chicharrón o mixto con huevo frito', precio: 3.00 },
  { codigoMenu: 'b3', nombre: 'Bolón + Salsa de Queso', categoria: 'Bolones', descripcion: 'De queso, chicharrón o mixto con salsa de queso', precio: 3.00 },
  { codigoMenu: 'b4', nombre: 'Bolón + Salsa y Sal Prieta', categoria: 'Bolones', descripcion: 'Con salsa de queso y sal prieta', precio: 3.25 },
  { codigoMenu: 'b5', nombre: 'Bolón + Salsa y Huevo Frito', categoria: 'Bolones', descripcion: 'Con salsa de queso y huevo frito', precio: 3.50 },
  { codigoMenu: 'b6', nombre: 'Bolón Completo', categoria: 'Bolones', descripcion: 'Con salsa de queso, sal prieta y huevo frito', precio: 3.75 },
  { codigoMenu: 'b7', nombre: 'Bolón + Bistec de Carne', categoria: 'Bolones', descripcion: 'Con bistec de carne', precio: 3.75 },
  { codigoMenu: 'b8', nombre: 'Bolón + Bistec y Huevo', categoria: 'Bolones', descripcion: 'Con bistec de carne y huevo frito', precio: 4.00 },
  // Tigrillos
  { codigoMenu: 't1', nombre: 'Tigrillo Sencillo', categoria: 'Tigrillos', descripcion: 'Solo queso', precio: 3.50 },
  { codigoMenu: 't2', nombre: 'Tigrillo Mixto', categoria: 'Tigrillos', descripcion: 'Queso y chicharrón', precio: 4.00 },
  { codigoMenu: 't3', nombre: 'Tigrillo de Tocino', categoria: 'Tigrillos', descripcion: 'Queso y tocino', precio: 4.25 },
  { codigoMenu: 't4', nombre: 'Tigrillo Ranchero', categoria: 'Tigrillos', descripcion: 'Queso y chorizo parrillero', precio: 4.25 },
  { codigoMenu: 't5', nombre: 'Tigrillo Completo', categoria: 'Tigrillos', descripcion: 'Queso, chicharrón y tocino', precio: 4.50 },
  { codigoMenu: 't6', nombre: 'Tigrillo Muchoplatano', categoria: 'Tigrillos', descripcion: 'Queso, chicharrón, tocino y huevo frito', precio: 4.75 },
  // Tortas de bolon
  { codigoMenu: 'tb1', nombre: 'Torta Personal', categoria: 'Tortas de bolon', descripcion: 'Porción personal', precio: 4.25 },
  { codigoMenu: 'tb2', nombre: 'Torta 4-5 Personas', categoria: 'Tortas de bolon', descripcion: 'Para 4 a 5 personas', precio: 12.50 },
  { codigoMenu: 'tb3', nombre: 'Torta 6-7 Personas', categoria: 'Tortas de bolon', descripcion: 'Para 6 a 7 personas', precio: 17.50 },
  { codigoMenu: 'tb4', nombre: 'Torta 8-10 Personas', categoria: 'Tortas de bolon', descripcion: 'Para 8 a 10 personas', precio: 22.50 },
  // Tortillas
  { codigoMenu: 'to1', nombre: 'Tortilla de Queso', categoria: 'Tortillas', descripcion: 'Tortilla de queso clásica', precio: 2.50 },
  { codigoMenu: 'to2', nombre: 'Tortilla + Huevo Frito', categoria: 'Tortillas', descripcion: 'Con huevo frito', precio: 2.75 },
  { codigoMenu: 'to3', nombre: 'Tortilla + Bistec de Carne', categoria: 'Tortillas', descripcion: 'Con bistec de carne', precio: 3.75 },
  { codigoMenu: 'to4', nombre: 'Tortilla + Bistec y Huevo', categoria: 'Tortillas', descripcion: 'Con bistec de carne y huevo frito', precio: 4.00 },
  // Especiales
  { codigoMenu: 'e1', nombre: 'Bolón Muchocrunchy', categoria: 'Especiales', descripcion: 'Bolón frito relleno de queso, extra chicharrón y salsa de queso', precio: 4.25 },
  { codigoMenu: 'e2', nombre: 'Bolón Montubio', categoria: 'Especiales', descripcion: 'Bolón a su gusto con longaniza, salsa de queso y sal prieta', precio: 4.25 },
  { codigoMenu: 'e3', nombre: 'Bolón Supremo', categoria: 'Especiales', descripcion: 'Bolón cremoso con chorizo parrillero, huevo frito y salsa de queso', precio: 4.75 },
  { codigoMenu: 'e4', nombre: 'Canoa Muchoplatano', categoria: 'Especiales', descripcion: 'Maduro con queso, salsa de queso, sal prieta y chicharrón', precio: 3.75 },
  // Patacones
  { codigoMenu: 'p1', nombre: 'Patacón con Crema de Queso', categoria: 'Patacones', descripcion: 'Con crema de queso', precio: 2.50 },
  { codigoMenu: 'p2', nombre: 'Patacón con Huevo Frito', categoria: 'Patacones', descripcion: 'Con huevo frito', precio: 2.50 },
  { codigoMenu: 'p3', nombre: 'Patacón + Crema y Huevo Frito', categoria: 'Patacones', descripcion: 'Con crema de queso y huevo frito', precio: 3.00 },
  { codigoMenu: 'p4', nombre: 'Patacón + Bistec de Carne', categoria: 'Patacones', descripcion: 'Con bistec de carne', precio: 3.50 },
  { codigoMenu: 'p5', nombre: 'Patacón + Bistec y Huevo', categoria: 'Patacones', descripcion: 'Con bistec y huevo frito', precio: 3.75 },
  { codigoMenu: 'p6', nombre: 'Patacón Especial', categoria: 'Patacones', descripcion: 'Con crema de queso, huevo frito y chorizo parrillero', precio: 3.75 },
  // Bebidas
  { codigoMenu: 'beb1', nombre: 'Café', categoria: 'Bebidas', descripcion: 'Taza de café caliente', precio: 0.75 },
  { codigoMenu: 'beb2', nombre: 'Chocolate', categoria: 'Bebidas', descripcion: 'Taza de chocolate caliente', precio: 1.00 },
  { codigoMenu: 'beb3', nombre: 'Agua Aromática', categoria: 'Bebidas', descripcion: 'Aromática de hierbas', precio: 0.75 },
  { codigoMenu: 'beb4', nombre: 'Agua', categoria: 'Bebidas', descripcion: 'Agua natural', precio: 0.75 },
  { codigoMenu: 'beb5', nombre: 'Gaseosa', categoria: 'Bebidas', descripcion: 'Gaseosa fría', precio: 0.75 },
  { codigoMenu: 'beb6', nombre: 'Jugo de Naranja', categoria: 'Bebidas', descripcion: 'Jugo de naranja', precio: 1.00 },
  { codigoMenu: 'beb7', nombre: 'Jugo Natural de Naranja', categoria: 'Bebidas', descripcion: 'Jugo 100% natural', precio: 1.50 },
  // Extras
  { codigoMenu: 'ex1', nombre: 'Huevo Frito', categoria: 'Extras', descripcion: 'Un huevo frito', precio: 0.50 },
  { codigoMenu: 'ex2', nombre: 'Huevos Revueltos / Tortilla', categoria: 'Extras', descripcion: 'Revueltos o tortilla de huevo', precio: 1.00 },
  { codigoMenu: 'ex3', nombre: 'Huevos a la Copa / Duros', categoria: 'Extras', descripcion: 'A la copa o duros', precio: 1.00 },
  { codigoMenu: 'ex4', nombre: 'Huevos Revueltos con Tocino', categoria: 'Extras', descripcion: 'Revueltos con tocino', precio: 1.00 },
  { codigoMenu: 'ex5', nombre: 'Bistec de Carne', categoria: 'Extras', descripcion: 'Porción de bistec de carne', precio: 1.50 },
  { codigoMenu: 'ex6', nombre: 'Salsa de Queso / Sal Prieta', categoria: 'Extras', descripcion: 'Salsa de queso o sal prieta', precio: 0.50 },
];

const inventario = [
  { nombre: 'Plátanos Verdes', unidad: 'unidades', stock: 120, stockMinimo: 30, categoria: 'Producción' },
  { nombre: 'Maduros', unidad: 'unidades', stock: 40, stockMinimo: 20, categoria: 'Producción' },
  { nombre: 'Queso', unidad: 'kg', stock: 8, stockMinimo: 3, categoria: 'Lácteos' },
  { nombre: 'Chicharrón', unidad: 'kg', stock: 1.5, stockMinimo: 2, categoria: 'Carnes' },
  { nombre: 'Tocino', unidad: 'kg', stock: 3, stockMinimo: 2, categoria: 'Carnes' },
  { nombre: 'Chorizo Parrillero', unidad: 'kg', stock: 4, stockMinimo: 2, categoria: 'Carnes' },
  { nombre: 'Longaniza', unidad: 'kg', stock: 2, stockMinimo: 2, categoria: 'Carnes' },
  { nombre: 'Bistec de Res', unidad: 'kg', stock: 6, stockMinimo: 3, categoria: 'Carnes' },
  { nombre: 'Huevos', unidad: 'unidades', stock: 180, stockMinimo: 60, categoria: 'Proteínas' },
  { nombre: 'Sal Prieta', unidad: 'kg', stock: 0.4, stockMinimo: 0.5, categoria: 'Condimentos' },
  { nombre: 'Salsa de Queso', unidad: 'litros', stock: 3, stockMinimo: 1, categoria: 'Salsas' },
  { nombre: 'Café', unidad: 'kg', stock: 4, stockMinimo: 1, categoria: 'Bebidas' },
  { nombre: 'Chocolate en Polvo', unidad: 'kg', stock: 2, stockMinimo: 0.5, categoria: 'Bebidas' },
  { nombre: 'Naranjas', unidad: 'unidades', stock: 80, stockMinimo: 30, categoria: 'Frutas' },
  { nombre: 'Gaseosas', unidad: 'unidades', stock: 10, stockMinimo: 12, categoria: 'Bebidas' },
  { nombre: 'Aceite', unidad: 'litros', stock: 5, stockMinimo: 2, categoria: 'Condimentos' },
  { nombre: 'Manteca', unidad: 'kg', stock: 3, stockMinimo: 1, categoria: 'Condimentos' },
  { nombre: 'Agua (botellones)', unidad: 'unidades', stock: 6, stockMinimo: 3, categoria: 'Bebidas' },
];

const seed = async () => {
  await connectDB();

  await Producto.deleteMany();
  await Producto.insertMany(productos);
  console.log(`${productos.length} productos insertados`);

  await Inventario.deleteMany();
  await Inventario.insertMany(inventario);
  console.log(`${inventario.length} insumos de inventario insertados`);

  const existeAdmin = await User.findOne({ email: 'admin@bolonhouse.com' });
  if (!existeAdmin) {
    await User.create({
      nombre: 'Administrador',
      email: 'admin@bolonhouse.com',
      password: 'admin123',
      rol: 'admin',
    });
    console.log('Usuario admin creado: admin@bolonhouse.com / admin123');
  } else {
    console.log('El usuario admin ya existia, no se duplico');
  }

  console.log('Seed completado');
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((error) => {
  console.error('Error al ejecutar el seed:', error);
  process.exit(1);
});
