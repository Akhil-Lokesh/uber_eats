// MenuManagement.js
import React, { useState, useEffect } from 'react';
import { getRestaurantDishes, deleteDish } from '../services/restaurant';
import AddDishComponent from '../components/restaurant/add-dish-component';

const MenuManagement = () => {
  // State for dishes, categories, form, loading, etc.
  const [dishes, setDishes] = useState([]);
  const [categories] = useState(['Appetizers', 'Main Course', 'Sides', 'Drinks', 'Desserts']);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDish, setShowAddDish] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Fetch dishes on component mount
  useEffect(() => {
    fetchDishes();
  }, []);

  // Function to fetch dishes
  const fetchDishes = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const response = await getRestaurantDishes();
      setDishes(response.data);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setErrorMessage('Failed to load menu items. Please try again later.');
      setDishes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter dishes based on active category and search query
  const getFilteredDishes = () => {
    let filtered = [...dishes];
    
    // Filter by category
    if (activeTab !== 'all') {
      filtered = filtered.filter(dish => dish.category === activeTab);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(dish => 
        dish.name.toLowerCase().includes(query) || 
        dish.description.toLowerCase().includes(query) ||
        (dish.ingredients && dish.ingredients.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  // Open form for editing a dish
  const handleEditDish = (dish) => {
    setEditingDish(dish);
    setShowAddDish(true);
  };

  // Open form for adding a new dish
  const handleAddDish = () => {
    setEditingDish(null);
    setShowAddDish(true);
  };

  // Handle dish added or updated
  const handleDishSubmitted = () => {
    // Refresh the dish list
    fetchDishes();
    // Close form
    setShowAddDish(false);
    // Show success message
    setSuccessMessage(editingDish ? 'Dish updated successfully!' : 'Dish added successfully!');
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  // Toggle dish availability by editing the dish
  const toggleAvailability = async (id, currentStatus) => {
    try {
      const dish = dishes.find(d => d.id === id);
      if (!dish) return;
      
      // Update the dish with toggled availability
      handleEditDish({
        ...dish,
        is_available: !currentStatus
      });
      
      // Display message to the user
      setSuccessMessage(`Availability will be updated when you save changes.`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error toggling availability:', error);
      setErrorMessage('Failed to update dish availability. Please try again.');
    }
  };

  // Delete a dish
  const handleDeleteDish = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteDish(id);
        
        // Update local state
        setDishes(dishes.filter(dish => dish.id !== id));
        
        setSuccessMessage(`${name} has been removed from your menu.`);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } catch (error) {
        console.error('Error deleting dish:', error);
        setErrorMessage('Failed to delete dish. Please try again.');
      }
    }
  };

  const filteredDishes = getFilteredDishes();

  return (
    <div className="container-fluid pt-4 pb-5" style={{ backgroundColor: '#1a1a1a', color: '#FFF', marginTop: '60px', minHeight: '100vh' }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-1 text-white">Menu Management</h1>
            <p className="text-muted">Manage your restaurant's dishes and categories</p>
          </div>
          <div>
            <button 
              className="btn btn-success rounded-pill px-4 py-2" 
              onClick={handleAddDish}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Add New Dish
            </button>
          </div>
        </div>
        
        {/* Success and Error Messages */}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            {successMessage}
            <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)} aria-label="Close"></button>
          </div>
        )}
        
        {errorMessage && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {errorMessage}
            <button type="button" className="btn-close" onClick={() => setErrorMessage(null)} aria-label="Close"></button>
          </div>
        )}
        
        {/* Search and filters */}
        <div className="card bg-dark mb-4 border-0 rounded-4 shadow">
          <div className="card-body p-3 p-md-4">
            <div className="row g-3">
              <div className="col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-white">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-dark border-secondary text-white"
                    placeholder="Search dishes by name, description, or ingredients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      className="btn btn-outline-secondary border-secondary text-white" 
                      onClick={() => setSearchQuery('')}
                      title="Clear search"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
              </div>
              <div className="col-md-3">
                <select 
                  className="form-select bg-dark border-secondary text-white" 
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-1">
                <div className="btn-group w-100">
                  <button 
                    className={`btn btn-outline-secondary border-secondary ${viewMode === 'grid' ? 'active text-white' : 'text-muted'}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <i className="bi bi-grid-3x3-gap"></i>
                  </button>
                  <button 
                    className={`btn btn-outline-secondary border-secondary ${viewMode === 'list' ? 'active text-white' : 'text-muted'}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <i className="bi bi-list"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dish listing */}
        {isLoading ? (
          <div className="row g-4">
            {[1, 2, 3, 4].map((_, index) => (
              <div key={index} className="col-md-6 col-lg-4 col-xl-3">
                <div className="card h-100" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: 'none' }}>
                  <div style={{ height: '180px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}></div>
                  <div className="card-body">
                    <div style={{ height: '24px', width: '70%', backgroundColor: 'rgba(255, 255, 255, 0.05)', marginBottom: '12px' }}></div>
                    <div style={{ height: '16px', width: '90%', backgroundColor: 'rgba(255, 255, 255, 0.03)', marginBottom: '8px' }}></div>
                    <div style={{ height: '16px', width: '60%', backgroundColor: 'rgba(255, 255, 255, 0.03)', marginBottom: '16px' }}></div>
                    <div style={{ height: '38px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-search fs-1 text-muted mb-3 d-block"></i>
            <h3 className="text-white">No dishes found</h3>
            <p className="text-muted mb-4">
              {searchQuery ? 'Try adjusting your search query' : activeTab !== 'all' ? `No dishes in ${activeTab} category` : 'No dishes in your menu yet'}
            </p>
            <button className="btn btn-success rounded-pill px-4 py-2" onClick={handleAddDish}>
              <i className="bi bi-plus-lg me-2"></i>
              Add Your First Dish
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'row g-4' : ''}>
            {filteredDishes.map(dish => (
              viewMode === 'grid' ? (
                // Grid View
                <div key={dish.id} className="col-md-6 col-lg-4 col-xl-3">
                  <div className={`card h-100 position-relative ${!dish.is_available ? 'opacity-75' : ''}`} style={{ backgroundColor: '#121212', border: '1px solid #333' }}>
                    <div className="position-relative">
                      {dish.image ? (
                        <img 
                          src={dish.image} 
                          alt={dish.name}
                          className="card-img-top" 
                          style={{ height: '180px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ height: '180px', backgroundColor: '#242424', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="bi bi-image text-muted" style={{ fontSize: '2rem' }}></i>
                        </div>
                      )}
                      <div className="position-absolute top-0 end-0 m-2">
                        <div className="dropdown">
                          <button 
                            className="btn btn-sm btn-dark bg-opacity-75 rounded-circle"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            <i className="bi bi-three-dots-vertical"></i>
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                              <button 
                                className="dropdown-item" 
                                onClick={() => handleEditDish(dish)}
                              >
                                <i className="bi bi-pencil me-2"></i>
                                Edit
                              </button>
                            </li>
                            <li>
                              <button 
                                className="dropdown-item"
                                onClick={() => toggleAvailability(dish.id, dish.is_available)}
                              >
                                {dish.is_available ? (
                                  <>
                                    <i className="bi bi-toggle-off me-2"></i>
                                    Mark as Unavailable
                                  </>
                                ) : (
                                  <>
                                    <i className="bi bi-toggle-on me-2"></i>
                                    Mark as Available
                                  </>
                                )}
                              </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button 
                                className="dropdown-item text-danger" 
                                onClick={() => handleDeleteDish(dish.id, dish.name)}
                              >
                                <i className="bi bi-trash me-2"></i>
                                Delete
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="position-absolute bottom-0 start-0 m-2">
                        <span className="badge bg-dark">{dish.category}</span>
                      </div>
                      <div className="position-absolute bottom-0 end-0 m-2">
                        <span className="badge bg-success">${parseFloat(dish.price).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex align-items-center mb-2">
                        <h5 className="card-title mb-0 me-2">{dish.name}</h5>
                        {!dish.is_available && (
                          <span className="badge bg-danger">Unavailable</span>
                        )}
                      </div>
                      <p className="card-text text-muted mb-2 flex-grow-1" style={{ fontSize: '0.875rem' }}>
                        {dish.description.length > 80 
                          ? `${dish.description.substring(0, 80)}...` 
                          : dish.description}
                      </p>
                      <div className="d-flex justify-content-between mt-auto">
                        <button 
                          className="btn btn-sm btn-outline-success" 
                          onClick={() => handleEditDish(dish)}
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => handleDeleteDish(dish.id, dish.name)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // List View
                <div key={dish.id} className="card mb-3" style={{ backgroundColor: '#121212', border: '1px solid #333' }}>
                  <div className="row g-0">
                    <div className="col-md-3 position-relative">
                      {dish.image ? (
                        <img 
                          src={dish.image} 
                          className="img-fluid rounded-start h-100" 
                          alt={dish.name}
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ height: '180px', backgroundColor: '#242424', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="bi bi-image text-muted" style={{ fontSize: '2rem' }}></i>
                        </div>
                      )}
                      <div className="position-absolute bottom-0 start-0 m-2">
                        <span className="badge bg-dark">{dish.category}</span>
                      </div>
                    </div>
                    <div className="col-md-9">
                      <div className="card-body h-100 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="d-flex align-items-center">
                            <h5 className="card-title mb-0 me-2">{dish.name}</h5>
                            {!dish.is_available && (
                              <span className="badge bg-danger">Unavailable</span>
                            )}
                          </div>
                          <span className="badge bg-success fs-6">${parseFloat(dish.price).toFixed(2)}</span>
                        </div>
                        <p className="card-text text-muted mb-2">{dish.description}</p>
                        <p className="card-text mb-3" style={{ fontSize: '0.875rem' }}>
                          <small className="text-muted">
                            <strong>Ingredients:</strong> {dish.ingredients}
                          </small>
                        </p>
                        <div className="mt-auto d-flex justify-content-between align-items-center">
                          <div>
                            <button 
                              className="btn btn-sm btn-outline-success me-2" 
                              onClick={() => handleEditDish(dish)}
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger" 
                              onClick={() => handleDeleteDish(dish.id, dish.name)}
                            >
                              <i className="bi bi-trash me-1"></i>
                              Delete
                            </button>
                          </div>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id={`availability-${dish.id}`}
                              name="isAvailable"
                              checked={dish.is_available}
                              onChange={() => toggleAvailability(dish.id, dish.is_available)}
                            />
                            <label className="form-check-label" htmlFor={`availability-${dish.id}`}>
                              Available
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
        
        {/* Add/Edit Dish Form Modal */}
        {showAddDish && (
          <AddDishComponent
            categories={categories}
            dish={editingDish}
            onSubmit={handleDishSubmitted}
            onCancel={() => setShowAddDish(false)}
          />
        )}
      </div>
    </div>
  );
};

export default MenuManagement;