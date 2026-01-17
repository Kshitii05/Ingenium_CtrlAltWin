import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './Auth.css';

function UserRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    aadhaar_number: '',
    name: '',
    dob: '',
    gender: 'Male',
    phone: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.aadhaar_number.length !== 12) {
      setError('Aadhaar number must be 12 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/user/register', {
        aadhaar_number: formData.aadhaar_number,
        name: formData.name,
        dob: formData.dob,
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        password: formData.password
      });
      
      if (response.data.success) {
        login({ ...response.data.user, type: 'user' }, response.data.token);
        navigate('/user/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error('Registration error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '600px' }}>
        <div className="auth-card">
          <div className="auth-header">
            <h1>👤 User Registration</h1>
            <p>Create your digital identity account</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Aadhaar Number</label>
              <input
                type="text"
                name="aadhaar_number"
                value={formData.aadhaar_number}
                onChange={handleChange}
                maxLength="12"
                pattern="[0-9]{12}"
                required
              />
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
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

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/user/login">Sign in here</Link></p>
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserRegister;
