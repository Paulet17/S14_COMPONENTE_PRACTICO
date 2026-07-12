import { useState, useMemo, useEffect } from 'react';
import { BarChart2, Plus, Minus, Trash2, AlertTriangle, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useAdmin, InventoryItem } from '../context/AdminContext';

type StockStatus = 'critical' | 'low' | 'ok';

function getStatus(item: InventoryItem): StockStatus {
  if (item.stock === 0 || item.stock < item.minStock) return 'critical';
  if (item.stock < item.minStock * 1.5) return 'low';
  return 'ok';
}

const STATUS_CONFIG: Record<StockStatus, { color: string; bg: string; label: string }> = {
  critical: { color: '#ef4444', bg: '#ef444418', label: 'Crítico' },
  low:      { color: '#f97316', bg: '#f9731618', label: 'Bajo' },
  ok:       { color: '#76BC43', bg: '#76BC4318', label: 'OK' },
};

type NewItemForm = { name: string; unit: string; stock: string; minStock: string; category: string };
const emptyForm: NewItemForm = { name: '', unit: '', stock: '', minStock: '', category: '' };

const UNIT_OPTIONS = ['unidades', 'kg', 'litros', 'gramos', 'porciones'];

export function Inventory() {
  const { inventory, refreshInventory, adjustStock, setStock, updateMinStock, addInventoryItem, deleteInventoryItem } = useAdmin();

  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);
  const [activeFilter, setActiveFilter] = useState<StockStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewItemForm>(emptyForm);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const update = (field: keyof NewItemForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const criticalCount = useMemo(() => inventory.filter(i => getStatus(i) === 'critical').length, [inventory]);
  const lowCount      = useMemo(() => inventory.filter(i => getStatus(i) === 'low').length, [inventory]);

  const filtered = useMemo(() =>
    inventory.filter(i => activeFilter === 'all' || getStatus(i) === activeFilter),
    [inventory, activeFilter]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, InventoryItem[]>();
    filtered.forEach(i => {
      const arr = map.get(i.category) ?? [];
      arr.push(i);
      map.set(i.category, arr);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const stock    = parseFloat(form.stock);
    const minStock = parseFloat(form.minStock);
    if (!form.name.trim())           { setError('El nombre es obligatorio'); return; }
    if (!form.unit.trim())           { setError('La unidad es obligatoria'); return; }
    if (!form.category.trim())       { setError('La categoría es obligatoria'); return; }
    if (isNaN(stock) || stock < 0)   { setError('Ingresa un stock válido'); return; }
    if (isNaN(minStock) || minStock < 0) { setError('Ingresa un stock mínimo válido'); return; }
    addInventoryItem({ name: form.name.trim(), unit: form.unit.trim(), stock, minStock, category: form.category.trim() });
    setShowModal(false);
    setForm(emptyForm);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) { deleteInventoryItem(id); setDeleteConfirm(null); }
    else { setDeleteConfirm(id); setTimeout(() => setDeleteConfirm(null), 3000); }
  };

  const inputStyle = { backgroundColor: '#1C2E36', border: '1px solid #2a4050' };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = '#76BC43');
  const onBlur  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = '#2a4050');

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-2">
            <BarChart2 className="w-6 h-6" style={{ color: '#E9C040' }} />
            Inventario
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{inventory.length} ingredientes registrados</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setForm(emptyForm); setError(''); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 self-start sm:self-auto"
          style={{ backgroundColor: '#76BC43', color: '#1C2E36' }}
        >
          <Plus className="w-4 h-4" /> Agregar Ítem
        </button>
      </div>

      {/* Alert banners */}
      {criticalCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: '#ef444418', border: '1px solid #ef444440' }}>
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-400 text-sm font-medium">
            {criticalCount} ítem{criticalCount > 1 ? 's' : ''} con stock crítico — requiere reposición urgente
          </p>
        </div>
      )}
      {lowCount > 0 && criticalCount === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: '#f9731618', border: '1px solid #f9731640' }}>
          <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
          <p className="text-orange-400 text-sm font-medium">
            {lowCount} ítem{lowCount > 1 ? 's' : ''} con stock bajo
          </p>
        </div>
      )}
      {criticalCount === 0 && lowCount === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: '#76BC4318', border: '1px solid #76BC4340' }}>
          <CheckCircle className="w-5 h-5 shrink-0" style={{ color: '#76BC43' }} />
          <p className="text-sm font-medium" style={{ color: '#76BC43' }}>Todos los ítems tienen stock suficiente</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {([
          { key: 'all',      label: 'Total',    count: inventory.length,    color: '#9ca3af' },
          { key: 'critical', label: 'Crítico',  count: criticalCount,       color: '#ef4444' },
          { key: 'low',      label: 'Bajo',     count: lowCount,            color: '#f97316' },
        ] as const).map(({ key, label, count, color }) => (
          <button key={key} onClick={() => setActiveFilter(key)}
            className="rounded-xl p-4 text-left transition-all hover:opacity-90"
            style={{
              backgroundColor: activeFilter === key ? `${color}20` : '#243a45',
              border: activeFilter === key ? `1px solid ${color}40` : '1px solid #2a4050',
            }}>
            <p className="text-2xl font-bold" style={{ color }}>{count}</p>
            <p className="text-xs mt-0.5" style={{ color: activeFilter === key ? color : '#6b7280' }}>{label}</p>
          </button>
        ))}
      </div>

      {/* Inventory by category */}
      {grouped.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: '#243a45' }}>
          <p className="text-gray-500">No hay ítems en esta categoría</p>
        </div>
      ) : (
        grouped.map(([category, items]) => (
          <div key={category} className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#243a45' }}>
            <div className="px-5 py-3" style={{ borderBottom: '1px solid #2a4050' }}>
              <p className="font-semibold text-sm" style={{ color: '#E9C040' }}>{category}</p>
            </div>
            <div className="divide-y" style={{ borderColor: '#2a405050' }}>
              {items.map(item => {
                const status = getStatus(item);
                const cfg    = STATUS_CONFIG[status];
                const pct    = item.minStock > 0 ? Math.min(100, (item.stock / (item.minStock * 2)) * 100) : 100;

                return (
                  <div key={item.id} className="px-5 py-4 hover:bg-[#2a4050]/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      {/* Name + bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium text-sm">{item.name}</p>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: '#2a4050' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                          </div>
                          <p className="text-gray-500 text-xs whitespace-nowrap">
                            mín: {item.minStock} {item.unit}
                          </p>
                        </div>
                      </div>

                      {/* Stock controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => adjustStock(item.id, -1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                          style={{ backgroundColor: '#2a4050' }}>
                          <Minus className="w-3 h-3 text-white" />
                        </button>
                        <div className="flex items-center rounded-lg overflow-hidden" style={{ backgroundColor: '#1C2E36', border: '1px solid #2a4050' }}>
                          <input
                            type="number"
                            value={item.stock}
                            min="0"
                            step="1"
                            onChange={e => setStock(item.id, parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1.5 text-sm text-white bg-transparent outline-none text-center"
                            onFocus={e => (e.target.parentElement!.style.borderColor = '#76BC43')}
                            onBlur={e => (e.target.parentElement!.style.borderColor = '#2a4050')}
                          />
                          <span className="text-gray-500 text-xs pr-2">{item.unit}</span>
                        </div>
                        <button onClick={() => adjustStock(item.id, 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                          style={{ backgroundColor: '#76BC43' }}>
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                        <button onClick={() => handleDelete(item.id)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ml-1 ${deleteConfirm === item.id ? 'bg-red-500 scale-105' : 'hover:bg-red-500/20'}`}>
                          <Trash2 className={`w-3.5 h-3.5 ${deleteConfirm === item.id ? 'text-white' : 'text-red-400'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Add Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ backgroundColor: '#243a45' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Nuevo Ítem de Inventario</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Nombre</label>
                <input type="text" value={form.name} onChange={update('name')} placeholder="Ej: Plátanos"
                  required className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5">Unidad</label>
                  <select value={form.unit} onChange={update('unit')}
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none appearance-none cursor-pointer transition-all"
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                    <option value="">Seleccionar...</option>
                    {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5">Categoría</label>
                  <input type="text" value={form.category} onChange={update('category')} placeholder="Ej: Carnes"
                    className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all"
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5">Stock inicial</label>
                  <input type="number" value={form.stock} onChange={update('stock')} placeholder="0" min="0" step="0.5"
                    className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all"
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5">Stock mínimo</label>
                  <input type="number" value={form.minStock} onChange={update('minStock')} placeholder="0" min="0" step="0.5"
                    className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all"
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
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
