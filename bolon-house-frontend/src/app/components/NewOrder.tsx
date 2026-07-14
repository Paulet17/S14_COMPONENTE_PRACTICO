import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, Minus, X, ShoppingCart, Check, ArrowLeft, Banknote, Smartphone } from 'lucide-react';
import { MenuItem } from '../data/menu';
import { useMenuData } from '../hooks/useMenuData';
import { useOrders, PaymentMethod } from '../context/AppContext';

type CartItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customization: string;
};

type ModalState = {
  item: MenuItem;
  variants: Record<string, string>;
  qty: number;
};

export function NewOrder() {
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const menuCategories = useMenuData();

  const [activeCategory, setActiveCategory] = useState(menuCategories[0]?.id ?? '');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [modal, setModal] = useState<ModalState | null>(null);
  const [success, setSuccess] = useState(false);

  const currentCat = useMemo(() => menuCategories.find(c => c.id === activeCategory) ?? menuCategories[0], [activeCategory, menuCategories]);

  const displayItems = useMemo(() => {
    if (!currentCat) return [];
    if (!search) return currentCat.items;
    const q = search.toLowerCase();
    return menuCategories.flatMap(c => c.items).filter(i =>
      i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
    );
  }, [search, currentCat, menuCategories]);

  /*Suma todas las cantidades de todos los productos en el carrito */ 
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.price * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  const openModal = (item: MenuItem) => {
    if (item.variants?.length) {
      const defaults: Record<string, string> = {};
      item.variants.forEach(v => { defaults[v.label] = v.options[0]; });
      setModal({ item, variants: defaults, qty: 1 });
    } else {
      addToCart(item, {}, 1);
    }
  };

  const addToCart = (item: MenuItem, variants: Record<string, string>, qty: number) => {
    const customization = Object.entries(variants).map(([k, v]) => `${k}: ${v}`).join(', ');
    const cartId = `${item.id}__${customization}`;
    setCart(prev => {
      const existing = prev.find(ci => ci.id === cartId);
      if (existing) {
        return prev.map(ci => ci.id === cartId ? { ...ci, quantity: ci.quantity + qty } : ci);
      }
      return [...prev, { id: cartId, menuItemId: item.id, name: item.name, price: item.price, quantity: qty, customization }];
    });
    setModal(null);
  };

  /*Funcion para cambiar cantidad */
  const adjustQty = (id: string, delta: number) => {
    setCart(prev => prev.map(ci => ci.id === id ? { ...ci, quantity: Math.max(0, ci.quantity + delta) } : ci).filter(ci => ci.quantity > 0));
  };

  /*El campo "Precio unit." editable  */
  const updatePrice = (id: string, value: string) => {
    const parsed = parseFloat(value);
    setCart(prev => prev.map(ci => ci.id === id ? { ...ci, price: isNaN(parsed) || parsed < 0 ? ci.price : parsed } : ci));
  };

  const [orderError, setOrderError] = useState('');

  const handleSubmit = async () => {
    if (!cart.length || !customerName.trim()) return;
    setOrderError('');
    const creada = await addOrder({
      customerName: customerName.trim(),
      tableNumber: tableNumber ? parseInt(tableNumber) : undefined,
      items: cart.map(ci => ({ id: ci.id, menuItemId: ci.menuItemId, name: ci.name, price: ci.price, quantity: ci.quantity, customization: ci.customization })),
      total: Math.round(cartTotal * 100) / 100,
      status: 'pending',
      paymentMethod,
      notes,
    });
    if (!creada) {
      setOrderError('No se pudo crear el pedido. Intenta de nuevo.');
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate('/orders'), 1800);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl" style={{ backgroundColor: '#76BC43' }}>
          <Check className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-white text-2xl font-bold">¡Orden Creada!</h2>
        <p className="text-gray-400">Redirigiendo a órdenes...</p>
      </div>
    );
  }

  const inputClass = "w-full px-3 py-2.5 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all";
  const inputStyle = { backgroundColor: '#1C2E36', border: '1px solid #2a4050' };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = '#76BC43');
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = '#2a4050');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-white text-2xl font-bold">Nueva Orden</h1>
          <p className="text-gray-400 text-sm">Selecciona los productos del pedido</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT: Menu Browser */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar en el menú..."
              className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all"
              style={{ backgroundColor: '#243a45', border: '1px solid #2a4050' }}
              onFocus={e => (e.target.style.borderColor = '#76BC43')}
              onBlur={e => (e.target.style.borderColor = '#2a4050')}
            />
          </div>

          {/* Category Pills */}
          {!search && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {menuCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0"
                  style={activeCategory === cat.id
                    ? { backgroundColor: '#76BC43', color: '#1C2E36' }
                    : { backgroundColor: '#243a45', color: '#9ca3af' }
                  }
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Category label when searching */}
          {search && (
            <p className="text-gray-400 text-sm">
              {displayItems.length} resultado{displayItems.length !== 1 ? 's' : ''} para "<span className="text-white">{search}</span>"
            </p>
          )}

          {/* Items Grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            {displayItems.map(item => (
              <button
                key={item.id}
                onClick={() => openModal(item)}
                className="flex items-center justify-between p-4 rounded-xl text-left transition-all duration-200 hover:border-[#76BC43]/40 hover:scale-[1.01] active:scale-[0.99] group"
                style={{ backgroundColor: '#243a45', border: '1px solid #2a4050' }}
              >
                <div className="flex-1 min-w-0 pr-3">
                  <p className="text-white font-medium text-sm leading-snug">{item.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{item.description}</p>
                  {item.variants && (
                    <p className="text-gray-600 text-xs mt-0.5">
                      {item.variants.map(v => v.options.join('/')).join(' · ')}
                    </p>
                  )}
                  <p className="font-bold text-sm mt-1.5" style={{ color: '#76BC43' }}>${item.price.toFixed(2)}</p>
                </div>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105"
                  style={{ backgroundColor: '#76BC43' }}
                >
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </button>
            ))}
          </div>

          {displayItems.length === 0 && (
            <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: '#243a45' }}>
              <p className="text-gray-500">No se encontraron productos</p>
            </div>
          )}
        </div>

        {/* RIGHT: Order Cart */}
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: '#243a45' }}>
            <h3 className="text-white font-semibold">Datos del Pedido</h3>
            <div>
              <label className="block text-gray-500 text-xs mb-1.5 font-medium">Cliente *</label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Nombre del cliente"
                className={inputClass}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            <div>
              <label className="block text-gray-500 text-xs mb-1.5 font-medium">Mesa (opcional)</label>
              <input
                type="number"
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                placeholder="Nro. de mesa"
                min="1"
                max="20"
                className={inputClass}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
            <div>
              <label className="block text-gray-500 text-xs mb-1.5 font-medium">Método de pago</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'cash',     label: 'Efectivo',      icon: Banknote },
                  { value: 'transfer', label: 'Transferencia', icon: Smartphone },
                ] as { value: PaymentMethod; label: string; icon: typeof Banknote }[]).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPaymentMethod(value)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={paymentMethod === value
                      ? { backgroundColor: '#E9C040', color: '#1C2E36' }
                      : { backgroundColor: '#1C2E36', color: '#9ca3af', border: '1px solid #2a4050' }
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-500 text-xs mb-1.5 font-medium">Notas</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Instrucciones especiales..."
                rows={2}
                className={`${inputClass} resize-none`}
                style={inputStyle}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            </div>
          </div>

          {/* Cart */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#243a45' }}>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5" style={{ color: '#76BC43' }} />
              <h3 className="text-white font-semibold">Pedido</h3>
              {cartCount > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: '#76BC43', color: '#1C2E36' }}>
                  {cartCount}
                </span>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingCart className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Agrega productos al pedido</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(ci => (
                  <div key={ci.id} className="pb-3" style={{ borderBottom: '1px solid #2a4050' }}>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium leading-snug">{ci.name}</p>
                        {ci.customization && (
                          <p className="text-gray-500 text-xs mt-0.5">{ci.customization}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => adjustQty(ci.id, -1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                          style={{ backgroundColor: '#2a4050' }}
                        >
                          <Minus className="w-3 h-3 text-white" />
                        </button>
                        <span className="text-white text-sm w-6 text-center font-medium">{ci.quantity}</span>
                        <button
                          onClick={() => adjustQty(ci.id, 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                          style={{ backgroundColor: '#76BC43' }}
                        >
                          <Plus className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={() => setCart(prev => prev.filter(c => c.id !== ci.id))}
                          className="w-7 h-7 ml-0.5 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </div>
                    {/* Editable price row */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-500 text-xs">Precio unit.:</span>
                        <div className="flex items-center rounded-lg overflow-hidden" style={{ backgroundColor: '#1C2E36', border: '1px solid #2a4050' }}>
                          <span className="text-gray-500 text-xs pl-2">$</span>
                          <input
                            type="number"
                            value={ci.price}
                            min="0"
                            step="0.25"
                            onChange={e => updatePrice(ci.id, e.target.value)}
                            className="w-16 px-1.5 py-1 text-xs text-white bg-transparent outline-none"
                            onFocus={e => (e.target.parentElement!.style.borderColor = '#E9C040')}
                            onBlur={e => {
                              e.target.parentElement!.style.borderColor = '#2a4050';
                              if (!e.target.value || parseFloat(e.target.value) < 0) updatePrice(ci.id, '0');
                            }}
                          />
                        </div>
                      </div>
                      <span className="font-semibold text-sm" style={{ color: '#76BC43' }}>
                        = ${(ci.price * ci.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-1">
                  <span className="text-white font-semibold">Total</span>
                  <span className="font-bold text-xl" style={{ color: '#E9C040' }}>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {orderError && (
            <p className="text-sm rounded-xl px-3 py-2" style={{ backgroundColor: '#3d1a1a', color: '#f87171' }}>{orderError}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!cart.length || !customerName.trim()}
            className="w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: '#76BC43', color: '#1C2E36' }}
          >
            <Check className="w-5 h-5" />
            Confirmar Orden {cartTotal > 0 && `· $${cartTotal.toFixed(2)}`}
          </button>
        </div>
      </div>

      {/* Variant Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ backgroundColor: '#243a45' }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white font-bold">{modal.item.name}</p>
                <p className="text-gray-400 text-sm mt-0.5">{modal.item.description}</p>
              </div>
              <button onClick={() => setModal(null)} className="text-gray-500 hover:text-white transition-colors ml-3">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {modal.item.variants?.map(variant => (
                <div key={variant.label}>
                  <label className="block text-gray-400 text-sm font-medium mb-2">{variant.label}</label>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setModal(m => m ? { ...m, variants: { ...m.variants, [variant.label]: opt } } : null)}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={modal.variants[variant.label] === opt
                          ? { backgroundColor: '#76BC43', color: '#1C2E36' }
                          : { backgroundColor: '#1C2E36', color: '#9ca3af', border: '1px solid #2a4050' }
                        }
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Cantidad</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setModal(m => m ? { ...m, qty: Math.max(1, m.qty - 1) } : null)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#1C2E36' }}
                  >
                    <Minus className="w-4 h-4 text-white" />
                  </button>
                  <span className="text-white text-xl font-bold w-8 text-center">{modal.qty}</span>
                  <button
                    onClick={() => setModal(m => m ? { ...m, qty: m.qty + 1 } : null)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#76BC43' }}
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: '1px solid #2a4050' }}>
              <p className="text-white font-bold text-lg">${(modal.item.price * modal.qty).toFixed(2)}</p>
              <button
                onClick={() => addToCart(modal.item, modal.variants, modal.qty)}
                className="px-6 py-2.5 rounded-xl font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#76BC43', color: '#1C2E36' }}
              >
                Agregar al pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}