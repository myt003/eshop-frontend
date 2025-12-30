import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-toastify";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getCartItemQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProductDetails();
    fetchRelatedProducts();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      // Use your actual endpoint from CatalogueController
      const response = await axios.get(`http://localhost:9090/api/products/${id}`);
      console.log("Product data from API:", response.data);
      setProduct(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setError("Failed to load product details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      // Fetch products from the same category
      if (product && product.category) {
        const response = await axios.get(
          `http://localhost:9090/api/categories/${product.category.isCategory}/products`
        );
        setRelatedProducts(response.data || []);
      } else {
        // Fetch all products as fallback
        const response = await axios.get(`http://localhost:9090/api/products`);
        setRelatedProducts(response.data || []);
      }
    } catch (err) {
      console.error("Error fetching related products:", err);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/product_placeholder.jpg";
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `http://localhost:9090/api/images/products/${imageUrl}`;
  };

  const handleAddToCart = async () => {
    if (!product || product.productQuantity <= 0) return;

    setAddingToCart(true);
    try {
      // Use isProduct field from your entity
      const currentInCart = getCartItemQuantity(product.isProduct);
      const availableStock = product.productQuantity - currentInCart;

      if (quantity > availableStock) {
        toast.error(`Only ${availableStock} items available in stock`);
        setAddingToCart(false);
        return;
      }

      await addToCart(product, quantity);
      toast.success(`${quantity} ${product.productName} added to cart!`);
      setQuantity(1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product || product.productQuantity <= 0) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.info("Please login or register to proceed with checkout");
      navigate("/login", { state: { from: `/product/${id}` } });
      return;
    }

    setAddingToCart(true);
    try {
      const currentInCart = getCartItemQuantity(product.isProduct);
      const availableStock = product.productQuantity - currentInCart;

      if (quantity > availableStock) {
        toast.error(`Only ${availableStock} items available in stock`);
        setAddingToCart(false);
        return;
      }

      await addToCart(product, quantity);
      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (change) => {
    if (!product) return;
    
    const currentInCart = getCartItemQuantity(product.isProduct);
    const availableStock = product.productQuantity - currentInCart;
    
    const newQuantity = quantity + change;
    
    if (newQuantity < 1) return;
    if (newQuantity > availableStock) {
      toast.warning(`Only ${availableStock} available in stock`);
      return;
    }
    
    setQuantity(newQuantity);
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
            onClick={() => navigate("/products")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const currentInCart = getCartItemQuantity(product.isProduct);
  const availableStock = product.productQuantity - currentInCart;
  const isOutOfStock = product.productQuantity <= 0;
  const maxReached = quantity >= availableStock;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <button onClick={() => navigate("/")} className="hover:text-blue-600">
                Home
              </button>
            </li>
            <li>/</li>
            <li>
              <button onClick={() => navigate("/products")} className="hover:text-blue-600">
                Products
              </button>
            </li>
            <li>/</li>
            <li className="font-medium text-gray-900">{product.productName}</li>
          </ol>
        </nav>

        {/* Product Details */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-xl bg-gray-100">
                <img
                  src={getImageUrl(product.imageUrl)}
                  alt={product.productName}
                  className="w-full h-96 object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = "/product_placeholder.jpg";
                  }}
                />
                {isOutOfStock && (
                  <div className="absolute top-4 right-4 px-4 py-2 bg-red-600 text-white rounded-full font-semibold">
                    Out of Stock
                  </div>
                )}
                {!isOutOfStock && availableStock < 10 && (
                  <div className="absolute top-4 right-4 px-4 py-2 bg-orange-600 text-white rounded-full font-semibold">
                    Only {availableStock} left
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {product.productName}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400 text-2xl">★★★★★</span>
                    <span className="text-gray-600">(4.8)</span>
                  </div>
                </div>

                {product.category?.name && (
                  <p className="text-sm text-gray-500 mb-4">
                    Category:{" "}
                    <span className="font-medium text-blue-600">
                      {product.category.name}
                    </span>
                  </p>
                )}

                {/* Price */}
                <div className="mb-6">
                  <p className="text-4xl font-bold text-blue-600">
                    {product.productPrice?.toFixed(2)} TND
                  </p>
                  {product.productPrice && (
                    <p className="text-lg text-gray-400 line-through">
                      {(product.productPrice * 1.2).toFixed(2)} TND
                    </p>
                  )}
                  <p className="text-green-600 font-medium mt-1">
                    Save {((product.productPrice * 1.2 - product.productPrice).toFixed(2))} TND
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-800">
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {product.productDescription ||
                    "No description available for this product."}
                </p>
              </div>

              {/* Stock Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Availability:</span>
                  <span className={`font-semibold ${
                    isOutOfStock
                      ? "text-red-600"
                      : availableStock > 10
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}>
                    {isOutOfStock
                      ? "Out of Stock"
                      : availableStock > 10
                      ? "In Stock"
                      : `Only ${availableStock} left`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      isOutOfStock
                        ? "bg-red-600"
                        : availableStock > 10
                        ? "bg-green-600"
                        : "bg-orange-600"
                    }`}
                    style={{
                      width: `${Math.min((availableStock / product.productQuantity) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {currentInCart > 0 && `${currentInCart} already in your cart`}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1 || addingToCart}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      −
                    </button>
                    <span className="px-4 py-2 w-16 text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={maxReached || addingToCart}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Max: {availableStock} available
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || addingToCart || maxReached}
                    className={`flex-1 py-4 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-3 ${
                      isOutOfStock || maxReached
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                    } ${addingToCart && "opacity-75 cursor-wait"}`}
                  >
                    {addingToCart ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Adding to Cart...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          ></path>
                        </svg>
                        <span>
                          {isOutOfStock
                            ? "Out of Stock"
                            : maxReached
                            ? "Maximum Quantity Reached"
                            : "Add to Cart"}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock || addingToCart || maxReached}
                    className={`flex-1 py-4 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-3 ${
                      isOutOfStock || maxReached
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
                    } ${addingToCart && "opacity-75 cursor-wait"}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      ></path>
                    </svg>
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts
                .filter(relatedProduct => relatedProduct.isProduct !== product.isProduct)
                .slice(0, 4)
                .map((relatedProduct) => (
                  <div
                    key={relatedProduct.isProduct}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/product/${relatedProduct.isProduct}`)}
                  >
                    <img
                      src={getImageUrl(relatedProduct.imageUrl)}
                      alt={relatedProduct.productName}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1">
                        {relatedProduct.productName}
                      </h3>
                      <p className="text-blue-600 font-bold">
                        {relatedProduct.productPrice?.toFixed(2)} TND
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;