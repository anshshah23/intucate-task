import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email ends with @intucate.com
    if (!email.endsWith('@intucate.com')) {
      setError('Email must end with @intucate.com');
      return;
    }

    // Validate password is at least 8 characters
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Mock login - store in localStorage
    localStorage.setItem('auth_token', 'mock-jwt-token');
    localStorage.setItem('user_email', email);
    onLogin();
  };

  return (
    <div className="login-container">
      <h1>Intucate SQI</h1>
      <h2>Admin Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@intucate.com"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password (8+ characters)"
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="primary">
          Login
        </button>
      </form>
    </div>
  );
};
