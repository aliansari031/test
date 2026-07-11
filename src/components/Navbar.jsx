import React, { useState, useEffect } from "react";
import { ShoppingCart, User as UserIcon, Menu, X, LogOut, LayoutDashboard, Gift, Trash2, ArrowRight } from "lucide-react";
import { UserRole } from "../types.js";
import waoLogo from "./waologo.png";
import waolog from "./waolog.png";

export default function Navbar({
  currentTab,
  onTabChange,
  cartCount,
  user,
  onLogout,
  onAddComboToCart // Pipeline function to receive complete combo array
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Real-time local state to track combo data across entire app UI
  const [comboItems, setComboItems] = useState([]);
  const [isComboDropdownOpen, setIsComboDropdownOpen] = useState(false);

  // Sync combo bucket dynamically using custom windows event pipeline
  useEffect(() => {
    const syncCombo = () => {
      const data = JSON.parse(localStorage.getItem("wao_gift_combo")) || [];
      setComboItems(data);
    };
    syncCombo();

    window.addEventListener("wao_combo_updated", syncCombo);
    return () => window.removeEventListener("wao_combo_updated", syncCombo);
  }, []);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "services", label: "Services" },
    { id: "portfolio", label: "Portfolio" },
    { id: "shop", label: "Shop" },
    { id: "about", label: "About" }
  ];

  const handleNavClick = (tabId) => {
    onTabChange(tabId);
    setIsOpen(false);
    setIsComboDropdownOpen(false);
  };

  const handleRemoveComboItem = (e, uniqueId) => {
    e.stopPropagation();
    const updated = comboItems.filter(item => item.uniqueId !== uniqueId);
    localStorage.setItem("wao_gift_combo", JSON.stringify(updated));
    window.dispatchEvent(new Event("wao_combo_updated"));
  };

  const handlePushComboToCart = () => {
    if (comboItems.length === 0) return;
    const totalComboPrice = comboItems.reduce((acc, item) => acc + item.price, 0);
    
    if (onAddComboToCart) {
      onAddComboToCart(comboItems, totalComboPrice);
    } else {
      // Fallback safe push if main bridge array is working in background state
      alert("Combo Box items verified! Proceeding with layout pipeline checkout.");
    }
    
    setIsComboDropdownOpen(false);
  };

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand Identity */}
          <div 
            onClick={() => handleNavClick("home")}
            className="flex items-center gap-3 cursor-pointer group"
            id="nav-logo"
          >

{/* <div className="flex items-center cursor-pointer" onClick={() => onTabChange("home")}>
  <img 
    src={waoLogo} 
    alt="WAO PRINTS" 
    className="h-12 sm:h-14 w-auto object-contain rounded-2xl" 
  />
</div>
<div>
  <div className="font-display font-extrabold tracking-wider text-xl flex items-center gap-1 text-white">
    WAO <span className="logo-gradient-text">PRINTS</span>
  </div>
   <p 
    style={{ fontFamily: 'BrittanySignature' }} 
    className="text-[14px] text-gray-400 normal-case tracking-normal"
  >
    Print Like a Waooooo!
  </p>
</div>
</div> */}

<div className="flex items-center cursor-pointer" onClick={() => onTabChange("home")}>
  <img 
    src={waoLogo} 
    alt="WAO PRINTS" 
    className="h-12 sm:h-14 w-auto object-contain rounded-2xl" 
  />
</div>
<div>
   <div 
    style={{ fontFamily: 'NewMillenniumSans' }} 
    className="font-extrabold tracking-wider text-xl flex items-center gap-1 text-white"
  >
    <img 
      src={waolog} 
      alt="WAO PRINTS" 
      className="h-5 w-auto object-contain  mb-2" 
    />
    <span className="logo-gradient-text">PRINTS</span>
  </div>
  
   <p 
    style={{ fontFamily: 'BrittanySignature' }} 
    className="text-[14px] text-gray-400 normal-case tracking-normal"
  >
    Print Like a Waooooo!
  </p>
