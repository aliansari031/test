import React, { useState } from "react";
import { Search, Sliders, Star } from "lucide-react";

export default function Shop({
  products,
  onSelectProduct
}) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  const CATEGORIES = ["All", "Business Cards", "Mugs Printing", "Pen Printing", "T-Shirts", "Caps", "Sticker Printing"];

  // Handle Filtering & Sorting
  const filtered = products.filter(p => {
    const matchesCat = category === "All" || p.category === category;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0; // default
  });

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in" id="shop-page">
      
      {/* Title Segment */}
      <div className="text-center space-y-3">
        <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">THE PRISM COLLECTION</span>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white">Elite Print Catalog</h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
          Configure bespoke corporate and lifestyle assets. All merchandise items can be fully designed inside our live web-canvas interface.
        </p>
      </div>

      {/* Search and Filters Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Category Sidebar filters */}
        <div className="lg:col-span-3 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-900">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-500" />
              Print Lines
            </h4>
          </div>

          <div className="space-y-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 flex items-center justify-between cursor-pointer ${
                  category === cat
                    ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500"
                    : "text-gray-400 hover:text-white hover:bg-slate-900/40"
                }`}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Search and Product Display Grid */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* Controls toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-950/40 border border-slate-900 p-4 rounded-3xl">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search premium blanks..."
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl px-4 py-2 pl-9 text-xs text-white outline-none"
              />
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-orange-500/60"
              >
                <option value="default">Default Catalog Sorting</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Catalog grid list */}
          {sorted.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No printable materials match your criteria. Try widening your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sorted.map((prod) => {
                const avgRating = prod.reviews.length
                  ? (prod.reviews.reduce((acc, r) => acc + r.rating, 0) / prod.reviews.length).toFixed(1)
                  : "5.0";

                return (
                  <div
                    key={prod.id}
                    className="group bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-101 flex flex-col justify-between"
                    onClick={() => onSelectProduct(prod)}
                    id={`product-card-${prod.id}`}
                  >
                    {/* Visual Media Frame */}
                    <div className="aspect-square bg-[#090d16] p-8 flex items-center justify-center relative overflow-hidden">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />

                      {prod.discountPrice && (
                        <span className="absolute top-4 left-4 bg-orange-600 text-white font-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                          Sale Offers
                        </span>
                      )}

                      {prod.isCustomizable && (
                        <span className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-800/80 text-orange-400 font-mono text-[9px] px-2.5 py-1 rounded-md flex items-center gap-1 font-bold">
                          ★ Live Design Studio
                        </span>
                      )}
                    </div>

                    {/* Metadata text details */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                          <span>{prod.category}</span>
                          <div className="flex items-center gap-0.5 text-amber-500">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span className="font-sans font-semibold text-[10px]">{avgRating}</span>
                          </div>
                        </div>
                        <h3 className="font-display font-bold text-base text-white group-hover:text-orange-400 transition-colors">{prod.name}</h3>
                      </div>

                      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{prod.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-900/60">
                        {/* Price Display Segment */}
                        <div className="flex items-baseline gap-2">
                          {prod.discountPrice ? (
                            <>
                              <span className="text-lg font-display font-bold text-white">Rs. {prod.discountPrice.toLocaleString('en-PK')}</span>
                              <span className="text-xs text-gray-500 line-through">Rs. {prod.price.toLocaleString('en-PK')}</span>
                            </>
                          ) : (
                            <span className="text-lg font-display font-bold text-white">Rs. {prod.price.toLocaleString('en-PK')}</span>
                          )}
                        </div>
                        <span className="bg-slate-900 group-hover:bg-orange-500 group-hover:text-white text-orange-400 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200">
                          Configure
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}








// import React, { useState } from "react";
// import { Search, Sliders, Star, Heart } from "lucide-react";

// export default function Shop({
//   products,
//   onSelectProduct,
//   wishlist,
//   onToggleWishlist
// }) {
//   const [category, setCategory] = useState("All");
//   const [search, setSearch] = useState("");
//   const [sortBy, setSortBy] = useState("default");

//   const CATEGORIES = ["All", "Business Cards", "Mugs Printing", "Pen Printing", "T-Shirts", "Caps", "Sticker Printing"];

//   // Handle Filtering & Sorting
//   const filtered = products.filter(p => {
//     const matchesCat = category === "All" || p.category === category;
//     const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
//                           p.description.toLowerCase().includes(search.toLowerCase());
//     return matchesCat && matchesSearch;
//   });

//   const sorted = [...filtered].sort((a, b) => {
//     if (sortBy === "price-low") return a.price - b.price;
//     if (sortBy === "price-high") return b.price - a.price;
//     if (sortBy === "name") return a.name.localeCompare(b.name);
//     return 0; // default
//   });

//   return (
//     <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in" id="shop-page">
      
//       {/* Title Segment */}
//       <div className="text-center space-y-3">
//         <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">THE PRISM COLLECTION</span>
//         <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white">Elite Print Catalog</h1>
//         <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
//           Configure bespoke corporate and lifestyle assets. All merchandise items can be fully designed inside our live web-canvas interface.
//         </p>
//       </div>

//       {/* Search and Filters Segment */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
//         {/* Left Side: Category Sidebar filters */}
//         <div className="lg:col-span-3 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-6">
//           <div className="flex items-center justify-between pb-3 border-b border-slate-900">
//             <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
//               <Sliders className="w-4 h-4 text-orange-500" />
//               Print Lines
//             </h4>
//           </div>

//           <div className="space-y-1.5">
//             {CATEGORIES.map(cat => (
//               <button
//                 key={cat}
//                 onClick={() => setCategory(cat)}
//                 className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 flex items-center justify-between cursor-pointer ${
//                   category === cat
//                     ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500"
//                     : "text-gray-400 hover:text-white hover:bg-slate-900/40"
//                 }`}
//               >
//                 <span>{cat}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Right Side: Search and Product Display Grid */}
//         <div className="lg:col-span-9 space-y-8">
          
//           {/* Controls toolbar */}
//           <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-950/40 border border-slate-900 p-4 rounded-3xl">
//             {/* Search */}
//             <div className="relative w-full sm:w-72">
//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search premium blanks..."
//                 className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl px-4 py-2 pl-9 text-xs text-white outline-none"
//               />
//               <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
//             </div>

//             {/* Sorting */}
//             <div className="flex items-center gap-2 text-xs text-gray-400">
//               <span>Sort by:</span>
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-orange-500/60"
//               >
//                 <option value="default">Default Catalog Sorting</option>
//                 <option value="price-low">Price: Low to High</option>
//                 <option value="price-high">Price: High to Low</option>
//                 <option value="name">Alphabetical</option>
//               </select>
//             </div>
//           </div>

//           {/* Catalog grid list */}
//           {sorted.length === 0 ? (
//             <div className="text-center py-20 text-gray-500">
//               No printable materials match your criteria. Try widening your filters.
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//               {sorted.map((prod) => {
//                 const isSaved = wishlist.includes(prod.id);
//                 const avgRating = prod.reviews.length
//                   ? (prod.reviews.reduce((acc, r) => acc + r.rating, 0) / prod.reviews.length).toFixed(1)
//                   : "5.0";

//                 return (
//                   <div
//                     key={prod.id}
//                     className="group bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-101 flex flex-col justify-between"
//                     onClick={() => onSelectProduct(prod)}
//                     id={`product-card-${prod.id}`}
//                   >
//                     {/* Visual Media Frame */}
//                     <div className="aspect-square bg-[#090d16] p-8 flex items-center justify-center relative overflow-hidden">
//                       <img
//                         src={prod.images[0]}
//                         alt={prod.name}
//                         className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
//                         referrerPolicy="no-referrer"
//                       />
                      
//                       {/* Favorite/Wishlist Button */}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onToggleWishlist(prod.id);
//                         }}
//                         className="absolute top-4 right-4 p-2 bg-slate-950/80 border border-slate-800 rounded-xl text-gray-400 hover:text-rose-500 hover:border-rose-950/50 transition-colors"
//                         title={isSaved ? "Remove Design" : "Save Design"}
//                       >
//                         <Heart className={`w-4.5 h-4.5 ${isSaved ? "text-rose-500 fill-rose-500" : ""}`} />
//                       </button>

//                       {prod.discountPrice && (
//                         <span className="absolute top-4 left-4 bg-orange-600 text-white font-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
//                           Sale Offers
//                         </span>
//                       )}

