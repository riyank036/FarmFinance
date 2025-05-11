import { useState, useEffect } from 'react';
import { FaDollarSign, FaRupeeSign } from 'react-icons/fa';
import { CURRENCY, setCurrency, getCurrentCurrency } from '../../utils/formatters';

const CurrencyToggle = () => {
  const [currency, setCurrencyState] = useState(getCurrentCurrency().code);

  // Handle toggle click
  const handleToggle = () => {
    const newCurrency = currency === CURRENCY.USD.code ? CURRENCY.INR.code : CURRENCY.USD.code;
    setCurrencyState(newCurrency);
    setCurrency(newCurrency);
  };

  // Update component state if currency changes elsewhere
  useEffect(() => {
    const currentCurrency = getCurrentCurrency().code;
    if (currency !== currentCurrency) {
      setCurrencyState(currentCurrency);
    }
  }, [currency]);

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Switch to ${currency === CURRENCY.USD.code ? 'Rupees' : 'US Dollars'}`}
    >
      {currency === CURRENCY.USD.code ? (
        <FaRupeeSign className="h-5 w-5 text-primary-600" />
      ) : (
        <FaDollarSign className="h-5 w-5 text-primary-600" />
      )}
    </button>
  );
};

export default CurrencyToggle; 