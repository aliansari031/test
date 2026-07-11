import React, { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Award, Shield, Zap } from "lucide-react";
import { TESTIMONIALS } from "../data.js";

export default function Home({
  featuredProducts,
  portfolioProjects,
  onTabChange,
  onSelectProduct
}) {
  const [banner, setBanner] = useState("");

  // Fetch active hero banner configuration from API
  useEffect(() => {
    fetch("/api/settings/banner")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Network response was not ok.");
      })
      .then((data) => setBanner(data.bannerUrl || ""))
      .catch((err) => console.log("Failed to fetch custom hero banner:", err));
  }, []);

  const PROCESS_STEPS = [
    {
      step: "01",
      title: "Select & Customize",
      desc: "Pick your product and launch the Live customizer. Refine margins, text, and colors."
    },
    {
      step: "02",
      title: "Gemini AI Guard Check",
      desc: "Our real-time Gemini neural model verifies resolution, bleed lines, and background transparent layers."
    },
    {
      step: "03",
      title: "Premium Lithography Press",
      desc: "Your design is routed to heavy state-of-the-art CMYK offset or laser digital printing presses."
    },
    {
      step: "04",
      title: "Prism Packaging & Ship",
      desc: "Double-inspected, packed in luxury matte-black boxes, and delivered straight to your studio door."
    }
  ];

  return (
    <div className="pt-20 space-y-24" id="home-page-container">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden py-8" id="hero-segment">
        {/* Background glow graphics */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-orange-600/10 blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-900/40 rounded-full animate-spin-slow pointer-events-none" />
        </div>

        {banner ? (
          /* DYNAMIC BANNER VIEW (When uploaded from Admin Panel) */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="border border-slate-900 rounded-3xl overflow-hidden bg-black/40 backdrop-blur-sm shadow-2xl">
              <img 
                src={banner} 
                alt="Wao Prints Heavy Duty Banner" 
                className="w-full h-auto object-cover max-h-[70vh]" 
              />
            </div>
          </div>
        ) : (
          /* FALLBACK DEFAULT VIEW (Standard Typography & CTAs) */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
            
            {/* Animated luxury batch */}
            <div className="inline-flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-orange-400 font-mono tracking-widest uppercase shadow-md shadow-orange-500/5 animate-bounce">
               Welcome To Wao Printr
            </div>

            {/* Majestic Heading */}
            <h1 className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl text-white tracking-tight leading-none max-w-5xl mx-auto">
              Heavy-Duty Prints.<br />
              <span className="text-gradient">Print Like A Waoo.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
               Premium lithography printing, elegant linen business cards, customized corporate gifts, and precision-crafted <span className="text-white font-medium">branding solutions delivered with exceptional quality</span>. fast turnaround, and real-time order tracking to ensure every detail reflects your brand's excellence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <button
                onClick={() => onTabChange("shop")}
                className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-98 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                id="hero-shop-cta"
              >
                See Products
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onTabChange("services")}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer"
                id="hero-services-cta"
              >
                Explore Print Services
              </button>
            </div>

            {/* Logo features banner */}
            <div className="pt-16 space-y-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-mono">Trusted by Global Design Agencies</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-gray-500 font-display font-bold text-lg opacity-60">
                <span className="hover:text-white transition-colors">VERVE COFFEE</span>
                <span className="hover:text-white transition-colors">SOLIS SUMMIT</span>
                <span className="hover:text-white transition-colors">AURA LIVING</span>
                <span className="hover:text-white transition-colors">CRAFT CORP</span>
              </div>
            </div>

          </div>
        )}
      </section>

      {/* 2. FEATURED PRODUCTS (SHOP PREVIEW) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">Premium Materials</span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-1">Featured Custom Gear</h2>
          </div>
          <button
            onClick={() => onTabChange("shop")}
            className="text-sm font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 group cursor-pointer"
          >
            Browse entire collection
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.slice(0, 3).map((prod) => (
            <div
              key={prod.id}
              onClick={() => onSelectProduct(prod)}
              className="group bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-102 flex flex-col justify-between"
              id={`featured-product-card-${prod.id}`}
            >
              {/* Image Frame */}
              <div className="aspect-square bg-[#090d16] relative overflow-hidden flex items-center justify-center p-8">
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                {prod.discountPrice && (
                  <span className="absolute top-4 left-4 bg-orange-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                    Promo Offer
                  </span>
                )}
                {prod.isCustomizable && (
                  <span className="absolute top-4 right-4 bg-slate-900/80 border border-slate-800 text-gray-300 font-mono text-[9px] px-2.5 py-1 rounded-md">
                    ★ Customizable
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{prod.category}</p>
                  <h3 className="font-display font-bold text-lg text-white group-hover:text-orange-400 transition-colors">{prod.name}</h3>
                </div>
                
                <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{prod.description}</p>
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-900/60">
                  {/* Price Display Segment Updated to Rs. */}
                  <div className="flex items-baseline gap-2">
                    {prod.discountPrice ? (
                      <>
                        <span className="text-xl font-display font-bold text-white">Rs. {prod.discountPrice.toLocaleString('en-PK')}</span>
                        <span className="text-xs text-gray-500 line-through">Rs. {prod.price.toLocaleString('en-PK')}</span>
                      </>
                    ) : (
                      <span className="text-xl font-display font-bold text-white">Rs. {prod.price.toLocaleString('en-PK')}</span>
                    )}
                  </div>
                  <span className="bg-slate-900 group-hover:bg-orange-500 group-hover:text-white text-orange-400 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200">
                    Configure
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* 3. CORE PRINTING PROCESS TIMELINE */}
      <section className="bg-[#070a12] py-20 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center space-y-3">
            <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">The Print Lab</span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white">Prism High Precision Workflow</h2>
            <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
               We've digitized standard mechanical print loops. See how your artwork scales from computer pixels to high gloss dyes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((stepItem, i) => (
              <div
                key={i}
                className="bg-slate-950/40 border border-slate-900/80 rounded-2xl p-6 space-y-6 relative hover:border-slate-800 transition-all duration-200"
              >
                <div className="font-display font-extrabold text-4xl text-orange-500/20 absolute top-4 right-4 font-mono">{stepItem.step}</div>
                <div className="w-10 h-10 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-400 font-bold">
                  {i + 1}
                </div>
                <div className="space-y-2">
                  <h4 className="font-display font-bold text-lg text-white">{stepItem.title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">{stepItem.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. WHY CHOOSE US - OUR METRICS AND VALUES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side values */}
        <div className="space-y-8">
          <div className="space-y-3">
            <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">Architectural Rigor</span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">Why Luxury Brands Select WAO PRINTS</h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
               We do not press run-of-the-mill flyers. Our focus is structural cardboard, heavy heavyweight clothing, deep-dye sublimated porcelain, and gold-foiled stationery.
            </p>
          </div>

          <div className="space-y-6 text-sm">
            
            <div className="flex gap-4">
              <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500 shrink-0 h-11 w-11 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white">300+ Line-Screen Resolution</h4>
                <p className="text-gray-400 text-xs">Twice the clarity of standard litho web-presses. Tiny text is legible and colors look perfectly natural.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500 shrink-0 h-11 w-11 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white">Certified Recycled Stocks</h4>
                <p className="text-gray-400 text-xs">Sustainability coupled with high caliber weight. Organic cotton weaves and FSC certified papers.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500 shrink-0 h-11 w-11 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white">Gemini Print Guard Verification</h4>
                <p className="text-gray-400 text-xs">Guarantees zero printing flaws. The AI inspects transparent overlay contrast and bleed line limits.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side Stats Board */}
        <div className="grid grid-cols-2 gap-6 p-8 rounded-3xl bg-slate-950/40 border border-slate-900 glass-card">
          
          <div className="space-y-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-900/60 text-center sm:text-left">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Impressions Pressed</p>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-orange-500">4.8M+</div>
            <p className="text-[11px] text-gray-400">Pristine packaging boxes and business cards.</p>
          </div>

          <div className="space-y-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-900/60 text-center sm:text-left">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Global Agencies</p>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-orange-500">1,200+</div>
            <p className="text-[11px] text-gray-400">Trusting us with premium corporate merchandise.</p>
          </div>

          <div className="space-y-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-900/60 text-center sm:text-left">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">AI Verified Proofs</p>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-orange-500">99.8%</div>
            <p className="text-[11px] text-gray-400">Prism printing success rates with zero print errors.</p>
          </div>

          <div className="space-y-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-900/60 text-center sm:text-left">
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Turnaround Speed</p>
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-orange-500">48 hrs</div>
            <p className="text-[11px] text-gray-400">Fast physical printing times on primary catalogue lines.</p>
          </div>

        </div>
      </section>

      {/* 5. PORTFOLIO PREVIEW */}
      <section className="bg-[#070a12] py-20 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <div>
              <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">Client Success Stories</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-1">Prism Portfolio Masterworks</h2>
            </div>
            <button
              onClick={() => onTabChange("portfolio")}
              className="text-sm font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 group cursor-pointer"
            >
              See our portfolio
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portfolioProjects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                onClick={() => onTabChange("portfolio")}
                className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-900 cursor-pointer border border-slate-900/80"
              >
                <img
                  src={proj.imageUrl}
                  alt={proj.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 space-y-1">
                  <span className="text-[9px] font-mono text-orange-400 uppercase tracking-widest">{proj.category}</span>
                  <h4 className="font-display font-bold text-lg text-white">{proj.title}</h4>
                  <p className="text-gray-400 text-xs line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{proj.description}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        <div className="text-center space-y-3">
          <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">Words from Partners</span>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white">Prism Print Testimonials</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((test, index) => (
            <div
              key={index}
              className="bg-slate-950/40 border border-slate-900 p-8 rounded-3xl flex flex-col justify-between space-y-6 relative"
            >
              <span className="text-6xl font-serif text-orange-500/10 absolute top-4 left-4">“</span>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed relative z-10 italic">
                "{test.quote}"
              </p>
              
              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-900">
                <img
                  src={test.avatar}
                  alt={test.author}
                  className="w-10 h-10 rounded-full object-cover border border-slate-800"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-bold text-white text-xs">{test.author}</h4>
                  <p className="text-[10px] text-gray-500">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

    </div>
  );
}

















// import React, { useState, useEffect } from "react";
// import { ArrowRight, Sparkles, Award, Shield, Zap } from "lucide-react";
// import { TESTIMONIALS } from "../data.js";

// export default function Home({
//   featuredProducts,
//   portfolioProjects,
//   onTabChange,
//   onSelectProduct
// }) {
//   const [banner, setBanner] = useState("");

//   // Fetch active hero banner configuration from API
//   useEffect(() => {
//     fetch("/api/settings/banner")
//       .then((res) => {
//         if (res.ok) return res.json();
//         throw new Error("Network response was not ok.");
//       })
//       .then((data) => setBanner(data.bannerUrl || ""))
//       .catch((err) => console.log("Failed to fetch custom hero banner:", err));
//   }, []);

//   const PROCESS_STEPS = [
//     {
//       step: "01",
//       title: "Select & Customize",
//       desc: "Pick your product and launch the Live customizer. Refine margins, text, and colors."
//     },
//     {
//       step: "02",
//       title: "Gemini AI Guard Check",
//       desc: "Our real-time Gemini neural model verifies resolution, bleed lines, and background transparent layers."
//     },
//     {
//       step: "03",
//       title: "Premium Lithography Press",
//       desc: "Your design is routed to heavy state-of-the-art CMYK offset or laser digital printing presses."
//     },
//     {
//       step: "04",
//       title: "Prism Packaging & Ship",
//       desc: "Double-inspected, packed in luxury matte-black boxes, and delivered straight to your studio door."
//     }
//   ];

//   return (
//     <div className="pt-20 space-y-24" id="home-page-container">
      
//       {/* 1. HERO SECTION */}
//       <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden py-8" id="hero-segment">
//         {/* Background glow graphics */}
//         <div className="absolute inset-0 z-0 pointer-events-none">
//           <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-orange-600/10 blur-[120px]" />
//           <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[150px]" />
//           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-900/40 rounded-full animate-spin-slow pointer-events-none" />
//         </div>

//         {banner ? (
//           /* DYNAMIC BANNER VIEW (When uploaded from Admin Panel) */
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
//             <div className="border border-slate-900 rounded-3xl overflow-hidden bg-black/40 backdrop-blur-sm shadow-2xl">
//               <img 
//                 src={banner} 
//                 alt="Wao Prints Heavy Duty Banner" 
//                 className="w-full h-auto object-cover max-h-[70vh]" 
//               />
//             </div>
//           </div>
//         ) : (
//           /* FALLBACK DEFAULT VIEW (Standard Typography & CTAs) */
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
            
//             {/* Animated luxury batch */}
//             <div className="inline-flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-orange-400 font-mono tracking-widest uppercase shadow-md shadow-orange-500/5 animate-bounce">
//                Welcome To Wao Printr
//             </div>

//             {/* Majestic Heading */}
//             <h1 className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl text-white tracking-tight leading-none max-w-5xl mx-auto">
//               Heavy-Duty Prints.<br />
//               <span className="text-gradient">Print Like A Waoo.</span>
//             </h1>

//             {/* Subtitle */}
//             <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
//              Premium lithography printing, elegant linen business cards, customized corporate gifts, and precision-crafted <span className="text-white font-medium">branding solutions delivered with exceptional quality</span>. fast turnaround, and real-time order tracking to ensure every detail reflects your brand's excellence.
//             </p>

//             {/* CTA Buttons */}
//             <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
//               <button
//                 onClick={() => onTabChange("shop")}
//                 className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 active:scale-98 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
//                 id="hero-shop-cta"
//               >
//                 See Products
//                 <ArrowRight className="w-4 h-4" />
//               </button>
//               <button
//                 onClick={() => onTabChange("services")}
//                 className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer"
//                 id="hero-services-cta"
//               >
//                 Explore Print Services
//               </button>
//             </div>

//             {/* Logo features banner */}
//             <div className="pt-16 space-y-4">
//               <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-mono">Trusted by Global Design Agencies</p>
//               <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-gray-500 font-display font-bold text-lg opacity-60">
//                 <span className="hover:text-white transition-colors">VERVE COFFEE</span>
//                 <span className="hover:text-white transition-colors">SOLIS SUMMIT</span>
//                 <span className="hover:text-white transition-colors">AURA LIVING</span>
//                 <span className="hover:text-white transition-colors">CRAFT CORP</span>
//               </div>
//             </div>

//           </div>
//         )}
//       </section>

//       {/* 2. FEATURED PRODUCTS (SHOP PREVIEW) */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
//         <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
//           <div>
//             <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">Premium Materials</span>
//             <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-1">Featured Custom Gear</h2>
//           </div>
//           <button
//             onClick={() => onTabChange("shop")}
//             className="text-sm font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 group cursor-pointer"
//           >
//             Browse entire collection
//             <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//           </button>
//         </div>

//         {/* Product Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//           {featuredProducts.slice(0, 3).map((prod) => (
//             <div
//               key={prod.id}
//               onClick={() => onSelectProduct(prod)}
//               className="group bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-102 flex flex-col justify-between"
//               id={`featured-product-card-${prod.id}`}
//             >
//               {/* Image Frame */}
//               <div className="aspect-square bg-[#090d16] relative overflow-hidden flex items-center justify-center p-8">
//                 <img
//                   src={prod.images[0]}
//                   alt={prod.name}
//                   className="max-h-full max-w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
//                   referrerPolicy="no-referrer"
//                 />
//                 {prod.discountPrice && (
//                   <span className="absolute top-4 left-4 bg-orange-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
//                     Promo Offer
//                   </span>
//                 )}
//                 {prod.isCustomizable && (
//                   <span className="absolute top-4 right-4 bg-slate-900/80 border border-slate-800 text-gray-300 font-mono text-[9px] px-2.5 py-1 rounded-md">
//                     ★ Customizable
//                   </span>
//                 )}
//               </div>

//               {/* Product Info */}
//               <div className="p-6 space-y-4">
//                 <div className="space-y-1.5">
//                   <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{prod.category}</p>
//                   <h3 className="font-display font-bold text-lg text-white group-hover:text-orange-400 transition-colors">{prod.name}</h3>
//                 </div>
                
//                 <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{prod.description}</p>
                
//                 <div className="flex items-center justify-between pt-2 border-t border-slate-900/60">
//                   <div className="flex items-baseline gap-2">
//                     {prod.discountPrice ? (
//                       <>
//                         <span className="text-xl font-display font-bold text-white">${prod.discountPrice}</span>
//                         <span className="text-xs text-gray-500 line-through">${prod.price}</span>
//                       </                    >
//                     ) : (
//                       <span className="text-xl font-display font-bold text-white">${prod.price}</span>
//                     )}
//                   </div>
//                   <span className="bg-slate-900 group-hover:bg-orange-500 group-hover:text-white text-orange-400 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200">
//                     Configure
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//       </section>

//       {/* 3. CORE PRINTING PROCESS TIMELINE */}
//       <section className="bg-[#070a12] py-20 border-y border-slate-900">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
//           <div className="text-center space-y-3">
//             <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">The Print Lab</span>
//             <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white">Prism High Precision Workflow</h2>
//             <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
//               We've digitized standard mechanical print loops. See how your artwork scales from computer pixels to high gloss dyes.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {PROCESS_STEPS.map((stepItem, i) => (
//               <div
//                 key={i}
//                 className="bg-slate-950/40 border border-slate-900/80 rounded-2xl p-6 space-y-6 relative hover:border-slate-800 transition-all duration-200"
//               >
//                 <div className="font-display font-extrabold text-4xl text-orange-500/20 absolute top-4 right-4 font-mono">{stepItem.step}</div>
//                 <div className="w-10 h-10 rounded-xl bg-orange-600/10 flex items-center justify-center text-orange-400 font-bold">
//                   {i + 1}
//                 </div>
//                 <div className="space-y-2">
//                   <h4 className="font-display font-bold text-lg text-white">{stepItem.title}</h4>
//                   <p className="text-gray-400 text-xs leading-relaxed">{stepItem.desc}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//         </div>
//       </section>

//       {/* 4. WHY CHOOSE US - OUR METRICS AND VALUES */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
//         {/* Left Side values */}
//         <div className="space-y-8">
//           <div className="space-y-3">
//             <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">Architectural Rigor</span>
//             <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">Why Luxury Brands Select WAO PRINTS</h2>
//             <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
//               We do not press run-of-the-mill flyers. Our focus is structural cardboard, heavy heavyweight clothing, deep-dye sublimated porcelain, and gold-foiled stationery.
//             </p>
//           </div>

//           <div className="space-y-6 text-sm">
            
//             <div className="flex gap-4">
//               <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500 shrink-0 h-11 w-11 flex items-center justify-center">
//                 <Award className="w-5 h-5" />
//               </div>
//               <div className="space-y-1">
//                 <h4 className="font-bold text-white">300+ Line-Screen Resolution</h4>
//                 <p className="text-gray-400 text-xs">Twice the clarity of standard litho web-presses. Tiny text is legible and colors look perfectly natural.</p>
//               </div>
//             </div>

//             <div className="flex gap-4">
//               <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500 shrink-0 h-11 w-11 flex items-center justify-center">
//                 <Shield className="w-5 h-5" />
//               </div>
//               <div className="space-y-1">
//                 <h4 className="font-bold text-white">Certified Recycled Stocks</h4>
//                 <p className="text-gray-400 text-xs">Sustainability coupled with high caliber weight. Organic cotton weaves and FSC certified papers.</p>
//               </div>
//             </div>

//             <div className="flex gap-4">
//               <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500 shrink-0 h-11 w-11 flex items-center justify-center">
//                 <Zap className="w-5 h-5" />
//               </div>
//               <div className="space-y-1">
//                 <h4 className="font-bold text-white">Gemini Print Guard Verification</h4>
//                 <p className="text-gray-400 text-xs">Guarantees zero printing flaws. The AI inspects transparent overlay contrast and bleed line limits.</p>
//               </div>
//             </div>

//           </div>
//         </div>

//         {/* Right Side Stats Board */}
//         <div className="grid grid-cols-2 gap-6 p-8 rounded-3xl bg-slate-950/40 border border-slate-900 glass-card">
          
//           <div className="space-y-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-900/60 text-center sm:text-left">
//             <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Impressions Pressed</p>
//             <div className="font-display font-extrabold text-3xl sm:text-4xl text-orange-500">4.8M+</div>
//             <p className="text-[11px] text-gray-400">Pristine packaging boxes and business cards.</p>
//           </div>

//           <div className="space-y-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-900/60 text-center sm:text-left">
//             <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Global Agencies</p>
//             <div className="font-display font-extrabold text-3xl sm:text-4xl text-orange-500">1,200+</div>
//             <p className="text-[11px] text-gray-400">Trusting us with premium corporate merchandise.</p>
//           </div>

//           <div className="space-y-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-900/60 text-center sm:text-left">
//             <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">AI Verified Proofs</p>
//             <div className="font-display font-extrabold text-3xl sm:text-4xl text-orange-500">99.8%</div>
//             <p className="text-[11px] text-gray-400">Prism printing success rates with zero print errors.</p>
//           </div>

//           <div className="space-y-2 p-6 rounded-2xl bg-slate-900/40 border border-slate-900/60 text-center sm:text-left">
//             <p className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Turnaround Speed</p>
//             <div className="font-display font-extrabold text-3xl sm:text-4xl text-orange-500">48 hrs</div>
//             <p className="text-[11px] text-gray-400">Fast physical printing times on primary catalogue lines.</p>
//           </div>

//         </div>
//       </section>

//       {/* 5. PORTFOLIO PREVIEW */}
//       <section className="bg-[#070a12] py-20 border-y border-slate-900">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
//           <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
//             <div>
//               <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">Client Success Stories</span>
//               <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-1">Prism Portfolio Masterworks</h2>
//             </div>
//             <button
//               onClick={() => onTabChange("portfolio")}
//               className="text-sm font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 group cursor-pointer"
//             >
//               See our portfolio
//               <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//             </button>
//           </div>

//           {/* Portfolio Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {portfolioProjects.slice(0, 3).map((proj) => (
//               <div
//                 key={proj.id}
//                 onClick={() => onTabChange("portfolio")}
//                 className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-slate-900 cursor-pointer border border-slate-900/80"
//               >
//                 <img
//                   src={proj.imageUrl}
//                   alt={proj.title}
//                   className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
//                   referrerPolicy="no-referrer"
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 space-y-1">
//                   <span className="text-[9px] font-mono text-orange-400 uppercase tracking-widest">{proj.category}</span>
//                   <h4 className="font-display font-bold text-lg text-white">{proj.title}</h4>
//                   <p className="text-gray-400 text-xs line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{proj.description}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//         </div>
//       </section>

//       {/* 6. TESTIMONIALS */}
//       <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
//         <div className="text-center space-y-3">
//           <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">Words from Partners</span>
//           <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white">Prism Print Testimonials</h2>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           {TESTIMONIALS.map((test, index) => (
//             <div
//               key={index}
//               className="bg-slate-950/40 border border-slate-900 p-8 rounded-3xl flex flex-col justify-between space-y-6 relative"
//             >
//               <span className="text-6xl font-serif text-orange-500/10 absolute top-4 left-4">“</span>
//               <p className="text-gray-300 text-xs sm:text-sm leading-relaxed relative z-10 italic">
//                 "{test.quote}"
//               </p>
              
//               <div className="flex items-center gap-3.5 pt-4 border-t border-slate-900">
//                 <img
//                   src={test.avatar}
//                   alt={test.author}
//                   className="w-10 h-10 rounded-full object-cover border border-slate-800"
//                   referrerPolicy="no-referrer"
//                 />
//                 <div>
//                   <h4 className="font-bold text-white text-xs">{test.author}</h4>
//                   <p className="text-[10px] text-gray-500">{test.role}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//       </section>

//     </div>
//   );
// }


 