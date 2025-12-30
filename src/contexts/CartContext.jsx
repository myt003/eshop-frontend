import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        setCart([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (product, quantity = 1) => {
    try {
      setLoading(true);
      
      // Validate product
      if (!product || !product.isProduct) {
        throw new Error("Invalid product data");
      }

      // Convert productId to number
      const productId = Number(product.isProduct);
      
      // Check stock availability from backend
      const response = await axios.get(`http://localhost:9090/api/products/${productId}`);
      const currentStock = response.data.productQuantity || 0;
      
      const existingItemIndex = cart.findIndex(item => 
        Number(item.product.isProduct) === productId
      );
      
      const currentInCart = existingItemIndex >= 0 ? cart[existingItemIndex].quantity : 0;
      
      if (currentInCart + quantity > currentStock) {
        throw new Error(`Only ${currentStock - currentInCart} items available in stock`);
      }

      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity += quantity;
        setCart(updatedCart);
      } else {
        // Add new item to cart
        setCart([...cart, { 
          product: { 
            ...product, 
            isProduct: productId 
          }, 
          quantity 
        }]);
      }

      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (productId) => {
    const productIdNum = Number(productId);
    setCart(cart.filter(item => Number(item.product.isProduct) !== productIdNum));
  };

  const updateQuantity = (productId, newQuantity) => {
    const productIdNum = Number(productId);
    
    if (newQuantity < 1) {
      removeFromCart(productIdNum);
      return;
    }

    setCart(cart.map(item => 
      Number(item.product.isProduct) === productIdNum 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.product.productPrice * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const getCartItemQuantity = (productId) => {
    const productIdNum = Number(productId);
    const item = cart.find(item => Number(item.product.isProduct) === productIdNum);
    return item ? item.quantity : 0;
  };

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getCartItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};