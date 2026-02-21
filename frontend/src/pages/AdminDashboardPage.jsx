import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Users, Store, Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: 'Total Utilisateurs',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgLight: 'bg-blue-50'
    },
    {
      title: 'Boutiques',
      value: stats?.totalSellers || 0,
      icon: Store,
      color: 'bg-purple-500',
      bgLight: 'bg-purple-50'
    },
    {
      title: 'Produits',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-green-500',
      bgLight: 'bg-green-50'
    },
    {
      title: 'Commandes',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-orange-500',
      bgLight: 'bg-orange-50'
    },
    {
      title: 'Revenu Total',
      value: `${(stats?.totalRevenue || 0).toFixed(2)} DZD`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      bgLight: 'bg-emerald-50'
    },
    {
      title: `Gains Plateforme (${stats?.platformCommissionRate || 20}%)`,
      value: `${(stats?.platformEarnings || 0).toFixed(2)} DZD`,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      bgLight: 'bg-indigo-50'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgLight} p-3 rounded-lg`}>
                    <Icon className={`${stat.color.replace('bg-', 'text-')} w-6 h-6`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Revenue Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Gains Plateforme</h3>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold mb-2">{(stats?.platformEarnings || 0).toFixed(2)} DZD</p>
            <p className="text-sm opacity-90">Commission de {stats?.platformCommissionRate || 20}% sur toutes les ventes</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm">
                {((stats?.platformEarnings / stats?.totalRevenue) * 100 || 0).toFixed(1)}% du revenu total
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Revenus Vendeurs</h3>
              <Store className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold mb-2">{(stats?.sellerEarnings || 0).toFixed(2)} DZD</p>
            <p className="text-sm opacity-90">Total des gains des vendeurs</p>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm">
                {((stats?.sellerEarnings / stats?.totalRevenue) * 100 || 0).toFixed(1)}% du revenu total
              </p>
            </div>
          </div>
        </div>

        {/* Top Sellers */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Top 5 Vendeurs</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendeur</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boutique</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ventes</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commandes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats?.topSellers?.map((seller, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {seller._id?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {seller._id?.shopName || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">
                      {seller.totalSales.toFixed(2)} DZD
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {seller.totalOrders}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Commandes Récentes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats?.recentOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                      #{order._id.slice(-8)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {order.user?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status === 'pending' ? 'En attente' :
                         order.status === 'confirmed' ? 'Confirmée' :
                         order.status === 'shipped' ? 'Expédiée' :
                         order.status === 'delivered' ? 'Livrée' :
                         'Annulée'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      {order.total.toFixed(2)} DZD
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
