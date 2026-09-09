import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Percent,
  X,
} from 'lucide-react';

const CouponManagement = () => {
  const { userInfo } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrder: 0,
    maximumDiscount: '',
    expiry: '',
    usageLimit: '',
    isActive: true,
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.get('/api/coupons', config);
      setCoupons(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.token) {
      fetchCoupons();
    }
  }, [userInfo?.token]);

  const handleOpenModal = (coupon = null) => {
    setError('');
    setSuccess('');
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue,
        minimumOrder: coupon.minimumOrder || 0,
        maximumDiscount: coupon.maximumDiscount || '',
        expiry: coupon.expiry ? new Date(coupon.expiry).toISOString().slice(0, 10) : '',
        usageLimit: coupon.usageLimit || '',
        isActive: coupon.isActive !== undefined ? coupon.isActive : true,
      });
    } else {
      setEditingCoupon(null);
      // Default expiry 30 days in future
      const defaultExp = new Date();
      defaultExp.setDate(defaultExp.getDate() + 30);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minimumOrder: 0,
        maximumDiscount: '',
        expiry: defaultExp.toISOString().slice(0, 10),
        usageLimit: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const payload = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: Number(formData.discountValue),
        minimumOrder: Number(formData.minimumOrder) || 0,
        maximumDiscount: formData.maximumDiscount ? Number(formData.maximumDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      };

      if (editingCoupon) {
        await axios.put(`/api/admin/coupons/${editingCoupon._id}`, payload, config);
        setSuccess(`Coupon "${payload.code}" updated successfully!`);
      } else {
        await axios.post('/api/admin/coupons', payload, config);
        setSuccess(`Coupon "${payload.code}" created successfully!`);
      }

      setIsModalOpen(false);
      await fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save coupon');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.delete(`/api/admin/coupons/${id}`, config);
      setSuccess(`Coupon "${code}" deleted successfully.`);
      await fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Promotion Engine</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text mt-1 flex items-center gap-2">
            <Tag className="text-accent" />
            Coupon & Discount Manager
          </h1>
          <p className="text-sm text-textSecondary mt-1">
            Create and manage promotional discount codes with real-time checkout validation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-2 text-sm">
          <AlertCircle /> <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2 text-sm">
          <CheckCircle2 /> <span>{success}</span>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-textSecondary">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-textSecondary/40 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-text">No Coupons Configured</h3>
            <p className="text-xs text-textSecondary mt-1 mb-4">
              Get started by creating your first promotional discount coupon.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-accent text-white rounded-lg text-xs font-medium"
            >
              Create Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50 text-xs font-semibold text-textSecondary uppercase tracking-wider">
                  <th className="py-4 px-6">Coupon Code</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Min. Order</th>
                  <th className="py-4 px-6">Expiry</th>
                  <th className="py-4 px-6">Usage</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {coupons.map((c) => {
                  const isExpired = c.expiry && new Date() > new Date(c.expiry);
                  return (
                    <tr key={c._id} className="hover:bg-accent/5 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-accent">
                        {c.code}
                      </td>
                      <td className="py-4 px-6 font-medium text-text">
                        {c.discountType === 'percentage' ? (
                          <span className="inline-flex items-center gap-1">
                            <Percent className="w-3.5 h-3.5 text-textSecondary" /> {c.discountValue}%
                            {c.maximumDiscount && (
                              <span className="text-xs text-textSecondary font-normal">
                                (Max ₹{c.maximumDiscount})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span>₹{c.discountValue} Flat</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-textSecondary">
                        {c.minimumOrder > 0 ? `₹${c.minimumOrder}` : 'No minimum'}
                      </td>
                      <td className="py-4 px-6 text-xs text-textSecondary">
                        {new Date(c.expiry).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {isExpired && (
                          <span className="ml-2 text-[10px] text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded">
                            EXPIRED
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-textSecondary">
                        {c.usedCount || 0} {c.usageLimit ? `/ ${c.usageLimit}` : 'times'}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            c.isActive && !isExpired
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {c.isActive && !isExpired ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(c)}
                          className="p-1.5 text-textSecondary hover:text-accent hover:bg-accent/10 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c._id, c.code)}
                          className="p-1.5 text-textSecondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-textSecondary hover:text-text"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-serif font-bold text-text mb-4 flex items-center gap-2">
              <Tag className="text-accent" />
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVE25"
                  className="w-full px-3.5 py-2.5 font-mono text-sm uppercase border border-border rounded-xl bg-background text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl bg-background text-text focus:outline-none focus:border-accent"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === 'percentage' ? 'e.g. 15' : 'e.g. 500'}
                    className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl bg-background text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minimumOrder}
                    onChange={(e) => setFormData({ ...formData, minimumOrder: e.target.value })}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl bg-background text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                    Max Discount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maximumDiscount}
                    onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value })}
                    placeholder="Optional (for %)"
                    className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl bg-background text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiry}
                    onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl bg-background text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl bg-background text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-accent focus:ring-accent"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-medium text-text">
                  Coupon is Active and Redeemable
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium text-text hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-all shadow-md"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
