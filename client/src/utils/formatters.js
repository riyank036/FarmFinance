// Currency formatting
export const CURRENCY = {
  INR: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN'
  }
};

// Current currency is always INR
const currentCurrency = CURRENCY.INR;

// Format currency to INR format
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat(currentCurrency.locale, {
    style: 'currency',
    currency: currentCurrency.code,
    minimumFractionDigits: 2
  }).format(amount);
};

// Format a date to local format
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
};

// Format a MongoDB ObjectId to a shorter displayable string
export const formatId = (id) => {
  if (!id) return '';
  if (id.length > 8) {
    return id.substring(0, 8) + '...';
  }
  return id;
};

// Get month name from month number (1-12)
export const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return months[monthNumber - 1] || '';
};

// Calculate profit (income - expenses)
export const calculateProfit = (income, expenses) => {
  return income - expenses;
};

// Format percentage value
export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(1)}%`;
}; 