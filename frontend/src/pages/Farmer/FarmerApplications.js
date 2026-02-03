import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function FarmerApplications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    application_type: 'subsidy',
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      navigate('/farmer/login');
      return;
    }
    fetchApplications();
  }, [user, navigate]);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/farmer/applications');
      setApplications(response.data.applications);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await api.post('/farmer/applications', formData);
      setMessage('✅ Application submitted successfully');
      setShowForm(false);
      setFormData({
        application_type: 'subsidy',
        title: '',
        description: ''
      });
      fetchApplications();
    } catch (error) {
      setMessage('❌ Failed to submit application');
    }
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
        <div className="navbar-brand">JanSetu Farmer</div>
        <div className="navbar-menu">
          <Link to="/farmer/dashboard" className="btn btn-secondary">← Dashboard</Link>
        </div>
      </div>

      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>📋 Farmer Applications</h2>
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
              {showForm ? 'Cancel' : '+ New Application'}
            </button>
          </div>

          {message && <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>{message}</div>}

          {showForm && (
            <div className="card" style={{ marginTop: '20px', background: '#f9f9f9' }}>
              <h3>Submit New Application</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Application Type</label>
                  <select
                    name="application_type"
                    value={formData.application_type}
                    onChange={handleChange}
                  >
                    <option value="subsidy">Subsidy</option>
                    <option value="loan">Loan</option>
                    <option value="scheme">Scheme</option>
                    <option value="certification">Certification</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary">Submit Application</button>
              </form>
            </div>
          )}

          <h3 style={{ marginTop: '30px' }}>Your Applications</h3>

          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p>No applications submitted yet</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Reviewed By</th>
                  <th>Government Reply</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id}>
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
                      {app.reviewer ? (
                        <>
                          {app.reviewer.name}<br />
                          <small>{app.reviewer.department}</small>
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{app.government_reply || '-'}</td>
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

export default FarmerApplications;
