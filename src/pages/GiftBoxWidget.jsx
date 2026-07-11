import React, { useState, useEffect } from "react";
import { Gift, X, ShoppingBag, AlertTriangle } from "lucide-react";

export default function GiftBoxWidget({ onAddComboToCart }) {
  const [isOpen, setIsOpen] = useState(false);
  const [comboItems, setComboItems] = useState([]);
  const [boxStyle, setBoxStyle] = useState("matte-black");
  const [error, setError] = useState("");

  // 1. Refresh safe - Page load hote hi localStorage se data uthao
  useEffect(() => {
    const savedCombo = localStorage.getItem("wao_gift_combo");
    if (savedCombo) {
      setComboItems(JSON.parse(savedCombo));
    }

    // Custom event listener taake jab product page se item add ho, widget update ho jaye
    const handleStorageUpdate = () => {
      const updated = localStorage.getItem("wao_gift_combo");
      if (updated) setComboItems(JSON.parse(updated));
    };

    window.addEventListener("wao_combo_updated", handleStorageUpdate);
    return () => window.removeEventListener("wao_combo_updated", handleStorageUpdate);
  }, []);

  // 2. Item remove karne ka logic
  const handleRemoveItem = (uniqueId) => {
    const updatedCombo = comboItems.filter(item => item.uniqueId !== uniqueId);
    setComboItems(updatedCombo);
    localStorage.setItem("wao_gift_combo", JSON.stringify(updatedCombo));
  };

  // 3. Poore Combo ko standard Cart mein add karne ka logic
  const handleSendToCart = () => {
    if (comboItems.length === 0) {
      setError("Please add at least 1 item to your combo box.");
      return;
    }

    // Hum pure combo ko ek single customized product object bana kar main cart me bhejenge
    const comboBundle = {
      isCombo: true,
      boxType: boxStyle,
      items: comboItems,
      // Box customization ke charges agar lagane hon (e.g., 500 Rs flat for luxury box)
      boxPrice: boxStyle === "matte-black" ? 500 : boxStyle === "velvet" ? 800 : 300,
    };

    onAddComboToCart(comboBundle);
    
    // Clear combo after adding to cart
    setComboItems([]);
    localStorage.removeItem("wao_gift_combo");
    setIsOpen(false);
    alert("Your custom Gift Combo Box has been added to the shopping cart!");
  };

  // Max 5 items ki array loops ke liye helper
  const totalSlots = [0, 1, 2, 3, 4];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-orange-600 to-amber-500 text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-orange-400/30"
      >
        <Gift className="w-6 h-6 animate-pulse" />
        {comboItems.length > 0 && (
          <span className="absolute -top-2 -right-1 bg-rose-600 text-white font-mono font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce">
            {comboItems.length}
          </span>
        )}
        <span className="text-xs uppercase tracking-wider font-bold pr-2 hidden sm:inline">My Gift Combo</span>
      </button>

      {/* Expanded Box Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[80vh] overflow-y-auto backdrop-blur-md">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div>
              <h3 className="font-display font-extrabold text-white text-base flex items-center gap-2">
                <Gift className="w-4 h-4 text-orange-500" /> Build Your Box
              </h3>
              <p className="text-[10px] text-gray-500">Add up to 5 custom prints inside one gift pack.</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 5 Box Slots Grid View */}
          <div className="grid grid-cols-5 gap-2">
            {totalSlots.map((index) => {
              const item = comboItems[index];
              return (
                <div
                  key={index}
                  className="aspect-square bg-[#090d16] border border-dashed border-slate-800 rounded-xl flex items-center justify-center relative p-1 group"
                >
                  {item ? (
                    <>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain rounded"
                      />
                      <button
                        onClick={() => handleRemoveItem(item.uniqueId)}
                        className="absolute -top-1 -right-1 bg-slate-900 text-gray-400 hover:text-rose-500 p-0.5 rounded-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-800 font-mono text-[10px] font-bold">0{index + 1}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Box Style Selector */}
          {comboItems.length > 0 && (
            <div className="space-y-2 border-t border-slate-900 pt-4">
              <label className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Select Packaging Grade</label>
              <select
                value={boxStyle}
                onChange={(e) => setBoxStyle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5 outline-none focus:border-orange-500/50"
              >
                <option value="matte-black">Luxury Matte Black Box (+Rs. 500)</option>
                <option value="velvet">Premium Royal Velvet Box (+Rs. 800)</option>
                <option value="eco">Standard Craft Eco Box (+Rs. 300)</option>
              </select>
            </div>
          )}

          {error && (
            <p className="text-[10px] font-mono text-rose-500 bg-rose-950/10 border border-rose-900/30 p-2.5 rounded-xl flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
            </p>
          )}

          {/* Call to Action */}
          <button
            onClick={handleSendToCart}
            disabled={comboItems.length === 0}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 disabled:from-slate-900 disabled:to-slate-900 disabled:text-gray-600 disabled:border-slate-800 border border-transparent disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            Lock Box & Add To Cart
          </button>

        </div>
      )}
    </div>
  );
}