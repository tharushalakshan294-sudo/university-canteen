import React, { useState } from 'react';
import { useAuth } from '../context/AppContext';
import { motion } from 'motion/react';
import { User as UserIcon, Mail, CreditCard, Trash2, ShieldCheck, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

const UserProfilePage = () => {
  const { user, setUser } = useAuth();
  const [success, setSuccess] = useState('');

  const removePaymentMethod = async (id: string) => {
    const res = await fetch(`/api/payment-methods/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (user) {
        setUser({
          ...user,
          paymentMethods: user.paymentMethods.filter(m => m.id !== id)
        });
        setSuccess('Payment method removed');
        setTimeout(() => setSuccess(''), 3000);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Your Profile</h1>
        <p className="text-gray-500 text-lg">Manage your account and saved payments.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/40 text-center mb-8">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
              <UserIcon className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
            <p className="text-gray-500 font-medium mb-6">{user.email}</p>
            <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-2 px-4 rounded-full text-xs font-bold ring-1 ring-green-100">
              <ShieldCheck className="w-4 h-4" />
              VERIFIED ACCOUNT
            </div>
          </div>
        </div>

        {/* Payments & Detailed Settings */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/40">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="text-orange-500" />
                Saved Cards
              </h3>
              {success && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-green-600 font-bold text-sm"
                >
                  {success}
                </motion.span>
              )}
            </div>

            <div className="space-y-4">
              {user.paymentMethods.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">No cards saved yet.</p>
                </div>
              ) : (
                user.paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-orange-200 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                        <CreditCard className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{method.type} •••• {method.last4}</p>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Expires {method.expiry}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removePaymentMethod(method.id)}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-white rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                      title="Remove Card"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/40">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingBag className="text-orange-500" />
              Account Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="font-bold text-gray-900 text-sm">Order Notifications</p>
                  <p className="text-gray-500 text-xs">Receive updates on your food delivery</p>
                </div>
                <div className="w-12 h-6 bg-orange-500 rounded-full cursor-pointer relative shadow-inner">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl opacity-50 cursor-not-allowed">
                <div>
                  <p className="font-bold text-gray-900 text-sm">Change Password</p>
                  <p className="text-gray-500 text-xs tracking-tighter">Feature coming soon</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
