import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, guardarToken, borrarToken, getToken } from '../services/api';

export type UserRole = 'admin' | 'employee';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type OrderItem = {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customization: string;
};

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered';

export type PaymentMethod = 'cash' | 'transfer';

export type Order = {
  id: string;
  orderNumber: number;
  customerName: string;
  tableNumber?: number;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  notes: string;
  createdAt: Date;
};

// --- Adaptadores entre el modelo en espanol del backend y los tipos del diseno ---

const rolBackendARole = (rol: string): UserRole => (rol === 'admin' ? 'admin' : 'employee');
const roleAFrontendRol = (role: UserRole): string => (role === 'admin' ? 'admin' : 'mesero');

const usuarioBackendAUser = (u: any): User => ({
  id: u._id,
  name: u.nombre,
  email: u.email,
  role: rolBackendARole(u.rol),
});

const estadoAStatus: Record<string, OrderStatus> = {
  pendiente: 'pending',
  en_proceso: 'preparing',
  listo: 'ready',
  completado: 'delivered',
  cancelado: 'delivered',
};
const statusAEstado: Record<OrderStatus, string> = {
  pending: 'pendiente',
  preparing: 'en_proceso',
  ready: 'listo',
  delivered: 'completado',
};
const metodoAPaymentMethod: Record<string, PaymentMethod> = {
  efectivo: 'cash',
  transferencia: 'transfer',
};
const paymentMethodAMetodo: Record<PaymentMethod, string> = {
  cash: 'efectivo',
  transfer: 'transferencia',
};

const pedidoBackendAOrder = (p: any): Order => ({
  id: p._id,
  orderNumber: p.numero,
  customerName: p.cliente || 'Consumidor final',
  tableNumber: p.mesa ? Number(p.mesa) || undefined : undefined,
  items: (p.items || []).map((it: any) => ({
    id: it.producto,
    menuItemId: it.producto,
    name: it.nombre,
    price: it.precioUnitario,
    quantity: it.cantidad,
    customization: it.personalizacion || '',
  })),
  total: p.total,
  status: estadoAStatus[p.estado] || 'pending',
  paymentMethod: metodoAPaymentMethod[p.metodoPago] || 'cash',
  notes: p.notas || '',
  createdAt: new Date(p.createdAt),
});

type AuthContextType = {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  addUser: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  updateUserRole: (id: string, role: UserRole) => void;
  deleteUser: (id: string) => void;
};

type OrdersContextType = {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);
const OrdersContext = createContext<OrdersContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [checkedSession, setCheckedSession] = useState(false);

  // Al cargar la app, si hay un token guardado, valida la sesion contra el backend
  useEffect(() => {
    const restaurarSesion = async () => {
      const token = getToken();
      if (!token) {
        setCheckedSession(true);
        return;
      }
      try {
        const usuario = await api.me();
        setUser(usuarioBackendAUser(usuario));
      } catch {
        borrarToken();
      } finally {
        setCheckedSession(true);
      }
    };
    restaurarSesion();
  }, []);

  const cargarPedidos = useCallback(async () => {
    try {
      const data = await api.listarPedidos();
      setOrders(data.map(pedidoBackendAOrder));
    } catch {
      // si falla (ej. sin token todavia) simplemente no carga
    }
  }, []);

  const cargarUsuarios = useCallback(async () => {
    try {
      const data = await api.listarUsuarios();
      setUsers(data.map(usuarioBackendAUser));
    } catch {
      // solo el admin puede listar usuarios, ignorar error para otros roles
    }
  }, []);

  useEffect(() => {
    if (user) {
      cargarPedidos();
      if (user.role === 'admin') cargarUsuarios();
    }
  }, [user, cargarPedidos, cargarUsuarios]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.login(email, password);
      guardarToken(data.token);
      setUser(usuarioBackendAUser({ ...data, rol: data.rol }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    borrarToken();
    setUser(null);
    setOrders([]);
    setUsers([]);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
      try {
        const data = await api.register(name, email, password, roleAFrontendRol(role));
        guardarToken(data.token);
        setUser(usuarioBackendAUser({ ...data, rol: data.rol }));
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const addUser = useCallback(
    async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
      try {
        // Se crea la cuenta sin afectar la sesion del admin actual
        const tokenActual = getToken();
        await api.register(name, email, password, roleAFrontendRol(role));
        if (tokenActual) guardarToken(tokenActual);
        await cargarUsuarios();
        return true;
      } catch {
        return false;
      }
    },
    [cargarUsuarios]
  );

  const updateUserRole = useCallback((id: string, role: UserRole) => {
    api
      .actualizarUsuario(id, { rol: roleAFrontendRol(role) })
      .then(() => setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u))))
      .catch(() => {});
  }, []);

  const deleteUser = useCallback((id: string) => {
    api
      .eliminarUsuario(id)
      .then(() => setUsers((prev) => prev.filter((u) => u.id !== id)))
      .catch(() => {});
  }, []);

  const addOrder = useCallback(async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
    try {
      const payload = {
        items: orderData.items.map((it) => ({
          producto: it.menuItemId,
          cantidad: it.quantity,
          personalizacion: it.customization,
        })),
        cliente: orderData.customerName,
        mesa: orderData.tableNumber ? String(orderData.tableNumber) : '',
        notas: orderData.notes,
        metodoPago: paymentMethodAMetodo[orderData.paymentMethod],
      };
      const creado = await api.crearPedido(payload);
      const nuevaOrden = pedidoBackendAOrder(creado);
      setOrders((prev) => [nuevaOrden, ...prev]);
      return nuevaOrden;
    } catch {
      return null;
    }
  }, []);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    api
      .actualizarPedido(id, { estado: statusAEstado[status] })
      .then(() => setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o))))
      .catch(() => {});
  }, []);

  const deleteOrder = useCallback((id: string) => {
    api
      .eliminarPedido(id)
      .then(() => setOrders((prev) => prev.filter((o) => o.id !== id)))
      .catch(() => {});
  }, []);

  if (!checkedSession) return null;

  return (
    <AuthContext.Provider
      value={{ user, users, isAuthenticated: !!user, login, logout, register, addUser, updateUserRole, deleteUser }}
    >
      <OrdersContext.Provider value={{ orders, addOrder, updateOrderStatus, deleteOrder }}>
        {children}
      </OrdersContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AppProvider');
  return ctx;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within AppProvider');
  return ctx;
}
