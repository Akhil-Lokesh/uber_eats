import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant, toggleFavorite, listView = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(restaurant.isFavorite || false);
  
  // Extract delivery time range for better visual presentation
  const deliveryTimeArray = restaurant.deliveryTime.split('-');
  const minTime = deliveryTimeArray[0].trim();
  const maxTime = deliveryTimeArray[1] ? deliveryTimeArray[1].trim() : null;
  
  // Calculate pricing level
  const getPricingLevel = () => {
    if (restaurant.priceRange) {
      return restaurant.priceRange;
    }
    // If no explicit price range, estimate from min order
    if (restaurant.minOrder < 12) return '$';
    if (restaurant.minOrder < 18) return '$$';
    return '$$$';
  };

  // Handle favorite toggle with animation
  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use the toggleFavorite function passed from parent
    toggleFavorite(restaurant.id);
    setIsFavorite(!isFavorite);
  };

  // Grid view card (default)
  if (!listView) {
    return (
      <div className="restaurant-card card h-100">
        <div className="position-relative">
          {!imageLoaded && (
            <div className="skeleton-image"></div>
          )}
          <div className="food-image-container">
            <img
              src={restaurant.imageUrl}
              className={`card-img-top food-image ${imageLoaded ? 'fade-in' : 'd-none'}`}
              alt={restaurant.name}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          </div>
          
          <button 
            className={`favorite-button btn btn-light rounded-circle position-absolute end-0 top-0 m-2 ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteToggle}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
          </button>
          
          {restaurant.promos && restaurant.promos.length > 0 && (
            <div className="position-absolute start-0 bottom-0 m-2">
              <div className="promo-tag bg-success text-white px-2 py-1 rounded-pill">
                {restaurant.promos[0]}
              </div>
            </div>
          )}
        </div>
        
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <h5 className="card-title mb-0 text-truncate">{restaurant.name}</h5>
            <span className="status-indicator">
              {restaurant.isOpen ? (
                <span className="text-success">Open</span>
              ) : (
                <span className="text-muted">Closed</span>
              )}
            </span>
          </div>
          
          <div className="mb-2 text-muted cuisine-price">
            <span>{restaurant.cuisine}</span>
            <span className="mx-1">•</span>
            <span>{getPricingLevel()}</span>
          </div>
          
          <div className="d-flex justify-content-between mb-3">
            <div className="delivery-time d-flex align-items-center">
              <i className="bi bi-clock me-1 text-success"></i>
              <span className="small">
                {minTime}
                {maxTime ? '-' + maxTime : 'min'}
              </span>
            </div>
          </div>
          
          <div className="d-flex justify-content-between mb-3 small text-muted">
            <div className="delivery-fee">
              <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
            </div>
            <div className="min-order">
              <span>${restaurant.minOrder} min</span>
            </div>
          </div>
          
          <Link 
            to={`/restaurants/${restaurant.id}`} 
            className="btn btn-outline-success btn-sm w-100 stretched-link"
            aria-label={`View menu for ${restaurant.name}`}
          >
            View Menu
          </Link>
        </div>
      </div>
    );
  }
  
  // List view card
  return (
    <div className="restaurant-card card">
      <div className="row g-0">
        <div className="col-md-3 position-relative">
          {!imageLoaded && (
            <div className="skeleton-image h-100"></div>
          )}
          <div className="food-image-container h-100">
            <img
              src={restaurant.imageUrl}
              className={`img-fluid rounded-start food-image h-100 ${imageLoaded ? 'fade-in' : 'd-none'}`}
              alt={restaurant.name}
              style={{ objectFit: 'cover' }}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
          </div>
          
          {restaurant.promos && restaurant.promos.length > 0 && (
            <div className="position-absolute start-0 bottom-0 m-2">
              <div className="promo-tag bg-success text-white px-2 py-1 rounded-pill">
                {restaurant.promos[0]}
              </div>
            </div>
          )}
        </div>
        
        <div className="col-md-9">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <h5 className="card-title mb-0">{restaurant.name}</h5>
              <div className="d-flex align-items-center">
                <span className="status-indicator me-3">
                  {restaurant.isOpen ? (
                    <span className="text-success">Open</span>
                  ) : (
                    <span className="text-muted">Closed</span>
                  )}
                </span>
                <button 
                  className={`favorite-button btn btn-light rounded-circle ${isFavorite ? 'active' : ''}`}
                  onClick={handleFavoriteToggle}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                </button>
              </div>
            </div>
            
            <div className="mb-2 text-muted cuisine-price">
              <span>{restaurant.cuisine}</span>
              <span className="mx-1">•</span>
              <span>{getPricingLevel()}</span>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                <div className="delivery-time d-flex align-items-center mb-2">
                  <i className="bi bi-clock me-1 text-success"></i>
                  <span>
                    {restaurant.deliveryTime}
                  </span>
                </div>
                
                <div className="d-flex mb-2">
                  <div className="delivery-fee me-3">
                    <span>${restaurant.deliveryFee.toFixed(2)} delivery</span>
                  </div>
                  <div className="min-order">
                    <span>${restaurant.minOrder} min order</span>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 d-flex align-items-center justify-content-md-end mt-3 mt-md-0">
                <Link 
                  to={`/restaurants/${restaurant.id}`} 
                  className="btn btn-success"
                  aria-label={`View menu for ${restaurant.name}`}
                >
                  View Menu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;