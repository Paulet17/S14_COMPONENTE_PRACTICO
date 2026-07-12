import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router';
import { ChefHat, Eye, EyeOff, AlertCircle, Leaf } from 'lucide-react';
import { useAuth, UserRole } from '../context/AppContext';

export function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'employee' as UserRole });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Por favor ingresa tu nombre'); return; }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return; }
    setLoading(true);
    const success = await register(form.name.trim(), form.email, form.password, form.role);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Este correo ya está registrado');
    }
    setLoading(false);
  };

  const inputStyle = {
    backgroundColor: '#1C2E36',
    border: '1px solid #2a4050',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = '#76BC43');
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = '#2a4050');

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#1C2E36' }}>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-lg" style={{ backgroundColor: '#76BC43' }}>
            <ChefHat className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">MuchoPlatano</h1>
          <p className="text-sm" style={{ color: '#76BC43' }}>Desayunos & Sabor</p>
        </div>

        <div className="rounded-3xl p-8 shadow-2xl" style={{ backgroundColor: '#243a45' }}>
          <div className="flex items-center gap-2 mb-1">
            <Leaf className="w-4 h-4" style={{ color: '#76BC43' }} />
            <p className="text-xs font-medium" style={{ color: '#76BC43' }}>ÚNETE AL EQUIPO</p>
          </div>
          <h2 className="text-white text-2xl font-bold mb-6">Crear Cuenta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Nombre completo</label>
              <input
                type="text"
                value={form.name}
                onChange={update('name')}
                placeholder="Tu nombre completo"
                required
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Correo electrónico</label>
              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                placeholder="correo@ejemplo.com"
                required
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={update('password')}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-600 outline-none transition-all"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Confirmar contraseña</label>
              <input
                type="password"
                value={form.confirm}
                onChange={update('confirm')}
                placeholder="Repite tu contraseña"
                required
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Rol en el local</label>
              <select
                value={form.role}
                onChange={update('role')}
                className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all appearance-none cursor-pointer"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="employee">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-xl" style={{ backgroundColor: '#ff444420', color: '#ff6666' }}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold transition-all duration-200 hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ backgroundColor: '#76BC43', color: '#1C2E36' }}
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="text-gray-400 text-sm text-center mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: '#76BC43' }} className="font-medium hover:opacity-80 transition-opacity">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
