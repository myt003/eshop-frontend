import React, { useEffect, useState, useMemo } from 'react';
import ProductItem from './ProductItem';

const ProductList = ({ 
  color = "black", 
  categoryId = null,
  currentPage = 1,
  pageSize = 12,
  onTotalProductsChange,
  onTotalPagesChange
}) => {
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = 'http://localhost:9090/api/products';
        if (categoryId) {
          url = `http://localhost:9090/api/categories/${categoryId}/products`;
        }
        
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Products fetched successfully:', data);
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.error('Expected array but got:', typeof data, data);
          setAllProducts([]);
          setDisplayedProducts([]);
          if (onTotalProductsChange) onTotalProductsChange(0);
          if (onTotalPagesChange) onTotalPagesChange(1);
          return;
        }
        
        setAllProducts(data || []);
        
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message || 'Failed to load products');
        setAllProducts([]);
        setDisplayedProducts([]);
        if (onTotalProductsChange) onTotalProductsChange(0);
        if (onTotalPagesChange) onTotalPagesChange(1);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  // Filter and paginate products
  useEffect(() => {
    if (!allProducts || !Array.isArray(allProducts)) {
      setDisplayedProducts([]);
      if (onTotalProductsChange) onTotalProductsChange(0);
      if (onTotalPagesChange) onTotalPagesChange(1);
      return;
    }
    
    let filtered = allProducts;
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(product =>
        product?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.productDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Calculate pagination
    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / pageSize);
    
    // Update parent component with totals
    if (onTotalProductsChange) onTotalProductsChange(totalFiltered);
    if (onTotalPagesChange) onTotalPagesChange(totalPages);
    
    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProducts = filtered.slice(startIndex, endIndex);
    
    setDisplayedProducts(paginatedProducts);
    
  }, [searchTerm, allProducts, currentPage, pageSize, onTotalProductsChange, onTotalPagesChange]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Add safe length checks
  const totalProductsCount = Array.isArray(allProducts) ? allProducts.length : 0;
  const displayedCount = displayedProducts.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-600 text-lg font-semibold">Error Loading Products</h3>
        <p className="text-red-500 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // Check if products is an array and has items
  if (!Array.isArray(allProducts) || totalProductsCount === 0) {
    return (
      <div className="text-center p-8 bg-white/10 rounded-xl">
        <h3 className="text-white text-lg">No products found</h3>
        <p className="text-white opacity-80 mt-2">Check back later for new products.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className={`text-3xl font-bold ${
          color === "black" ? "text-gray-900" : "text-white"
        }`}>
          {categoryId ? 'Category Products' : 'All Products'}
        </h2>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {displayedCount === 0 ? (
        <div className="text-center p-8 bg-white/10 rounded-xl">
          <p className={
            color === "black" ? "text-gray-600" : "text-white"
          }>
            No products match your search "{searchTerm}"
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className={`mt-2 ${
              color === "black" ? "text-blue-600 hover:text-blue-800" : "text-blue-300 hover:text-white"
            }`}
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductItem 
                key={product?.isProduct || Math.random()}
                product={product} 
                color={color}
              />
            ))}
          </div>
          
          <div className={`mt-8 text-center text-sm ${
            color === "black" ? "text-gray-500" : "text-white"
          }`}>
            Showing {((currentPage - 1) * pageSize) + 1} to{" "}
            {Math.min(currentPage * pageSize, displayedCount + ((currentPage - 1) * pageSize))} of{" "}
            {totalProductsCount} product{totalProductsCount !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
            {totalProductsCount > pageSize && ` • Page ${currentPage}`}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductList;