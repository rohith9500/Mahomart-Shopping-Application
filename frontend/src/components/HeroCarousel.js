'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&auto=format&fit=crop',
    title: 'HYPERPULSE RUNNING SNEAKERS',
    subtitle: 'Veloce Pulse Collection',
    description: 'Nitrogen-infused response midsole for maximum energy feedback and explosive speed.',
    link: '/catalog?category=footwear',
    badge: 'NEW ARRIVAL',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop',
    title: 'QUANTUM WIRELESS PRO HEADPHONES',
    subtitle: 'Aether Audio Engineering',
    description: 'Active Noise Cancellation and 40-hour high fidelity playtime for ultimate audiophiles.',
    link: '/catalog?category=electronics',
    badge: 'TRENDING',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop',
    title: 'AERO HYBRID CHRONO WEARABLES',
    subtitle: 'Krono Smartwatch Wearables',
    description: 'Biometric tracking, blood-oxygen index, AMOLED display with premium steel casing.',
    link: '/catalog?category=accessories',
    badge: '40% OFF',
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <div className="relative w-full h-[320px] sm:h-[420px] md:h-[520px] bg-slate-950 overflow-hidden shadow-lg">
      {/* Slides mapping */}
      {SLIDES.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Backdrop Image */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent z-10" />
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-[6000ms] ease-out"
          />

          {/* Text Overlays */}
          <div className="absolute inset-0 flex items-center z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-xl text-left space-y-4">
                <span className="inline-block bg-brand-accent text-white font-black text-[10px] tracking-widest px-3 py-1 rounded-full uppercase shadow">
                  {slide.badge}
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
                  {slide.subtitle}
                </p>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                  {slide.title}
                </h1>
                <p className="text-slate-400 text-xs sm:text-base leading-relaxed max-w-md hidden sm:block">
                  {slide.description}
                </p>
                <div className="pt-3">
                  <Link
                    href={slide.link}
                    className="inline-block bg-white hover:bg-brand-accent text-slate-900 hover:text-white px-7 py-3 rounded-full text-xs sm:text-sm font-bold transition-all shadow-lg hover:shadow-xl duration-200"
                  >
                    Discover Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Manual buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-900/40 hover:bg-brand-accent text-white p-2 rounded-full backdrop-blur-sm transition-colors duration-200 z-30 focus:outline-none hidden sm:block"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-900/40 hover:bg-brand-accent text-white p-2 rounded-full backdrop-blur-sm transition-colors duration-200 z-30 focus:outline-none hidden sm:block"
      >
        <ChevronRight size={22} />
      </button>

      {/* Indicator dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2.5 z-30">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'bg-brand-accent w-6' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
