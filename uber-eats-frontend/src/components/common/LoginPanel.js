import React, { useState, useEffect, useRef } from 'react';

const LoginPanel = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  
  const panelRef = useRef(null);
  const emailInputRef = useRef(null);
  
  // Handle ESC key to close panel
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Focus email input when panel opens
  useEffect(() => {
    if (isOpen && emailInputRef.current) {
      setTimeout(() => {
        emailInputRef.current.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        try {
          // Mock successful login
          const userData = {
            id: 1,
            name: activeTab === 'customer' ? 'John Doe' : 'Burger Palace',
            email: email,
            type: activeTab
          };
          
          // Send login data to parent component
          if (onLoginSuccess) {
            onLoginSuccess(userData);
          }
          
          // Close the login panel
          onClose();
        } catch (error) {
          console.error("Login error:", error);
          setError('An error occurred during login. Please try again.');
          setShake(true);
          setTimeout(() => setShake(false), 600);
        } finally {
          setIsSubmitting(false);
        }
      }, 1500);
      
    } catch (err) {
      console.error("Form submission error:", err);
      setError('Invalid email or password. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-panel-container">
      {/* Backdrop */}
      <div 
        className={`login-panel-backdrop ${isOpen ? 'show' : ''}`} 
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1040,
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease, visibility 0.3s ease',
          backdropFilter: 'blur(3px)'
        }}
      ></div>
      
      {/* Panel */}
      <div 
        ref={panelRef}
        className={`login-panel ${isOpen ? 'show' : ''} ${shake ? 'shake' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-panel-title"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '400px',
          height: '100%',
          zIndex: 1050,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto',
          backgroundColor: '#121212',
          boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
          border: 'none',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          animation: shake ? 'shake 0.6s cubic-bezier(.36,.07,.19,.97)' : 'none'
        }}
      >
        <div className="login-panel-header d-flex justify-content-between align-items-center py-4 px-4 border-0">
          <h4 className="m-0 text-white fw-bold" id="login-panel-title">Sign In</h4>
          <button 
            type="button" 
            className="login-panel-close border-0 bg-transparent"
            aria-label="Close"
            onClick={onClose}
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            <i className="bi bi-x fs-4"></i>
          </button>
        </div>
        
        <div className="login-panel-body p-4">
          {/* User Type Selector */}
          <div className="position-relative mb-4 rounded-pill overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="position-absolute bg-success transition-all rounded-pill" style={{ 
              height: '100%', 
              width: '50%', 
              left: activeTab === 'customer' ? '0' : '50%',
              transition: 'all 0.3s ease'
            }}></div>
            <div className="d-flex position-relative" style={{ zIndex: 1 }}>
              <button
                type="button"
                className={`flex-grow-1 border-0 py-3 ${activeTab === 'customer' ? 'text-dark fw-bold' : 'text-white'}`}
                onClick={() => setActiveTab('customer')}
                style={{ backgroundColor: 'transparent' }}
              >
                <i className={`bi bi-person me-2 ${activeTab === 'customer' ? 'text-dark' : 'text-white'}`}></i>
                Customer
              </button>
              <button
                type="button"
                className={`flex-grow-1 border-0 py-3 ${activeTab === 'restaurant' ? 'text-dark fw-bold' : 'text-white'}`}
                onClick={() => setActiveTab('restaurant')}
                style={{ backgroundColor: 'transparent' }}
              >
                <i className={`bi bi-shop me-2 ${activeTab === 'restaurant' ? 'text-dark' : 'text-white'}`}></i>
                Restaurant
              </button>
            </div>
          </div>
          
          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger p-3 rounded-3 d-flex align-items-center mb-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <div>{error}</div>
            </div>
          )}
          
          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="login-email" className="form-label text-white mb-2 ms-1">
                Email Address
              </label>
              <div className="input-group input-group-lg rounded-3 overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}>
                <span className="input-group-text border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-0 shadow-none text-white"
                  id="login-email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  ref={emailInputRef}
                  required
                  style={{ backgroundColor: 'transparent', fontSize: '16px' }}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label htmlFor="login-password" className="form-label text-white ms-1">
                  Password
                </label>
                <a href="#forgot-password" className="text-decoration-none small text-success">
                  Forgot password?
                </a>
              </div>
              <div className="input-group input-group-lg rounded-3 overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}>
                <span className="input-group-text border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control border-0 shadow-none text-white"
                  id="login-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ backgroundColor: 'transparent', fontSize: '16px' }}
                />
              </div>
            </div>
            
            <div className="form-check mb-4 ms-1">
              <input
                className="form-check-input border-0"
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ backgroundColor: rememberMe ? '#06C167' : 'rgba(255, 255, 255, 0.2)' }}
              />
              <label className="form-check-label text-white" htmlFor="remember-me">
                Remember me
              </label>
            </div>
            
            <button
              type="submit"
              className="btn w-100 py-3 rounded-3 mb-3 fw-bold fs-5"
              disabled={isSubmitting}
              style={{ 
                backgroundColor: '#06C167',
                color: '#000',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(6, 193, 103, 0.4)'
              }}
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
            
            <div className="position-relative mb-4">
              <hr className="text-muted" style={{ opacity: 0.3 }} />
              <div className="position-absolute translate-middle bg-dark px-3 text-white" style={{ top: '50%', left: '50%' }}>
                or
              </div>
            </div>
            
            <div className="d-grid gap-2 mb-4">
              <button 
                type="button" 
                className="btn d-flex align-items-center justify-content-center py-2 rounded-3"
                style={{ 
                  backgroundColor: '#f2f2f2',
                  color: '#000',
                  fontWeight: '500',
                }}
              >
                <i className="bi bi-google me-2" style={{ color: '#000' }}></i>
                Continue with Google
              </button>
              <button 
                type="button" 
                className="btn d-flex align-items-center justify-content-center py-2 rounded-3"
                style={{ 
                  backgroundColor: '#f2f2f2',
                  color: '#000',
                  fontWeight: '500',
                }}
              >
                <i className="bi bi-facebook me-2" style={{ color: '#000' }}></i>
                Continue with Facebook
              </button>
            </div>
            
            <div className="text-center">
              <p className="mb-0 text-white">
                Don't have an account?{' '}
                <a href={`#signup-${activeTab}`} className="text-decoration-none fw-bold text-success">
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
        
        ::placeholder {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        
        @media (max-width: 576px) {
          .login-panel {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPanel;