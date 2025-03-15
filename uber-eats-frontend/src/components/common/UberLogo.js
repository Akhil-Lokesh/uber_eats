import React from 'react';

const UberLogo = ({ color = '#000000', className = '', style = {} }) => {
  return (
    <div 
      className={className} 
      style={{ 
        ...style, 
        display: 'inline-flex', 
        alignItems: 'center',
        fontFamily: 'UberMove, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      }}
    >
      <span style={{ 
        fontSize: style.fontSize || '28px', 
        fontWeight: 'normal', 
        color: color,
        letterSpacing: '-0.5px',
        marginRight: '1px'
      }}>
        Uber
      </span>
      <span style={{ 
        fontSize: style.fontSize || '28px', 
        fontWeight: 'bold',
        color: '#06C167', // UberEATS green color
        letterSpacing: '-0.5px'
      }}>
        Eats
      </span>
    </div>
  );
};

export default UberLogo;