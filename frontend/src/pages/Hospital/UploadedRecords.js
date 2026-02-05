import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

function UploadedRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUploadedRecords();
  }, []);

  const fetchUploadedRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/hospital/uploaded-records');
      
      if (response.data.success) {
        setRecords(response.data.files);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png')) return '🖼️';
    return '📎';
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await api.get(`/hospital/download-file/${fileId}`, {
        responseType: 'blob'
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download file: ' + err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading uploaded records...</div>;
  }

  return (
    <div className="uploaded-records-container">
      <h2>Uploaded Medical Records</h2>
      <p>View all documents uploaded by your hospital</p>

      {error && <div className="alert alert-error">{error}</div>}

      {records.length === 0 ? (
        <div className="card no-data">
          <div className="no-data-icon">📋</div>
          <p>No records uploaded yet</p>
          <small>Documents you upload for patients will appear here</small>
        </div>
      ) : (
        <div className="records-stats card">
          <h3>📊 Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <h4>{records.length}</h4>
              <p>Total Documents</p>
            </div>
            <div className="stat-item">
              <h4>{new Set(records.map(r => r.medicalAccount?.medical_id)).size}</h4>
              <p>Patients</p>
            </div>
          </div>
        </div>
      )}

      <div className="records-list">
        {records.map((record) => (
          <div key={record.id} className="record-card card">
            <div className="record-icon">
              {getFileIcon(record.file_type)}
            </div>
            <div className="record-details">
              <h3>{record.document_title || record.file_name}</h3>
              
              <div className="record-patient">
                <strong>Patient:</strong> {record.medicalAccount?.user?.name || 'Unknown'} 
                <span className="patient-id">({record.medicalAccount?.medical_id})</span>
              </div>

              <div className="record-meta">
                <span className="meta-item">
                  <strong>Type:</strong> {record.document_type || 'N/A'}
                </span>
                <span className="meta-item">
                  <strong>Category:</strong> {record.category}
                </span>
                <span className="meta-item">
                  <strong>Size:</strong> {formatFileSize(record.file_size)}
                </span>
                <span className="meta-item">
                  <strong>Uploaded:</strong> {formatDate(record.created_at)}
                </span>
              </div>

              {record.notes && (
                <div className="record-notes">
                  <strong>Notes:</strong> {record.notes}
                </div>
              )}
            </div>
            <div className="record-actions">
              <button
                onClick={() => handleDownload(record.id, record.file_name)}
                className="btn btn-primary"
              >
                📥 Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UploadedRecords;
