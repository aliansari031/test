import React, { useState } from "react";
import { Star, Truck, ShieldCheck, Sparkles, Plus, Minus, ArrowLeft, MessageSquare, Check, Gift } from "lucide-react";
import InteractiveCustomizer from "../components/InteractiveCustomizer.jsx";

export default function ProductDetail({
  product,
  onBack,
  onAddToCart,
  onAddComboToCart
}) {
  const [mainImage, setMainImage] = useState(product?.images?.[0] || "/placeholder.jpg");
  const [quantity, setQuantity] = useState(1);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [savedCustomization, setSavedCustomization] = useState(null);

  // Review submission state
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState(product?.reviews || []);

  const activePrice = product?.discountPrice || product?.price || 0;

  const handleCustomizationComplete = (details) => {
    setSavedCustomization(details);
    setIsCustomizing(false);
  };

  const handleAddToCartClick = () => {
    const item = {
      product,
      quantity,
      isCustomized: !!savedCustomization,
      customization: savedCustomization || undefined,
      finalPrice: activePrice
    };
    onAddToCart(item);
    alert(`${product?.name || "Product"} ${savedCustomization ? "(Customized)" : ""} added to cart successfully!`);
  };

  // NAYA FEATURE: Gift Combo Box me add karne ka logic
  const handleAddToGiftCombo = () => {
    const existingCombo = JSON.parse(localStorage.getItem("wao_gift_combo")) || [];
    
    if (existingCombo.length >= 5) {
      alert("Your Combo Box is full! Max 5 items allowed.");
      return;
    }

    const newComboItem = {
      uniqueId: Date.now(), 
      id: product?.id,
      name: product?.name,
      price: activePrice,
      image: savedCustomization?.logoUrl || product?.images?.[0] || "/placeholder.jpg",
      category: product?.category,
      isCustomized: !!savedCustomization,
      customization: savedCustomization || undefined
    };

    const updatedCombo = [...existingCombo, newComboItem];
    localStorage.setItem("wao_gift_combo", JSON.stringify(updatedCombo));

    // Custom Event dispatch taake Floating Widget auto-sync ho jaye
    window.dispatchEvent(new Event("wao_combo_updated"));
    alert(`${product?.name || "Product"} added to your Gift Combo Box successfully!`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);

    try {
      const res = await fetch(`/api/products/${product?.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: reviewName || "Anonymous Customer",
          rating: reviewRating,
          comment: reviewComment
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setReviewName("");
        setReviewComment("");
        alert("Review added! Thank you for the feedback.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) return null;

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in" id="product-detail-view">
      
      {/* Back to Shop Nav bar */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white group cursor-pointer"
        id="back-to-shop-btn"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Elite Catalog
      </button>

      {/* Main split details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Side: Thumbnail slider & Main preview */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Zoomable main stage */}
          <div className="aspect-square bg-[#090d16] rounded-3xl border border-slate-900 overflow-hidden p-12 flex items-center justify-center relative">
            <img
              src={mainImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain transform hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
              id="main-product-stage-img"
            />
          </div>

          {/* Thumbnail list row */}
          <div className="flex gap-4">
            {product.images && product.images.map((imgUrl, i) => (
              <button
                key={i}
                onClick={() => setMainImage(imgUrl)}
                className={`w-20 h-20 bg-[#090d16] rounded-xl border p-2 flex items-center justify-center transition-all overflow-hidden ${
                  mainImage === imgUrl ? "border-orange-500 scale-102 ring-2 ring-orange-500/20" : "border-slate-900 hover:border-slate-800"
                }`}
              >
                <img src={imgUrl} alt="Thumbnail preview" className="object-contain max-h-full max-w-full" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>

        </div>

        {/* Right Side: Product configuration specifications */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">{product.category}</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">{product.name}</h1>
          </div>

          {/* Price display segment updated to Rs. */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-slate-900">
            {product.discountPrice ? (
              <>
                <span className="text-3xl font-display font-extrabold text-white">Rs. {product.discountPrice.toLocaleString('en-PK')}</span>
                <span className="text-sm text-gray-500 line-through">Rs. {product.price.toLocaleString('en-PK')}</span>
              </>
            ) : (
              <span className="text-3xl font-display font-extrabold text-white">Rs. {product.price.toLocaleString('en-PK')}</span>
            )}
            <span className="text-xs text-gray-400 pl-2 font-mono">In stock & Ready for custom engraving</span>
          </div>

          {/* Description */}
          <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>

          {/* Safe shipment delivery indicators */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-400 py-3 border-y border-slate-900">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-500" />
              <span>D&H Shipping: {product.deliveryTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-500" />
              <span>Certified Litho Quality</span>
            </div>
          </div>

          {/* Interactive Customize Action Block */}
          {product.isCustomizable && (
            <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-900 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    Bespoke Design Studio Available
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Personalize with corporate logos, vectors, and custom slogan texts. Inspected dynamically by Google Gemini.
                  </p>
                </div>
              </div>

              {savedCustomization ? (
                <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-2 text-emerald-400">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Check className="w-4 h-4" />
                    <span>✓ Custom Proof Approved & Saved</span>
                  </div>
                  {savedCustomization.text && (
                    <p className="text-[11px] text-gray-300">Custom Text: <span className="text-white font-semibold">"{savedCustomization.text}"</span></p>
                  )}
                  {savedCustomization.geminiFeedback && (
                    <div className="mt-1 bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 text-gray-300 font-mono text-[10px] space-y-1">
                      <p className="font-bold text-orange-400">GEMINI VERIFICATION:</p>
                      <p>{savedCustomization.geminiFeedback.quality}</p>
                    </div>
                  )}
                  <button
                    onClick={() => setIsCustomizing(true)}
                    className="text-xs text-orange-400 hover:text-orange-300 font-bold underline pt-1 block cursor-pointer"
                  >
                    Modify Custom Proof
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCustomizing(true)}
                  className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  id="open-customizer-btn"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Launch Live Customizer
                </button>
              )}
            </div>
          )}

          {/* Stepper & Action Buttons Segment */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            
            <div className="flex gap-4 items-center flex-1">
              {/* Quantity stepper */}
              <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-gray-400 hover:text-white cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-sm px-3 text-white font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-gray-400 hover:text-white cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Submit to normal cart */}
              <button
                onClick={handleAddToCartClick}
                className="flex-1 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 hover:border-slate-700 text-gray-300 font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                id="product-add-to-cart-btn"
              >
                Add {savedCustomization ? "Custom" : "Standard"} to Cart
              </button>
            </div>

            {/* Submit to Gift Combo Box Button */}
            <button
              onClick={handleAddToGiftCombo}
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-orange-500/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              id="product-add-to-combo-btn"
            >
              <Gift className="w-4 h-4" />
              Add to Gift Combo
            </button>

          </div>

          {/* Specifications table */}
          {product.specifications && (
            <div className="space-y-4 pt-6 border-t border-slate-900">
              <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Specifications Sheet</h4>
              <div className="grid grid-cols-1 gap-2.5">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-900/60 text-gray-400">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">{k}</span>
                    <span className="text-white font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Product Reviews Column Block */}
      <section className="pt-16 border-t border-slate-900 space-y-12">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-orange-500" />
          <h2 className="font-display font-extrabold text-2xl text-white">Client Reviews ({reviews.length})</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Reviews list (Left) */}
          <div className="lg:col-span-7 space-y-6">
            {reviews.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No reviews have been published for this item yet. Be the first to leave your feedback!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">{rev.userName}</h4>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{rev.createdAt}</p>
                    </div>
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-500" : "text-gray-800"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-300 text-xs leading-relaxed italic">"{rev.comment}"</p>
                </div>
              ))
            )}
          </div>

          {/* Add review form (Right) */}
          <div className="lg:col-span-5 bg-slate-950/40 border border-slate-900 p-6 rounded-3xl space-y-4">
            <h4 className="font-display font-bold text-base text-white">Leave a Review</h4>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="E.g., David M."
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>

              {/* Star selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rating Score</label>
                <div className="flex gap-1.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewRating(num)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star className={`w-5 h-5 ${num <= reviewRating ? "fill-amber-500" : "text-slate-800"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Review Comments</label>
                <textarea
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details of your print experience..."
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white outline-none h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-gray-300 font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer"
              >
                Submit Feedback Review
              </button>

            </form>

          </div>

        </div>
      </section>

      {/* Dynamic Customizable overlay studio model */}
      {isCustomizing && (
        <InteractiveCustomizer
          product={product}
          onCustomizationComplete={handleCustomizationComplete}
          onClose={() => setIsCustomizing(false)}
        />
      )}

    </div>
  );
}





















// import React, { useState } from "react";
// import { Star, Truck, ShieldCheck, Heart, Sparkles, Plus, Minus, ArrowLeft, MessageSquare, Check, Gift } from "lucide-react";
// import InteractiveCustomizer from "../components/InteractiveCustomizer.jsx";

// export default function ProductDetail({
//   product,
//   onBack,
//   onAddToCart,
//   wishlist,
//   onToggleWishlist,
//   onAddComboToCart
// }) {
//   const [mainImage, setMainImage] = useState(product?.images?.[0] || "/placeholder.jpg");
//   const [quantity, setQuantity] = useState(1);
//   const [isCustomizing, setIsCustomizing] = useState(false);
//   const [savedCustomization, setSavedCustomization] = useState(null);

//   // Review submission state
//   const [reviewName, setReviewName] = useState("");
//   const [reviewRating, setReviewRating] = useState(5);
//   const [reviewComment, setReviewComment] = useState("");
//   const [submittingReview, setSubmittingReview] = useState(false);
//   const [reviews, setReviews] = useState(product?.reviews || []);

//   const isSaved = wishlist.includes(product?.id);
//   const activePrice = product?.discountPrice || product?.price || 0;

//   const handleCustomizationComplete = (details) => {
//     setSavedCustomization(details);
//     setIsCustomizing(false);
//   };

//   const handleAddToCartClick = () => {
//     const item = {
//       product,
//       quantity,
//       isCustomized: !!savedCustomization,
//       customization: savedCustomization || undefined,
//       finalPrice: activePrice
//     };
//     onAddToCart(item);
//     alert(`${product?.name || "Product"} ${savedCustomization ? "(Customized)" : ""} added to cart successfully!`);
//   };

//   // NAYA FEATURE: Gift Combo Box me add karne ka logic
//   const handleAddToGiftCombo = () => {
//     const existingCombo = JSON.parse(localStorage.getItem("wao_gift_combo")) || [];
    
//     if (existingCombo.length >= 5) {
//       alert("Your Combo Box is full! Max 5 items allowed.");
//       return;
//     }

//     const newComboItem = {
//       uniqueId: Date.now(), 
//       id: product?.id,
//       name: product?.name,
//       price: activePrice,
//       image: savedCustomization?.logoUrl || product?.images?.[0] || "/placeholder.jpg",
//       category: product?.category,
//       isCustomized: !!savedCustomization,
//       customization: savedCustomization || undefined
//     };

//     const updatedCombo = [...existingCombo, newComboItem];
//     localStorage.setItem("wao_gift_combo", JSON.stringify(updatedCombo));

//     // Custom Event dispatch taake Floating Widget auto-sync ho jaye
//     window.dispatchEvent(new Event("wao_combo_updated"));
//     alert(`${product?.name || "Product"} added to your Gift Combo Box successfully!`);
//   };

//   const handleReviewSubmit = async (e) => {
//     e.preventDefault();
//     if (!reviewComment.trim()) return;
//     setSubmittingReview(true);

//     try {
//       const res = await fetch(`/api/products/${product?.id}/reviews`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userName: reviewName || "Anonymous Customer",
//           rating: reviewRating,
//           comment: reviewComment
//         })
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setReviews(data.reviews);
//         setReviewName("");
//         setReviewComment("");
//         alert("Review added! Thank you for the feedback.");
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setSubmittingReview(false);
//     }
//   };

//   if (!product) return null;

//   return (
//     <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in" id="product-detail-view">
      
//       {/* Back to Shop Nav bar */}
//       <button
//         onClick={onBack}
//         className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white group cursor-pointer"
//         id="back-to-shop-btn"
//       >
//         <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
//         Back to Elite Catalog
//       </button>

//       {/* Main split details grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
//         {/* Left Side: Thumbnail slider & Main preview */}
//         <div className="lg:col-span-6 space-y-4">
          
//           {/* Zoomable main stage */}
//           <div className="aspect-square bg-[#090d16] rounded-3xl border border-slate-900 overflow-hidden p-12 flex items-center justify-center relative">
//             <img
//               src={mainImage}
//               alt={product.name}
//               className="max-h-full max-w-full object-contain transform hover:scale-105 transition-transform duration-300"
//               referrerPolicy="no-referrer"
//               id="main-product-stage-img"
//             />
//           </div>

//           {/* Thumbnail list row - FIXED: Wrapped map function inside JS expression brackets */}
//           <div className="flex gap-4">
//             {product.images && product.images.map((imgUrl, i) => (
//               <button
//                 key={i}
//                 onClick={() => setMainImage(imgUrl)}
//                 className={`w-20 h-20 bg-[#090d16] rounded-xl border p-2 flex items-center justify-center transition-all overflow-hidden ${
//                   mainImage === imgUrl ? "border-orange-500 scale-102 ring-2 ring-orange-500/20" : "border-slate-900 hover:border-slate-800"
//                 }`}
//               >
//                 <img src={imgUrl} alt="Thumbnail preview" className="object-contain max-h-full max-w-full" referrerPolicy="no-referrer" />
//               </button>
//             ))}
//           </div>

//         </div>

//         {/* Right Side: Product configuration specifications */}
//         <div className="lg:col-span-6 space-y-6">
          
//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">{product.category}</span>
//               <button
//                 onClick={() => onToggleWishlist(product.id)}
//                 className="flex items-center gap-1 text-xs text-gray-400 hover:text-rose-500 cursor-pointer"
//               >
//                 <Heart className={`w-4 h-4 ${isSaved ? "text-rose-500 fill-rose-500" : ""}`} />
//                 <span>{isSaved ? "Saved" : "Save Design"}</span>
//               </button>
//             </div>
//             <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">{product.name}</h1>
//           </div>

//           {/* Price display segment updated to Rs. */}
//           <div className="flex items-baseline gap-3 pb-4 border-b border-slate-900">
//             {product.discountPrice ? (
//               <>
//                 <span className="text-3xl font-display font-extrabold text-white">Rs. {product.discountPrice.toLocaleString('en-PK')}</span>
//                 <span className="text-sm text-gray-500 line-through">Rs. {product.price.toLocaleString('en-PK')}</span>
//               </>
//             ) : (
//               <span className="text-3xl font-display font-extrabold text-white">Rs. {product.price.toLocaleString('en-PK')}</span>
//             )}
//             <span className="text-xs text-gray-400 pl-2 font-mono">In stock & Ready for custom engraving</span>
//           </div>

//           {/* Description */}
//           <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>

//           {/* Safe shipment delivery indicators */}
//           <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-400 py-3 border-y border-slate-900">
//             <div className="flex items-center gap-2">
//               <Truck className="w-4 h-4 text-orange-500" />
//               <span>D&H Shipping: {product.deliveryTime}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <ShieldCheck className="w-4 h-4 text-orange-500" />
//               <span>Certified Litho Quality</span>
//             </div>
//           </div>

//           {/* Interactive Customize Action Block */}
//           {product.isCustomizable && (
//             <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-900 space-y-4">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-1">
//                   <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
//                     <Sparkles className="w-4 h-4 text-orange-500" />
//                     Bespoke Design Studio Available
//                   </h4>
//                   <p className="text-xs text-gray-400 leading-relaxed">
//                     Personalize with corporate logos, vectors, and custom slogan texts. Inspected dynamically by Google Gemini.
//                   </p>
//                 </div>
//               </div>

//               {savedCustomization ? (
//                 <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-2 text-emerald-400">
//                   <div className="flex items-center gap-2 text-xs font-bold">
//                     <Check className="w-4 h-4" />
//                     <span>✓ Custom Proof Approved & Saved</span>
//                   </div>
//                   {savedCustomization.text && (
//                     <p className="text-[11px] text-gray-300">Custom Text: <span className="text-white font-semibold">"{savedCustomization.text}"</span></p>
//                   )}
//                   {savedCustomization.geminiFeedback && (
//                     <div className="mt-1 bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 text-gray-300 font-mono text-[10px] space-y-1">
//                       <p className="font-bold text-orange-400">GEMINI VERIFICATION:</p>
//                       <p>{savedCustomization.geminiFeedback.quality}</p>
//                     </div>
//                   )}
//                   <button
//                     onClick={() => setIsCustomizing(true)}
//                     className="text-xs text-orange-400 hover:text-orange-300 font-bold underline pt-1 block cursor-pointer"
//                   >
//                     Modify Custom Proof
//                   </button>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => setIsCustomizing(true)}
//                   className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
//                   id="open-customizer-btn"
//                 >
//                   <Sparkles className="w-4 h-4 animate-pulse" />
//                   Launch Live Customizer
//                 </button>
//               )}
//             </div>
//           )}

//           {/* Stepper & Action Buttons Segment */}
//           <div className="flex flex-col sm:flex-row gap-4 pt-4">
            
//             <div className="flex gap-4 items-center flex-1">
//               {/* Quantity stepper */}
//               <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl shrink-0">
//                 <button
//                   onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                   className="p-3 text-gray-400 hover:text-white cursor-pointer"
//                 >
//                   <Minus className="w-3.5 h-3.5" />
//                 </button>
//                 <span className="font-mono text-sm px-3 text-white font-semibold">{quantity}</span>
//                 <button
//                   onClick={() => setQuantity(quantity + 1)}
//                   className="p-3 text-gray-400 hover:text-white cursor-pointer"
//                 >
//                   <Plus className="w-3.5 h-3.5" />
//                 </button>
//               </div>

//               {/* Submit to normal cart */}
//               <button
//                 onClick={handleAddToCartClick}
//                 className="flex-1 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 hover:border-slate-700 text-gray-300 font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
//                 id="product-add-to-cart-btn"
//               >
//                 Add {savedCustomization ? "Custom" : "Standard"} to Cart
//               </button>
//             </div>

//             {/* Submit to Gift Combo Box Button */}
//             <button
//               onClick={handleAddToGiftCombo}
//               className="flex-1 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-orange-500/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
//               id="product-add-to-combo-btn"
//             >
//               <Gift className="w-4 h-4" />
//               Add to Gift Combo
//             </button>

//           </div>

//           {/* Specifications table */}
//           {product.specifications && (
//             <div className="space-y-4 pt-6 border-t border-slate-900">
//               <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Specifications Sheet</h4>
//               <div className="grid grid-cols-1 gap-2.5">
//                 {Object.entries(product.specifications).map(([k, v]) => (
//                   <div key={k} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-900/60 text-gray-400">
//                     <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">{k}</span>
//                     <span className="text-white font-medium">{v}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//         </div>

//       </div>

//       {/* Product Reviews Column Block */}
//       <section className="pt-16 border-t border-slate-900 space-y-12">
//         <div className="flex items-center gap-2.5">
//           <MessageSquare className="w-5 h-5 text-orange-500" />
//           <h2 className="font-display font-extrabold text-2xl text-white">Client Reviews ({reviews.length})</h2>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
//           {/* Reviews list (Left) */}
//           <div className="lg:col-span-7 space-y-6">
//             {reviews.length === 0 ? (
//               <p className="text-xs text-gray-500 italic">No reviews have been published for this item yet. Be the first to leave your feedback!</p>
//             ) : (
//               reviews.map((rev) => (
//                 <div key={rev.id} className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-3">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <h4 className="text-xs font-bold text-white">{rev.userName}</h4>
//                       <p className="text-[10px] text-gray-500 font-mono mt-0.5">{rev.createdAt}</p>
//                     </div>
//                     <div className="flex text-amber-500">
//                       {Array.from({ length: 5 }).map((_, i) => (
//                         <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-500" : "text-gray-800"}`} />
//                       ))}
//                     </div>
//                   </div>
//                   <p className="text-gray-300 text-xs leading-relaxed italic">"{rev.comment}"</p>
//                 </div>
//               ))
//             )}
//           </div>

//           {/* Add review form (Right) */}
//           <div className="lg:col-span-5 bg-slate-950/40 border border-slate-900 p-6 rounded-3xl space-y-4">
//             <h4 className="font-display font-bold text-base text-white">Leave a Review</h4>
            
//             <form onSubmit={handleReviewSubmit} className="space-y-4">
              
//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Your Name</label>
//                 <input
//                   type="text"
//                   value={reviewName}
//                   onChange={(e) => setReviewName(e.target.value)}
//                   placeholder="E.g., David M."
//                   className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white outline-none"
//                 />
//               </div>

//               {/* Star selector */}
//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rating Score</label>
//                 <div className="flex gap-1.5 text-amber-500">
//                   {[1, 2, 3, 4, 5].map(num => (
//                     <button
//                       key={num}
//                       type="button"
//                       onClick={() => setReviewRating(num)}
//                       className="p-1 hover:scale-110 transition-transform cursor-pointer"
//                     >
//                       <Star className={`w-5 h-5 ${num <= reviewRating ? "fill-amber-500" : "text-slate-800"}`} />
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Review Comments</label>
//                 <textarea
//                   required
//                   value={reviewComment}
//                   onChange={(e) => setReviewComment(e.target.value)}
//                   placeholder="Share details of your print experience..."
//                   className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white outline-none h-20 resize-none"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={submittingReview}
//                 className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-gray-300 font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer"
//               >
//                 Submit Feedback Review
//               </button>

//             </form>

//           </div>

//         </div>
//       </section>

//       {/* Dynamic Customizable overlay studio model */}
//       {isCustomizing && (
//         <InteractiveCustomizer
//           product={product}
//           onCustomizationComplete={handleCustomizationComplete}
//           onClose={() => setIsCustomizing(false)}
//         />
//       )}

//     </div>
//   );
// }



















// import React, { useState } from "react";
// import { Star, Truck, ShieldCheck, Heart, Sparkles, Plus, Minus, ArrowLeft, MessageSquare, Check } from "lucide-react";
// import InteractiveCustomizer from "../components/InteractiveCustomizer.jsx";

// export default function ProductDetail({
//   product,
//   onBack,
//   onAddToCart,
//   wishlist,
//   onToggleWishlist
// }) {
//   const [mainImage, setMainImage] = useState(product.images[0]);
//   const [quantity, setQuantity] = useState(1);
//   const [isCustomizing, setIsCustomizing] = useState(false);
//   const [savedCustomization, setSavedCustomization] = useState(null);

//   // Review submission state
//   const [reviewName, setReviewName] = useState("");
//   const [reviewRating, setReviewRating] = useState(5);
//   const [reviewComment, setReviewComment] = useState("");
//   const [submittingReview, setSubmittingReview] = useState(false);
//   const [reviews, setReviews] = useState(product.reviews);

//   const isSaved = wishlist.includes(product.id);
//   const activePrice = product.discountPrice || product.price;

//   const handleCustomizationComplete = (details) => {
//     setSavedCustomization(details);
//     setIsCustomizing(false);
//   };

//   const handleAddToCartClick = () => {
//     const item = {
//       product,
//       quantity,
//       isCustomized: !!savedCustomization,
//       customization: savedCustomization || undefined,
//       finalPrice: activePrice
//     };
//     onAddToCart(item);
//     alert(`${product.name} ${savedCustomization ? "(Customized)" : ""} added to cart successfully!`);
//   };

//   const handleReviewSubmit = async (e) => {
//     e.preventDefault();
//     if (!reviewComment.trim()) return;
//     setSubmittingReview(true);

//     try {
//       const res = await fetch(`/api/products/${product.id}/reviews`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userName: reviewName || "Anonymous Customer",
//           rating: reviewRating,
//           comment: reviewComment
//         })
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setReviews(data.reviews);
//         setReviewName("");
//         setReviewComment("");
//         alert("Review added! Thank you for the feedback.");
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setSubmittingReview(false);
//     }
//   };

//   return (
//     <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in" id="product-detail-view">
      
//       {/* Back to Shop Nav bar */}
//       <button
//         onClick={onBack}
//         className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white group cursor-pointer"
//         id="back-to-shop-btn"
//       >
//         <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
//         Back to Elite Catalog
//       </button>

//       {/* Main split details grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
//         {/* Left Side: Thumbnail slider & Main preview */}
//         <div className="lg:col-span-6 space-y-4">
          
//           {/* Zoomable main stage */}
//           <div className="aspect-square bg-[#090d16] rounded-3xl border border-slate-900 overflow-hidden p-12 flex items-center justify-center relative">
//             <img
//               src={mainImage}
//               alt={product.name}
//               className="max-h-full max-w-full object-contain transform hover:scale-105 transition-transform duration-300"
//               referrerPolicy="no-referrer"
//               id="main-product-stage-img"
//             />
//           </div>

//           {/* Thumbnail list row */}
//           <div className="flex gap-4">
//             {product.images.map((imgUrl, i) => (
//               <button
//                 key={i}
//                 onClick={() => setMainImage(imgUrl)}
//                 className={`w-20 h-20 bg-[#090d16] rounded-xl border p-2 flex items-center justify-center transition-all overflow-hidden ${
//                   mainImage === imgUrl ? "border-orange-500 scale-102 ring-2 ring-orange-500/20" : "border-slate-900 hover:border-slate-800"
//                 }`}
//               >
//                 <img src={imgUrl} alt="Thumbnail preview" className="object-contain max-h-full max-w-full" referrerPolicy="no-referrer" />
//               </button>
//             ))}
//           </div>

//         </div>

//         {/* Right Side: Product configuration specifications */}
//         <div className="lg:col-span-6 space-y-6">
          
//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">{product.category}</span>
//               <button
//                 onClick={() => onToggleWishlist(product.id)}
//                 className="flex items-center gap-1 text-xs text-gray-400 hover:text-rose-500"
//               >
//                 <Heart className={`w-4 h-4 ${isSaved ? "text-rose-500 fill-rose-500" : ""}`} />
//                 <span>{isSaved ? "Saved" : "Save Design"}</span>
//               </button>
//             </div>
//             <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">{product.name}</h1>
//           </div>

//           {/* Price display segment updated to Rs. */}
//           <div className="flex items-baseline gap-3 pb-4 border-b border-slate-900">
//             {product.discountPrice ? (
//               <>
//                 <span className="text-3xl font-display font-extrabold text-white">Rs. {product.discountPrice.toLocaleString('en-PK')}</span>
//                 <span className="text-sm text-gray-500 line-through">Rs. {product.price.toLocaleString('en-PK')}</span>
//               </>
//             ) : (
//               <span className="text-3xl font-display font-extrabold text-white">Rs. {product.price.toLocaleString('en-PK')}</span>
//             )}
//             <span className="text-xs text-gray-400 pl-2 font-mono">In stock & Ready for custom engraving</span>
//           </div>

//           {/* Description */}
//           <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>

//           {/* Safe shipment delivery indicators */}
//           <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-400 py-3 border-y border-slate-900">
//             <div className="flex items-center gap-2">
//               <Truck className="w-4 h-4 text-orange-500" />
//               <span>D&H Shipping: {product.deliveryTime}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <ShieldCheck className="w-4 h-4 text-orange-500" />
//               <span>Certified Litho Quality</span>
//             </div>
//           </div>

//           {/* Interactive Customize Action Block */}
//           {product.isCustomizable && (
//             <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-900 space-y-4">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-1">
//                   <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
//                     <Sparkles className="w-4 h-4 text-orange-500" />
//                     Bespoke Design Studio Available
//                   </h4>
//                   <p className="text-xs text-gray-400 leading-relaxed">
//                     Personalize with corporate logos, vectors, and custom slogan texts. Inspected dynamically by Google Gemini.
//                   </p>
//                 </div>
//               </div>

//               {savedCustomization ? (
//                 <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-2 text-emerald-400">
//                   <div className="flex items-center gap-2 text-xs font-bold">
//                     <Check className="w-4 h-4" />
//                     <span>✓ Custom Proof Approved & Saved</span>
//                   </div>
//                   {savedCustomization.text && (
//                     <p className="text-[11px] text-gray-300">Custom Text: <span className="text-white font-semibold">"{savedCustomization.text}"</span></p>
//                   )}
//                   {savedCustomization.geminiFeedback && (
//                     <div className="mt-1 bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 text-gray-300 font-mono text-[10px] space-y-1">
//                       <p className="font-bold text-orange-400">GEMINI VERIFICATION:</p>
//                       <p>{savedCustomization.geminiFeedback.quality}</p>
//                     </div>
//                   )}
//                   <button
//                     onClick={() => setIsCustomizing(true)}
//                     className="text-xs text-orange-400 hover:text-orange-300 font-bold underline pt-1 block"
//                   >
//                     Modify Custom Proof
//                   </button>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => setIsCustomizing(true)}
//                   className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
//                   id="open-customizer-btn"
//                 >
//                   <Sparkles className="w-4 h-4 animate-pulse" />
//                   Launch Live Customizer
//                 </button>
//               )}
//             </div>
//           )}

//           {/* Stepper & Main Add to cart */}
//           <div className="flex gap-4 items-center pt-4">
            
//             {/* Quantity stepper */}
//             <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl">
//               <button
//                 onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                 className="p-3 text-gray-400 hover:text-white"
//               >
//                 <Minus className="w-3.5 h-3.5" />
//               </button>
//               <span className="font-mono text-sm px-3 text-white font-semibold">{quantity}</span>
//               <button
//                 onClick={() => setQuantity(quantity + 1)}
//                 className="p-3 text-gray-400 hover:text-white"
//               >
//                 <Plus className="w-3.5 h-3.5" />
//               </button>
//             </div>

//             {/* Submit to cart */}
//             <button
//               onClick={handleAddToCartClick}
//               className="flex-1 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 hover:border-slate-700 text-gray-300 font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
//               id="product-add-to-cart-btn"
//             >
//               Add {savedCustomization ? "Custom Proof" : "Standard"} to Cart
//             </button>

//           </div>

//           {/* Specifications table */}
//           <div className="space-y-4 pt-6 border-t border-slate-900">
//             <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Specifications Sheet</h4>
//             <div className="grid grid-cols-1 gap-2.5">
//               {Object.entries(product.specifications).map(([k, v]) => (
//                 <div key={k} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-900/60 text-gray-400">
//                   <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">{k}</span>
//                   <span className="text-white font-medium">{v}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//         </div>

//       </div>

//       {/* Product Reviews Column Block */}
//       <section className="pt-16 border-t border-slate-900 space-y-12">
//         <div className="flex items-center gap-2.5">
//           <MessageSquare className="w-5 h-5 text-orange-500" />
//           <h2 className="font-display font-extrabold text-2xl text-white">Client Reviews ({reviews.length})</h2>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
//           {/* Reviews list (Left) */}
//           <div className="lg:col-span-7 space-y-6">
//             {reviews.length === 0 ? (
//               <p className="text-xs text-gray-500 italic">No reviews have been published for this item yet. Be the first to leave your feedback!</p>
//             ) : (
//               reviews.map((rev) => (
//                 <div key={rev.id} className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-3">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <h4 className="text-xs font-bold text-white">{rev.userName}</h4>
//                       <p className="text-[10px] text-gray-500 font-mono mt-0.5">{rev.createdAt}</p>
//                     </div>
//                     <div className="flex text-amber-500">
//                       {Array.from({ length: 5 }).map((_, i) => (
//                         <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-500" : "text-gray-800"}`} />
//                       ))}
//                     </div>
//                   </div>
//                   <p className="text-gray-300 text-xs leading-relaxed italic">"{rev.comment}"</p>
//                 </div>
//               ))
//             )}
//           </div>

//           {/* Add review form (Right) */}
//           <div className="lg:col-span-5 bg-slate-950/40 border border-slate-900 p-6 rounded-3xl space-y-4">
//             <h4 className="font-display font-bold text-base text-white">Leave a Review</h4>
            
//             <form onSubmit={handleReviewSubmit} className="space-y-4">
              
//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Your Name</label>
//                 <input
//                   type="text"
//                   value={reviewName}
//                   onChange={(e) => setReviewName(e.target.value)}
//                   placeholder="E.g., David M."
//                   className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white outline-none"
//                 />
//               </div>

//               {/* Star selector */}
//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rating Score</label>
//                 <div className="flex gap-1.5 text-amber-500">
//                   {[1, 2, 3, 4, 5].map(num => (
//                     <button
//                       key={num}
//                       type="button"
//                       onClick={() => setReviewRating(num)}
//                       className="p-1 hover:scale-110 transition-transform cursor-pointer"
//                     >
//                       <Star className={`w-5 h-5 ${num <= reviewRating ? "fill-amber-500" : "text-slate-800"}`} />
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Review Comments</label>
//                 <textarea
//                   required
//                   value={reviewComment}
//                   onChange={(e) => setReviewComment(e.target.value)}
//                   placeholder="Share details of your print experience..."
//                   className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white outline-none h-20 resize-none"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={submittingReview}
//                 className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-gray-300 font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer"
//               >
//                 Submit Feedback Review
//               </button>

//             </form>

//           </div>

//         </div>
//       </section>

//       {/* Dynamic Customizable overlay studio model */}
//       {isCustomizing && (
//         <InteractiveCustomizer
//           product={product}
//           onCustomizationComplete={handleCustomizationComplete}
//           onClose={() => setIsCustomizing(false)}
//         />
//       )}

//     </div>
//   );
// }





















// import React, { useState } from "react";
// import { Star, Truck, ShieldCheck, Heart, Sparkles, Plus, Minus, ArrowLeft, MessageSquare, Check } from "lucide-react";
// import InteractiveCustomizer from "../components/InteractiveCustomizer.jsx";

// export default function ProductDetail({
//   product,
//   onBack,
//   onAddToCart,
//   wishlist,
//   onToggleWishlist
// }) {
//   const [mainImage, setMainImage] = useState(product.images[0]);
//   const [quantity, setQuantity] = useState(1);
//   const [isCustomizing, setIsCustomizing] = useState(false);
//   const [savedCustomization, setSavedCustomization] = useState(null);

//   // Review submission state
//   const [reviewName, setReviewName] = useState("");
//   const [reviewRating, setReviewRating] = useState(5);
//   const [reviewComment, setReviewComment] = useState("");
//   const [submittingReview, setSubmittingReview] = useState(false);
//   const [reviews, setReviews] = useState(product.reviews);

//   const isSaved = wishlist.includes(product.id);
//   const activePrice = product.discountPrice || product.price;

//   const handleCustomizationComplete = (details) => {
//     setSavedCustomization(details);
//     setIsCustomizing(false);
//   };

//   const handleAddToCartClick = () => {
//     const item = {
//       product,
//       quantity,
//       isCustomized: !!savedCustomization,
//       customization: savedCustomization || undefined,
//       finalPrice: activePrice
//     };
//     onAddToCart(item);
//     alert(`${product.name} ${savedCustomization ? "(Customized)" : ""} added to cart successfully!`);
//   };

//   const handleReviewSubmit = async (e) => {
//     e.preventDefault();
//     if (!reviewComment.trim()) return;
//     setSubmittingReview(true);

//     try {
//       const res = await fetch(`/api/products/${product.id}/reviews`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userName: reviewName || "Anonymous Customer",
//           rating: reviewRating,
//           comment: reviewComment
//         })
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setReviews(data.reviews);
//         setReviewName("");
//         setReviewComment("");
//         alert("Review added! Thank you for the feedback.");
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setSubmittingReview(false);
//     }
//   };

//   return (
//     <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in" id="product-detail-view">
      
//       {/* Back to Shop Nav bar */}
//       <button
//         onClick={onBack}
//         className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white group cursor-pointer"
//         id="back-to-shop-btn"
//       >
//         <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
//         Back to Elite Catalog
//       </button>

//       {/* Main split details grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
//         {/* Left Side: Thumbnail slider & Main preview */}
//         <div className="lg:col-span-6 space-y-4">
          
//           {/* Zoomable main stage */}
//           <div className="aspect-square bg-[#090d16] rounded-3xl border border-slate-900 overflow-hidden p-12 flex items-center justify-center relative">
//             <img
//               src={mainImage}
//               alt={product.name}
//               className="max-h-full max-w-full object-contain transform hover:scale-105 transition-transform duration-300"
//               referrerPolicy="no-referrer"
//               id="main-product-stage-img"
//             />
//           </div>

//           {/* Thumbnail list row */}
//           <div className="flex gap-4">
//             {product.images.map((imgUrl, i) => (
//               <button
//                 key={i}
//                 onClick={() => setMainImage(imgUrl)}
//                 className={`w-20 h-20 bg-[#090d16] rounded-xl border p-2 flex items-center justify-center transition-all overflow-hidden ${
//                   mainImage === imgUrl ? "border-orange-500 scale-102 ring-2 ring-orange-500/20" : "border-slate-900 hover:border-slate-800"
//                 }`}
//               >
//                 <img src={imgUrl} alt="Thumbnail preview" className="object-contain max-h-full max-w-full" referrerPolicy="no-referrer" />
//               </button>
//             ))}
//           </div>

//         </div>

//         {/* Right Side: Product configuration specifications */}
//         <div className="lg:col-span-6 space-y-6">
          
//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">{product.category}</span>
//               <button
//                 onClick={() => onToggleWishlist(product.id)}
//                 className="flex items-center gap-1 text-xs text-gray-400 hover:text-rose-500"
//               >
//                 <Heart className={`w-4 h-4 ${isSaved ? "text-rose-500 fill-rose-500" : ""}`} />
//                 <span>{isSaved ? "Saved" : "Save Design"}</span>
//               </button>
//             </div>
//             <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">{product.name}</h1>
//           </div>

//           {/* Price display segment */}
//           <div className="flex items-baseline gap-3 pb-4 border-b border-slate-900">
//             {product.discountPrice ? (
//               <>
//                 <span className="text-3xl font-display font-extrabold text-white">${product.discountPrice}</span>
//                 <span className="text-sm text-gray-500 line-through">${product.price}</span>
//               </>
//             ) : (
//               <span className="text-3xl font-display font-extrabold text-white">${product.price}</span>
//             )}
//             <span className="text-xs text-gray-400 pl-2 font-mono">In stock & Ready for custom engraving</span>
//           </div>

//           {/* Description */}
//           <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>

//           {/* Safe shipment delivery indicators */}
//           <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-400 py-3 border-y border-slate-900">
//             <div className="flex items-center gap-2">
//               <Truck className="w-4 h-4 text-orange-500" />
//               <span>D&H Shipping: {product.deliveryTime}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <ShieldCheck className="w-4 h-4 text-orange-500" />
//               <span>Certified Litho Quality</span>
//             </div>
//           </div>

//           {/* Interactive Customize Action Block */}
//           {product.isCustomizable && (
//             <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-900 space-y-4">
//               <div className="flex items-start justify-between">
//                 <div className="space-y-1">
//                   <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
//                     <Sparkles className="w-4 h-4 text-orange-500" />
//                     Bespoke Design Studio Available
//                   </h4>
//                   <p className="text-xs text-gray-400 leading-relaxed">
//                     Personalize with corporate logos, vectors, and custom slogan texts. Inspected dynamically by Google Gemini.
//                   </p>
//                 </div>
//               </div>

//               {savedCustomization ? (
//                 <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-2 text-emerald-400">
//                   <div className="flex items-center gap-2 text-xs font-bold">
//                     <Check className="w-4 h-4" />
//                     <span>✓ Custom Proof Approved & Saved</span>
//                   </div>
//                   {savedCustomization.text && (
//                     <p className="text-[11px] text-gray-300">Custom Text: <span className="text-white font-semibold">"{savedCustomization.text}"</span></p>
//                   )}
//                   {savedCustomization.geminiFeedback && (
//                     <div className="mt-1 bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 text-gray-300 font-mono text-[10px] space-y-1">
//                       <p className="font-bold text-orange-400">GEMINI VERIFICATION:</p>
//                       <p>{savedCustomization.geminiFeedback.quality}</p>
//                     </div>
//                   )}
//                   <button
//                     onClick={() => setIsCustomizing(true)}
//                     className="text-xs text-orange-400 hover:text-orange-300 font-bold underline pt-1 block"
//                   >
//                     Modify Custom Proof
//                   </button>
//                 </div>
//               ) : (
//                 <button
//                   onClick={() => setIsCustomizing(true)}
//                   className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
//                   id="open-customizer-btn"
//                 >
//                   <Sparkles className="w-4 h-4 animate-pulse" />
//                   Launch Live Customizer
//                 </button>
//               )}
//             </div>
//           )}

//           {/* Stepper & Main Add to cart */}
//           <div className="flex gap-4 items-center pt-4">
            
//             {/* Quantity stepper */}
//             <div className="flex items-center bg-slate-900/60 border border-slate-800 rounded-xl">
//               <button
//                 onClick={() => setQuantity(Math.max(1, quantity - 1))}
//                 className="p-3 text-gray-400 hover:text-white"
//               >
//                 <Minus className="w-3.5 h-3.5" />
//               </button>
//               <span className="font-mono text-sm px-3 text-white font-semibold">{quantity}</span>
//               <button
//                 onClick={() => setQuantity(quantity + 1)}
//                 className="p-3 text-gray-400 hover:text-white"
//               >
//                 <Plus className="w-3.5 h-3.5" />
//               </button>
//             </div>

//             {/* Submit to cart */}
//             <button
//               onClick={handleAddToCartClick}
//               className="flex-1 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 hover:border-slate-700 text-gray-300 font-bold text-xs uppercase tracking-wider py-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
//               id="product-add-to-cart-btn"
//             >
//               Add {savedCustomization ? "Custom Proof" : "Standard"} to Cart
//             </button>

//           </div>

//           {/* Specifications table */}
//           <div className="space-y-4 pt-6 border-t border-slate-900">
//             <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">Specifications Sheet</h4>
//             <div className="grid grid-cols-1 gap-2.5">
//               {Object.entries(product.specifications).map(([k, v]) => (
//                 <div key={k} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-900/60 text-gray-400">
//                   <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">{k}</span>
//                   <span className="text-white font-medium">{v}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//         </div>

//       </div>

//       {/* Product Reviews Column Block */}
//       <section className="pt-16 border-t border-slate-900 space-y-12">
//         <div className="flex items-center gap-2.5">
//           <MessageSquare className="w-5 h-5 text-orange-500" />
//           <h2 className="font-display font-extrabold text-2xl text-white">Client Reviews ({reviews.length})</h2>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
//           {/* Reviews list (Left) */}
//           <div className="lg:col-span-7 space-y-6">
//             {reviews.length === 0 ? (
//               <p className="text-xs text-gray-500 italic">No reviews have been published for this item yet. Be the first to leave your feedback!</p>
//             ) : (
//               reviews.map((rev) => (
//                 <div key={rev.id} className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-3">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <h4 className="text-xs font-bold text-white">{rev.userName}</h4>
//                       <p className="text-[10px] text-gray-500 font-mono mt-0.5">{rev.createdAt}</p>
//                     </div>
//                     <div className="flex text-amber-500">
//                       {Array.from({ length: 5 }).map((_, i) => (
//                         <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-500" : "text-gray-800"}`} />
//                       ))}
//                     </div>
//                   </div>
//                   <p className="text-gray-300 text-xs leading-relaxed italic">"{rev.comment}"</p>
//                 </div>
//               ))
//             )}
//           </div>

//           {/* Add review form (Right) */}
//           <div className="lg:col-span-5 bg-slate-950/40 border border-slate-900 p-6 rounded-3xl space-y-4">
//             <h4 className="font-display font-bold text-base text-white">Leave a Review</h4>
            
//             <form onSubmit={handleReviewSubmit} className="space-y-4">
              
//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Your Name</label>
//                 <input
//                   type="text"
//                   value={reviewName}
//                   onChange={(e) => setReviewName(e.target.value)}
//                   placeholder="E.g., David M."
//                   className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white outline-none"
//                 />
//               </div>

//               {/* Star selector */}
//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rating Score</label>
//                 <div className="flex gap-1.5 text-amber-500">
//                   {[1, 2, 3, 4, 5].map(num => (
//                     <button
//                       key={num}
//                       type="button"
//                       onClick={() => setReviewRating(num)}
//                       className="p-1 hover:scale-110 transition-transform cursor-pointer"
//                     >
//                       <Star className={`w-5 h-5 ${num <= reviewRating ? "fill-amber-500" : "text-slate-800"}`} />
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="space-y-1">
//                 <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Review Comments</label>
//                 <textarea
//                   required
//                   value={reviewComment}
//                   onChange={(e) => setReviewComment(e.target.value)}
//                   placeholder="Share details of your print experience..."
//                   className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white outline-none h-20 resize-none"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={submittingReview}
//                 className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-gray-300 font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all cursor-pointer"
//               >
//                 Submit Feedback Review
//               </button>

//             </form>

//           </div>

//         </div>
//       </section>

//       {/* Dynamic Customizable overlay studio model */}
//       {isCustomizing && (
//         <InteractiveCustomizer
//           product={product}
//           onCustomizationComplete={handleCustomizationComplete}
//           onClose={() => setIsCustomizing(false)}
//         />
//       )}

//     </div>
//   );
// }
