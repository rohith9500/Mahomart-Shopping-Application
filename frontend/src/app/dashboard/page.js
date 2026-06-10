'use client';

import React, { useState, useEffect } from 'react';
import { Package, MapPin, Heart, ShoppingCart, UserCheck, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { fetchMyOrders, updateOrderStatus, loginUser, registerUser } from '../../utils/api';

export default function DashboardPage() {
  const { user, token, setToken, fetchProfile, addSavedAddress, toggleWishlist } = useAuthStore();
  const { addItem } = useCartStore();

  const [activeTab, setActiveTab] = useState('orders'); // orders, addresses, wishlist
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Authentication Switcher
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: 'guest@mahomart.com', password: 'password123' });

  // Address creation form
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState(false);

  // Load User details & orders on mount / auth change
  useEffect(() => {
    if (token) {
      fetchProfile();
      loadOrders();
    }
  }, [token]);

  const loadOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const data = await fetchMyOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      let data;
      if (isLogin) {
        data = await loginUser(authForm.email, authForm.password);
      } else {
        data = await registerUser(authForm.name, authForm.email, authForm.password);
      }
      setToken(data.token);
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const success = await addSavedAddress(addressForm);
    if (success) {
      setAddressSuccess(true);
      setAddressForm({ fullName: '', streetAddress: '', city: '', state: '', postalCode: '', phone: '' });
      setTimeout(() => {
        setAddressSuccess(false);
        setShowAddressForm(false);
      }, 2000);
    }
  };

  const handleMoveToCart = (product) => {
    const defaultVariant = product.variants && product.variants.length > 0
      ? product.variants[0]
      : { size: 'Standard', color: 'Default' };
    
    addItem(product, 1, defaultVariant.size, defaultVariant.color);
    toggleWishlist(product._id); // Remove from wishlist
  };

  const handleStatusProgress = async (orderId, currentStatus) => {
    const stages = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const nextIndex = (stages.indexOf(currentStatus) + 1) % stages.length;
    const nextStatus = stages[nextIndex];
    try {
      await updateOrderStatus(orderId, nextStatus);
      loadOrders(); // Refresh order details
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  // Auth Panel Layout
  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight font-sans">
              {isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isLogin ? 'Sign in to access tracking timelines' : 'Register to save addresses and wishlist items'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authError && <div className="text-xs font-bold text-brand-accent text-center">{authError}</div>}

            {!isLogin && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-accent outline-none text-slate-800"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-accent outline-none text-slate-800"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-brand-accent outline-none text-slate-800"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-accent text-white py-3 rounded-xl font-bold tracking-wide transition shadow"
            >
              {isLogin ? 'Login Now' : 'Sign Up'}
            </button>
          </form>

          {/* Toggle link */}
          <div className="text-center border-t border-slate-100 pt-4">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthForm({ name: '', email: '', password: '' });
                setAuthError(null);
              }}
              className="text-xs font-bold text-brand-secondary hover:text-brand-accent"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile summary header */}
      <div className="bg-brand-dark rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-center shadow-lg gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/40 to-transparent z-0" />
        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-brand-accent text-white font-extrabold flex items-center justify-center text-xl sm:text-2xl shadow">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">{user?.name}</h2>
            <p className="text-xs text-slate-300 font-semibold">{user?.email}</p>
          </div>
        </div>
        <div className="relative z-10 bg-white/10 px-4 py-2 rounded-full text-xs font-bold border border-white/20 flex items-center gap-1.5 backdrop-blur-sm">
          <UserCheck size={16} /> Verified Account
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 gap-6 text-sm font-bold text-slate-400">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'orders' ? 'border-brand-accent text-brand-primary' : 'border-transparent hover:text-slate-600'
          }`}
        >
          <Package size={16} /> Orders
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'addresses' ? 'border-brand-accent text-brand-primary' : 'border-transparent hover:text-slate-600'
          }`}
        >
          <MapPin size={16} /> Addresses
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'wishlist' ? 'border-brand-accent text-brand-primary' : 'border-transparent hover:text-slate-600'
          }`}
        >
          <Heart size={16} /> Wishlist
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {/* Orders Panel */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {loadingOrders ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                <RefreshCw size={24} className="animate-spin text-slate-300" />
                <p className="text-xs">Loading order history...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 space-y-2">
                <Package size={40} className="mx-auto text-slate-300" />
                <h3 className="font-bold text-slate-700">No Orders Yet</h3>
                <p className="text-xs">Your purchase history is empty. Start shopping to fill this space.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
                  {/* Order header information */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-50 pb-4 gap-2">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Order ID</p>
                      <p className="font-bold text-xs text-slate-600 font-mono mt-0.5">{order._id}</p>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Total amount Paid</p>
                      <p className="text-sm font-extrabold text-slate-800 mt-0.5">₹{order.totalPrice.toLocaleString()}</p>
                    </div>
                    {/* Demo button to change order status in real time */}
                    <button
                      onClick={() => handleStatusProgress(order._id, order.currentStatus)}
                      className="bg-slate-100 hover:bg-brand-accent text-slate-600 hover:text-white px-3 py-1.5 rounded-full text-[10px] font-black transition flex items-center gap-1"
                      title="Advance order tracking stage for demonstration purposes"
                    >
                      <RefreshCw size={11} /> Next Stage (Demo)
                    </button>
                  </div>

                  {/* Order tracking milestones timeline */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                    {order.statusTimeline.map((node) => (
                      <div key={node.status} className="space-y-1.5 text-xs">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              node.isCompleted
                                ? 'bg-brand-accent border-brand-accent text-white'
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            {node.isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={`font-bold ${node.isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                            {node.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal pl-6">{node.description}</p>
                        {node.isCompleted && node.timestamp && (
                          <p className="text-[9px] font-bold text-brand-secondary pl-6">
                            {new Date(node.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Order items lists */}
                  <div className="space-y-3 pt-4 border-t border-slate-50">
                    <p className="text-xs font-black text-slate-400 uppercase">Items Purchased</p>
                    {order.orderItems.map((item) => (
                      <div key={`${item.product}-${item.size}-${item.color}`} className="flex items-center space-x-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">{item.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Qty: {item.quantity} | Color: {item.color || 'N/A'} | Size: {item.size || 'N/A'}
                          </p>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Addresses Panel */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* List of existing saved addresses */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-2">Saved Addresses</h3>
              {user?.savedAddresses?.length === 0 ? (
                <p className="text-xs text-slate-400">No saved addresses yet. Fill form to add one.</p>
              ) : (
                user.savedAddresses.map((addr) => (
                  <div key={addr._id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-2 relative">
                    {addr.isDefault && (
                      <span className="absolute top-4 right-4 bg-emerald-50 text-brand-success text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                        DEFAULT
                      </span>
                    )}
                    <h4 className="font-bold text-xs text-slate-800">{addr.fullName}</h4>
                    <p className="text-xs text-slate-500 leading-normal">{addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}</p>
                    <p className="text-[10px] text-slate-400 font-bold">Phone: {addr.phone}</p>
                  </div>
                ))
              )}
            </div>

            {/* Form to add new address */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-50 pb-2">
                Add Address
              </h3>

              {addressSuccess && (
                <div className="p-3 bg-emerald-50 text-brand-success text-xs font-bold rounded-xl">
                  Address added successfully!
                </div>
              )}

              <form onSubmit={handleAddressSubmit} className="space-y-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand-accent outline-none text-slate-800"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Street Address</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand-accent outline-none text-slate-800"
                    value={addressForm.streetAddress}
                    onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-0.5">City</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand-accent outline-none text-slate-800"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-0.5">State</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand-accent outline-none text-slate-800"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Postal Code</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand-accent outline-none text-slate-800"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Phone</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-brand-accent outline-none text-slate-800"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-primary hover:bg-brand-accent text-white py-2 rounded-xl text-xs font-bold transition shadow"
                >
                  Save Address
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Wishlist Panel */}
        {activeTab === 'wishlist' && (
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-4">My Wishlist</h3>
            {user?.wishlist?.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 space-y-2">
                <Heart size={40} className="mx-auto text-slate-300" />
                <h3 className="font-bold text-slate-700">Wishlist is Empty</h3>
                <p className="text-xs">Mark products as liked in the catalog to pin them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {user.wishlist.map((item) => (
                  <div key={item._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3 flex flex-col justify-between">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full aspect-square object-cover rounded-xl border border-slate-200"
                    />
                    <div>
                      <span className="text-[9px] font-black uppercase text-brand-secondary">{item.brand}</span>
                      <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">{item.title}</h4>
                      <p className="text-xs font-extrabold text-slate-900 mt-1">₹{item.price.toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-50">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="flex-1 bg-brand-primary hover:bg-brand-accent text-white text-[10px] font-black py-2 rounded-lg transition flex items-center justify-center gap-1 shadow-sm"
                      >
                        <ShoppingCart size={12} /> Add
                      </button>
                      <button
                        onClick={() => toggleWishlist(item._id)}
                        className="border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-red-500 text-[10px] font-bold px-2 rounded-lg transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
