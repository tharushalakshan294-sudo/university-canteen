import React, { useEffect, useState } from 'react';
import { useCart } from '../context/AppContext';
import { MenuItem } from '../types';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, Minus, ArrowRight, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FoodCard = ({ item }: { item: MenuItem }) => {
  const { addToCart } = useCart();
  return (
    <motion.div
      layout
      className="bg-white rounded-3xl p-4 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all group overflow-hidden"
    >
      <div className="h-48 bg-gray-100 rounded-2xl mb-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold bg-orange-50 italic">
          {item.name}
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm border border-orange-100">
          {item.category}
        </div>
      </div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors">{item.name}</h3>
        <span className="font-bold text-orange-600 text-lg">{formatCurrency(item.price)}</span>
      </div>
      <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">{item.description}</p>
      <button
        onClick={() => addToCart(item)}
        className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 active:scale-95"
      >
        <Plus className="w-5 h-5" />
        Add to Cart
      </button>
    </motion.div>
  );
};

const MenuPage = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const { cart, addToCart, removeFromCart, clearCart, total } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(setItems);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Menu Section */}
        <div className="flex-grow">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Canteen Menu</h1>
            <p className="text-gray-500 text-lg">Fresh food delivered straight to your table.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map(item => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Cart Section */}
        <aside className="w-full lg:w-96 shrink-0">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 sticky top-24 shadow-xl shadow-gray-200/40">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Your Cart</h2>
              </div>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">
                {cart.reduce((s, i) => s + i.quantity, 0)} items
              </span>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {cart.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-10"
                  >
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-10 h-10 text-gray-200" />
                    </div>
                    <p className="text-gray-400 font-medium italic">Hungry? Add something!</p>
                  </motion.div>
                ) : (
                  cart.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl"
                    >
                      <div className="flex-grow">
                        <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-orange-600 font-bold text-xs">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 hover:text-orange-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="p-1 hover:text-orange-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {cart.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex justify-between mb-6">
                  <span className="text-gray-500 font-medium">Total</span>
                  <span className="text-2xl font-black text-gray-900">{formatCurrency(total)}</span>
                </div>
                <div className="grid grid-cols-5 gap-2 mb-4">
                   <button
                    onClick={clearCart}
                    className="col-span-1 bg-gray-100 text-gray-400 p-4 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                    title="Clear Cart"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="col-span-4 bg-black text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all group"
                  >
                    Checkout
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MenuPage;
