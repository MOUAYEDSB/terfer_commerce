import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { DollarSign, TrendingUp, Store, Calendar, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminEarningsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all'); // all, today, week, month
  const [weeks, setWeeks] = useState(12);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, [timeframe, weeks]);

  const fetchEarnings = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/stats?weeks=${weeks}`, {
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

  const handleResetStats = async () => {
    const confirmed = window.confirm(
      'RÃ©initialiser les stats ? Ceci supprimera toutes les commandes (revenu, gains plateforme/vendeurs).'
    );
    if (!confirmed) return;

    try {
      setResetting(true);
      const response = await fetch('http://localhost:5000/api/admin/stats/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirm: true })
      });

      if (!response.ok) throw new Error('Failed to reset stats');
      toast.success('Stats rÃ©initialisÃ©es');
      setLoading(true);
      await fetchEarnings();
    } catch (error) {
      toast.error('Erreur lors de la rÃ©initialisation');
    } finally {
      setResetting(false);
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
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={weeks}
                onChange={(e) => setWeeks(parseInt(e.target.value, 10))}
                className="text-sm outline-none bg-transparent text-gray-700"
              >
                <option value={4}>4 semaines</option>
                <option value={12}>12 semaines</option>
                <option value={24}>24 semaines</option>
                <option value={52}>52 semaines</option>
              </select>
            </div>
            <button
              onClick={handleResetStats}
              disabled={resetting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60"
              title="RÃ©initialiser revenu/gains"
            >
              <RotateCcw className="w-4 h-4" />
              {resetting ? 'RÃ©initialisation...' : 'RÃ©initialiser'}
            </button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Gains Plateforme</h3>
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">{(stats?.platformEarnings || 0).toFixed(2)} TND</p>
            <p className="text-sm opacity-90">Commission totale</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Revenus Vendeurs</h3>
              <Store className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">{(stats?.sellerEarnings || 0).toFixed(2)} TND</p>
            <p className="text-sm opacity-90">Total après commission</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Revenu Total</h3>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">{(stats?.totalRevenue || 0).toFixed(2)} TND</p>
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
                  {((stats?.platformEarnings / stats?.totalOrders) || 0).toFixed(2)} TND
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
                <strong>Exemple :</strong> Si un vendeur met un produit à 100 TND, le client paiera 120 TND (100 TND pour le vendeur + 20 TND de commission).
              </p>
            </div>
          </div>
        </div>

        {/* Seller Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Gains par boutique</h3>
          {stats?.sellerBreakdown?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boutique</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendeur</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ventes</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gains plateforme</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gains vendeur</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commandes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.sellerBreakdown.map((row) => (
                    <tr key={row._id?._id || row._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{row._id?.shopName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{row._id?.name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {(row.grossSales || 0).toFixed(2)} TND
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-indigo-600">
                        {(row.platformEarnings || 0).toFixed(2)} TND
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600">
                        {(row.sellerEarnings || 0).toFixed(2)} TND
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{row.totalOrders || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Aucune donnÃ©e pour le moment.</p>
          )}
        </div>

        {/* Weekly Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Gains par semaine</h3>
          {stats?.weeklyBreakdown?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semaine</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ventes</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gains plateforme</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gains vendeurs</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commandes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.weeklyBreakdown.map((row) => (
                    <tr key={`${row.year}-${row.week}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        S{row.week} / {row.year}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                        {(row.grossSales || 0).toFixed(2)} TND
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-indigo-600">
                        {(row.platformEarnings || 0).toFixed(2)} TND
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600">
                        {(row.sellerEarnings || 0).toFixed(2)} TND
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{row.totalOrders || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Aucune donnÃ©e pour la pÃ©riode sÃ©lectionnÃ©e.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEarningsPage;
