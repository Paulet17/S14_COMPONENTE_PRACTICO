import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { MenuItem } from '../data/menu';
import { categoriaBackendAFrontend, categoriaFrontendABackend } from '../data/categorias';
import { api } from '../services/api';

export type ManagedProduct = MenuItem & {
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  available: boolean;
};

export type InventoryItem = {
  id: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  category: string;
};

type AdminContextType = {
  products: ManagedProduct[];
  refreshProducts: () => Promise<void>;
  updateProductPrice: (id: string, price: number) => void;
  toggleProductAvailability: (id: string) => void;
  addProduct: (product: Omit<ManagedProduct, 'id'>) => void;
  deleteProduct: (id: string) => void;
  inventory: InventoryItem[];
  refreshInventory: () => Promise<void>;
  adjustStock: (id: string, delta: number) => void;
  setStock: (id: string, value: number) => void;
  updateMinStock: (id: string, min: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  deleteInventoryItem: (id: string) => void;
};

const productoBackendAManagedProduct = (p: any): ManagedProduct => {
  const info = categoriaBackendAFrontend[p.categoria] || { id: 'especiales', name: p.categoria, emoji: '⭐' };
  return {
    id: p._id,
    name: p.nombre,
    description: p.descripcion || '',
    price: p.precio,
    categoryId: info.id,
    categoryName: info.name,
    categoryEmoji: info.emoji,
    available: p.disponible,
  };
};

const insumoBackendAInventoryItem = (i: any): InventoryItem => ({
  id: i._id,
  name: i.nombre,
  unit: i.unidad,
  stock: i.stock,
  minStock: i.stockMinimo,
  category: i.categoria,
});

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const refreshProducts = useCallback(async () => {
    try {
      const data = await api.listarProductos();
      setProducts(data.map(productoBackendAManagedProduct));
    } catch {
      // se reintenta cuando el componente que lo necesita vuelva a montar
    }
  }, []);

  const refreshInventory = useCallback(async () => {
    try {
      const data = await api.listarInventario();
      setInventory(data.map(insumoBackendAInventoryItem));
    } catch {
      // requiere sesion iniciada; falla silenciosamente si aun no hay token
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const updateProductPrice = (id: string, price: number) => {
    api
      .actualizarProducto(id, { precio: price })
      .then(() => setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, price } : p))))
      .catch(() => {});
  };

  const toggleProductAvailability = (id: string) => {
    const actual = products.find((p) => p.id === id);
    if (!actual) return;
    api
      .actualizarProducto(id, { disponible: !actual.available })
      .then(() => setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p))))
      .catch(() => {});
  };

  const addProduct = (product: Omit<ManagedProduct, 'id'>) => {
    const categoria = categoriaFrontendABackend[product.categoryId] || product.categoryName;
    api
      .crearProducto({
        nombre: product.name,
        categoria,
        descripcion: product.description,
        precio: product.price,
        disponible: product.available,
      })
      .then((creado) => setProducts((prev) => [...prev, productoBackendAManagedProduct(creado)]))
      .catch(() => {});
  };

  const deleteProduct = (id: string) => {
    api
      .eliminarProducto(id)
      .then(() => setProducts((prev) => prev.filter((p) => p.id !== id)))
      .catch(() => {});
  };

  const adjustStock = (id: string, delta: number) => {
    const actual = inventory.find((i) => i.id === id);
    if (!actual) return;
    const nuevoStock = Math.max(0, Math.round((actual.stock + delta) * 100) / 100);
    api
      .actualizarInsumo(id, { stock: nuevoStock })
      .then(() => setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, stock: nuevoStock } : i))))
      .catch(() => {});
  };

  const setStock = (id: string, value: number) => {
    const nuevoStock = Math.max(0, value);
    api
      .actualizarInsumo(id, { stock: nuevoStock })
      .then(() => setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, stock: nuevoStock } : i))))
      .catch(() => {});
  };

  const updateMinStock = (id: string, min: number) => {
    const nuevoMin = Math.max(0, min);
    api
      .actualizarInsumo(id, { stockMinimo: nuevoMin })
      .then(() => setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, minStock: nuevoMin } : i))))
      .catch(() => {});
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    api
      .crearInsumo({ nombre: item.name, unidad: item.unit, stock: item.stock, stockMinimo: item.minStock, categoria: item.category })
      .then((creado) => setInventory((prev) => [...prev, insumoBackendAInventoryItem(creado)]))
      .catch(() => {});
  };

  const deleteInventoryItem = (id: string) => {
    api
      .eliminarInsumo(id)
      .then(() => setInventory((prev) => prev.filter((i) => i.id !== id)))
      .catch(() => {});
  };

  return (
    <AdminContext.Provider
      value={{
        products, refreshProducts, updateProductPrice, toggleProductAvailability, addProduct, deleteProduct,
        inventory, refreshInventory, adjustStock, setStock, updateMinStock, addInventoryItem, deleteInventoryItem,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
