import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import PatientAccess from './PatientAccess';
import UploadedRecords from './UploadedRecords';
import HospitalProfile from './HospitalProfile';
import './HospitalDashboard.css';

function HospitalDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('patient-access');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.type !== 'hospital') {
      navigate('/hospital/login');
      return;
    }
    setLoading(false);
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="hospital-dashboard">
      {/* Navigation Bar */}
      <div className="hospital-navbar">
        <div className="navbar-brand">
          <h2>🏥 {user?.hospital_name}</h2>
        </div>
        <div className="navbar-menu">
          <span className="welcome-text">Welcome, {user?.hospital_name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="hospital-tabs">
        <button
          className={`tab-button ${activeTab === 'patient-access' ? 'active' : ''}`}
          onClick={() => setActiveTab('patient-access')}
        >
          <span className="tab-icon">👤</span>
          Patient Access
        </button>
        <button
          className={`tab-button ${activeTab === 'uploaded-records' ? 'active' : ''}`}
          onClick={() => setActiveTab('uploaded-records')}
        >
          <span className="tab-icon">📄</span>
          Uploaded Records
        </button>
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className="tab-icon">⚙️</span>
          Profile
        </button>
      </div>

      {/* Tab Content */}
      <div className="hospital-content">
        {activeTab === 'patient-access' && <PatientAccess />}
        {activeTab === 'uploaded-records' && <UploadedRecords />}
        {activeTab === 'profile' && <HospitalProfile />}
      </div>
    </div>
  );
}

export default HospitalDashboard;
