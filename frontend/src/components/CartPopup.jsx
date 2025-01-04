import { useContext } from "react";
import { CartContext } from "../context/CartContext/CartContext";
import { X } from "lucide-react";

const CartPopup = () => {
  const { cart, removeFromCart, closeCart, proceedToPayment } = useContext(CartContext);

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
                    <p className="text-sm text-gray-600">${item.price?.toFixed(2)}</p>
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
                Total: ${cart.reduce((sum, item) => sum + (item.price || 0), 0).toFixed(2)}
              </p>
              <button
                className="block w-full bg-yellow-400 text-black p-2 rounded-md hover:bg-yellow-500"
                onClick={proceedToPayment}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPopup;