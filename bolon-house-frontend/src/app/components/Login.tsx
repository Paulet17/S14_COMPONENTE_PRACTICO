import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { Eye, EyeOff, AlertCircle, Leaf } from 'lucide-react';
import { useAuth } from '../context/AppContext';
import logoMP from '../../imports/logoMP.png';



export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Correo o contraseña incorrectos');
    }
    setLoading(false);
  };



  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#1C2E36' }}>
      {/* Left panel with logo */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ backgroundColor: '#152028' }}
      >
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: '#76BC43' }} />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-10" style={{ backgroundColor: '#E9C040' }} />
       <div className="relative z-10 flex flex-col items-center justify-center">
          <img src={logoMP} alt="MuchoPlatano Logo" className="w-72 h-72 object-contain drop-shadow-2xl" />
          <h1 className="text-white text-3xl font-bold mt-4">MuchoPlatano</h1>
          <p className="text-base" style={{ color: '#76BC43' }}>Desayunos & Sabor</p>
      </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img src={logoMP} alt="MuchoPlatano Logo" className="w-24 h-24 object-contain mb-2" />
            <h1 className="text-white text-2xl font-bold">MuchoPlatano</h1>
            <p className="text-sm" style={{ color: '#76BC43' }}>Desayunos & Sabor</p>
          </div>

          <div className="rounded-3xl p-8 shadow-2xl" style={{ backgroundColor: '#243a45' }}>
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-4 h-4" style={{ color: '#76BC43' }} />
              <p className="text-xs font-medium" style={{ color: '#76BC43' }}>BIENVENIDO DE VUELTA</p>
            </div>
            <h2 className="text-white text-2xl font-bold mb-6">Iniciar Sesión</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 outline-none transition-all"
                  style={{ backgroundColor: '#1C2E36', border: '1px solid #2a4050' }}
                  onFocus={e => (e.target.style.borderColor = '#76BC43')}
                  onBlur={e => (e.target.style.borderColor = '#2a4050')}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder-gray-600 outline-none transition-all"
                    style={{ backgroundColor: '#1C2E36', border: '1px solid #2a4050' }}
                    onFocus={e => (e.target.style.borderColor = '#76BC43')}
                    onBlur={e => (e.target.style.borderColor = '#2a4050')}
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
                {loading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>

            
            
              </div>
            </div>
          </div>
        </div> 
  );
}
