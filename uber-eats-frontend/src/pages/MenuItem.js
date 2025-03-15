import React, { useState } from 'react';

const MenuItem = ({ item, onAddToCart }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Simulate a delay for the animation
    setTimeout(() => {
      if (onAddToCart) {
        onAddToCart(item);
      }
      setIsAdding(false);
    }, 500);
  };

  return (
    <div className="menu-item" style={{
      backgroundColor: '#121212',
      borderRadius: '8px',
      overflow: 'hidden',
      height: '100%',
      border: '1px solid #333333',
      transition: 'transform 0.3s ease',
    }}>
      {/* Item Image */}
      <div className="position-relative" style={{
        height: '160px', 
        overflow: 'hidden'
      }}>
        {!imageLoaded && (
          <div style={{
            backgroundColor: '#242424',
            height: '160px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        
        <img 
          src={item.imageUrl} 
          alt={item.name}
          className={`w-100 h-100 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Price Badge */}
        <div 
          className="position-absolute bottom-0 end-0 m-2 px-2 py-1 rounded"
          style={{
            backgroundColor: '#06C167',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          ${item.price.toFixed(2)}
        </div>
        
        {/* Popular Badge (if applicable) */}
        {item.isPopular && (
          <div 
            className="position-absolute top-0 start-0 m-2 px-2 py-1 rounded"
            style={{
              backgroundColor: 'rgba(255, 215, 0, 0.2)',
              color: '#FFD700',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            <i className="bi bi-star-fill me-1"></i>
            Popular
          </div>
        )}
      </div>
      
      {/* Item Info */}
      <div className="p-3">
        <h5 className="text-white mb-1" style={{
          fontSize: '16px',
          fontWeight: '600'
        }}>{item.name}</h5>
        
        {/* Description with show more/less */}
        {item.description && (
          <div className="mb-3">
            {item.description.length > 80 && !showDetails ? (
              <p className="text-muted mb-1" style={{ fontSize: '14px' }}>
                {item.description.substring(0, 80)}...{' '}
                <button 
                  className="btn btn-link btn-sm p-0 text-success"
                  style={{ 
                    fontSize: '14px', 
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none' 
                  }}
                  onClick={() => setShowDetails(true)}
                >
                  more
                </button>
              </p>
            ) : (
              <p className="text-muted mb-1" style={{ fontSize: '14px' }}>
                {item.description}
                {item.description.length > 80 && (
                  <button 
                    className="btn btn-link btn-sm p-0 text-success"
                    style={{ 
                      fontSize: '14px', 
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none'  
                    }}
                    onClick={() => setShowDetails(false)}
                  >
                    less
                  </button>
                )}
              </p>
            )}
          </div>
        )}
        
        {/* Dietary Tags (if available) */}
        {item.dietary && item.dietary.length > 0 && (
          <div className="mb-3">
            {item.dietary.map((tag, index) => (
              <span 
                key={index}
                className="badge me-1"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#CCCCCC',
                  fontSize: '12px'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Add to Cart Button */}
        <button 
          className="btn btn-success w-100"
          onClick={handleAddToCart}
          disabled={isAdding}
          style={{
            borderRadius: '8px',
            backgroundColor: '#06C167',
            border: 'none',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
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
  );
};

export default MenuItem;