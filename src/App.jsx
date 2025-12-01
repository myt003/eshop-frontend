import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/common/product/Layout';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import VerifyEmail from './pages/VerifyEmail';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            {/* Protected routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="min-h-screen py-8">
                  <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-6">My Profile</h1>
                    <p>Profile page content here...</p>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <div className="min-h-screen py-8">
                  <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
                    <p>Admin dashboard content here...</p>
                  </div>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;