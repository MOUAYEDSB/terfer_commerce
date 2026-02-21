import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Store, Package, ShoppingCart, BarChart3, LogOut, DollarSign, Plus } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-orange-500">TerFer Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Panel d'administration</p>
        </div>

        {/* User Info */}
        <div className="p-4 bg-slate-800/50 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="font-bold">{user?.name?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/admin/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/admin/dashboard')
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <BarChart3 size={20} />
            <span>Tableau de bord</span>
          </Link>

          <Link
            to="/admin/users"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/admin/users')
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <Users size={20} />
            <span>Clients</span>
          </Link>

          <Link
            to="/admin/sellers"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/admin/sellers')
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <Store size={20} />
            <span>Boutiques</span>
          </Link>

          <Link
            to="/admin/products"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/admin/products')
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <Package size={20} />
            <span>Produits</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/admin/orders')
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <ShoppingCart size={20} />
            <span>Commandes</span>
          </Link>

          <Link
            to="/admin/earnings"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              isActive('/admin/earnings')
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <DollarSign size={20} />
            <span>Gains Plateforme</span>
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white w-full transition-all"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
