import { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PropTypes from 'prop-types';

const QuantitySelector = ({ onQuantityChange, initialQuantity = 1 }) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    onQuantityChange(quantity);
  }, [quantity, onQuantityChange]);

  const increment = () => {
    setQuantity(prev => prev + 1);
  };

  const decrement = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={decrement}
        disabled={quantity <= 1}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center font-medium">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={increment}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

QuantitySelector.propTypes = {
    onQuantityChange: PropTypes.func.isRequired,
    initialQuantity: PropTypes.number,
};

export default QuantitySelector;