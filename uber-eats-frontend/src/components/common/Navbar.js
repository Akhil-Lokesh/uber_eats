import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Navbar = () => {
  const { isAuthenticated, currentUser, handleLogout, isCustomer, isRestaurant, loading } = useAuth();
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Calculate total cart items
  const cartItemCount = cart && cart.items ? cart.items.length : 0;

  // Handle logout with API call
  const handleNavLogout = async () => {
    try {
      // Call the context logout handler to update the app state with API call
      await handleLogout();
      
      // Redirect to home page after logout
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, navigate home
      navigate('/');
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.name) return "U";
    const nameParts = currentUser.name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return currentUser.name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{ 
      backgroundColor: '#121212', 
      borderBottom: '1px solid #333',
      zIndex: 1000
    }}>
      <div className="container">
        {/* Brand/logo */}
        <Link className="navbar-brand me-4" to="/" style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>
          <span style={{ color: 'white' }}>Uber</span>
          <span style={{ color: '#06C167' }}>Eats</span>
        </Link>
          
        {/* Mobile toggle */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
          
        {/* Navigation Items */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' || location.pathname === '/restaurant/dashboard' ? 'active' : ''}`} 
                to={isRestaurant ? "/restaurant/dashboard" : "/"}
              >
                Home
              </Link>
            </li>
            
            {isAuthenticated && (
              <>
                {isCustomer && (
                  <>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/restaurants' ? 'active' : ''}`} 
                        to="/restaurants"
                      >
                        Restaurants
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/favorites' ? 'active' : ''}`} 
                        to="/favorites"
                      >
                        Favorites
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname.includes('/orders') ? 'active' : ''}`} 
                        to="/orders"
                      >
                        My Orders
                      </Link>
                    </li>
                  </>
                )}
                
                {isRestaurant && (
                  <>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/restaurant/menu' ? 'active' : ''}`} 
                        to="/restaurant/menu"
                      >
                        Menu
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link 
                        className={`nav-link ${location.pathname === '/restaurant/orders' ? 'active' : ''}`} 
                        to="/restaurant/orders"
                      >
                        Orders
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
            
          <ul className="navbar-nav ms-auto align-items-center">
            {/* Cart Icon shown only for logged-in customers */}
            {isAuthenticated && isCustomer && (
              <li className="nav-item me-3">
                <Link 
                  to="/cart" 
                  className={`nav-link position-relative ${location.pathname === '/cart' ? 'active' : ''}`}
                >
                  <i className="bi bi-cart3 fs-5"></i>
                  {cartItemCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                      {cartItemCount}
                      <span className="visually-hidden">items in cart</span>
                    </span>
                  )}
                </Link>
              </li>
            )}
            
            {/* Authentication Links */}
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-success btn-sm rounded-pill px-3" to="/signup/customer">
                    Sign Up
                  </Link>
                </li>
              </>
            ) : (
              /* User Profile Dropdown */
              <li className="nav-item dropdown">
                {loading ? (
                  <div className="spinner-border spinner-border-sm text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <button 
                    className="nav-link dropdown-toggle d-flex align-items-center border-0 bg-transparent" 
                    id="navbarDropdown" 
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <div 
                      className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-2" 
                      style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
                    >
                      {getUserInitials()}
                    </div>
                    <span>{currentUser?.name || 'User'}</span>
                  </button>
                )}
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                  <li>
                    <Link className="dropdown-item" to={isCustomer ? "/profile" : "/restaurant/profile"}>
                      <i className="bi bi-person me-2"></i>
                      Profile
                    </Link>
                  </li>
                  
                  {isCustomer && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/orders">
                          <i className="bi bi-receipt me-2"></i>
                          Orders
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/favorites">
                          <i className="bi bi-heart me-2"></i>
                          Favorites
                        </Link>
                      </li>
                    </>
                  )}
                  
                  {isRestaurant && (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/restaurant/orders">
                          <i className="bi bi-clipboard-check me-2"></i>
                          Manage Orders
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/restaurant/menu">
                          <i className="bi bi-list-ul me-2"></i>
                          Menu Management
                        </Link>
                      </li>
                    </>
                  )}
                  
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button 
                      className="dropdown-item text-danger" 
                      onClick={handleNavLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Sign Out
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;