import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function FarmerLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    kyc_id: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const response = await api.post('/farmer/login', formData);
      
      if (response.data.success) {
        login({ 
          ...response.data.farmer, 
          type: 'farmer' 
        }, response.data.token);
        navigate('/farmer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🌾 Farmer Login</h1>
            <p>Access your agricultural services account</p>
            <div style={{ 
              background: '#e3f2fd', 
              padding: '12px', 
              borderRadius: '8px', 
              marginTop: '15px',
              border: '1px solid #2196f3'
            }}>
              <small style={{ color: '#1976d2', display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                🔐 Login Credentials:
              </small>
              <small style={{ color: '#1976d2', display: 'block' }}>
                • <strong>Username:</strong> Your Email Address
              </small>
              <small style={{ color: '#1976d2', display: 'block', marginTop: '3px' }}>
                • <strong>Password:</strong> Your KYC ID (Format: FRM-STATE-YEAR-XXXXXX)
              </small>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your registered email"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>KYC ID</label>
              <input
                type="text"
                name="kyc_id"
                value={formData.kyc_id}
                onChange={handleChange}
                placeholder="Enter your KYC ID (e.g., FRM-MH-2026-A1B2C3)"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
            <p style={{ marginBottom: '15px' }}>Don't have an account?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link 
                to="/farmer/register" 
                className="btn btn-secondary btn-block"
                style={{ textDecoration: 'none' }}
              >
                🆕 Register New Farmer (KYC)
              </Link>
              <Link 
                to="/" 
                style={{ color: '#666', fontSize: '14px', textDecoration: 'none' }}
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmerLogin;
