import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import MenuItem from '../components/common/MenuItem';
import SkeletonLoader from '../components/common/SkeletonLoader';

const RestaurantDetails = () => {
  const { id } = useParams();
  const { cart, addToCart } = useCart();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [menuCategories, setMenuCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [categoryHeadersPositions, setCategoryHeadersPositions] = useState({});
  const categoryRefs = useRef({});
  const menuRef = useRef(null);

  useEffect(() => {
    // Fetch restaurant details and menu
    const fetchRestaurantDetails = async () => {
      try {
        setLoading(true);
        
        // Mock restaurant data
        const mockRestaurant = {
          id: parseInt(id),
          name: 'Burger Palace',
          cuisine: 'American',
          rating: 4.5,
          reviewCount: 238,
          deliveryTime: '15-25 min',
          deliveryFee: 2.99,
          minOrder: 10,
          address: '123 Main St, San Jose, CA 95112',
          phone: '(123) 456-7890',
          hours: 'Mon-Sun: 11:00 AM - 10:00 PM',
          description: 'Serving the juiciest burgers in town since 2010. Our ingredients are fresh and locally sourced to bring you the best quality burgers, sides, and drinks.',
          imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-1.2.1&w=800&q=80',
          isFavorite: true,
        };

        // Mock menu data
        const mockMenu = [
          {
            id: 1,
            name: 'Classic Burger',
            description: 'Beef patty with lettuce, tomato, onion, pickles, and our special sauce.',
            price: 9.99,
            category: 'Burgers',
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&w=500&q=80',
            isPopular: true,
          },
          {
            id: 2,
            name: 'Cheeseburger',
            description: 'Classic burger with American cheese.',
            price: 10.99,
            category: 'Burgers',
            imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?ixlib=rb-1.2.1&w=500&q=80',
            isPopular: true,
            dietary: ['Contains dairy']
          },
          {
            id: 3,
            name: 'Bacon Burger',
            description: 'Classic burger with crispy bacon and American cheese.',
            price: 12.99,
            category: 'Burgers',
            imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?ixlib=rb-1.2.1&w=500&q=80',
            isPopular: false,
          },
          {
            id: 4,
            name: 'Veggie Burger',
            description: 'Plant-based patty with all the classic toppings.',
            price: 11.99,
            category: 'Burgers',
            imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?ixlib=rb-1.2.1&w=500&q=80',
            isPopular: false,
            dietary: ['Vegetarian']
          },
          {
            id: 5,
            name: 'French Fries',
            description: 'Crispy golden fries seasoned with our special blend of spices.',
            price: 3.99,
            category: 'Sides',
            imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-1.2.1&w=500&q=80',
            isPopular: true,
            dietary: ['Vegan', 'Gluten-free']
          },
          {
            id: 6,
            name: 'Onion Rings',
            description: 'Crispy battered onion rings served with dipping sauce.',
            price: 4.99,
            category: 'Sides',
            imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?ixlib=rb-1.2.1&w=500&q=80',
            isPopular: false,
          },
          {
            id: 7,
            name: 'Caesar Salad',
            description: 'Fresh romaine lettuce, croutons, parmesan cheese, and Caesar dressing.',
            price: 7.99,
            category: 'Salads',
            imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&w=500&q=80',
            isPopular: false,
            dietary: ['Contains dairy']
          },
          {
            id: 8,
            name: 'Vanilla Milkshake',
            description: 'Creamy vanilla milkshake topped with whipped cream.',
            price: 5.99,
            category: 'Drinks',
            imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&w=500&q=80',
            isPopular: true,
            dietary: ['Contains dairy']
          },
          {
            id: 9,
            name: 'Chocolate Milkshake',
            description: 'Creamy chocolate milkshake topped with whipped cream.',
            price: 5.99,
            category: 'Drinks',
            imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?ixlib=rb-1.2.1&w=500&q=80',
            isPopular: false,
            dietary: ['Contains dairy']
          },
          {
            id: 10,
            name: 'Soda',
            description: 'Your choice of Coke, Diet Coke, Sprite, or Dr. Pepper.',
            price: 2.49,
            category: 'Drinks',
            imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-1.2.1&w=500&q=80',
            isPopular: false,
          },
        ];
        
        // Extract menu categories
        const categories = ['all', ...new Set(mockMenu.map(item => item.category))];
        
        // Simulate API delay
        setTimeout(() => {
          setRestaurant(mockRestaurant);
          setMenu(mockMenu);
          setMenuCategories(categories);
          setIsFavorite(mockRestaurant.isFavorite);
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
    
    // Handle scroll event to update active category
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id]);
  
  // Handle adding item to cart
  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      imageUrl: item.imageUrl,
      restaurantName: restaurant.name,
      customizations: item.dietary || []
    }, restaurant.id);
  };

  // Toggle favorite status
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would normally make an API call to update favorites
  };
  
  // Filter menu items based on active category
  const displayedMenu = activeCategory === 'all'
    ? menu
    : menu.filter(item => item.category === activeCategory);

  if (loading) {
    return (
      <div className="container-fluid p-0">
        {/* Restaurant Hero Banner Skeleton */}
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
              <SkeletonLoader type="text-line" count={3} />
            </div>
          </div>
        </div>
        
        <div className="container py-4">
          <div className="row">
            <div className="col-lg-3 mb-4">
              <SkeletonLoader type="card" count={2} />
            </div>
            <div className="col-lg-9">
              <SkeletonLoader type="card" count={1} />
              <div className="mt-4">
                <SkeletonLoader type="menu-item" count={4} />
              </div>
            </div>
          </div>
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

  return (
    <div className="container-fluid p-0">
      {/* Restaurant Hero Banner */}
      <div 
        className="restaurant-banner position-relative fade-in"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${restaurant.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '350px',
          marginTop: '56px' // Adjust based on navbar height
        }}
      >
        <div className="container h-100 d-flex align-items-end">
          <div className="text-white pb-4">
            <h1 className="fw-bold mb-2">{restaurant.name}</h1>
            <div className="d-flex flex-wrap align-items-center gap-3 mb-2">
              <span className="bg-dark bg-opacity-50 px-3 py-1 rounded-pill">{restaurant.cuisine}</span>
              <span className="d-flex align-items-center bg-dark bg-opacity-50 px-3 py-1 rounded-pill">
                <i className="bi bi-star-fill text-warning me-1"></i>
                {restaurant.rating} ({restaurant.reviewCount} reviews)
              </span>
              <span className="bg-dark bg-opacity-50 px-3 py-1 rounded-pill">
                <i className="bi bi-clock me-1"></i>
                {restaurant.deliveryTime}
              </span>
            </div>
            <p className="mb-0 bg-dark bg-opacity-50 d-inline-block px-3 py-1 rounded-pill">
              ${restaurant.deliveryFee.toFixed(2)} delivery fee • ${restaurant.minOrder} minimum
            </p>
          </div>
        </div>
      </div>
      
      <div className="container py-4">
        <div className="row">
          {/* Sidebar - Restaurant Info */}
          <div className="col-lg-3 mb-4 mb-lg-0 fade-in">
            <div className="glass-card mb-4 sticky-top" style={{ top: '80px' }}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Restaurant Info</h5>
                  <button 
                    className={`favorite-button btn btn-sm btn-outline-success rounded-circle ${isFavorite ? 'active' : ''}`}
                    onClick={toggleFavorite}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                  </button>
                </div>
                
                <div className="mb-3">
                  <h6 className="fw-bold">Address</h6>
                  <p className="mb-0">{restaurant.address}</p>
                </div>
                
                <div className="mb-3">
                  <h6 className="fw-bold">Hours</h6>
                  <p className="mb-0">{restaurant.hours}</p>
                </div>
                
                <div className="mb-3">
                  <h6 className="fw-bold">Phone</h6>
                  <p className="mb-0">{restaurant.phone}</p>
                </div>
                
                <div>
                  <h6 className="fw-bold">Description</h6>
                  <p className="mb-0">{restaurant.description}</p>
                </div>
                
                {/* Category quick links */}
                <div className="mt-4">
                  <h6 className="fw-bold">Menu</h6>
                  <div className="list-group list-group-flush">
                    {menuCategories.map(category => (
                      <button
                        key={category}
                        className={`list-group-item list-group-item-action bg-transparent border-0 px-0 py-2 ${activeCategory === category ? 'text-success fw-bold' : ''}`}
                        onClick={() => setActiveCategory(category)}
                      >
                        {category === 'all' ? 'All Items' : category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cart Preview if items in cart */}
            {cart.items.length > 0 && cart.restaurantId === parseInt(id) && (
              <div className="glass-card sticky-top mt-3" style={{ top: '440px' }}>
                <div className="card-body">
                  <h5 className="card-title">Your Order</h5>
                  <ul className="list-group list-group-flush mb-3">
                    {cart.items.slice(0, 3).map(item => (
                      <li key={item.id} className="list-group-item bg-transparent px-0 d-flex justify-content-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                    {cart.items.length > 3 && (
                      <li className="list-group-item bg-transparent px-0 text-center text-muted">
                        +{cart.items.length - 3} more items
                      </li>
                    )}
                  </ul>
                  <Link to="/cart" className="btn btn-success w-100">
                    View Cart
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* Main Content - Menu */}
          <div className="col-lg-9" ref={menuRef}>
            {/* Menu Categories */}
            <div className="mb-4 overflow-auto bg-dark p-3 rounded sticky-top shadow-sm fade-in" style={{ zIndex: 990, top: '56px' }}>
              <div className="d-flex">
                {menuCategories.map(category => (
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
            
            {/* Category Header (if not showing all) */}
            {activeCategory !== 'all' && (
              <h2 className="text-white fw-bold mb-4 border-bottom border-success pb-2">
                {activeCategory}
              </h2>
            )}
            
            {/* Menu Items */}
            <div className="row row-cols-1 row-cols-md-1 row-cols-lg-2 g-4 fade-in">
              {displayedMenu.map(item => (
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
                            className="btn btn-success mt-auto"
                            onClick={() => handleAddToCart(item)}
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            Add to Cart
                          </button>
                        </div>
                      </div>
                      
                      <div className="col-md-4 p-0 d-flex align-items-stretch">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="img-fluid rounded-end h-100 w-100"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;