</div>
</div>

 

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`font-medium text-sm tracking-wide transition-colors relative py-2 ${
                  currentTab === item.id 
                    ? "text-orange-500 font-semibold" 
                    : "text-gray-300 hover:text-white"
                }`}
                id={`nav-item-${item.id}`}
              >
                {item.label}
                {currentTab === item.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Action Buttons (Gift Box, Cart, User) */}
          <div className="hidden md:flex items-center gap-5 relative">
            
            {/* LIVE UI COMBO DROPDOWN COMPONENT */}
            <div className="relative">
              <button
                onClick={() => setIsComboDropdownOpen(!isComboDropdownOpen)}
                className={`p-2.5 transition-colors relative hover:scale-105 duration-200 cursor-pointer ${
                  isComboDropdownOpen ? "text-orange-500" : "text-gray-300 hover:text-orange-500"
                }`}
                title="Your Gift Combo Box"
                id="nav-combo-box-toggle"
              >
                <Gift className="w-5 h-5" />
                {comboItems.length > 0 && (
                  <span className="absolute top-1 right-1 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {comboItems.length}
                  </span>
                )}
              </button>

              {/* Combo items dropdown sheet container */}
              {isComboDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#090e1a] border border-slate-900 rounded-2xl shadow-2xl p-4 space-y-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-orange-500" /> Gift Box ({comboItems.length}/5)
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">Max 5 Items</span>
                  </div>

                  {comboItems.length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic text-center py-4">Box khali hai! Shop se custom items add karein.</p>
                  ) : (
                    <>
                      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {comboItems.map((item) => (
                          <div key={item.uniqueId} className="flex items-center justify-between bg-slate-950/60 border border-slate-900/80 p-2 rounded-xl gap-2">
                            <div className="w-10 h-10 bg-[#060a12] rounded-lg border border-slate-900 p-1 flex items-center justify-center shrink-0">
                              <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-[11px] font-semibold truncate">{item.name}</p>
                              <p className="text-orange-500 font-mono text-[10px]">Rs. {item.price.toLocaleString('en-PK')}</p>
                            </div>
                            <button
                              onClick={(e) => handleRemoveComboItem(e, item.uniqueId)}
                              className="text-gray-500 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handlePushComboToCart}
                        className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all"
                      >
                        Push Combo Box to Cart
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart */}
            <button 
              onClick={() => handleNavClick("cart")}
              className="p-2.5 text-gray-300 hover:text-orange-500 transition-colors relative hover:scale-105 duration-200"
              title="Shopping Cart"
              id="nav-cart-btn"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-orange-500 text-white font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile / Dashboard Quick Access */}
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavClick(user.role === UserRole.ADMIN ? "admin" : "dashboard")}
                  className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-semibold text-gray-200 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-200 cursor-pointer shadow-sm shadow-black/10"
                  id="nav-dashboard-btn"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-orange-500" />
                  {user.role === UserRole.ADMIN ? "Admin Hub" : "My Account"}
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 bg-slate-800/40 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 rounded-xl text-gray-400 hover:text-rose-500 transition-all duration-200 cursor-pointer"
                  title="Logout"
                  id="nav-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick("login")}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
                id="nav-signin-btn"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex items-center gap-4 md:hidden">
            {/* Mobile Gift Box Counter Shortcut */}
            <button
              onClick={() => handleNavClick("cart")}
              className="p-2 text-gray-300 hover:text-orange-500 relative"
            >
              <Gift className="w-5.5 h-5.5" />
              {comboItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-orange-500 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {comboItems.length}
                </span>
              )}
            </button>

            {/* Cart Icon Mobile */}
            <button 
              onClick={() => handleNavClick("cart")}
              className="p-2 text-gray-300 hover:text-orange-500 relative"
            >
              <ShoppingCart className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-orange-500 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-400 hover:text-white rounded-xl bg-slate-800/50 border border-slate-700/50"
              id="mobile-menu-toggle"
            >
              {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="md:hidden bg-[#0c111e]/95 backdrop-blur-2xl border-b border-slate-800/80 px-4 pt-2 pb-6 space-y-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                currentTab === item.id 
                  ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" 
                  : "text-gray-300 hover:bg-slate-800/40 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            {user ? (
              <div className="space-y-2 px-4">
                <p className="text-xs text-gray-400">Signed in as <span className="text-white font-medium">{user.name}</span></p>
                <button
                  onClick={() => handleNavClick(user.role === UserRole.ADMIN ? "admin" : "dashboard")}
                  className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-xs font-bold text-gray-200 border border-slate-700"
                >
                  <LayoutDashboard className="w-4 h-4 text-orange-500" />
                  {user.role === UserRole.ADMIN ? "Admin Dashboard" : "My Dashboard"}
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center gap-2 w-full bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 py-3 rounded-xl text-xs font-bold border border-rose-900/40"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="px-4">
                <button
                  onClick={() => handleNavClick("login")}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-600 to-amber-500 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-orange-500/10"
                >
                  <UserIcon className="w-4 h-4" />
                  Sign In / Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}





















// import React, { useState, useEffect } from "react";
// import { ShoppingCart, Heart, User as UserIcon, Menu, X, LogOut, LayoutDashboard, Gift, Trash2, ArrowRight } from "lucide-react";
// import { UserRole } from "../types.js";

// export default function Navbar({
//   currentTab,
//   onTabChange,
//   cartCount,
//   wishlistCount,
//   user,
//   onLogout,
//   onAddComboToCart // Pipeline function to receive complete combo array
// }) {
//   const [isOpen, setIsOpen] = useState(false);
  
//   // Real-time local state to track combo data across entire app UI
//   const [comboItems, setComboItems] = useState([]);
//   const [isComboDropdownOpen, setIsComboDropdownOpen] = useState(false);

//   // Sync combo bucket dynamically using custom windows event pipeline
//   useEffect(() => {
//     const syncCombo = () => {
//       const data = JSON.parse(localStorage.getItem("wao_gift_combo")) || [];
//       setComboItems(data);
//     };
//     syncCombo();

//     window.addEventListener("wao_combo_updated", syncCombo);
//     return () => window.removeEventListener("wao_combo_updated", syncCombo);
//   }, []);

//   const navItems = [
//     { id: "home", label: "Home" },
//     { id: "services", label: "Services" },
//     { id: "portfolio", label: "Portfolio" },
//     { id: "shop", label: "Shop" },
//     { id: "about", label: "About" }
//   ];

//   const handleNavClick = (tabId) => {
//     onTabChange(tabId);
//     setIsOpen(false);
//     setIsComboDropdownOpen(false);
//   };

//   const handleRemoveComboItem = (e, uniqueId) => {
//     e.stopPropagation(); // Avoid dropdown trigger closures
//     const updated = comboItems.filter(item => item.uniqueId !== uniqueId);
//     localStorage.setItem("wao_gift_combo", JSON.stringify(updated));
//     window.dispatchEvent(new Event("wao_combo_updated"));
//   };

//   const handlePushComboToCart = () => {
//     if (comboItems.length === 0) return;
//     const totalComboPrice = comboItems.reduce((acc, item) => acc + item.price, 0);
    
//     if (onAddComboToCart) {
//       onAddComboToCart(comboItems, totalComboPrice);
//     } else {
//        alert("Combo Box items verified! Proceeding with layout pipeline checkout.");
//     }
    
//     setIsComboDropdownOpen(false);
//   };

//   return (
//     <nav className="glass-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-20">
          
//           {/* Logo Brand Identity */}
//           <div 
//             onClick={() => handleNavClick("home")}
//             className="flex items-center gap-3 cursor-pointer group"
//             id="nav-logo"
//           >
//             <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/10 group-hover:scale-105 transition-transform duration-200">
//               <span className="font-display font-extrabold text-white text-xl">W</span>
//               <div className="absolute -top-1.5 -right-1.5 flex gap-0.5">
//                 <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-900"></span>
//                 <span className="w-2.5 h-2.5 rounded-full bg-pink-500 border border-slate-900"></span>
//                 <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-slate-900"></span>
//               </div>
//             </div>
//             <div>
//               <div className="font-display font-extrabold tracking-wider text-xl flex items-center gap-1 text-white">
//                 WAO <span className="logo-gradient-text">PRINTS</span>
//               </div>
//               <p className="text-[9px] uppercase tracking-[0.25em] text-gray-400 font-mono">Print Like A Waoo</p>
//             </div>
//           </div>

//           {/* Desktop Navigation Links */}
//           <div className="hidden md:flex items-center gap-8">
//             {navItems.map((item) => (
//               <button
//                 key={item.id}
//                 onClick={() => handleNavClick(item.id)}
//                 className={`font-medium text-sm tracking-wide transition-colors relative py-2 ${
//                   currentTab === item.id 
//                     ? "text-orange-500 font-semibold" 
//                     : "text-gray-300 hover:text-white"
//                 }`}
//                 id={`nav-item-${item.id}`}
//               >
//                 {item.label}
//                 {currentTab === item.id && (
//                   <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
//                 )}
//               </button>
//             ))}
//           </div>

//           {/* Action Buttons (Gift Box, Wishlist, Cart, User) */}
//           <div className="hidden md:flex items-center gap-5 relative">
            
//             {/* LIVE UI COMBO DROPDOWN COMPONENT */}
//             <div className="relative">
//               <button
//                 onClick={() => setIsComboDropdownOpen(!isComboDropdownOpen)}
//                 className={`p-2.5 transition-colors relative hover:scale-105 duration-200 cursor-pointer ${
//                   isComboDropdownOpen ? "text-orange-500" : "text-gray-300 hover:text-orange-500"
//                 }`}
//                 title="Your Gift Combo Box"
//                 id="nav-combo-box-toggle"
//               >
//                 <Gift className="w-5 h-5" />
//                 {comboItems.length > 0 && (
//                   <span className="absolute top-1 right-1 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
//                     {comboItems.length}
//                   </span>
//                 )}
//               </button>

//               {/* Combo items dropdown sheet container */}
//               {isComboDropdownOpen && (
//                 <div className="absolute right-0 mt-3 w-80 bg-[#090e1a] border border-slate-900 rounded-2xl shadow-2xl p-4 space-y-4 z-50 animate-fade-in">
//                   <div className="flex items-center justify-between border-b border-slate-900 pb-2">
//                     <span className="text-xs font-bold text-white flex items-center gap-1">
//                       <Gift className="w-3.5 h-3.5 text-orange-500" /> Gift Box ({comboItems.length}/5)
//                     </span>
//                     <span className="text-[10px] font-mono text-gray-500">Max 5 Items</span>
//                   </div>

//                   {comboItems.length === 0 ? (
//                     <p className="text-[11px] text-gray-400 italic text-center py-4">Box khali hai! Shop se custom items add karein.</p>
//                   ) : (
//                     <>
//                       <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
//                         {comboItems.map((item) => (
//                           <div key={item.uniqueId} className="flex items-center justify-between bg-slate-950/60 border border-slate-900/80 p-2 rounded-xl gap-2">
//                             <div className="w-10 h-10 bg-[#060a12] rounded-lg border border-slate-900 p-1 flex items-center justify-center shrink-0">
//                               <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
//                             </div>
//                             <div className="flex-1 min-w-0">
//                               <p className="text-white text-[11px] font-semibold truncate">{item.name}</p>
//                               <p className="text-orange-500 font-mono text-[10px]">Rs. {item.price.toLocaleString('en-PK')}</p>
//                             </div>
//                             <button
//                               onClick={(e) => handleRemoveComboItem(e, item.uniqueId)}
//                               className="text-gray-500 hover:text-rose-500 p-1 cursor-pointer transition-colors"
//                             >
//                               <Trash2 className="w-3.5 h-3.5" />
//                             </button>
//                           </div>
//                         ))}
//                       </div>

//                       <button
//                         onClick={handlePushComboToCart}
//                         className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg transition-all"
//                       >
//                         Push Combo Box to Cart
//                         <ArrowRight className="w-3.5 h-3.5" />
//                       </button>
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Wishlist */}
//             <button 
//               onClick={() => handleNavClick("dashboard")}
//               className="p-2.5 text-gray-300 hover:text-orange-500 transition-colors relative hover:scale-105 duration-200"
//               title="Saved Designs / Wishlist"
//               id="nav-wishlist-btn"
//             >
//               <Heart className="w-5 h-5" />
//               {wishlistCount > 0 && (
//                 <span className="absolute top-1 right-1 bg-rose-500 text-white font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
//                   {wishlistCount}
//                 </span>
//               )}
//             </button>

