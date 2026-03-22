import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { Store, Package, ShoppingCart, Eye, Ban, CheckCircle, X, Plus, Trash2, Edit, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSellersPage = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editSeller, setEditSeller] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const openEditSeller = async (sellerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${sellerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch seller details');
      const data = await response.json();
      setEditSeller({
        _id: data.user._id,
        name: data.user.name || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        shopName: data.user.shopName || '',
        shopDescription: data.user.shopDescription || '',
        shopPhone: data.user.shopPhone || '',
        shopEmail: data.user.shopEmail || '',
        shopAddress: data.user.shopAddress || '',
        shopCity: data.user.shopCity || ''
      });
      setShowEditModal(true);
    } catch (error) {
      toast.error('Erreur lors du chargement pour modification');
    }
  };

  const handleSaveEdit = async () => {
    if (!editSeller?._id) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${editSeller._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editSeller.name,
          email: editSeller.email,
          phone: editSeller.phone,
          shopName: editSeller.shopName,
          shopDescription: editSeller.shopDescription,
          shopPhone: editSeller.shopPhone,
          shopEmail: editSeller.shopEmail,
          shopAddress: editSeller.shopAddress,
          shopCity: editSeller.shopCity
        })
      });

      if (!response.ok) throw new Error('Failed to update seller');
      toast.success('Boutique mise Ã  jour');
      setShowEditModal(false);
      setEditSeller(null);
      if (selectedSeller?.user?._id === editSeller._id) {
        await viewSellerDetails(editSeller._id);
      }
      fetchSellers();
    } catch (error) {
      toast.error('Erreur lors de la mise Ã  jour');
    } finally {
      setSaving(false);
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

  const handleApproveSeller = async (sellerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${sellerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isVerifiedSeller: true, isActive: true })
      });

      if (!response.ok) throw new Error('Failed to approve seller');
      const data = await response.json();

      if (data.approvalEmailSent) {
        toast.success('Vendeur validé et email envoyé');
      } else if (data.approvalEmailError) {
        toast.success('Vendeur validé (email non envoyé)');
      } else {
        toast.success('Vendeur validé');
      }

      fetchSellers();
    } catch (error) {
      toast.error('Erreur lors de la validation du vendeur');
    }
  };

  const handleDeleteSeller = async (sellerId) => {
    const confirmed = window.confirm(
      'Confirmer la suppression de cette boutique ? Cette action supprimera aussi tous ses produits.'
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${sellerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete seller');
      toast.success('Boutique supprimée');
      if (selectedSeller?.user?._id === sellerId) {
        setShowModal(false);
        setSelectedSeller(null);
      }
      fetchSellers();
    } catch (error) {
      toast.error('Erreur lors de la suppression de la boutique');
    }
  };

  const filteredSellers = useMemo(() => {
    let data = [...sellers];

    if (activeFilter === 'pending') {
      data = data.filter((seller) => !seller.isVerifiedSeller);
    } else if (activeFilter === 'verified') {
      data = data.filter((seller) => seller.isVerifiedSeller);
    } else if (activeFilter === 'active') {
      data = data.filter((seller) => seller.isActive);
    } else if (activeFilter === 'suspended') {
      data = data.filter((seller) => !seller.isActive);
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      data = data.filter((seller) => {
        const name = (seller.name || '').toLowerCase();
        const shop = (seller.shopName || '').toLowerCase();
        const email = (seller.email || '').toLowerCase();
        return name.includes(query) || shop.includes(query) || email.includes(query);
      });
    }

    return data;
  }, [sellers, activeFilter, searchQuery]);

  const filterButtons = [
    { key: 'all', label: 'Tous', count: sellers.length },
    { key: 'pending', label: 'En attente', count: sellers.filter(s => !s.isVerifiedSeller).length },
    { key: 'verified', label: 'Valides', count: sellers.filter(s => s.isVerifiedSeller).length },
    { key: 'active', label: 'Actifs', count: sellers.filter(s => s.isActive).length },
    { key: 'suspended', label: 'Suspendus', count: sellers.filter(s => !s.isActive).length }
  ];

  const pendingInFiltered = filteredSellers.filter((seller) => !seller.isVerifiedSeller);

  const handleApproveFiltered = async () => {
    if (pendingInFiltered.length === 0) return;

    const confirmed = window.confirm(`Valider ${pendingInFiltered.length} vendeur(s) en attente ?`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const results = await Promise.all(
        pendingInFiltered.map((seller) =>
          fetch(`http://localhost:5000/api/admin/users/${seller._id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isVerifiedSeller: true, isActive: true })
          })
        )
      );

      const successCount = results.filter((r) => r.ok).length;
      const failedCount = results.length - successCount;

      if (failedCount > 0) {
        toast.error(`${successCount} valides, ${failedCount} echecs`);
      } else {
        toast.success(`${successCount} vendeur(s) valides`);
      }

      fetchSellers();
    } catch (error) {
      toast.error('Erreur lors de la validation en masse');
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
                <p className="text-sm font-medium text-gray-600">En attente validation</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {sellers.filter(s => !s.isVerifiedSeller).length}
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <CheckCircle className="text-yellow-500 w-6 h-6" />
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

        {/* Filters + Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {filterButtons.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  activeFilter === filter.key
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, boutique, email..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleApproveFiltered}
              disabled={pendingInFiltered.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <CheckCircle size={16} />
              Valider en attente ({pendingInFiltered.length})
            </button>

            <button
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              <RefreshCw size={16} />
              Reset filtres
            </button>
          </div>

          <p className="text-sm text-gray-500">
            {filteredSellers.length} resultat(s) affiche(s)
          </p>
        </div>

        {/* Sellers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boutique</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validation</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Produits</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commandes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ventes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSellers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center">
                      <p className="text-sm text-gray-600 mb-4">Aucune boutique trouvee pour ce filtre.</p>
                      <button
                        onClick={() => {
                          setActiveFilter('all');
                          setSearchQuery('');
                        }}
                        className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg transition"
                      >
                        <RefreshCw size={18} />
                        Voir tous les vendeurs
                      </button>
                    </td>
                  </tr>
                ) : filteredSellers.map((seller) => (
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
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        seller.isVerifiedSeller ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {seller.isVerifiedSeller ? 'Validé' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">{seller.totalProducts}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">{seller.totalOrders}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                      {seller.totalSales.toFixed(2)} TND
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        seller.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {seller.isActive ? 'Active' : 'Suspendue'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewSellerDetails(seller._id)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                          title="Voir les détails"
                        >
                          <Eye size={16} className="mr-1" />
                          Voir
                        </button>
                        {!seller.isVerifiedSeller && (
                          <button
                            onClick={() => handleApproveSeller(seller._id)}
                            className="inline-flex items-center px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                            title="Valider le vendeur"
                          >
                            <CheckCircle size={16} className="mr-1" />
                            Valider
                          </button>
                        )}
                        <button
                          onClick={() => openEditSeller(seller._id)}
                          className="inline-flex items-center px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                          title="Modifier la boutique"
                        >
                          <Edit size={16} className="mr-1" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleToggleActive(seller._id, seller.isActive)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg transition ${
                            seller.isActive
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                          title={seller.isActive ? 'Suspendre' : 'Activer'}
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
                        <button
                          onClick={() => handleDeleteSeller(seller._id)}
                          className="inline-flex items-center px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-black transition"
                          title="Supprimer la boutique"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Supprimer
                        </button>
                      </div>
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
                  <div>
                    <label className="text-sm text-gray-600">Validation vendeur</label>
                    <p className="font-medium">
                      {selectedSeller.user.isVerifiedSeller ? 'Validé' : 'En attente'}
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
                          <p className="text-sm text-gray-600">{product.price.toFixed(2)} TND</p>
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
                          <p className="font-semibold">{order.total.toFixed(2)} TND</p>
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

        {/* Edit Seller Modal */}
        {showEditModal && editSeller && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                <h3 className="text-xl font-bold">Modifier la boutique</h3>
                <button
                  onClick={() => {
                    if (saving) return;
                    setShowEditModal(false);
                    setEditSeller(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nom boutique</label>
                    <input
                      value={editSeller.shopName}
                      onChange={(e) => setEditSeller(s => ({ ...s, shopName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ville</label>
                    <input
                      value={editSeller.shopCity}
                      onChange={(e) => setEditSeller(s => ({ ...s, shopCity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={editSeller.shopDescription}
                      onChange={(e) => setEditSeller(s => ({ ...s, shopDescription: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Infos vendeur</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Nom</label>
                      <input
                        value={editSeller.name}
                        onChange={(e) => setEditSeller(s => ({ ...s, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">TÃ©lÃ©phone</label>
                      <input
                        value={editSeller.phone}
                        onChange={(e) => setEditSeller(s => ({ ...s, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={editSeller.email}
                        onChange={(e) => setEditSeller(s => ({ ...s, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Contact boutique</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">TÃ©lÃ©phone boutique</label>
                      <input
                        value={editSeller.shopPhone}
                        onChange={(e) => setEditSeller(s => ({ ...s, shopPhone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Email boutique</label>
                      <input
                        type="email"
                        value={editSeller.shopEmail}
                        onChange={(e) => setEditSeller(s => ({ ...s, shopEmail: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-600 mb-1">Adresse</label>
                      <input
                        value={editSeller.shopAddress}
                        onChange={(e) => setEditSeller(s => ({ ...s, shopAddress: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (saving) return;
                      setShowEditModal(false);
                      setEditSeller(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-60"
                    disabled={saving}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition disabled:opacity-60"
                    disabled={saving}
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
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
