import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth, CartProvider } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import MenuPage from './pages/MenuPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import PaymentPage from './pages/PaymentPage';
import UserProfilePage from './pages/UserProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import { LogOut, User as UserIcon, ShoppingBag, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
              CanteenGo
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-6">
                <Link to="/history" className="text-gray-600 hover:text-orange-600 transition-colors flex items-center gap-1">
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">Orders</span>
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-orange-600 transition-colors flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-600 hover:text-orange-600 font-medium">Login</Link>
                <Link to="/register" className="bg-orange-500 text-white px-4 py-2 rounded-full font-medium hover:bg-orange-600 transition-colors">
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full font-sans"
      />
      <p className="text-gray-400 font-medium animate-pulse">Warming up the kitchen...</p>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegistrationPage />} />
                  <Route path="/" element={<PrivateRoute><MenuPage /></PrivateRoute>} />
                  <Route path="/checkout" element={<PrivateRoute><OrderConfirmationPage /></PrivateRoute>} />
                  <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />
                  <Route path="/history" element={<PrivateRoute><OrderHistoryPage /></PrivateRoute>} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </AnimatePresence>
            </main>
            <footer className="bg-white border-t border-gray-100 py-8">
              <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} CanteenGo Order System. All rights reserved.
              </div>
            </footer>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

