import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // UberEats Logo Component
  const UberLogo = ({ color = '#FFFFFF' }) => {
    return (
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center',
        marginBottom: '20px', 
        fontSize: '28px',
        fontWeight: 'bold', 
        letterSpacing: '-0.5px',
      }}>
        <span style={{ 
          marginRight: '1px',
          color: color
        }}>
          Uber
        </span>
        <span style={{ 
          color: '#06C167'
        }}>
          Eats
        </span>
      </div>
    );
  };

  return (
    <footer className="bg-black text-white pt-5 pb-4">
      <div className="container">
        {/* Main Footer Content */}
        <div className="row mb-4">
          {/* Logo and Description */}
          <div className="col-lg-4 mb-4 mb-lg-0">
            <UberLogo />
            <p className="text-muted mb-4" style={{ maxWidth: '350px' }}>
              A food delivery application prototype built with React and Node.js.
              Order your favorite meals from local restaurants and have them delivered to your doorstep.
            </p>
            <div className="d-flex gap-2">
              <a href="#" className="social-icon bg-dark p-2 rounded-circle" aria-label="Facebook" style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <i className="bi bi-facebook text-white"></i>
              </a>
              <a href="#" className="social-icon bg-dark p-2 rounded-circle" aria-label="Twitter" style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <i className="bi bi-twitter text-white"></i>
              </a>
              <a href="#" className="social-icon bg-dark p-2 rounded-circle" aria-label="Instagram" style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <i className="bi bi-instagram text-white"></i>
              </a>
              <a href="#" className="social-icon bg-dark p-2 rounded-circle" aria-label="LinkedIn" style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-3px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <i className="bi bi-linkedin text-white"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="col-6 col-md-3 col-lg-2 mb-4 mb-md-0">
            <h5 className="mb-3 text-white fw-bold fs-6">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ transition: 'color 0.3s ease' }}
                onMouseOver={(e) => e.target.style.color = '#06C167'}
                onMouseOut={(e) => e.target.style.color = ''}
                >
                  <i className="bi bi-chevron-right small me-1"></i> Home
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ transition: 'color 0.3s ease' }}
                onMouseOver={(e) => e.target.style.color = '#06C167'}
                onMouseOut={(e) => e.target.style.color = ''}
                >
                  <i className="bi bi-chevron-right small me-1"></i> Restaurants
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ transition: 'color 0.3s ease' }}
                onMouseOver={(e) => e.target.style.color = '#06C167'}
                onMouseOut={(e) => e.target.style.color = ''}
                >
                  <i className="bi bi-chevron-right small me-1"></i> Login
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ transition: 'color 0.3s ease' }}
                onMouseOver={(e) => e.target.style.color = '#06C167'}
                onMouseOut={(e) => e.target.style.color = ''}
                >
                  <i className="bi bi-chevron-right small me-1"></i> Sign Up
                </a>
              </li>
            </ul>
          </div>
          
          {/* For Restaurants */}
          <div className="col-6 col-md-3 col-lg-2 mb-4 mb-md-0">
            <h5 className="mb-3 text-white fw-bold fs-6">For Restaurants</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ transition: 'color 0.3s ease' }}
                onMouseOver={(e) => e.target.style.color = '#06C167'}
                onMouseOut={(e) => e.target.style.color = ''}
                >
                  <i className="bi bi-chevron-right small me-1"></i> Partner with us
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ transition: 'color 0.3s ease' }}
                onMouseOver={(e) => e.target.style.color = '#06C167'}
                onMouseOut={(e) => e.target.style.color = ''}
                >
                  <i className="bi bi-chevron-right small me-1"></i> Restaurant Dashboard
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ transition: 'color 0.3s ease' }}
                onMouseOver={(e) => e.target.style.color = '#06C167'}
                onMouseOut={(e) => e.target.style.color = ''}
                >
                  <i className="bi bi-chevron-right small me-1"></i> Delivery Settings
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ transition: 'color 0.3s ease' }}
                onMouseOver={(e) => e.target.style.color = '#06C167'}
                onMouseOut={(e) => e.target.style.color = ''}
                >
                  <i className="bi bi-chevron-right small me-1"></i> Business Resources
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact Us */}
          <div className="col-md-6 col-lg-4">
            <h5 className="mb-3 text-white fw-bold fs-6">Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-start">
                <i className="bi bi-geo-alt text-success me-2 mt-1"></i>
                <span>123 Main St, San Jose, CA 95112</span>
              </li>
              <li className="mb-3 d-flex align-items-start">
                <i className="bi bi-envelope text-success me-2 mt-1"></i>
                <a href="mailto:support@ubereats-prototype.com" className="text-muted text-decoration-none">
                  support@ubereats-prototype.com
                </a>
              </li>
              <li className="mb-3 d-flex align-items-start">
                <i className="bi bi-telephone text-success me-2 mt-1"></i>
                <span>(123) 456-7890</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <hr className="border-secondary my-4" />
        
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="mb-0 text-muted">&copy; {currentYear} UberEATS Prototype. All rights reserved.</p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <a href="#" className="text-muted text-decoration-none me-3">Privacy Policy</a>
            <a href="#" className="text-muted text-decoration-none">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;