import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Droplets, TrendingUp, MapPin, User, Calendar, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getApiUrl } from '../config/api';

const WaterQualityAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [waterQualityRecords, setWaterQualityRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
    fetchWaterQualityRecords();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/water-quality-analytics'));
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching water quality analytics:', error);
      toast.error('Failed to load analytics');
    }
  };

  const fetchWaterQualityRecords = async () => {
    try {
      const response = await axios.get(getApiUrl('/api/water-quality'));
      if (response.data.success) {
        setWaterQualityRecords(response.data.waterQuality);
      }
    } catch (error) {
      console.error('Error fetching water quality records:', error);
      toast.error('Failed to load water quality records');
    } finally {
      setIsLoading(false);
    }
  };

  const getWaterQualityStatus = (ph, dissolvedOxygen, fecalColiform) => {
    if (ph >= 6.5 && ph <= 8.5 && dissolvedOxygen >= 5 && fecalColiform <= 200) {
      return { status: 'Good', color: '#28a745' };
    } else if (ph >= 6.0 && ph <= 9.0 && dissolvedOxygen >= 3 && fecalColiform <= 1000) {
      return { status: 'Fair', color: '#ffc107' };
    } else {
      return { status: 'Poor', color: '#dc3545' };
    }
  };

  const calculateQualityStats = () => {
    if (!waterQualityRecords.length) return { good: 0, fair: 0, poor: 0, total: 0 };

    const stats = waterQualityRecords.reduce((acc, record) => {
      const status = getWaterQualityStatus(record.ph, record.dissolvedOxygen, record.fecalColiform);
      acc[status.status.toLowerCase()]++;
      acc.total++;
      return acc;
    }, { good: 0, fair: 0, poor: 0, total: 0 });

    return stats;
  };

  const getAverageValues = () => {
    if (!waterQualityRecords.length) return {};

    const totals = waterQualityRecords.reduce((acc, record) => {
      acc.temperature += record.temperature;
      acc.turbidity += record.turbidity;
      acc.dissolvedOxygen += record.dissolvedOxygen;
      acc.ph += record.ph;
      acc.fecalColiform += record.fecalColiform;
      return acc;
    }, { temperature: 0, turbidity: 0, dissolvedOxygen: 0, ph: 0, fecalColiform: 0 });

    const count = waterQualityRecords.length;
    return {
      temperature: (totals.temperature / count).toFixed(1),
      turbidity: (totals.turbidity / count).toFixed(1),
      dissolvedOxygen: (totals.dissolvedOxygen / count).toFixed(1),
      ph: (totals.ph / count).toFixed(1),
      fecalColiform: Math.round(totals.fecalColiform / count)
    };
  };

  const getLocationStats = () => {
    const locationStats = {};
    waterQualityRecords.forEach(record => {
      if (!locationStats[record.location]) {
        locationStats[record.location] = 0;
      }
      locationStats[record.location]++;
    });
    return locationStats;
  };

  if (isLoading) {
    return (
      <div className="loading">
        Loading water quality analytics...
      </div>
    );
  }

  const qualityStats = calculateQualityStats();
  const averageValues = getAverageValues();
  const locationStats = getLocationStats();

  return (
    <div>
      <h1 className="page-title">Water Quality Analytics</h1>
      <p className="page-subtitle">
        Comprehensive analysis of water quality data and trends
      </p>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/water-quality')}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '1rem' }}
        >
          <ArrowLeft size={16} />
          Back to Records
        </button>
      </div>

      {analytics && (
        <div className="card">
          <h2 style={{ marginBottom: '2rem', color: '#333' }}>
            <BarChart3 size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Key Metrics
          </h2>
          
          <div className="analytics-grid">
            <div className="analytics-card">
              <div className="analytics-number">{analytics.totalRecords}</div>
              <div className="analytics-label">Total Records</div>
            </div>
            
            <div className="analytics-card">
              <div className="analytics-number">{analytics.uniqueLocations}</div>
              <div className="analytics-label">Unique Locations</div>
            </div>
            
            <div className="analytics-card">
              <div className="analytics-number">{analytics.uniqueTesters}</div>
              <div className="analytics-label">Unique Testers</div>
            </div>
            
            <div className="analytics-card">
              <div className="analytics-number">{analytics.recentRecords}</div>
              <div className="analytics-label">Recent Records (30 days)</div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 style={{ marginBottom: '2rem', color: '#333' }}>
          <Droplets size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Water Quality Status Distribution
        </h2>
        
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-number" style={{ color: '#28a745' }}>{qualityStats.good}</div>
            <div className="analytics-label">Good Quality</div>
            <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#666' }}>
              {qualityStats.total > 0 ? ((qualityStats.good / qualityStats.total) * 100).toFixed(1) : 0}% of total
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-number" style={{ color: '#ffc107' }}>{qualityStats.fair}</div>
            <div className="analytics-label">Fair Quality</div>
            <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#666' }}>
              {qualityStats.total > 0 ? ((qualityStats.fair / qualityStats.total) * 100).toFixed(1) : 0}% of total
            </div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-number" style={{ color: '#dc3545' }}>{qualityStats.poor}</div>
            <div className="analytics-label">Poor Quality</div>
            <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#666' }}>
              {qualityStats.total > 0 ? ((qualityStats.poor / qualityStats.total) * 100).toFixed(1) : 0}% of total
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '2rem', color: '#333' }}>
          <TrendingUp size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Average Values
        </h2>
        
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-number">{averageValues.temperature}°C</div>
            <div className="analytics-label">Average Temperature</div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-number">{averageValues.turbidity} NTU</div>
            <div className="analytics-label">Average Turbidity</div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-number">{averageValues.dissolvedOxygen} mg/L</div>
            <div className="analytics-label">Average Dissolved Oxygen</div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-number">{averageValues.ph}</div>
            <div className="analytics-label">Average pH</div>
          </div>
          
          <div className="analytics-card">
            <div className="analytics-number">{averageValues.fecalColiform}</div>
            <div className="analytics-label">Average Fecal Coliform (CFU/100mL)</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '2rem', color: '#333' }}>
          <MapPin size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Testing Locations
        </h2>
        
        <div className="analytics-grid">
          {Object.entries(locationStats).map(([location, count]) => (
            <div key={location} className="analytics-card">
              <div className="analytics-number">{count}</div>
              <div className="analytics-label">{location}</div>
              <div style={{ marginTop: '0.5rem', fontSize: '14px', color: '#666' }}>
                Records
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '2rem', color: '#333' }}>
          <Calendar size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Quality Insights
        </h2>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '8px',
            borderLeft: '4px solid #667eea'
          }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Data Coverage</h4>
            <p style={{ margin: 0, color: '#666' }}>
              {waterQualityRecords.length === 0 
                ? 'No water quality records available yet. Start adding records to see analytics.'
                : `You have ${waterQualityRecords.length} water quality records from ${Object.keys(locationStats).length} different locations.`
              }
            </p>
          </div>
          
          {qualityStats.total > 0 && (
            <>
              <div style={{ 
                background: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '8px',
                borderLeft: '4px solid #28a745'
              }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Quality Assessment</h4>
                <p style={{ margin: 0, color: '#666' }}>
                  {qualityStats.good > 0 
                    ? `${qualityStats.good} records (${((qualityStats.good / qualityStats.total) * 100).toFixed(1)}%) show good water quality.`
                    : 'No records show good water quality.'
                  }
                </p>
              </div>
              
              <div style={{ 
                background: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '8px',
                borderLeft: '4px solid #ffc107'
              }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Monitoring Recommendations</h4>
                <p style={{ margin: 0, color: '#666' }}>
                  {qualityStats.poor > 0 
                    ? `${qualityStats.poor} records show poor water quality and may require immediate attention.`
                    : 'All recorded water quality measurements are within acceptable ranges.'
                  }
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterQualityAnalytics; 