//             {/* Shopping Cart */}
//             <button 
//               onClick={() => handleNavClick("cart")}
//               className="p-2.5 text-gray-300 hover:text-orange-500 transition-colors relative hover:scale-105 duration-200"
//               title="Shopping Cart"
//               id="nav-cart-btn"
//             >
//               <ShoppingCart className="w-5 h-5" />
//               {cartCount > 0 && (
//                 <span className="absolute top-1 right-1 bg-orange-500 text-white font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
//                   {cartCount}
//                 </span>
//               )}
//             </button>

//             {/* Profile / Dashboard Quick Access */}
//             {user ? (
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={() => handleNavClick(user.role === UserRole.ADMIN ? "admin" : "dashboard")}
//                   className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-semibold text-gray-200 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-200 cursor-pointer shadow-sm shadow-black/10"
//                   id="nav-dashboard-btn"
//                 >
//                   <LayoutDashboard className="w-3.5 h-3.5 text-orange-500" />
//                   {user.role === UserRole.ADMIN ? "Admin Hub" : "My Account"}
//                 </button>
//                 <button
//                   onClick={onLogout}
//                   className="p-2 bg-slate-800/40 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 rounded-xl text-gray-400 hover:text-rose-500 transition-all duration-200 cursor-pointer"
//                   title="Logout"
//                   id="nav-logout-btn"
//                 >
//                   <LogOut className="w-4 h-4" />
//                 </button>
//               </div>
//             ) : (
//               <button
//                 onClick={() => handleNavClick("login")}
//                 className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
//                 id="nav-signin-btn"
//               >
//                 <UserIcon className="w-3.5 h-3.5" />
//                 Sign In
//               </button>
//             )}
//           </div>

