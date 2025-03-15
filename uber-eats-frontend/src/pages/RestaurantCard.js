import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { addFavoriteRestaurant, removeFavoriteRestaurant } from '../services/customer';

// Stock images for each cuisine type
const CUISINE_IMAGES = {
  Italian: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  American: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  Chinese: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  Japanese: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  Mexican: 'https://images.unsplash.com/photo-1552332386-f8dd00dc869f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  Indian: 'https://images.unsplash.com/photo-1585937421612-70a008356c36?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  Thai: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  Mediterranean: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  // Default image if cuisine not found
  default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
};

const RestaurantCard = ({ restaurant, listView = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(restaurant.isFavorite || false);
  
  // Get appropriate image based on cuisine
  const getRestaurantImage = () => {
    const cuisine = restaurant.cuisine || 'default';
    return CUISINE_IMAGES[cuisine] || CUISINE_IMAGES.default;
  };
  
  // Format ratings display
  const formatRating = () => {
    if (restaurant.rating && restaurant.reviewCount) {
      return (
        <div className="d-flex align-items-center">
          <i className="bi bi-star-fill text-warning me-1"></i>
          <span>{restaurant.rating.toFixed(1)}</span>
          <span className="text-muted ms-1">({restaurant.reviewCount})</span>
        </div>
      );
    } else if (restaurant.rating) {
      return (
        <div className="d-flex align-items-center">
          <i className="bi bi-star-fill text-warning me-1"></i>
          <span>{restaurant.rating.toFixed(1)}</span>
        </div>
      );
    } else {
      return (
        <div className="text-muted">
          <i className="bi bi-star me-1"></i>
          <span>No reviews yet</span>
        </div>
      );
    }
  };

  // Handle favorite toggle with animation
  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsFavorite(!isFavorite);
      
      if (isFavorite) {
        await removeFavoriteRestaurant(restaurant.id);
      } else {
        await addFavoriteRestaurant(restaurant.id);
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      setIsFavorite(!isFavorite); // Revert on error
    }
  };

  // Format delivery time
  const formatDeliveryTime = () => {
    if (!restaurant.deliveryTime) return "Delivery time not available";
    return restaurant.deliveryTime;
  };

  // Grid view card (default)
  if (!listView) {
    return (
      <div className="restaurant-card card h-100">
        <div className="position-relative">
          {!imageLoaded && (
            <div className="skeleton-image" style={{ height: '180px' }}></div>
          )}
          <img
            src={getRestaurantImage()}
            className={`card-img-top ${imageLoaded ? 'fade-in' : 'd-none'}`}
            alt={restaurant.name}
            style={{ height: '180px', objectFit: 'cover' }}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          <button 
            className={`favorite-button btn btn-light rounded-circle position-absolute end-0 top-0 m-2 ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteToggle}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <i className={`bi ${isFavorite ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
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
            <span>{restaurant.cuisine || 'Various'}</span>
          </div>
          
          <div className="d-flex justify-content-between mb-2">
            {formatRating()}
            
            <div className="delivery-time d-flex align-items-center">
              <i className="bi bi-clock me-1 text-success"></i>
              <span className="small">{formatDeliveryTime()}</span>
            </div>
          </div>
          
          <div className="d-flex justify-content-between mb-3 small text-muted">
            <div className="delivery-fee">
              <span>${(restaurant.deliveryFee || 0).toFixed(2)} delivery</span>
            </div>
            <div className="min-order">
              <span>${restaurant.minOrder || 0} min</span>
            </div>
          </div>
          
          <Link 
            to={`/restaurants/${restaurant.id}`} 
            className="btn btn-success btn-sm w-100 stretched-link"
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
    <div className="restaurant-card card mb-3">
      <div className="row g-0">
        <div className="col-md-3 position-relative">
          {!imageLoaded && (
            <div className="skeleton-image h-100"></div>
          )}
          <img
            src={getRestaurantImage()}
            className={`img-fluid rounded-start h-100 ${imageLoaded ? 'fade-in' : 'd-none'}`}
            alt={restaurant.name}
            style={{ objectFit: 'cover' }}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
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
                  <i className={`bi ${isFavorite ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
                </button>
              </div>
            </div>
            
            <div className="mb-2 text-muted cuisine-price">
              <span>{restaurant.cuisine || 'Various'}</span>
            </div>
            
            <div className="row mb-3">
              <div className="col-md-6">
                {formatRating()}
                
                <div className="delivery-time d-flex align-items-center mb-2">
                  <i className="bi bi-clock me-1 text-success"></i>
                  <span>{formatDeliveryTime()}</span>
                </div>
                
                <div className="d-flex mb-2">
                  <div className="delivery-fee me-3">
                    <span>${(restaurant.deliveryFee || 0).toFixed(2)} delivery</span>
                  </div>
                  <div className="min-order">
                    <span>${restaurant.minOrder || 0} min order</span>
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