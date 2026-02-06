import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './MedicalRecords.css';

function MedicalBills() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // File upload states
  const [billDocuments, setBillDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!user || user.type !== 'medical_user') {
      navigate('/medical/login');
      return;
    }
    fetchBills();
    fetchBillDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const fetchBills = async () => {
    try {
      const response = await api.get('/medical/bills');
      setBills(response.data.bills);
    } catch (error) {
      console.error('Failed to fetch bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBillDocuments = async () => {
    try {
      const response = await api.get('/medical/files?category=bills');
      setBillDocuments(response.data.files || []);
    } catch (error) {
      console.error('Failed to fetch bill documents:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'bills');

      await api.post('/medical/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadSuccess('Bill document uploaded successfully!');
      fetchBillDocuments();
      e.target.value = ''; // Reset file input
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (err) {
      setUploadError('Error uploading file: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/medical/files/${fileId}`);
      setUploadSuccess('Document deleted successfully!');
      fetchBillDocuments();
      setTimeout(() => setUploadSuccess(''), 3000);
    } catch (err) {
      setUploadError('Error deleting file: ' + err.message);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await api.get(`/medical/files/${fileId}/download`, {
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
      setUploadError('Error downloading file: ' + err.message);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('doc')) return '📝';
    if (fileType.includes('image') || fileType.includes('jpg') || fileType.includes('png')) return '🖼️';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      partial: 'badge-info',
      paid: 'badge-success',
      claimed: 'badge-success'
    };
    return badges[status] || 'badge-info';
  };

  const calculateBalance = (bill) => {
    return (parseFloat(bill.total_amount) - parseFloat(bill.paid_amount) - parseFloat(bill.insurance_claimed)).toFixed(2);
  };

  return (
    <div className="dashboard-page">
      <div className="navbar">
        <div className="navbar-brand">JanSetu Medical</div>
        <div className="navbar-menu">
          <Link to="/medical/dashboard" className="btn btn-secondary">← Dashboard</Link>
        </div>
      </div>

      <div className="container">
        {uploadSuccess && <div className="alert alert-success">{uploadSuccess}</div>}
        {uploadError && <div className="alert alert-error">{uploadError}</div>}
        
        <div className="card">
          <h2>💰 Bills & Insurance</h2>
          <p>Track your medical bills and insurance claims</p>

          {bills.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💰</div>
              <p>No bills found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-3" style={{ marginBottom: '30px' }}>
                <div className="card" style={{ background: '#f8f9fa' }}>
                  <h4>Total Bills</h4>
                  <h2>₹{bills.reduce((sum, b) => sum + parseFloat(b.total_amount), 0).toFixed(2)}</h2>
                </div>
                <div className="card" style={{ background: '#d4edda' }}>
                  <h4>Paid Amount</h4>
                  <h2>₹{bills.reduce((sum, b) => sum + parseFloat(b.paid_amount), 0).toFixed(2)}</h2>
                </div>
                <div className="card" style={{ background: '#fff3cd' }}>
                  <h4>Outstanding</h4>
                  <h2>₹{bills.reduce((sum, b) => sum + parseFloat(calculateBalance(b)), 0).toFixed(2)}</h2>
                </div>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th>Bill Number</th>
                    <th>Hospital</th>
                    <th>Date</th>
                    <th>Total Amount</th>
                    <th>Paid</th>
                    <th>Insurance</th>
                    <th>Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map(bill => (
                    <tr key={bill.id}>
                      <td><strong>{bill.bill_number}</strong></td>
                      <td>
                        {bill.hospital?.hospital_name || `Hospital #${bill.hospital_id}`}<br />
                        <small>{bill.description}</small>
                      </td>
                      <td>{new Date(bill.bill_date).toLocaleDateString()}</td>
                      <td>₹{parseFloat(bill.total_amount).toFixed(2)}</td>
                      <td>₹{parseFloat(bill.paid_amount).toFixed(2)}</td>
                      <td>₹{parseFloat(bill.insurance_claimed).toFixed(2)}</td>
                      <td><strong>₹{calculateBalance(bill)}</strong></td>
                      <td>
                        <span className={`badge ${getStatusBadge(bill.status)}`}>
                          {bill.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Bill Documents Section */}
        <div className="card" style={{ marginTop: '30px' }}>
          <h3>📎 Bill Documents & Receipts</h3>
          <p>Upload and manage your bill receipts, insurance documents, and related files</p>

          <div className="upload-section" style={{ marginTop: '20px' }}>
            <div className="upload-area">
              <label htmlFor="bill-file-upload" className="upload-label">
                <span className="upload-icon">📤</span>
                <span className="upload-text">
                  {uploading ? 'Uploading...' : 'Click to upload bill document'}
                </span>
                <small className="upload-hint">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</small>
              </label>
              <input
                id="bill-file-upload"
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {billDocuments.length === 0 ? (
            <div className="no-files" style={{ marginTop: '20px' }}>
              <div className="no-files-icon">📂</div>
              <p>No bill documents uploaded yet</p>
              <small>Upload your bill receipts and insurance documents above</small>
            </div>
          ) : (
            <div className="files-grid" style={{ marginTop: '20px' }}>
              {billDocuments.map((file) => (
                <div key={file.id} className="file-card">
                  <div className="file-icon-large">
                    {getFileIcon(file.file_type)}
                  </div>
                  <div className="file-details">
                    <h4 className="file-name" title={file.file_name}>
                      {file.file_name}
                    </h4>
                    <div className="file-meta">
                      <span className="file-size">{formatFileSize(file.file_size)}</span>
                      <span className="file-date">
                        {new Date(file.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button
                      onClick={() => handleDownload(file.id, file.file_name)}
                      className="btn-action btn-download"
                      title="Download"
                    >
                      ⬇️ Download
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(file.id)}
                      className="btn-action btn-delete"
                      title="Delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MedicalBills;
