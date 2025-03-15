import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { customerSignup, customerLogin } from '../services/auth';

const CustomerSignup = () => {
  const navigate = useNavigate();
  const { handleLoginSuccess } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate terms agreement
    if (!termsAgreed) {
      newErrors.terms = 'You must agree to the Terms of Service';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Call the customer signup API
        const signupData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        };
        
        // Call the signup API
        await customerSignup(signupData);
        
        // Login after successful signup
        const loginResponse = await customerLogin({
          email: formData.email,
          password: formData.password
        });
        
        // Handle successful login
        handleLoginSuccess(loginResponse.data.user, 'customer');
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Signup error:', error);
        setErrors({
          ...errors,
          general: error.response?.data?.message || 'An error occurred during signup'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 56px)', marginTop: '56px' }}>
      <div className="col-lg-6 col-md-8 col-sm-10">
        <div className="card border-0 rounded-4 overflow-hidden" style={{ 
          backgroundColor: '#121212',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}>
          <div className="card-header text-center border-0 py-4" style={{ backgroundColor: 'rgba(6, 193, 103, 0.1)' }}>
            <h2 className="fw-bold text-white mb-0">Create a Customer Account</h2>
            <p className="text-muted mt-2 mb-0">Order from your favorite restaurants</p>
          </div>
          
          <div className="card-body p-4 p-md-5">
            {errors.general && (
              <div className="alert alert-danger" role="alert">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="form-label text-white ms-1 mb-2">Full Name</label>
                <div className="input-group input-group-lg rounded-3 overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}>
                  <span className="input-group-text border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 shadow-none text-white"
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    style={{ backgroundColor: 'transparent', fontSize: '16px' }}
                  />
                </div>
                {errors.name && <div className="text-danger ms-1 mt-2 small">{errors.name}</div>}
              </div>
              
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label text-white ms-1 mb-2">Email Address</label>
                  <div className="input-group input-group-lg rounded-3 overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}>
                    <span className="input-group-text border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-0 shadow-none text-white"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      style={{ backgroundColor: 'transparent', fontSize: '16px' }}
                    />
                  </div>
                  {errors.email && <div className="text-danger ms-1 mt-2 small">{errors.email}</div>}
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="phone" className="form-label text-white ms-1 mb-2">Phone Number</label>
                  <div className="input-group input-group-lg rounded-3 overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}>
                    <span className="input-group-text border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                      <i className="bi bi-telephone"></i>
                    </span>
                    <input
                      type="tel"
                      className="form-control border-0 shadow-none text-white"
                      id="phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{ backgroundColor: 'transparent', fontSize: '16px' }}
                    />
                  </div>
                  {errors.phone && <div className="text-danger ms-1 mt-2 small">{errors.phone}</div>}
                </div>
              </div>
              
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label htmlFor="password" className="form-label text-white ms-1 mb-2">Password</label>
                  <div className="input-group input-group-lg rounded-3 overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}>
                    <span className="input-group-text border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-0 shadow-none text-white"
                      id="password"
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      style={{ backgroundColor: 'transparent', fontSize: '16px' }}
                    />
                  </div>
                  {errors.password && <div className="text-danger ms-1 mt-2 small">{errors.password}</div>}
                </div>
                
                <div className="col-md-6">
                  <label htmlFor="confirmPassword" className="form-label text-white ms-1 mb-2">Confirm Password</label>
                  <div className="input-group input-group-lg rounded-3 overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', border: 'none' }}>
                    <span className="input-group-text border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'white' }}>
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control border-0 shadow-none text-white"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      style={{ backgroundColor: 'transparent', fontSize: '16px' }}
                    />
                  </div>
                  {errors.confirmPassword && <div className="text-danger ms-1 mt-2 small">{errors.confirmPassword}</div>}
                </div>
              </div>
              
              <div className="form-check mb-4 ms-1">
                <input
                  className="form-check-input border-0"
                  type="checkbox"
                  id="termsAgreement"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  style={{ backgroundColor: termsAgreed ? '#06C167' : 'rgba(255, 255, 255, 0.2)' }}
                />
                <label className="form-check-label text-white" htmlFor="termsAgreement">
                  I agree to the <Link to="/terms" className="text-success text-decoration-none fw-medium">Terms of Service</Link> and <Link to="/privacy" className="text-success text-decoration-none fw-medium">Privacy Policy</Link>
                </label>
                {errors.terms && <div className="text-danger small mt-2">{errors.terms}</div>}
              </div>
              
              <button
                type="submit"
                className="btn w-100 py-3 rounded-3 mb-4 fw-bold fs-5"
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
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
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
                  Already have an account?{' '}
                  <Link to="/login" className="text-decoration-none fw-bold text-success">
                    Sign in
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

export default CustomerSignup;