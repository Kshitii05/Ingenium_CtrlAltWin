import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function MedicalAccountCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState('check'); // check, create, otp
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkAccountStatus();
  }, []);

  const checkAccountStatus = async () => {
    try {
      const response = await api.get('/medical/account/status');
      
      if (response.data.exists) {
        // Account exists, redirect to medical login
        navigate('/medical/login');
      } else {
        setStep('create');
      }
    } catch (err) {
      setError('Failed to check account status');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/medical/account/initiate', {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        setMessage('OTP sent to your email!');
        setStep('otp');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/medical/account/create', {
        email: formData.email,
        password: formData.password,
        otp: formData.otp
      });

      if (response.data.success) {
        alert('✅ Medical account created successfully!');
        navigate('/medical/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'check') {
    return (
      <div className="auth-page">
        <div className="loading">Checking account status...</div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🩺 Create Medical Account</h1>
            <p>Set up your healthcare identity</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}

          {step === 'create' && (
            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Create Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
              
              <button 
                type="button" 
                onClick={() => navigate('/user/dashboard')} 
                className="btn btn-secondary btn-block"
                style={{ marginTop: '10px' }}
              >
                Cancel
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP}>
              <div className="alert alert-info">
                📩 We've sent a 6-digit OTP to {formData.email}
              </div>

              <div className="form-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength="6"
                  pattern="[0-9]{6}"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <button 
                type="button" 
                onClick={handleSendOTP} 
                className="btn btn-secondary btn-block"
                style={{ marginTop: '10px' }}
              >
                Resend OTP
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default MedicalAccountCreate;
