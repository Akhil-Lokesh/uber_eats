import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavoriteRestaurants, removeFavoriteRestaurant } from '../services/customer';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch favorites from API
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getFavoriteRestaurants();
        
        // Transform the API response data to match our component's expected format
        const favoriteRestaurants = response.data.map(favorite => ({
          id: favorite.restaurant_id,
          name: favorite.restaurant_name,
          cuisine: favorite.cuisine || 'Various',
          rating: favorite.rating || 4.5, // Default rating if not available in API
        }));
        
        setFavorites(favoriteRestaurants);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setError('Failed to load favorite restaurants. Please try again later.');
        
        // Set empty array on error
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (id) => {
    try {
      await removeFavoriteRestaurant(id);
      // Update state after successful API call
      setFavorites(favorites.filter(restaurant => restaurant.id !== id));
    } catch (error) {
      console.error('Error removing favorite:', error);
      // Show an error message
      setError('Failed to remove restaurant from favorites. Please try again.');
    }
  };

  return (
    <div className="container py-5 mt-5" style={{ backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1 className="mb-4">Your Favorite Restaurants</h1>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-heart fs-1 text-secondary mb-3"></i>
          <h4 className="mb-3">No favorites yet</h4>
          <p className="text-muted mb-4">Explore restaurants and add them to your favorites.</p>
          <Link to="/restaurants" className="btn py-2 px-4" style={{ backgroundColor: '#06C167', color: 'white', borderRadius: '30px' }}>
            <i className="bi bi-search me-2"></i>
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {favorites.map((restaurant) => (
            <div key={restaurant.id} className="col-md-4 col-lg-3">
              <div className="card h-100" style={{ backgroundColor: '#121212', border: '1px solid #333', borderRadius: '12px', overflow: 'hidden' }}>
                <div className="card-body d-flex align-items-center">
                  <div className="me-3">
                    <i className="bi bi-heart-fill text-danger fs-4"></i>
                  </div>
                  <div>
                    <h5 className="card-title text-white">{restaurant.name}</h5>
                    <p className="card-text text-muted">{restaurant.cuisine}</p>
                  </div>
                </div>
                <div className="card-footer d-flex justify-content-between align-items-center p-2">
                  <Link to={`/restaurants/${restaurant.id}`} className="btn btn-link text-white" style={{ backgroundColor: 'transparent', color: '#06C167' }}>
                    View Menu
                  </Link>
                  <button
                    className="btn btn-link text-white"
                    onClick={() => handleRemoveFavorite(restaurant.id)}
                    style={{ backgroundColor: 'transparent', color: '#06C167' }}
                  >
                    <i className="bi bi-x-circle fs-4"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;