import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function MedicalBills() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.type !== 'medical_user') {
      navigate('/medical/login');
      return;
    }
    fetchBills();
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
        <div className="navbar-brand">Ingenium Medical</div>
        <div className="navbar-menu">
          <Link to="/medical/dashboard" className="btn btn-secondary">← Dashboard</Link>
        </div>
      </div>

      <div className="container">
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
      </div>
    </div>
  );
}

export default MedicalBills;
