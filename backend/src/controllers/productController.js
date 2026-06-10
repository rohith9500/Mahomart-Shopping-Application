const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products with filters & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 8;
    const page = Number(req.query.page) || 1;

    // Build query
    const query = {};

    // 1. Search Query (Title, Description, Brand)
    if (req.query.keyword) {
      query.$text = { $search: req.query.keyword };
    }

    // 2. Category Filter
    if (req.query.category) {
      const cat = await Category.findOne({ slug: req.query.category.toLowerCase() });
      if (cat) {
        query.category = cat._id;
      }
    }

    // 3. Brand Filter (comma separated)
    if (req.query.brands) {
      const brandsList = req.query.brands.split(',');
      query.brand = { $in: brandsList.map(b => new RegExp('^' + b.trim() + '$', 'i')) };
    }

    // 4. Price range filter (Min-Max)
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // 5. Rating Filter
    if (req.query.rating) {
      query.rating = { $gte: Number(req.query.rating) };
    }

    // 6. Colors Filter (supporting variants)
    if (req.query.colors) {
      const colorsList = req.query.colors.split(',');
      query['variants.color'] = { $in: colorsList.map(c => new RegExp('^' + c.trim() + '$', 'i')) };
    }

    // Determine Sorting
    let sort = {};
    if (req.query.sortBy) {
      if (req.query.sortBy === 'price_low_high') {
        sort.price = 1;
      } else if (req.query.sortBy === 'price_high_low') {
        sort.price = -1;
      } else if (req.query.sortBy === 'newest') {
        sort.createdAt = -1;
      } else if (req.query.sortBy === 'popularity') {
        sort.rating = -1;
      }
    } else {
      sort.createdAt = -1; // default
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .populate('category', 'name slug');

    // Return unique list of brands and colors for sidebar filtering options
    const allBrands = await Product.distinct('brand');
    const allColors = await Product.distinct('variants.color');

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
      brands: allBrands,
      colors: allColors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get auto-suggest search suggestions
// @route   GET /api/products/suggest
// @access  Public
const getProductSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.json([]);
  }

  try {
    // Search suggestions based on regex matching on Title or Brand
    const suggestions = await Product.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } }
      ]
    })
      .select('title brand price images _id')
      .limit(5);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  const { rating, comment, images } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        images: images || [],
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductSuggestions,
  getProductById,
  createProductReview,
};
