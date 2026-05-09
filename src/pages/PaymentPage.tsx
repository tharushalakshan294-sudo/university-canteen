import React, { useState } from 'react';
import { useCart, useAuth } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { PaymentMethod } from '../types';

const PaymentPage = () => {
  const { cart, total, clearCart } = useCart();
  const { user, setUser } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({ type: 'Visa', last4: '', expiry: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.last4 || !newCard.expiry) {
      setError('Please fill in all fields');
      return;
    }
    const res = await fetch('/api/payment-methods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCard),
    });
    const data = await res.json();
    if (res.ok) {
      if (user) {
        setUser({ ...user, paymentMethods: [...user.paymentMethods, data] });
      }
      setShowAddForm(false);
      setNewCard({ type: 'Visa', last4: '', expiry: '' });
      setSelectedMethod(data.id);
      setError('');
    }
  };

  const handleCompletePayment = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }
    setIsProcessing(true);
    setError('');

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, total }),
    });

    if (res.ok) {
      clearCart();
      navigate('/history');
    } else {
      const data = await res.json();
      setError(data.error || 'Payment failed');
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate('/checkout')}
        className="flex items-center gap-2 text-gray-500 hover:text-orange-600 font-medium mb-8 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back to Summary
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/40"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Payment Method</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          {user?.paymentMethods.map((method: PaymentMethod) => (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                selectedMethod === method.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                  <CreditCard className="text-gray-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{method.type} •••• {method.last4}</p>
                  <p className="text-gray-500 text-xs font-medium">Expires {method.expiry}</p>
                </div>
              </div>
              {selectedMethod === method.id && <CheckCircle2 className="text-orange-500 w-6 h-6" />}
            </div>
          ))}

          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full p-5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-500 font-bold flex items-center justify-center gap-2 hover:border-orange-200 hover:text-orange-600 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add New Card
            </button>
          ) : (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              onSubmit={handleAddMethod}
              className="bg-gray-50 p-6 rounded-2xl space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Type</label>
                  <select
                    value={newCard.type}
                    onChange={(e) => setNewCard({ ...newCard, type: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                  >
                    <option>Visa</option>
                    <option>Mastercard</option>
                    <option>Amex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="1234"
                    value={newCard.last4}
                    onChange={(e) => setNewCard({ ...newCard, last4: e.target.value.replace(/\D/g, '') })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Expiry (MM/YY)</label>
                <input
                  type="text"
                  placeholder="12/28"
                  value={newCard.expiry}
                  onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                  className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 font-bold text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20"
                >
                  Save Card
                </button>
              </div>
            </motion.form>
          )}
        </div>

        <div className="pt-8 border-t border-gray-100 italic text-gray-400 text-xs text-center mb-8">
          Your payment data is processed securely via our encrypted server.
        </div>

        <button
          onClick={handleCompletePayment}
          disabled={isProcessing || !selectedMethod}
          className="w-full bg-orange-500 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:bg-gray-200 disabled:shadow-none disabled:cursor-not-allowed overflow-hidden relative"
        >
          {isProcessing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <>
              Pay {formatCurrency(total)}
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default PaymentPage;
