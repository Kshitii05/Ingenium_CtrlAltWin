import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function HospitalAccessManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeAccess, setActiveAccess] = useState([]);
  const [showGrantForm, setShowGrantForm] = useState(false);
  const [formData, setFormData] = useState({
    hospital_identifier: '',
    scopes: [],
    permission_type: 'read_only',
    duration: '7'
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Available access scopes with descriptions
  const accessScopes = [
    { 
      id: 'profile', 
      name: 'Personal Profile', 
      description: 'Basic information, contact details, emergency contacts',
      icon: '👤'
    },
    { 
      id: 'records', 
      name: 'Medical Records', 
      description: 'Medical history, diagnoses, prescriptions, test results',
      icon: '📋'
    },
    { 
      id: 'bills', 
      name: 'Medical Bills', 
      description: 'Treatment costs, payment history, pending bills',
      icon: '💰'
    },
    { 
      id: 'insurance', 
      name: 'Insurance Information', 
      description: 'Insurance coverage, claims, policy details',
      icon: '🛡️'
    },
    { 
      id: 'appointments', 
      name: 'Appointments', 
      description: 'Past and upcoming appointments, consultation notes',
      icon: '📅'
    },
    { 
      id: 'prescriptions', 
      name: 'Prescriptions', 
      description: 'Current medications, prescription history',
      icon: '💊'
    },
    { 
      id: 'lab_results', 
      name: 'Lab Results', 
      description: 'Blood tests, imaging, pathology reports',
      icon: '🔬'
    },
    { 
      id: 'allergies', 
      name: 'Allergies & Conditions', 
      description: 'Known allergies, chronic conditions, disabilities',
      icon: '⚠️'
    }
  ];

  useEffect(() => {
    if (!user || user.type !== 'medical_user') {
      navigate('/medical/login');
      return;
    }
    fetchActiveAccess();
  }, [user, navigate]);

  const fetchActiveAccess = async () => {
    try {
      const response = await api.get('/medical/access/active');
      setActiveAccess(response.data.access);
    } catch (error) {
      console.error('Failed to fetch access:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScopeToggle = (scopeId) => {
    const newScopes = formData.scopes.includes(scopeId)
      ? formData.scopes.filter(s => s !== scopeId)
      : [...formData.scopes, scopeId];
    
    setFormData({
      ...formData,
      scopes: newScopes
    });
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!formData.hospital_identifier.trim()) {
      setMessage('❌ Please enter a hospital ID');
      return;
    }

    if (formData.scopes.length === 0) {
      setMessage('❌ Please select at least one access permission');
      return;
    }

    try {
      await api.post('/medical/access/grant', formData);
      setMessage('✅ Hospital access granted successfully');
      setShowGrantForm(false);
      setFormData({
        hospital_identifier: '',
        scopes: [],
        permission_type: 'read_only',
        duration: '7'
      });
      fetchActiveAccess();
    } catch (error) {
      setMessage('❌ Failed to grant access: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleRevokeAccess = async (accessId) => {
    if (!window.confirm('Are you sure you want to revoke this access?')) {
      return;
    }

    try {
      await api.put(`/medical/access/revoke/${accessId}`);
      setMessage('✅ Hospital access revoked successfully');
      fetchActiveAccess();
    } catch (error) {
      setMessage('❌ Failed to revoke access');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="navbar">
        <div className="navbar-brand">JanSetu Medical</div>
        <div className="navbar-menu">
          <Link to="/medical/dashboard" className="btn btn-secondary">← Dashboard</Link>
        </div>
      </div>

      <div className="container">
        {/* Header Section */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>🏥 Hospital Access Management</h2>
              <p style={{ color: '#666', marginTop: '8px' }}>Medical ID: <strong>{user?.medical_id}</strong></p>
            </div>
            <button 
              onClick={() => setShowGrantForm(!showGrantForm)} 
              className="btn btn-primary"
              style={{ minWidth: '150px' }}
            >
              {showGrantForm ? '✕ Cancel' : '+ Grant Access'}
            </button>
          </div>

          {message && (
            <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`} style={{ marginTop: '15px' }}>
              {message}
            </div>
          )}
        </div>

        {/* Grant Access Form */}
        {showGrantForm && (
          <div className="card" style={{ marginBottom: '20px', background: '#f8f9fa', border: '2px solid #6c5ce7' }}>
            <h3 style={{ marginBottom: '20px' }}>Grant Hospital Access</h3>
            <form onSubmit={handleGrantAccess}>
              {/* Hospital ID Input */}
              <div className="form-group">
                <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Hospital ID
                </label>
                <input
                  type="text"
                  value={formData.hospital_identifier}
                  onChange={(e) => setFormData({ ...formData, hospital_identifier: e.target.value })}
                  placeholder="Enter hospital unique ID (e.g., HOSP-12345)"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    fontSize: '14px',
                    border: '2px solid #ddd',
                    borderRadius: '8px'
                  }}
                />
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                  The unique identifier provided by the hospital
                </small>
              </div>

              {/* Access Permissions Grid */}
              <div className="form-group" style={{ marginTop: '25px' }}>
                <label style={{ fontWeight: '600', marginBottom: '12px', display: 'block' }}>
                  Access Permissions
                </label>
                <small style={{ color: '#666', display: 'block', marginBottom: '15px' }}>
                  Select what information the hospital can access
                </small>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: '15px' 
                }}>
                  {accessScopes.map(scope => (
                    <div
                      key={scope.id}
                      onClick={() => handleScopeToggle(scope.id)}
                      style={{
                        padding: '15px',
                        border: formData.scopes.includes(scope.id) 
                          ? '2px solid #6c5ce7' 
                          : '2px solid #e0e0e0',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: formData.scopes.includes(scope.id) 
                          ? '#f0ebff' 
                          : 'white',
                        transition: 'all 0.2s',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={formData.scopes.includes(scope.id)}
                          onChange={() => {}}
                          style={{ 
                            marginTop: '3px',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontSize: '20px', 
                            marginBottom: '5px' 
                          }}>
                            {scope.icon}
                          </div>
                          <div style={{ 
                            fontWeight: '600', 
                            marginBottom: '5px',
                            color: '#2d3436'
                          }}>
                            {scope.name}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#636e72',
                            lineHeight: '1.4'
                          }}>
                            {scope.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permission Type */}
              <div className="form-group" style={{ marginTop: '25px' }}>
                <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Permission Type
                </label>
                <select
                  value={formData.permission_type}
                  onChange={(e) => setFormData({ ...formData, permission_type: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    fontSize: '14px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    background: 'white'
                  }}
                >
                  <option value="read_only">🔒 Read Only - Hospital can view only</option>
                  <option value="upload_allowed">✏️ Upload Allowed - Hospital can add records</option>
                </select>
              </div>

              {/* Duration */}
              <div className="form-group" style={{ marginTop: '20px' }}>
                <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Access Duration
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    fontSize: '14px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    background: 'white'
                  }}
                >
                  <option value="1">1 Day</option>
                  <option value="7">7 Days (Recommended)</option>
                  <option value="30">30 Days (1 Month)</option>
                  <option value="90">90 Days (3 Months)</option>
                  <option value="revoked">Until Revoked</option>
                </select>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  marginTop: '25px',
                  width: '100%',
                  padding: '15px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Grant Access
              </button>
            </form>
          </div>
        )}

        {/* Active Access List */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Active Hospital Access</h3>

          {activeAccess.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '15px' }}>🏥</div>
              <p style={{ fontSize: '16px', color: '#636e72' }}>No active hospital access granted</p>
              <small style={{ color: '#999' }}>Grant access to allow hospitals to view your medical data</small>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Hospital</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Permissions</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Granted</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Expires</th>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '15px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAccess.map(access => {
                    const isExpired = access.is_expired || false;
                    const scopes = Array.isArray(access.access_scope) ? access.access_scope : [];
                    const permissionType = access.permissions?.type || 'read_only';
                    
                    return (
                      <tr key={access.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <td style={{ padding: '15px' }}>
                          <div style={{ fontWeight: '600', color: '#2d3436', marginBottom: '5px' }}>
                            {access.hospital?.hospital_name || `Hospital #${access.hospital_id}`}
                          </div>
                          <div style={{ fontSize: '13px', color: '#636e72' }}>
                            ID: {access.hospital?.hospital_unique_id || 'N/A'}
                          </div>
                          {access.hospital?.email && (
                            <div style={{ fontSize: '12px', color: '#999', marginTop: '3px' }}>
                              {access.hospital.email}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {scopes.map(scope => {
                              const scopeInfo = accessScopes.find(s => s.id === scope);
                              return (
                                <span
                                  key={scope}
                                  style={{
                                    background: '#e3f2fd',
                                    color: '#1976d2',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                  title={scopeInfo?.description || scope}
                                >
                                  {scopeInfo?.icon || '📄'} {scopeInfo?.name || scope}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            background: permissionType === 'read_only' ? '#fff3cd' : '#d1f2eb',
                            color: permissionType === 'read_only' ? '#856404' : '#0c5c4c',
                            padding: '5px 12px',
                            borderRadius: '15px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {permissionType === 'read_only' ? '🔒 Read Only' : '✏️ Upload Allowed'}
                          </span>
                        </td>
                        <td style={{ padding: '15px', fontSize: '14px', color: '#2d3436' }}>
                          {new Date(access.granted_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td style={{ padding: '15px', fontSize: '14px', color: '#2d3436' }}>
                          {new Date(access.expires_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{
                            background: isExpired ? '#fee' : '#e8f5e9',
                            color: isExpired ? '#c62828' : '#2e7d32',
                            padding: '5px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {isExpired ? '⚠️ Expired' : '✅ Active'}
                          </span>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleRevokeAccess(access.id)}
                            className="btn btn-danger"
                            style={{ 
                              padding: '8px 16px', 
                              fontSize: '13px',
                              fontWeight: '500',
                              background: '#dc3545',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HospitalAccessManagement;
