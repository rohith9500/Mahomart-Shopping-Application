'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Heart, ShoppingCart, Shield, Truck, RotateCcw, AlertTriangle, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../../../store/useCartStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { fetchProductById, createReview } from '../../../utils/api';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const { user, token, toggleWishlist } = useAuthStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Gallery and zoom state
  const [activeImage, setActiveImage] = useState('');
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const zoomContainerRef = useRef(null);

  // Selection states
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details'); // details, specifications, shipping

  // Review states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await fetchProductById(params.id);
        setProduct(data);
        setActiveImage(data.images[0]);
        
        // Auto-select first variant color/size
        if (data.variants && data.variants.length > 0) {
          setSelectedColor(data.variants[0].color || 'Default');
          setSelectedSize(data.variants[0].size || 'Standard');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [params.id]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = zoomContainerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity, selectedSize, selectedColor);
  };

  const isWishlisted = user?.wishlist?.some((item) => item._id === product?._id || item === product?._id);

  const handleWishlistToggle = () => {
    if (!user) {
      alert('Please sign in to add items to your wishlist!');
      return;
    }
    toggleWishlist(product._id);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setReviewError('Please sign in to submit a review!');
      return;
    }

    try {
      setReviewError(null);
      await createReview(product._id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess(true);
      setReviewComment('');
      
      // Reload product details to update reviews
      const updatedProduct = await fetchProductById(params.id);
      setProduct(updatedProduct);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-8">
        <div className="h-6 w-20 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-slate-200 aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="bg-slate-200 h-8 w-3/4 rounded" />
            <div className="bg-slate-200 h-4 w-1/4 rounded" />
            <div className="bg-slate-200 h-6 w-1/3 rounded" />
            <div className="bg-slate-200 h-24 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle size={48} className="mx-auto text-brand-accent" />
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-sm text-slate-400">The product page you requested does not exist or was removed.</p>
        <button onClick={() => router.push('/catalog')} className="text-xs font-bold bg-brand-primary text-white px-5 py-2.5 rounded-full">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back link */}
      <div>
        <button onClick={() => router.back()} className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft size={16} className="mr-1.5" /> Back
        </button>
      </div>

      {/* Main product showcase info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Left Side: Product Gallery & Lens Magnification */}
        <div className="space-y-4">
          <div
            ref={zoomContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-100 magnify-container shadow-sm"
          >
            <img
              src={activeImage}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Magnified Area */}
            <div className="magnified-image" style={zoomStyle} />
          </div>

          {/* Gallery Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex gap-3.5">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 aspect-square rounded-xl overflow-hidden border transition-all ${
                    activeImage === img ? 'border-brand-accent shadow-md scale-105' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Configs */}
        <div className="space-y-6">
          <div>
            <span className="text-xs tracking-widest font-black uppercase text-brand-secondary">
              {product.brand}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1 leading-snug">
              {product.title}
            </h1>
            
            {/* Rating summary */}
            <div className="flex items-center space-x-2 mt-3">
              <div className="flex text-brand-amber">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(product.rating) ? 'fill-current' : 'text-slate-200'}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-500">
                {product.rating.toFixed(1)} Rating ({product.numReviews} Reviews)
              </span>
            </div>
          </div>

          {/* Price details */}
          <div className="flex items-baseline space-x-3.5 py-4 border-y border-slate-100">
            <span className="text-2xl font-black text-slate-900">
              ₹{product.price.toLocaleString()}
            </span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-sm text-slate-400 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
                <span className="bg-red-50 text-brand-accent text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {product.discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description summary */}
          <p className="text-sm text-slate-500 leading-relaxed">
            {product.description}
          </p>

          {/* Variations details configurations */}
          <div className="space-y-4">
            {/* Colors picker */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Color</span>
              <div className="flex gap-2">
                {[...new Set(product.variants.map((v) => v.color))].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                      selectedColor === color
                        ? 'bg-brand-primary border-brand-primary text-white shadow'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes picker */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Size</span>
              <div className="flex gap-2">
                {[...new Set(product.variants.map((v) => v.size))].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition-all ${
                      selectedSize === size
                        ? 'bg-brand-primary border-brand-primary text-white shadow'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity select */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Quantity</span>
              <div className="flex items-center space-x-3 bg-slate-100 w-28 justify-between px-3 py-1.5 rounded-full">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="text-slate-500 hover:text-slate-900"
                >
                  <Minus size={14} />
                </button>
                <span className="text-xs font-extrabold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="text-slate-500 hover:text-slate-900"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Action trigger row */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-brand-primary hover:bg-brand-accent text-white py-3.5 rounded-xl font-bold tracking-wide transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm"
            >
              <ShoppingCart size={18} />
              <span>Add to Cart</span>
            </button>
            
            <button
              onClick={handleWishlistToggle}
              className="border border-slate-200 hover:border-slate-300 text-slate-600 p-3.5 rounded-xl transition flex items-center justify-center shadow-sm"
              title="Add to Wishlist"
            >
              <Heart size={18} className={isWishlisted ? "fill-brand-accent text-brand-accent" : ""} />
            </button>
          </div>

          {/* Security details badges */}
          <div className="grid grid-cols-3 gap-2.5 pt-4 text-center border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 flex flex-col items-center">
              <Truck size={18} className="text-brand-secondary" />
              <span className="text-[10px] font-bold text-slate-600">Free Shipping</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 flex flex-col items-center">
              <RotateCcw size={18} className="text-brand-secondary" />
              <span className="text-[10px] font-bold text-slate-600">30 Day Returns</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1 flex flex-col items-center">
              <Shield size={18} className="text-brand-secondary" />
              <span className="text-[10px] font-bold text-slate-600">100% Genuine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Tabs for details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
        <div className="flex border-b border-slate-100 gap-6 text-sm">
          {['details', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === tab
                  ? 'border-brand-accent text-brand-primary'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab contents */}
        {activeTab === 'details' && (
          <div className="text-sm leading-relaxed text-slate-500 space-y-4">
            <p>{product.description}</p>
            <p>Our premium products are crafted using responsibly sourced components, keeping the carbon footprint minimal. High compatibility and dynamic testing guarantee satisfaction.</p>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 border-collapse border border-slate-100">
              <tbody>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-700 w-1/3">Brand</td>
                  <td className="p-3">{product.brand}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-bold text-slate-700">Category</td>
                  <td className="p-3">{product.category?.name || 'Accessories'}</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-700">Tags</td>
                  <td className="p-3 capitalize">{product.tags.join(', ')}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3 font-bold text-slate-700">Stock Availability</td>
                  <td className="p-3">{product.inStock ? 'In Stock' : 'Out of Stock'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Reviews list */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-800 text-base">Reviews ({product.reviews.length})</h3>
              {product.reviews.length === 0 ? (
                <p className="text-xs text-slate-400">No customer reviews yet. Be the first to leave a review!</p>
              ) : (
                product.reviews.map((rev) => (
                  <div key={rev._id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{rev.name}</span>
                      <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex text-brand-amber">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} className={i < rev.rating ? 'fill-current' : 'text-slate-200'} />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 leading-normal">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Submit a review form */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-base">Write a Customer Review</h3>
              {reviewSuccess ? (
                <div className="p-4 bg-emerald-50 text-brand-success text-xs font-bold rounded-xl">
                  Thank you! Your product review has been submitted successfully.
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {reviewError && (
                    <div className="text-xs font-bold text-brand-accent">{reviewError}</div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-brand-accent outline-none text-slate-700 font-bold"
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Good</option>
                      <option value={3}>3 - Average</option>
                      <option value={2}>2 - Poor</option>
                      <option value={1}>1 - Terrible</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Comment</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Share your thoughts about product quality and performance..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-brand-accent outline-none text-slate-700"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-brand-primary hover:bg-brand-accent text-white px-6 py-2.5 rounded-full text-xs font-bold transition shadow-md"
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky add-to-cart panel at bottom for mobile screens */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-slate-100 py-3 px-4 z-40 shadow-xl flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-slate-400">Total Price</span>
          <span className="text-base font-extrabold text-slate-900">₹{(product.price * quantity).toLocaleString()}</span>
        </div>
        <button
          onClick={handleAddToCart}
          className="bg-brand-accent hover:bg-red-600 text-white font-bold text-xs px-6 py-2.5 rounded-full flex items-center space-x-1.5 shadow"
        >
          <ShoppingCart size={14} />
          <span>Quick Add</span>
        </button>
      </div>
    </div>
  );
}
