const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    images: [String],
  },
  {
    timestamps: true,
  }
);

const VariantSchema = new mongoose.Schema({
  size: String,
  color: String,
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
});

const ProductSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, 'Brand name is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      default: 0.0,
    },
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      default: 0.0,
    },
    discountPercent: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    rating: {
      type: Number,
      required: true,
      default: 0.0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    variants: [VariantSchema],
    reviews: [ReviewSchema],
    tags: [String],
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate discount percent
ProductSchema.pre('save', function (next) {
  if (this.originalPrice > 0 && this.originalPrice > this.price) {
    this.discountPercent = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  } else {
    this.discountPercent = 0;
  }
  
  // Update inStock status based on variants stock
  const totalStock = this.variants.reduce((acc, curr) => acc + curr.stock, 0);
  this.inStock = totalStock > 0 || this.variants.length === 0;
  
  next();
});

// Indexes for fast searching & filtering
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ title: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