//           {/* Mobile Menu Icon */}
//           <div className="flex items-center gap-4 md:hidden">
//             {/* Mobile Gift Box Counter Shortcut */}
//             <button
//               onClick={() => handleNavClick("cart")}
//               className="p-2 text-gray-300 hover:text-orange-500 relative"
//             >
//               <Gift className="w-5.5 h-5.5" />
//               {comboItems.length > 0 && (
//                 <span className="absolute top-1 right-1 bg-orange-500 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
//                   {comboItems.length}
//                 </span>
//               )}
//             </button>

//             {/* Cart Icon Mobile */}
//             <button 
//               onClick={() => handleNavClick("cart")}
//               className="p-2 text-gray-300 hover:text-orange-500 relative"
//             >
//               <ShoppingCart className="w-5.5 h-5.5" />
//               {cartCount > 0 && (
//                 <span className="absolute top-1 right-1 bg-orange-500 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
//                   {cartCount}
//                 </span>
//               )}
//             </button>

//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="p-2 text-gray-400 hover:text-white rounded-xl bg-slate-800/50 border border-slate-700/50"
//               id="mobile-menu-toggle"
//             >
//               {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
//             </button>
//           </div>

//         </div>
//       </div>

//       {/* Mobile Drawer Navigation */}
//       {isOpen && (
//         <div className="md:hidden bg-[#0c111e]/95 backdrop-blur-2xl border-b border-slate-800/80 px-4 pt-2 pb-6 space-y-3">
//           {navItems.map((item) => (
//             <button
//               key={item.id}
//               onClick={() => handleNavClick(item.id)}
//               className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
//                 currentTab === item.id 
//                   ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" 
//                   : "text-gray-300 hover:bg-slate-800/40 hover:text-white"
//               }`}
//             >
//               {item.label}
//             </button>
//           ))}
//           <div className="pt-4 border-t border-slate-800/80 space-y-3">
//             {user ? (
//               <div className="space-y-2 px-4">
//                 <p className="text-xs text-gray-400">Signed in as <span className="text-white font-medium">{user.name}</span></p>
//                 <button
//                   onClick={() => handleNavClick(user.role === UserRole.ADMIN ? "admin" : "dashboard")}
//                   className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-xs font-bold text-gray-200 border border-slate-700"
//                 >
//                   <LayoutDashboard className="w-4 h-4 text-orange-500" />
//                   {user.role === UserRole.ADMIN ? "Admin Dashboard" : "My Dashboard"}
//                 </button>
//                 <button
//                   onClick={onLogout}
//                   className="flex items-center justify-center gap-2 w-full bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 py-3 rounded-xl text-xs font-bold border border-rose-900/40"
//                 >
//                   <LogOut className="w-4 h-4" />
//                   Sign Out
//                 </button>
//               </div>
//             ) : (
//               <div className="px-4">
//                 <button
//                   onClick={() => handleNavClick("login")}
//                   className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-600 to-amber-500 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-orange-500/10"
//                 >
//                   <UserIcon className="w-4 h-4" />
//                   Sign In / Create Account
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }














