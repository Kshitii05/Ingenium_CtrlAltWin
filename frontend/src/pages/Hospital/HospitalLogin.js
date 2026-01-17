import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import '../User/Auth.css';

function HospitalLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    hospital_name: '',
    hfr_id: ''
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
      const response = await api.post('/auth/hospital/login', formData);
      
      if (response.data.success) {
        login({ ...response.data.hospital, type: 'hospital' }, response.data.token);
        navigate('/hospital/dashboard');
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
            <h1>🏥 Hospital Login</h1>
            <p>Access patient records and management system</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Registered Hospital Name</label>
              <input
                type="text"
                name="hospital_name"
                value={formData.hospital_name}
                onChange={handleChange}
                placeholder="As per Ayushman Bharat Digital Mission"
                required
              />
            </div>

            <div className="form-group">
              <label>HFR Facility ID (Password)</label>
              <input
                type="password"
                name="hfr_id"
                value={formData.hfr_id}
                onChange={handleChange}
                placeholder="Health Facility Registry ID"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p>New hospital? <Link to="/hospital/register">Register</Link></p>
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalLogin;
