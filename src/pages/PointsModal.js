import React, { useState } from 'react';

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
      <div style={{
        position: 'fixed', top: '20%', left: '30%', width: '40%',
        backgroundColor: 'white', border: '1px solid black', padding: 20, zIndex: 1000
      }}>
        <h3>Use Points for {customer.email}</h3>
        <p>Current Points: {customer.points}</p>

        <h4>Select an item to redeem:</h4>
        {affordableItems.length > 0 ? (
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {affordableItems.map(item => (
              <li key={item.id}>
                <label>
                  <input
                    type="radio"
                    name="redeemItem"
                    value={item.id}
                    checked={selectedItemId === item.id}
                    onChange={() => setSelectedItemId(item.id)}
                  />
                  {` ${item.name} — Required Points: ${item.required_points}`}
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p>No items available within your points.</p>
        )}

        <button 
          onClick={handleSubmit} 
          disabled={!selectedItemId || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>{' '}
        <button onClick={onClose}>Close</button>
      </div>

      <div onClick={onClose} style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 999
      }} />
    </>
  );
}
