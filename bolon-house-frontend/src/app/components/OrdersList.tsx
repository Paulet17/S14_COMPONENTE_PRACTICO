import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, Clock, CheckCircle, Package, Truck, Trash2, Filter, Plus, ChevronDown, Banknote, Smartphone } from 'lucide-react';
import { useOrders, Order, OrderStatus, PaymentMethod } from '../context/AppContext';

const PAYMENT_CONFIG: Record<PaymentMethod, { label: string; icon: typeof Banknote; color: string }> = {
  cash:     { label: 'Efectivo',      icon: Banknote,   color: '#76BC43' },
  transfer: { label: 'Transferencia', icon: Smartphone, color: '#60a5fa' },
};

/*Diccionario de configuración para los estados del pedido */
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendiente', color: '#E9C040', icon: Clock },
  preparing: { label: 'Preparando', color: '#f97316', icon: Package },
  ready: { label: 'Listo', color: '#76BC43', icon: CheckCircle },
  delivered: { label: 'Entregado', color: '#6b7280', icon: Truck },
};

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'delivered',
  delivered: null,
};

const NEXT_LABEL: Record<OrderStatus, string> = {
  pending: 'Iniciar',
  preparing: 'Listo',
  ready: 'Entregar',
  delivered: '',
};

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
}

/*Compara la fecha de la orden con la de hoy */
function formatDate(date: Date) {
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return `Hoy ${formatTime(date)}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Ayer ${formatTime(date)}`;
  return d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' }) + ' ' + formatTime(date);
}

