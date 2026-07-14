import { useMemo } from 'react';
import { menuCategories as staticCategories, MenuCategory, MenuItem } from '../data/menu';
import { useAdmin } from '../context/AdminContext';

export function useMenuData(): MenuCategory[] {
  const { products } = useAdmin();

  return useMemo(() => {
    // Guarda las variantes de los productos originales, por si coinciden por id
    const staticItemsById = new Map<string, MenuItem>();
    staticCategories.forEach(cat => cat.items.forEach(item => staticItemsById.set(item.id, item)));

    // Agrupa los productos de la base de datos por categoría
    const byCategory = new Map<string, MenuItem[]>();
    products
      .filter(p => p.available) // solo productos activos
      .forEach(p => {
        const original = staticItemsById.get(p.id);
        const item: MenuItem = {
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          variants: original?.variants, // conserva variantes si existían
        };
        const lista = byCategory.get(p.categoryId) ?? [];
        lista.push(item);
        byCategory.set(p.categoryId, lista);
      });

    // Reconstruye las categorías usando emoji/subtitle originales, pero con items reales
    const resultado: MenuCategory[] = staticCategories.map(cat => ({
      ...cat,
      items: byCategory.get(cat.id) ?? [],
    }));

    // Si el admin creó una categoría nueva que no existía antes, la agrega también
    byCategory.forEach((items, catId) => {
      if (!resultado.find(c => c.id === catId)) {
        const productoEjemplo = products.find(p => p.categoryId === catId);
        resultado.push({
          id: catId,
          name: productoEjemplo?.categoryName ?? catId,
          emoji: productoEjemplo?.categoryEmoji ?? '',
          items,
        });
      }
    });

    return resultado.filter(cat => cat.items.length > 0);
  }, [products]);
}