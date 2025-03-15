import React from 'react';

/**
 * Skeleton loader component that mimics the Uber Eats loading experience
 * Replaces traditional spinners with content-shaped placeholders
 */
const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'restaurant-card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-meta">
                <div className="skeleton-rating"></div>
                <div className="skeleton-time"></div>
              </div>
            </div>
          </div>
        );
      case 'menu-item':
        return (
          <div className="skeleton-menu-item">
            <div className="skeleton-image small"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-price"></div>
            </div>
          </div>
        );
      case 'text-line':
        return (
          <div className="skeleton-text-line"></div>
        );
      case 'cart-item':
        return (
          <div className="skeleton-menu-item">
            <div className="skeleton-image small" style={{ width: '80px' }}></div>
            <div className="skeleton-content w-100">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="d-flex justify-content-between w-100">
                <div className="skeleton-price" style={{ width: '30%' }}></div>
                <div className="skeleton-price" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>
        );
      case 'order-tracking':
        return (
          <div className="skeleton-card" style={{ height: '200px' }}>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text" style={{ height: '20px', marginTop: '20px' }}></div>
              <div className="d-flex justify-content-between mt-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skeleton-rating" style={{ width: '15%', height: '40px' }}></div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="skeleton-card">
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="skeleton-loader">
      {Array(count).fill().map((_, index) => (
        <div key={index} className="skeleton-item">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

// Example usage:
// <SkeletonLoader type="restaurant-card" count={4} /> - For restaurant list
// <SkeletonLoader type="menu-item" count={6} /> - For menu items list
// <SkeletonLoader type="text-line" count={3} /> - For text content
// <SkeletonLoader type="cart-item" count={2} /> - For cart items
// <SkeletonLoader type="order-tracking" count={1} /> - For order tracking view

export default SkeletonLoader;