export function OrdersList() {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const counts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }), [orders]);

  const filtered = useMemo(() => orders
    .filter(o => activeFilter === 'all' || o.status === activeFilter)
    .filter(o => !search ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toString().includes(search)
    ), [orders, activeFilter, search]);

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      deleteOrder(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold">Órdenes</h1>
          <p className="text-gray-400 text-sm">{orders.length} órdenes en total</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'pending', 'preparing', 'ready', 'delivered'] as const).map(status => {
          const cfg = status !== 'all' ? STATUS_CONFIG[status] : null;
          const label = status === 'all' ? 'Todas' : cfg!.label;
          const count = counts[status];
          const isActive = activeFilter === status;
          return (
            <button
              key={status}
              onClick={() => setActiveFilter(status)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0"
              style={isActive
                ? { backgroundColor: cfg?.color || '#76BC43', color: isActive && status === 'delivered' ? '#fff' : '#1C2E36' }
                : { backgroundColor: '#243a45', color: '#9ca3af' }
              }
            >
              {label}
              <span
                className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: isActive ? 'inherit' : '#6b7280' }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por cliente o número de orden..."
          className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all"
          style={{ backgroundColor: '#243a45', border: '1px solid #2a4050' }}
          onFocus={e => (e.target.style.borderColor = '#76BC43')}
          onBlur={e => (e.target.style.borderColor = '#2a4050')}
        />
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ backgroundColor: '#243a45' }}>
          <Filter className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No hay órdenes</p>
          <p className="text-gray-600 text-sm mt-1">
            {search ? `Sin resultados para "${search}"` : 'No hay órdenes en esta categoría'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const cfg = STATUS_CONFIG[order.status];
            const StatusIcon = cfg.icon;
            const next = NEXT_STATUS[order.status];
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="rounded-2xl overflow-hidden transition-all duration-200"
                style={{ backgroundColor: '#243a45' }}
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-5">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-white font-bold">#{order.orderNumber}</span>
                      <span className="text-white font-medium">{order.customerName}</span>
                      {order.tableNumber && (
                        <span className="px-2 py-0.5 rounded-md text-xs" style={{ backgroundColor: '#2a4050', color: '#9ca3af' }}>
                          Mesa {order.tableNumber}
                        </span>
                      )}
                      <span
                        className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${cfg.color}18`, color: cfg.color }}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm truncate">
                      {order.items.slice(0, 2).map((item, i) => (
                        <span key={item.id}>{i > 0 && ', '}{item.quantity}× {item.name}</span>
                      ))}
                      {order.items.length > 2 && <span className="text-gray-500"> +{order.items.length - 2} más</span>}
                    </p>


                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="font-bold text-sm" style={{ color: '#E9C040' }}>${order.total.toFixed(2)}</span>
                      {(() => {
                        /*el método de pago (efectivo/transferencia). */
                        const pm = PAYMENT_CONFIG[order.paymentMethod] ?? PAYMENT_CONFIG['cash'];
                        const Icon = pm.icon;
                        return (
                          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${pm.color}18`, color: pm.color }}>
                            <Icon className="w-3 h-3" />{pm.label}
                          </span>
                        );
                      })()}
                      <span className="text-gray-600 text-xs">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-[#2a4050]"
                    >
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {next && (
                      <button
                        onClick={() => updateOrderStatus(order.id, next)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                        style={{ backgroundColor: cfg.color, color: order.status === 'delivered' ? '#fff' : '#1C2E36' }}
                      >
                        {NEXT_LABEL[order.status]}
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(order.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        deleteConfirm === order.id ? 'bg-red-500 scale-105' : 'hover:bg-red-500/20'
                      }`}
                    >
                      <Trash2 className={`w-4 h-4 ${deleteConfirm === order.id ? 'text-white' : 'text-red-400'}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-5 pb-5" style={{ borderTop: '1px solid #2a4050' }}>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mt-4 mb-3">Detalle del pedido</p>
                    <div className="space-y-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2 min-w-0">
                            <span
                              className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                              style={{ backgroundColor: '#76BC4320', color: '#76BC43' }}
                            >
                              {item.quantity}
                            </span>
                            <div className="min-w-0">
                              <p className="text-white text-sm">{item.name}</p>
                              {item.customization && (
                                <p className="text-gray-500 text-xs">{item.customization}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-gray-400 text-sm shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: '#1C2E36' }}>
                        <p className="text-gray-500 text-xs font-medium mb-0.5">Nota:</p>
                        <p className="text-gray-400 text-sm italic">{order.notes}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: '1px solid #2a4050' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Total</span>
                        {(() => {
                          const pm = PAYMENT_CONFIG[order.paymentMethod] ?? PAYMENT_CONFIG['cash'];
                          const Icon = pm.icon;
                          return (
                            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${pm.color}18`, color: pm.color }}>
                              <Icon className="w-3 h-3" />{pm.label}
                            </span>
                          );
                        })()}
                      </div>
                      <span className="font-bold text-lg" style={{ color: '#E9C040' }}>${order.total.toFixed(2)}</span>
                    </div>

                    {/* Status Progress */}
                    <div className="mt-4">
                      <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-3">Estado del pedido</p>
                      <div className="flex items-center gap-2">
                        {(['pending', 'preparing', 'ready', 'delivered'] as OrderStatus[]).map((s, i, arr) => {
                          const statuses: OrderStatus[] = ['pending', 'preparing', 'ready', 'delivered'];
                          const currentIdx = statuses.indexOf(order.status);
                          const thisIdx = statuses.indexOf(s);
                          const isDone = thisIdx <= currentIdx;
                          const cfg2 = STATUS_CONFIG[s];
                          return (
                            <div key={s} className="flex items-center gap-2 flex-1">
                              <div className="flex flex-col items-center gap-1">
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                  style={{
                                    backgroundColor: isDone ? cfg2.color : '#2a4050',
                                    color: isDone ? '#1C2E36' : '#6b7280'
                                  }}
                                >
                                  {thisIdx < currentIdx ? '✓' : i + 1}
                                </div>
                                <p className="text-xs whitespace-nowrap" style={{ color: isDone ? cfg2.color : '#6b7280' }}>
                                  {cfg2.label}
                                </p>
                              </div>
                              {i < arr.length - 1 && (
                                <div
                                  className="h-0.5 flex-1 mb-4"
                                  style={{ backgroundColor: thisIdx < currentIdx ? '#76BC43' : '#2a4050' }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
