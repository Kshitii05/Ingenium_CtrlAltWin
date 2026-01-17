import React from 'react';
import { useAuth } from '../../context/AuthContext';

function HospitalProfile() {
  const { user } = useAuth();

  return (
    <div className="hospital-profile-container">
      <h2>Hospital Profile</h2>
      <p>View your hospital information</p>

      <div className="profile-card card">
        <h3>🏥 Hospital Information</h3>
        
        <div className="profile-section">
          <div className="profile-row">
            <span className="profile-label">Hospital Name:</span>
            <span className="profile-value">{user?.hospital_name || 'N/A'}</span>
          </div>

          <div className="profile-row">
            <span className="profile-label">Hospital Unique ID:</span>
            <span className="profile-value">{user?.hospital_unique_id || 'N/A'}</span>
          </div>

          <div className="profile-row">
            <span className="profile-label">Email:</span>
            <span className="profile-value">{user?.email || 'N/A'}</span>
          </div>

          <div className="profile-row">
            <span className="profile-label">Phone:</span>
            <span className="profile-value">{user?.phone || 'N/A'}</span>
          </div>

          <div className="profile-row">
            <span className="profile-label">HFR Facility ID:</span>
            <span className="profile-value">************</span>
          </div>
        </div>
      </div>

      <div className="info-card card">
        <h3>ℹ️ System Information</h3>
        <div className="info-content">
          <p><strong>Access Level:</strong> Hospital Administrator</p>
          <p><strong>Capabilities:</strong></p>
          <ul>
            <li>Query patient records using Patient Unique ID</li>
            <li>View patient-approved medical documents</li>
            <li>Upload medical records for patients</li>
            <li>View upload history</li>
          </ul>
        </div>
      </div>

      <div className="security-card card">
        <h3>🔒 Security & Privacy</h3>
        <div className="security-content">
          <p>✅ All patient data access is logged and audited</p>
          <p>✅ You can only view documents that patients have approved for hospital access</p>
          <p>✅ Documents you upload are automatically visible to the patient</p>
          <p>⚠️ Unauthorized access attempts are monitored and reported</p>
        </div>
      </div>
    </div>
  );
}

export default HospitalProfile;
