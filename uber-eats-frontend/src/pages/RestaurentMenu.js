import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ensureNumber, formatPrice, calculateTotal } from '../utils/priceUtils';

const RestaurantMenu = () => {
  // State for menu categories and items
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This would normally be an API call to fetch menu data
    // Using mock data for demonstration
    const fetchMenuData = () => {
      setLoading(true);
      
      // Sample categories
      const categories = ['All Items', 'Burgers', 'Sides', 'Salads', 'Drinks'];
      
      // Sample menu items
      const items = [
        {
          id: 1,
          name: 'Classic Burger',
          description: 'Beef patty with lettuce, tomato, onion, pickles, and our special sauce.',
          price: 9.99,
          category: 'Burgers',
          isPopular: true,
          imageUrl: 'https://via.placeholder.com/150'
        },
        {
          id: 2,
          name: 'Cheeseburger',
          description: 'Classic burger with American cheese.',
          price: 10.99,
          category: 'Burgers',
          isPopular: false,
          dietary: ['Contains dairy']
        },
        {
          id: 3,
          name: 'Veggie Burger',
          description: 'Plant-based patty with all the classic toppings.',
          price: 11.99,
          category: 'Burgers',
          isPopular: false,
          dietary: ['Vegetarian']
        },
        {
          id: 4,
          name: 'French Fries',
          description: 'Crispy golden fries seasoned with our special blend of spices.',
          price: 3.99,
          category: 'Sides',
          isPopular: true,
          dietary: ['Vegan', 'Gluten-free']
        },
        {
          id: 5,
          name: 'Onion Rings',
          description: 'Crispy battered onion rings served with dipping sauce.',
          price: 4.99,
          category: 'Sides',
          isPopular: false
        },
        {
          id: 6,
          name: 'Caesar Salad',
          description: 'Fresh romaine lettuce, croutons, parmesan cheese, and Caesar dressing.',
          price: 7.99,
          category: 'Salads',
          isPopular: false,
          dietary: ['Contains dairy']
        },
        {
          id: 7,
          name: 'Soft Drink',
          description: 'Your choice of Coke, Diet Coke, Sprite, or Dr. Pepper.',
          price: 2.49,
          category: 'Drinks',
          isPopular: false
        }
      ];
      
      setMenuCategories(categories);
      setMenuItems(items);
      setLoading(false);
    };
    
    fetchMenuData();
  }, []);
  
  // Filter menu items based on the active category
  const filteredItems = activeCategory === 'All Items' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);
  
  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  
  // Handle adding item to cart
  const handleAddToCart = (item) => {
    // This would connect to your cart context/state
    console.log('Adding to cart:', item);
    // Example: addToCart(item);
  };
  
  return (
    <div className="restaurant-menu-container">
      {/* Category Navigation */}
      <div className="category-nav mb-4 sticky-top" style={{ 
        background: '#1A1A1A', 
        padding: '10px 0',
        top: '56px', 
        zIndex: 100,
        borderBottom: '1px solid #333'
      }}>
        <div className="container">
          <div className="d-flex overflow-auto py-2" style={{ gap: '10px' }}>
            {menuCategories.map(category => (
              <button
                key={category}
                className={`btn ${activeCategory === category ? 'btn-success' : 'btn-outline-light'} rounded-pill px-4 text-nowrap`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Menu Items */}
      <div className="container">
        {loading ? (
          // Loading state
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading menu items...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          // No items found
          <div className="text-center py-5">
            <i className="bi bi-exclamation-circle fs-1 text-muted mb-3"></i>
            <h3>No menu items found</h3>
            <p className="text-muted">Try selecting a different category.</p>
          </div>
        ) : (
          // Display menu items
          <>
            {activeCategory !== 'All Items' && (
              <h3 className="mb-4 border-bottom pb-2 text-success">{activeCategory}</h3>
            )}
            
            <div className="row row-cols-1 row-cols-md-2 g-4 mb-5">
              {filteredItems.map(item => (
                <div key={item.id} className="col">
                  <div className="card h-100 bg-dark border-secondary">
                    <div className="row g-0 h-100">
                      <div className="col-8">
                        <div className="card-body d-flex flex-column h-100">
                          <div className="d-flex justify-content-between mb-2">
                            <h5 className="card-title">{item.name}</h5>
                            <span className="badge bg-success fs-6">${item.price.toFixed(2)}</span>
                          </div>
                          
                          <div className="mb-2">
                            {item.isPopular && (
                              <span className="badge bg-warning text-dark me-1">Popular</span>
                            )}
                            {item.dietary && item.dietary.map(diet => (
                              <span key={diet} className="badge bg-secondary me-1">{diet}</span>
                            ))}
                          </div>
                          
                          <p className="card-text text-muted flex-grow-1">{item.description}</p>
                          
                          <button 
                            className="btn btn-success mt-auto"
                            onClick={() => handleAddToCart(item)}
                          >
                            <i className="bi bi-plus-circle me-2"></i>
                            Add to Cart
                          </button>
                        </div>
                      </div>
                      
                      {item.imageUrl && (
                        <div className="col-4 d-flex">
                          <img 
                            src={item.imageUrl} 
                            className="img-fluid rounded-end" 
                            alt={item.name}
                            style={{ objectFit: 'cover', height: '100%' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;