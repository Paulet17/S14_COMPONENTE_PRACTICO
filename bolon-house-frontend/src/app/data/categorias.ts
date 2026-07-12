// Traduce entre la categoria en espanol que usa el backend (MongoDB)
// y el id/nombre/emoji que usa el diseno del frontend.

export type CategoriaInfo = { id: string; name: string; emoji: string };

export const categoriaBackendAFrontend: Record<string, CategoriaInfo> = {
  'Bolones': { id: 'bolones', name: 'Bolones', emoji: '🫓' },
  'Tigrillos': { id: 'tigrillos', name: 'Tigrillos', emoji: '🌽' },
  'Tortas de bolon': { id: 'tortas', name: 'Tortas de Bolón', emoji: '🍕' },
  'Tortillas': { id: 'tortillas', name: 'Tortillas', emoji: '🥞' },
  'Especiales': { id: 'especiales', name: 'Especiales', emoji: '⭐' },
  'Patacones': { id: 'patacones', name: 'Patacones', emoji: '🍌' },
  'Bebidas': { id: 'bebidas', name: 'Bebidas', emoji: '☕' },
  'Extras': { id: 'extras', name: 'Extras', emoji: '➕' },
};

export const categoriasBackend = Object.keys(categoriaBackendAFrontend);

export const categoriaFrontendABackend: Record<string, string> = Object.fromEntries(
  Object.entries(categoriaBackendAFrontend).map(([backend, info]) => [info.id, backend])
);
