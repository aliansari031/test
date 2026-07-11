import React, { useState } from "react";
import { Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, Percent, ShieldCheck, Gift } from "lucide-react";

export default function Cart({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onBackToShop
}) {
  const [couponCode, setCouponCode] = useState("");
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Calculations handling normal items as well as Combo items dynamically
  const itemTotal = cartItems.reduce((acc, item) => {
    const itemPrice = item.isGiftCombo ? item.finalPrice : (item.product.discountPrice || item.product.price);
    return acc + (itemPrice * item.quantity);
  }, 0);
  
  // Calculate coupon discount
  const discountAmount = activeCoupon 
    ? (itemTotal >= activeCoupon.minSpend ? (itemTotal * activeCoupon.discountPercentage / 100) : 0)
    : 0;

  // Shipping cost change to Rs.
  const shippingCost = itemTotal > 0 && discountAmount < itemTotal ? 250 : 0;
  const tax = (itemTotal - discountAmount) * 0.08;
  const grandTotal = Math.max(0, itemTotal - discountAmount + shippingCost + tax);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError("");

    try {
      const res = await fetch(`/api/coupons/validate/${couponCode.trim()}`);
      if (res.ok) {
        const coupon = await res.json();
        if (itemTotal < coupon.minSpend) {
          setCouponError(`Minimum spend of Rs. ${coupon.minSpend} required to use this coupon.`);
          setActiveCoupon(null);
        } else {
          setActiveCoupon(coupon);
          setCouponCode("");
        }
      } else {
        const data = await res.json();
        setCouponError(data.message || "Invalid coupon code.");
        setActiveCoupon(null);
      }
    } catch (err) {
      console.error(err);
      setCouponError("Unable to validate coupon code at this moment.");
    }
  };


  const handleProceedClick = () => {
    // Sanitize items here to guarantee combo sub-products are formatted for checkout payload
    const sanitizedCartItems = cartItems.map(item => {
      if (item.isGiftCombo) {
        return {
          ...item,
          productName: "Custom Gift Combo Box",
          name: "Custom Gift Combo Box",
          isGiftCombo: true,
          productId: item.productId || item.id || `combo-${Date.now()}`,
          // Map combo items array safely so the database catches names properly
          comboItems: (item.comboItems || []).map(ci => ({
            name: ci.name || ci.title || "Selected Item",
            category: ci.category || "General",
            isCustomized: !!ci.isCustomized
          }))
        };
      }
      return item;
    });

    // If your parent state tracks cart inside checkout, update it or pass it explicitly 
    onProceedToCheckout(discountAmount, activeCoupon ? activeCoupon.code : null, sanitizedCartItems);
  };
  
  // const handleProceedClick = () => {
  //   onProceedToCheckout(discountAmount, activeCoupon ? activeCoupon.code : null);
  // };

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in" id="cart-page">
      
      {/* Title */}
      <div className="border-b border-slate-900 pb-4">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">Your Shopping Cart</h1>
        <p className="text-gray-400 text-xs mt-1">Review your customized print blueprints and confirm physical quantity run sizes before checkout.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-24 space-y-6">
          <ShoppingBag className="w-16 h-16 text-slate-800 mx-auto animate-pulse" />
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-white">Your cart is empty</h3>
            <p className="text-gray-500 text-xs max-w-sm mx-auto">Explore our high fidelity catalog products and trigger the live customizer studio to load customized proofs here.</p>
          </div>
          <button
            onClick={onBackToShop}
            className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg shadow-orange-500/10 transition-all cursor-pointer"
          >
            Explore Materials Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Side: Items row */}
          <div className="lg:col-span-8 space-y-6">
            {cartItems.map((item, index) => {
              // Handle pricing cleanly for both architectures
              const prodPrice = item.isGiftCombo ? item.finalPrice : (item.product.discountPrice || item.product.price);
              const subtotal = prodPrice * item.quantity;

              return (
                <div
                  key={index}
                  className={`border rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row gap-6 justify-between items-center transition-all ${
                    item.isGiftCombo 
                      ? "bg-gradient-to-br from-amber-950/20 via-slate-950/40 to-orange-950/10 border-orange-500/30 shadow-md shadow-orange-500/5" 
                      : "bg-slate-950/40 border-slate-900"
                  }`}
                >
                  
                  {/* Thumbnail / custom display preview */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-20 h-20 bg-[#090d16] rounded-2xl border border-slate-900 flex items-center justify-center p-3 relative shrink-0">
                      {item.isGiftCombo ? (
                        <div className="w-full h-full bg-gradient-to-tr from-orange-600 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                          <Gift className="w-8 h-8 text-white animate-bounce" />
                        </div>
                      ) : (
                        <img
                          src={item.customization?.logoUrl || item.product.images[0]}
                          alt={item.product.name}
                          className="max-h-full max-w-full object-contain rounded"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div>
                      {item.isGiftCombo ? (
                        <>
                          <div className="flex items-center gap-2">
                            <h3 className="font-display font-extrabold text-sm sm:text-base text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                              Custom Gift Combo Box
                            </h3>
                            <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                              Bundle
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono mt-1">
                            Contains {item.comboItems?.length || 0} Premium Products:
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5 max-w-md">
                            {item.comboItems?.map((ci, idx) => (
                              <span 
                                key={idx} 
                                className="bg-slate-900 border border-slate-800 text-gray-300 text-[10px] px-2 py-0.5 rounded-lg flex items-center gap-1 font-medium"
                              >
                                {ci.name} {ci.isCustomized && "🎨"}
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <h3 className="font-display font-bold text-sm sm:text-base text-white">{item.product.name}</h3>
                          <p className="text-[10px] text-gray-500 font-mono mt-0.5">{item.product.category}</p>
                          
                          {/* Customization Details checklist badge */}
                          {item.isCustomized && item.customization && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] px-2 py-0.5 rounded font-mono uppercase">
                                ★ Custom Proof Approved
                              </span>
                              {item.customization.text && (
                                <span className="bg-slate-900 text-gray-400 border border-slate-800 text-[9px] px-2 py-0.5 rounded font-mono">
                                  Text: "{item.customization.text}"
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quantity adjustment & Pricing info */}
                  <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-900">
                    
                    {/* Stepper */}
                    <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl">
                      <button
                        onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                        className="p-2 text-gray-400 hover:text-white cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-xs px-2.5 text-white font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                        className="p-2 text-gray-400 hover:text-white cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="font-display font-extrabold text-sm sm:text-base text-white">Rs. {subtotal.toLocaleString('en-PK')}</div>
                      <p className="text-[10px] text-gray-500 font-mono">Rs. {prodPrice.toLocaleString('en-PK')} / unit</p>
                    </div>

                    {/* Delete item button */}
                    <button
                      onClick={() => onRemoveItem(index)}
                      className="p-2.5 bg-slate-900/40 hover:bg-rose-950/20 text-gray-500 hover:text-rose-500 border border-slate-900 hover:border-rose-900/40 rounded-xl transition-all cursor-pointer"
                      title={item.isGiftCombo ? "Remove Box" : "Remove product"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

          {/* Right Side: Order Summary math */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-6 glass-card">
              <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Purchase Calculations</h4>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Batch Material Subtotal</span>
                  <span className="font-mono text-white">Rs. {itemTotal.toLocaleString('en-PK')}</span>
                </div>

                {activeCoupon && (
                  <div className="flex justify-between text-emerald-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 shrink-0" />
                      Coupon ({activeCoupon.code})
                    </span>
                    <span>-Rs. {discountAmount.toLocaleString('en-PK')}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-400">
                  <span>Insured Printing Courier</span>
                  <span className="font-mono text-white">
                    {shippingCost === 0 ? "FREE" : `Rs. ${shippingCost}`}
                  </span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>State Sales Tax (8.0%)</span>
                  <span className="font-mono text-white">Rs. {tax.toLocaleString('en-PK')}</span>
                </div>

                <div className="border-t border-slate-900 pt-3.5 flex justify-between text-sm font-bold">
                  <span className="text-white font-display uppercase tracking-wider">Estimated Grand Total</span>
                  <span className="font-mono text-orange-500 text-lg">Rs. {grandTotal.toLocaleString('en-PK')}</span>
                </div>
              </div>

              {/* Coupon Form input */}
              <form onSubmit={handleApplyCoupon} className="space-y-2.5 pt-4 border-t border-slate-900/60">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-orange-500" />
                  Promo Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="E.g., WAOPRINT10"
                    className="flex-1 bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl px-3 py-2 text-xs text-white uppercase outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[10px] text-rose-500 font-mono animate-pulse">{couponError}</p>
                )}
                {activeCoupon && (
                  <p className="text-[10px] text-emerald-400 font-mono">✓ Coupon applied successfully! {activeCoupon.discountPercentage}% off.</p>
                )}
              </form>

              {/* Proceed to checkout CTA */}
              <button
                onClick={handleProceedClick}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                id="cart-checkout-btn"
              >
                Proceed to Secure Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

            {/* Quality commitment notes */}
            <div className="p-4 bg-slate-950/20 border border-slate-900 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[11px] text-gray-500 leading-relaxed">
                <p className="font-bold text-gray-400">WAO prints 100% Satisfaction Guarantee</p>
                <p>If your physical delivery deviates from your customized digital proof layout, we will re-press the entire run free of cost.</p>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}





























// import React, { useState } from "react";
// import { Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, Percent, ShieldCheck } from "lucide-react";

// export default function Cart({
//   cartItems,
//   onUpdateQuantity,
//   onRemoveItem,
//   onProceedToCheckout,
//   onBackToShop
// }) {
//   const [couponCode, setCouponCode] = useState("");
//   const [activeCoupon, setActiveCoupon] = useState(null);
//   const [couponError, setCouponError] = useState("");

//   const itemTotal = cartItems.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
  
//   // Calculate coupon discount
//   const discountAmount = activeCoupon 
//     ? (itemTotal >= activeCoupon.minSpend ? (itemTotal * activeCoupon.discountPercentage / 100) : 0)
//     : 0;

//   // Shipping cost change to Rs. (E.g., 250 Rs. or keep it flat as per your choice, here changing 9.99 to flat 250)
//   const shippingCost = itemTotal > 0 && discountAmount < itemTotal ? 250 : 0;
//   const tax = (itemTotal - discountAmount) * 0.08;
//   const grandTotal = Math.max(0, itemTotal - discountAmount + shippingCost + tax);

//   const handleApplyCoupon = async (e) => {
//     e.preventDefault();
//     if (!couponCode.trim()) return;
//     setCouponError("");

//     try {
//       const res = await fetch(`/api/coupons/validate/${couponCode.trim()}`);
//       if (res.ok) {
//         const coupon = await res.json();
//         if (itemTotal < coupon.minSpend) {
//           setCouponError(`Minimum spend of Rs. ${coupon.minSpend} required to use this coupon.`);
//           setActiveCoupon(null);
//         } else {
//           setActiveCoupon(coupon);
//           setCouponCode("");
//         }
//       } else {
//         const data = await res.json();
//         setCouponError(data.message || "Invalid coupon code.");
//         setActiveCoupon(null);
//       }
//     } catch (err) {
//       console.error(err);
//       setCouponError("Unable to validate coupon code at this moment.");
//     }
//   };

//   const handleProceedClick = () => {
//     onProceedToCheckout(discountAmount, activeCoupon ? activeCoupon.code : null);
//   };

//   return (
//     <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in" id="cart-page">
      
//       {/* Title */}
//       <div className="border-b border-slate-900 pb-4">
//         <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">Your Shopping Cart</h1>
//         <p className="text-gray-400 text-xs mt-1">Review your customized print blueprints and confirm physical quantity run sizes before checkout.</p>
//       </div>

//       {cartItems.length === 0 ? (
//         <div className="text-center py-24 space-y-6">
//           <ShoppingBag className="w-16 h-16 text-slate-800 mx-auto animate-pulse" />
//           <div className="space-y-1">
//             <h3 className="font-display font-bold text-lg text-white">Your cart is empty</h3>
//             <p className="text-gray-500 text-xs max-w-sm mx-auto">Explore our high fidelity catalog products and trigger the live customizer studio to load customized proofs here.</p>
//           </div>
//           <button
//             onClick={onBackToShop}
//             className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg shadow-orange-500/10 transition-all cursor-pointer"
//           >
//             Explore Materials Catalog
//           </button>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
//           {/* Left Side: Items row */}
//           <div className="lg:col-span-8 space-y-6">
//             {cartItems.map((item, index) => {
//               const prodPrice = item.product.discountPrice || item.product.price;
//               const subtotal = prodPrice * item.quantity;

//               return (
//                 <div
//                   key={index}
//                   className="bg-slate-950/40 border border-slate-900 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row gap-6 justify-between items-center"
//                 >
                  
//                   {/* Thumbnail / custom display preview */}
//                   <div className="flex items-center gap-4 w-full sm:w-auto">
//                     <div className="w-20 h-20 bg-[#090d16] rounded-2xl border border-slate-900 flex items-center justify-center p-3 relative shrink-0">
//                       <img
//                         src={item.customization?.logoUrl || item.product.images[0]}
//                         alt={item.product.name}
//                         className="max-h-full max-w-full object-contain rounded"
//                         referrerPolicy="no-referrer"
//                       />
//                     </div>
//                     <div>
//                       <h3 className="font-display font-bold text-sm sm:text-base text-white">{item.product.name}</h3>
//                       <p className="text-[10px] text-gray-500 font-mono mt-0.5">{item.product.category}</p>
                      
//                       {/* Customization Details checklist badge */}
//                       {item.isCustomized && item.customization && (
//                         <div className="mt-2 flex flex-wrap gap-1">
//                           <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9px] px-2 py-0.5 rounded font-mono uppercase">
//                             ★ Custom Proof Approved
//                           </span>
//                           {item.customization.text && (
//                             <span className="bg-slate-900 text-gray-400 border border-slate-800 text-[9px] px-2 py-0.5 rounded font-mono">
//                               Text: "{item.customization.text}"
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Quantity adjustment & Pricing info */}
//                   <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-900">
                    
//                     {/* Stepper */}
//                     <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl">
//                       <button
//                         onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
//                         className="p-2 text-gray-400 hover:text-white cursor-pointer"
//                       >
//                         <Minus className="w-3 h-3" />
//                       </button>
//                       <span className="font-mono text-xs px-2.5 text-white font-semibold">{item.quantity}</span>
//                       <button
//                         onClick={() => onUpdateQuantity(index, item.quantity + 1)}
//                         className="p-2 text-gray-400 hover:text-white cursor-pointer"
//                       >
//                         <Plus className="w-3 h-3" />
//                       </button>
//                     </div>

//                     {/* Price */}
//                     <div className="text-right">
//                       <div className="font-display font-extrabold text-sm sm:text-base text-white">Rs. {subtotal.toLocaleString('en-PK')}</div>
//                       <p className="text-[10px] text-gray-500 font-mono">Rs. {prodPrice.toLocaleString('en-PK')} / unit</p>
//                     </div>

//                     {/* Delete item button */}
//                     <button
//                       onClick={() => onRemoveItem(index)}
//                       className="p-2.5 bg-slate-900/40 hover:bg-rose-950/20 text-gray-500 hover:text-rose-500 border border-slate-900 hover:border-rose-900/40 rounded-xl transition-all cursor-pointer"
//                       title="Remove product"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>

//                   </div>

//                 </div>
//               );
//             })}
//           </div>

//           {/* Right Side: Order Summary math */}
//           <div className="lg:col-span-4 space-y-6">
            
//             <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-6 glass-card">
//               <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Purchase Calculations</h4>
              
//               <div className="space-y-3.5 text-xs">
//                 <div className="flex justify-between text-gray-400">
//                   <span>Batch Material Subtotal</span>
//                   <span className="font-mono text-white">Rs. {itemTotal.toLocaleString('en-PK')}</span>
//                 </div>

//                 {activeCoupon && (
//                   <div className="flex justify-between text-emerald-400 font-mono">
//                     <span className="flex items-center gap-1">
//                       <Percent className="w-3.5 h-3.5 shrink-0" />
//                       Coupon ({activeCoupon.code})
//                     </span>
//                     <span>-Rs. {discountAmount.toLocaleString('en-PK')}</span>
//                   </div>
//                 )}

//                 <div className="flex justify-between text-gray-400">
//                   <span>Insured Printing Courier</span>
//                   <span className="font-mono text-white">
//                     {shippingCost === 0 ? "FREE" : `Rs. ${shippingCost}`}
//                   </span>
//                 </div>

//                 <div className="flex justify-between text-gray-400">
//                   <span>State Sales Tax (8.0%)</span>
//                   <span className="font-mono text-white">Rs. {tax.toLocaleString('en-PK')}</span>
//                 </div>

//                 <div className="border-t border-slate-900 pt-3.5 flex justify-between text-sm font-bold">
//                   <span className="text-white font-display uppercase tracking-wider">Estimated Grand Total</span>
//                   <span className="font-mono text-orange-500 text-lg">Rs. {grandTotal.toLocaleString('en-PK')}</span>
//                 </div>
//               </div>

//               {/* Coupon Form input */}
//               <form onSubmit={handleApplyCoupon} className="space-y-2.5 pt-4 border-t border-slate-900/60">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
//                   <Tag className="w-3.5 h-3.5 text-orange-500" />
//                   Promo Coupon Code
//                 </label>
//                 <div className="flex gap-2">
//                   <input
//                     type="text"
//                     value={couponCode}
//                     onChange={(e) => setCouponCode(e.target.value)}
//                     placeholder="E.g., WAOPRINT10"
//                     className="flex-1 bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl px-3 py-2 text-xs text-white uppercase outline-none"
//                   />
//                   <button
//                     type="submit"
//                     className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
//                   >
//                     Apply
//                   </button>
//                 </div>
//                 {couponError && (
//                   <p className="text-[10px] text-rose-500 font-mono animate-pulse">{couponError}</p>
//                 )}
//                 {activeCoupon && (
//                   <p className="text-[10px] text-emerald-400 font-mono">✓ Coupon applied successfully! {activeCoupon.discountPercentage}% off.</p>
//                 )}
//               </form>

//               {/* Proceed to checkout CTA */}
//               <button
//                 onClick={handleProceedClick}
//                 className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
//                 id="cart-checkout-btn"
//               >
//                 Proceed to Secure Checkout
//                 <ArrowRight className="w-4 h-4" />
//               </button>

//             </div>

//             {/* Quality commitment notes */}
//             <div className="p-4 bg-slate-950/20 border border-slate-900 rounded-2xl flex items-start gap-3">
//               <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
//               <div className="space-y-0.5 text-[11px] text-gray-500 leading-relaxed">
//                 <p className="font-bold text-gray-400">WAO prints 100% Satisfaction Guarantee</p>
//                 <p>If your physical delivery deviates from your customized digital proof layout, we will re-press the entire run free of cost.</p>
//               </div>
//             </div>

//           </div>

//         </div>
//       )}

//     </div>
//   );
// }










 