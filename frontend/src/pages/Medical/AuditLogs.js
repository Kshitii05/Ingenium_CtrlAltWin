import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function AuditLogs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.type !== 'medical_user') {
      navigate('/medical/login');
      return;
    }
    fetchLogs();
  }, [user, navigate]);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/medical/audit-logs');
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const getActionBadge = (action) => {
    const badges = {
      access_granted: 'badge-success',
      access_revoked: 'badge-danger',
      data_viewed: 'badge-info',
      data_uploaded: 'badge-warning',
      profile_updated: 'badge-info',
      login: 'badge-success'
    };
    return badges[action] || 'badge-info';
  };

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
          <h2>🔒 Privacy & Access Audit Logs</h2>
          <p>Immutable record of all access events to your medical data</p>

          {logs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔒</div>
              <p>No audit logs found</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Hospital</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>
                      <span className={`badge ${getActionBadge(log.action_type)}`}>
                        {log.action_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {log.actor_type === 'hospital' && '🏥 Hospital'}
                      {log.actor_type === 'user' && '👤 You'}
                      {log.actor_type === 'system' && '⚙️ System'}
                    </td>
                    <td>
                      {log.hospital ? log.hospital.hospital_name : '-'}
                    </td>
                    <td>
                      <small>{JSON.stringify(log.details || {})}</small>
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

export default AuditLogs;
