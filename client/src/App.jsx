import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';

// Auth Components
import Login from './components/common/Login';
import PrivateRoute from './components/common/PrivateRoute';

// Staff Components
import StaffDashboard from './components/staff/StaffDashboard';

// Kitchen Component
import KitchenDisplay from './components/kitchen/KitchenDisplay';

// Display Component
import ReadyOrdersDisplay from './components/display/ReadyOrdersDisplay';
import PublicStatusBoard from './components/display/PublicStatusBoard';

// Customer Component
import CustomerPortal from './components/customer/CustomerPortal';
import OrderTracking from './components/customer/OrderTracking';

import './styles/App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SocketProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/customer" element={<CustomerPortal />} />
          <Route path="/customer/order/:orderId" element={<OrderTracking />} />
          <Route path="/status" element={<PublicStatusBoard />} />
          <Route 
            path="/login" 
            element={
              user ? <Navigate to={`/${user.role}`} /> : <Login onLogin={handleLogin} />
            } 
          />

          {/* Protected Routes */}
          <Route
            path="/staff"
            element={
              <PrivateRoute user={user} allowedRoles={['owner', 'staff']}>
                <StaffDashboard user={user} onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/owner"
            element={
              <PrivateRoute user={user} allowedRoles={['owner']}>
                <StaffDashboard user={user} onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
          <Route
            path="/kitchen"
            element={
              <PrivateRoute user={user} allowedRoles={['kitchen', 'owner']}>
                <KitchenDisplay user={user} onLogout={handleLogout} />
              </PrivateRoute>
            }
          />
          <Route path="/ready" element={<ReadyOrdersDisplay />} />
          <Route
            path="/display"
            element={
              <PrivateRoute user={user} allowedRoles={['staff', 'owner']}>
                <ReadyOrdersDisplay user={user} onLogout={handleLogout} />
              </PrivateRoute>
            }
          />

          {/* Default Route */}
          <Route 
            path="/" 
            element={
              user ? <Navigate to={`/${user.role}`} /> : <Navigate to="/customer" />
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
};

export default App;