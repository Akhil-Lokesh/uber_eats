import React from 'react';

const FavoriteButton = ({ isFavorite, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="favorite-btn"
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorite ? (
        <i className="bi bi-bookmark-fill" style={{ color: "#06C167" }}></i>
      ) : (
        <i className="bi bi-bookmark" style={{ color: "#9CA3AF" }}></i>
      )}
    </button>
  );
};

export default FavoriteButton;