# User Registration Tracker

A modern web application for tracking and managing user registrations with comprehensive analytics and a beautiful UI.

## Features

### 🔐 User Authentication
- Secure user registration with email validation
- Password hashing with bcrypt
- JWT-based authentication
- Login/logout functionality

### 📊 Registration Tracking
- Track user registration events with timestamps
- Store IP addresses and user agents
- Monitor registration sources
- Track login activities

### 📈 Analytics Dashboard
- Real-time registration statistics
- User growth metrics
- Recent activity tracking
- Platform health insights

### 👥 User Management
- View all registered users
- Search and filter users
- User status tracking
- Registration date tracking

### 🎨 Modern UI/UX
- Responsive design
- Beautiful gradient backgrounds
- Interactive components
- Toast notifications
- Loading states

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user-registration-tracker
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/user-tracker
   JWT_SECRET=your-super-secret-jwt-key
   ```

5. **Start MongoDB**
   - Local: Start MongoDB service
   - Cloud: Use MongoDB Atlas or similar

6. **Run the application**

   **Development mode (with hot reload):**
   ```bash
   # Terminal 1 - Backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd client
   npm start
   ```

   **Production mode:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Analytics
- `GET /api/analytics` - Get registration analytics
- `GET /api/users` - Get all users

### Health Check
- `GET /api/health` - Server health status

## Usage

### Registration Flow
1. Navigate to the home page
2. Fill out the registration form
3. Submit to create account
4. Automatically redirected to dashboard

### Dashboard Features
- View personal profile information
- See platform-wide analytics
- Quick access to user management
- Logout functionality

### Analytics View
- Total users count
- Active users percentage
- Recent registration trends
- Growth analysis
- Platform insights

### User Management
- View all registered users
- Search by name or email
- See registration dates
- Track user status

## Database Schema

### User Collection
```javascript
{
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  registrationDate: Date,
  lastLogin: Date,
  isActive: Boolean,
  registrationSource: String,
  ipAddress: String,
  userAgent: String
}
```

### Registration Tracking Collection
```javascript
{
  userId: ObjectId (ref: User),
  action: String (enum: ['registration', 'login', 'logout', 'profile_update']),
  timestamp: Date,
  ipAddress: String,
  userAgent: String,
  metadata: Mixed
}
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Express-validator middleware
- **Security Headers**: Helmet middleware
- **CORS Protection**: Cross-origin request handling
- **Rate Limiting**: Built-in Express protection

## Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment
1. Set environment variables
2. Build frontend: `npm run build`
3. Start server: `npm start`

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ using Node.js, Express, React, and MongoDB** 