import React, { useState, useEffect } from 'react';


const CartItem = ({ item, updateQuantity, removeFromCart }) => {
  const [animateQuantity, setAnimateQuantity] = useState(false);
  const [prevQuantity, setPrevQuantity] = useState(item.quantity);
  const [isRemoving, setIsRemoving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Track quantity changes for animation
  useEffect(() => {
    if (item.quantity !== prevQuantity) {
      setAnimateQuantity(true);
      const timer = setTimeout(() => setAnimateQuantity(false), 300);
      setPrevQuantity(item.quantity);
      return () => clearTimeout(timer);
    }
  }, [item.quantity, prevQuantity]);

  // Handle remove with animation
  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      removeFromCart(item.id);
    }, 300);
  };

  return (
    <div className={`cart-item border-bottom p-3 ${isRemoving ? 'cart-item-exit-active' : ''}`}>
      <div className="row align-items-center">
        <div className="col-3 col-md-2">
          <div className="food-image-container">
            {!imageLoaded && (
              <div className="skeleton-image" style={{ width: '80px', height: '80px', borderRadius: '8px' }}></div>
            )}
            <img
              src={item.imageUrl || 'https://via.placeholder.com/80'}
              alt={item.name}
              className={`img-fluid rounded food-image ${imageLoaded ? 'fade-in' : 'd-none'}`}
              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          </div>
        </div>
        
        <div className="col-9 col-md-5">
          <h5 className="mb-1">{item.name}</h5>
          <p className="text-muted small mb-0">${item.price.toFixed(2)} each</p>
          {item.customizations && item.customizations.length > 0 && (
            <div className="customizations mt-1">
              <small className="text-muted">
                {item.customizations.join(', ')}
              </small>
            </div>
          )}
        </div>
        
        <div className="col-7 col-md-3 mt-3 mt-md-0">
          <div className="input-group quantity-change">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                if (item.quantity > 1) {
                  updateQuantity(item.id, item.quantity - 1);
                }
              }}
              aria-label="Decrease quantity"
            >
              <i className="bi bi-dash"></i>
            </button>
            
            <input
              type="text"
              className={`form-control text-center ${animateQuantity ? 'quantity-bump' : ''}`}
              value={item.quantity}
              readOnly
              aria-label="Quantity"
            />
            
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <i className="bi bi-plus"></i>
            </button>
          </div>
        </div>
        
        <div className="col-3 col-md-1 text-end mt-3 mt-md-0">
          <span className="fw-bold d-block">
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
        
        <div className="col-2 col-md-1 text-end mt-3 mt-md-0">
          <button
            className="btn btn-link text-danger p-0"
            onClick={handleRemove}
            title="Remove item"
            aria-label="Remove item"
            disabled={isRemoving}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;