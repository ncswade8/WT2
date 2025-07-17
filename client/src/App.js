import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import PublicRoute from './components/PublicRoute';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Home from './components/Home';
import Analytics from './components/Analytics';
import UserManagement from './components/UserManagement';
import WaterQuality from './components/WaterQuality';
import WaterQualityForm from './components/WaterQualityForm';
import WaterQualityEditForm from './components/WaterQualityEditForm';
import WaterQualityAnalytics from './components/WaterQualityAnalytics';
import Footer from './components/Footer';
import './App.css';

function Navigation() {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div 
                style={{ 
                  width: '32px', 
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #03272f 0%, #99cc00 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 8px rgba(3, 39, 47, 0.3)'
                }}
              >
                W
              </div>
              <span>Water Quality Tracker</span>
            </div>
          </Link>
          <ul className="navbar-nav">
            {!isAuthenticated ? (
              <>
                <li>
                  <Link 
                    to="/" 
                    className={location.pathname === '/' ? 'active' : ''}
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/login" 
                    className={location.pathname === '/login' ? 'active' : ''}
                  >
                    Login
                  </Link>
                </li>
              </>
            ) : (
              <>
                {user?.isAdmin && (
                  <li>
                    <Link 
                      to="/home" 
                      className={location.pathname === '/home' ? 'active' : ''}
                    >
                      Home
                    </Link>
                  </li>
                )}
                <li>
                  <Link 
                    to="/water-quality" 
                    className={location.pathname === '/water-quality' ? 'active' : ''}
                  >
                    Water Quality
                  </Link>
                </li>
                {user?.isAdmin && (
                  <li>
                    <Link 
                      to="/users" 
                      className={location.pathname === '/users' ? 'active' : ''}
                    >
                      Users
                    </Link>
                  </li>
                )}
                <li>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: '#666', fontSize: '0.9rem' }}>
                      Welcome, {user?.firstName || 'User'}
                    </span>
                    <button
                      onClick={logout}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                      Logout
                    </button>
                  </div>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navigation />
          <div className="container">
            <Routes>
              {/* Public Routes - Only accessible when not logged in */}
              <Route path="/" element={
                <PublicRoute>
                  <RegisterForm />
                </PublicRoute>
              } />
              <Route path="/login" element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              } />
              
              {/* Protected Routes - Only accessible when logged in */}
              <Route path="/home" element={
                <ProtectedRoute>
                  {({ user }) => {
                    if (user?.isAdmin) {
                      return <Home />;
                    } else {
                      return <Navigate to="/water-quality" replace />;
                    }
                  }}
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  {({ user }) => {
                    if (user?.isAdmin) {
                      return <UserManagement />;
                    } else {
                      return <Navigate to="/water-quality" replace />;
                    }
                  }}
                </ProtectedRoute>
              } />
              <Route path="/water-quality" element={
                <ProtectedRoute>
                  <WaterQuality />
                </ProtectedRoute>
              } />
              <Route path="/water-quality/new" element={
                <ProtectedRoute>
                  <WaterQualityForm />
                </ProtectedRoute>
              } />
              <Route path="/water-quality/edit/:id" element={
                <ProtectedRoute>
                  <WaterQualityEditForm />
                </ProtectedRoute>
              } />
              <Route path="/water-quality/analytics" element={
                <ProtectedRoute>
                  <WaterQualityAnalytics />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 