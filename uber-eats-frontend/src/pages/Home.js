import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isCustomer, isRestaurant } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already logged in
    if (isAuthenticated) {
      if (isCustomer) {
        navigate('/dashboard');
      } else if (isRestaurant) {
        navigate('/restaurant/dashboard');
      }
    }

    // Fetch featured restaurants
    const fetchFeaturedRestaurants = async () => {
      try {
        setLoading(true);
        // Mock data
        const mockRestaurants = [
          {
            id: 1,
            name: 'Burger Palace',
            cuisine: 'American',
            rating: 4.5,
            deliveryTime: '15-25 min',
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&w=500&q=80',
          },
          {
            id: 2,
            name: 'Pizza Heaven',
            cuisine: 'Italian',
            rating: 4.2,
            deliveryTime: '20-30 min',
            imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&w=500&q=80',
          },
          {
            id: 3,
            name: 'Sushi World',
            cuisine: 'Japanese',
            rating: 4.7,
            deliveryTime: '25-35 min',
            imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&w=500&q=80',
          },
        ];

        // Simulate API call
        setTimeout(() => {
          setFeaturedRestaurants(mockRestaurants);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setLoading(false);
      }
    };

    fetchFeaturedRestaurants();
  }, [isAuthenticated, isCustomer, isRestaurant, navigate]);

  return (
    <>
      {/* Enhanced Hero Section */}
      <div className="hero-section position-relative">
        {/* Overlay with gradient for better text visibility */}
        <div 
          className="position-absolute w-100 h-100" 
          style={{ 
            background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -1,
            top: 0,
            left: 0
          }}
        ></div>
        
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10 text-center">
              {/* Main Heading with Animation */}
              <h1 
                className="display-4 fw-bold text-white mb-3"
                style={{ 
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
                  fontFamily: '"UberMove", sans-serif',
                  letterSpacing: '-0.5px'
                }}
              >
                Food Delivery & Takeout
                <span className="ms-2" style={{ color: '#FFD700' }}>⚡</span>
              </h1>
              
              {/* Subheading with improved typography */}
              <p 
                className="lead text-white mb-4"
                style={{ 
                  fontSize: '1.3rem',
                  maxWidth: '800px',
                  margin: '0 auto',
                  textShadow: '1px 1px 3px rgba(0, 0, 0, 0.6)'
                }}
              >
                Order food from your favorite restaurants and have it delivered right to your doorstep
              </p>
              
              {/* Food joke in italics */}
              <p 
                className="text-white fst-italic mb-4"
                style={{
                  fontSize: '1rem',
                  opacity: '0.9',
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
                }}
              >
                <i className="bi bi-chat-quote me-1"></i>
                "I'm on a seafood diet... I see food and I eat it!"
              </p>
              
              {/* UPDATED: Search Bar with Expanded Width */}
              <div className="search-container mb-5 px-3">
                <div 
                  className="search-bar position-relative"
                  style={{ 
                    maxWidth: '1000px',
                    width: '100%',
                    margin: '0 auto',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <input 
                    type="text" 
                    className="form-control form-control-lg border-0 rounded-pill py-3 ps-4 pe-5" 
                    placeholder="Enter your delivery address"
                    style={{ fontSize: '1.1rem', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                  />
                  <button 
                    className="btn btn-success rounded-pill position-absolute top-50 end-0 translate-middle-y me-2"
                    style={{ 
                      padding: '0.6rem 1.5rem',
                      backgroundColor: '#06C167',
                      fontWeight: '500'
                    }}
                  >
                    <i className="bi bi-search me-2"></i>
                    Find Food
                  </button>
                </div>
              </div>
              
              {/* CTA Buttons with Animation */}
              <div className="cta-buttons d-flex justify-content-center gap-3 flex-wrap">
                <Link 
                  to="/restaurants" 
                  className="btn btn-success btn-lg rounded-pill px-4 py-3"
                  style={{ 
                    backgroundColor: '#06C167',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    minWidth: '180px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <i className="bi bi-bag-check me-2"></i>
                  Order Now
                </Link>
                <Link 
                  to="/signup/restaurant" 
                  className="btn btn-outline-light btn-lg rounded-pill px-4 py-3"
                  style={{ 
                    borderWidth: '2px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    minWidth: '180px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <i className="bi bi-shop me-2"></i>
                  Partner with Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-5 bg-dark text-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">How It Works</h2>
            <p className="text-muted">Ordering your favorite food has never been easier</p>
          </div>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="feature-card card h-100">
                <div className="card-body text-center">
                  <div className="feature-icon-container">
                    <i className="bi bi-search feature-icon"></i>
                  </div>
                  <h3 className="card-title h4">Browse Restaurants</h3>
                  <p className="card-text text-muted">
                    Find restaurants near you that offer delivery or pickup options.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card card h-100">
                <div className="card-body text-center">
                  <div className="feature-icon-container">
                    <i className="bi bi-basket feature-icon"></i>
                  </div>
                  <h3 className="card-title h4">Select Your Dishes</h3>
                  <p className="card-text text-muted">
                    Browse menus and select your favorite dishes to add to your cart.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card card h-100">
                <div className="card-body text-center">
                  <div className="feature-icon-container">
                    <i className="bi bi-truck feature-icon"></i>
                  </div>
                  <h3 className="card-title h4">Fast Delivery</h3>
                  <p className="card-text text-muted">
                    Track your order in real-time as it makes its way to your doorstep.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="py-5 bg-black text-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Featured Restaurants</h2>
            <p className="text-muted">Discover our most popular restaurants</p>
          </div>
          
          {loading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {featuredRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="col-md-4">
                  <div className="restaurant-card card h-100 neon-border">
                    <div className="position-relative overflow-hidden">
                      <img
                        src={restaurant.imageUrl}
                        className="card-img-top"
                        alt={restaurant.name}
                      />
                      <div 
                        className="position-absolute top-0 end-0 m-3 bg-success text-white px-2 py-1 rounded-pill"
                        style={{ fontSize: '0.8rem' }}
                      >
                        {restaurant.deliveryTime}
                      </div>
                    </div>
                    <div className="card-body">
                      <h5 className="card-title">{restaurant.name}</h5>
                      <p className="card-text text-muted mb-2">{restaurant.cuisine}</p>
                      <div className="restaurant-meta">
                        <div className="rating">
                          <i className="bi bi-star-fill"></i>
                          <span className="ms-1">{restaurant.rating}</span>
                        </div>
                        <button className="btn btn-sm btn-outline-success rounded-pill">
                          <i className="bi bi-heart me-1"></i>
                          Save
                        </button>
                      </div>
                      <Link to={`/restaurants/${restaurant.id}`} className="btn btn-success w-100 mt-3">
                        View Menu
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-5">
            <Link to="/restaurants" className="btn btn-success btn-lg">
              Browse All Restaurants
            </Link>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="bg-dark text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="fw-bold mb-3">Download Our Mobile App</h2>
              <p className="mb-4" style={{ maxWidth: '500px' }}>
                Get the full UberEATS experience on your phone. Track your food order in real-time,
                save your favorite restaurants, and more.
              </p>
              
              <div className="d-flex gap-3 flex-wrap">
                <a 
                  href="https://apps.apple.com/us/app/uber-eats-food-delivery/id1058959277" 
                  className="btn btn-light rounded-pill d-flex align-items-center px-4 py-2"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-apple fs-4 me-2"></i>
                  <div className="text-start">
                    <div style={{ fontSize: '0.7rem' }}>Download on the</div>
                    <div className="fw-bold">App Store</div>
                  </div>
                </a>
                
                <a 
                  href="https://play.google.com/store/apps/details?id=com.ubercab.eats" 
                  className="btn btn-outline-light rounded-pill d-flex align-items-center px-4 py-2"
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <i className="bi bi-google-play fs-4 me-2"></i>
                  <div className="text-start">
                    <div style={{ fontSize: '0.7rem' }}>GET IT ON</div>
                    <div className="fw-bold">Google Play</div>
                  </div>
                </a>
              </div>
            </div>
            
            <div className="col-lg-6 mt-5 mt-lg-0">
              <div className="app-preview-container position-relative mx-auto" style={{ maxWidth: '300px' }}>
                {/* Phone Frame */}
                <div 
                  className="phone-frame position-relative mx-auto"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '30px',
                    padding: '15px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {/* App Screenshot */}
                  <div 
                    className="app-screenshot"
                    style={{ 
                      background: 'linear-gradient(135deg, #06C167, #00A651)',
                      borderRadius: '18px',
                      height: '420px',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* UberEats Logo */}
                    <div className="mb-4 fw-bold fs-4">UberEats</div>
                    
                    {/* App Interface Elements */}
                    <div 
                      className="mb-3"
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px',
                        padding: '10px 20px',
                        width: '80%'
                      }}
                    >
                      <i className="bi bi-search me-2"></i>
                      Find Restaurants
                    </div>
                    
                    <div 
                      style={{ 
                        background: 'white',
                        borderRadius: '10px',
                        padding: '15px',
                        width: '80%',
                        color: 'black',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <div className="fw-bold mb-1">Current Order</div>
                      <div className="text-muted small">Tracking your delivery</div>
                      <div 
                        className="progress mt-2"
                        style={{ height: '5px' }}
                      >
                        <div 
                          className="progress-bar bg-success" 
                          style={{ width: '70%' }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div 
                        className="app-dot"
                        style={{ 
                          width: '120px',
                          height: '5px',
                          background: 'white',
                          borderRadius: '10px',
                          marginTop: '20px',
                          marginBottom: '10px'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;