import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EntitySelection.css';

function EntitySelection() {
  const navigate = useNavigate();

  const entities = [
    {
      id: 'user',
      title: 'User',
      icon: '👤',
      description: 'Access your medical and farmer services',
      route: '/user/login'
    },
    {
      id: 'hospital',
      title: 'Hospital',
      icon: '🏥',
      description: 'Manage patient records and access',
      route: '/hospital/login'
    },
    {
      id: 'government',
      title: 'Government Entity',
      icon: '🏛️',
      description: 'Verify and manage citizen services',
      route: '/government/login'
    }
  ];

  return (
    <div className="entity-selection">
      <div className="entity-container">
        <div className="entity-header">
          <h1>🔐 Ingenium</h1>
          <p>Privacy-Centric Digital Identity Platform</p>
        </div>

        <div className="entity-grid">
          {entities.map(entity => (
            <div 
              key={entity.id}
              className="entity-card"
              onClick={() => navigate(entity.route)}
            >
              <div className="entity-icon">{entity.icon}</div>
              <h2>{entity.title}</h2>
              <p>{entity.description}</p>
            </div>
          ))}
        </div>

        <div className="entity-footer">
          <p>Secure • Private • Transparent</p>
        </div>
      </div>
    </div>
  );
}

export default EntitySelection;
