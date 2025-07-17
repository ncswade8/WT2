import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Droplets, Save, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const WaterQualityForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        if (response.data.success) {
          setUsers(response.data.users);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users. Please try again.');
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/water-quality', data);
      
      if (response.data.success) {
        toast.success('Water quality record created successfully!');
        navigate('/water-quality');
      }
    } catch (error) {
      console.error('Water quality creation error:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(errorMessages);
      } else {
        toast.error('Failed to create water quality record. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM format
  };

  return (
    <div>
      <h1 className="page-title">Add Water Quality Record</h1>
      <p className="page-subtitle">
        Record water quality measurements and observations
      </p>
      
      <div className="form-container">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <button
              onClick={() => navigate('/water-quality')}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '1rem' }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h2 className="form-title" style={{ margin: 0 }}>
              <Droplets size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              New Water Quality Record
            </h2>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {/* Time */}
              <div className="form-group">
                <label className="form-label">Time</label>
                <input
                  type="time"
                  className={`form-input ${errors.time ? 'error' : ''}`}
                  defaultValue={getCurrentTime()}
                  {...register('time', { 
                    required: 'Time is required'
                  })}
                />
                {errors.time && (
                  <div className="error">{errors.time.message}</div>
                )}
              </div>

              {/* Tester - Dropdown */}
              <div className="form-group">
                <label className="form-label">Tester Name</label>
                <select
                  className={`form-input ${errors.tester ? 'error' : ''}`}
                  {...register('tester', { 
                    required: 'Please select a tester'
                  })}
                  disabled={isLoadingUsers}
                >
                  <option value="">Select a tester...</option>
                  {users.map(user => (
                    <option key={user._id} value={`${user.firstName} ${user.lastName}`}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
                {errors.tester && (
                  <div className="error">{errors.tester.message}</div>
                )}
                {isLoadingUsers && (
                  <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    Loading users...
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className={`form-input ${errors.location ? 'error' : ''}`}
                  placeholder="Enter testing location"
                  {...register('location', { 
                    required: 'Location is required',
                    minLength: { value: 2, message: 'Location must be at least 2 characters' }
                  })}
                />
                {errors.location && (
                  <div className="error">{errors.location.message}</div>
                )}
              </div>

              {/* Temperature */}
              <div className="form-group">
                <label className="form-label">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  className={`form-input ${errors.temperature ? 'error' : ''}`}
                  placeholder="Enter temperature"
                  {...register('temperature', { 
                    required: 'Temperature is required',
                    min: { value: -50, message: 'Temperature must be at least -50°C' },
                    max: { value: 100, message: 'Temperature must be at most 100°C' }
                  })}
                />
                {errors.temperature && (
                  <div className="error">{errors.temperature.message}</div>
                )}
              </div>

              {/* Turbidity */}
              <div className="form-group">
                <label className="form-label">Turbidity (NTU)</label>
                <input
                  type="number"
                  step="0.1"
                  className={`form-input ${errors.turbidity ? 'error' : ''}`}
                  placeholder="Enter turbidity"
                  {...register('turbidity', { 
                    required: 'Turbidity is required',
                    min: { value: 0, message: 'Turbidity must be at least 0 NTU' },
                    max: { value: 1000, message: 'Turbidity must be at most 1000 NTU' }
                  })}
                />
                {errors.turbidity && (
                  <div className="error">{errors.turbidity.message}</div>
                )}
              </div>

              {/* Dissolved Oxygen */}
              <div className="form-group">
                <label className="form-label">Dissolved Oxygen (mg/L)</label>
                <input
                  type="number"
                  step="0.1"
                  className={`form-input ${errors.dissolvedOxygen ? 'error' : ''}`}
                  placeholder="Enter dissolved oxygen"
                  {...register('dissolvedOxygen', { 
                    required: 'Dissolved oxygen is required',
                    min: { value: 0, message: 'Dissolved oxygen must be at least 0 mg/L' },
                    max: { value: 20, message: 'Dissolved oxygen must be at most 20 mg/L' }
                  })}
                />
                {errors.dissolvedOxygen && (
                  <div className="error">{errors.dissolvedOxygen.message}</div>
                )}
              </div>

              {/* pH */}
              <div className="form-group">
                <label className="form-label">pH</label>
                <input
                  type="number"
                  step="0.1"
                  className={`form-input ${errors.ph ? 'error' : ''}`}
                  placeholder="Enter pH value"
                  {...register('ph', { 
                    required: 'pH is required',
                    min: { value: 0, message: 'pH must be at least 0' },
                    max: { value: 14, message: 'pH must be at most 14' }
                  })}
                />
                {errors.ph && (
                  <div className="error">{errors.ph.message}</div>
                )}
              </div>

              {/* Fecal Coliform */}
              <div className="form-group">
                <label className="form-label">Fecal Coliform (CFU/100mL)</label>
                <input
                  type="number"
                  step="1"
                  className={`form-input ${errors.fecalColiform ? 'error' : ''}`}
                  placeholder="Enter fecal coliform count"
                  {...register('fecalColiform', { 
                    required: 'Fecal coliform is required',
                    min: { value: 0, message: 'Fecal coliform must be at least 0' }
                  })}
                />
                {errors.fecalColiform && (
                  <div className="error">{errors.fecalColiform.message}</div>
                )}
              </div>

              {/* Weather */}
              <div className="form-group">
                <label className="form-label">Weather Conditions</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Sunny, Cloudy, Rainy"
                  {...register('weather')}
                />
              </div>
            </div>

            {/* Notes - Full Width */}
            <div className="form-group">
              <label className="form-label">Site Notes</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="Enter any observations or notes about the testing site..."
                {...register('siteNotes')}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="Enter any additional notes or comments..."
                {...register('additionalNotes')}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={16} />
                {isLoading ? 'Creating Record...' : 'Save Record'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/water-quality')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WaterQualityForm; 