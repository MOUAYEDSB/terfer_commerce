const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Request password reset token (Forgot Password)
 * @route   POST /api/users/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Please provide an email');
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        // For security, don't reveal if user exists or not
        res.status(200);
        return res.json({
            success: true,
            message: 'If an account with this email exists, a password reset link has been sent.'
        });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save hash to user (don't save plain token)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // await sendEmail({
    //     email: user.email,
    //     subject: 'Password Reset Link',
    //     message: `Click here to reset your password: ${resetUrl}`
    // });

    res.status(200).json({
        success: true,
        message: 'Password reset link sent to email',
        // FOR TESTING ONLY - Remove in production
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
});

/**
 * @desc    Reset password with token
 * @route   POST /api/users/reset-password/:resetToken
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { password, passwordConfirm } = req.body;

    // Validate input
    if (!resetToken) {
        res.status(400);
        throw new Error('Reset token is required');
    }

    if (!password || !passwordConfirm) {
        res.status(400);
        throw new Error('Password and password confirmation are required');
    }

    if (password !== passwordConfirm) {
        res.status(400);
        throw new Error('Passwords do not match');
    }

    // Hash token to compare with stored hash
    const resetTokenHash = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Find user with matching reset token and valid expiry
    const user = await User.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpiry: { $gt: new Date() }
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired reset token');
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successfully',
        token: generateToken(user._id),
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
});

/**
 * @desc    Verify reset token
 * @route   GET /api/users/reset-password/:resetToken
 * @access  Public
 */
const verifyResetToken = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;

    if (!resetToken) {
        res.status(400);
        throw new Error('Reset token is required');
    }

    // Hash token
    const resetTokenHash = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Check if token exists and is not expired
    const user = await User.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpiry: { $gt: new Date() }
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired reset token');
    }

    res.status(200).json({
        success: true,
        message: 'Reset token is valid'
    });
});

module.exports = {
    forgotPassword,
    resetPassword,
    verifyResetToken
};
