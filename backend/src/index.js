const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/index');

// Load environment variables
dotenv.config();

// Initialize DB Connection
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Main API Routes
app.use('/api', apiRoutes);

// Test endpoint
app.get('/', (req, res) => {
  res.send('MahoMart API is running...');
});

// Fallback Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Database Auto-Seeding logic
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');

const seedData = async () => {
  try {
    // Check if categories already exist
    const categoryCount = await Category.countDocuments();
    if (categoryCount > 0) {
      console.log('Database already has records, skipping auto-seeding.');
      return;
    }

    console.log('Seeding initial categories and products...');

    // Delete existing collections for clean seeding
    await Category.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Create Admin and User accounts
    const adminUser = await User.create({
      name: 'Sanjay S.',
      email: 'sanjay@mahomart.com',
      password: 'password123',
      role: 'admin',
      savedAddresses: [
        {
          fullName: 'Sanjay S.',
          streetAddress: '123 Tech Park Road, Sector 4',
          city: 'Bangalore',
          state: 'Karnataka',
          postalCode: '560001',
          phone: '+91 98765 43210',
          isDefault: true
        }
      ]
    });

    const demoUser = await User.create({
      name: 'Guest Customer',
      email: 'guest@mahomart.com',
      password: 'password123',
      role: 'user',
      savedAddresses: [
        {
          fullName: 'Guest User',
          streetAddress: '456 Royal Residency, Palace Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          phone: '+91 91234 56789',
          isDefault: true
        }
      ]
    });

    // Create Categories
    const categories = await Category.insertMany([
      { name: 'Electronics', slug: 'electronics', icon: 'Laptop', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&auto=format&fit=crop' },
      { name: 'Footwear', slug: 'footwear', icon: 'Footprints', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop' },
      { name: 'Office & Home', slug: 'office-home', icon: 'Armchair', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&auto=format&fit=crop' },
      { name: 'Accessories', slug: 'accessories', icon: 'Sparkles', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop' },
    ]);

    const catElectronics = categories[0]._id;
    const catFootwear = categories[1]._id;
    const catOfficeHome = categories[2]._id;
    const catAccessories = categories[3]._id;

    // Create Products
    const products = [
      {
        brand: 'Aether',
        title: 'Quantum Wireless Pro Headphones',
        description: 'Experience pure sonic bliss with Active Noise Cancellation (ANC), 40-hour high-fidelity battery life, custom spatial sound, and plush protein-leather earcups for long listening sessions.',
        price: 12999.0,
        originalPrice: 19999.0,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop',
        ],
        category: catElectronics,
        variants: [
          { size: 'Standard', color: 'Midnight Black', stock: 15 },
          { size: 'Standard', color: 'Polar White', stock: 10 },
        ],
        reviews: [
          {
            user: demoUser._id,
            name: 'Rohit K.',
            rating: 5,
            comment: 'Superb sound quality and incredible ANC. The battery lasts forever!',
            images: [],
          },
        ],
        rating: 5.0,
        numReviews: 1,
        tags: ['audio', 'wireless', 'headphones', 'anc'],
      },
      {
        brand: 'Veloce',
        title: 'HyperPulse Running Shoes v3',
        description: 'Designed for high velocity. Engineered mesh upper for breathable comfort, and a responsive nitrogen-infused foam midsole providing unmatched rebound and energy return on the pavement.',
        price: 4999.0,
        originalPrice: 7999.0,
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop',
        ],
        category: catFootwear,
        variants: [
          { size: 'UK 8', color: 'Crimson Red', stock: 12 },
          { size: 'UK 9', color: 'Crimson Red', stock: 8 },
          { size: 'UK 10', color: 'Crimson Red', stock: 5 },
          { size: 'UK 8', color: 'Neon Lime', stock: 14 },
          { size: 'UK 9', color: 'Neon Lime', stock: 10 },
        ],
        reviews: [
          {
            user: demoUser._id,
            name: 'Anjali S.',
            rating: 4,
            comment: 'Very lightweight and springy. Runs slightly small, order half a size up.',
            images: [],
          },
        ],
        rating: 4.0,
        numReviews: 1,
        tags: ['shoes', 'sneakers', 'running', 'sportswear'],
      },
      {
        brand: 'Krono',
        title: 'Aero Chrono Hybrid Smartwatch',
        description: 'Classic horological aesthetic meets advanced biometrics. Always-on AMOLED display, built-in dual GPS, blood-oxygen monitoring, custom notifications, and up to 14 days of active battery life.',
        price: 8999.0,
        originalPrice: 14999.0,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop',
        ],
        category: catAccessories,
        variants: [
          { size: '42mm', color: 'Slate Grey', stock: 25 },
          { size: '46mm', color: 'Slate Grey', stock: 20 },
          { size: '42mm', color: 'Rose Gold', stock: 15 },
        ],
        reviews: [],
        rating: 0,
        numReviews: 0,
        tags: ['watch', 'smartwatch', 'wearables', 'tech'],
      },
      {
        brand: 'Lusso',
        title: 'ErgoSoft Premium Desk Chair',
        description: 'Maximize your productivity. Adaptive lumbar support, synchro-tilt mechanism, multi-directional 4D armrests, and a cooling mesh backrest that conforms perfectly to your natural spinal curve.',
        price: 18999.0,
        originalPrice: 29999.0,
        images: [
          'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=800&auto=format&fit=crop',
        ],
        category: catOfficeHome,
        variants: [
          { size: 'Standard', color: 'Ash Grey', stock: 8 },
          { size: 'Standard', color: 'Midnight Black', stock: 12 },
        ],
        reviews: [
          {
            user: demoUser._id,
            name: 'Devon M.',
            rating: 5,
            comment: 'Highly adjustable, fixed my posture issues. Absolutely worth the investment.',
            images: [],
          },
        ],
        rating: 5.0,
        numReviews: 1,
        tags: ['furniture', 'office', 'ergonomic', 'chair'],
      },
      {
        brand: 'Apex',
        title: 'Stealth Shield Waterproof Backpack',
        description: 'A modular, high-volume travel companion. Crafted with bulletproof ballistic nylon, waterproof zippers, dedicated 16-inch padded laptop compartment, and concealed passport pockets.',
        price: 3499.0,
        originalPrice: 5999.0,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop',
        ],
        category: catAccessories,
        variants: [
          { size: '24L', color: 'Stealth Black', stock: 30 },
          { size: '30L', color: 'Stealth Black', stock: 18 },
        ],
        reviews: [],
        rating: 0,
        numReviews: 0,
        tags: ['bags', 'backpack', 'travel', 'accessories'],
      },
      {
        brand: 'Aether',
        title: 'Apex Mechanical RGB Keyboard',
        description: 'Sleek hot-swappable mechanical switches, aircraft-grade aluminum top plate, customizable per-key RGB backlighting, and dynamic double-shot PBT keycaps for intense typing and gaming.',
        price: 6499.0,
        originalPrice: 9999.0,
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop',
        ],
        category: catElectronics,
        variants: [
          { size: 'Tenkeyless', color: 'Carbon Black', stock: 14 },
          { size: 'Full Size', color: 'Carbon Black', stock: 10 },
        ],
        reviews: [],
        rating: 0,
        numReviews: 0,
        tags: ['electronics', 'keyboard', 'gaming', 'peripherals'],
      }
    ];

    for (const prod of products) {
      await Product.create(prod);
    }

    console.log('Database seeded successfully with users, categories, and products!');
  } catch (error) {
    console.error('Error during auto-seeding:', error.message);
  }
};

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Attempt to auto-seed
  await seedData();
});
