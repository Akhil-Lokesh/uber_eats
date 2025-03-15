import React, { useState } from 'react';

const MenuItem = ({ item, addToCart, restaurantId }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Handle adding to cart with animation feedback
  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Simulate a short delay for animation
    setTimeout(() => {
      addToCart(item, restaurantId);
      setIsAdding(false);
    }, 300);
  };

  return (
    <div className="dish-card card h-100">
      <div className="position-relative">
        {!isImageLoaded && (
          <div className="skeleton-image" style={{ height: '180px' }}></div>
        )}
        <img
          src={item.imageUrl}
          className={`card-img-top food-image ${isImageLoaded ? 'fade-in' : 'd-none'}`}
          alt={item.name}
          onLoad={() => setIsImageLoaded(true)}
          loading="lazy"
        />
        <div className="dish-price">
          ${item.price.toFixed(2)}
        </div>
        {item.isPopular && (
          <div className="position-absolute top-0 start-0 m-2">
            <span className="badge bg-success">Popular</span>
          </div>
        )}
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title mb-1">{item.name}</h5>
        
        {/* Truncate description with "show more" option */}
        {item.description && (
          <>
            {item.description.length > 80 && !showDetails ? (
              <p className="card-text text-muted mb-2">
                {item.description.substring(0, 80)}...{' '}
                <button 
                  className="btn btn-link btn-sm text-success p-0" 
                  onClick={() => setShowDetails(true)}
                  style={{ textDecoration: 'none' }}
                >
                  more
                </button>
              </p>
            ) : (
              <p className="card-text text-muted mb-2">
                {item.description}
                {item.description.length > 80 && (
                  <button 
                    className="btn btn-link btn-sm text-success p-0 ms-1" 
                    onClick={() => setShowDetails(false)}
                    style={{ textDecoration: 'none' }}
                  >
                    less
                  </button>
                )}
              </p>
            )}
          </>
        )}
        
        {/* Nutritional info or dietary tags if available */}
        {item.dietary && item.dietary.length > 0 && (
          <div className="dietary-tags mb-3">
            {item.dietary.map((tag, index) => (
              <span key={index} className="badge bg-light text-dark me-1">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-auto">
          <button
            className={`btn btn-success w-100 add-to-cart-button ${isAdding ? 'active' : ''}`}
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Adding...
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle me-2"></i>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;