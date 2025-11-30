import React, { useState, useEffect, useMemo } from 'react';
import { Item, Shop } from './types';
import { GROCERY_ITEMS, CATEGORIES } from './constants';
import { fetchShopPrices } from './services/geminiService';
import ProductCard from './components/ProductCard';
import ShopModal from './components/ShopModal';
import LocationModal from './components/LocationModal';

const App: React.FC = () => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userLocation, setUserLocation] = useState('T. Nagar, Chennai'); // Default
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Derived state (filtering)
  const filteredItems = useMemo(() => {
    return GROCERY_ITEMS.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Handlers
  const handleLocationClick = () => {
    setIsLocationModalOpen(true);
  };

  const handleLocationSelect = (location: string) => {
    setUserLocation(location);
    setIsLocationModalOpen(false);
  };

  const handleItemClick = async (item: Item) => {
    setSelectedItem(item);
    setIsLoadingShops(true);
    setShops([]); // Clear previous

    try {
      const results = await fetchShopPrices(item.name, userLocation);
      setShops(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingShops(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setShops([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Navbar / Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-yellow-400 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                <i className="fas fa-shopping-basket"></i>
              </div>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight hidden sm:block">
                Namma<span className="text-orange-600">Grocery</span>
              </h1>
            </div>

            {/* Location Selector */}
            <div 
              className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5 cursor-pointer hover:bg-orange-50 hover:text-orange-700 hover:ring-1 hover:ring-orange-200 transition-all" 
              onClick={handleLocationClick}
            >
              <i className="fas fa-map-marker-alt text-orange-500"></i>
              <span className="text-sm font-medium text-gray-700 truncate max-w-[120px] sm:max-w-xs">
                {userLocation.split(',')[0]}
              </span>
              <i className="fas fa-chevron-down text-xs text-gray-400"></i>
            </div>
            
          </div>
        </div>

        {/* Search Bar Container */}
        <div className="bg-white border-b border-gray-100 pb-4 px-4 sm:px-6 lg:px-8 pt-2">
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all shadow-sm"
              placeholder="Search for items (e.g., Sambar Powder, Idli Rice)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories (Horizontal Scroll) */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto no-scrollbar flex items-center gap-2">
             {CATEGORIES.map(cat => (
               <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat 
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
               >
                 {cat}
               </button>
             ))}
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {searchTerm ? `Results for "${searchTerm}"` : `${selectedCategory} Items`}
          </h2>
          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
            {filteredItems.length} items found
          </span>
        </div>

        {/* Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <ProductCard 
                key={item.id} 
                item={item} 
                onClick={handleItemClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block p-6 rounded-full bg-gray-100 mb-4">
               <i className="fas fa-search text-gray-400 text-3xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter.</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
              className="mt-4 text-orange-600 font-medium hover:text-orange-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="text-sm text-gray-500">
               &copy; {new Date().getFullYear()} Namma Grocery. All rights reserved.
             </div>
             <div className="flex gap-6">
               <a href="#" className="text-gray-400 hover:text-orange-600 transition-colors"><i className="fab fa-facebook"></i></a>
               <a href="#" className="text-gray-400 hover:text-orange-600 transition-colors"><i className="fab fa-twitter"></i></a>
               <a href="#" className="text-gray-400 hover:text-orange-600 transition-colors"><i className="fab fa-instagram"></i></a>
             </div>
          </div>
        </div>
      </footer>

      {/* Shop Modal Layer */}
      {selectedItem && (
        <ShopModal 
          item={selectedItem}
          shops={shops}
          onClose={handleCloseModal}
          isLoading={isLoadingShops}
          location={userLocation}
        />
      )}

      {/* Location Modal Layer */}
      {isLocationModalOpen && (
        <LocationModal
          currentLocation={userLocation}
          onSelect={handleLocationSelect}
          onClose={() => setIsLocationModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;