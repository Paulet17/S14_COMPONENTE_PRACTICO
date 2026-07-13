import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router';
import { LayoutDashboard, BookOpen, Plus, ClipboardList, LogOut, Menu, X, User, Users, Package, BarChart2, ShieldCheck, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AppContext';
import logoMP from '../../imports/logoMP.png';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/menu', icon: BookOpen, label: 'Menú' },
  { to: '/orders/new', icon: Plus, label: 'Nueva Orden' },
  { to: '/orders', icon: ClipboardList, label: 'Órdenes' },
];

const adminNavItems = [
  { to: '/admin/users',    icon: Users,    label: 'Gestión de Usuarios'  },
  { to: '/admin/products', icon: Package,  label: 'Gestión de Productos' },
  { to: '/admin/inventory',icon: BarChart2,label: 'Inventario'           },
];

function NavItem({ to, icon: Icon, label, onClose }: { to: string; icon: typeof LayoutDashboard; label: string; onClose?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive ? 'font-semibold' : 'text-gray-400 hover:text-white'}`
      }
      style={({ isActive }) => isActive ? { backgroundColor: '#76BC43', color: '#1C2E36' } : {}}
    >
      {({ isActive }) => (
        <>
          <Icon className="w-5 h-5 shrink-0" style={isActive ? { color: '#1C2E36' } : {}} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}

function SidebarContent({ onClose, user, onLogout }: { onClose?: () => void; user: { name: string; role: string } | null; onLogout: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6" style={{ borderBottom: '1px solid #2a4050' }}>
        <div className="flex items-center gap-3">
          <img src={logoMP} alt="MuchoPlatano Logo" className="w-11 h-11 object-contain shrink-0" />
          <div>
            <p className="text-white font-bold leading-tight">Mucho</p>
            <p className="font-bold leading-tight" style={{ color: '#76BC43' }}>Platano</p>
          </div>
        </div>
        <p className="text-xs mt-2 font-medium" style={{ color: '#76BC43', opacity: 0.7 }}>Desayunos & Sabor</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems
          .filter(item => user?.role !== 'admin' || item.to === '/dashboard')
          .map(item => <NavItem key={item.to} {...item} onClose={onClose} />)}

        {user?.role === 'admin' && (
          <>
            <div className="pt-3 pb-1">
              <div className="flex items-center gap-2 px-4">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#E9C040' }} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#E9C040' }}>
                  Administración
                </p>
              </div>
            </div>
            {adminNavItems.map(item => <NavItem key={item.to} {...item} onClose={onClose} />)}
          </>
        )}
      </nav>

      <div className="p-4" style={{ borderTop: '1px solid #2a4050' }}>
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl" style={{ backgroundColor: '#2a4050' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: user?.role === 'admin' ? '#E9C040' : '#76BC43' }}
          >
            {user?.role === 'admin' ? (
              <Shield className="w-4 h-4" style={{ color: '#1C2E36' }} />
            ) : (
              <UserCheck className="w-4 h-4" style={{ color: '#1C2E36' }} />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.role === 'admin' ? 'Administrador' : 'Empleado'}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 transition-all duration-200 hover:bg-red-400/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}

export function Root() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#1C2E36' }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col shrink-0" style={{ backgroundColor: '#152028' }}>
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 w-64 flex flex-col" style={{ backgroundColor: '#152028' }}>
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <SidebarContent user={user} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-4 shrink-0"
          style={{ backgroundColor: '#152028', borderBottom: '1px solid #2a4050' }}
        >
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <img src={logoMP} alt="MuchoPlatano Logo" className="w-6 h-6 object-contain" />
            <span className="text-white font-bold">MuchoPlatano</span>
          </div>
          <div className="w-6" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}