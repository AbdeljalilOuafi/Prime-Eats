import { useContext } from "react";
import { CartContext } from "../context/CartContext/CartContext";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CartPopup = () => {
  const { cart, removeFromCart, closeCart } = useContext(CartContext);
  const navigate = useNavigate();


  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };
  // Helper function to safely format price
  const formatPrice = (price) => {
    const numPrice = Number(price);
    return !isNaN(numPrice) ? numPrice.toFixed(2) : "0.00";
  };

  // Helper function to calculate total
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => {
      const itemPrice = Number(item.price);
      return sum + (!isNaN(itemPrice) ? itemPrice : 0);
    }, 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <button className="float-right" onClick={closeCart}>
          <X className="w-6 h-6 text-gray-500" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          <div>
            <ul className="mb-4">
              {cart.map((item, index) => (
                <li key={index} className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">${formatPrice(item.price)}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t">
              <p className="font-bold text-lg mb-4">
                Total: ${formatPrice(calculateTotal(cart))}
              </p>
              <button
                className="block w-full bg-yellow-400 text-black p-2 rounded-md hover:bg-yellow-500"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPopup;