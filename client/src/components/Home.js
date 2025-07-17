import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Activity, LogOut, Droplets } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics');
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  if (isLoading) {
    return (
      <div className="loading">
        Loading dashboard...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="loading">
        Loading user data...
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Welcome, {user.firstName}!</h1>
      <p className="page-subtitle">
        Welcome to your Water Quality Tracker dashboard. Here's your overview and quick access to all features.
      </p>

      <div className="card">
        <h2 style={{ marginBottom: '2rem', color: '#333' }}>
          <Calendar size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Quick Actions
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <button
            onClick={() => navigate('/water-quality')}
            className="btn btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              padding: '1rem 1.5rem',
              fontSize: '1.1rem'
            }}
          >
            <Droplets size={20} />
            Water Quality Records
          </button>
          
          <button
            onClick={() => navigate('/water-quality/new')}
            className="btn btn-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              padding: '1rem 1.5rem',
              fontSize: '1.1rem'
            }}
          >
            <Droplets size={20} />
            Add Water Quality Record
          </button>
          {user.isAdmin && (
            <>
              <button
                onClick={() => navigate('/analytics')}
                className="btn btn-secondary"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  padding: '1rem 1.5rem',
                  fontSize: '1.1rem'
                }}
              >
                <Activity size={20} />
                View Analytics
              </button>
              <button
                onClick={() => navigate('/users')}
                className="btn btn-secondary"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  padding: '1rem 1.5rem',
                  fontSize: '1.1rem'
                }}
              >
                <User size={20} />
                View All Users
              </button>
            </>
          )}
        </div>
      </div>

      {analytics && (
        <div className="card">
          <h2 style={{ marginBottom: '2rem', color: '#333' }}>
            <Activity size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Platform Analytics
          </h2>
          
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-number">{analytics.totalUsers}</div>
              <div className="analytics-label">Total Users</div>
            </div>
            
            <div className="analytics-card">
              <div className="analytics-number">{analytics.activeUsers}</div>
              <div className="analytics-label">Active Users</div>
            </div>
            
            <div className="analytics-card">
              <div className="analytics-number">{analytics.recentRegistrations}</div>
              <div className="analytics-label">Recent Registrations (30 days)</div>
            </div>
            
            <div className="analytics-card">
              <div className="analytics-number">{analytics.todayRegistrations}</div>
              <div className="analytics-label">Today's Registrations</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ marginBottom: '0.5rem', color: '#333' }}>
              <User size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Your Profile
            </h2>
            <p style={{ color: '#666', margin: 0 }}>
              Manage your account and view your registration details
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-number">{user.firstName} {user.lastName}</div>
            <div className="stat-label">Full Name</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{user.email}</div>
            <div className="stat-label">Email Address</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
            </div>
            <div className="stat-label">Last Login</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 