import * as authService from '../services/authService.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const data = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      token: data.token,
      user: {
        _id: data._id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
      },
    });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide an email and password');
    }

    const data = await authService.loginUser(email, password);
    
    res.json({
      success: true,
      token: data.token,
      user: {
        _id: data._id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
      }
    });
  } catch (error) {
    res.status(401);
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        }
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & mobile number
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await authService.updateUserProfile(req.user._id, req.body);
    res.json({
      success: true,
      message: 'Mobile number & profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
