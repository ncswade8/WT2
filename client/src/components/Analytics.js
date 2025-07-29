import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getApiUrl } from '../config/api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/analytics'));
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

  if (isLoading) {
    return (
      <div className="loading">
        Loading analytics...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="empty-state">
        <h3>No Analytics Available</h3>
        <p>Analytics data will appear here once users start registering.</p>
      </div>
    );
  }

  const registrationRate = analytics.totalUsers > 0 
    ? ((analytics.recentRegistrations / analytics.totalUsers) * 100).toFixed(1)
    : 0;

  const activeRate = analytics.totalUsers > 0 
    ? ((analytics.activeUsers / analytics.totalUsers) * 100).toFixed(1)
    : 0;

  return (
    <div>
      <h1 className="page-title">Analytics Dashboard</h1>
      <p className="page-subtitle">
        Track user registration patterns and platform growth
      </p>

      <div className="card">
        <h2 style={{ marginBottom: '2rem', color: '#333' }}>
          <BarChart3 size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Key Metrics
        </h2>
        
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-number">{analytics.totalUsers}</div>
            <div className="analytics-label">Total Users</div>
            <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#28a745' }}>
              <TrendingUp size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              All time registrations
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-number">{analytics.activeUsers}</div>
            <div className="analytics-label">Active Users</div>
            <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#007bff' }}>
              <Users size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              {activeRate}% of total
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-number">{analytics.recentRegistrations}</div>
            <div className="analytics-label">Recent Registrations</div>
            <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#ffc107' }}>
              <Calendar size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Last 30 days
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-number">{analytics.todayRegistrations}</div>
            <div className="analytics-label">Today's Registrations</div>
            <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#dc3545' }}>
              <Calendar size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Current day
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '2rem', color: '#333' }}>
          <TrendingUp size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Growth Analysis
        </h2>
        
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-number">{registrationRate}%</div>
            <div className="analytics-label">Registration Rate</div>
            <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#666' }}>
              Recent registrations vs total users
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-number">{activeRate}%</div>
            <div className="analytics-label">Active Rate</div>
            <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#666' }}>
              Active users vs total users
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-number">
              {analytics.totalUsers > 0 ? (analytics.recentRegistrations / 30).toFixed(1) : 0}
            </div>
            <div className="analytics-label">Avg Daily Registrations</div>
            <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#666' }}>
              Based on last 30 days
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-number">
              {analytics.totalUsers > 0 ? (analytics.totalUsers / Math.max(1, analytics.recentRegistrations)).toFixed(1) : 0}
            </div>
            <div className="analytics-label">Growth Factor</div>
            <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#666' }}>
              Total users per recent registration
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '2rem', color: '#333' }}>
          <Calendar size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Insights
        </h2>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '8px',
            borderLeft: '4px solid #667eea'
          }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Platform Health</h4>
            <p style={{ margin: 0, color: '#666' }}>
              {analytics.totalUsers === 0 
                ? 'No users registered yet. The platform is ready for new registrations!'
                : `Your platform has ${analytics.totalUsers} total users with ${analytics.activeUsers} active accounts.`
              }
            </p>
          </div>
          
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '8px',
            borderLeft: '4px solid #28a745'
          }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Recent Activity</h4>
            <p style={{ margin: 0, color: '#666' }}>
              {analytics.recentRegistrations === 0 
                ? 'No recent registrations in the last 30 days.'
                : `${analytics.recentRegistrations} new users joined in the last 30 days, with ${analytics.todayRegistrations} registrations today.`
              }
            </p>
          </div>
          
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '8px',
            borderLeft: '4px solid #ffc107'
          }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Growth Trends</h4>
            <p style={{ margin: 0, color: '#666' }}>
              {analytics.totalUsers === 0 
                ? 'Start tracking growth by encouraging user registrations.'
                : `The platform shows a ${registrationRate}% recent registration rate and ${activeRate}% active user rate.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 