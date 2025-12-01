import React from "react";

const ProductItem = ({ product }) => {
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

  return (
    <div className="border p-4 rounded-lg bg-white shadow hover:shadow-lg transition-shadow">
      <img
        src={getImageUrl()}
        alt={product.productName || "Product"}
        className="w-full h-64 object-cover mb-3 rounded-lg"
        onError={(e) => {
          e.target.src = "/product_placeholder.jpg";
        }}
      />
      <h3 className="font-bold text-lg text-gray-800">{product.productName}</h3>
      <p className="text-blue-600 font-bold text-xl">{product.productPrice?.toFixed(2)}TND</p>
      {product.productDescription && (
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">
          {product.productDescription}
        </p>
      )}
    </div>
  );
};

export default ProductItem;