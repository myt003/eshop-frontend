import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../contexts/CartContext"; // Import cart context
import { toast } from "react-toastify";

const ProductItem = ({ product }) => {
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart(); // Get addToCart function
  
  if (!product) return null;

  const getImageUrl = () => {
    if (product?.imageUrl) {
      if (product.imageUrl.startsWith('http')) {
        return product.imageUrl;
      }
      return `http://localhost:9090/api/images/${product.imageUrl}`;
    }
    return "/product_placeholder.jpg";
  };

  const handleDetailsClick = () => {
    navigate(`/product/${product.isProduct}`);
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    
    try {
      await addToCart(product, 1);
      toast.success(`${product.productName} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <img
          src={getImageUrl()}
          alt={product.productName || "Product"}
          className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "/product_placeholder.jpg";
          }}
        />
        {/* Stock Status Badge */}
        {product.productQuantity !== undefined && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
            product.productQuantity > 0 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {product.productQuantity > 0 ? `${product.productQuantity} in stock` : 'Out of stock'}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Product Name */}
        <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">
          {product.productName}
        </h3>
        
        {/* Category */}
        {product.category?.name && (
          <p className="text-sm text-gray-500 mb-2">
            {product.category.name}
          </p>
        )}
        
        {/* Product Description */}
        {product.productDescription && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
            {product.productDescription}
          </p>
        )}
        
        {/* Price */}
        <div className="mb-4">
          <p className="text-blue-600 font-bold text-2xl">
            {product.productPrice?.toFixed(2)} TND
          </p>
          {product.productPrice && (
            <p className="text-gray-400 text-sm line-through">
              {(product.productPrice * 1.2).toFixed(2)} TND
            </p>
          )}
        </div>

        {/* Buttons Container */}
        <div className="flex flex-col space-y-2 mt-auto">
          {/* Details Button */}
          <button
            onClick={handleDetailsClick}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>View Details</span>
          </button>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || (product.productQuantity !== undefined && product.productQuantity <= 0)}
            className={`w-full px-4 py-3 font-medium rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              isAddingToCart
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : product.productQuantity !== undefined && product.productQuantity <= 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
            }`}
          >
            {isAddingToCart ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <span>
                  {product.productQuantity <= 0 ? "Out of Stock" : "Add to Cart"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;