// import React, { useState } from "react";
// import { ShoppingCart, Heart, User as UserIcon, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
// import { UserRole } from "../types.js";

// export default function Navbar({
//   currentTab,
//   onTabChange,
//   cartCount,
//   wishlistCount,
//   user,
//   onLogout
// }) {
//   const [isOpen, setIsOpen] = useState(false);

//   const navItems = [
//     { id: "home", label: "Home" },
//     { id: "services", label: "Services" },
//     { id: "portfolio", label: "Portfolio" },
//     { id: "shop", label: "Shop" },
//     { id: "about", label: "About" }
//   ];

//   const handleNavClick = (tabId) => {
//     onTabChange(tabId);
//     setIsOpen(false);
//   };

//   return (
//     <nav className="glass-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-20">
          
//           {/* Logo Brand Identity */}
//           <div 
//             onClick={() => handleNavClick("home")}
//             className="flex items-center gap-3 cursor-pointer group"
//             id="nav-logo"
//           >
//             <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/10 group-hover:scale-105 transition-transform duration-200">
//               <span className="font-display font-extrabold text-white text-xl">W</span>
//               {/* Crown indicator resembling CMYK printer rollers */}
//               <div className="absolute -top-1.5 -right-1.5 flex gap-0.5">
//                 <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-900"></span>
//                 <span className="w-2.5 h-2.5 rounded-full bg-pink-500 border border-slate-900"></span>
//                 <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-slate-900"></span>
//               </div>
//             </div>
//             <div>
//               <div className="font-display font-extrabold tracking-wider text-xl flex items-center gap-1 text-white">
//                 WAO <span className="logo-gradient-text">PRINTS</span>
//               </div>
//               <p className="text-[9px] uppercase tracking-[0.25em] text-gray-400 font-mono">Print Like A Waoo</p>
//             </div>
//           </div>

