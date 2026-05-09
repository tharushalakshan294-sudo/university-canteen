import React, { useEffect, useState } from 'react';
import { Order } from '../types';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Calendar, ChevronDown, CheckCircle2, ShoppingBag } from 'lucide-react';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Order History</h1>
        <p className="text-gray-500 text-lg">Keep track of your previous canteen orders.</p>
      </header>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-xl shadow-gray-200/40">
           <ShoppingBag className="w-20 h-20 text-gray-100 mx-auto mb-6" />
           <h2 className="text-2xl font-bold text-gray-400">No orders yet</h2>
           <p className="text-gray-400 mt-2">Hungry? Head over to the menu to place your first order!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              layout
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-lg shadow-gray-200/40"
            >
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors flex flex-wrap items-center justify-between gap-4"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm border border-orange-100">
                    <Package className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Order #{order.id.toUpperCase()}</p>
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-400 mb-1">TOTAL</p>
                    <p className="text-xl font-black text-gray-900">{formatCurrency(order.total)}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold mb-2">
                       <CheckCircle2 className="w-3.5 h-3.5" />
                       {order.status.toUpperCase()}
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedOrder === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-gray-50/50"
                  >
                    <div className="p-8 border-t border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        Order Details
                        <span className="h-px bg-gray-200 flex-grow ml-2" />
                      </h4>
                      <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                              <span className="w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-600 rounded-lg font-bold text-sm">
                                {item.quantity}
                              </span>
                              <span className="font-bold text-gray-900">{item.name}</span>
                            </div>
                            <span className="font-bold text-gray-500">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <p className="text-gray-500 font-medium italic">Payment was successful through saved method.</p>
                        <div className="text-right">
                           <p className="text-xs font-bold text-gray-400 mb-1">PAID TOTAL</p>
                           <p className="text-2xl font-black text-orange-600">{formatCurrency(order.total)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
