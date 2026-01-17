import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function FarmerAccountCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState('check');
  const [formData, setFormData] = useState({
    land_area: '',
    land_location: '',
    crop_types: [],
    bank_account: '',
    bank_ifsc: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAccountStatus();
  }, []);

  const checkAccountStatus = async () => {
    try {
      const response = await api.get('/farmer/account/status');
      
      if (response.data.exists) {
        navigate('/farmer/dashboard');
      } else {
        setStep('create');
      }
    } catch (err) {
      setError('Failed to check account status');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/farmer/account/create', {
        ...formData,
        crop_types: formData.crop_types.split(',').map(c => c.trim())
      });

      if (response.data.success) {
        alert('✅ Farmer account created successfully!');
        navigate('/farmer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'check') {
    return <div className="loading">Checking account status...</div>;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🌾 Create Farmer Account</h1>
            <p>Register for agricultural services</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Land Area (in acres)</label>
              <input
                type="number"
                step="0.01"
                name="land_area"
                value={formData.land_area}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Land Location</label>
              <textarea
                name="land_location"
                value={formData.land_location}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Crop Types (comma-separated)</label>
              <input
                type="text"
                name="crop_types"
                value={formData.crop_types}
                onChange={handleChange}
                placeholder="e.g., Wheat, Rice, Cotton"
                required
              />
            </div>

            <div className="form-group">
              <label>Bank Account Number</label>
              <input
                type="text"
                name="bank_account"
                value={formData.bank_account}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Bank IFSC Code</label>
              <input
                type="text"
                name="bank_ifsc"
                value={formData.bank_ifsc}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating...' : 'Create Farmer Account'}
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate('/user/dashboard')} 
              className="btn btn-secondary btn-block"
              style={{ marginTop: '10px' }}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FarmerAccountCreate;
