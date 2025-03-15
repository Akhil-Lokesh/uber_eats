import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { restaurantSignup, restaurantLogin } from '../services/auth';

const RestaurantSignup = () => {
  const navigate = useNavigate();
  const { handleLoginSuccess } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cuisineType: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const cuisineOptions = [
    'American', 'Italian', 'Chinese', 'Japanese', 'Mexican', 
    'Indian', 'Thai', 'Mediterranean', 'Fast Food', 'Other'
  ];
  
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
  
  const validateStep1 = () => {
    const newErrors = {};
    
    // Validate restaurant name
    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = 'Restaurant name is required';
    }
    
    // Validate owner name
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
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
    
    // Only set errors for step 1 fields, don't validate step 2 fields here
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = () => {
    const newErrors = {};
    
    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    // Validate city
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    // Validate state
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    } else if (formData.state.length !== 2) {
      newErrors.state = 'Please use 2-letter state code';
    }
    
    // Validate zip code
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Invalid zip code format';
    }
    
    // Validate cuisine type
    if (!formData.cuisineType) {
      newErrors.cuisineType = 'Cuisine type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      // Scroll to top for better UX
      window.scrollTo(0, 0);
    }
  };
  
  const prevStep = () => {
    setCurrentStep(1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateStep2()) {
      setIsSubmitting(true);
      
      try {
        // Prepare signup data with all required fields
        const signupData = {
          name: formData.restaurantName,
          email: formData.email,
          password: formData.password,
          role: 'restaurant',
          ownerName: formData.ownerName,
          phone: formData.phone,
          location: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
          cuisine: formData.cuisineType
        };
        
        // Call the signup API
        await restaurantSignup(signupData);
        
        // Login after successful signup
        const loginResponse = await restaurantLogin({
          email: formData.email,
          password: formData.password
        });
        
        // Handle successful login
        handleLoginSuccess(loginResponse.data.user, 'restaurant');
        
        // Redirect to restaurant dashboard
        navigate('/restaurant/dashboard');
      } catch (error) {
        console.error('Signup error:', error);
        setErrors({
          ...errors,
          general: error.response?.data?.message || 'An error occurred during signup'
        });
        
        // Show error at the appropriate step
        if (error.response?.data?.message?.includes('location') || 
            error.response?.data?.message?.includes('cuisine')) {
          setCurrentStep(2);
        } else {
          setCurrentStep(1);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <div className="container py-5 mt-5">
      <div className="restaurant-signup-container">
        <div className="restaurant-signup-header">
          <h1>Partner with UberEATS</h1>
          <p>Reach more customers and grow your business</p>
        </div>
        
        {/* Progress Indicator */}
        <div className="signup-progress">
          <div className="row align-items-center">
            <div className="col-6 text-center">
              <div className={`progress-step mx-auto ${currentStep >= 1 ? 'active' : 'inactive'}`}>
                1
              </div>
              <p className={currentStep === 1 ? 'fw-bold' : ''}>Account Info</p>
            </div>
            <div className="col-6 text-center">
              <div className={`progress-step mx-auto ${currentStep >= 2 ? 'active' : 'inactive'}`}>
                2
              </div>
              <p className={currentStep === 2 ? 'fw-bold' : ''}>Restaurant Details</p>
            </div>
          </div>
          <div className="progress-line" style={{ width: currentStep === 1 ? '50%' : '100%' }}></div>
        </div>
        
        {/* Error Message */}
        {errors.general && (
          <div className="alert alert-danger mt-4" role="alert">
            {errors.general}
          </div>
        )}
        
        {/* Form Steps */}
        <form onSubmit={handleSubmit}>
          {currentStep === 1 && (
            <div className="form-section fade-in">
              <h3>Account Information</h3>
              
              <div className="row g-3">
                <div className="col-md-6 mb-3">
                  <label htmlFor="restaurantName" className="form-label">Restaurant Name</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-shop"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control ${errors.restaurantName ? 'is-invalid' : ''}`}
                      id="restaurantName"
                      name="restaurantName"
                      placeholder="Enter restaurant name"
                      value={formData.restaurantName}
                      onChange={handleChange}
                    />
                    {errors.restaurantName && <div className="invalid-feedback">{errors.restaurantName}</div>}
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="ownerName" className="form-label">Owner Name</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control ${errors.ownerName ? 'is-invalid' : ''}`}
                      id="ownerName"
                      name="ownerName"
                      placeholder="Enter owner name"
                      value={formData.ownerName}
                      onChange={handleChange}
                    />
                    {errors.ownerName && <div className="invalid-feedback">{errors.ownerName}</div>}
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-telephone"></i>
                    </span>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                      id="phone"
                      name="phone"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                </div>
                
                <div className="col-12 mt-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="termsAgreement"
                      required
                    />
                    <label className="form-check-label" htmlFor="termsAgreement">
                      I agree to the <Link to="/terms" style={{ color: 'var(--primary-color)' }}>Terms of Service</Link> and <Link to="/privacy" style={{ color: 'var(--primary-color)' }}>Privacy Policy</Link>
                    </label>
                  </div>
                </div>
                
                <div className="col-12 mt-4">
                  <button
                    type="button"
                    className="btn btn-success w-100 py-2"
                    onClick={nextStep}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="form-section fade-in">
              <h3>Restaurant Details</h3>
              
              <div className="row g-3">
                <div className="col-12 mb-3">
                  <label htmlFor="address" className="form-label">Street Address</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-geo-alt"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                      id="address"
                      name="address"
                      placeholder="Enter street address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                  </div>
                </div>
                
                <div className="col-md-5 mb-3">
                  <label htmlFor="city" className="form-label">City</label>
                  <input
                    type="text"
                    className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                    id="city"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                  {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                </div>
                
                <div className="col-md-3 mb-3">
                  <label htmlFor="state" className="form-label">State</label>
                  <input
                    type="text"
                    className={`form-control ${errors.state ? 'is-invalid' : ''}`}
                    id="state"
                    name="state"
                    placeholder="CA"
                    maxLength="2"
                    value={formData.state}
                    onChange={handleChange}
                  />
                  {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                </div>
                
                <div className="col-md-4 mb-3">
                  <label htmlFor="zipCode" className="form-label">Zip Code</label>
                  <input
                    type="text"
                    className={`form-control ${errors.zipCode ? 'is-invalid' : ''}`}
                    id="zipCode"
                    name="zipCode"
                    placeholder="Enter zip code"
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                  {errors.zipCode && <div className="invalid-feedback">{errors.zipCode}</div>}
                </div>
                
                <div className="col-12 mb-3">
                  <label htmlFor="cuisineType" className="form-label">Cuisine Type</label>
                  <select
                    className={`form-select ${errors.cuisineType ? 'is-invalid' : ''}`}
                    id="cuisineType"
                    name="cuisineType"
                    value={formData.cuisineType}
                    onChange={handleChange}
                  >
                    <option value="">Select cuisine type</option>
                    {cuisineOptions.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>
                        {cuisine}
                      </option>
                    ))}
                  </select>
                  {errors.cuisineType && <div className="invalid-feedback">{errors.cuisineType}</div>}
                </div>
                
                <div className="col-12 d-flex gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-grow-1 py-2"
                    onClick={prevStep}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success flex-grow-1 py-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Account...
                      </>
                    ) : (
                      'Create Restaurant Account'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
        
        <div className="text-center mt-4">
          <p className="mb-0">
            Already have an account?{' '}
            <Link to="/login" className="text-decoration-none fw-medium" style={{ color: 'var(--primary-color)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSignup;