import React, { useState } from "react";
import { CreditCard, Truck, ShieldCheck, Mail, ArrowRight, Lock, CheckCircle2, Gift } from "lucide-react";

export default function Checkout({
  cartItems,
  user,
  discountAmount,
  couponCode,
  onOrderPlaced,
  onBackToCart
}) {
  // Shipping details state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [zip, setZip] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Stripe");

  // OTP Verification Gate State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);

  // Math handling both architectures seamlessly
  const itemTotal = cartItems.reduce((acc, item) => {
    const itemPrice = item.isGiftCombo ? item.finalPrice : (item.product?.discountPrice || item.product?.price || 0);
    return acc + (itemPrice * item.quantity);
  }, 0);
  
  const shippingCost = itemTotal > 0 && discountAmount < itemTotal ? 9.99 : 0;
  const tax = (itemTotal - discountAmount) * 0.08;
  const grandTotal = Math.max(0, itemTotal - discountAmount + shippingCost + tax);

  const handlePreCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !address) {
      alert("Please complete critical billing and shipment address fields.");
      return;
    }
    // Launch secure OTP verification
    setShowOtpModal(true);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError("");

    // Simulated high security OTP: "9421" or standard digit matching
    if (otpCode !== "9421" && otpCode !== "0000") {
      setOtpError("Invalid verification digits. Enter '9421' to simulate successful OTP.");
      return;
    }

    setLoading(true);
    try {
      // Assemble order payload with structural safe checks for Gift Combos
      const orderPayload = {
        userId: user?.id || `guest-${Date.now()}`,
        customerName: name,
        customerEmail: email,
        items: cartItems.map(item => ({
          productId: item.isGiftCombo ? (item.productId || `combo-${Date.now()}`) : item.product?.id,
          productName: item.isGiftCombo ? "Custom Gift Combo Box" : item.product?.name,
          quantity: item.quantity,
          price: item.isGiftCombo ? item.finalPrice : (item.product?.discountPrice || item.product?.price || 0),
          isCustomized: !!item.isCustomized,
          customization: item.customization || null,
          image: item.isGiftCombo ? "" : (item.customization?.logoUrl || item.product?.images?.[0] || ""),
          isGiftCombo: !!item.isGiftCombo,
          // Safely map nested combo sub-items so database catches names properly
          comboItems: item.isGiftCombo ? (item.comboItems || []).map(ci => ({
            name: ci.name || "Selected Item",
            category: ci.category || "General",
            isCustomized: !!ci.isCustomized
          })) : []
        })),
        shippingAddress: `${address}, Zip: ${zip}, Tel: ${phone}`,
        billingAddress: `${address}, Zip: ${zip}`,
        paymentMethod: paymentMethod,
        shippingCost,
        tax,
        discountAmount,
        grandTotal,
        notes: "Checkout order processed via secure portal."
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const orderData = await res.json();
        setShowOtpModal(false);
        onOrderPlaced(orderData);
      } else {
        const errorMsg = await res.json();
        setOtpError(errorMsg.message || "Failed to save order.");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Error matching payment configurations.");
    } finally {
      loading(false);
    }
  };

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in" id="checkout-page">
      
      {/* Back button */}
      <button onClick={onBackToCart} className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer">
        ← Back to Shopping Cart
      </button>

      {/* Main split: Shipping form / Summary sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left: Billing Address & Payment configuration */}
        <form onSubmit={handlePreCheckoutSubmit} className="lg:col-span-8 space-y-8">
          
          {/* Card 1: Shipment details */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" />
              1. Shipment & Billing Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., David Miller"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 012-3456"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ZIP / Postal Code</label>
                <input
                  type="text"
                  required
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="90210"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-xs text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Physical Street Delivery Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="742 Corporate Parkway, Suite 500"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-xs text-white outline-none"
                />
              </div>

            </div>
          </div>

          {/* Card 2: Payment select */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-500" />
              2. Secure Merchant Payment Portal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Stripe option */}
              <div
                onClick={() => setPaymentMethod("Stripe")}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === "Stripe"
                    ? "bg-orange-500/10 border-orange-500 text-white"
                    : "bg-slate-900 border-slate-900 text-gray-400 hover:border-slate-800"
                }`}
              >
                <Lock className="w-4 h-4 text-orange-500 mb-2" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Credit Card / Stripe</h4>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Secure gateway with active fraud shield.</p>
              </div>

              {/* Direct bank transfer */}
              <div
                onClick={() => setPaymentMethod("Bank Transfer")}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === "Bank Transfer"
                    ? "bg-orange-500/10 border-orange-500 text-white"
                    : "bg-slate-900 border-slate-900 text-gray-400 hover:border-slate-800"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-orange-500 mb-2" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Bank Wire</h4>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Direct business account invoice wiring.</p>
              </div>

              {/* COD */}
              <div
                onClick={() => setPaymentMethod("Cash on Delivery")}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === "Cash on Delivery"
                    ? "bg-orange-500/10 border-orange-500 text-white"
                    : "bg-slate-900 border-slate-900 text-gray-400 hover:border-slate-800"
                }`}
              >
                <Truck className="w-4 h-4 text-orange-500 mb-2" />
                <h4 className="font-bold text-xs uppercase tracking-wider">COD Delivery</h4>
                <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Pay cash directly upon parcel handoff.</p>
              </div>

            </div>

            {/* Credit Card Details Inputs for Stripe */}
            {paymentMethod === "Stripe" && (
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Credit Card Number</label>
                  <input
                    type="text"
                    required={paymentMethod === "Stripe"}
                    placeholder="4111 2222 3333 4444"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white font-mono outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Expiry Date</label>
                    <input
                      type="text"
                      required={paymentMethod === "Stripe"}
                      placeholder="MM/YY"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white font-mono outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">CVC Secure Code</label>
                    <input
                      type="password"
                      required={paymentMethod === "Stripe"}
                      placeholder="***"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white font-mono outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "Bank Transfer" && (
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900 text-xs text-gray-400 space-y-2 leading-relaxed animate-fade-in">
                <p className="font-bold text-white uppercase tracking-wider text-[9px] text-orange-400">✓ WAO corporate routing details</p>
                <p>Transfer the grand total to: <span className="text-white font-semibold">WAO PRINTS Corp (HSBC Silicon Valley)</span></p>
                <p>Account Number: <span className="text-white font-semibold font-mono">981-2313-281</span> | Routing: <span className="text-white font-semibold font-mono">021000021</span></p>
                <p className="text-[10px] text-gray-500">Please append your generated Order ID inside transfer description reference for rapid clearance.</p>
              </div>
            )}

          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider py-4.5 rounded-xl shadow-lg shadow-orange-500/15 hover:shadow-orange-500/35 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Authorize Purchase Order
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Right Sidebar: Dynamic order summary calculations */}
         {/* <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-5 glass-card">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider pb-2 border-b border-slate-900">Summary Sheet</h4>
            
            <div className="max-h-56 overflow-y-auto space-y-4 no-scrollbar pr-1">
              {cartItems.map((item, i) => {
                const itemPrice = item.isGiftCombo ? item.finalPrice : (item.product?.discountPrice || item.product?.price || 0);
                return (
                  <div key={i} className="flex gap-3 justify-between text-xs items-center">
                    <div className="flex gap-2.5 items-center">
                      {item.isGiftCombo ? (
                        <div className="w-9 h-9 rounded bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-orange-500/20">
                          <Gift className="w-4 h-4" />
                        </div>
                      ) : (
                        <img
                          src={item.customization?.logoUrl || item.product?.images?.[0]}
                          alt="Product thumbnail"
                          className="w-9 h-9 rounded bg-[#090d16] border border-slate-900 p-1.5 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div>
                        <h5 className="font-bold text-white text-[11px] line-clamp-1">
                          {item.isGiftCombo ? "Custom Gift Combo Box" : item.product?.name}
                        </h5>
                        <p className="text-[9px] text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-mono text-gray-300 font-semibold">${(itemPrice * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2.5 text-xs pt-4 border-t border-slate-900/80">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-mono text-white">${itemTotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-mono">
                  <span>Coupon Deduction</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Print-insured Courier</span>
                <span className="font-mono text-white">${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Sales Tax (8%)</span>
                <span className="font-mono text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-900 pt-3 flex justify-between text-sm font-bold">
                <span className="text-white">GRAND TOTAL</span>
                <span className="font-mono text-orange-500">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

          </div>
        </div>

      </div>  */}
