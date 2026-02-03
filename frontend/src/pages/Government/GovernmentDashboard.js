import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function GovernmentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to government login page which shows the under development message
    navigate('/government/login');
  }, [navigate]);

  return (
    <div>
      <p>Redirecting...</p>
    </div>
  );
}

export default GovernmentDashboard;