//                       {prod.isCustomizable && (
//                         <span className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-800/80 text-orange-400 font-mono text-[9px] px-2.5 py-1 rounded-md flex items-center gap-1 font-bold">
//                           ★ Live Design Studio
//                         </span>
//                       )}
//                     </div>

//                     {/* Metadata text details */}
//                     <div className="p-6 space-y-4">
//                       <div className="space-y-1.5">
//                         <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest">
//                           <span>{prod.category}</span>
//                           <div className="flex items-center gap-0.5 text-amber-500">
//                             <Star className="w-3 h-3 fill-amber-500" />
//                             <span className="font-sans font-semibold text-[10px]">{avgRating}</span>
//                           </div>
//                         </div>
//                         <h3 className="font-display font-bold text-base text-white group-hover:text-orange-400 transition-colors">{prod.name}</h3>
//                       </div>

//                       <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{prod.description}</p>

//                       <div className="flex items-center justify-between pt-2 border-t border-slate-900/60">
//                         {/* Price Display Segment Updated to Rs. */}
//                         <div className="flex items-baseline gap-2">
//                           {prod.discountPrice ? (
//                             <>
//                               <span className="text-lg font-display font-bold text-white">Rs. {prod.discountPrice.toLocaleString('en-PK')}</span>
//                               <span className="text-xs text-gray-500 line-through">Rs. {prod.price.toLocaleString('en-PK')}</span>
//                             </>
//                           ) : (
//                             <span className="text-lg font-display font-bold text-white">Rs. {prod.price.toLocaleString('en-PK')}</span>
//                           )}
//                         </div>
//                         <span className="bg-slate-900 group-hover:bg-orange-500 group-hover:text-white text-orange-400 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200">
//                           Configure
//                         </span>
//                       </div>
//                     </div>

//                   </div>
//                 );
//               })}
//             </div>
//           )}

//         </div>

//       </div>

//     </div>
//   );
// }

















// import React, { useState } from "react";
// import { Search, Sliders, Star, Heart } from "lucide-react";

// export default function Shop({
//   products,
//   onSelectProduct,
//   wishlist,
//   onToggleWishlist
// }) {
//   const [category, setCategory] = useState("All");
//   const [search, setSearch] = useState("");
//   const [sortBy, setSortBy] = useState("default");

//   const CATEGORIES = ["All", "Business Cards", "Mugs Printing", "Pen Printing", "T-Shirts", "Caps", "Sticker Printing"];

//   // Handle Filtering & Sorting
//   const filtered = products.filter(p => {
//     const matchesCat = category === "All" || p.category === category;
//     const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
//                           p.description.toLowerCase().includes(search.toLowerCase());
//     return matchesCat && matchesSearch;
//   });

//   const sorted = [...filtered].sort((a, b) => {
//     if (sortBy === "price-low") return a.price - b.price;
//     if (sortBy === "price-high") return b.price - a.price;
//     if (sortBy === "name") return a.name.localeCompare(b.name);
//     return 0; // default
//   });

//   return (
//     <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in" id="shop-page">
      
//       {/* Title Segment */}
//       <div className="text-center space-y-3">
//         <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">THE PRISM COLLECTION</span>
//         <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white">Elite Print Catalog</h1>
//         <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
//           Configure bespoke corporate and lifestyle assets. All merchandise items can be fully designed inside our live web-canvas interface.
//         </p>
//       </div>

//       {/* Search and Filters Segment */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
//         {/* Left Side: Category Sidebar filters */}
//         <div className="lg:col-span-3 bg-slate-950/40 border border-slate-900 rounded-3xl p-6 space-y-6">
//           <div className="flex items-center justify-between pb-3 border-b border-slate-900">
//             <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
//               <Sliders className="w-4 h-4 text-orange-500" />
//               Print Lines
//             </h4>
//           </div>

//           <div className="space-y-1.5">
//             {CATEGORIES.map(cat => (
//               <button
//                 key={cat}
//                 onClick={() => setCategory(cat)}
//                 className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 flex items-center justify-between cursor-pointer ${
//                   category === cat
//                     ? "bg-orange-500/10 text-orange-400 border-l-4 border-orange-500"
//                     : "text-gray-400 hover:text-white hover:bg-slate-900/40"
//                 }`}
//               >
//                 <span>{cat}</span>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Right Side: Search and Product Display Grid */}
//         <div className="lg:col-span-9 space-y-8">
          
