import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

function MedicalAccountCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    blood_group: '',
    allergies: '',
    chronic_conditions: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAccountStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAccountStatus = async () => {
    try {
      const response = await api.get('/medical/account/status');
      
      if (response.data.exists) {
        navigate('/medical/login');
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/medical/account/create', {
        email: formData.email,
        password: formData.password,
        blood_group: formData.blood_group,
        allergies: formData.allergies,
        chronic_conditions: formData.chronic_conditions,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone
      });

      if (response.data.success) {
        alert('Medical account created successfully!');
        navigate('/medical/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create medical account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '700px' }}>
        <div className="auth-card">
          <div className="auth-header">
            <h1>🩺 Create Medical Account</h1>
            <p>Set up your healthcare identity</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
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

            <div className="form-group">
              <label>Create Password</label>
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

            <div className="form-group">
              <label>Blood Group (Optional)</label>
              <select name="blood_group" value={formData.blood_group} onChange={handleChange}>
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div className="form-group">
              <label>Allergies (Optional)</label>
              <textarea
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="List any allergies"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label>Chronic Conditions (Optional)</label>
              <textarea
                name="chronic_conditions"
                value={formData.chronic_conditions}
                onChange={handleChange}
                placeholder="List any chronic conditions"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label>Emergency Contact Name (Optional)</label>
              <input
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Emergency Contact Phone (Optional)</label>
              <input
                type="tel"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Medical Account'}
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

export default MedicalAccountCreate;
