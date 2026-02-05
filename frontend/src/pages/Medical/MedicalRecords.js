import React, { useState, useEffect } from 'react';
import './MedicalRecords.css';
import api from '../../utils/api';

const MedicalRecords = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/medical/files?category=records');
      setFiles(response.data.files || []);
      setError('');
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Error loading files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'records');

      await api.post('/medical/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('File uploaded successfully!');
      await fetchFiles();
      e.target.value = '';
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error uploading file: ' + (err.response?.data?.message || err.message));
      console.error('Error uploading file:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.delete(`/medical/files/${fileId}`);

      setSuccess('File deleted successfully!');
      fetchFiles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error deleting file: ' + err.message);
      console.error('Error deleting file:', err);
    } finally {
      setLoading(false);
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
      setError('Error downloading file: ' + err.message);
      console.error('Error downloading file:', err);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="records-container-simple">
      <div className="records-header">
        <h1>Medical Records & Documents</h1>
        <p>Upload and manage your medical documents</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="files-section">
        <div className="files-header-simple">
          <h2>🏠 All Files</h2>
          <div className="file-count">
            {files.length} {files.length === 1 ? 'file' : 'files'}
          </div>
        </div>

        <div className="upload-section">
          <div className="upload-area">
            <label htmlFor="file-upload" className="upload-label">
              <span className="upload-icon">📤</span>
              <span className="upload-text">
                {uploading ? 'Uploading...' : 'Click to upload a file'}
              </span>
              <small className="upload-hint">
                PDF, DOC, DOCX, JPG, PNG (Max 10MB)
              </small>
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {loading && !uploading ? (
          <div className="loading">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="no-files">
            <div className="no-files-icon">📂</div>
            <p>No files uploaded yet</p>
            <small>Upload your first medical document above</small>
          </div>
        ) : (
          <div className="files-grid">
            {files.map((file) => (
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
                    <span className="file-date">{formatDate(file.created_at)}</span>
                  </div>
                  <div className="file-uploaded-by">
                    Uploaded by: {file.uploaded_by === 'user' ? 'You' : 'Hospital'}
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
                    onClick={() => handleDeleteFile(file.id)}
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
  );
};

export default MedicalRecords;
