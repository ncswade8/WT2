import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Search, Plus, BarChart3, Calendar, MapPin, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

const WaterQuality = () => {
  const [waterQualityRecords, setWaterQualityRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterTester, setFilterTester] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchWaterQualityRecords();
  }, []);

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this water quality record?')) {
      try {
        await axios.delete(getApiUrl(`/api/water-quality/${id}`));
        toast.success('Water quality record deleted successfully');
        fetchWaterQualityRecords();
      } catch (error) {
        console.error('Error deleting water quality record:', error);
        toast.error('Failed to delete water quality record');
      }
    }
  };

  const filteredRecords = waterQualityRecords.filter(record => {
    const matchesSearch = 
      record.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.tester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.siteNotes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !filterLocation || record.location === filterLocation;
    const matchesTester = !filterTester || record.tester === filterTester;
    
    return matchesSearch && matchesLocation && matchesTester;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUniqueLocations = () => {
    return [...new Set(waterQualityRecords.map(record => record.location))];
  };

  const getUniqueTesters = () => {
    return [...new Set(waterQualityRecords.map(record => record.tester))];
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

  if (isLoading) {
    return (
      <div className="loading">
        Loading water quality records...
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Water Quality Tracking</h1>
      {!user?.isAdmin ? (
        <div style={{ 
          background: 'linear-gradient(135deg, #032720%, #99cc00%)',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: 'none'
        }}>
          <h2 style={{ 
            margin: '0 0 0.5rem', 
            color: '#ffffff',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            Welcome, {user?.firstName || 'User'}!
          </h2>
          <p style={{ 
            margin: '0', 
            color: '#ffffff',
            opacity: 0.95,
            fontSize: '1rem',
            lineHeight: '1.05'
          }}>
            You can view and manage water quality records here. Use the search and filter options to find specific records.
          </p>
        </div>
      ) : (
        <p className="page-subtitle">
          Monitor and manage water quality data across different locations
        </p>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ marginBottom: '0.5rem', color: '#333' }}>
              <Droplets size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Water Quality Records ({waterQualityRecords.length})
            </h2>
            <p style={{ color: '#666', margin: 0 }}>
              View and manage water quality testing data
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => navigate('/water-quality/analytics')}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <BarChart3 size={16} />
              Analytics
            </button>
            
            <button
              onClick={() => navigate('/water-quality/new')}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} />
              Add Record
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#666'
            }} />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="form-input"
          >
            <option value="">All Locations</option>
            {getUniqueLocations().map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
          
          <select
            value={filterTester}
            onChange={(e) => setFilterTester(e.target.value)}
            className="form-input"
          >
            <option value="">All Testers</option>
            {getUniqueTesters().map(tester => (
              <option key={tester} value={tester}>{tester}</option>
            ))}
          </select>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="empty-state">
            <h3>No Water Quality Records Found</h3>
            <p>
              {searchTerm || filterLocation || filterTester
                ? 'No records match your search criteria. Try adjusting your filters.'
                : 'No water quality records have been added yet. Add your first record to get started.'
              }
            </p>
            {!searchTerm && !filterLocation && !filterTester && (
              <button
                onClick={() => navigate('/water-quality/new')}
                className="btn btn-primary"
                style={{ marginTop: '1rem' }}
              >
                <Plus size={16} style={{ marginRight: '8px' }} />
                Add First Record
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Tester</th>
                  <th>Temperature (°C)</th>
                  <th>Turbidity (NTU)</th>
                  <th>DO (mg/L)</th>
                  <th>pH</th>
                  <th>Fecal Coliform</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => {
                  const status = getWaterQualityStatus(record.ph, record.dissolvedOxygen, record.fecalColiform);
                  return (
                    <tr key={record._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={16} style={{ color: '#666' }} />
                          {formatDate(record.date)} {record.time}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={16} style={{ color: '#666' }} />
                          {record.location}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={16} style={{ color: '#666' }} />
                          {record.tester}
                        </div>
                      </td>
                      <td>{record.temperature}°C</td>
                      <td>{record.turbidity} NTU</td>
                      <td>{record.dissolvedOxygen} mg/L</td>
                      <td>{record.ph}</td>
                      <td>{record.fecalColiform} CFU/100mL</td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          background: `${status.color}20`,
                          color: status.color,
                          border: `1px solid ${status.color}`
                        }}>
                          {status.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => navigate(`/water-quality/edit/${record._id}`)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(record._id)}
                            className="btn btn-secondary"
                            style={{ 
                              padding: '4px 8px', 
                              fontSize: '12px',
                              background: '#dc3545',
                              color: 'white'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaterQuality; 