import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function HospitalDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.type !== 'hospital') {
      navigate('/hospital/login');
      return;
    }
    fetchDashboard();
    fetchPatients();
  }, [user, navigate]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/hospital/dashboard');
      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/hospital/patients');
      setPatients(response.data.patients);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = async (medicalId) => {
    try {
      const response = await api.get(`/hospital/patient/${medicalId}`);
      setPatientDetails(response.data.patient);
      setSelectedPatient(medicalId);
    } catch (error) {
      alert('Failed to fetch patient details: ' + (error.response?.data?.message || ''));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="navbar">
        <div className="navbar-brand">Ingenium Hospital</div>
        <div className="navbar-menu">
          <span>Welcome, {user?.hospital_name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-header">
          <h1>🏥 Hospital Dashboard</h1>
          <p>Manage patient access and records</p>
        </div>

        {dashboard && (
          <div className="grid grid-3">
            <div className="card" style={{ background: '#e3f2fd' }}>
              <h4>Active Patients</h4>
              <h2>{dashboard.active_patients}</h2>
            </div>
            <div className="card" style={{ background: '#f3e5f5' }}>
              <h4>Total Records</h4>
              <h2>{dashboard.total_records}</h2>
            </div>
            <div className="card" style={{ background: '#fff3e0' }}>
              <h4>Total Bills</h4>
              <h2>{dashboard.total_bills}</h2>
            </div>
          </div>
        )}

        <div className="card">
          <h2>Patients with Active Access</h2>

          {patients.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <p>No patients have granted access yet</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Medical ID</th>
                  <th>Patient Name</th>
                  <th>Contact</th>
                  <th>Access Granted</th>
                  <th>Expires</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(access => (
                  <tr key={access.id}>
                    <td><strong>{access.medicalAccount?.medical_id}</strong></td>
                    <td>
                      {access.medicalAccount?.user?.name}<br />
                      <small>{access.medicalAccount?.user?.gender}, {access.medicalAccount?.user?.dob}</small>
                    </td>
                    <td>
                      {access.medicalAccount?.user?.phone}<br />
                      <small>{access.medicalAccount?.email}</small>
                    </td>
                    <td>{new Date(access.granted_at).toLocaleDateString()}</td>
                    <td>{new Date(access.expires_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleViewPatient(access.medicalAccount.medical_id)}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {patientDetails && (
          <div className="card" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Patient Details: {patientDetails.medical_id}</h2>
              <button onClick={() => setPatientDetails(null)} className="btn btn-secondary">Close</button>
            </div>

            <h3 style={{ marginTop: '20px' }}>Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name:</label>
                <span>{patientDetails.user?.name}</span>
              </div>
              <div className="info-item">
                <label>DOB:</label>
                <span>{patientDetails.user?.dob}</span>
              </div>
              <div className="info-item">
                <label>Gender:</label>
                <span>{patientDetails.user?.gender}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <span>{patientDetails.user?.phone}</span>
              </div>
            </div>

            {patientDetails.profile && (
              <>
                <h3 style={{ marginTop: '20px' }}>Medical Profile</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Blood Group:</label>
                    <span>{patientDetails.profile.blood_group || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Allergies:</label>
                    <span>{patientDetails.profile.allergies || 'None'}</span>
                  </div>
                  <div className="info-item">
                    <label>Chronic Conditions:</label>
                    <span>{patientDetails.profile.chronic_conditions || 'None'}</span>
                  </div>
                  <div className="info-item">
                    <label>Current Medications:</label>
                    <span>{patientDetails.profile.current_medications || 'None'}</span>
                  </div>
                </div>
              </>
            )}

            {patientDetails.records && patientDetails.records.length > 0 && (
              <>
                <h3 style={{ marginTop: '20px' }}>Recent Medical Records</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Title</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientDetails.records.slice(0, 5).map(record => (
                      <tr key={record.id}>
                        <td><span className="badge badge-info">{record.record_type}</span></td>
                        <td>{record.title}</td>
                        <td>{new Date(record.record_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HospitalDashboard;
