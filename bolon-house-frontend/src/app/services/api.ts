const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken(): string | null {
  return localStorage.getItem('bolonhouse_token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.mensaje || 'Error en la solicitud al servidor');
  }
  return data;
}

// ---- Auth ----
export const api = {
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (nombre: string, email: string, password: string, rol: string) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ nombre, email, password, rol }) }),

  me: () => request('/auth/me'),

  listarUsuarios: () => request('/auth/usuarios'),

  actualizarUsuario: (id: string, cambios: Record<string, unknown>) =>
    request(`/auth/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(cambios) }),

  eliminarUsuario: (id: string) => request(`/auth/usuarios/${id}`, { method: 'DELETE' }),

  // ---- Productos ----
  listarProductos: () => request('/productos'),

  crearProducto: (producto: Record<string, unknown>) =>
    request('/productos', { method: 'POST', body: JSON.stringify(producto) }),

  actualizarProducto: (id: string, cambios: Record<string, unknown>) =>
    request(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(cambios) }),

  eliminarProducto: (id: string) => request(`/productos/${id}`, { method: 'DELETE' }),

  // ---- Pedidos ----
  listarPedidos: () => request('/pedidos'),

  crearPedido: (pedido: Record<string, unknown>) =>
    request('/pedidos', { method: 'POST', body: JSON.stringify(pedido) }),

  actualizarPedido: (id: string, cambios: Record<string, unknown>) =>
    request(`/pedidos/${id}`, { method: 'PUT', body: JSON.stringify(cambios) }),

  eliminarPedido: (id: string) => request(`/pedidos/${id}`, { method: 'DELETE' }),

  // ---- Inventario ----
  listarInventario: () => request('/inventario'),

  crearInsumo: (insumo: Record<string, unknown>) =>
    request('/inventario', { method: 'POST', body: JSON.stringify(insumo) }),

  actualizarInsumo: (id: string, cambios: Record<string, unknown>) =>
    request(`/inventario/${id}`, { method: 'PUT', body: JSON.stringify(cambios) }),

  eliminarInsumo: (id: string) => request(`/inventario/${id}`, { method: 'DELETE' }),
};

export function guardarToken(token: string) {
  localStorage.setItem('bolonhouse_token', token);
}

export function borrarToken() {
  localStorage.removeItem('bolonhouse_token');
}

export { getToken };
