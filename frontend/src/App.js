import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import EntitySelection from './pages/EntitySelection';
import UserLogin from './pages/User/UserLogin';
import UserRegister from './pages/User/UserRegister';
import UserDashboard from './pages/User/UserDashboard';
import HospitalLogin from './pages/Hospital/HospitalLogin';
import HospitalRegister from './pages/Hospital/HospitalRegister';
import HospitalDashboard from './pages/Hospital/HospitalDashboard';
import GovernmentLogin from './pages/Government/GovernmentLogin';
import GovernmentDashboard from './pages/Government/GovernmentDashboard';

// Medical Module
import MedicalAccountCreate from './pages/Medical/MedicalAccountCreate';
import MedicalLogin from './pages/Medical/MedicalLogin';
import MedicalDashboard from './pages/Medical/MedicalDashboard';
import MedicalProfile from './pages/Medical/MedicalProfile';
import HospitalAccessManagement from './pages/Medical/HospitalAccessManagement';
import MedicalRecords from './pages/Medical/MedicalRecords';
import MedicalBills from './pages/Medical/MedicalBills';
import AuditLogs from './pages/Medical/AuditLogs';

// Farmer Module
import FarmerAccountCreate from './pages/Farmer/FarmerAccountCreate';
import FarmerDashboard from './pages/Farmer/FarmerDashboard';
import FarmerApplications from './pages/Farmer/FarmerApplications';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<EntitySelection />} />
            
            {/* User Routes */}
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/register" element={<UserRegister />} />
            <Route path="/user/dashboard" element={<UserDashboard />} />
            
            {/* Medical Module Routes */}
            <Route path="/medical/create" element={<MedicalAccountCreate />} />
            <Route path="/medical/login" element={<MedicalLogin />} />
            <Route path="/medical/dashboard" element={<MedicalDashboard />} />
            <Route path="/medical/profile" element={<MedicalProfile />} />
            <Route path="/medical/access" element={<HospitalAccessManagement />} />
            <Route path="/medical/records" element={<MedicalRecords />} />
            <Route path="/medical/bills" element={<MedicalBills />} />
            <Route path="/medical/audit" element={<AuditLogs />} />
            
            {/* Farmer Module Routes */}
            <Route path="/farmer/create" element={<FarmerAccountCreate />} />
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer/applications" element={<FarmerApplications />} />
            
            {/* Hospital Routes */}
            <Route path="/hospital/login" element={<HospitalLogin />} />
            <Route path="/hospital/register" element={<HospitalRegister />} />
            <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
            
            {/* Government Routes */}
            <Route path="/government/login" element={<GovernmentLogin />} />
            <Route path="/government/dashboard" element={<GovernmentDashboard />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
