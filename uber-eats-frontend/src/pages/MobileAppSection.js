import React from 'react';

const MobileAppSection = () => {
  return (
    <section className="mobile-app-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="mobile-app-content">
              <h2>Download Our Mobile App</h2>
              <p>
                Get the full UberEATS experience on your phone. Track your food order in real-time,
                save your favorite restaurants, and more.
              </p>
              <div className="app-buttons">
                <a href="https://apps.apple.com/us/app/uber-eats-food-delivery/id1058959277" 
                   className="app-btn app-btn-primary"
                   target="_blank" 
                   rel="noopener noreferrer">
                  <i className="bi bi-apple"></i> App Store
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.ubercab.eats" 
                   className="app-btn app-btn-secondary"
                   target="_blank" 
                   rel="noopener noreferrer">
                  <i className="bi bi-google-play"></i> Google Play
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="app-image-container">
              {/* Use a reliable placeholder image */}
              <img 
                src="https://d1e00ek4ebabms.cloudfront.net/production/6665bc50-be3c-4ed8-b844-d0dcbf3a9f8a.jpg" 
                alt="UberEATS Mobile App"
                style={{ maxWidth: '80%', height: 'auto', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppSection;