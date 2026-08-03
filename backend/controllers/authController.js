const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailService');

const generateTokens = async (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'skillsync_secret_2026',
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { id: user._id, name: user.name },
    process.env.JWT_REFRESH_SECRET || 'skillsync_refresh_secret_2026',
    { expiresIn: '7d' }
  );

  user.refreshToken = refreshToken;
  await user.save();

  return { token, refreshToken };
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, university, yearLevel, interestMatrix, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      university,
      yearLevel,
      interestMatrix,
      role: role || 'student'
    });

    await user.save();

    // Create JWT
    const { token, refreshToken } = await generateTokens(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasResume: user.skills.length > 0
      }
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT
    const { token, refreshToken } = await generateTokens(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasResume: user.skills.length > 0
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Login synchronization failed' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const userObj = user.toObject();
    userObj.hasResume = user.skills.length > 0;
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ error: 'Profile retrieval failed' });
  }
};

// @desc    Update user profile and settings
// @route   PUT /api/auth/profile/update
exports.updateProfile = async (req, res) => {
  try {
    const { name, university, yearLevel, department, role, profileImage, settings } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (university !== undefined) updateData.university = university;
    if (yearLevel !== undefined) updateData.yearLevel = yearLevel;
    if (department !== undefined) updateData.department = department;
    if (role) updateData.role = role;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (settings) {
      updateData.settings = {
        theme: settings.theme ?? 'dark',
        notifications: settings.notifications ?? true,
        privacyMode: settings.privacyMode ?? false
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userObj = user.toObject();
    userObj.hasResume = user.skills.length > 0;
    res.json(userObj);
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ error: 'Failed to update profile settings' });
  }
};

// @desc    Upload profile avatar image
// @route   POST /api/auth/profile/avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file' });
    }

    // Custom profile image URL path
    const profileImagePath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profileImage: profileImagePath } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userObj = user.toObject();
    userObj.hasResume = user.skills.length > 0;
    res.json({
      message: 'Avatar uploaded successfully',
      user: userObj
    });
  } catch (err) {
    console.error('Upload Avatar Error:', err);
    res.status(500).json({ error: 'Failed to upload avatar image' });
  }
};

// @desc    Forgot Password - request recovery email
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User with this email does not exist' });
    }

    // ── Token generation — UNCHANGED ─────────────────────────────────
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // ── Build reset URL ───────────────────────────────────────────────
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // ── Always log the link (useful for dev / fallback debugging) ─────
    console.log(`========================================`);
    console.log(`PASSWORD RESET REQUEST RECEIVED`);
    console.log(`User: ${user.name} (${user.email})`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log(`========================================`);

    // ── Send email via Nodemailer ─────────────────────────────────────
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl
    });

    if (!emailResult.success) {
      // Log the failure reason but do NOT block the response.
      // Token is already saved — user can still use it if they have the link.
      console.error('[ForgotPassword] Email delivery failed:', emailResult.error);
    }

    // Always return success so attackers can't enumerate valid accounts
    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ error: 'Forgot password routing failed' });
  }
};

// @desc    Reset Password - update password using token
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = '';
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully. Access credentials updated.' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ error: 'Password reset execution failed' });
  }
};

// @desc    Refresh Token - rotate and issue new access/refresh tokens
// @route   POST /api/auth/refresh
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token missing from synchronization manifest' });
    }

    const verified = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'skillsync_refresh_secret_2026');
    const user = await User.findById(verified.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Refresh token invalid or revoked' });
    }

    // Generate new rotated tokens
    const tokens = await generateTokens(user);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasResume: user.skills.length > 0
      }
    });
  } catch (err) {
    console.error('Refresh Token Error:', err);
    res.status(401).json({ error: 'Session synchronization expired. Please re-authenticate.' });
  }
};

