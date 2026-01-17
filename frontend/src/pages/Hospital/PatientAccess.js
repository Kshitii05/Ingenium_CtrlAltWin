import React, { useState } from 'react';
import api from '../../utils/api';

function PatientAccess() {
  const [patientId, setPatientId] = useState('');
  const [patient, setPatient] = useState(null);
  const [patientDocs, setPatientDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Upload form state
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    document_title: '',
    document_type: 'Report',
    notes: '',
    category: 'records'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleQueryPatient = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setPatient(null);
    setPatientDocs([]);

    try {
      // Query patient
      const patientResponse = await api.post('/hospital/query-patient', {
        patient_id: patientId
      });

      if (patientResponse.data.success) {
        setPatient(patientResponse.data.patient);

        // Fetch patient documents
        const docsResponse = await api.get(`/hospital/patient-docs/${patientId}`);
        if (docsResponse.data.success) {
          setPatientDocs(docsResponse.data.files);
        }

        setSuccess('Patient found successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to query patient');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadChange = (e) => {
    setUploadData({
      ...uploadData,
      [e.target.name]: e.target.value
    });
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document_title', uploadData.document_title);
      formData.append('document_type', uploadData.document_type);
      formData.append('notes', uploadData.notes);
      formData.append('category', uploadData.category);

      const response = await api.post(`/hospital/upload-doc/${patientId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('Document uploaded successfully!');
        setShowUploadForm(false);
        setUploadData({
          document_title: '',
          document_type: 'Report',
          notes: '',
          category: 'records'
        });
        setSelectedFile(null);
        
        // Refresh patient documents
        const docsResponse = await api.get(`/hospital/patient-docs/${patientId}`);
        if (docsResponse.data.success) {
          setPatientDocs(docsResponse.data.files);
        }

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  return (
    <div className="patient-access-container">
      <h2>Patient Access</h2>
      <p>Enter Patient Unique ID to view medical records</p>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Patient Query Form */}
      <div className="query-section card">
        <form onSubmit={handleQueryPatient}>
          <div className="form-group">
            <label>Patient Unique ID</label>
            <div className="input-button-group">
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                placeholder="Enter Patient Medical ID"
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Searching...' : 'Search Patient'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Patient Profile */}
      {patient && (
        <div className="patient-profile card">
          <h3>Patient Profile</h3>
          <div className="profile-grid">
            <div className="profile-item">
              <strong>Name:</strong> {patient.name}
            </div>
            <div className="profile-item">
              <strong>Medical ID:</strong> {patient.medical_id}
            </div>
            <div className="profile-item">
              <strong>Gender:</strong> {patient.gender}
            </div>
            <div className="profile-item">
              <strong>Date of Birth:</strong> {formatDate(patient.dob)}
            </div>
            <div className="profile-item">
              <strong>Blood Group:</strong> {patient.blood_group || 'N/A'}
            </div>
            <div className="profile-item">
              <strong>Phone:</strong> {patient.phone}
            </div>
            {patient.allergies && (
              <div className="profile-item full-width">
                <strong>Allergies:</strong> {patient.allergies}
              </div>
            )}
            {patient.chronic_conditions && (
              <div className="profile-item full-width">
                <strong>Chronic Conditions:</strong> {patient.chronic_conditions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Document Section */}
      {patient && (
        <div className="upload-actions">
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="btn btn-success"
          >
            {showUploadForm ? '✖ Cancel Upload' : '➕ Upload Medical Document'}
          </button>
        </div>
      )}

      {showUploadForm && patient && (
        <div className="upload-form card">
          <h3>Upload Medical Document</h3>
          <form onSubmit={handleUploadDocument}>
            <div className="form-group">
              <label>Document Title *</label>
              <input
                type="text"
                name="document_title"
                value={uploadData.document_title}
                onChange={handleUploadChange}
                placeholder="e.g., Blood Test Report"
                required
              />
            </div>

            <div className="form-group">
              <label>Document Type *</label>
              <select
                name="document_type"
                value={uploadData.document_type}
                onChange={handleUploadChange}
                required
              >
                <option value="Report">Diagnostic Report</option>
                <option value="Prescription">Prescription</option>
                <option value="Bill">Medical Bill</option>
                <option value="Summary">Discharge Summary</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Imaging">Imaging Report</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={uploadData.category}
                onChange={handleUploadChange}
                required
              >
                <option value="records">Medical Records</option>
                <option value="bills">Bills & Insurance</option>
                <option value="profile">Profile Documents</option>
              </select>
            </div>

            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea
                name="notes"
                value={uploadData.notes}
                onChange={handleUploadChange}
                placeholder="Additional notes or description"
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label>Select File * (PDF, DOC, DOCX, JPG, PNG - Max 10MB)</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required
              />
              {selectedFile && (
                <small className="file-info">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </small>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </div>
      )}

      {/* Patient Documents */}
      {patient && (
        <div className="patient-documents card">
          <h3>Patient Medical Records (Visible to Hospital)</h3>
          
          {patientDocs.length === 0 ? (
            <div className="no-data">
              <p>No medical records available</p>
              <small>The patient hasn't shared any documents yet</small>
            </div>
          ) : (
            <div className="documents-grid">
              {patientDocs.map((doc) => (
                <div key={doc.id} className="document-card">
                  <div className="doc-icon">
                    {getFileIcon(doc.file_type)}
                  </div>
                  <div className="doc-details">
                    <h4>{doc.document_title || doc.file_name}</h4>
                    <div className="doc-meta">
                      <span>Type: {doc.document_type || 'N/A'}</span>
                      <span>Size: {formatFileSize(doc.file_size)}</span>
                      <span>Uploaded: {formatDate(doc.created_at)}</span>
                      <span>By: {doc.uploaded_by === 'user' ? 'Patient' : doc.hospital_name || 'Hospital'}</span>
                    </div>
                    {doc.notes && (
                      <p className="doc-notes">
                        <strong>Notes:</strong> {doc.notes}
                      </p>
                    )}
                  </div>
                  <div className="doc-actions">
                    <a
                      href={`http://localhost:5000/api/medical/files/${doc.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PatientAccess;
