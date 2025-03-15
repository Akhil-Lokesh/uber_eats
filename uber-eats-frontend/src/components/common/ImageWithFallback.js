import React, { useState } from 'react';

const ImageWithFallback = ({ src, alt, className, ...props }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className="image-container position-relative">
      {loading && (
        <div className="image-loading-placeholder">
          <div className="spinner-border text-primary spinner-border-sm" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      
      {error ? (
        <div className="image-error-placeholder">
          <i className="bi bi-image text-muted"></i>
          <p className="small text-muted">Image unavailable</p>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`${className} ${loading ? 'd-none' : ''}`}
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
          {...props}
        />
      )}
    </div>
  );
};

export default ImageWithFallback;