import React, { useState } from 'react';
import '../style/functionality.css';

export default function PointsModal({ customer, items, onClose, onSubmit }) {
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!customer) return null;

  const affordableItems = items.filter(item => item.required_points <= customer.points);

  const handleSubmit = async () => {
    if (!selectedItemId) {
      alert('Please select an item to redeem.');
      return;
    }
    if (isSubmitting) return; // safeguard

    setIsSubmitting(true);
    try {
      const selectedItem = affordableItems.find(item => item.id === selectedItemId);
      if (selectedItem) {
        await onSubmit(selectedItem);  // wait for email submission
      }
    } finally {
      setIsSubmitting(false); // re-enable button after onSubmit finishes
    }
  };

  return (
    <>
      <div className="points-modal-overlay" onClick={onClose} />
      <div className="points-modal-container">
        <div className="points-modal-header">
          <h3 className="points-modal-title">Redeem Points</h3>
          <button className="points-modal-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <div className="points-modal-body">
          <div className="points-modal-customer-info">
            <p className="points-modal-email">{customer.email}</p>
            <div className="points-modal-badge">
              <span className="points-modal-badge-label">Current Points</span>
              <span className="points-modal-badge-value">{customer.points}</span>
            </div>
          </div>

          <div className="points-modal-items-section">
            <h4 className="points-modal-subtitle">Select an item to redeem:</h4>
            {affordableItems.length > 0 ? (
              <ul className="points-modal-items-list">
                {affordableItems.map(item => (
                  <li key={item.id} className={`points-modal-item ${selectedItemId === item.id ? 'selected' : ''}`}>
                    <label className="points-modal-item-label">
                      <input
                        type="radio"
                        name="redeemItem"
                        value={item.id}
                        checked={selectedItemId === item.id}
                        onChange={() => setSelectedItemId(item.id)}
                        className="points-modal-radio"
                      />
                      <div className="points-modal-item-content">
                        <span className="points-modal-item-name">{item.name}</span>
                        <span className="points-modal-item-points">{item.required_points} points</span>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="points-modal-empty">
                <p>No items available within your points.</p>
              </div>
            )}
          </div>
        </div>

        <div className="points-modal-footer">
          <button 
            className="points-modal-btn points-modal-btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="points-modal-btn points-modal-btn-primary"
            onClick={handleSubmit} 
            disabled={!selectedItemId || isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Redeem'}
          </button>
        </div>
      </div>
    </>
  );
}
