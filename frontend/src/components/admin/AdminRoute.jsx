import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminRoute = () => {
  const { userInfo } = useAuth();
  const location = useLocation();

  if (!userInfo) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (userInfo.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0f0f11] text-[#e8e6e3] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#18181c] border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-500/20">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-serif text-white mb-2">Access Restricted</h2>
          <p className="text-stone-400 text-sm mb-6 leading-relaxed">
            You are signed in as <strong className="text-stone-200">{userInfo.name || userInfo.email}</strong>, but this portal is reserved strictly for store administrators.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} /> Return to Store
            </Link>
            <Link
              to="/admin/login"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors shadow-lg shadow-amber-600/20"
            >
              <LogIn size={16} /> Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
