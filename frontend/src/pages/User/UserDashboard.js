import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './UserDashboard.css';

function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.type !== 'user') {
      navigate('/user/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMedicalClick = async () => {
    setLoading(true);
    try {
      const response = await api.get('/medical/account/status');

      if (response.data.exists) {
        // Medical account exists, go to login
        navigate('/medical/login');
      } else {
        // No medical account, go to create
        navigate('/medical/create');
      }
    } catch (error) {
      console.error('Error checking medical account status:', error);
      alert('Failed to check medical account status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFarmerClick = async () => {
    setLoading(true);
    try {
      const response = await api.get('/farmer/account/status');

      if (response.data.exists) {
        // Farmer account exists, go to login page
        navigate('/farmer/login');
      } else {
        // No farmer account, show KYC registration option
        navigate('/farmer/register');
      }
    } catch (error) {
      console.error('Error checking farmer account status:', error);
      alert('Failed to check farmer account status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const modules = [
    {
      id: 'medical',
      title: '🩺 Medical Services',
      description: 'Access your healthcare records and manage hospital permissions',
      onClick: handleMedicalClick,
      color: '#e74c3c'
    },
    {
      id: 'farmer',
      title: '🌾 Farmer Services',
      description: 'Register for KYC and manage your agricultural services',
      onClick: handleFarmerClick,
      color: '#27ae60'
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="navbar">
        <div className="navbar-brand">JanSetu</div>
        <div className="navbar-menu">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-header">
          <h1>User Dashboard</h1>
          <p>Select a service module to continue</p>
        </div>

        <div className="modules-grid">
          {modules.map(module => (
            <div 
              key={module.id}
              className="module-card"
              onClick={() => {
                if (module.onClick) {
                  module.onClick();
                } else {
                  navigate(module.route);
                }
              }}
              style={{ borderLeftColor: module.color, cursor: loading ? 'wait' : 'pointer' }}
            >
              <div className="module-header">
                <h2>{module.title}</h2>
              </div>
              <p>{module.description}</p>
              <div className="module-action">
                <span>Access Module →</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: '30px' }}>
          <h3>Your Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{user?.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{user?.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
