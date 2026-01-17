import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function MedicalRecords() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.type !== 'medical_user') {
      navigate('/medical/login');
      return;
    }
    fetchRecords();
  }, [user, navigate]);

  const fetchRecords = async () => {
    try {
      const response = await api.get('/medical/records');
      setRecords(response.data.records);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const getRecordTypeBadge = (type) => {
    const badges = {
      lab_report: 'badge-info',
      prescription: 'badge-success',
      diagnosis: 'badge-warning',
      scan: 'badge-danger',
      other: 'badge-info'
    };
    return badges[type] || 'badge-info';
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
          <h2>📄 Medical Records & Documents</h2>
          <p>All medical records are immutable and permanently stored</p>

          {records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📄</div>
              <p>No medical records found</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Source</th>
                  <th>Date</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {records.map(record => (
                  <tr key={record.id}>
                    <td>
                      <span className={`badge ${getRecordTypeBadge(record.record_type)}`}>
                        {record.record_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td><strong>{record.title}</strong></td>
                    <td>{record.description || '-'}</td>
                    <td>
                      {record.uploaded_by_type === 'hospital' ? (
                        <>
                          🏥 {record.hospital?.hospital_name || `Hospital #${record.hospital_id}`}
                        </>
                      ) : (
                        '👤 Self-uploaded'
                      )}
                    </td>
                    <td>{new Date(record.record_date).toLocaleDateString()}</td>
                    <td>{new Date(record.uploaded_at).toLocaleDateString()}</td>
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

export default MedicalRecords;
