import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { Store, TrendingUp, Package, ShoppingCart, Eye, Ban, CheckCircle, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSellersPage = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/sellers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch sellers');
      const data = await response.json();
      setSellers(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des boutiques');
    } finally {
      setLoading(false);
    }
  };

  const viewSellerDetails = async (sellerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${sellerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch seller details');
      const data = await response.json();
      setSelectedSeller(data);
      setShowModal(true);
    } catch (error) {
      toast.error('Erreur lors du chargement des détails');
    }
  };

  const handleToggleActive = async (sellerId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${sellerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) throw new Error('Failed to update seller');
      toast.success(`Boutique ${!currentStatus ? 'activée' : 'suspendue'}`);
      fetchSellers();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
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
        {/* Header with Create Button */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Boutiques</h1>
            <p className="text-gray-600 mt-1">Liste de tous les vendeurs et leurs boutiques</p>
          </div>
          <button
            onClick={() => navigate('/admin/sellers/create')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Créer un Vendeur
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Boutiques</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{sellers.length}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <Store className="text-purple-500 w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Boutiques Actives</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {sellers.filter(s => s.isActive).length}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="text-green-500 w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Produits</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {sellers.reduce((sum, s) => sum + s.totalProducts, 0)}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Package className="text-blue-500 w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Commandes</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {sellers.reduce((sum, s) => sum + s.totalOrders, 0)}
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <ShoppingCart className="text-orange-500 w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Sellers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boutique</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendeur</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Produits</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commandes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ventes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{seller.shopName || 'Sans nom'}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {seller.shopDescription || 'Aucune description'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{seller.name}</div>
                        <div className="text-sm text-gray-500">{seller.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">{seller.totalProducts}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">{seller.totalOrders}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                      {seller.totalSales.toFixed(2)} DZD
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        seller.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {seller.isActive ? 'Active' : 'Suspendue'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => viewSellerDetails(seller._id)}
                        className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        <Eye size={16} className="mr-1" />
                        Voir
                      </button>
                      <button
                        onClick={() => handleToggleActive(seller._id, seller.isActive)}
                        className={`inline-flex items-center px-3 py-1 rounded-lg transition ${
                          seller.isActive
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        {seller.isActive ? (
                          <>
                            <Ban size={16} className="mr-1" />
                            Suspendre
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} className="mr-1" />
                            Activer
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seller Details Modal */}
        {showModal && selectedSeller && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h3 className="text-xl font-bold">Détails de la boutique</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Shop Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Nom de la boutique</label>
                    <p className="font-medium">{selectedSeller.user.shopName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Vendeur</label>
                    <p className="font-medium">{selectedSeller.user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-medium">{selectedSeller.user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Date d'inscription</label>
                    <p className="font-medium">
                      {new Date(selectedSeller.user.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">Description</label>
                    <p className="font-medium">{selectedSeller.user.shopDescription || 'Aucune description'}</p>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Produits ({selectedSeller.products.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {selectedSeller.products.map((product) => (
                      <div key={product._id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        {product.images?.[0] && (
                          <img
                            src={`http://localhost:5000${product.images[0]}`}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.price.toFixed(2)} DZD</p>
                          <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Orders */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Commandes récentes ({selectedSeller.orders.length})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedSeller.orders.map((order) => (
                      <div key={order._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-mono text-sm">#{order._id.slice(-8)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{order.total.toFixed(2)} DZD</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSellersPage;
