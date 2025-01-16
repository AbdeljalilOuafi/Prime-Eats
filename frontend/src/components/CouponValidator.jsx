import { useState } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';

const CouponValidator = ({ 
  onValidCoupon, 
  onInvalidCoupon, 
  onClear,
  initialTotal 
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);
  const [validationMessage, setValidationMessage] = useState('');

  const validateCouponCode = (code) => {
    // Basic input validation
    if (!code || code.trim().length === 0) {
      setValidationStatus('error');
      setValidationMessage('Please enter a coupon code');
      onInvalidCoupon();
      return;
    }

    // Check for unsupported characters (only allow alphanumeric and hyphen)
    if (!/^[A-Za-z0-9-]+$/.test(code)) {
      setValidationStatus('error');
      setValidationMessage('Coupon code contains invalid characters');
      onInvalidCoupon();
      return;
    }

    // Simulate API call with setTimeout
    setIsValidating(true);
    setValidationStatus(null);
    setValidationMessage('');

    setTimeout(() => {
      const trimmedCode = code.trim().toUpperCase();
      
      // Check if code is "ALX"
      if (trimmedCode === 'ALX') {
        // Calculate discount to reach $0.01
        const discount = initialTotal - 0.01;
        setValidationStatus('success');
        setValidationMessage('Special discount applied - Total price: $0.01!');
        onValidCoupon(discount, trimmedCode);
      } else {
        setValidationStatus('error');
        setValidationMessage('Invalid coupon code');
        onInvalidCoupon();
      }
      
      setIsValidating(false);
    }, 500); // Add a small delay to show loading state
  };

  const handleClearCoupon = () => {
    setCouponCode('');
    setValidationStatus(null);
    setValidationMessage('');
    onClear();
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          disabled={isValidating || validationStatus === 'success'}
          placeholder="Enter coupon code"
          className={`w-full p-2 pr-24 border rounded-md focus:outline-none focus:ring-2 
            ${validationStatus === 'success' ? 'border-green-500 focus:ring-green-200' : 
              validationStatus === 'error' ? 'border-red-500 focus:ring-red-200' : 
              'border-gray-300 focus:ring-yellow-200'}
          `}
          aria-label="Coupon code input"
          maxLength={15}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {isValidating ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : validationStatus === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : validationStatus === 'error' ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : null}
          
          {(validationStatus === 'success' || couponCode) && (
            <button
              onClick={handleClearCoupon}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear coupon code"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Validation message */}
      {validationMessage && (
        <div
          className={`text-sm flex items-center gap-2 
            ${validationStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}
          role="alert"
        >
          {validationStatus === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{validationMessage}</span>
        </div>
      )}

      {/* Validation button */}
      {couponCode && validationStatus !== 'success' && (
        <button
          onClick={() => validateCouponCode(couponCode)}
          disabled={isValidating}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium
            ${isValidating ? 
              'bg-gray-100 text-gray-400 cursor-not-allowed' : 
              'bg-yellow-400 text-black hover:bg-yellow-500 transition-colors'}`}
          aria-label={isValidating ? "Validating coupon code" : "Apply coupon code"}
        >
          {isValidating ? 'Validating...' : 'Apply Coupon'}
        </button>
      )}
    </div>
  );
};

CouponValidator.propTypes = {
  onValidCoupon: PropTypes.func.isRequired,
  onInvalidCoupon: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  initialTotal: PropTypes.number.isRequired
};

CouponValidator.defaultProps = {
  onValidCoupon: () => {},
  onInvalidCoupon: () => {},
  onClear: () => {},
};

export default CouponValidator;