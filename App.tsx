
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { MenuItem, CartItem } from './types';
import MerchantDashboard from './components/MerchantDashboard';
import PublicMenu from './components/PublicMenu';
import { 
  ShoppingBag, ChevronRight, X, Plus, Minus, 
  Instagram, Twitter, Globe, MapPin, ArrowLeft, Store
} from 'lucide-react';

const App: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const savedItems = localStorage.getItem('flavorflow_items_v2');
    if (savedItems) {
      const parsed = JSON.parse(savedItems);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setItems(parsed);
      }
    }
  }, []);

  const saveItems = (newItems: MenuItem[]) => {
    setItems(newItems);
    localStorage.setItem('flavorflow_items_v2', JSON.stringify(newItems));
  };

  const addItem = (newItem: MenuItem) => {
    const updated = [newItem, ...items];
    saveItems(updated);
  };

  const deleteItem = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    saveItems(updated);
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

  // Constants for bill details
  const taxAmount = cartTotal * 0.05; // 5% tax

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-white">
        {/* Branding Nav - Optimized for Mobile Hub Visibility */}
        <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 h-16 border-b border-gray-100 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-1.5 shrink-0">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black heading-font tracking-tight text-red-600">FLAVORFLOW</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <Link 
              to="/admin" 
              className="text-[10px] sm:text-xs font-black uppercase text-gray-500 tracking-widest hover:text-red-600 flex items-center gap-1 py-2"
            >
              <Store className="w-4 h-4" />
              <span className="hidden xs:inline">Merchant</span>
              <span className="hidden sm:inline">Hub</span>
            </Link>
            
            {cartCount > 0 && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 shadow-lg shadow-green-600/20 active:scale-95 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="text-[11px] font-black uppercase tracking-tight">Cart</span>
              </button>
            )}
          </div>
        </nav>

        <main className="flex-grow">
          <Routes>
            <Route 
              path="/" 
              element={
                <PublicMenu 
                  items={items} 
                  cart={cart} 
                  onAddToCart={addToCart} 
                  onUpdateCartQuantity={updateCartQuantity}
                  onOpenCart={() => setIsCartOpen(true)}
                />
              } 
            />
            <Route path="/admin" element={<MerchantDashboard items={items} onAddItem={addItem} onDeleteItem={deleteItem} />} />
          </Routes>
        </main>

        {/* Footer Section */}
        <footer className={`bg-[#1C1C1C] text-white pt-16 px-4 sm:px-8 lg:px-16 pb-12`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-12 gap-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-black heading-font tracking-tight">FLAVORFLOW</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <button className="flex items-center space-x-2 border border-white/20 px-4 py-2 rounded-xl text-sm font-bold">
                  <Globe className="w-4 h-4" />
                  <span>English</span>
                </button>
                <button className="flex items-center space-x-2 border border-white/20 px-4 py-2 rounded-xl text-sm font-bold">
                  <MapPin className="w-4 h-4" />
                  <span>India</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
              <div className="space-y-4 text-gray-400 text-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">About</h4>
                <p>Who We Are</p><p>Blog</p><p>Careers</p>
              </div>
              <div className="space-y-4 text-gray-400 text-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Merchant</h4>
                <Link to="/admin" className="block">Admin Dashboard</Link>
                <Link to="/admin" className="block">Add New Dish</Link>
                <p>Support</p>
              </div>
              <div className="space-y-4 text-gray-400 text-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Legal</h4>
                <p>Privacy Policy</p><p>Terms of Service</p>
              </div>
              <div className="space-y-4 text-gray-400 text-sm">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Support</h4>
                <p>Contact Us</p><p>FAQs</p>
              </div>
              <div className="space-y-4 col-span-2 lg:col-span-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Social</h4>
                <div className="flex space-x-3">
                  <button className="bg-white/10 p-2 rounded-full"><Instagram className="w-5 h-5" /></button>
                  <button className="bg-white/10 p-2 rounded-full"><Twitter className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-xs text-gray-500 font-medium">
              2024-2025 © FlavorFlow™ Ltd. All rights reserved.
            </div>
          </div>
        </footer>

        {/* CART MODAL */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] bg-white flex flex-col h-full animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="px-4 h-16 flex items-center justify-between border-b border-gray-100">
              <button onClick={() => setIsCartOpen(false)} className="p-2 -ml-2 text-gray-800">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-red-600">Cart</h1>
              <div className="w-10"></div>
            </div>

            <div className="flex-grow overflow-y-auto">
              {cart.length > 0 && (
                <div className="p-6 flex items-start space-x-4 border-b border-gray-50">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm">
                    <img src={cart[0].imageUrl} className="w-full h-full object-cover" alt="Store item" />
                  </div>
                  <div className="pt-1">
                    <h2 className="text-lg font-black text-gray-900 leading-tight">FlavorFlow Kitchen</h2>
                    <p className="text-gray-400 text-xs font-medium mt-1">Gourmet Meals, Beverages</p>
                  </div>
                </div>
              )}

              <div className="p-4 space-y-8">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                    <p className="text-gray-400 font-bold">Your cart is empty</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 bg-red-600 text-white px-6 py-2 rounded-xl font-bold"
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="relative">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-grow pr-4">
                           <div className={`mt-1.5 w-4 h-4 border-2 p-[2px] flex items-center justify-center rounded-sm shrink-0 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                             <div className={`w-full h-full rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                           </div>
                           <div>
                             <h4 className="font-bold text-gray-800 leading-snug">{item.title}</h4>
                             <button className="text-red-500 text-xs font-bold mt-2 uppercase tracking-wide">View Info</button>
                           </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-4">
                           <span className="font-bold text-gray-700">₹{(item.price * item.quantity).toFixed(2)}</span>
                           <div className="flex items-center bg-red-600 text-white rounded-lg overflow-hidden h-9 shadow-md">
                              <button onClick={() => updateCartQuantity(item.id, -1)} className="w-10 flex items-center justify-center hover:bg-red-700 active:scale-90">
                                <Minus className="w-4 h-4" />
                              </button>
                              <div className="bg-white text-red-600 h-full w-8 flex items-center justify-center font-black text-sm">
                                {item.quantity}
                              </div>
                              <button onClick={() => updateCartQuantity(item.id, 1)} className="w-10 flex items-center justify-center hover:bg-red-700 active:scale-90">
                                <Plus className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 mt-4 border-t border-gray-100 bg-gray-50/50 space-y-4">
                  <div className="flex justify-between text-gray-600 text-base font-medium">
                    <span>Item Total</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-base font-medium">
                    <span>Tax (GST)</span>
                    <span>₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-base font-medium">
                    <span>Delivery Charges</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-lg font-black text-gray-900">Total Paid</span>
                    <span className="text-lg font-black text-gray-900">₹{(cartTotal + taxAmount).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-white">
                <button className="w-full bg-red-600 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-red-600/20 active:scale-[0.98] transition-all">
                   Check Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </HashRouter>
  );
};

export default App;
