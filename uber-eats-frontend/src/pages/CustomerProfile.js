import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCustomerProfile, updateCustomerProfile, updateProfilePicture } from '../services/customer';

const CustomerProfile = () => {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Country list
  const countries = [
    "USA", "Canada", "Mexico", "UK", "Australia", "India", "China", "Japan", 
    "Germany", "France", "Brazil", "Argentina"
  ];

  useEffect(() => {
    // Fetch customer profile from API
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getCustomerProfile();
        
        setProfileData({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone || '',
          address: response.data.address || '',
          city: response.data.city || '',
          state: response.data.state || '',
          country: response.data.country || 'USA',
          profilePicture: response.data.profile_picture
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile. Please try again later.');
        
        // If API fails, use current user from auth as fallback
        if (currentUser) {
          setProfileData({
            name: currentUser.name || '',
            email: currentUser.email || '',
            phone: '',
            address: '',
            city: '',
            state: '',
            country: 'USA',
            profilePicture: null
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Update profile information
      await updateCustomerProfile({
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        country: profileData.country
      });
      
      // If a new profile picture was selected, upload it
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        
        const pictureResponse = await updateProfilePicture(formData);
        
        // Update the profile picture URL in the state
        setProfileData(prev => ({
          ...prev,
          profilePicture: pictureResponse.data.profilePicture
        }));
        
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

  const getInitials = (name) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#1a1a1a', color: '#FFF', paddingTop: '70px', minHeight: '100vh' }}>
        <div className="container">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#1a1a1a', color: '#FFF', paddingTop: '70px', minHeight: '100vh' }}>
      <div className="container py-4">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" role="alert">
            {success}
          </div>
        )}
        
        <div className="row">
          {/* Left Profile Card */}
          <div className="col-md-4 mb-4">
            <div style={{ 
              backgroundColor: '#121212', 
              borderRadius: '10px', 
              padding: '30px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center',
              border: '1px solid #333' 
            }}>
              {/* Profile Image */}
              <div className="position-relative mb-4">
                {profileData.profilePicture || filePreview ? (
                  <img 
                    src={filePreview || profileData.profilePicture} 
                    alt={profileData.name}
                    className="rounded-circle"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ 
                    width: '150px', 
                    height: '150px', 
                    borderRadius: '50%', 
                    backgroundColor: '#06C167', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '60px', 
                    fontWeight: 'bold', 
                    color: 'white'
                  }}>
                    {getInitials(profileData.name)}
                  </div>
                )}
                
                {isEditing && (
                  <div className="position-absolute bottom-0 end-0">
                    <label htmlFor="profile-picture" className="btn btn-sm btn-success rounded-circle" style={{ cursor: 'pointer' }}>
                      <i className="bi bi-camera"></i>
                      <input 
                        type="file" 
                        id="profile-picture" 
                        accept="image/*" 
                        className="d-none" 
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                )}
              </div>
              
              <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{profileData.name}</h2>
              <p style={{ color: '#9CA3AF', marginBottom: '20px' }}>{profileData.email}</p>
              
              {!isEditing && (
                <button 
                  className="btn w-100" 
                  onClick={() => setIsEditing(true)}
                  style={{
                    backgroundColor: '#06C167',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    fontWeight: '500'
                  }}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
          
          {/* Right Info Card */}
          <div className="col-md-8">
            <div style={{ 
              backgroundColor: '#121212', 
              borderRadius: '10px', 
              padding: '30px',
              border: '1px solid #333' 
            }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ fontSize: '24px', marginBottom: '0' }}>Profile Information</h2>
                {isEditing && (
                  <div>
                    <button 
                      className="btn btn-outline-light me-2" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn"
                      onClick={handleProfileUpdate}
                      disabled={saving}
                      style={{
                        backgroundColor: '#06C167',
                        color: 'white'
                      }}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              <form>
                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">Full Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="form-control bg-dark text-white border-secondary" 
                        name="name" 
                        value={profileData.name} 
                        disabled
                        readOnly
                      />
                    ) : (
                      <p style={{ fontWeight: '500', marginBottom: '0' }}>{profileData.name}</p>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">Email</label>
                    {isEditing ? (
                      <input 
                        type="email" 
                        className="form-control bg-dark text-white border-secondary" 
                        name="email" 
                        value={profileData.email} 
                        disabled
                        readOnly
                      />
                    ) : (
                      <p style={{ fontWeight: '500', marginBottom: '0' }}>{profileData.email}</p>
                    )}
                  </div>
                </div>
                
                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">Phone</label>
                    {isEditing ? (
                      <input 
                        type="tel" 
                        className="form-control bg-dark text-white border-secondary" 
                        name="phone" 
                        value={profileData.phone} 
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p style={{ fontWeight: '500', marginBottom: '0' }}>{profileData.phone || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">Country</label>
                    {isEditing ? (
                      <select 
                        className="form-select bg-dark text-white border-secondary" 
                        name="country"
                        value={profileData.country}
                        onChange={handleInputChange}
                      >
                        {countries.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    ) : (
                      <p style={{ fontWeight: '500', marginBottom: '0' }}>{profileData.country || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label text-muted">Address</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      className="form-control bg-dark text-white border-secondary" 
                      name="address" 
                      value={profileData.address} 
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                    />
                  ) : (
                    <p style={{ fontWeight: '500', marginBottom: '0' }}>{profileData.address || 'Not provided'}</p>
                  )}
                </div>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">City</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="form-control bg-dark text-white border-secondary" 
                        name="city" 
                        value={profileData.city} 
                        onChange={handleInputChange}
                        placeholder="Enter your city"
                      />
                    ) : (
                      <p style={{ fontWeight: '500', marginBottom: '0' }}>{profileData.city || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">State</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="form-control bg-dark text-white border-secondary" 
                        name="state" 
                        value={profileData.state} 
                        onChange={handleInputChange}
                        placeholder="e.g. CA"
                        maxLength="2"
                      />
                    ) : (
                      <p style={{ fontWeight: '500', marginBottom: '0' }}>{profileData.state || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;