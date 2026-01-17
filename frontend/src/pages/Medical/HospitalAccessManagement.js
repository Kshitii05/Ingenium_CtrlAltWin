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
    hospital_id: '',
    access_scope: [],
    permissions: {},
    duration_days: 7
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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

  const handleScopeChange = (scope) => {
    const newScopes = formData.access_scope.includes(scope)
      ? formData.access_scope.filter(s => s !== scope)
      : [...formData.access_scope, scope];
    
    setFormData({
      ...formData,
      access_scope: newScopes
    });
  };

  const handlePermissionChange = (scope, permission) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [scope]: {
          ...formData.permissions[scope],
          [permission]: !formData.permissions[scope]?.[permission]
        }
      }
    });
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setMessage('');

    if (formData.access_scope.length === 0) {
      setMessage('❌ Please select at least one access scope');
      return;
    }

    try {
      await api.post('/medical/access/grant', formData);
      setMessage('✅ Hospital access granted successfully');
      setShowGrantForm(false);
      setFormData({
        hospital_id: '',
        access_scope: [],
        permissions: {},
        duration_days: 7
      });
      fetchActiveAccess();
    } catch (error) {
      setMessage('❌ Failed to grant access: ' + (error.response?.data?.message || ''));
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
        <div className="navbar-brand">Ingenium Medical</div>
        <div className="navbar-menu">
          <Link to="/medical/dashboard" className="btn btn-secondary">← Dashboard</Link>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>🏥 Hospital Access Management</h2>
              <p>Medical ID: <strong>{user?.medical_id}</strong></p>
            </div>
            <button onClick={() => setShowGrantForm(!showGrantForm)} className="btn btn-primary">
              {showGrantForm ? 'Cancel' : '+ Grant Access'}
            </button>
          </div>

          {message && <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>{message}</div>}

          {showGrantForm && (
            <div className="card" style={{ marginTop: '20px', background: '#f9f9f9' }}>
              <h3>Grant Hospital Access</h3>
              <form onSubmit={handleGrantAccess}>
                <div className="form-group">
                  <label>Hospital ID</label>
                  <input
                    type="number"
                    value={formData.hospital_id}
                    onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                    placeholder="Enter hospital ID"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Access Scope</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {['profile', 'records', 'bills', 'insurance'].map(scope => (
                      <label key={scope} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={formData.access_scope.includes(scope)}
                          onChange={() => handleScopeChange(scope)}
                        />
                        <span style={{ textTransform: 'capitalize' }}>{scope}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Duration (days)</label>
                  <select
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                  >
                    <option value="1">1 Day</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">Grant Access</button>
              </form>
            </div>
          )}

          <h3 style={{ marginTop: '30px' }}>Active Hospital Access</h3>

          {activeAccess.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏥</div>
              <p>No active hospital access granted</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>Access Scope</th>
                  <th>Granted</th>
                  <th>Expires</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeAccess.map(access => (
                  <tr key={access.id}>
                    <td>
                      <strong>{access.hospital?.hospital_name || `Hospital #${access.hospital_id}`}</strong><br />
                      <small>{access.hospital?.email}</small>
                    </td>
                    <td>
                      {access.access_scope.map(scope => (
                        <span key={scope} className="badge badge-info" style={{ marginRight: '5px' }}>
                          {scope}
                        </span>
                      ))}
                    </td>
                    <td>{new Date(access.granted_at).toLocaleDateString()}</td>
                    <td>{new Date(access.expires_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleRevokeAccess(access.id)}
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '14px' }}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default HospitalAccessManagement;
