import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/orders" } });
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);
const handlePaymentLinkClick = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    // Check if order exists and payment is pending
    const response = await axios.get(
      `http://localhost:9090/api/commandes/${orderId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    
    const order = response.data;
    
    if (order.paymentStatus === 'PENDING') {
      navigate(`/payment/${orderId}`);
    } else if (order.paymentStatus === 'PAID') {
      toast.info('This order is already paid');
    }
  } catch (error) {
    console.error('Error checking order:', error);
    toast.error('Failed to check order status');
  }
};
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Please login again");
        navigate("/login");
        return;
      }

      // Use the correct endpoint: /api/commandes/my-commandes (not /api/orders/my-orders)
      const response = await axios.get("http://localhost:9090/api/commandes/my-commandes", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Orders response:", response.data);
      setOrders(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      
      if (err.response?.status === 403) {
        toast.error("Access forbidden. Please login again.");
        localStorage.removeItem('token');
        navigate("/login");
      } else if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem('token');
        navigate("/login");
      } else {
        setError("Failed to load orders. Please try again.");
        toast.error("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch(status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-800 text-gray-800';
    }
  };

  // Helper to get image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/product_placeholder.jpg";
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `http://localhost:9090/api/images/${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">View and track your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Placed on {formatDate(order.dateCommande)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status || 'PENDING'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus || 'PENDING'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.ligneCommandes && order.ligneCommandes.map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                        <div className="flex items-center">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={getImageUrl(item.product?.imageUrl)}
                              alt={item.product?.productName || "Product"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "/product_placeholder.jpg";
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <h4 className="font-medium text-gray-900">{item.product?.productName || "Product"}</h4>
                            <p className="text-sm text-gray-500">Quantity: {item.quantite}</p>
                            <p className="text-sm text-gray-500">Price: {item.prixUnitaire?.toFixed(2)} TND</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {(item.prixUnitaire * item.quantite).toFixed(2)} TND
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600">Shipping Address:</p>
                        <p className="font-medium text-gray-900">{order.addresseLivraison}</p>
                        {order.phone && (
                          <p className="text-sm text-gray-600 mt-1">Phone: {order.phone}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="space-y-2">
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span>{order.prixTotal?.toFixed(2)} TND</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      View Details
                    </button>
                    
                    {order.paymentStatus === 'PENDING' && (
                      <button
                        onClick={() => navigate(`/payment/${order.id}`)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                      >
                        Complete Payment
                      </button>
                    )}
                    
                    {order.status === 'PENDING' && (
                      <button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            await axios.post(
                              `http://localhost:9090/api/commandes/${order.id}/cancel`,
                              {},
                              {
                                headers: {
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json'
                                }
                              }
                            );
                            toast.success("Order cancelled successfully");
                            fetchOrders(); // Refresh orders
                          } catch (err) {
                            console.error("Cancel error:", err);
                            toast.error(err.response?.data?.error || "Failed to cancel order");
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;