import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
// Import common components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import CustomerSignup from './pages/CustomerSignup';
import RestaurantSignup from './pages/RestaurantSignup';
import CustomerDashboard from './pages/CustomerDashboard';
import RestaurantList from './pages/RestaurantList';
import RestaurantDetails from './pages/RestaurantDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';  // Import the Checkout component
import CustomerOrders from './pages/CustomerOrders';
import OrderDetails from './pages/OrderDetails';
import Favorites from './pages/Favorites';
import CustomerProfile from './pages/CustomerProfile';
import RestaurantDashboard from './pages/RestaurantDashboard';
import RestaurantProfile from './pages/RestaurantProfile';
import MenuManagement from './pages/MenuManagement';
import OrderManagement from './pages/OrderManagement';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup/customer" element={<CustomerSignup />} />
                <Route path="/signup/restaurant" element={<RestaurantSignup />} />
                
                {/* Customer routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/restaurants" element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <RestaurantList />
                  </ProtectedRoute>
                } />
                <Route path="/restaurants/:id" element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <RestaurantDetails />
                  </ProtectedRoute>
                } />
                <Route path="/cart" element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <Cart />
                  </ProtectedRoute>
                } />
                {/* Add checkout route */}
                <Route path="/checkout" element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <CustomerOrders />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <OrderDetails />
                  </ProtectedRoute>
                } />
                <Route path="/favorites" element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <Favorites />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute allowedUserTypes={['customer']}>
                    <CustomerProfile />
                  </ProtectedRoute>
                } />
                
                {/* Restaurant routes */}
                <Route path="/restaurant/dashboard" element={
                  <ProtectedRoute allowedUserTypes={['restaurant']}>
                    <RestaurantDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/restaurant/profile" element={
                  <ProtectedRoute allowedUserTypes={['restaurant']}>
                    <RestaurantProfile />
                  </ProtectedRoute>
                } />
                <Route path="/restaurant/menu" element={
                  <ProtectedRoute allowedUserTypes={['restaurant']}>
                    <MenuManagement />
                  </ProtectedRoute>
                } />
                <Route path="/restaurant/orders" element={
                  <ProtectedRoute allowedUserTypes={['restaurant']}>
                    <OrderManagement />
                  </ProtectedRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={
                  <div className="container py-5 mt-5 text-center">
                    <div className="py-5">
                      <i className="bi bi-exclamation-triangle-fill text-warning fs-1 mb-3 d-block"></i>
                      <h1 className="display-1">404</h1>
                      <h2 className="mb-4">Page Not Found</h2>
                      <p className="lead mb-4">The page you are looking for might have been removed or is temporarily unavailable.</p>
                      <a href="/" className="btn btn-primary">Go to Homepage</a>
                    </div>
                  </div>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;