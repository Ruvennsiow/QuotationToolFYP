// LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = require('../../utils/config');
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      setIsLoading(true);
      console.log('Attempting to login with URL:', `${BASE_URL}/login`);
      
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      console.log('Login response status:', response.status);
      
      // Handle different status codes with appropriate messages
      if (response.status === 401) {
        setError('Invalid username or password. Please check your credentials and try again.');
        setIsLoading(false);
        return;
      }
      
      if (response.status === 404) {
        setError('Login service not found. Please contact the administrator.');
        setIsLoading(false);
        return;
      }
      
      if (response.status >= 500) {
        setError('Server error. Please try again later or contact the administrator.');
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (textError) {
            // If we can't get text either, use status code
            errorMessage = `Login failed with status: ${response.status}`;
          }
        }
        
        setError(errorMessage);
        setIsLoading(false);
        return;
      }
  
      // Handle successful response
      let data;
      try {
        data = await response.json();
        console.log('Login response data:', data);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        setError('Received invalid response from server. Please try again.');
        setIsLoading(false);
        return;
      }
  
      if (data.success) {
        // Login successful
        console.log('Login successful, navigating to inventory');
        navigate('/inventory');
      } else {
        // Server returned success: false
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error details:', err);
      
      // Network or other errors
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Cannot connect to the server. Please check your internet connection and try again.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {isLoading && <LoadingSpinner />}
      <div className="login-box">
        <h2 className="login-title">Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
