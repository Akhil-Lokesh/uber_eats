import React, { useState, useEffect } from 'react';
import { addDish, updateDish } from '../../services/restaurant';

const AddDishComponent = ({ categories, dish, onSubmit, onCancel }) => {
  const [dishData, setDishData] = useState({
    name: '',
    description: '',
    price: '',
    category: categories[0] || '',
    ingredients: '',
    image: null,
    isAvailable: true
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form with dish data if editing
  useEffect(() => {
    if (dish) {
      setDishData({
        name: dish.name || '',
        description: dish.description || '',
        price: dish.price || '',
        ingredients: dish.ingredients || '',
        category: dish.category || categories[0] || '',
        isAvailable: dish.is_available !== undefined ? dish.is_available : true,
        image: null // We'll set the preview but not the actual file
      });
      
      if (dish.image) {
        setPreviewImage(dish.image);
      }
    }
  }, [dish, categories]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDishData({
      ...dishData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setDishData({
        ...dishData,
        image: file
      });
    } else {
      setPreviewImage(null);
      setDishData({
        ...dishData,
        image: null
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = [...e.dataTransfer.files];
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setPreviewImage(URL.createObjectURL(file));
        setDishData({
          ...dishData,
          image: file
        });
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateForm = () => {
    let isValid = true;
    if (!dishData.name.trim()) {
      setError('Dish name is required');
      isValid = false;
    } else if (!dishData.price || isNaN(dishData.price)) {
      setError('Please enter a valid price');
      isValid = false;
    } else if (!dishData.category) {
      setError('Please select a category');
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', dishData.name);
      formData.append('description', dishData.description);
      formData.append('price', dishData.price);
      formData.append('category', dishData.category);
      formData.append('ingredients', dishData.ingredients);
      formData.append('is_available', dishData.isAvailable);
      
      if (dishData.image) {
        formData.append('image', dishData.image);
      }

      // Log what we're sending
      console.log('FormData keys being sent:');
      for (let key of formData.keys()) {
        const value = formData.get(key);
        console.log(`- ${key}: ${key === 'image' ? 'File object' : value}`);
      }

      if (dish) {
        // Update existing dish
        await updateDish(dish.id, formData);
      } else {
        // Add new dish
        await addDish(formData);
      }
      
      onSubmit();
    } catch (error) {
      console.error('Error saving dish:', error);
      setError('Failed to save dish. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show" style={{ display: 'block', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1050 }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content bg-dark text-white border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">
              {dish ? `Edit ${dish.name}` : 'Add New Dish'}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onCancel}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body p-4">
            {error && (
              <div className="alert alert-danger mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}
            
            <div className="row mb-3">
              <div className="col-md-8">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Dish Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    placeholder="Enter dish name"
                    value={dishData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="3"
                    placeholder="Describe your dish"
                    value={dishData.description}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="mb-3">
                  <label htmlFor="image" className="form-label">Dish Image</label>
                  <div 
                    className="image-upload-area mb-2" 
                    style={{
                      border: '2px dashed #ccc',
                      borderRadius: '4px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      minHeight: '150px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#242424'
                    }}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('image-upload').click()}
                  >
                    {previewImage ? (
                      <div className="position-relative w-100">
                        <img 
                          src={previewImage} 
                          alt="Dish preview" 
                          className="img-fluid rounded"
                          style={{ maxHeight: '150px', objectFit: 'contain' }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1 rounded-circle"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(null);
                            setDishData({
                              ...dishData,
                              image: null
                            });
                          }}
                          style={{ width: '24px', height: '24px', padding: '0', lineHeight: '24px' }}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-2">
                          <i className="bi bi-image" style={{ fontSize: '2rem' }}></i>
                        </div>
                        <p className="mb-1">Drop an image here or click to upload</p>
                        <small className="text-muted">Supported formats: JPG, PNG, GIF</small>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    className="d-none"
                    onChange={handleImageChange}
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={dishData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="price" className="form-label">Price</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className="form-control"
                      id="price"
                      name="price"
                      placeholder="0.00"
                      step="0.01"
                      value={dishData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="ingredients" className="form-label">Ingredients</label>
                  <input
                    type="text"
                    className="form-control"
                    id="ingredients"
                    name="ingredients"
                    placeholder="Comma-separated list"
                    value={dishData.ingredients}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="mb-3 form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isAvailable"
                    name="isAvailable"
                    checked={dishData.isAvailable}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="isAvailable">
                    Available for order
                  </label>
                </div>
              </div>
            </div>
            
            <div className="modal-footer border-top-0">
              <button
                type="button"
                className="btn btn-outline-light me-2"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${dish ? 'btn-warning' : 'btn-success'}`}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : dish ? 'Update Dish' : 'Add Dish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDishComponent;