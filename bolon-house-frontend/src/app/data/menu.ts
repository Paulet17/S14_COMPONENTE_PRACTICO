export type MenuItemVariant = {
  label: string;
  options: string[];
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  variants?: MenuItemVariant[];
};

export type MenuCategory = {
  id: string;
  name: string;
  subtitle?: string;
  emoji: string;
  items: MenuItem[];
};

export const menuCategories: MenuCategory[] = [
  {
    id: 'bolones',
    name: 'Bolones',
    subtitle: 'Masa de verde o Masa mixta',
    emoji: '🫓',
    items: [
      { id: 'b1', name: 'Bolón Sencillo', description: 'De queso, chicharrón o mixto', price: 2.50, variants: [{ label: 'Relleno', options: ['Queso', 'Chicharrón', 'Mixto'] }, { label: 'Masa', options: ['Verde', 'Mixta'] }] },
      { id: 'b2', name: 'Bolón + Huevo Frito', description: 'De queso, chicharrón o mixto con huevo frito', price: 3.00, variants: [{ label: 'Relleno', options: ['Queso', 'Chicharrón', 'Mixto'] }, { label: 'Masa', options: ['Verde', 'Mixta'] }] },
      { id: 'b3', name: 'Bolón + Salsa de Queso', description: 'De queso, chicharrón o mixto con salsa de queso', price: 3.00, variants: [{ label: 'Relleno', options: ['Queso', 'Chicharrón', 'Mixto'] }, { label: 'Masa', options: ['Verde', 'Mixta'] }] },
      { id: 'b4', name: 'Bolón + Salsa y Sal Prieta', description: 'Con salsa de queso y sal prieta', price: 3.25, variants: [{ label: 'Relleno', options: ['Queso', 'Chicharrón', 'Mixto'] }, { label: 'Masa', options: ['Verde', 'Mixta'] }] },
      { id: 'b5', name: 'Bolón + Salsa y Huevo Frito', description: 'Con salsa de queso y huevo frito', price: 3.50, variants: [{ label: 'Relleno', options: ['Queso', 'Chicharrón', 'Mixto'] }, { label: 'Masa', options: ['Verde', 'Mixta'] }] },
      { id: 'b6', name: 'Bolón Completo', description: 'Con salsa de queso, sal prieta y huevo frito', price: 3.75, variants: [{ label: 'Relleno', options: ['Queso', 'Chicharrón', 'Mixto'] }, { label: 'Masa', options: ['Verde', 'Mixta'] }] },
      { id: 'b7', name: 'Bolón + Bistec de Carne', description: 'Con bistec de carne', price: 3.75, variants: [{ label: 'Relleno', options: ['Queso', 'Chicharrón', 'Mixto'] }, { label: 'Masa', options: ['Verde', 'Mixta'] }] },
      { id: 'b8', name: 'Bolón + Bistec y Huevo', description: 'Con bistec de carne y huevo frito', price: 4.00, variants: [{ label: 'Relleno', options: ['Queso', 'Chicharrón', 'Mixto'] }, { label: 'Masa', options: ['Verde', 'Mixta'] }] },
    ],
  },
  {
    id: 'tigrillos',
    name: 'Tigrillos',
    subtitle: 'Masa de verde o Masa mixta',
    emoji: '🌽',
    items: [
      { id: 't1', name: 'Tigrillo Sencillo', description: 'Solo queso', price: 3.50, variants: [{ label: 'Masa', options: ['Verde', 'Mixta'] }] },
      { id: 't2', name: 'Tigrillo Mixto', description: 'Queso y chicharrón', price: 4.00, variants: [{ label: 'Masa', options: ['Verde', 'Mixta'] }] },
      { id: 't3', name: 'Tigrillo de Tocino', description: 'Queso y tocino', price: 4.25, variants: [{ label: 'Masa', options: ['Verde', 'Mixta'] }] },
      { id: 't4', name: 'Tigrillo Ranchero', description: 'Queso y chorizo parrillero', price: 4.25, variants: [{ label: 'Masa', options: ['Verde', 'Mixta'] }] },
      { id: 't5', name: 'Tigrillo Completo', description: 'Queso, chicharrón y tocino', price: 4.50, variants: [{ label: 'Masa', options: ['Verde', 'Mixta'] }] },
      { id: 't6', name: 'Tigrillo Muchoplatano', description: 'Queso, chicharrón, tocino y huevo frito', price: 4.75, variants: [{ label: 'Masa', options: ['Verde', 'Mixta'] }] },
    ],
  },
  {
    id: 'tortas',
    name: 'Tortas de Bolón',
    emoji: '🍕',
    items: [
      { id: 'tb1', name: 'Torta Personal', description: 'Porción personal', price: 4.25 },
      { id: 'tb2', name: 'Torta 4-5 Personas', description: 'Para 4 a 5 personas', price: 12.50 },
      { id: 'tb3', name: 'Torta 6-7 Personas', description: 'Para 6 a 7 personas', price: 17.50 },
      { id: 'tb4', name: 'Torta 8-10 Personas', description: 'Para 8 a 10 personas', price: 22.50 },
    ],
  },
  {
    id: 'tortillas',
    name: 'Tortillas',
    emoji: '🥞',
    items: [
      { id: 'to1', name: 'Tortilla de Queso', description: 'Tortilla de queso clásica', price: 2.50 },
      { id: 'to2', name: 'Tortilla + Huevo Frito', description: 'Con huevo frito', price: 2.75 },
      { id: 'to3', name: 'Tortilla + Bistec de Carne', description: 'Con bistec de carne', price: 3.75 },
      { id: 'to4', name: 'Tortilla + Bistec y Huevo', description: 'Con bistec de carne y huevo frito', price: 4.00 },
    ],
  },
  {
    id: 'especiales',
    name: 'Especiales',
    emoji: '⭐',
    items: [
      { id: 'e1', name: 'Bolón Muchocrunchy', description: 'Bolón frito relleno de queso, extra chicharrón y salsa de queso', price: 4.25 },
      { id: 'e2', name: 'Bolón Montubio', description: 'Bolón a su gusto con longaniza, salsa de queso y sal prieta', price: 4.25, variants: [{ label: 'Relleno', options: ['Queso', 'Chicharrón', 'Mixto'] }, { label: 'Masa', options: ['Verde', 'Mixta'] }] },
      { id: 'e3', name: 'Bolón Supremo', description: 'Bolón cremoso con chorizo parrillero, huevo frito y salsa de queso', price: 4.75 },
      { id: 'e4', name: 'Canoa Muchoplatano', description: 'Maduro con queso, salsa de queso, sal prieta y chicharrón', price: 3.75 },
    ],
  },
  {
    id: 'patacones',
    name: 'Patacones',
    emoji: '🍌',
    items: [
      { id: 'p1', name: 'Patacón con Crema de Queso', description: 'Con crema de queso', price: 2.50 },
      { id: 'p2', name: 'Patacón con Huevo Frito', description: 'Con huevo frito', price: 2.50 },
      { id: 'p3', name: 'Patacón + Crema y Huevo Frito', description: 'Con crema de queso y huevo frito', price: 3.00 },
      { id: 'p4', name: 'Patacón + Bistec de Carne', description: 'Con bistec de carne', price: 3.50 },
      { id: 'p5', name: 'Patacón + Bistec y Huevo', description: 'Con bistec y huevo frito', price: 3.75 },
      { id: 'p6', name: 'Patacón Especial', description: 'Con crema de queso, huevo frito y chorizo parrillero', price: 3.75 },
    ],
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    emoji: '☕',
    items: [
      { id: 'beb1', name: 'Café', description: 'Taza de café caliente', price: 0.75 },
      { id: 'beb2', name: 'Chocolate', description: 'Taza de chocolate caliente', price: 1.00 },
      { id: 'beb3', name: 'Agua Aromática', description: 'Aromática de hierbas', price: 0.75 },
      { id: 'beb4', name: 'Agua', description: 'Agua natural', price: 0.75 },
      { id: 'beb5', name: 'Gaseosa', description: 'Gaseosa fría', price: 0.75 },
      { id: 'beb6', name: 'Jugo de Naranja', description: 'Jugo de naranja', price: 1.00 },
      { id: 'beb7', name: 'Jugo Natural de Naranja', description: 'Jugo 100% natural', price: 1.50 },
    ],
  },
  {
    id: 'extras',
    name: 'Extras',
    emoji: '➕',
    items: [
      { id: 'ex1', name: 'Huevo Frito', description: 'Un huevo frito', price: 0.50 },
      { id: 'ex2', name: 'Huevos Revueltos / Tortilla', description: 'Revueltos o tortilla de huevo', price: 1.00 },
      { id: 'ex3', name: 'Huevos a la Copa / Duros', description: 'A la copa o duros', price: 1.00 },
      { id: 'ex4', name: 'Huevos Revueltos con Tocino', description: 'Revueltos con tocino', price: 1.00 },
      { id: 'ex5', name: 'Bistec de Carne', description: 'Porción de bistec de carne', price: 1.50 },
      { id: 'ex6', name: 'Salsa de Queso / Sal Prieta', description: 'Salsa de queso o sal prieta', price: 0.50 },
    ],
  },
];
