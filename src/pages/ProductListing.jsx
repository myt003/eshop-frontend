import React, { useState, useEffect } from "react";
import ProductList from "../components/common/product/ProductList.jsx";

function ProductListing() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:9090/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === "all" ? null : categoryId);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  const Pagination = () => {
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
        {/* Page info */}
        <div className="text-white">
          Showing <span className="font-bold">{((currentPage - 1) * pageSize) + 1}</span>-
          <span className="font-bold">{Math.min(currentPage * pageSize, totalProducts)}</span> of{" "}
          <span className="font-bold">{totalProducts}</span> products
        </div>

        {/* Page numbers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-lg ${
              currentPage === 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 hover:bg-gray-100"
            } transition`}
          >
            « First
          </button>

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-lg ${
              currentPage === 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 hover:bg-gray-100"
            } transition`}
          >
            ‹ Prev
          </button>

          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-1 rounded-lg ${
                currentPage === number
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600 hover:bg-gray-100"
              } transition`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-lg ${
              currentPage === totalPages
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 hover:bg-gray-100"
            } transition`}
          >
            Next ›
          </button>

          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-lg ${
              currentPage === totalPages
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 hover:bg-gray-100"
            } transition`}
          >
            Last »
          </button>
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-2 text-white">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="bg-white text-blue-600 px-2 py-1 rounded border border-gray-300"
          >
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>
          <span>per page</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <section className="min-h-screen flex flex-col items-center py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            All Products
          </h1>
          <p className="text-white text-lg opacity-90 max-w-2xl">
            Browse our complete collection of products. Use filters to find exactly what you're looking for.
          </p>
        </div>

        {/* Filters Section */}
        <div className="w-full max-w-7xl mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Category Filter */}
              <div className="w-full md:w-auto">
                <h3 className="text-white font-semibold mb-2">Filter by Category</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange("all")}
                    className={`px-4 py-2 rounded-lg transition ${
                      selectedCategory === null
                        ? "bg-blue-600 text-white"
                        : "bg-white text-blue-600 hover:bg-gray-100"
                    }`}
                  >
                    All Categories
                  </button>
                  
                  {categories.map(category => (
                    <button
                      key={category.isCategory}
                      onClick={() => handleCategoryChange(category.isCategory)}
                      className={`px-4 py-2 rounded-lg transition ${
                        selectedCategory === category.isCategory
                          ? "bg-blue-600 text-white"
                          : "bg-white text-blue-600 hover:bg-gray-100"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Filters & Clear Button */}
              <div className="flex items-center gap-4">
                {(selectedCategory !== null) && (
                  <div className="text-white">
                    <span className="font-semibold">Active Filter:</span>{" "}
                    {categories.find(c => c.isCategory === selectedCategory)?.name || "Category"}
                  </div>
                )}
                
                {(selectedCategory !== null) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Product List with Pagination Props */}
        <div className="w-full max-w-7xl">
          <ProductList 
            currentPage={currentPage}
            pageSize={pageSize}
            onTotalProductsChange={setTotalProducts}
            onTotalPagesChange={setTotalPages}
            categoryId={selectedCategory}
          />
          
          {/* Pagination */}
          {totalProducts > 0 && (
            <div className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <Pagination />
            </div>
          )}
        </div>

        {/* Quick navigation buttons for mobile */}
        {totalProducts > pageSize && (
          <div className="fixed bottom-4 left-0 right-0 flex justify-center gap-2 px-4 sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-full ${
                currentPage === 1
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-600 shadow-lg"
              } transition`}
            >
              ‹
            </button>
            <div className="bg-white text-blue-600 px-4 py-2 rounded-full shadow-lg">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-full ${
                currentPage === totalPages
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-600 shadow-lg"
              } transition`}
            >
              ›
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default ProductListing;