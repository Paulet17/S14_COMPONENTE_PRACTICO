import { useState, useMemo } from 'react';
import { Package, Plus, Trash2, Search, ToggleLeft, ToggleRight, X, AlertCircle } from 'lucide-react';
import { useAdmin, ManagedProduct } from '../context/AdminContext';
import { menuCategories } from '../data/menu';

type NewProductForm = {
  categoryId: string;
  name: string;
  description: string;
  price: string;
};

const emptyForm: NewProductForm = {
  categoryId: menuCategories[0].id,
  name: '',
  description: '',
  price: '',
};

export function ManageProducts() {
  const { products, updateProductPrice, toggleProductAvailability, addProduct, deleteProduct } = useAdmin();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewProductForm>(emptyForm);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const update = (field: keyof NewProductForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const filtered = useMemo(() =>
    products
      .filter(p => activeCategory === 'all' || p.categoryId === activeCategory)
      .filter(p => !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      ),
    [products, activeCategory, search]
  );

  const available = filtered.filter(p => p.available).length;
  const unavailable = filtered.length - available;

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) { setError('Ingresa un precio válido'); return; }
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return; }

    const cat = menuCategories.find(c => c.id === form.categoryId)!;
    addProduct({
      categoryId: form.categoryId,
      categoryName: cat.name,
      categoryEmoji: cat.emoji,
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      available: true,
    });
    setShowModal(false);
    setForm(emptyForm);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) { deleteProduct(id); setDeleteConfirm(null); }
    else { setDeleteConfirm(id); setTimeout(() => setDeleteConfirm(null), 3000); }
  };

  const handlePriceChange = (id: string, val: string) => {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) updateProductPrice(id, n);
  };

  const inputStyle = { backgroundColor: '#1C2E36', border: '1px solid #2a4050' };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => (e.target.style.borderColor = '#76BC43');
  const onBlur  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => (e.target.style.borderColor = '#2a4050');

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" style={{ color: '#E9C040' }} />
            Gestión de Productos
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {products.length} productos · <span style={{ color: '#76BC43' }}>{products.filter(p => p.available).length} disponibles</span>
            {products.filter(p => !p.available).length > 0 && (
              <span className="text-red-400"> · {products.filter(p => !p.available).length} no disponibles</span>
            )}
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setForm(emptyForm); setError(''); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 self-start sm:self-auto"
          style={{ backgroundColor: '#76BC43', color: '#1C2E36' }}
        >
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setActiveCategory('all'); }}
          placeholder="Buscar producto..."
          className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all"
          style={{ backgroundColor: '#243a45', border: '1px solid #2a4050' }}
          onFocus={e => (e.target.style.borderColor = '#76BC43')}
          onBlur={e => (e.target.style.borderColor = '#2a4050')} />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => { setActiveCategory('all'); setSearch(''); }}
          className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0"
          style={activeCategory === 'all' ? { backgroundColor: '#76BC43', color: '#1C2E36' } : { backgroundColor: '#243a45', color: '#9ca3af' }}>
          Todos ({products.length})
        </button>
        {menuCategories.map(cat => {
          const count = products.filter(p => p.categoryId === cat.id).length;
          return (
            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSearch(''); }}
              className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0"
              style={activeCategory === cat.id ? { backgroundColor: '#76BC43', color: '#1C2E36' } : { backgroundColor: '#243a45', color: '#9ca3af' }}>
              {cat.emoji} {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Products Table */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#243a45' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr style={{ borderBottom: '1px solid #2a4050' }}>
                {['Producto', 'Categoría', 'Descripción', 'Precio', 'Estado', ''].map(h => (
                  <th key={h} className="px-4 py-4 text-left text-gray-500 text-xs font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="transition-colors hover:bg-[#2a4050]/40" style={{ borderBottom: '1px solid #2a405050' }}>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{p.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: '#E9C040' }}>{p.categoryEmoji} {p.categoryName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-400 text-xs max-w-[200px] truncate">{p.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center rounded-lg overflow-hidden w-24" style={{ backgroundColor: '#1C2E36', border: '1px solid #2a4050' }}>
                      <span className="text-gray-500 text-xs pl-2">$</span>
                      <input
                        type="number"
                        defaultValue={p.price}
                        min="0"
                        step="0.25"
                        onBlur={e => handlePriceChange(p.id, e.target.value)}
                        className="w-full px-1.5 py-1.5 text-sm text-white bg-transparent outline-none"
                        onFocus={e => (e.target.parentElement!.style.borderColor = '#E9C040')}
                        onBlurCapture={e => (e.target.parentElement!.style.borderColor = '#2a4050')}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleProductAvailability(p.id)} className="flex items-center gap-2 transition-all hover:opacity-80">
                      {p.available
                        ? <ToggleRight className="w-6 h-6" style={{ color: '#76BC43' }} />
                        : <ToggleLeft className="w-6 h-6 text-gray-600" />
                      }
                      <span className="text-xs" style={{ color: p.available ? '#76BC43' : '#6b7280' }}>
                        {p.available ? 'Activo' : 'Inactivo'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(p.id)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${deleteConfirm === p.id ? 'bg-red-500 scale-105' : 'hover:bg-red-500/20'}`}>
                      <Trash2 className={`w-3.5 h-3.5 ${deleteConfirm === p.id ? 'text-white' : 'text-red-400'}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron productos</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ backgroundColor: '#243a45' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Nuevo Producto</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Categoría</label>
                <select value={form.categoryId} onChange={update('categoryId')}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none appearance-none cursor-pointer"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                  {menuCategories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Nombre del producto</label>
                <input type="text" value={form.name} onChange={update('name')} placeholder="Ej: Bolón Especial"
                  required className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Descripción</label>
                <textarea value={form.description} onChange={update('description')} placeholder="Describe el producto..."
                  rows={2} className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-600 text-sm outline-none resize-none transition-all"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Precio ($)</label>
                <input type="number" value={form.price} onChange={update('price')} placeholder="0.00"
                  min="0" step="0.25" required
                  className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl" style={{ backgroundColor: '#ff444420', color: '#ff6666' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm" style={{ backgroundColor: '#2a4050', color: '#9ca3af' }}>
                  Cancelar
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#76BC43', color: '#1C2E36' }}>
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