<div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-5 glass-card">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider pb-2 border-b border-slate-900">Summary Sheet</h4>
            
            <div className="max-h-56 overflow-y-auto space-y-4 no-scrollbar pr-1">
              {cartItems.map((item, i) => {
                const itemPrice = item.isGiftCombo ? item.finalPrice : (item.product?.discountPrice || item.product?.price || 0);
                return (
                  <div key={i} className="flex gap-3 justify-between text-xs items-center">
                    <div className="flex gap-2.5 items-center">
                      {item.isGiftCombo ? (
                        <div className="w-9 h-9 rounded bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-orange-500/20">
                          <Gift className="w-4 h-4" />
                        </div>
                      ) : (
                        <img
                          src={item.customization?.logoUrl || item.product?.images?.[0]}
                          alt="Product thumbnail"
                          className="w-9 h-9 rounded bg-[#090d16] border border-slate-900 p-1.5 object-contain"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div>
                        <h5 className="font-bold text-white text-[11px] line-clamp-1">
                          {item.isGiftCombo ? "Custom Gift Combo Box" : item.product?.name}
                        </h5>
                        <p className="text-[9px] text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    {/* Dollar ($) removed and replaced with Rs. */}
                    <span className="font-mono text-gray-300 font-semibold">Rs. {(itemPrice * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2.5 text-xs pt-4 border-t border-slate-900/80">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-mono text-white">Rs. {itemTotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-mono">
                  <span>Coupon Deduction</span>
                  <span>-Rs. {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Print-insured Courier</span>
                <span className="font-mono text-white">Rs. {shippingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Sales Tax (8%)</span>
                <span className="font-mono text-white">Rs. {tax.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-900 pt-3 flex justify-between text-sm font-bold">
                <span className="text-white">GRAND TOTAL</span>
                <span className="font-mono text-orange-500">Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>
                    </div>

 


      {/* SECURE SMS/EMAIL OTP MODAL SCREEN */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-md text-center space-y-6 shadow-2xl glass-card animate-scale-up">
            
            <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center text-orange-500 mx-auto">
              <Mail className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-xl text-white">Prism Verification Gate</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                A verification code has been securely routed to your email address <span className="text-white font-semibold">{email}</span>.
              </p>
              <div className="p-2 bg-orange-500/5 rounded-xl border border-orange-500/10 text-orange-400 font-mono text-xs max-w-xs mx-auto">
                SIMULATED OTP CODE: <span className="font-bold tracking-widest text-white">9421</span>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength={4}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 4-digit code"
                className="w-32 bg-slate-900 border border-slate-800 text-center tracking-[0.5em] focus:border-orange-500/60 font-mono rounded-xl px-4 py-3.5 text-lg text-white font-extrabold outline-none"
              />

              {otpError && (
                <p className="text-xs text-rose-500 font-mono animate-bounce">{otpError}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-gray-400 text-xs py-3 rounded-xl border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-bold py-3 rounded-xl shadow shadow-orange-500/10 cursor-pointer"
                >
                  {loading ? "Verifying..." : "Verify & Checkout"}
                </button>
              </div>
            </form>

            <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>D&B 256-Bit Encrypted Payment Safeguard.</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}




















// import React, { useState } from "react";
// import { CreditCard, Truck, ShieldCheck, Mail, ArrowRight, Lock, CheckCircle2 } from "lucide-react";

// export default function Checkout({
//   cartItems,
//   user,
//   discountAmount,
//   couponCode,
//   onOrderPlaced,
//   onBackToCart
// }) {
//   // Shipping details state
//   const [name, setName] = useState(user?.name || "");
//   const [email, setEmail] = useState(user?.email || "");
//   const [phone, setPhone] = useState(user?.phone || "");
//   const [address, setAddress] = useState(user?.address || "");
//   const [zip, setZip] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("Stripe");

//   // OTP Verification Gate State
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [otpCode, setOtpCode] = useState("");
//   const [otpError, setOtpError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Math
//   const itemTotal = cartItems.reduce((acc, item) => acc + (item.finalPrice * item.quantity), 0);
//   const shippingCost = itemTotal > 0 && discountAmount < itemTotal ? 9.99 : 0;
//   const tax = (itemTotal - discountAmount) * 0.08;
//   const grandTotal = Math.max(0, itemTotal - discountAmount + shippingCost + tax);

//   const handlePreCheckoutSubmit = (e) => {
//     e.preventDefault();
//     if (!name || !email || !address) {
//       alert("Please complete critical billing and shipment address fields.");
//       return;
//     }
//     // Launch secure OTP verification
//     setShowOtpModal(true);
//   };

//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     setOtpError("");

//     // Simulated high security OTP: "9421" or standard digit matching
//     if (otpCode !== "9421" && otpCode !== "0000") {
//       setOtpError("Invalid verification digits. Enter '9421' to simulate successful OTP.");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Assemble order payload
//       const orderPayload = {
//         userId: user?.id || `guest-${Date.now()}`,
//         customerName: name,
//         customerEmail: email,
//         items: cartItems.map(item => ({
//           productId: item.product.id,
//           productName: item.product.name,
//           quantity: item.quantity,
//           price: item.product.discountPrice || item.product.price,
//           isCustomized: item.isCustomized,
//           customization: item.customization,
//           image: item.customization?.logoUrl || item.product.images[0]
//         })),
//         shippingAddress: `${address}, Zip: ${zip}, Tel: ${phone}`,
//         billingAddress: `${address}, Zip: ${zip}`,
//         paymentMethod: paymentMethod,
//         shippingCost,
//         tax,
//         discountAmount,
//         grandTotal,
//         notes: "Checkout order processed via secure portal."
//       };

//       const res = await fetch("/api/orders", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(orderPayload)
//       });

//       if (res.ok) {
//         const orderData = await res.json();
//         setShowOtpModal(false);
//         onOrderPlaced(orderData);
//       } else {
//         const errorMsg = await res.json();
//         setOtpError(errorMsg.message || "Failed to save order.");
//       }
//     } catch (err) {
//       console.error(err);
//       setOtpError("Error matching payment configurations.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in" id="checkout-page">
      
//       {/* Back button */}
//       <button onClick={onBackToCart} className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white cursor-pointer">
//         ← Back to Shopping Cart
//       </button>

//       {/* Main split: Shipping form / Summary sidebar */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
//         {/* Left: Billing Address & Payment configuration */}
//         <form onSubmit={handlePreCheckoutSubmit} className="lg:col-span-8 space-y-8">
          
//           {/* Card 1: Shipment details */}
//           <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
//             <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
//               <Truck className="w-5 h-5 text-orange-500" />
//               1. Shipment & Billing Address
//             </h3>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Full Legal Name</label>
//                 <input
//                   type="text"
//                   required
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   placeholder="E.g., David Miller"
//                   className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-xs text-white outline-none"
//                 />
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
//                 <input
//                   type="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="name@company.com"
//                   className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-xs text-white outline-none"
//                 />
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Contact Phone</label>
//                 <input
//                   type="text"
//                   required
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   placeholder="+1 (555) 012-3456"
//                   className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-xs text-white outline-none"
//                 />
//               </div>

//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ZIP / Postal Code</label>
//                 <input
//                   type="text"
//                   required
//                   value={zip}
//                   onChange={(e) => setZip(e.target.value)}
//                   placeholder="90210"
//                   className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-xs text-white outline-none"
//                 />
//               </div>

//               <div className="sm:col-span-2 space-y-1.5">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Physical Street Delivery Address</label>
//                 <input
//                   type="text"
//                   required
//                   value={address}
//                   onChange={(e) => setAddress(e.target.value)}
//                   placeholder="742 Corporate Parkway, Suite 500"
//                   className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-xs text-white outline-none"
//                 />
//               </div>

//             </div>
//           </div>

//           {/* Card 2: Payment select */}
//           <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 sm:p-8 space-y-6">
//             <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
//               <CreditCard className="w-5 h-5 text-orange-500" />
//               2. Secure Merchant Payment Portal
//             </h3>

//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
//               {/* Stripe option */}
//               <div
//                 onClick={() => setPaymentMethod("Stripe")}
//                 className={`p-5 rounded-2xl border cursor-pointer transition-all ${
//                   paymentMethod === "Stripe"
//                     ? "bg-orange-500/10 border-orange-500 text-white"
//                     : "bg-slate-900 border-slate-900 text-gray-400 hover:border-slate-800"
//                 }`}
//               >
//                 <Lock className="w-4 h-4 text-orange-500 mb-2" />
//                 <h4 className="font-bold text-xs uppercase tracking-wider">Credit Card / Stripe</h4>
//                 <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Secure gateway with active fraud shield.</p>
//               </div>

//               {/* Direct bank transfer */}
//               <div
//                 onClick={() => setPaymentMethod("Bank Transfer")}
//                 className={`p-5 rounded-2xl border cursor-pointer transition-all ${
//                   paymentMethod === "Bank Transfer"
//                     ? "bg-orange-500/10 border-orange-500 text-white"
//                     : "bg-slate-900 border-slate-900 text-gray-400 hover:border-slate-800"
//                 }`}
//               >
//                 <CheckCircle2 className="w-4 h-4 text-orange-500 mb-2" />
//                 <h4 className="font-bold text-xs uppercase tracking-wider">Bank Wire</h4>
//                 <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Direct business account invoice wiring.</p>
//               </div>

//               {/* COD */}
//               <div
//                 onClick={() => setPaymentMethod("Cash on Delivery")}
//                 className={`p-5 rounded-2xl border cursor-pointer transition-all ${
//                   paymentMethod === "Cash on Delivery"
//                     ? "bg-orange-500/10 border-orange-500 text-white"
//                     : "bg-slate-900 border-slate-900 text-gray-400 hover:border-slate-800"
//                 }`}
//               >
//                 <Truck className="w-4 h-4 text-orange-500 mb-2" />
//                 <h4 className="font-bold text-xs uppercase tracking-wider">COD Delivery</h4>
//                 <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">Pay cash directly upon parcel handoff.</p>
//               </div>

//             </div>

//             {/* Credit Card Details Inputs for Stripe */}
//             {paymentMethod === "Stripe" && (
//               <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4 animate-fade-in">
//                 <div className="space-y-1.5">
//                   <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Credit Card Number</label>
//                   <input
//                     type="text"
//                     required
//                     placeholder="4111 2222 3333 4444"
//                     className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white font-mono outline-none"
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Expiry Date</label>
//                     <input
//                       type="text"
//                       required
//                       placeholder="MM/YY"
//                       className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white font-mono outline-none"
//                     />
//                   </div>
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">CVC Secure Code</label>
//                     <input
//                       type="password"
//                       required
//                       placeholder="***"
//                       className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white font-mono outline-none"
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}

//             {paymentMethod === "Bank Transfer" && (
//               <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-900 text-xs text-gray-400 space-y-2 leading-relaxed animate-fade-in">
//                 <p className="font-bold text-white uppercase tracking-wider text-[9px] text-orange-400">✓ WAO corporate routing details</p>
//                 <p>Transfer the grand total to: <span className="text-white font-semibold">WAO PRINTS Corp (HSBC Silicon Valley)</span></p>
//                 <p>Account Number: <span className="text-white font-semibold font-mono">981-2313-281</span> | Routing: <span className="text-white font-semibold font-mono">021000021</span></p>
//                 <p className="text-[10px] text-gray-500">Please append your generated Order ID inside transfer description reference for rapid clearance.</p>
//               </div>
//             )}

//           </div>

//           <button
//             type="submit"
//             className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider py-4.5 rounded-xl shadow-lg shadow-orange-500/15 hover:shadow-orange-500/35 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
//           >
//             Authorize Purchase Order
//             <ArrowRight className="w-4 h-4" />
//           </button>

//         </form>

//         {/* Right Sidebar: Dynamic order summary calculations */}
//         <div className="lg:col-span-4 space-y-6">
//           <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-5 glass-card">
//             <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider pb-2 border-b border-slate-900">Summary Sheet</h4>
            
//             <div className="max-h-56 overflow-y-auto space-y-4 no-scrollbar pr-1">
//               {cartItems.map((item, i) => (
//                 <div key={i} className="flex gap-3 justify-between text-xs items-center">
//                   <div className="flex gap-2.5 items-center">
//                     <img
//                       src={item.customization?.logoUrl || item.product.images[0]}
//                       alt="Product thumbnail"
//                       className="w-9 h-9 rounded bg-[#090d16] border border-slate-900 p-1.5 object-contain"
//                       referrerPolicy="no-referrer"
//                     />
//                     <div>
//                       <h5 className="font-bold text-white text-[11px] line-clamp-1">{item.product.name}</h5>
//                       <p className="text-[9px] text-gray-500">Qty: {item.quantity}</p>
//                     </div>
//                   </div>
//                   <span className="font-mono text-gray-300 font-semibold">${(item.finalPrice * item.quantity).toFixed(2)}</span>
//                 </div>
//               ))}
//             </div>

//             <div className="space-y-2.5 text-xs pt-4 border-t border-slate-900/80">
//               <div className="flex justify-between text-gray-500">
//                 <span>Subtotal</span>
//                 <span className="font-mono text-white">${itemTotal.toFixed(2)}</span>
//               </div>
//               {discountAmount > 0 && (
//                 <div className="flex justify-between text-emerald-400 font-mono">
//                   <span>Coupon Deduction</span>
//                   <span>-${discountAmount.toFixed(2)}</span>
//                 </div>
//               )}
//               <div className="flex justify-between text-gray-500">
//                 <span>Print-insured Courier</span>
//                 <span className="font-mono text-white">${shippingCost.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between text-gray-500">
//                 <span>Sales Tax (8%)</span>
//                 <span className="font-mono text-white">${tax.toFixed(2)}</span>
//               </div>
//               <div className="border-t border-slate-900 pt-3 flex justify-between text-sm font-bold">
//                 <span className="text-white">GRAND TOTAL</span>
//                 <span className="font-mono text-orange-500">${grandTotal.toFixed(2)}</span>
//               </div>
//             </div>

//           </div>
//         </div>

//       </div>

//       {/* SECURE SMS/EMAIL OTP MODAL SCREEN */}
//       {showOtpModal && (
//         <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
//           <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-md text-center space-y-6 shadow-2xl glass-card animate-scale-up">
            
//             <div className="w-12 h-12 bg-orange-600/10 rounded-2xl flex items-center justify-center text-orange-500 mx-auto">
//               <Mail className="w-6 h-6 animate-pulse" />
//             </div>

//             <div className="space-y-2">
//               <h3 className="font-display font-bold text-xl text-white">Prism Verification Gate</h3>
//               <p className="text-xs text-gray-400 leading-relaxed">
//                 A verification code has been securely routed to your email address <span className="text-white font-semibold">{email}</span>.
//               </p>
//               <div className="p-2 bg-orange-500/5 rounded-xl border border-orange-500/10 text-orange-400 font-mono text-xs max-w-xs mx-auto">
//                 SIMULATED OTP CODE: <span className="font-bold tracking-widest text-white">9421</span>
//               </div>
//             </div>

//             <form onSubmit={handleVerifyOtp} className="space-y-4">
//               <input
//                 type="text"
//                 maxLength={4}
//                 required
//                 value={otpCode}
//                 onChange={(e) => setOtpCode(e.target.value)}
//                 placeholder="Enter 4-digit code"
//                 className="w-32 bg-slate-900 border border-slate-800 text-center tracking-[0.5em] focus:border-orange-500/60 font-mono rounded-xl px-4 py-3.5 text-lg text-white font-extrabold outline-none"
//               />

//               {otpError && (
//                 <p className="text-xs text-rose-500 font-mono animate-bounce">{otpError}</p>
//               )}

//               <div className="flex gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setShowOtpModal(false)}
//                   className="flex-1 bg-slate-900 hover:bg-slate-800 text-gray-400 text-xs py-3 rounded-xl border border-slate-800"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="flex-1 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-bold py-3 rounded-xl shadow shadow-orange-500/10 cursor-pointer"
//                 >
//                   {loading ? "Verifying..." : "Verify & Checkout"}
//                 </button>
//               </div>
//             </form>

//             <div className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
//               <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
//               <span>D&B 256-Bit Encrypted Payment Safeguard.</span>
//             </div>

//           </div>
//         </div>
//       )}

//     </div>
//   );
// }
