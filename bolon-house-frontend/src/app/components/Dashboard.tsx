import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, DollarSign, Clock, UtensilsCrossed, Plus, BookOpen, TrendingUp, ArrowRight, Banknote, Smartphone } from 'lucide-react';
import { useAuth, useOrders } from '../context/AppContext';
import { menuCategories } from '../data/menu';

const totalMenuItems = menuCategories.reduce((acc, cat) => acc + cat.items.length, 0);

const STATUS_COLORS: Record<string, string> = {
  pending: '#E9C040',
  preparing: '#f97316',
  ready: '#76BC43',
  delivered: '#6b7280',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
};

function getWeeklyData(orders: ReturnType<typeof useOrders>['orders']) {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === date.toDateString());
    return {
      name: `day-${i}`,
      day: dayNames[date.getDay()],
      ingresos: Math.round(dayOrders.reduce((s, o) => s + o.total, 0) * 100) / 100,
      ordenes: dayOrders.length,
    };
  });
}

export function Dashboard() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();

  const todayStr = new Date().toDateString();
  const todayOrders = useMemo(() => orders.filter(o => new Date(o.createdAt).toDateString() === todayStr), [orders, todayStr]);
  const todayRevenue = useMemo(() => todayOrders.reduce((s, o) => s + o.total, 0), [todayOrders]);
  const weeklyRevenue = useMemo(() => getWeeklyData(orders).reduce((s, d) => s + d.ingresos, 0), [orders]);
  const activeOrders = useMemo(() => orders.filter(o => o.status === 'pending' || o.status === 'preparing').length, [orders]);
  const weeklyData = useMemo(() => getWeeklyData(orders), [orders]);
  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);

  const topItemsToday = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; total: number }>();
    todayOrders.forEach(order => {
      order.items.forEach(item => {
        const prev = map.get(item.name) ?? { name: item.name, qty: 0, total: 0 };
        map.set(item.name, { name: item.name, qty: prev.qty + item.quantity, total: prev.total + item.price * item.quantity });
      });
    });
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty).slice(0, 6);
  }, [todayOrders]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const stats = [
    { label: 'Órdenes Hoy',      value: todayOrders.length.toString(),  icon: ShoppingBag,    accent: '#76BC43' },
    { label: 'Ingresos Hoy',     value: `$${todayRevenue.toFixed(2)}`,  icon: DollarSign,     accent: '#E9C040' },
    { label: 'Ingresos Semana',  value: `$${weeklyRevenue.toFixed(2)}`, icon: TrendingUp,     accent: '#f97316' },
    { label: 'Items en Menú',    value: totalMenuItems.toString(),       icon: UtensilsCrossed,accent: '#a78bfa' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">{greeting()}, {user?.name?.split(' ')[0]}! </h1>
          <p className="text-gray-400 text-sm mt-0.5 capitalize">
            {new Date().toLocaleDateString('es-EC', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="rounded-2xl p-5" style={{ backgroundColor: '#243a45' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">{label}</p>
                <p className="text-white text-2xl font-bold mt-1">{value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}18` }}>
                <Icon className="w-5 h-5" style={{ color: accent }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart — full width for admin, 3/5 for employee */}
      <div className={user?.role === 'admin' ? '' : 'grid lg:grid-cols-5 gap-4'}>
        <div className={`${user?.role === 'admin' ? '' : 'lg:col-span-3'} rounded-2xl p-6`} style={{ backgroundColor: '#243a45' }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5" style={{ color: '#76BC43' }} />
            <h3 className="text-white font-semibold">Ingresos de la Semana</h3>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={weeklyData} barSize={26} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a4050" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1C2E36', border: '1px solid #2a4050', borderRadius: '12px', color: '#fff', fontSize: 13 }}
                formatter={(v: number) => [`$${v.toFixed(2)}`, 'Ingresos']}
                cursor={{ fill: '#76BC4310' }}
              />
              <Bar dataKey="ingresos" fill="#76BC43" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions — employee only */}
        {user?.role !== 'admin' && (
          <div className="lg:col-span-2 rounded-2xl p-6" style={{ backgroundColor: '#243a45' }}>
            <h3 className="text-white font-semibold mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/orders/new')}
                className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:opacity-90 text-left"
                style={{ backgroundColor: '#76BC43' }}
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Nueva Orden</p>
                  <p className="text-white/70 text-xs">Crear nuevo pedido</p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/60 ml-auto" />
              </button>
              <button
                onClick={() => navigate('/menu')}
                className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-[#2a4050] text-left border"
                style={{ borderColor: '#2a4050' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#E9C04018' }}>
                  <BookOpen className="w-5 h-5" style={{ color: '#E9C040' }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Ver Menú</p>
                  <p className="text-gray-400 text-xs">{totalMenuItems} productos</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 ml-auto" />
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-[#2a4050] text-left border"
                style={{ borderColor: '#2a4050' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#f9731618' }}>
                  <Clock className="w-5 h-5" style={{ color: '#f97316' }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Órdenes Activas</p>
                  <p className="text-gray-400 text-xs">{activeOrders} en proceso</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 ml-auto" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Orders — employee only */}
      {user?.role !== 'admin' && (
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#243a45' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Órdenes Recientes</h3>
            <button
              onClick={() => navigate('/orders')}
              className="text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity"
              style={{ color: '#76BC43' }}
            >
              Ver todas <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr style={{ borderBottom: '1px solid #2a4050' }}>
                  {['#', 'Cliente', 'Mesa', 'Items', 'Total', 'Estado'].map(h => (
                    <th key={h} className="pb-3 text-left text-gray-500 text-xs font-medium uppercase tracking-wide pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #2a405050' }}>
                    <td className="py-3 pr-4 text-white text-sm font-medium">#{order.orderNumber}</td>
                    <td className="py-3 pr-4 text-white text-sm">{order.customerName}</td>
                    <td className="py-3 pr-4 text-gray-400 text-sm">{order.tableNumber ?? '—'}</td>
                    <td className="py-3 pr-4 text-gray-400 text-sm">{order.items.length} ítem{order.items.length !== 1 ? 's' : ''}</td>
                    <td className="py-3 pr-4 font-semibold text-sm" style={{ color: '#E9C040' }}>${order.total.toFixed(2)}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${STATUS_COLORS[order.status]}18`, color: STATUS_COLORS[order.status] }}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabla de últimas ventas + Top productos — admin only */}
      {user?.role === 'admin' && (
        <div className="grid xl:grid-cols-3 gap-4">
          {/* Últimas ventas — takes 2/3 */}
          <div className="xl:col-span-2 rounded-2xl p-6" style={{ backgroundColor: '#243a45' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold">Últimas Ventas</h3>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: '#76BC4318', color: '#76BC43' }}>
                {orders.length} ventas en total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a4050' }}>
                    {['#', 'Cliente', 'Productos', 'Pago', 'Total', 'Fecha'].map(h => (
                      <th key={h} className="pb-3 text-left text-gray-500 text-xs font-medium uppercase tracking-wide pr-4 last:pr-0">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map(order => {
                    const PayIcon = order.paymentMethod === 'cash' ? Banknote : Smartphone;
                    const payColor = order.paymentMethod === 'cash' ? '#76BC43' : '#60a5fa';
                    const payLabel = order.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia';
                    return (
                      <tr key={order.id} className="hover:bg-[#2a4050]/30 transition-colors" style={{ borderBottom: '1px solid #2a405040' }}>
                        <td className="py-3 pr-4 text-white text-sm font-bold">#{order.orderNumber}</td>
                        <td className="py-3 pr-4">
                          <p className="text-white text-sm">{order.customerName}</p>
                          {order.tableNumber && <p className="text-gray-500 text-xs">Mesa {order.tableNumber}</p>}
                        </td>
                        <td className="py-3 pr-4">
                          <p className="text-gray-300 text-xs max-w-[160px]">
                            {order.items.slice(0, 2).map((it, i) => (
                              <span key={`${order.id}-item-${i}`}>{i > 0 && ', '}{it.quantity}× {it.name}</span>
                            ))}
                            {order.items.length > 2 && <span className="text-gray-500"> +{order.items.length - 2}</span>}
                          </p>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="flex items-center gap-1 text-xs font-medium w-fit px-2 py-1 rounded-full"
                            style={{ backgroundColor: `${payColor}18`, color: payColor }}>
                            <PayIcon className="w-3 h-3" />{payLabel}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-bold text-sm" style={{ color: '#E9C040' }}>${order.total.toFixed(2)}</td>
                        <td className="py-3 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' })}
                          {' '}
                          {new Date(order.createdAt).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Más vendidos hoy — takes 1/3 */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#243a45' }}>
            <div className="flex items-center gap-2 mb-5">
              <ShoppingBag className="w-5 h-5" style={{ color: '#E9C040' }} />
              <h3 className="text-white font-semibold">Más Vendidos Hoy</h3>
            </div>

            {topItemsToday.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ShoppingBag className="w-10 h-10 text-gray-700 mb-2" />
                <p className="text-gray-500 text-sm">Sin ventas registradas hoy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topItemsToday.map((item, idx) => {
                  const maxQty = topItemsToday[0].qty;
                  const pct = Math.round((item.qty / maxQty) * 100);
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm shrink-0">{medals[idx] ?? `${idx + 1}.`}</span>
                          <p className="text-white text-xs font-medium truncate">{item.name}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-xs font-bold" style={{ color: '#76BC43' }}>{item.qty} uds.</span>
                          <span className="text-xs" style={{ color: '#E9C040' }}>${item.total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ backgroundColor: '#2a4050' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: idx === 0 ? '#E9C040' : idx === 1 ? '#76BC43' : '#60a5fa' }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: '1px solid #2a4050' }}>
                  <span className="text-gray-400 text-xs">Total vendido hoy</span>
                  <span className="font-bold text-sm" style={{ color: '#E9C040' }}>${todayRevenue.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
