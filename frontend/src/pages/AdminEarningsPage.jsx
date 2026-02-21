import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { DollarSign, TrendingUp, Store, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminEarningsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all'); // all, today, week, month

  useEffect(() => {
    fetchEarnings();
  }, [timeframe]);

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch earnings');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des gains');
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gains de la Plateforme</h1>
            <p className="text-gray-600 mt-1">Commission de {stats?.platformCommissionRate || 20}% sur toutes les ventes</p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Gains Plateforme</h3>
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">{(stats?.platformEarnings || 0).toFixed(2)} DZD</p>
            <p className="text-sm opacity-90">Commission totale</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Revenus Vendeurs</h3>
              <Store className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">{(stats?.sellerEarnings || 0).toFixed(2)} DZD</p>
            <p className="text-sm opacity-90">Total après commission</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Revenu Total</h3>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">{(stats?.totalRevenue || 0).toFixed(2)} DZD</p>
            <p className="text-sm opacity-90">Toutes les ventes</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Répartition des Revenus</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Commission Plateforme</span>
                  <span className="text-sm font-bold text-indigo-600">
                    {((stats?.platformEarnings / stats?.totalRevenue) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${(stats?.platformEarnings / stats?.totalRevenue) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Part Vendeurs</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {((stats?.sellerEarnings / stats?.totalRevenue) * 100 || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${(stats?.sellerEarnings / stats?.totalRevenue) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Informations</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Taux de commission</span>
                <span className="text-sm font-bold text-gray-900">{stats?.platformCommissionRate || 20}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Nombre de commandes</span>
                <span className="text-sm font-bold text-gray-900">{stats?.totalOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Gain moyen par commande</span>
                <span className="text-sm font-bold text-gray-900">
                  {((stats?.platformEarnings / stats?.totalOrders) || 0).toFixed(2)} DZD
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Nombre de boutiques</span>
                <span className="text-sm font-bold text-gray-900">{stats?.totalSellers || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-500 rounded-lg p-2">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Comment fonctionne la commission ?</h4>
              <p className="text-sm text-blue-800">
                La plateforme prélève automatiquement <strong>{stats?.platformCommissionRate || 20}%</strong> sur le prix de vente de chaque produit.
                Le vendeur définit son prix de base, et le prix final affiché au client inclut automatiquement cette commission.
              </p>
              <p className="text-sm text-blue-800 mt-2">
                <strong>Exemple :</strong> Si un vendeur met un produit à 100 DZD, le client paiera 120 DZD (100 DZD pour le vendeur + 20 DZD de commission).
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEarningsPage;
