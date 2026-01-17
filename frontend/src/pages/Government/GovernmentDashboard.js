import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function GovernmentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('under_review');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || user.type !== 'government') {
      navigate('/government/login');
      return;
    }
    fetchDashboard();
    fetchApplications();
  }, [user, navigate]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/government/dashboard');
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await api.get('/government/farmer/applications');
      setApplications(response.data.applications);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplication = async (appId) => {
    if (!reply) {
      setMessage('❌ Please enter a reply');
      return;
    }

    try {
      await api.put(`/government/farmer/applications/${appId}`, {
        status,
        government_reply: reply
      });
      setMessage('✅ Application updated successfully');
      setSelectedApp(null);
      setReply('');
      fetchApplications();
      fetchDashboard();
    } catch (error) {
      setMessage('❌ Failed to update application');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const getStatusBadge = (status) => {
    const badges = {
      submitted: 'badge-info',
      under_review: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger'
    };
    return badges[status] || 'badge-info';
  };

  return (
    <div className="dashboard-page">
      <div className="navbar">
        <div className="navbar-brand">Ingenium Government</div>
        <div className="navbar-menu">
          <span>{user?.name} - {user?.department}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-header">
          <h1>🏛️ Government Dashboard</h1>
          <p>Department: {user?.department} | Role: {user?.role}</p>
        </div>

        {dashboard?.stats && (
          <div className="grid grid-2">
            <div className="card" style={{ background: '#fff3cd' }}>
              <h4>Pending Applications</h4>
              <h2>{dashboard.stats.pending_applications || 0}</h2>
            </div>
            <div className="card" style={{ background: '#d1ecf1' }}>
              <h4>Under Review</h4>
              <h2>{dashboard.stats.under_review || 0}</h2>
            </div>
          </div>
        )}

        <div className="card">
          <h2>Farmer Applications</h2>

          {message && <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>{message}</div>}

          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>No applications to review</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Farmer</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <React.Fragment key={app.id}>
                    <tr>
                      <td>
                        <strong>{app.farmerAccount?.user?.name}</strong><br />
                        <small>Farmer ID: {app.farmerAccount?.farmer_id}</small><br />
                        <small>{app.farmerAccount?.user?.phone}</small>
                      </td>
                      <td>
                        <span className="badge badge-info">{app.application_type}</span>
                      </td>
                      <td>
                        <strong>{app.title}</strong><br />
                        <small>{app.description}</small>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadge(app.status)}`}>
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{new Date(app.submitted_at).toLocaleDateString()}</td>
                      <td>
                        {app.status === 'submitted' || app.status === 'under_review' ? (
                          <button
                            onClick={() => setSelectedApp(app.id)}
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '14px' }}
                          >
                            Review
                          </button>
                        ) : (
                          <span className="badge badge-success">Processed</span>
                        )}
                      </td>
                    </tr>
                    {selectedApp === app.id && (
                      <tr>
                        <td colSpan="6">
                          <div className="card" style={{ background: '#f9f9f9', margin: '10px 0' }}>
                            <h3>Review Application</h3>
                            
                            <div className="form-group">
                              <label>Status</label>
                              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="under_review">Under Review</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </div>

                            <div className="form-group">
                              <label>Government Reply</label>
                              <textarea
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                rows="4"
                                placeholder="Enter your decision and comments..."
                                required
                              />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button 
                                onClick={() => handleUpdateApplication(app.id)}
                                className="btn btn-primary"
                              >
                                Update Application
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedApp(null);
                                  setReply('');
                                }}
                                className="btn btn-secondary"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default GovernmentDashboard;
