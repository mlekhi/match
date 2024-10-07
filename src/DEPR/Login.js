import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name.trim()) {
      // Pass the name as a query parameter
      navigate(`/match-graph?name=${encodeURIComponent(name)}`);
    } else {
      alert('Please enter your name');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <img src="logo.png" style={{ width: '150px', height: 'auto' }} alt="Logo" />
        <h2>Find Your Matches</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
          className="input-field"
        />
        <button type="submit" className="submit-btn">
          Find Matches
        </button>
      </form>
    </div>
  );
};

export default Login;
