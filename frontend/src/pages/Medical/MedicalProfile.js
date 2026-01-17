import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function MedicalProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    allergies: '',
    chronic_conditions: '',
    current_medications: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_group: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || user.type !== 'medical_user') {
      navigate('/medical/login');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/medical/profile');
      setProfile(response.data.profile);
      setFormData({
        allergies: response.data.profile.allergies || '',
        chronic_conditions: response.data.profile.chronic_conditions || '',
        current_medications: response.data.profile.current_medications || '',
        emergency_contact_name: response.data.profile.emergency_contact_name || '',
        emergency_contact_phone: response.data.profile.emergency_contact_phone || '',
        blood_group: response.data.profile.blood_group || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
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
    setMessage('');

    try {
      await api.put('/medical/profile', formData);
      setMessage('✅ Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      setMessage('❌ Failed to update profile');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="navbar">
        <div className="navbar-brand">Ingenium Medical</div>
        <div className="navbar-menu">
          <Link to="/medical/dashboard" className="btn btn-secondary">← Dashboard</Link>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>👤 Personal Medical Profile</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn btn-primary">
                Edit Profile
              </button>
            )}
          </div>

          {message && <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>{message}</div>}

          <h3 style={{ marginTop: '30px' }}>Personal Information (Non-Editable)</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{profile?.user?.name}</span>
            </div>
            <div className="info-item">
              <label>Date of Birth:</label>
              <span>{profile?.user?.dob}</span>
            </div>
            <div className="info-item">
              <label>Gender:</label>
              <span>{profile?.user?.gender}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{profile?.user?.phone}</span>
            </div>
          </div>

          <h3 style={{ marginTop: '30px' }}>Medical Information</h3>

          {editing ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Blood Group</label>
                <select name="blood_group" value={formData.blood_group} onChange={handleChange}>
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="form-group">
                <label>Allergies</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows="3"
                  placeholder="List any known allergies..."
                />
              </div>

              <div className="form-group">
                <label>Chronic Conditions</label>
                <textarea
                  name="chronic_conditions"
                  value={formData.chronic_conditions}
                  onChange={handleChange}
                  rows="3"
                  placeholder="List any chronic conditions..."
                />
              </div>

              <div className="form-group">
                <label>Current Medications</label>
                <textarea
                  name="current_medications"
                  value={formData.current_medications}
                  onChange={handleChange}
                  rows="3"
                  placeholder="List current medications..."
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label>Blood Group:</label>
                <span>{profile?.blood_group || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Allergies:</label>
                <span>{profile?.allergies || 'None'}</span>
              </div>
              <div className="info-item">
                <label>Chronic Conditions:</label>
                <span>{profile?.chronic_conditions || 'None'}</span>
              </div>
              <div className="info-item">
                <label>Current Medications:</label>
                <span>{profile?.current_medications || 'None'}</span>
              </div>
              <div className="info-item">
                <label>Emergency Contact:</label>
                <span>{profile?.emergency_contact_name || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Emergency Phone:</label>
                <span>{profile?.emergency_contact_phone || 'Not set'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MedicalProfile;