//           {/* Controls toolbar */}
//           <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-950/40 border border-slate-900 p-4 rounded-3xl">
//             {/* Search */}
//             <div className="relative w-full sm:w-72">
//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search premium blanks..."
//                 className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl px-4 py-2 pl-9 text-xs text-white outline-none"
//               />
//               <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
//             </div>

//             {/* Sorting */}
//             <div className="flex items-center gap-2 text-xs text-gray-400">
//               <span>Sort by:</span>
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-orange-500/60"
//               >
//                 <option value="default">Default Catalog Sorting</option>
//                 <option value="price-low">Price: Low to High</option>
//                 <option value="price-high">Price: High to Low</option>
//                 <option value="name">Alphabetical</option>
//               </select>
//             </div>
//           </div>

//           {/* Catalog grid list */}
//           {sorted.length === 0 ? (
//             <div className="text-center py-20 text-gray-500">
//               No printable materials match your criteria. Try widening your filters.
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//               {sorted.map((prod) => {
//                 const isSaved = wishlist.includes(prod.id);
//                 const avgRating = prod.reviews.length
//                   ? (prod.reviews.reduce((acc, r) => acc + r.rating, 0) / prod.reviews.length).toFixed(1)
//                   : "5.0";

//                 return (
//                   <div
//                     key={prod.id}
//                     className="group bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-101 flex flex-col justify-between"
//                     onClick={() => onSelectProduct(prod)}
//                     id={`product-card-${prod.id}`}
//                   >
//                     {/* Visual Media Frame */}
//                     <div className="aspect-square bg-[#090d16] p-8 flex items-center justify-center relative overflow-hidden">
//                       <img
//                         src={prod.images[0]}
//                         alt={prod.name}
//                         className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
//                         referrerPolicy="no-referrer"
//                       />
                      
//                       {/* Favorite/Wishlist Button */}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onToggleWishlist(prod.id);
//                         }}
//                         className="absolute top-4 right-4 p-2 bg-slate-950/80 border border-slate-800 rounded-xl text-gray-400 hover:text-rose-500 hover:border-rose-950/50 transition-colors"
//                         title={isSaved ? "Remove Design" : "Save Design"}
//                       >
//                         <Heart className={`w-4.5 h-4.5 ${isSaved ? "text-rose-500 fill-rose-500" : ""}`} />
//                       </button>

//                       {prod.discountPrice && (
//                         <span className="absolute top-4 left-4 bg-orange-600 text-white font-mono text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
//                           Sale Offers
//                         </span>
//                       )}

//                       {prod.isCustomizable && (
//                         <span className="absolute bottom-4 left-4 bg-slate-950/80 border border-slate-800/80 text-orange-400 font-mono text-[9px] px-2.5 py-1 rounded-md flex items-center gap-1 font-bold">
//                           ★ Live Design Studio
//                         </span>
//                       )}
//                     </div>

//                     {/* Metadata text details */}
//                     <div className="p-6 space-y-4">
//                       <div className="space-y-1.5">
//                         <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest">
//                           <span>{prod.category}</span>
//                           <div className="flex items-center gap-0.5 text-amber-500">
//                             <Star className="w-3 h-3 fill-amber-500" />
//                             <span className="font-sans font-semibold text-[10px]">{avgRating}</span>
//                           </div>
//                         </div>
//                         <h3 className="font-display font-bold text-base text-white group-hover:text-orange-400 transition-colors">{prod.name}</h3>
//                       </div>

//                       <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{prod.description}</p>

//                       <div className="flex items-center justify-between pt-2 border-t border-slate-900/60">
//                         <div className="flex items-baseline gap-2">
//                           {prod.discountPrice ? (
//                             <>
//                               <span className="text-lg font-display font-bold text-white">${prod.discountPrice}</span>
//                               <span className="text-xs text-gray-500 line-through">${prod.price}</span>
//                             </>
//                           ) : (
//                             <span className="text-lg font-display font-bold text-white">${prod.price}</span>
//                           )}
//                         </div>
//                         <span className="bg-slate-900 group-hover:bg-orange-500 group-hover:text-white text-orange-400 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200">
//                           Configure
//                         </span>
//                       </div>
//                     </div>

//                   </div>
//                 );
//               })}
//             </div>
//           )}

//         </div>

//       </div>

//     </div>
//   );
// }
