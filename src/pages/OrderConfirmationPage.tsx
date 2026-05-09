import React from 'react';
import { useCart } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, ChevronRight, ShoppingBag } from 'lucide-react';

const OrderConfirmationPage = () => {
  const { cart, total } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-500 hover:text-orange-600 font-medium mb-8 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Menu
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/40"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Review Order</h1>

        <div className="space-y-6 mb-10">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-gray-400">
                  {item.quantity}x
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <p className="text-gray-500 text-sm">{formatCurrency(item.price)} each</p>
                </div>
              </div>
              <span className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 mb-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 font-medium">Subtotal</span>
            <span className="font-bold text-gray-900">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium">Tax (0%)</span>
            <span className="font-bold text-gray-900">$0.00</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-xl font-bold text-gray-900">Total</span>
            <span className="text-2xl font-black text-orange-600">{formatCurrency(total)}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/payment')}
          className="w-full bg-orange-500 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 group"
        >
          <CreditCard className="w-6 h-6" />
          Proceed to Payment
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
};

export default OrderConfirmationPage;
