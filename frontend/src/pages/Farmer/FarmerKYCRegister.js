import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import './FarmerKYCRegister.css';

function FarmerKYCRegister() {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(1);
  const [states, setStates] = useState([]);
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    aadhaar: '',
    mobile: '',
    email: '',
    
    // Address
    village: '',
    taluka: '',
    district: '',
    city: '',
    state: '',
    pincode: '',
    
    // Agricultural Details
    land_ownership: 'own',
    land_area: '',
    crop_type: '',
    irrigation_type: '',
    storage_capacity: '',
    
    // Financial Details
    bank_account: '',
    bank_ifsc: '',
    bank_name: '',
    kcc_number: '',
    farmer_id: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const response = await api.get('/farmer/states');
      setStates(response.data.states || []);
    } catch (err) {
      console.error('Failed to fetch states:', err);
      // Fallback to hardcoded states
      setStates([
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
      ]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateSection = (section) => {
    setError('');
    
    switch(section) {
      case 1: // Email (Login Information)
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address');
          return false;
        }
        break;
        
      case 2: // Personal Information
        if (!formData.full_name) {
          setError('Full name is required');
          return false;
        }
        if (!formData.aadhaar || formData.aadhaar.length !== 12) {
          setError('Aadhaar must be 12 digits');
          return false;
        }
        if (!formData.mobile || formData.mobile.length !== 10) {
          setError('Mobile must be 10 digits');
          return false;
        }
        if (!formData.state) {
          setError('State is required');
          return false;
        }
        break;
        
      case 3: // Agricultural Details
        if (!formData.land_area) {
          setError('Land area is required');
          return false;
        }
        break;
        
      case 4: // Financial Details
        if (!formData.bank_account) {
          setError('Bank account number is required');
          return false;
        }
        if (!formData.bank_ifsc || formData.bank_ifsc.length !== 11) {
          setError('IFSC code must be 11 characters');
          return false;
        }
        if (!formData.bank_name) {
          setError('Bank name is required');
          return false;
        }
        break;
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    setError('');
    setCurrentSection(currentSection - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSection(4)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Log the data being sent for debugging
      console.log('Submitting farmer KYC data:', formData);
      
      const response = await api.post('/farmer/kyc-register', formData);
      
      if (response.data.success) {
        alert(`✅ Registration Successful!\n\nYour KYC ID: ${response.data.farmer.kyc_id}\n\n🔐 Login Credentials:\nUsername: ${formData.email}\nPassword: ${response.data.farmer.kyc_id}\n\nPlease save your KYC ID - you'll need it to login!`);
        navigate('/farmer/login');
      }
    } catch (err) {
      console.error('Registration error:', err.response?.data);
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = () => {
    switch(currentSection) {
      case 1:
        return (
          <div className="kyc-section">
            <h3>� Login Information</h3>
            <p className="section-description">Your email will be your username. After registration, you'll receive a KYC ID which will be your password.</p>
            
            <div className="info-box" style={{ 
              backgroundColor: '#e3f2fd', 
              padding: '15px', 
              borderRadius: '8px', 
              border: '1px solid #2196f3',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0, color: '#1976d2', fontSize: '14px' }}>
                <strong>📌 Important Login Details:</strong><br/>
                • Username: Your Email Address<br/>
                • Password: Your KYC ID (Format: FRM-STATE-YEAR-XXXXXX)<br/>
                • Keep your KYC ID safe for future logins
              </p>
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
              />
              <small>This will be your username for login</small>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="kyc-section">
            <h3>👤 Personal Information</h3>
            <p className="section-description">Enter your personal and contact details</p>
            
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name as per Aadhaar"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Aadhaar Number *</label>
                <input
                  type="text"
                  name="aadhaar"
                  value={formData.aadhaar}
                  onChange={handleChange}
                  placeholder="12-digit Aadhaar"
                  maxLength="12"
                  pattern="[0-9]{12}"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile"
                  maxLength="10"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com (optional)"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Village</label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="Village name"
                />
              </div>

              <div className="form-group">
                <label>Taluka</label>
                <input
                  type="text"
                  name="taluka"
                  value={formData.taluka}
                  onChange={handleChange}
                  placeholder="Taluka/Tehsil"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="District"
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Nearest city"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>State *</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select State</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="6-digit pincode"
                  maxLength="6"
                  pattern="[0-9]{6}"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="kyc-section">
            <h3>🌾 Agricultural Details</h3>
            <p className="section-description">Provide information about your farming activities</p>
            
            <div className="form-row">
              <div className="form-group">
                <label>Land Ownership *</label>
                <select
                  name="land_ownership"
                  value={formData.land_ownership}
                  onChange={handleChange}
                  required
                >
                  <option value="own">Own Land</option>
                  <option value="lease">Leased Land</option>
                  <option value="sharecropper">Sharecropper</option>
                  <option value="tenant">Tenant Farmer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Land Area (in acres) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="land_area"
                  value={formData.land_area}
                  onChange={handleChange}
                  placeholder="Total land area"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Primary Crop Type</label>
              <input
                type="text"
                name="crop_type"
                value={formData.crop_type}
                onChange={handleChange}
                placeholder="e.g., Rice, Wheat, Cotton (comma-separated)"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Irrigation Type</label>
                <select
                  name="irrigation_type"
                  value={formData.irrigation_type}
                  onChange={handleChange}
                >
                  <option value="">Select Irrigation Type</option>
                  <option value="rainfed">Rainfed</option>
                  <option value="canal">Canal</option>
                  <option value="well">Well/Borewell</option>
                  <option value="drip">Drip Irrigation</option>
                  <option value="sprinkler">Sprinkler</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Storage Capacity</label>
                <input
                  type="text"
                  name="storage_capacity"
                  value={formData.storage_capacity}
                  onChange={handleChange}
                  placeholder="e.g., 50 quintals, 2 tons"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="kyc-section">
            <h3>💰 Financial Details</h3>
            <p className="section-description">Bank account information for subsidy and payments</p>
            
            <div className="form-group">
              <label>Bank Account Number *</label>
              <input
                type="text"
                name="bank_account"
                value={formData.bank_account}
                onChange={handleChange}
                placeholder="Your bank account number"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>IFSC Code *</label>
                <input
                  type="text"
                  name="bank_ifsc"
                  value={formData.bank_ifsc}
                  onChange={handleChange}
                  placeholder="11-character IFSC"
                  maxLength="11"
                  required
                />
              </div>

              <div className="form-group">
                <label>Bank Name *</label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  placeholder="e.g., State Bank of India"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Kisan Credit Card Number</label>
                <input
                  type="text"
                  name="kcc_number"
                  value={formData.kcc_number}
                  onChange={handleChange}
                  placeholder="KCC number (if available)"
                />
              </div>

              <div className="form-group">
                <label>Existing Farmer ID</label>
                <input
                  type="text"
                  name="farmer_id"
                  value={formData.farmer_id}
                  onChange={handleChange}
                  placeholder="Any existing government farmer ID"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-page kyc-page">
      <div className="auth-container kyc-container">
        <div className="auth-card kyc-card">
          <div className="auth-header">
            <h1>🌾 Farmer KYC Registration</h1>
            <p>Complete your profile to access agricultural services</p>
          </div>

          {/* Progress Indicator */}
          <div className="progress-indicator">
            <div className={`progress-step ${currentSection >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Email</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentSection >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Personal</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentSection >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Agricultural</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${currentSection >= 4 ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <div className="step-label">Financial</div>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {renderSection()}

            {/* Navigation Buttons */}
            <div className="form-actions">
              {currentSection > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="btn btn-secondary"
                >
                  ← Previous
                </button>
              )}
              
              {currentSection < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary"
                  style={{ marginLeft: 'auto' }}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-success"
                  style={{ marginLeft: 'auto' }}
                  disabled={loading}
                >
                  {loading ? 'Registering...' : '✓ Complete Registration'}
                </button>
              )}
            </div>
          </form>

          <div className="auth-footer">
            <p>Already registered? <Link to="/farmer/login">Login here</Link></p>
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmerKYCRegister;
