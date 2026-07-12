import { useState } from 'react';
import { Users, Plus, Trash2, Shield, UserCheck, Eye, EyeOff, AlertCircle, X } from 'lucide-react';
import { useAuth, UserRole } from '../context/AppContext';

const ROLE_CONFIG: Record<UserRole, { label: string; color: string }> = {
  admin:    { label: 'Administrador', color: '#E9C040' },
  employee: { label: 'Empleado',      color: '#76BC43' },
};

type NewUserForm = { name: string; email: string; password: string; role: UserRole };

const emptyForm: NewUserForm = { name: '', email: '', password: '', role: 'employee' };

export function ManageUsers() {
  const { user: currentUser, users, addUser, updateUserRole, deleteUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewUserForm>(emptyForm);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const update = (field: keyof NewUserForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('La contraseña debe tener mínimo 6 caracteres'); return; }
    setLoading(true);
    const ok = await addUser(form.name.trim(), form.email, form.password, form.role);
    if (ok) { setShowModal(false); setForm(emptyForm); }
    else setError('Este correo ya está registrado');
    setLoading(false);
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) { deleteUser(id); setDeleteConfirm(null); }
    else { setDeleteConfirm(id); setTimeout(() => setDeleteConfirm(null), 3000); }
  };

  const inputStyle = { backgroundColor: '#1C2E36', border: '1px solid #2a4050' };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = '#76BC43');
  const onBlur  = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => (e.target.style.borderColor = '#2a4050');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" style={{ color: '#E9C040' }} />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{users.length} usuarios registrados</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setForm(emptyForm); setError(''); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 self-start sm:self-auto"
          style={{ backgroundColor: '#76BC43', color: '#1C2E36' }}
        >
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#243a45' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr style={{ borderBottom: '1px solid #2a4050' }}>
                {['Usuario', 'Correo', 'Rol', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-gray-500 text-xs font-medium uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const roleCfg = ROLE_CONFIG[u.role];
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="transition-colors hover:bg-[#2a4050]/40" style={{ borderBottom: '1px solid #2a405050' }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm"
                          style={{ backgroundColor: `${roleCfg.color}20`, color: roleCfg.color }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{u.name}</p>
                          {isSelf && <p className="text-xs" style={{ color: '#76BC43' }}>Tú</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-sm">{u.email}</td>
                    <td className="px-5 py-4">
                      {isSelf ? (
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: `${roleCfg.color}20`, color: roleCfg.color }}
                        >
                          {roleCfg.label}
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={e => updateUserRole(u.id, e.target.value as UserRole)}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium outline-none cursor-pointer transition-all"
                          style={{ backgroundColor: `${roleCfg.color}20`, color: roleCfg.color, border: `1px solid ${roleCfg.color}40` }}
                        >
                          <option value="employee">Empleado</option>
                          <option value="admin">Administrador</option>
                        </select>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {!isSelf && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            deleteConfirm === u.id ? 'bg-red-500 scale-105' : 'hover:bg-red-500/20'
                          }`}
                          title={deleteConfirm === u.id ? 'Confirmar eliminación' : 'Eliminar usuario'}
                        >
                          <Trash2 className={`w-4 h-4 ${deleteConfirm === u.id ? 'text-white' : 'text-red-400'}`} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Legend */}
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { role: 'admin' as UserRole, icon: Shield, desc: 'Acceso completo: usuarios, productos, inventario y órdenes.' },
          { role: 'employee' as UserRole, icon: UserCheck, desc: 'Puede crear órdenes y actualizar su estado.' },
        ].map(({ role, icon: Icon, desc }) => {
          const cfg = ROLE_CONFIG[role];
          return (
            <div key={role} className="rounded-xl p-4 flex gap-3" style={{ backgroundColor: '#243a45', border: '1px solid #2a4050' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${cfg.color}20` }}>
                <Icon className="w-5 h-5" style={{ color: cfg.color }} />
              </div>
              <div>
                <p className="text-white font-medium text-sm">{cfg.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ backgroundColor: '#243a45' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Nuevo Usuario</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Nombre completo</label>
                <input type="text" value={form.name} onChange={update('name')} placeholder="Nombre del usuario"
                  required className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Correo electrónico</label>
                <input type="email" value={form.email} onChange={update('email')} placeholder="correo@ejemplo.com"
                  required className="w-full px-4 py-2.5 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Contraseña</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')}
                    placeholder="Mínimo 6 caracteres" required
                    className="w-full px-4 py-2.5 pr-10 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all"
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Rol</label>
                <select value={form.role} onChange={update('role')}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none appearance-none cursor-pointer transition-all"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
                  <option value="employee">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl" style={{ backgroundColor: '#ff444420', color: '#ff6666' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
                  style={{ backgroundColor: '#2a4050', color: '#9ca3af' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#76BC43', color: '#1C2E36' }}>
                  {loading ? 'Guardando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
