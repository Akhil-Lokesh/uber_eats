import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { customerLogin, restaurantLogin } from '../services/auth';

const Login = () => {
  const [userType, setUserType] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { isAuthenticated, handleLoginSuccess } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const credentials = { email, password };
      let response;
      
      // Call appropriate login function based on user type
      if (userType === 'customer') {
        response = await customerLogin(credentials);
      } else {
        response = await restaurantLogin(credentials);
      }
      
      // Handle successful login
      handleLoginSuccess(response.data.user, userType);
      
      // Redirect to appropriate dashboard
      navigate(userType === 'customer' ? '/dashboard' : '/restaurant/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5 mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-7">
          <div className="form-container">
            <div className="text-center mb-4">
              <h2 className="fw-bold">Welcome Back</h2>
              <p className="text-muted">Sign in to your account to continue</p>
            </div>
            
            {/* User Type Selector */}
            <div className="btn-group w-100 mb-4">
              <button
                type="button"
                className={`btn ${userType === 'customer' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setUserType('customer')}
              >
                <i className="bi bi-person me-2"></i>
                Customer
              </button>
              <button
                type="button"
                className={`btn ${userType === 'restaurant' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setUserType('restaurant')}
              >
                <i className="bi bi-shop me-2"></i>
                Restaurant
              </button>
            </div>
            
            {/* Error Alert */}
            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}
            
            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-decoration-none small">
                    Forgot password?
                  </Link>
                </div>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              
              <button
                type="submit"
                className="btn btn-primary w-100 py-2 mb-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
              
              <div className="text-center">
                <p className="mb-0">
                  Don't have an account?{' '}
                  <Link to={`/signup/${userType}`} className="text-decoration-none fw-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;