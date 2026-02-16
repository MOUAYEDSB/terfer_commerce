const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, role, shopName, shopDescription } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'customer',
            shopName: role === 'seller' ? shopName : undefined,
            shopDescription: role === 'seller' ? shopDescription : undefined
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                shopName: user.shopName,
                token: generateToken(user._id)
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                shopName: user.shopName,
                avatar: user.avatar,
                token: generateToken(user._id)
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('wishlist', 'name price images rating');

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            addresses: user.addresses,
            wishlist: user.wishlist,
            shopName: user.shopName,
            shopDescription: user.shopDescription,
            shopLogo: user.shopLogo,
            isVerifiedSeller: user.isVerifiedSeller
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.avatar = req.body.avatar || user.avatar;

        if (req.body.password) {
            user.password = req.body.password;
        }

        // Update seller info if seller
        if (user.role === 'seller') {
            user.shopName = req.body.shopName || user.shopName;
            user.shopDescription = req.body.shopDescription || user.shopDescription;
            user.shopLogo = req.body.shopLogo || user.shopLogo;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            shopName: updatedUser.shopName,
            token: generateToken(updatedUser._id)
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Add address to user
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { fullName, phone, address, city, postalCode, isDefault } = req.body;

        // If this is default, unset other defaults
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        user.addresses.push({
            fullName,
            phone,
            address,
            city,
            postalCode,
            isDefault: isDefault || user.addresses.length === 0
        });

        await user.save();
        res.status(201).json(user.addresses);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const address = user.addresses.id(req.params.addressId);

        if (address) {
            address.fullName = req.body.fullName || address.fullName;
            address.phone = req.body.phone || address.phone;
            address.address = req.body.address || address.address;
            address.city = req.body.city || address.city;
            address.postalCode = req.body.postalCode || address.postalCode;

            if (req.body.isDefault) {
                user.addresses.forEach(addr => addr.isDefault = false);
                address.isDefault = true;
            }

            await user.save();
            res.json(user.addresses);
        } else {
            res.status(404);
            throw new Error('Address not found');
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.addresses = user.addresses.filter(
            addr => addr._id.toString() !== req.params.addressId
        );

        await user.save();
        res.json({ message: 'Address deleted successfully' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Add/Remove product from wishlist
// @route   POST /api/users/wishlist/:productId
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const productId = req.params.productId;
        const index = user.wishlist.indexOf(productId);

        if (index > -1) {
            // Remove from wishlist
            user.wishlist.splice(index, 1);
            await user.save();
            res.json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
        } else {
            // Add to wishlist
            user.wishlist.push(productId);
            await user.save();
            res.json({ message: 'Product added to wishlist', wishlist: user.wishlist });
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get seller info
// @route   GET /api/users/seller/:id
// @access  Public
const getSellerInfo = asyncHandler(async (req, res) => {
    const seller = await User.findById(req.params.id).select('-password');

    if (seller && seller.role === 'seller') {
        res.json({
            _id: seller._id,
            name: seller.name,
            shopName: seller.shopName,
            shopDescription: seller.shopDescription,
            shopLogo: seller.shopLogo,
            isVerifiedSeller: seller.isVerifiedSeller,
            email: seller.email,
            phone: seller.phone
        });
    } else {
        res.status(404);
        throw new Error('Seller not found');
    }
});

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    toggleWishlist,
    getSellerInfo
};
