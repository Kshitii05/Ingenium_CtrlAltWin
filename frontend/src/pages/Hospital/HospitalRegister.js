import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function HospitalRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    hospital_name: '',
    facility_id: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    specializations: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/hospital/register', {
        ...formData,
        specializations: formData.specializations.split(',').map(s => s.trim())
      });
      
      if (response.data.success) {
        login({ ...response.data.hospital, type: 'hospital' }, response.data.token);
        navigate('/hospital/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '600px' }}>
        <div className="auth-card">
          <div className="auth-header">
            <h1>🏥 Hospital Registration</h1>
            <p>Register your hospital on Ingenium platform</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Hospital Name</label>
              <input
                type="text"
                name="hospital_name"
                value={formData.hospital_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Facility ID (HFR)</label>
              <input
                type="text"
                name="facility_id"
                value={formData.facility_id}
                onChange={handleChange}
                required
                placeholder="Health Facility Registry ID"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>Specializations (comma-separated)</label>
              <input
                type="text"
                name="specializations"
                value={formData.specializations}
                onChange={handleChange}
                placeholder="e.g., Cardiology, Neurology, Pediatrics"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Registering...' : 'Register Hospital'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already registered? <Link to="/hospital/login">Login</Link></p>
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HospitalRegister;
