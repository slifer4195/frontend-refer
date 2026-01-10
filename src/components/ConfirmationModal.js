import React from 'react';
import '../style/functionality.css';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', type = 'danger' }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      <div className="confirmation-modal-overlay" onClick={onClose} />
      <div className="confirmation-modal-container">
        <div className="confirmation-modal-header">
          <div className={`confirmation-modal-icon ${type === 'danger' ? 'confirmation-modal-icon-danger' : 'confirmation-modal-icon-info'}`}>
            {type === 'danger' ? '⚠' : 'ℹ'}
          </div>
          <button className="confirmation-modal-close-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        
        <div className="confirmation-modal-body">
          <h3 className="confirmation-modal-title">{title}</h3>
          <p className="confirmation-modal-message">{message}</p>
        </div>

        <div className="confirmation-modal-footer">
          <button 
            className="confirmation-modal-btn confirmation-modal-btn-secondary"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`confirmation-modal-btn ${type === 'danger' ? 'confirmation-modal-btn-danger' : 'confirmation-modal-btn-primary'}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  );
}
