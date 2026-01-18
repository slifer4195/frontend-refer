import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/login.css';
import API_URL from '../config/api';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ If the email exists, a password reset code has been sent. Please enter it below.');
        setMessageType('success');
        setStep('reset'); // move to reset step
      } else {
        setMessage(data.error || 'Failed to send reset code. Please try again.');
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('⚠️ Something went wrong. Please try again later.');
      setMessageType('error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, new_password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('🎉 Password reset successfully! Redirecting to login...');
        setMessageType('success');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setMessage(data.error || 'Failed to reset password. Please try again.');
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('⚠️ Something went wrong. Please try again later.');
      setMessageType('error');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {step === 'request' && (
          <>
            <h1>Reset Password</h1>
            <br />
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Send Reset Code</button>
            </form>
          </>
        )}

        {step === 'reset' && (
          <>
            <h1>Reset Password</h1>
            <br />
            <form onSubmit={handleResetPassword}>
              <input
                type="text"
                placeholder="Enter 6-digit reset code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit">Reset Password</button>
            </form>
          </>
        )}

        {message && <p className={`message ${messageType}`}>{message}</p>}

        <p className="register-link">
          Remember your password?{' '}
          <Link className="register" to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
