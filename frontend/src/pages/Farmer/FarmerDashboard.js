import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function FarmerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in as farmer
    if (!user) {
      navigate('/farmer/login');
      return;
    }
    // If logged in as regular user but not as farmer, redirect to login
    if (user.type !== 'farmer') {
      navigate('/farmer/login');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching farmer profile...');
      const response = await api.get('/farmer/profile');
      console.log('Profile response:', response.data);
      setProfile(response.data.profile);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear all authentication data
    logout();
    // Redirect to home page
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="navbar">
        <div className="navbar-brand">JanSetu Farmer</div>
        <div className="navbar-menu">
          <span>KYC ID: {profile?.kyc_id}</span>
          <Link to="/user/dashboard" className="btn btn-secondary">User Dashboard</Link>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-header">
          <h1>🌾 Farmer Dashboard</h1>
          <p>Manage your agricultural services and applications</p>
        </div>

        <div className="card">
          <h3>Farmer Profile</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>KYC ID:</label>
              <span>{profile?.kyc_id}</span>
            </div>
            <div className="info-item">
              <label>Name:</label>
              <span>{profile?.full_name}</span>
            </div>
            <div className="info-item">
              <label>Mobile:</label>
              <span>{profile?.mobile}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{profile?.email}</span>
            </div>
            <div className="info-item">
              <label>State:</label>
              <span>{profile?.state}</span>
            </div>
            <div className="info-item">
              <label>Land Area:</label>
              <span>{profile?.land_area ? `${profile.land_area} acres` : 'Not specified'}</span>
            </div>
            <div className="info-item">
              <label>Crop Type:</label>
              <span>{profile?.crop_type || 'Not specified'}</span>
            </div>
            <div className="info-item">
              <label>KYC Status:</label>
              <span className={`badge badge-${profile?.kyc_status === 'verified' ? 'success' : 'warning'}`}>
                {profile?.kyc_status}
              </span>
            </div>
          </div>
        </div>

        <div className="modules-grid">
          <div 
            className="module-card"
            onClick={() => navigate('/farmer/applications')}
            style={{ borderLeftColor: '#27ae60' }}
          >
            <div className="module-header">
              <h2>📋 Applications</h2>
            </div>
            <p>View and submit applications for subsidies, loans, and schemes</p>
            <div className="module-action">
              <span>View Applications →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmerDashboard;
