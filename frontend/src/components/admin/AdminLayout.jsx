import { useState } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  BarChart3,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Categories', path: '/admin/categories', icon: Layers },
  { name: 'Inventory', path: '/admin/inventory', icon: Boxes },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
];

const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userInfo, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getPageTitle = () => {
    const current = NAV_ITEMS.find(item => location.pathname.startsWith(item.path));
    if (location.pathname === '/admin/products/new') return 'Add New Product';
    if (location.pathname.includes('/edit')) return 'Edit Product';
    return current ? current.name : 'Admin Portal';
  };

  return (
    <div className="min-h-screen bg-[#0d0d10] text-[#e8e6e3] flex flex-col lg:flex-row antialiased selection:bg-amber-600/30 selection:text-amber-200">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-[#141418] border-b border-stone-800/80 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/60"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg tracking-wider text-amber-100">ANVIKA</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Admin</span>
          </div>
        </div>
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-300 transition-colors"
        >
          <span>Store</span>
          <ExternalLink size={13} />
        </Link>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 bottom-0 z-50 w-72 bg-[#121216] border-r border-stone-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="px-6 py-6 border-b border-stone-800/60 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-2xl tracking-wider text-white">ANVIKA</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Admin
                </span>
              </div>
              <span className="text-[11px] text-stone-400 tracking-wide mt-0.5">Boutique Management</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-stone-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Action Button */}
          <div className="px-4 pt-5 pb-3">
            <Link
              to="/admin/products/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-sm shadow-lg shadow-amber-900/30 transition-all active:scale-[0.98]"
            >
              <PlusCircle size={17} />
              <span>Add New Product</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-3 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
              Core Operations
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/25 shadow-sm'
                        : 'text-stone-300 hover:text-white hover:bg-stone-800/40'
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-800/80 bg-[#0f0f13]">
          {/* User badge */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-stone-900/80 border border-stone-800 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-serif font-bold text-base">
              {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-stone-200 truncate">{userInfo?.name || 'Administrator'}</p>
              <p className="text-[11px] text-stone-400 truncate">{userInfo?.email}</p>
            </div>
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-stone-300 hover:text-white hover:bg-stone-800/60 border border-stone-800 transition-colors"
            >
              <ExternalLink size={13} />
              <span>Live Store</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-[#121216]/90 backdrop-blur-md border-b border-stone-800/80 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400">Admin</span>
            <ChevronRight size={14} className="text-stone-400" />
            <h1 className="text-lg font-serif font-medium text-stone-100">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MongoDB Connected</span>
            </div>
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-amber-300 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <span>Preview Store</span>
              <ExternalLink size={13} />
            </Link>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
