import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Checkout = () => {
  const { cart, getCartTotal, checkout } = useCart(); // Removed clearCart since it's not needed
  const { currentUser } = useAuth();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    notes: '',
    paymentMethod: 'credit',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0 && !orderPlaced) {
      navigate('/cart');
    }
  }, [cart.items.length, orderPlaced, navigate]);

  // Calculate totals
  const subtotal = getCartTotal();
  const deliveryFee = 2.99;
  const tax = subtotal * 0.0875; // 8.75% tax rate
  const total = subtotal + deliveryFee + tax;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Credit card validation
    if (formData.paymentMethod === 'credit') {
      if (!formData.cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
      else if (formData.cardNumber.replace(/\s/g, '').length !== 16) 
        newErrors.cardNumber = 'Card number must be 16 digits';
      
      if (!formData.cardName.trim()) newErrors.cardName = 'Name on card is required';
      
      if (!formData.expiryDate.trim()) newErrors.expiryDate = 'Expiry date is required';
      else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) 
        newErrors.expiryDate = 'Use format MM/YY';
      
      if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
      else if (!/^\d{3}$/.test(formData.cvv)) 
        newErrors.cvv = 'CVV must be 3 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsSubmitting(true);
        
        // Format the address
        const deliveryAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`;
        
        // Call the checkout function from CartContext which will use the API
        const result = await checkout(deliveryAddress);
        
        if (result.success) {
          setOrderId(result.orderId);
          setOrderPlaced(true);
        } else {
          setErrors({ general: result.error || 'Failed to place order. Please try again.' });
        }
      } catch (error) {
        console.error('Error placing order:', error);
        setErrors({ general: 'Failed to place order. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (orderPlaced) {
    return (
      <div className="container py-5 mt-5" style={{ backgroundColor: '#1a1a1a', color: '#FFF' }}>
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h1 className="mb-3">Order Placed Successfully!</h1>
          <p className="lead">Your order has been received and is being processed.</p>
          <p className="mb-4">Order ID: <strong>{orderId}</strong></p>
          <p>You will receive an email confirmation shortly.</p>
          <div className="mt-4">
            <button className="btn btn-success me-2" onClick={() => navigate('/orders')}>
              View My Orders
            </button>
            <button className="btn btn-outline-light" onClick={() => navigate('/restaurants')}>
              Order More Food
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-5" style={{ backgroundColor: '#1a1a1a', color: '#FFF' }}>
      <h1 className="mb-4">Checkout</h1>
      
      <div className="row">
        <div className="col-lg-8">
          {errors.general && (
            <div className="alert alert-danger" role="alert">
              {errors.general}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="card mb-4" style={{ backgroundColor: '#121212', borderColor: '#333' }}>
              <div className="card-header" style={{ backgroundColor: '#242424', borderColor: '#333' }}>
                <h5 className="mb-0 text-white">Delivery Information</h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-12">
                    <label htmlFor="name" className="form-label text-white">Full Name</label>
                    <input 
                      type="text" 
                      className={`form-control bg-dark text-white border-secondary ${errors.name ? 'is-invalid' : ''}`}
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-12">
                    <label htmlFor="address" className="form-label text-white">Address</label>
                    <input 
                      type="text" 
                      className={`form-control bg-dark text-white border-secondary ${errors.address ? 'is-invalid' : ''}`}
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter your street address"
                    />
                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-5">
                    <label htmlFor="city" className="form-label text-white">City</label>
                    <input 
                      type="text" 
                      className={`form-control bg-dark text-white border-secondary ${errors.city ? 'is-invalid' : ''}`}
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                    />
                    {errors.city && <div className="invalid-feedback">{errors.city}</div>}
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="state" className="form-label text-white">State</label>
                    <input 
                      type="text" 
                      className={`form-control bg-dark text-white border-secondary ${errors.state ? 'is-invalid' : ''}`}
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="CA"
                      maxLength="2"
                    />
                    {errors.state && <div className="invalid-feedback">{errors.state}</div>}
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="zipCode" className="form-label text-white">Zip Code</label>
                    <input 
                      type="text" 
                      className={`form-control bg-dark text-white border-secondary ${errors.zipCode ? 'is-invalid' : ''}`}
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="Enter zip code"
                    />
                    {errors.zipCode && <div className="invalid-feedback">{errors.zipCode}</div>}
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="phone" className="form-label text-white">Phone Number</label>
                    <input 
                      type="text" 
                      className={`form-control bg-dark text-white border-secondary ${errors.phone ? 'is-invalid' : ''}`}
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-12">
                    <label htmlFor="notes" className="form-label text-white">Delivery Instructions (Optional)</label>
                    <textarea 
                      className="form-control bg-dark text-white border-secondary"
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Add any special instructions for delivery"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card mb-4" style={{ backgroundColor: '#121212', borderColor: '#333' }}>
              <div className="card-header" style={{ backgroundColor: '#242424', borderColor: '#333' }}>
                <h5 className="mb-0 text-white">Payment Method</h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <div className="form-check mb-2">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="credit"
                      name="paymentMethod"
                      value="credit"
                      checked={formData.paymentMethod === 'credit'}
                      onChange={handleChange}
                    />
                    <label className="form-check-label text-white" htmlFor="credit">
                      Credit / Debit Card
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      className="form-check-input"
                      id="cash"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleChange}
                    />
                    <label className="form-check-label text-white" htmlFor="cash">
                      Cash on Delivery
                    </label>
                  </div>
                </div>
                
                {formData.paymentMethod === 'credit' && (
                  <div className="credit-card-form">
                    <div className="row mb-3">
                      <div className="col-12">
                        <label htmlFor="cardNumber" className="form-label text-white">Card Number</label>
                        <input
                          type="text"
                          className={`form-control bg-dark text-white border-secondary ${errors.cardNumber ? 'is-invalid' : ''}`}
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          placeholder="1234 5678 9012 3456"
                        />
                        {errors.cardNumber && <div className="invalid-feedback">{errors.cardNumber}</div>}
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-12">
                        <label htmlFor="cardName" className="form-label text-white">Name on Card</label>
                        <input
                          type="text"
                          className={`form-control bg-dark text-white border-secondary ${errors.cardName ? 'is-invalid' : ''}`}
                          id="cardName"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleChange}
                          placeholder="Enter name as it appears on card"
                        />
                        {errors.cardName && <div className="invalid-feedback">{errors.cardName}</div>}
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="expiryDate" className="form-label text-white">Expiry Date</label>
                        <input
                          type="text"
                          className={`form-control bg-dark text-white border-secondary ${errors.expiryDate ? 'is-invalid' : ''}`}
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          placeholder="MM/YY"
                        />
                        {errors.expiryDate && <div className="invalid-feedback">{errors.expiryDate}</div>}
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="cvv" className="form-label text-white">CVV</label>
                        <input
                          type="text"
                          className={`form-control bg-dark text-white border-secondary ${errors.cvv ? 'is-invalid' : ''}`}
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleChange}
                          placeholder="123"
                        />
                        {errors.cvv && <div className="invalid-feedback">{errors.cvv}</div>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-success py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processing Order...
                  </>
                ) : (
                  `Place Order - $${total.toFixed(2)}`
                )}
              </button>
            </div>
          </form>
        </div>
        
        <div className="col-lg-4 mt-4 mt-lg-0">
          <div className="card mb-4" style={{ backgroundColor: '#121212', borderColor: '#333' }}>
            <div className="card-header" style={{ backgroundColor: '#242424', borderColor: '#333' }}>
              <h5 className="mb-0 text-white">Order Summary</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {cart.items.map((item) => (
                  <li key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom" style={{ borderColor: '#333' }}>
                    <div>
                      <span className="me-2">{item.quantity}x</span>
                      <span className="text-white">{item.name}</span>
                    </div>
                    <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Delivery Fee</span>
                  <span className="text-white">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Tax</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                <hr style={{ borderColor: '#333' }} />
                <div className="d-flex justify-content-between">
                  <span className="fw-bold text-white">Total</span>
                  <span className="fw-bold text-white">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ backgroundColor: '#121212', borderColor: '#333' }}>
            <div className="card-body">
              <h6 className="text-white">Estimated Delivery Time</h6>
              <p className="mb-0 text-white">25-40 minutes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;