
import React, { useState, useMemo } from 'react';
import { MenuItem, CartItem } from '../types';
import { Star, Clock, Info, Search, Filter, ChefHat, Plus, Minus, ShoppingBag } from 'lucide-react';

interface Props {
  items: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onUpdateCartQuantity: (id: string, delta: number) => void;
  onOpenCart: () => void;
}

const PublicMenu: React.FC<Props> = ({ items, cart, onAddToCart, onUpdateCartQuantity, onOpenCart }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(items.map(i => i.category))];
    return cats;
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter(i => i.category === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Search Header */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-gray-100 flex items-center justify-center">
        <div className="w-full lg:max-w-5xl flex items-center space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search for dishes..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-red-500 text-base"
            />
          </div>
          <button className="p-2.5 bg-gray-100 rounded-2xl btn-active">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Brand Info - Tightened Padding for Desktop */}
      <div className="px-4 py-6 md:py-8 lg:px-8 lg:max-w-5xl lg:mx-auto">
        <div className="flex justify-between items-start mb-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">FlavorFlow Kitchen</h1>
          <div className="bg-green-600 text-white px-2 py-1 rounded-lg flex items-center space-x-1 font-bold text-sm">
            <span>4.2</span>
            <Star className="w-3 h-3 fill-current" />
          </div>
        </div>
        <div className="flex flex-wrap items-center text-gray-500 text-sm gap-y-1 gap-x-3">
          <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" /> 25-30 mins</span>
          <span className="font-medium">Hyderabad, Telangana</span>
          <span className="text-red-600 font-bold">India</span>
        </div>
      </div>

      {/* Category Slider - Reduced padding and aligned */}
      <div className="sticky top-[125px] z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex justify-center">
        <div className="w-full lg:max-w-5xl flex overflow-x-auto no-scrollbar space-x-3 px-4 py-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-black transition-all btn-active ${
                selectedCategory === cat 
                ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/20' 
                : 'bg-gray-50 text-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid - Tightened space-y on Desktop */}
      <div className="px-4 py-6 space-y-10 md:space-y-14 md:px-8 lg:max-w-5xl lg:mx-auto">
        {items.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center">
            <ChefHat className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-xl font-black text-gray-800">Our kitchen is preparing!</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const cartItem = cart.find(ci => ci.id === item.id);
            const quantity = cartItem ? cartItem.quantity : 0;

            return (
              <div key={item.id} className="group flex justify-between items-start animate-in fade-in duration-500">
                <div className="flex-grow pr-4">
                  <div className={`w-4 h-4 border-2 p-[2px] mb-2 flex items-center justify-center rounded-sm ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                    <div className={`w-full h-full rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-gray-800">{item.title}</h3>
                  <div className="text-gray-900 font-bold text-lg mb-2">₹{item.price.toFixed(2)}</div>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 md:line-clamp-none">{item.description}</p>
                </div>
                
                <div className="relative flex-shrink-0 flex flex-col items-center">
                  <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-2xl overflow-hidden food-card-shadow border border-gray-100">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="mt-[-12px] z-10 flex flex-col items-center space-y-3">
                    {quantity > 0 ? (
                      <>
                        <div className="bg-white text-green-600 px-3 py-2 rounded-2xl font-black text-sm border border-gray-100 shadow-xl flex items-center justify-between min-w-[100px] ring-1 ring-gray-50">
                          <button onClick={() => onUpdateCartQuantity(item.id, -1)} className="p-1 active:scale-75 transition-all">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-gray-900 text-base">{quantity}</span>
                          <button onClick={() => onUpdateCartQuantity(item.id, 1)} className="p-1 active:scale-75 transition-all">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        {/* VIEW CART BUTTON BELOW QUANTITY SELECTOR */}
                        <button 
                          onClick={onOpenCart}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center space-x-1 animate-in zoom-in duration-300"
                        >
                          <ShoppingBag className="w-2.5 h-2.5" />
                          <span>View Cart</span>
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => onAddToCart(item)}
                        className="bg-white text-green-600 px-8 py-2.5 rounded-2xl font-black text-sm border border-gray-100 shadow-xl hover:bg-green-600 hover:text-white transition-all uppercase tracking-tight"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="px-4 py-10 bg-gray-50/50 border-t border-gray-100 mt-12 text-center">
        <div className="flex items-center justify-center space-x-2 text-gray-400">
          <Info className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Strict Hygiene Protocols</span>
        </div>
      </div>
    </div>
  );
};

export default PublicMenu;
