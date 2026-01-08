import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/register.css';

export default function RegisterPage() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(''); // <-- for verification step
  const [step, setStep] = useState('register'); // 'register' or 'verify'
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ company_name: companyName, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Verification code sent to your email. Please enter it below.');
        setMessageType('success');
        setStep('verify'); // move to verification step
      } else {
        setMessage(data.error || 'Registration failed. Please try again.');
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('⚠️ Something went wrong. Please try again later.');
      setMessageType('error');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://127.0.0.1:5000/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('🎉 Verification successful! Redirecting to login...');
        setMessageType('success');
        setTimeout(() => {
          navigate('/login', { state: { email } });
        }, 1500);
      } else {
        setMessage(data.error || 'Invalid verification code.');
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('⚠️ Something went wrong. Please try again later.');
      setMessageType('error');
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {step === 'register' && (
          <>
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Register</button>
            </form>
          </>
        )}

        {step === 'verify' && (
          <>
            <h1>Email Verification</h1>
            <form onSubmit={handleVerify}>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
              <button type="submit">Verify</button>
            </form>
          </>
        )}

        {message && <p className={`message ${messageType}`}>{message}</p>}

        {step === 'register' && (
          <p className="register-link">
            Already have an account? <a href="/login">Login here</a>
          </p>
        )}
      </div>
    </div>
  );
}
