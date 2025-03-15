import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRestaurantProfile, updateRestaurantProfile, updateRestaurantImage } from '../services/restaurant';

const RestaurantProfile = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    // Fetch restaurant profile from API
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call the API
        const response = await getRestaurantProfile();
        
        // Transform API response to match component structure
        const profile = response.data;
        
        // Parse location string to extract address parts (assuming format: "address, city, state zipcode")
        let address = '', city = '', state = '', zipCode = '';
        if (profile.location) {
          const locationParts = profile.location.split(',');
          if (locationParts.length >= 1) {
            address = locationParts[0].trim();
          }
          if (locationParts.length >= 2) {
            city = locationParts[1].trim();
          }
          if (locationParts.length >= 3) {
            const stateZipParts = locationParts[2].trim().split(' ');
            state = stateZipParts[0] || '';
            zipCode = stateZipParts[1] || '';
          }
        }
        
        const profileData = {
          id: profile.id,
          name: profile.name || currentUser?.name || 'Restaurant Name',
          email: profile.email || currentUser?.email || 'restaurant@example.com',
          phone: profile.phone || '',
          description: profile.description || '',
          cuisine: profile.cuisine || '',
          address: address,
          city: city,
          state: state,
          zipCode: zipCode,
          openingTime: profile.open_time || '',
          closingTime: profile.close_time || '',
          deliveryRadius: profile.delivery_radius || 5,
          minimumOrder: profile.min_order || 10,
          images: profile.image ? [profile.image] : [],
          logo: profile.image || null,
        };

        setProfileData(profileData);
        
      } catch (error) {
        console.error('Error fetching restaurant profile:', error);
        setError('Failed to load profile information. Please try again later.');
        
        // Fallback to basic info if API fails
        if (currentUser) {
          setProfileData({
            id: currentUser.id,
            name: currentUser.name || 'Restaurant Name',
            email: currentUser.email || 'restaurant@example.com',
            phone: '',
            description: '',
            cuisine: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            openingTime: '',
            closingTime: '',
            deliveryRadius: 5,
            minimumOrder: 10,
            images: [],
            logo: null,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Format the location string in the expected format
      const location = `${profileData.address}, ${profileData.city}, ${profileData.state} ${profileData.zipCode}`;
      
      // Update profile data
      const updateData = {
        name: profileData.name,
        description: profileData.description,
        cuisine: profileData.cuisine,
        phone: profileData.phone,
        location: location,
        open_time: profileData.openingTime,
        close_time: profileData.closingTime,
        delivery_radius: profileData.deliveryRadius,
        min_order: profileData.minimumOrder
      };
      
      await updateRestaurantProfile(updateData);
      
      // If a new image is selected, upload it
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        const imageResponse = await updateRestaurantImage(formData);
        
        // Update the profile image URL in state
        setProfileData({
          ...profileData,
          logo: imageResponse.data.image,
          images: [imageResponse.data.image]
        });
        
        // Clear file selection
        setSelectedFile(null);
        setFilePreview(null);
      }
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  if (loading) {
    return (
      <div className="container-fluid pt-4 pb-5" style={{ backgroundColor: '#1a1a1a', color: '#FFF', marginTop: '60px', minHeight: '100vh' }}>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid pt-4 pb-5" style={{ backgroundColor: '#1a1a1a', color: '#FFF', marginTop: '60px', minHeight: '100vh' }}>
      <div className="container">
        <div className="row mb-4">
          <div className="col-md-8">
            <h1 className="mb-0 text-white">Restaurant Profile</h1>
            <p className="text-muted">Manage your restaurant's information and settings</p>
          </div>
          <div className="col-md-4 text-md-end">
            {!isEditing && (
              <button
                className="btn btn-success px-4 rounded-pill"
                onClick={() => setIsEditing(true)}
              >
                <i className="bi bi-pencil-square me-2"></i>
                Edit Profile
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess(null)} aria-label="Close"></button>
          </div>
        )}
        
        <div className="row">
          <div className="col-lg-4 mb-4 mb-lg-0">
            <div className="card border-0 rounded-4 overflow-hidden" style={{ backgroundColor: '#121212', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)' }}>
              <div className="card-body text-center py-4">
                <div className="position-relative mb-4 d-inline-block">
                  {filePreview || profileData.logo ? (
                    <img
                      src={filePreview || profileData.logo}
                      alt="Restaurant Logo"
                      className="rounded-circle mb-3"
                      width="150"
                      height="150"
                      style={{ objectFit: 'cover', border: '4px solid #06C167' }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                      style={{ 
                        width: '150px', 
                        height: '150px', 
                        backgroundColor: 'rgba(6, 193, 103, 0.1)',
                        border: '4px solid #06C167'
                      }}
                    >
                      <i className="bi bi-shop fs-1 text-success"></i>
                    </div>
                  )}
                  
                  {isEditing && (
                    <div className="position-absolute bottom-0 end-0">
                      <label htmlFor="logoUpload" className="btn btn-sm btn-success rounded-circle" style={{ cursor: 'pointer' }}>
                        <i className="bi bi-camera"></i>
                        <input 
                          type="file" 
                          id="logoUpload" 
                          className="d-none" 
                          accept="image/*" 
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
                
                <h4 className="text-white mb-1">{profileData.name}</h4>
                <p className="text-success mb-3">{profileData.cuisine || 'Cuisine not specified'}</p>
                
                <div className="mt-4">
                  <h5 className="text-white mb-3">Restaurant Images</h5>
                  <div className="row g-2">
                    {profileData.images && profileData.images.length > 0 ? (
                      profileData.images.map((image, index) => (
                        <div key={index} className="col-6">
                          <img
                            src={image}
                            alt={`Restaurant ${index + 1}`}
                            className="img-fluid rounded"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-12 text-center py-4" style={{ backgroundColor: '#242424', borderRadius: '8px' }}>
                        <i className="bi bi-image fs-1 text-muted d-block mb-2"></i>
                        <p className="text-muted mb-0">No images available</p>
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <button className="btn btn-outline-success mt-3 w-100" type="button">
                      <i className="bi bi-images me-2"></i>
                      Manage Images
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-8">
            <div className="card border-0 rounded-4" style={{ backgroundColor: '#121212', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)' }}>
              <div className="card-body p-4">
                <h3 className="card-title text-white mb-4">Profile Information</h3>
                
                {isEditing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="name" className="form-label text-white">Restaurant Name</label>
                        <input 
                          type="text" 
                          className="form-control bg-dark text-white border-secondary" 
                          id="name" 
                          name="name" 
                          value={profileData.name} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="cuisine" className="form-label text-white">Cuisine Type</label>
                        <select 
                          className="form-select bg-dark text-white border-secondary" 
                          id="cuisine" 
                          name="cuisine" 
                          value={profileData.cuisine} 
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select cuisine</option>
                          <option value="American">American</option>
                          <option value="Italian">Italian</option>
                          <option value="Mexican">Mexican</option>
                          <option value="Chinese">Chinese</option>
                          <option value="Japanese">Japanese</option>
                          <option value="Indian">Indian</option>
                          <option value="Mediterranean">Mediterranean</option>
                          <option value="Thai">Thai</option>
                          <option value="Vegetarian">Vegetarian</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label text-white">Email</label>
                        <input 
                          type="email" 
                          className="form-control bg-dark text-white border-secondary" 
                          id="email" 
                          value={profileData.email} 
                          readOnly 
                          disabled 
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="phone" className="form-label text-white">Phone</label>
                        <input 
                          type="text" 
                          className="form-control bg-dark text-white border-secondary" 
                          id="phone" 
                          name="phone" 
                          value={profileData.phone} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="description" className="form-label text-white">Description</label>
                      <textarea 
                        className="form-control bg-dark text-white border-secondary" 
                        id="description" 
                        name="description" 
                        rows="3" 
                        value={profileData.description} 
                        onChange={handleChange}
                      ></textarea>
                    </div>
                    
                    <h5 className="text-white mt-4 mb-3">Address</h5>
                    
                    <div className="mb-3">
                      <label htmlFor="address" className="form-label text-white">Street Address</label>
                      <input 
                        type="text" 
                        className="form-control bg-dark text-white border-secondary" 
                        id="address" 
                        name="address" 
                        value={profileData.address} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-5">
                        <label htmlFor="city" className="form-label text-white">City</label>
                        <input 
                          type="text" 
                          className="form-control bg-dark text-white border-secondary" 
                          id="city" 
                          name="city" 
                          value={profileData.city} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="col-md-3">
                        <label htmlFor="state" className="form-label text-white">State</label>
                        <input 
                          type="text" 
                          className="form-control bg-dark text-white border-secondary" 
                          id="state" 
                          name="state" 
                          maxLength="2" 
                          value={profileData.state} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="zipCode" className="form-label text-white">Zip Code</label>
                        <input 
                          type="text" 
                          className="form-control bg-dark text-white border-secondary" 
                          id="zipCode" 
                          name="zipCode" 
                          value={profileData.zipCode} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <h5 className="text-white mt-4 mb-3">Business Hours</h5>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="openingTime" className="form-label text-white">Opening Time</label>
                        <input 
                          type="time" 
                          className="form-control bg-dark text-white border-secondary" 
                          id="openingTime" 
                          name="openingTime" 
                          value={profileData.openingTime} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="closingTime" className="form-label text-white">Closing Time</label>
                        <input 
                          type="time" 
                          className="form-control bg-dark text-white border-secondary" 
                          id="closingTime" 
                          name="closingTime" 
                          value={profileData.closingTime} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <h5 className="text-white mt-4 mb-3">Delivery Settings</h5>
                    
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="deliveryRadius" className="form-label text-white">Delivery Radius (miles)</label>
                        <input 
                          type="number" 
                          className="form-control bg-dark text-white border-secondary" 
                          id="deliveryRadius" 
                          name="deliveryRadius" 
                          min="0" 
                          step="0.1" 
                          value={profileData.deliveryRadius} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="minimumOrder" className="form-label text-white">Minimum Order ($)</label>
                        <input 
                          type="number" 
                          className="form-control bg-dark text-white border-secondary" 
                          id="minimumOrder" 
                          name="minimumOrder" 
                          min="0" 
                          step="0.01" 
                          value={profileData.minimumOrder} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-end mt-4 gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-light"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-success px-4" 
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          <>Save Changes</>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <h6 className="text-muted mb-2">Restaurant Name</h6>
                        <p className="text-white">{profileData.name}</p>
                      </div>
                      <div className="col-md-6">
                        <h6 className="text-muted mb-2">Cuisine Type</h6>
                        <p className="text-white">{profileData.cuisine || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <h6 className="text-muted mb-2">Email</h6>
                        <p className="text-white">{profileData.email}</p>
                      </div>
                      <div className="col-md-6">
                        <h6 className="text-muted mb-2">Phone</h6>
                        <p className="text-white">{profileData.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h6 className="text-muted mb-2">Description</h6>
                      <p className="text-white">{profileData.description || 'No description provided'}</p>
                    </div>
                    
                    <h5 className="text-white mt-4 mb-3 border-bottom border-secondary pb-2">Address</h5>
                    
                    <div className="row mb-4">
                      <div className="col-12">
                        <h6 className="text-muted mb-2">Street Address</h6>
                        <p className="text-white">{profileData.address || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="row mb-4">
                      <div className="col-md-5">
                        <h6 className="text-muted mb-2">City</h6>
                        <p className="text-white">{profileData.city || 'Not provided'}</p>
                      </div>
                      <div className="col-md-3">
                        <h6 className="text-muted mb-2">State</h6>
                        <p className="text-white">{profileData.state || 'Not provided'}</p>
                      </div>
                      <div className="col-md-4">
                        <h6 className="text-muted mb-2">Zip Code</h6>
                        <p className="text-white">{profileData.zipCode || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <h5 className="text-white mt-4 mb-3 border-bottom border-secondary pb-2">Business Hours</h5>
                    
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <h6 className="text-muted mb-2">Opening Time</h6>
                        <p className="text-white">{profileData.openingTime || 'Not specified'}</p>
                      </div>
                      <div className="col-md-6">
                        <h6 className="text-muted mb-2">Closing Time</h6>
                        <p className="text-white">{profileData.closingTime || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    <h5 className="text-white mt-4 mb-3 border-bottom border-secondary pb-2">Delivery Settings</h5>
                    
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <h6 className="text-muted mb-2">Delivery Radius</h6>
                        <p className="text-white">{profileData.deliveryRadius} miles</p>
                      </div>
                      <div className="col-md-6">
                        <h6 className="text-muted mb-2">Minimum Order</h6>
                        <p className="text-white">${profileData.minimumOrder.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;