//           {/* Desktop Navigation Links */}
//           <div className="hidden md:flex items-center gap-8">
//             {navItems.map((item) => (
//               <button
//                 key={item.id}
//                 onClick={() => handleNavClick(item.id)}
//                 className={`font-medium text-sm tracking-wide transition-colors relative py-2 ${
//                   currentTab === item.id 
//                     ? "text-orange-500 font-semibold" 
//                     : "text-gray-300 hover:text-white"
//                 }`}
//                 id={`nav-item-${item.id}`}
//               >
//                 {item.label}
//                 {currentTab === item.id && (
//                   <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
//                 )}
//               </button>
//             ))}
//           </div>

//           {/* Action Buttons (Cart, Wishlist, User) */}
//           <div className="hidden md:flex items-center gap-5">
//             {/* Wishlist */}
//             <button 
//               onClick={() => handleNavClick("dashboard")}
//               className="p-2.5 text-gray-300 hover:text-orange-500 transition-colors relative hover:scale-105 duration-200"
//               title="Saved Designs / Wishlist"
//               id="nav-wishlist-btn"
//             >
//               <Heart className="w-5 h-5" />
//               {wishlistCount > 0 && (
//                 <span className="absolute top-1 right-1 bg-rose-500 text-white font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
//                   {wishlistCount}
//                 </span>
//               )}
//             </button>

//             {/* Shopping Cart */}
//             <button 
//               onClick={() => handleNavClick("cart")}
//               className="p-2.5 text-gray-300 hover:text-orange-500 transition-colors relative hover:scale-105 duration-200"
//               title="Shopping Cart"
//               id="nav-cart-btn"
//             >
//               <ShoppingCart className="w-5 h-5" />
//               {cartCount > 0 && (
//                 <span className="absolute top-1 right-1 bg-orange-500 text-white font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
//                   {cartCount}
//                 </span>
//               )}
//             </button>

//             {/* Profile / Dashboard Quick Access */}
//             {user ? (
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={() => handleNavClick(user.role === UserRole.ADMIN ? "admin" : "dashboard")}
//                   className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-semibold text-gray-200 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-200 cursor-pointer shadow-sm shadow-black/10"
//                   id="nav-dashboard-btn"
//                 >
//                   <LayoutDashboard className="w-3.5 h-3.5 text-orange-500" />
//                   {user.role === UserRole.ADMIN ? "Admin Hub" : "My Account"}
//                 </button>
//                 <button
//                   onClick={onLogout}
//                   className="p-2 bg-slate-800/40 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 rounded-xl text-gray-400 hover:text-rose-500 transition-all duration-200 cursor-pointer"
//                   title="Logout"
//                   id="nav-logout-btn"
//                 >
//                   <LogOut className="w-4 h-4" />
//                 </button>
//               </div>
//             ) : (
//               <button
//                 onClick={() => handleNavClick("login")}
//                 className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
//                 id="nav-signin-btn"
//               >
//                 <UserIcon className="w-3.5 h-3.5" />
//                 Sign In
//               </button>
//             )}
//           </div>

//           {/* Mobile Menu Icon */}
//           <div className="flex items-center gap-4 md:hidden">
//             {/* Cart Icon Mobile */}
//             <button 
//               onClick={() => handleNavClick("cart")}
//               className="p-2 text-gray-300 hover:text-orange-500 relative"
//             >
//               <ShoppingCart className="w-5.5 h-5.5" />
//               {cartCount > 0 && (
//                 <span className="absolute top-1 right-1 bg-orange-500 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
//                   {cartCount}
//                 </span>
//               )}
//             </button>

//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="p-2 text-gray-400 hover:text-white rounded-xl bg-slate-800/50 border border-slate-700/50"
//               id="mobile-menu-toggle"
//             >
//               {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
//             </button>
//           </div>

//         </div>
//       </div>

//       {/* Mobile Drawer Navigation */}
//       {isOpen && (
//         <div className="md:hidden bg-[#0c111e]/95 backdrop-blur-2xl border-b border-slate-800/80 px-4 pt-2 pb-6 space-y-3">
//           {navItems.map((item) => (
//             <button
//               key={item.id}
//               onClick={() => handleNavClick(item.id)}
//               className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
//                 currentTab === item.id 
//                   ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" 
//                   : "text-gray-300 hover:bg-slate-800/40 hover:text-white"
//               }`}
//             >
//               {item.label}
//             </button>
//           ))}
//           <div className="pt-4 border-t border-slate-800/80 space-y-3">
//             {user ? (
//               <div className="space-y-2 px-4">
//                 <p className="text-xs text-gray-400">Signed in as <span className="text-white font-medium">{user.name}</span></p>
//                 <button
//                   onClick={() => handleNavClick(user.role === UserRole.ADMIN ? "admin" : "dashboard")}
//                   className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-xs font-bold text-gray-200 border border-slate-700"
//                 >
//                   <LayoutDashboard className="w-4 h-4 text-orange-500" />
//                   {user.role === UserRole.ADMIN ? "Admin Dashboard" : "My Dashboard"}
//                 </button>
//                 <button
//                   onClick={onLogout}
//                   className="flex items-center justify-center gap-2 w-full bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 py-3 rounded-xl text-xs font-bold border border-rose-900/40"
//                 >
//                   <LogOut className="w-4 h-4" />
//                   Sign Out
//                 </button>
//               </div>
//             ) : (
//               <div className="px-4">
//                 <button
//                   onClick={() => handleNavClick("login")}
//                   className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-600 to-amber-500 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-orange-500/10"
//                 >
//                   <UserIcon className="w-4 h-4" />
//                   Sign In / Create Account
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }
















// import React, { useState } from "react";
// import { ShoppingCart, Heart, User as UserIcon, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
// import { UserRole } from "../types.js";

// export default function Navbar({
//   currentTab,
//   onTabChange,
//   cartCount,
//   wishlistCount,
//   user,
//   onLogout
// }) {
//   const [isOpen, setIsOpen] = useState(false);

//   const navItems = [
//     { id: "home", label: "Home" },
//     { id: "services", label: "Services" },
//     { id: "portfolio", label: "Portfolio" },
//     { id: "shop", label: "Shop" },
//     { id: "about", label: "About" },
//     { id: "track-order", label: "Track Order" }
//   ];

//   const handleNavClick = (tabId) => {
//     onTabChange(tabId);
//     setIsOpen(false);
//   };

//   return (
//     <nav className="glass-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between h-20">
          
//           {/* Logo Brand Identity */}
//           <div 
//             onClick={() => handleNavClick("home")}
//             className="flex items-center gap-3 cursor-pointer group"
//             id="nav-logo"
//           >
//             <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/10 group-hover:scale-105 transition-transform duration-200">
//               <span className="font-display font-extrabold text-white text-xl">W</span>
//               {/* Crown indicator resembling CMYK printer rollers */}
//               <div className="absolute -top-1.5 -right-1.5 flex gap-0.5">
//                 <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-900"></span>
//                 <span className="w-2.5 h-2.5 rounded-full bg-pink-500 border border-slate-900"></span>
//                 <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-slate-900"></span>
//               </div>
//             </div>
//             <div>
//               <div className="font-display font-extrabold tracking-wider text-xl flex items-center gap-1 text-white">
//                 WAO <span className="logo-gradient-text">PRINTS</span>
//               </div>
//               <p className="text-[9px] uppercase tracking-[0.25em] text-gray-400 font-mono">Print Like A Waoo</p>
//             </div>
//           </div>

//           {/* Desktop Navigation Links */}
//           <div className="hidden md:flex items-center gap-8">
//             {navItems.map((item) => (
//               <button
//                 key={item.id}
//                 onClick={() => handleNavClick(item.id)}
//                 className={`font-medium text-sm tracking-wide transition-colors relative py-2 ${
//                   currentTab === item.id 
//                     ? "text-orange-500 font-semibold" 
//                     : "text-gray-300 hover:text-white"
//                 }`}
//                 id={`nav-item-${item.id}`}
//               >
//                 {item.label}
//                 {currentTab === item.id && (
//                   <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
//                 )}
//               </button>
//             ))}
//           </div>

//           {/* Action Buttons (Cart, Wishlist, User) */}
//           <div className="hidden md:flex items-center gap-5">
//             {/* Wishlist */}
//             <button 
//               onClick={() => handleNavClick("dashboard")}
//               className="p-2.5 text-gray-300 hover:text-orange-500 transition-colors relative hover:scale-105 duration-200"
//               title="Saved Designs / Wishlist"
//               id="nav-wishlist-btn"
//             >
//               <Heart className="w-5 h-5" />
//               {wishlistCount > 0 && (
//                 <span className="absolute top-1 right-1 bg-rose-500 text-white font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
//                   {wishlistCount}
//                 </span>
//               )}
//             </button>

