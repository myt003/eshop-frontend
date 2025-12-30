import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Tunisia"
  });

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.info("Please login or register to proceed with checkout");
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    if (cart.length === 0) {
      toast.warning("Your cart is empty");
      return;
    }

    // Validate shipping info
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
      toast.error("Please fill in all required shipping information");
      return;
    }

    setLoading(true);
    
    try {
      // Get token
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication required. Please login again.");
        navigate("/login");
        return;
      }

      // Create order data
      const orderData = {
        addresseLivraison: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode || ''}, ${shippingInfo.country}`,
        phone: shippingInfo.phone,
        prixTotal: getCartTotal(),
        paymentMethod: "CASH_ON_DELIVERY",
        items: cart.map(item => ({
          productId: item.product.isProduct,
          quantite: item.quantity,
          prixUnitaire: item.product.productPrice
        }))
      };

      console.log("Sending order data:", orderData);

      // Call your endpoint
      const response = await axios.post(
        "http://localhost:9090/api/commandes",
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Order response:", response.data);

      // Get order ID from response - handle different response structures
      let orderId;
      if (response.data && response.data.id) {
        orderId = response.data.id;
      } else if (response.data && response.data.orderId) {
        orderId = response.data.orderId;
      } else if (response.data && typeof response.data === 'object') {
        // Try to find any ID field
        const data = response.data;
        orderId = data.id || data.orderId || data.commandId || data.orderNumber;
      }

      console.log("Extracted order ID:", orderId);

      // REMOVED: Don't send email from frontend - backend should handle it
      // Email will be sent automatically by the backend when order is created
      
      toast.success("Order created successfully!");
      
      // Clear cart and navigate to orders
      clearCart();
      navigate("/orders");
      
    } catch (error) {
      console.error("Checkout error details:", error);
      
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        
        if (error.response.status === 403) {
          toast.error("Access forbidden. Please login again.");
          localStorage.removeItem('token');
          navigate("/login");
        } else if (error.response.status === 401) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem('token');
          navigate("/login");
        } else if (error.response.status === 400) {
          // Handle specific error message from backend
          const errorMessage = error.response.data?.error || "Invalid request";
          toast.error(errorMessage);
          
          // If it's a user not found error, create a test user
          if (errorMessage.includes("User not found")) {
            toast.info("Creating test user...");
            try {
              await axios.post("http://localhost:9090/api/test/create-test-user");
              toast.success("Test user created. Please try checkout again.");
            } catch (userError) {
              console.error("Failed to create test user:", userError);
            }
          }
        } else {
          toast.error(error.response.data?.error || "Failed to create order");
        }
      } else if (error.request) {
        toast.error("No response from server. Please try again.");
      } else {
        toast.error("Checkout failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/product_placeholder.jpg";
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:9090/api/images/${imageUrl}`;
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="mb-8">
              <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">Add some products to your cart to get started!</p>
            <Link to="/products">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Cart Items ({cart.length})</h2>
                
                <div className="space-y-6">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center border-b border-gray-100 pb-6">
                      {/* Product Image */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={getImageUrl(item.product.imageUrl)}
                          alt={item.product.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-grow ml-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{item.product.productName}</h3>
                            <p className="text-sm text-gray-500 mt-1">{item.product.category?.name}</p>
                            <p className="text-blue-600 font-bold mt-2">
                              {item.product.productPrice?.toFixed(2)} TND
                            </p>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.product._id || item.product.isProduct)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center mt-4">
                          <span className="text-gray-700 mr-4">Quantity:</span>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.product._id || item.product.isProduct, item.quantity - 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              −
                            </button>
                            <span className="px-4 py-1 w-16 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.product._id || item.product.isProduct, item.quantity + 1)}
                              className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                          <span className="ml-4 font-medium">
                            Total: {(item.product.productPrice * item.quantity).toFixed(2)} TND
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Clear Cart Button */}
                <div className="mt-6">
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary & Checkout */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{getCartTotal().toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">10.00 TND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">{(getCartTotal() * 0.19).toFixed(2)} TND</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{(getCartTotal() + 10 + (getCartTotal() * 0.19)).toFixed(2)} TND</span>
                  </div>
                </div>
              </div>
              
              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                className={`w-full mt-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  loading || cart.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Proceed to Checkout"
                )}
              </button>
              
              {/* Continue Shopping */}
              <Link to="/products">
                <button className="w-full mt-4 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition">
                  Continue Shopping
                </button>
              </Link>
            </div>
            
            {/* Shipping Information (only show when authenticated) */}
            {isAuthenticated && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="2"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;