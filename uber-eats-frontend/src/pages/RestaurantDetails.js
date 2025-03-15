import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { addFavoriteRestaurant, removeFavoriteRestaurant, checkIsFavorite } from '../services/customer';

const RestaurantDetails = () => {
  const { id } = useParams();
  const { cart, addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedItems, setAddedItems] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);

  const ensureNumber = (value, defaultValue = 0) => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    
    return defaultValue;
  };

  useEffect(() => {
    if (cart && cart.items) {
      const cartMap = {};
      cart.items.forEach(item => {
        cartMap[item.id] = item.quantity;
      });
      setAddedItems(cartMap);
    }
  }, [cart]);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const restaurantResponse = await axios.get(`http://localhost:3001/api/restaurant/${id}`);
        
        if (restaurantResponse.data) {
          const restaurantData = {
            id: parseInt(id),
            name: restaurantResponse.data.name,
            cuisine: restaurantResponse.data.cuisine,
            address: restaurantResponse.data.location,
            phone: restaurantResponse.data.phone,
            hours: restaurantResponse.data.hours,
            description: restaurantResponse.data.description,
            isFavorite: restaurantResponse.data.is_favorite || false
          };
          
          setRestaurant(restaurantData);
          
          const menuResponse = await axios.get(`http://localhost:3001/api/restaurant/${id}/menu`);
          
          if (menuResponse.data && Array.isArray(menuResponse.data)) {
            const menuItems = menuResponse.data.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: ensureNumber(item.price, 0),
              category: item.category || 'Other',
              imageUrl: '/api/placeholder/400/320', // Use a placeholder image
              isPopular: item.is_popular || false,
              dietary: item.dietary || []
            }));
            
            setMenu(menuItems);
          } else {
            setMenu([]);
          }
        } else {
          setError('Restaurant not found');
        }
      } catch (error) {
        setError(`Failed to load restaurant details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        // Use the imported service function to check favorite status
        const response = await checkIsFavorite(id);
        setIsFavorite(response.data.isFavorite);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    if (id && isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [id, isAuthenticated]);

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        // Use the imported service function to remove from favorites
        console.log(`Removing restaurant ${id} from favorites...`);
        await removeFavoriteRestaurant(id);
      } else {
        // Use the imported service function to add to favorites
        console.log(`Adding restaurant ${id} to favorites...`);
        await addFavoriteRestaurant(id);
      }
      // Toggle favorite state after successful API call
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      alert(`Failed to update favorites: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddToCart = (item) => {
    try {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        restaurantName: restaurant?.name,
        customizations: item.dietary || []
      }, restaurant?.id);
      
      setAddedItems(prev => {
        const currentCount = prev[item.id] || 0;
        return {
          ...prev,
          [item.id]: currentCount + 1
        };
      });
      
      console.log(`Added ${item.name} to cart`);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  const getItemQuantity = (itemId) => {
    return addedItems[itemId] || 0;
  };

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div 
          className="restaurant-banner position-relative"
          style={{ 
            height: '350px',
            marginTop: '56px',
            background: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))'
          }}
        >
          <div className="container h-100 d-flex align-items-end">
            <div className="text-white pb-4 w-100">
              <div className="bg-secondary bg-opacity-25 h-4 w-50 mb-2"></div>
              <div className="bg-secondary bg-opacity-25 h-3 w-75"></div>
            </div>
          </div>
        </div>
        
        <div className="container py-4">
          <div className="text-center">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-white mt-2">Loading restaurant details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            <Link to="/restaurants" className="alert-link">Return to restaurant list</Link>
          </p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container py-5 mt-5">
        <div className="text-center py-5">
          <i className="bi bi-exclamation-circle fs-1 text-danger mb-3"></i>
          <h2>Restaurant Not Found</h2>
          <p className="text-muted mb-4">The restaurant you're looking for doesn't exist or has been removed.</p>
          <Link to="/restaurants" className="btn btn-success">
            Browse Restaurants
          </Link>
        </div>
      </div>
    );
  }

  const categories = ['all', ...new Set(menu.map(item => item.category).filter(Boolean))];

  return (
    <div className="container-fluid p-0">
      <div 
        className="restaurant-banner position-relative fade-in"
        style={{ 
          backgroundColor: '#121212',  
          height: '350px',
          marginTop: '56px'
        }}
      >
        <div className="container h-100 d-flex align-items-end">
          <div className="text-white pb-4">
            <h1 className="fw-bold mb-2">{restaurant.name}</h1>
            <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
              <span className="bg-dark bg-opacity-50 px-3 py-1 rounded-pill">{restaurant.cuisine}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-4">
        <div className="row">
          <div className="col-lg-3 mb-4 mb-lg-0 fade-in">
            <div className="card bg-dark mb-4 sticky-top" style={{ top: '80px' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Restaurant Info</h5>
                  {isAuthenticated ? (
                    <button 
                      className="btn btn-sm btn-outline-success rounded-circle"
                      onClick={toggleFavorite}
                      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                    </button>
                  ) : (
                    <Link to="/login" className="btn btn-sm btn-outline-secondary">
                      <i className="bi bi-heart"></i>
                    </Link>
                  )}
                </div>
                
                <div className="mb-3">
                  <h6 className="fw-bold">Address</h6>
                  <p className="mb-0">{restaurant.address || 'Address not available'}</p>
                </div>
                
                <div className="mb-3">
                  <h6 className="fw-bold">Hours</h6>
                  <p className="mb-0">{restaurant.hours || 'Hours not available'}</p>
                </div>
                
                <div className="mb-3">
                  <h6 className="fw-bold">Phone</h6>
                  <p className="mb-0">{restaurant.phone || 'Phone number not available'}</p>
                </div>
                
                {restaurant.description && (
                  <div>
                    <h6 className="fw-bold">Description</h6>
                    <p className="mb-0">{restaurant.description}</p>
                  </div>
                )}
              </div>
            </div>
            
            {cart && cart.items && cart.items.length > 0 && cart.restaurantId === parseInt(id) && (
              <div className="card bg-dark mb-4">
                <div className="card-body">
                  <h5 className="card-title mb-3">Your Order</h5>
                  <ul className="list-group list-group-flush bg-dark">
                    {cart.items.slice(0, 3).map(item => (
                      <li key={item.id} className="list-group-item bg-dark text-white border-secondary d-flex justify-content-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                    {cart.items.length > 3 && (
                      <li className="list-group-item bg-dark text-muted border-secondary">
                        +{cart.items.length - 3} more items
                      </li>
                    )}
                  </ul>
                  <div className="d-flex justify-content-between mt-3 mb-2">
                    <span className="text-white">Total</span>
                    <span className="text-white fw-bold">
                      ${cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  <Link to="/cart" className="btn btn-success w-100 mt-2">
                    <i className="bi bi-cart3 me-2"></i>
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="col-lg-9">
            <div className="mb-4 overflow-auto bg-dark p-3 rounded sticky-top shadow-sm fade-in" style={{ zIndex: 990, top: '56px' }}>
              <div className="d-flex">
                {categories.map(category => (
                  <button
                    key={category}
                    className={`btn ${activeCategory === category ? 'btn-success' : 'btn-outline-light'} me-2 flex-shrink-0`}
                    onClick={() => setActiveCategory(category)}
                  >
                    <span className="fw-bold">{category === 'all' ? 'All Items' : category}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {activeCategory !== 'all' && (
              <h2 className="text-white fw-bold mb-4 border-bottom border-success pb-2">
                {activeCategory}
              </h2>
            )}
            
            {menu.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-menu-button-wide fs-1 text-muted mb-3"></i>
                <h3 className="text-white">No Menu Items Available</h3>
                <p className="text-muted">This restaurant hasn't added any menu items yet.</p>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-1 row-cols-lg-2 g-4 fade-in">
                {menu
                  .filter(item => activeCategory === 'all' || item.category === activeCategory)
                  .map(item => {
                    const quantity = getItemQuantity(item.id);
                    
                    return (
                      <div key={item.id} className="col">
                        <div className="card bg-dark border-secondary h-100 hover-effect">
                          <div className="row g-0 h-100">
                            <div className="col-md-8">
                              <div className="card-body d-flex flex-column h-100">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h5 className="card-title text-white">{item.name}</h5>
                                  <span className="badge bg-success px-2 py-1 fs-6">${item.price.toFixed(2)}</span>
                                </div>
                                
                                <div className="mb-2">
                                  {item.isPopular && (
                                    <span className="badge bg-warning text-dark me-1">
                                      <i className="bi bi-star-fill me-1"></i>
                                      Popular
                                    </span>
                                  )}
                                  {item.dietary && item.dietary.map(diet => (
                                    <span key={diet} className="badge bg-secondary me-1">{diet}</span>
                                  ))}
                                </div>
                                
                                <p className="card-text text-muted mb-3">{item.description}</p>
                                
                                <button 
                                  className={`btn ${quantity > 0 ? 'btn-outline-success' : 'btn-success'} mt-auto position-relative`}
                                  onClick={() => handleAddToCart(item)}
                                >
                                  {quantity > 0 ? (
                                    <>
                                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                                        {quantity}
                                        <span className="visually-hidden">items in cart</span>
                                      </span>
                                      <i className="bi bi-check2-circle me-2"></i>
                                      Add Again
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
                            
                            <div className="col-md-4 p-0 d-flex align-items-stretch">
                              {/* Use a placeholder for menu item images */}
                              <div className="d-flex align-items-center justify-content-center bg-secondary bg-opacity-25 w-100 h-100 rounded-end">
                                <i className="bi bi-image text-muted" style={{ fontSize: '2rem' }}></i>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;