//             {/* Shopping Cart */}
//             <button 
//               onClick={() => handleNavClick("cart")}
//               className="p-2.5 text-gray-300 hover:text-orange-500 transition-colors relative hover:scale-105 duration-200"
//               title="Shopping Cart"
//               id="nav-cart-btn"
//             >
//               <ShoppingCart className="w-5 h-5" />
//               {cartCount > 0 && (
//                 <span className="absolute top-1 right-1 bg-orange-500 text-white font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
//                   {cartCount}
//                 </span>
//               )}
//             </button>

//             {/* Profile / Dashboard Quick Access */}
//             {user ? (
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={() => handleNavClick(user.role === UserRole.ADMIN ? "admin" : "dashboard")}
//                   className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-semibold text-gray-200 border border-slate-700/50 hover:border-orange-500/50 transition-all duration-200 cursor-pointer shadow-sm shadow-black/10"
//                   id="nav-dashboard-btn"
//                 >
//                   <LayoutDashboard className="w-3.5 h-3.5 text-orange-500" />
//                   {user.role === UserRole.ADMIN ? "Admin Hub" : "My Account"}
//                 </button>
//                 <button
//                   onClick={onLogout}
//                   className="p-2 bg-slate-800/40 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 rounded-xl text-gray-400 hover:text-rose-500 transition-all duration-200 cursor-pointer"
//                   title="Logout"
//                   id="nav-logout-btn"
//                 >
//                   <LogOut className="w-4 h-4" />
//                 </button>
//               </div>
//             ) : (
//               <button
//                 onClick={() => handleNavClick("login")}
//                 className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
//                 id="nav-signin-btn"
//               >
//                 <UserIcon className="w-3.5 h-3.5" />
//                 Sign In
//               </button>
//             )}
//           </div>

//           {/* Mobile Menu Icon */}
//           <div className="flex items-center gap-4 md:hidden">
//             {/* Cart Icon Mobile */}
//             <button 
//               onClick={() => handleNavClick("cart")}
//               className="p-2 text-gray-300 hover:text-orange-500 relative"
//             >
//               <ShoppingCart className="w-5.5 h-5.5" />
//               {cartCount > 0 && (
//                 <span className="absolute top-1 right-1 bg-orange-500 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
//                   {cartCount}
//                 </span>
//               )}
//             </button>

//             <button
//               onClick={() => setIsOpen(!isOpen)}
//               className="p-2 text-gray-400 hover:text-white rounded-xl bg-slate-800/50 border border-slate-700/50"
//               id="mobile-menu-toggle"
//             >
//               {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
//             </button>
//           </div>

//         </div>
//       </div>

//       {/* Mobile Drawer Navigation */}
//       {isOpen && (
//         <div className="md:hidden bg-[#0c111e]/95 backdrop-blur-2xl border-b border-slate-800/80 px-4 pt-2 pb-6 space-y-3">
//           {navItems.map((item) => (
//             <button
//               key={item.id}
//               onClick={() => handleNavClick(item.id)}
//               className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
//                 currentTab === item.id 
//                   ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500" 
//                   : "text-gray-300 hover:bg-slate-800/40 hover:text-white"
//               }`}
//             >
//               {item.label}
//             </button>
//           ))}
//           <div className="pt-4 border-t border-slate-800/80 space-y-3">
//             {user ? (
//               <div className="space-y-2 px-4">
//                 <p className="text-xs text-gray-400">Signed in as <span className="text-white font-medium">{user.name}</span></p>
//                 <button
//                   onClick={() => handleNavClick(user.role === UserRole.ADMIN ? "admin" : "dashboard")}
//                   className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-xs font-bold text-gray-200 border border-slate-700"
//                 >
//                   <LayoutDashboard className="w-4 h-4 text-orange-500" />
//                   {user.role === UserRole.ADMIN ? "Admin Dashboard" : "My Dashboard"}
//                 </button>
//                 <button
//                   onClick={onLogout}
//                   className="flex items-center justify-center gap-2 w-full bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 py-3 rounded-xl text-xs font-bold border border-rose-900/40"
//                 >
//                   <LogOut className="w-4 h-4" />
//                   Sign Out
//                 </button>
//               </div>
//             ) : (
//               <div className="px-4">
//                 <button
//                   onClick={() => handleNavClick("login")}
//                   className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-orange-600 to-amber-500 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-orange-500/10"
//                 >
//                   <UserIcon className="w-4 h-4" />
//                   Sign In / Create Account
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }
