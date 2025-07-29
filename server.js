const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const path = require('path'); // Added for serving static files

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json());

// In-memory storage for testing when MongoDB is not available
let inMemoryUsers = [];
let inMemoryTracking = [];
let inMemoryWaterQuality = [];

// MongoDB Connection
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/user-tracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.log('MongoDB connection failed, using in-memory storage for testing');
    console.log('To use MongoDB, set up MongoDB Atlas or install MongoDB locally');
    return false;
  }
};

let useMongoDB = false;

// Initialize database connection
connectToMongoDB().then(connected => {
  useMongoDB = connected;
});

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  registrationSource: {
    type: String,
    default: 'web'
  },
  ipAddress: String,
  userAgent: String
});

const User = mongoose.model('User', userSchema);

// Registration Tracking Schema
const registrationTrackingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    enum: ['registration', 'login', 'logout', 'profile_update'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: String,
  userAgent: String,
  metadata: mongoose.Schema.Types.Mixed
});

const RegistrationTracking = mongoose.model('RegistrationTracking', registrationTrackingSchema);

// Water Quality Schema
const waterQualitySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  time: {
    type: String,
    required: true
  },
  tester: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  temperature: {
    type: Number,
    required: true,
    min: -50,
    max: 100
  },
  turbidity: {
    type: Number,
    required: true,
    min: 0,
    max: 1000
  },
  dissolvedOxygen: {
    type: Number,
    required: true,
    min: 0,
    max: 20
  },
  ph: {
    type: Number,
    required: true,
    min: 0,
    max: 14
  },
  fecalColiform: {
    type: Number,
    required: true,
    min: 0
  },
  siteNotes: {
    type: String,
    trim: true
  },
  weather: {
    type: String,
    trim: true
  },
  additionalNotes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const WaterQuality = mongoose.model('WaterQuality', waterQualitySchema);

// Helper function to track registration events
const trackEvent = async (userId, action, req, metadata = {}) => {
  try {
    if (useMongoDB) {
      const trackingData = {
        userId,
        action,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        metadata
      };
      
      await RegistrationTracking.create(trackingData);
      console.log(`Tracked ${action} for user ${userId}`);
    } else {
      // In-memory tracking
      inMemoryTracking.push({
        userId,
        action,
        timestamp: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        metadata
      });
      console.log(`Tracked ${action} for user ${userId} (in-memory)`);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'User Registration Tracker is running',
    database: useMongoDB ? 'MongoDB' : 'In-Memory (Testing Mode)'
  });
});

// Register new user
app.post('/api/auth/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password, firstName, lastName } = req.body;

    if (useMongoDB) {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Check if this is the first user (make them admin)
      const userCount = await User.countDocuments();
      const isFirstUser = userCount === 0;

      // Create new user
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isAdmin: isFirstUser, // First user becomes admin
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });

      await user.save();

      // Track registration event
      await trackEvent(user._id, 'registration', req, {
        registrationMethod: 'email',
        hasPassword: true
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          registrationDate: user.registrationDate
        },
        token
      });
    } else {
      // In-memory user creation
      const existingUser = inMemoryUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const userId = Date.now().toString();
      // Check if this is the first user (make them admin)
      const isFirstUser = inMemoryUsers.length === 0;

      const user = {
        _id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isAdmin: isFirstUser, // First user becomes admin
        registrationDate: new Date(),
        lastLogin: new Date(),
        isActive: true,
        registrationSource: 'web',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      inMemoryUsers.push(user);

      // Track registration event
      await trackEvent(userId, 'registration', req, {
        registrationMethod: 'email',
        hasPassword: true
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully (In-Memory Mode)',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          registrationDate: user.registrationDate
        },
        token
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = async (req, res, next) => {
  try {
    if (useMongoDB) {
      const user = await User.findById(req.user.userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
      }
    } else {
      const user = inMemoryUsers.find(u => u._id === req.user.userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
      }
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const user = await User.findById(req.user.userId).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          lastLogin: user.lastLogin
        }
      });
    } else {
      // In-memory user lookup
      const user = inMemoryUsers.find(u => u._id === req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      const { password, ...userWithoutPassword } = user;
      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          lastLogin: user.lastLogin
        }
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login user
app.post('/api/auth/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    if (useMongoDB) {
      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Track login event
      await trackEvent(user._id, 'login', req);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          lastLogin: user.lastLogin
        },
        token
      });
    } else {
      // In-memory login
      const user = inMemoryUsers.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
      user.lastLogin = new Date();

      // Track login event
      await trackEvent(user._id, 'login', req);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful (In-Memory Mode)',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          lastLogin: user.lastLogin
        },
        token
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get registration analytics
app.get('/api/analytics', async (req, res) => {
  try {
    if (useMongoDB) {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });
      
      // Get registration count by date (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentRegistrations = await User.countDocuments({
        registrationDate: { $gte: thirtyDaysAgo }
      });

      // Get today's registrations
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayRegistrations = await User.countDocuments({
        registrationDate: { $gte: today, $lt: tomorrow }
      });

      res.json({
        success: true,
        analytics: {
          totalUsers,
          activeUsers,
          recentRegistrations,
          todayRegistrations
        }
      });
    } else {
      // In-memory analytics
      const totalUsers = inMemoryUsers.length;
      const activeUsers = inMemoryUsers.filter(u => u.isActive).length;
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentRegistrations = inMemoryUsers.filter(u => 
        new Date(u.registrationDate) >= thirtyDaysAgo
      ).length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayRegistrations = inMemoryUsers.filter(u => {
        const userDate = new Date(u.registrationDate);
        return userDate >= today && userDate < tomorrow;
      }).length;

      res.json({
        success: true,
        analytics: {
          totalUsers,
          activeUsers,
          recentRegistrations,
          todayRegistrations
        }
      });
    }

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all users (for admin purposes)
app.get('/api/users', async (req, res) => {
  try {
    if (useMongoDB) {
      const users = await User.find({}, '-password').sort({ registrationDate: -1 });
      res.json({
        success: true,
        users
      });
    } else {
      // In-memory users
      const users = inMemoryUsers.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      }).sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
      
      res.json({
        success: true,
        users
      });
    }
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin endpoints
// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (useMongoDB) {
      const users = await User.find({}, '-password').sort({ registrationDate: -1 });
      res.json({
        success: true,
        users
      });
    } else {
      // In-memory users
      const users = inMemoryUsers.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      }).sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
      
      res.json({
        success: true,
        users
      });
    }
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create user (admin only)
app.post('/api/admin/users', authenticateToken, requireAdmin, [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('isAdmin').optional().isBoolean(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { firstName, lastName, email, password, isAdmin = false, isActive = true } = req.body;

    if (useMongoDB) {
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        isAdmin,
        isActive,
        registrationDate: new Date(),
        lastLogin: new Date()
      });

      await user.save();

      // Track registration event
      await trackEvent(user._id, 'registration', req);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          isActive: user.isActive,
          registrationDate: user.registrationDate
        }
      });
    } else {
      // In-memory user creation
      const existingUser = inMemoryUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = Date.now().toString();

      const user = {
        _id: userId,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        isAdmin,
        isActive,
        registrationDate: new Date(),
        lastLogin: new Date()
      };

      inMemoryUsers.push(user);

      res.status(201).json({
        success: true,
        message: 'User created successfully (In-Memory Mode)',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          isActive: user.isActive,
          registrationDate: user.registrationDate
        }
      });
    }
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user (admin only)
app.put('/api/admin/users/:id', authenticateToken, requireAdmin, [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('isAdmin').optional().isBoolean(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { firstName, lastName, email, password, isAdmin, isActive } = req.body;

    if (useMongoDB) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if email is being changed and if it already exists
      if (email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already registered'
          });
        }
      }

      // Update user fields
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      if (password) {
        user.password = await bcrypt.hash(password, 12);
      }
      if (typeof isAdmin === 'boolean') {
        user.isAdmin = isAdmin;
      }
      if (typeof isActive === 'boolean') {
        user.isActive = isActive;
      }

      await user.save();

      res.json({
        success: true,
        message: 'User updated successfully',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          isActive: user.isActive,
          registrationDate: user.registrationDate,
          lastLogin: user.lastLogin
        }
      });
    } else {
      // In-memory user update
      const userIndex = inMemoryUsers.findIndex(u => u._id === id);
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = inMemoryUsers[userIndex];

      // Check if email is being changed and if it already exists
      if (email !== user.email) {
        const existingUser = inMemoryUsers.find(u => u.email === email);
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: 'Email already registered'
          });
        }
      }

      // Update user fields
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      if (password) {
        user.password = await bcrypt.hash(password, 12);
      }
      if (typeof isAdmin === 'boolean') {
        user.isAdmin = isAdmin;
      }
      if (typeof isActive === 'boolean') {
        user.isActive = isActive;
      }

      res.json({
        success: true,
        message: 'User updated successfully (In-Memory Mode)',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          isActive: user.isActive,
          registrationDate: user.registrationDate,
          lastLogin: user.lastLogin
        }
      });
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    if (useMongoDB) {
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } else {
      // In-memory user deletion
      const userIndex = inMemoryUsers.findIndex(u => u._id === id);
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      inMemoryUsers.splice(userIndex, 1);
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Toggle user status (admin only)
app.patch('/api/admin/users/:id/status', authenticateToken, requireAdmin, [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { isActive } = req.body;

    if (useMongoDB) {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.isActive = isActive;
      await user.save();
    } else {
      // In-memory user status update
      const user = inMemoryUsers.find(u => u._id === id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      user.isActive = isActive;
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Water Quality Endpoints

// Create new water quality record
app.post('/api/water-quality', [
  body('time').notEmpty().withMessage('Time is required'),
  body('tester').notEmpty().withMessage('Tester is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('temperature').isNumeric().withMessage('Temperature must be a number'),
  body('turbidity').isNumeric().withMessage('Turbidity must be a number'),
  body('dissolvedOxygen').isNumeric().withMessage('Dissolved oxygen must be a number'),
  body('ph').isNumeric().withMessage('pH must be a number'),
  body('fecalColiform').isNumeric().withMessage('Fecal coliform must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const {
      time, tester, location, temperature, turbidity, dissolvedOxygen, ph, fecalColiform,
      siteNotes, weather, additionalNotes
    } = req.body;

    if (useMongoDB) {
      const waterQuality = new WaterQuality({
        date: new Date(),
        time,
        tester,
        location,
        temperature: parseFloat(temperature),
        turbidity: parseFloat(turbidity),
        dissolvedOxygen: parseFloat(dissolvedOxygen),
        ph: parseFloat(ph),
        fecalColiform: parseFloat(fecalColiform),
        siteNotes,
        weather,
        additionalNotes
      });

      await waterQuality.save();

      res.status(201).json({
        success: true,
        message: 'Water quality record created successfully',
        waterQuality
      });
    } else {
      // In-memory water quality creation
      const waterQualityId = Date.now().toString();
      const waterQuality = {
        _id: waterQualityId,
        date: new Date(),
        time,
        tester,
        location,
        temperature: parseFloat(temperature),
        turbidity: parseFloat(turbidity),
        dissolvedOxygen: parseFloat(dissolvedOxygen),
        ph: parseFloat(ph),
        fecalColiform: parseFloat(fecalColiform),
        siteNotes,
        weather,
        additionalNotes,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      inMemoryWaterQuality.push(waterQuality);

      res.status(201).json({
        success: true,
        message: 'Water quality record created successfully (In-Memory Mode)',
        waterQuality
      });
    }

  } catch (error) {
    console.error('Water quality creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all water quality records
app.get('/api/water-quality', async (req, res) => {
  try {
    if (useMongoDB) {
      const waterQualityRecords = await WaterQuality.find().sort({ date: -1 });
      res.json({
        success: true,
        waterQuality: waterQualityRecords
      });
    } else {
      // In-memory water quality records
      const waterQualityRecords = inMemoryWaterQuality.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      res.json({
        success: true,
        waterQuality: waterQualityRecords
      });
    }
  } catch (error) {
    console.error('Get water quality error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get water quality record by ID
app.get('/api/water-quality/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (useMongoDB) {
      const waterQuality = await WaterQuality.findById(id);
      if (!waterQuality) {
        return res.status(404).json({
          success: false,
          message: 'Water quality record not found'
        });
      }
      res.json({
        success: true,
        waterQuality
      });
    } else {
      // In-memory water quality record
      const waterQuality = inMemoryWaterQuality.find(wq => wq._id === id);
      if (!waterQuality) {
        return res.status(404).json({
          success: false,
          message: 'Water quality record not found'
        });
      }
      res.json({
        success: true,
        waterQuality
      });
    }
  } catch (error) {
    console.error('Get water quality by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update water quality record
app.put('/api/water-quality/:id', [
  body('time').notEmpty().withMessage('Time is required'),
  body('tester').notEmpty().withMessage('Tester is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('temperature').isNumeric().withMessage('Temperature must be a number'),
  body('turbidity').isNumeric().withMessage('Turbidity must be a number'),
  body('dissolvedOxygen').isNumeric().withMessage('Dissolved oxygen must be a number'),
  body('ph').isNumeric().withMessage('pH must be a number'),
  body('fecalColiform').isNumeric().withMessage('Fecal coliform must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const {
      time, tester, location, temperature, turbidity, dissolvedOxygen, ph, fecalColiform,
      siteNotes, weather, additionalNotes
    } = req.body;

    if (useMongoDB) {
      const waterQuality = await WaterQuality.findByIdAndUpdate(
        id,
        {
          time,
          tester,
          location,
          temperature: parseFloat(temperature),
          turbidity: parseFloat(turbidity),
          dissolvedOxygen: parseFloat(dissolvedOxygen),
          ph: parseFloat(ph),
          fecalColiform: parseFloat(fecalColiform),
          siteNotes,
          weather,
          additionalNotes,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!waterQuality) {
        return res.status(404).json({
          success: false,
          message: 'Water quality record not found'
        });
      }

      res.json({
        success: true,
        message: 'Water quality record updated successfully',
        waterQuality
      });
    } else {
      // In-memory water quality update
      const waterQualityIndex = inMemoryWaterQuality.findIndex(wq => wq._id === id);
      if (waterQualityIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Water quality record not found'
        });
      }

      inMemoryWaterQuality[waterQualityIndex] = {
        ...inMemoryWaterQuality[waterQualityIndex],
        time,
        tester,
        location,
        temperature: parseFloat(temperature),
        turbidity: parseFloat(turbidity),
        dissolvedOxygen: parseFloat(dissolvedOxygen),
        ph: parseFloat(ph),
        fecalColiform: parseFloat(fecalColiform),
        siteNotes,
        weather,
        additionalNotes,
        updatedAt: new Date()
      };

      res.json({
        success: true,
        message: 'Water quality record updated successfully (In-Memory Mode)',
        waterQuality: inMemoryWaterQuality[waterQualityIndex]
      });
    }

  } catch (error) {
    console.error('Update water quality error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete water quality record
app.delete('/api/water-quality/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (useMongoDB) {
      const waterQuality = await WaterQuality.findByIdAndDelete(id);
      if (!waterQuality) {
        return res.status(404).json({
          success: false,
          message: 'Water quality record not found'
        });
      }
      res.json({
        success: true,
        message: 'Water quality record deleted successfully'
      });
    } else {
      // In-memory water quality deletion
      const waterQualityIndex = inMemoryWaterQuality.findIndex(wq => wq._id === id);
      if (waterQualityIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Water quality record not found'
        });
      }

      inMemoryWaterQuality.splice(waterQualityIndex, 1);

      res.json({
        success: true,
        message: 'Water quality record deleted successfully (In-Memory Mode)'
      });
    }

  } catch (error) {
    console.error('Delete water quality error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get water quality analytics
app.get('/api/water-quality-analytics', async (req, res) => {
  try {
    if (useMongoDB) {
      const totalRecords = await WaterQuality.countDocuments();
      const uniqueLocations = await WaterQuality.distinct('location');
      const uniqueTesters = await WaterQuality.distinct('tester');
      
      // Get records from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentRecords = await WaterQuality.countDocuments({
        date: { $gte: thirtyDaysAgo }
      });

      res.json({
        success: true,
        analytics: {
          totalRecords,
          uniqueLocations: uniqueLocations.length,
          uniqueTesters: uniqueTesters.length,
          recentRecords
        }
      });
    } else {
      // In-memory water quality analytics
      const totalRecords = inMemoryWaterQuality.length;
      const uniqueLocations = [...new Set(inMemoryWaterQuality.map(wq => wq.location))];
      const uniqueTesters = [...new Set(inMemoryWaterQuality.map(wq => wq.tester))];
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentRecords = inMemoryWaterQuality.filter(wq => 
        new Date(wq.date) >= thirtyDaysAgo
      ).length;

      res.json({
        success: true,
        analytics: {
          totalRecords,
          uniqueLocations: uniqueLocations.length,
          uniqueTesters: uniqueTesters.length,
          recentRecords
        }
      });
    }

  } catch (error) {
    console.error('Water quality analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Debug endpoint to show in-memory data
app.get('/api/debug', (req, res) => {
  res.json({
    success: true,
    databaseMode: useMongoDB ? 'MongoDB' : 'In-Memory',
    inMemoryUsers: inMemoryUsers.length,
    inMemoryTracking: inMemoryTracking.length,
    inMemoryWaterQuality: inMemoryWaterQuality.length,
    users: inMemoryUsers.map(u => ({
      id: u._id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      registrationDate: u.registrationDate,
      lastLogin: u.lastLogin,
      isActive: u.isActive
    })),
    tracking: inMemoryTracking.map(t => ({
      userId: t.userId,
      action: t.action,
      timestamp: t.timestamp,
      ipAddress: t.ipAddress
    })),
    waterQuality: inMemoryWaterQuality.map(wq => ({
      _id: wq._id,
      date: wq.date,
      time: wq.time,
      tester: wq.tester,
      location: wq.location,
      temperature: wq.temperature,
      turbidity: wq.turbidity,
      dissolvedOxygen: wq.dissolvedOxygen,
      ph: wq.ph,
      fecalColiform: wq.fecalColiform,
      siteNotes: wq.siteNotes,
      weather: wq.weather,
      additionalNotes: wq.additionalNotes,
      createdBy: wq.createdBy,
      createdAt: wq.createdAt,
      updatedAt: wq.updatedAt
    }))
  });
});

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database mode: ${useMongoDB ? 'MongoDB' : 'In-Memory (Testing)'}`);
}); 