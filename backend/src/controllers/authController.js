const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'mahomart_secret_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        savedAddresses: user.savedAddresses,
        wishlist: user.wishlist,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a saved address
// @route   POST /api/auth/address
// @access  Private
const addSavedAddress = async (req, res) => {
  const { fullName, streetAddress, city, state, postalCode, phone, isDefault } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (isDefault) {
        user.savedAddresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }

      const newAddress = {
        fullName,
        streetAddress,
        city,
        state,
        postalCode,
        phone,
        isDefault: isDefault || user.savedAddresses.length === 0,
      };

      user.savedAddresses.push(newAddress);
      await user.save();
      res.status(201).json(user.savedAddresses);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle item in wishlist
// @route   POST /api/auth/wishlist
// @access  Private
const toggleWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const index = user.wishlist.indexOf(productId);
      if (index > -1) {
        user.wishlist.splice(index, 1); // remove
      } else {
        user.wishlist.push(productId); // add
      }
      await user.save();
      const updatedUser = await User.findById(req.user._id).populate('wishlist');
      res.json(updatedUser.wishlist);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  addSavedAddress,
  toggleWishlist,
};
