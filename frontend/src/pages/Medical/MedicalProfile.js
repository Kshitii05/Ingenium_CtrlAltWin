import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import './MedicalRecords.css';

function MedicalProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    gender: '',
    allergies: '',
    chronic_conditions: '',
    current_medications: '',
    past_surgeries: '',
    disabilities: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    blood_group: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // File upload states
  const [profileDocuments, setProfileDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!user || user.type !== 'medical_user') {
      navigate('/medical/login');
      return;
    }
    fetchProfile();
    fetchProfileDocuments();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/medical/profile');
      setProfile(response.data.profile);
      setFormData({
        gender: response.data.profile.gender || '',
        allergies: response.data.profile.allergies || '',
        chronic_conditions: response.data.profile.chronic_conditions || '',
        current_medications: response.data.profile.current_medications || '',
        past_surgeries: response.data.profile.past_surgeries || '',
        disabilities: response.data.profile.disabilities || '',
        emergency_contact_name: response.data.profile.emergency_contact_name || '',
        emergency_contact_phone: response.data.profile.emergency_contact_phone || '',
        emergency_contact_relation: response.data.profile.emergency_contact_relation || '',
        blood_group: response.data.profile.blood_group || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileDocuments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/medical/files?category=profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProfileDocuments(data.files || []);
      }
    } catch (error) {
      console.error('Failed to fetch profile documents:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/jpg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.');
      return;
    }

    try {
      setUploading(true);
      setUploadError('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'profile');

      const response = await fetch('http://localhost:5000/api/medical/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setUploadSuccess('Document uploaded successfully!');
        fetchProfileDocuments();
        e.target.value = '';
        setTimeout(() => setUploadSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }
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
      const response = await fetch(`http://localhost:5000/api/medical/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUploadSuccess('Document deleted successfully!');
        fetchProfileDocuments();
        setTimeout(() => setUploadSuccess(''), 3000);
      }
    } catch (err) {
      setUploadError('Error deleting file: ' + err.message);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/medical/files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
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
      await api.put('/medical/profile', formData);
      setMessage('✅ Profile updated successfully');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      setMessage('❌ Failed to update profile');
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
        {uploadSuccess && <div className="alert alert-success">{uploadSuccess}</div>}
        {uploadError && <div className="alert alert-error">{uploadError}</div>}
        
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>👤 Personal Medical Profile</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn btn-primary">
                Edit Profile
              </button>
            )}
          </div>

          {message && <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>{message}</div>}

          <h3 style={{ marginTop: '30px' }}>Personal Information (Non-Editable)</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{profile?.user?.name}</span>
            </div>
            <div className="info-item">
              <label>Date of Birth:</label>
              <span>{profile?.user?.dob}</span>
            </div>
            <div className="info-item">
              <label>Gender:</label>
              <span>{profile?.user?.gender}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{profile?.user?.phone}</span>
            </div>
          </div>

          <h3 style={{ marginTop: '30px' }}>Medical Information</h3>

          {editing ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Blood Group</label>
                <select name="blood_group" value={formData.blood_group} onChange={handleChange}>
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              <div className="form-group">
                <label>Allergies</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows="3"
                  placeholder="List any known allergies..."
                />
              </div>

              <div className="form-group">
                <label>Chronic Conditions</label>
                <textarea
                  name="chronic_conditions"
                  value={formData.chronic_conditions}
                  onChange={handleChange}
                  rows="3"
                  placeholder="List any chronic conditions..."
                />
              </div>

              <div className="form-group">
                <label>Current Medications</label>
                <textarea
                  name="current_medications"
                  value={formData.current_medications}
                  onChange={handleChange}
                  rows="3"
                  placeholder="List current medications..."
                />
              </div>

              <div className="form-group">
                <label>Past Surgeries</label>
                <textarea
                  name="past_surgeries"
                  value={formData.past_surgeries}
                  onChange={handleChange}
                  rows="3"
                  placeholder="List any past surgeries..."
                />
              </div>

              <div className="form-group">
                <label>Disabilities</label>
                <textarea
                  name="disabilities"
                  value={formData.disabilities}
                  onChange={handleChange}
                  rows="3"
                  placeholder="List any disabilities..."
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact Relation</label>
                <input
                  type="text"
                  name="emergency_contact_relation"
                  value={formData.emergency_contact_relation}
                  onChange={handleChange}
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label>Gender:</label>
                <span>{profile?.gender || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Blood Group:</label>
                <span>{profile?.blood_group || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Allergies:</label>
                <span>{profile?.allergies || 'None'}</span>
              </div>
              <div className="info-item">
                <label>Chronic Conditions:</label>
                <span>{profile?.chronic_conditions || 'None'}</span>
              </div>
              <div className="info-item">
                <label>Current Medications:</label>
                <span>{profile?.current_medications || 'None'}</span>
              </div>
              <div className="info-item">
                <label>Past Surgeries:</label>
                <span>{profile?.past_surgeries || 'None'}</span>
              </div>
              <div className="info-item">
                <label>Disabilities:</label>
                <span>{profile?.disabilities || 'None'}</span>
              </div>
              <div className="info-item">
                <label>Emergency Contact:</label>
                <span>{profile?.emergency_contact_name || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Emergency Phone:</label>
                <span>{profile?.emergency_contact_phone || 'Not set'}</span>
              </div>
              <div className="info-item">
                <label>Emergency Relation:</label>
                <span>{profile?.emergency_contact_relation || 'Not set'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Profile Documents Section */}
        <div className="card" style={{ marginTop: '30px' }}>
          <h3>📎 Profile Documents</h3>
          <p>Upload medical reports, test results, prescriptions, and other health-related documents</p>

          <div className="upload-section" style={{ marginTop: '20px' }}>
            <div className="upload-area">
              <label htmlFor="profile-file-upload" className="upload-label">
                <span className="upload-icon">📤</span>
                <span className="upload-text">
                  {uploading ? 'Uploading...' : 'Click to upload document'}
                </span>
                <small className="upload-hint">PDF, DOC, DOCX, JPG, PNG (Max 10MB)</small>
              </label>
              <input
                id="profile-file-upload"
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {profileDocuments.length === 0 ? (
            <div className="no-files" style={{ marginTop: '20px' }}>
              <div className="no-files-icon">📂</div>
              <p>No documents uploaded yet</p>
              <small>Upload your medical reports and health documents above</small>
            </div>
          ) : (
            <div className="files-grid" style={{ marginTop: '20px' }}>
              {profileDocuments.map((file) => (
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

export default MedicalProfile;
