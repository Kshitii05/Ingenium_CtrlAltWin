import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './UserDashboard.css';

function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user || user.type !== 'user') {
      navigate('/user/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const modules = [
    {
      id: 'medical',
      title: '🩺 Medical Services',
      description: 'Access your healthcare records and manage hospital permissions',
      route: '/medical/create',
      color: '#e74c3c'
    },
    {
      id: 'farmer',
      title: '🌾 Farmer Services',
      description: 'Manage your agricultural services and applications',
      route: '/farmer/create',
      color: '#27ae60'
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="navbar">
        <div className="navbar-brand">Ingenium</div>
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
              onClick={() => navigate(module.route)}
              style={{ borderLeftColor: module.color }}
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
