'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Grid, List, SlidersHorizontal, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { fetchProducts } from '../../utils/api';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_low_high', label: 'Price: Low to High' },
  { value: 'price_high_low', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Customer Rating' },
];

export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  // Available filter options (loaded from backend dynamically)
  const [availableBrands, setAvailableBrands] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);

  // Active Filter states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrands, setSelectedBrands] = useState(searchParams.get('brands')?.split(',') || []);
  const [selectedColors, setSelectedColors] = useState(searchParams.get('colors')?.split(',') || []);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const keyword = searchParams.get('keyword') || '';

  // Synchronize URL changes
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSortBy(searchParams.get('sortBy') || 'newest');
  }, [searchParams]);

  // Load products when filters change
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const queryParams = {
          page,
          pageSize: 6,
          category: selectedCategory,
          brands: selectedBrands.join(','),
          colors: selectedColors.join(','),
          minPrice,
          maxPrice,
          rating: minRating,
          sortBy,
          keyword,
        };
        const data = await fetchProducts(queryParams);
        setProducts(data.products);
        setTotalPages(data.pages);
        
        if (data.brands) setAvailableBrands(data.brands);
        if (data.colors) setAvailableColors(data.colors);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [page, selectedCategory, selectedBrands, selectedColors, minPrice, maxPrice, minRating, sortBy, keyword]);

  const handleBrandChange = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setPage(1);
  };

  const handleColorChange = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
    setPage(1);
  };

  const handleClearFilters = () => {
    setSelectedBrands([]);
    setSelectedColors([]);
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setPage(1);
    router.push('/catalog');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category Heading & Meta */}
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-6 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
            {selectedCategory ? `${selectedCategory.replace('-', ' ')}` : 'ALL PRODUCTS'}
          </h1>
          {keyword && (
            <p className="text-xs text-slate-400 font-bold mt-1">
              Search results for: <span className="text-brand-accent">"{keyword}"</span>
            </p>
          )}
        </div>

        {/* View mode toggle and Sort bar */}
        <div className="flex items-center space-x-4 w-full md:w-auto mt-4 md:mt-0 justify-between md:justify-end">
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-brand-primary' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-brand-primary' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="text-xs font-bold bg-white border border-slate-200 text-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 flex items-center gap-1.5 text-sm uppercase tracking-wider">
              <SlidersHorizontal size={16} /> Filters
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-[11px] font-black text-brand-accent hover:underline uppercase"
            >
              Clear All
            </button>
          </div>

          {/* Brands Checklist */}
          {availableBrands.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Brands</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                {availableBrands.map((brand) => (
                  <label key={brand} className="flex items-center text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-brand-accent focus:ring-brand-accent mr-2.5 h-4 w-4"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                    />
                    {brand}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price Range</h4>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-brand-accent outline-none"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="number"
                placeholder="Max"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-brand-accent outline-none"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
              />
            </div>
          </div>

          {/* Customer Rating Filter */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Customer Rating</h4>
            <div className="space-y-1">
              {[4, 3, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => { setMinRating(minRating === num ? '' : num); setPage(1); }}
                  className={`flex items-center text-xs w-full py-1 text-left hover:text-brand-accent transition-colors font-semibold ${
                    minRating === num ? 'text-brand-accent font-bold' : 'text-slate-600'
                  }`}
                >
                  <span className="flex text-brand-amber mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < num ? 'fill-current' : 'text-slate-200'} />
                    ))}
                  </span>
                  & Up
                </button>
              ))}
            </div>
          </div>

          {/* Colors Filter */}
          {availableColors.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Colors</h4>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all ${
                      selectedColors.includes(color)
                        ? 'bg-brand-primary border-brand-primary text-white shadow'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Product Listing Main Grid */}
        <main className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 space-y-4 animate-pulse h-96" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 space-y-2">
              <SlidersHorizontal size={40} className="mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700">No Products Found</h3>
              <p className="text-xs max-w-xs mx-auto">Try clearing filters or adjusting parameters to refine search results.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            /* List Layout view */
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="flex flex-col sm:flex-row bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow p-4 gap-4"
                >
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full sm:w-40 aspect-square object-cover rounded-xl border border-slate-200"
                  />
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <span className="text-[10px] tracking-widest font-black uppercase text-brand-secondary">
                        {product.brand}
                      </span>
                      <h3 className="font-bold text-slate-800 text-base leading-snug hover:text-brand-accent">
                        {product.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-4">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-base font-extrabold text-slate-900">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-slate-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <ProductCard product={product} /> {/* Reusing overlay add functionalities */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 pt-6 border-t border-slate-100">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
