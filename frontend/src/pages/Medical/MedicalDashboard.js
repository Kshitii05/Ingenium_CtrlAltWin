import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import MedicalChatbot from './MedicalChatbot';

function MedicalDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const tiles = [
    {
      title: '👤 Personal Medical Profile',
      description: 'View and update your medical information',
      route: '/medical/profile',
      color: '#3498db'
    },
    {
      title: '🏥 Hospital Access Management',
      description: 'Control which hospitals can access your data',
      route: '/medical/access',
      color: '#e74c3c'
    },
    {
      title: '📄 Medical Records & Documents',
      description: 'View your medical history and documents',
      route: '/medical/records',
      color: '#9b59b6'
    },
    {
      title: '💰 Bills & Insurance',
      description: 'Manage medical bills and insurance claims',
      route: '/medical/bills',
      color: '#f39c12'
    },
    {
      title: '🔒 Privacy & Access Settings',
      description: 'Review audit logs and access history',
      route: '/medical/audit',
      color: '#27ae60'
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="navbar">
        <div className="navbar-brand">JanSetu Medical</div>
        <div className="navbar-menu">
          <span>Medical ID: {user?.medical_id}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-header">
          <h1>🩺 Medical Dashboard</h1>
          <p>Manage your healthcare data with complete privacy control</p>
        </div>

        <div className="card">
          <h3>Welcome, {profile?.user?.name}</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Medical ID:</label>
              <span>{user?.medical_id}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{profile?.email}</span>
            </div>
            <div className="info-item">
              <label>Blood Group:</label>
              <span>{profile?.blood_group || 'Not set'}</span>
            </div>
          </div>
        </div>

        <div className="modules-grid">
          {tiles.map((tile, index) => (
            <div
              key={index}
              className="module-card"
              onClick={() => navigate(tile.route)}
              style={{ borderLeftColor: tile.color }}
            >
              <div className="module-header">
                <h2>{tile.title}</h2>
              </div>
              <p>{tile.description}</p>
              <div className="module-action">
                <span>Open →</span>
              </div>
            </div>
          ))}
        </div>

        <div className="auth-footer" style={{ marginTop: '30px' }}>
          <Link to="/user/dashboard">← Back to User Dashboard</Link>
        </div>
      </div>
      
      {/* Medical AI Chatbot */}
      <MedicalChatbot />
    </div>
  );
}

export default MedicalDashboard;
