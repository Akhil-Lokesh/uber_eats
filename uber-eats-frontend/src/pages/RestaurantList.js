import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const allRestaurantsResponse = await axios.get('http://localhost:3001/api/restaurants');
        
        if (allRestaurantsResponse.data && allRestaurantsResponse.data.length > 0) {
          setRestaurants(allRestaurantsResponse.data);
        } else {
          setError('No restaurants available');
        }
      } catch (error) {
        setError(`Error loading restaurants: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewMenu = (restaurant) => {
    const restaurantId = restaurant.restaurantId || 
                        restaurant.restaurant_id || 
                        restaurant.user_id || 
                        restaurant.id;
                        
    navigate(`/restaurants/${restaurantId}`);
  };

  if (loading) {
    return (
      <div className="container py-5 mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
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
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-5">
      <h1 className="mb-4">Restaurants</h1>
      
      {restaurants.length === 0 ? (
        <div className="alert alert-info">No restaurants available.</div>
      ) : (
        <div className="row g-4">
          {restaurants.map(restaurant => {
            const id = restaurant.restaurantId || 
                      restaurant.restaurant_id || 
                      restaurant.user_id || 
                      restaurant.id;
            
            return (
              <div key={id} className="col-md-6 col-lg-4">
                <div className="card h-100 restaurant-card">
                  <div className="card-body">
                    <h5 className="card-title">{restaurant.name}</h5>
                    <p className="card-text text-muted">{restaurant.cuisine || 'Various Cuisine'}</p>
                    
                    <button 
                      className="btn btn-success w-100"
                      onClick={() => handleViewMenu(restaurant)}
                      data-restaurant-id={id}
                    >
                      View Menu
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RestaurantList;