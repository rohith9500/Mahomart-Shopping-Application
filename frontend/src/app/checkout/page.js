'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Truck, MapPin, CheckCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { createOrder } from '../../utils/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCartStore();
  const { user, token, fetchProfile } = useAuthStore();

  const [step, setStep] = useState(1); // 1: Address, 2: Delivery, 3: Payment
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  });

  const [deliveryOption, setDeliveryOption] = useState('standard'); // standard or express
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

  // Auto-fill address from user profiles on mount
  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  useEffect(() => {
    if (user && user.savedAddresses && user.savedAddresses.length > 0) {
      const defaultAddr = user.savedAddresses.find((a) => a.isDefault) || user.savedAddresses[0];
      setShippingAddress({
        fullName: defaultAddr.fullName || '',
        streetAddress: defaultAddr.streetAddress || '',
        city: defaultAddr.city || '',
        state: defaultAddr.state || '',
        postalCode: defaultAddr.postalCode || '',
        phone: defaultAddr.phone || '',
      });
    }
  }, [user]);

  // Pricing variables
  const itemsPrice = getCartTotal();
  const shippingPrice = deliveryOption === 'express' ? 350 : itemsPrice > 5000 ? 0 : 150;
  const taxPrice = Math.round(itemsPrice * 0.18); // 18% GST standard
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handleNextStep = () => {
    if (step === 1) {
      if (!shippingAddress.fullName || !shippingAddress.streetAddress || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.phone) {
        alert('Please fill out all address fields!');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderItems = cartItems.map((item) => ({
        product: item.product,
        title: item.title,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      await createOrder({
        orderItems,
        shippingAddress,
        paymentMethod: paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery',
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error(err);
      alert('Order Placement Failed. Please sign in or try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !success) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <ShoppingBag size={48} className="mx-auto text-slate-300" />
        <h2 className="text-xl font-bold text-slate-800 font-sans">Checkout is Empty</h2>
        <p className="text-xs text-slate-400">Add products to your cart before proceeding to checkout.</p>
        <button onClick={() => router.push('/catalog')} className="text-xs font-bold bg-brand-primary text-white px-5 py-2.5 rounded-full">
          Start Shopping
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5 bg-white border border-slate-100 rounded-3xl shadow-sm mt-8">
        <CheckCircle size={56} className="mx-auto text-brand-success animate-bounce" />
        <h2 className="text-2xl font-black text-slate-800 tracking-tight font-sans">Order Placed Successfully!</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your payment was processed. You can now trace shipment stages on your account tracking timeline.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-brand-primary hover:bg-brand-accent text-white font-bold text-xs py-3 rounded-xl transition"
        >
          Track My Order
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-8">SECURE CHECKOUT</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Columns: Step Form Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step indicators */}
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm text-xs font-bold text-slate-400">
            <span className={step >= 1 ? 'text-brand-accent' : ''}>1. ADDRESS</span>
            <span className="h-px w-8 bg-slate-200" />
            <span className={step >= 2 ? 'text-brand-accent' : ''}>2. SHIPPING</span>
            <span className="h-px w-8 bg-slate-200" />
            <span className={step >= 3 ? 'text-brand-accent' : ''}>3. PAYMENT</span>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            {/* Step 1: Address details */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5 mb-4">
                  <MapPin size={16} className="text-brand-accent" /> Shipping Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Name</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-accent outline-none text-slate-800"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Phone Number</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-accent outline-none text-slate-800"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Street Address</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-accent outline-none text-slate-800"
                    value={shippingAddress.streetAddress}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, streetAddress: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">City</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-accent outline-none text-slate-800"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">State</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-accent outline-none text-slate-800"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Postal Code</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-accent outline-none text-slate-800"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Shipping choice */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5 mb-4">
                  <Truck size={16} className="text-brand-accent" /> Delivery Options
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-brand-secondary transition">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="delivery"
                        className="text-brand-accent focus:ring-brand-accent mr-3"
                        checked={deliveryOption === 'standard'}
                        onChange={() => setDeliveryOption('standard')}
                      />
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">Standard Delivery</p>
                        <p className="text-slate-400 mt-0.5">Delivered in 3-5 business days</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{itemsPrice > 5000 ? 'FREE' : '₹150'}</span>
                  </label>

                  <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:border-brand-secondary transition">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="delivery"
                        className="text-brand-accent focus:ring-brand-accent mr-3"
                        checked={deliveryOption === 'express'}
                        onChange={() => setDeliveryOption('express')}
                      />
                      <div className="text-xs">
                        <p className="font-bold text-slate-800">Express Runner</p>
                        <p className="text-slate-400 mt-0.5">Next day air speed priority routing</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">₹350</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Payment details */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5 mb-4">
                  <CreditCard size={16} className="text-brand-accent" /> Payment Method
                </h3>

                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-3 text-xs font-bold border rounded-xl transition ${
                      paymentMethod === 'card' ? 'bg-brand-primary border-brand-primary text-white shadow' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Credit / Debit Card
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex-1 py-3 text-xs font-bold border rounded-xl transition ${
                      paymentMethod === 'cod' ? 'bg-brand-primary border-brand-primary text-white shadow' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Cash on Delivery
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-accent outline-none text-slate-800"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Expiration</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-accent outline-none text-slate-800"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="***"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-accent outline-none text-slate-800"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stepper Buttons */}
            <div className="flex justify-between pt-6 border-t border-slate-100">
              {step > 1 ? (
                <button
                  onClick={handlePrevStep}
                  className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition py-2 px-4 border border-slate-200 rounded-xl"
                >
                  <ArrowLeft size={14} className="mr-1" /> Previous
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  onClick={handleNextStep}
                  className="bg-brand-primary hover:bg-brand-accent text-white text-xs font-bold py-2.5 px-6 rounded-xl transition shadow"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="bg-brand-accent hover:bg-red-600 disabled:bg-slate-400 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition shadow-lg"
                >
                  {loading ? 'Processing...' : `Pay & Place Order (₹${totalPrice.toLocaleString()})`}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Sticky Order Summary Sidebar */}
        <aside className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4 lg:sticky lg:top-24">
          <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-3">
            Order Summary
          </h3>

          {/* Cart items list */}
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={`${item.product}-${item.size}-${item.color}`} className="flex justify-between text-xs text-slate-600 gap-4">
                <span className="truncate flex-1">
                  {item.title} <span className="font-bold text-[10px] text-slate-400">x{item.quantity}</span>
                </span>
                <span className="font-bold text-slate-800">₹{(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-3.5 space-y-2 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="font-bold text-slate-700">₹{itemsPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-bold text-slate-700">
                {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (18%)</span>
              <span className="font-bold text-slate-700">₹{taxPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-800 border-t border-slate-100 pt-3">
              <span>Total Price</span>
              <span className="text-brand-accent text-base">₹{totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
