import React, { useState, useEffect, useRef } from 'react';
import {motion,useInView } from 'framer-motion';
import cartImage from '../assets/cartpc.png';
import { categorieService } from '../services/categorieService';
import ProductList from '../components/common/product/ProductList';
import { Link } from 'react-router-dom'; // Import with a capital 'L'

function Home() {
  const [categories, setCategories] = useState([]);
  
  // Create refs for scroll-triggered animations
  const categoriesRef = useRef(null);
  const isCategoriesInView = useInView(categoriesRef, { 
    once: true, 
    amount: 0.2, // Trigger when 20% of element is visible
    margin: "-100px" // Start checking 100px before element enters viewport
  });
  
  // Ref for hero section animation
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });

  useEffect(() => {
    categorieService.getAllCategories().then(data => setCategories(data));
  }, []);

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  // Hero section animation variants
  const heroVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    // REMOVED h-screen - let content determine height
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      
      {/* Hero Section - Make it take full viewport height */}
      <section className="min-h-screen flex items-center">
        <motion.div 
          ref={heroRef}
          initial="hidden"
          animate={isHeroInView ? "visible" : "hidden"}
          variants={heroVariants}
          className="w-full grid grid-cols-1 lg:grid-cols-2 items-center justify-items-center px-4 sm:px-6 lg:px-10 gap-8 lg:gap-10 max-w-screen-2xl mx-auto py-10"
        >
          {/* Text Content */}
          <motion.div 
            className="flex flex-col gap-4 md:gap-5 text-center lg:text-left order-2 lg:order-1"
            variants={{
              hidden: { opacity: 0, x: -30 },
              visible: { 
                opacity: 1, 
                x: 0,
                transition: { delay: 0.2 }
              }
            }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight">
              Best products in the milky way
            </h1>
            <p className="text-white text-base md:text-lg max-w-2xl mt-2 md:mt-4">
              Discover a new way to shop with our e-commerce platform, where quality meets convenience. Explore our wide range of products and enjoy seamless shopping from the comfort of your home.
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 md:gap-4 mt-4 md:mt-6"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: 0.4 }
                }
              }}
            >
              <Link to="/products" className="no-underline">
              <button   className="bg-white text-blue-600 font-bold px-6 md:px-8 py-2 md:py-3 rounded-lg hover:bg-gray-100 transition-all text-base md:text-lg hover:scale-105 active:scale-95 transform transition-transform duration-200 shadow-lg">
                Discover Products
              </button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Image with Animation */}
          <motion.div 
            className="order-1 lg:order-2 flex justify-center w-full"
            variants={{
              hidden: { opacity: 0, scale: 0.8, rotate: -5 },
              visible: { 
                opacity: 1, 
                scale: 1, 
                rotate: 0,
                transition: { 
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.3 
                }
              }
            }}
          >
            <img 
              src={cartImage} 
              alt="Shopping cart with products" 
              className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl rounded-lg shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Categories Section - Separate section with proper spacing */}
      <section 
        ref={categoriesRef}
        className="min-h-[70vh] flex flex-col justify-center py-16 md:py-20"
      >
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={isCategoriesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            Featured categories
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            animate={isCategoriesInView ? "visible" : "hidden"}
          >
            {categories.map(category => (
              <motion.div 
                key={category.isCategory} 
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.03, 
                  y: -5,
                  transition: { type: "spring", stiffness: 300 }
                }}
                className="bg-white bg-opacity-90 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer border border-white/20"
              >
                <img 
                  src={`http://localhost:9090/api/images/${category.imageUrl}`}
                  alt={category.name} 
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h2 className="text-xl font-bold mb-2 text-gray-800">{category.name}</h2>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <motion.div 
                  className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-0"
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
             <div className="container mx-auto px-4 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-6">Ready to start shopping?</h3>
                        <Link to="/products" className="no-underline">

          <button className="bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all text-lg hover:scale-105 shadow-xl">
            Browse All Products
          </button>
          </Link>
        </div>
      </section>

      {/* Optional: Add more sections for better scroll experience */}
      
    </div>

  );
}

export default Home;