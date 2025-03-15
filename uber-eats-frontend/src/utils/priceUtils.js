/**
 * Ensures a value is a number before performing number operations like toFixed()
 * @param {any} value - The value to convert to a number
 * @param {number} defaultValue - The default value to return if conversion fails (default: 0)
 * @returns {number} - The converted number or default value
 */
export const ensureNumber = (value, defaultValue = 0) => {
    // Return directly if already a number
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    
    // If it's a string that might include '$' or other characters
    if (typeof value === 'string') {
      // Remove non-numeric characters except the decimal point
      const cleaned = value.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    
    // Return default value for null, undefined, or other types
    return defaultValue;
  };
  
  /**
   * Formats a price value to a standard currency string
   * @param {any} price - The price value to format
   * @param {number} decimals - Number of decimal places (default: 2)
   * @param {string} currencySymbol - Currency symbol to prepend (default: '$')
   * @returns {string} - Formatted price string
   */
  export const formatPrice = (price, decimals = 2, currencySymbol = '$') => {
    const numericPrice = ensureNumber(price);
    return `${currencySymbol}${numericPrice.toFixed(decimals)}`;
  };
  
  /**
   * Calculates the total price for a quantity of items
   * @param {any} price - The price value of a single item
   * @param {number} quantity - The quantity of items
   * @returns {number} - The total price
   */
  export const calculateTotal = (price, quantity) => {
    return ensureNumber(price) * ensureNumber(quantity);
  };