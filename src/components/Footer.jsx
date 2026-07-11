import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Facebook, Instagram, ShieldCheck, Youtube } from "lucide-react";
 import waoLogo from "./waologo.png"; 




export default function Footer({ onTabChange }) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#070a12] border-t border-slate-900 pt-20 pb-10" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Segment: Brand and Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-slate-900">
          
          {/* Logo & Intro */}
          {/* <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange("home")}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/10">
                <span className="font-display font-extrabold text-white text-lg">W</span>
              </div>
              <div>
                <div className="font-display font-extrabold tracking-wider text-lg flex items-center gap-1 text-white">
                  WAO <span className="logo-gradient-text">PRINTS</span>
                </div>
                <p className="text-[8px] uppercase tracking-[0.25em] text-gray-500 font-mono">Print Like A Waoo</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              We engineer ultra-luxury print materials for brands that refuse to blend in. Leveraging cutting-edge precision lithography, laser digital tooling, and real-time Gemini AI layout analysis.
            </p> */}

            {/* Logo & Intro */}
<div className="lg:col-span-5 space-y-6">
  
  {/* Logo Main Action */}
  <div className="flex items-center cursor-pointer" onClick={() => onTabChange("home")}>
    <img 
      src={waoLogo} 
      alt="WAO PRINTS" 
      className="h-16 w-auto object-contain"
    />
  </div>

  <p className="text-gray-400 text-sm leading-relaxed max-w-md">
    We engineer ultra-luxury print materials for brands that refuse to blend in. Leveraging cutting-edge precision lithography, laser digital tooling, and real-time Gemini AI layout analysis.
  </p>
  
  {/* Social Icons... */}
            {/* Social Icons */}
            <div className="flex items-center gap-4 text-gray-500">
              <a href="https://www.facebook.com/share/1E9xTkLjTK/" target="_blank" rel="noreferrer" className="p-2 hover:bg-slate-900 hover:text-orange-500 rounded-lg transition-all duration-200"><Facebook className="w-4 h-4" /></a>
              <a href="https://youtube.com/@waooprints?si=3A6zuzIg2diIGXwK" target="_blank" rel="noreferrer" className="p-2 hover:bg-slate-900 hover:text-orange-500 rounded-lg transition-all duration-200"><Youtube className="w-4 h-4" /></a>
              <a href="https://www.instagram.com/waoprints/" target="_blank" rel="noreferrer" className="p-2 hover:bg-slate-900 hover:text-orange-500 rounded-lg transition-all duration-200"><Instagram className="w-4 h-4" /></a>
              {/* Manual SVG implementation for TikTok icon to avoid Lucide import errors */}
              <a href="https://www.tiktok.com/@waoo.prints?_r=1&_t=ZS-97ivv9DCa1t" target="_blank" rel="noreferrer" className="p-2 hover:bg-slate-900 hover:text-orange-500 rounded-lg transition-all duration-200">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.93 1.18 2.25 1.99 3.69 2.33v3.94c-1.38-.17-2.7-.77-3.76-1.68-.64-.56-1.16-1.25-1.52-2.02v8.59c.01 1.77-.55 3.51-1.6 4.88-1.44 1.88-3.77 2.94-6.14 2.82-2.3-.12-4.44-1.37-5.59-3.37-1.31-2.28-1.21-5.22.25-7.4 1.25-1.87 3.42-2.96 5.68-2.87v3.96c-1.12-.08-2.25.42-2.9 1.34-.69.98-.74 2.33-.12 3.35.63 1.05 1.85 1.66 3.08 1.51 1.17-.15 2.18-1.07 2.44-2.23.08-.37.1-.75.1-1.13V.02z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Newsletter Input */}
          <div className="lg:col-span-7 space-y-6">
            <h4 className="font-display font-semibold text-lg text-white">Join the Print Revolution</h4>
            <p className="text-gray-400 text-sm max-w-lg">
              Receive limited invitations to luxury card batches, unique customized templates, and smart corporate branding insights.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your corporate email address"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 rounded-xl px-4 py-3.5 pl-11 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200"
                />
                <Mail className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            {subscribed && (
              <p className="text-xs text-orange-400 animate-fade-in font-mono">✓ Welcome to WAO PRINTS. Your invite discount code is on the way!</p>
            )}
          </div>

        </div>

        {/* Middle Segment: Column Directories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 text-sm">
          
          {/* Services Column */}
          <div className="space-y-4">
            <h5 className="font-semibold text-white tracking-wider uppercase text-xs">Print Services</h5>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => onTabChange("services")} className="hover:text-orange-400 transition-colors cursor-pointer">Business Cards</button></li>
              <li><button onClick={() => onTabChange("services")} className="hover:text-orange-400 transition-colors cursor-pointer">Mugs Printing</button></li>
              <li><button onClick={() => onTabChange("services")} className="hover:text-orange-400 transition-colors cursor-pointer">Pens & Corporate Gifts</button></li>
              <li><button onClick={() => onTabChange("services")} className="hover:text-orange-400 transition-colors cursor-pointer">Heavy Garments/T-Shirts</button></li>
              <li><button onClick={() => onTabChange("services")} className="hover:text-orange-400 transition-colors cursor-pointer">Custom Package Boxes</button></li>
            </ul>
          </div>

          {/* Quick Nav Directory */}
          <div className="space-y-4">
            <h5 className="font-semibold text-white tracking-wider uppercase text-xs">Explore</h5>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => onTabChange("shop")} className="hover:text-orange-400 transition-colors cursor-pointer">Custom Shop</button></li>
              <li><button onClick={() => onTabChange("portfolio")} className="hover:text-orange-400 transition-colors cursor-pointer">Our Portfolio</button></li>
              <li><button onClick={() => onTabChange("about")} className="hover:text-orange-400 transition-colors cursor-pointer">About WAO Story</button></li>
              <li><button onClick={() => onTabChange("track-order")} className="hover:text-orange-400 transition-colors cursor-pointer">Track Your Order</button></li>
              <li><button onClick={() => onTabChange("dashboard")} className="hover:text-orange-400 transition-colors cursor-pointer">Customer Portal</button></li>
            </ul>
          </div>

          {/* Contact Details Column */}
          <div className="space-y-4">
            <h5 className="font-semibold text-white tracking-wider uppercase text-xs">Support Hub</h5>
            <ul className="space-y-2.5 text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>742 Printing Way, Sector 5, Los Angeles, CA</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <span>+1 (555) 019-2831</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <span>orders@waoprints.com</span>
              </li>
            </ul>
          </div>

          {/* Business Hours Column */}
          <div className="space-y-4">
            <h5 className="font-semibold text-white tracking-wider uppercase text-xs">Printers HQ Hours</h5>
            <p className="text-gray-400 leading-relaxed">
              Our automated Gemini AI layout engines and live proof preview canvas operate 24/7. Physical heavy lithography presses and shipment parcel packaging run:
            </p>
            <div className="font-mono text-xs text-orange-400">
              Monday - Friday: 08:00 - 18:00 PST
            </div>
          </div>

        </div>

        {/* Bottom Segment: Trust and Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>WAO PRINTS is ISO 9001:2015 Certified for Premium Lithographic Printing Standards.</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} WAO PRINTS Corp. All rights reserved. Designed for elite brands.
          </div>
          <div className="flex gap-4">
            <button onClick={() => onTabChange("terms")} className="hover:text-white cursor-pointer">Terms of Service</button>
            <button onClick={() => onTabChange("terms")} className="hover:text-white cursor-pointer">Privacy Policy</button>
            <button onClick={() => onTabChange("terms")} className="hover:text-white cursor-pointer">Refund Policy</button>
          </div>
        </div>

      </div>
    </footer>
  );
}























// import React, { useState } from "react";
// import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin, ShieldCheck, Youtube } from "lucide-react";

// export default function Footer({ onTabChange }) {
//   const [email, setEmail] = useState("");
//   const [subscribed, setSubscribed] = useState(false);

//   const handleSubscribe = (e) => {
//     e.preventDefault();
//     if (email.trim()) {
//       setSubscribed(true);
//       setEmail("");
//       setTimeout(() => setSubscribed(false), 4000);
//     }
//   };

//   return (
//     <footer className="bg-[#070a12] border-t border-slate-900 pt-20 pb-10" id="main-footer">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
//         {/* Top Segment: Brand and Newsletter */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-slate-900">
          
//           {/* Logo & Intro */}
//           <div className="lg:col-span-5 space-y-6">
//             <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange("home")}>
//               <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/10">
//                 <span className="font-display font-extrabold text-white text-lg">W</span>
//               </div>
//               <div>
//                 <div className="font-display font-extrabold tracking-wider text-lg flex items-center gap-1 text-white">
//                   WAO <span className="logo-gradient-text">PRINTS</span>
//                 </div>
//                 <p className="text-[8px] uppercase tracking-[0.25em] text-gray-500 font-mono">Print Like A Waoo</p>
//               </div>
//             </div>
//             <p className="text-gray-400 text-sm leading-relaxed max-w-md">
//               We engineer ultra-luxury print materials for brands that refuse to blend in. Leveraging cutting-edge precision lithography, laser digital tooling, and real-time Gemini AI layout analysis.
//             </p>
//             {/* Social Icons */}
//             <div className="flex items-center gap-4 text-gray-500">
//               <a href="https://www.facebook.com/share/1E9xTkLjTK/" className="p-2 hover:bg-slate-900 hover:text-orange-500 rounded-lg transition-all duration-200"><Facebook className="w-4 h-4" /></a>
//               <a href="https://youtube.com/@waooprints?si=3A6zuzIg2diIGXwK" className="p-2 hover:bg-slate-900 hover:text-orange-500 rounded-lg transition-all duration-200"><Youtube className="w-4 h-4" /></a>
//               <a href="https://www.instagram.com/waoprints/" className="p-2 hover:bg-slate-900 hover:text-orange-500 rounded-lg transition-all duration-200"><Instagram className="w-4 h-4" /></a>
//               <a href="https://www.tiktok.com/@waoo.prints?_r=1&_t=ZS-97ivv9DCa1t" className="p-2 hover:bg-slate-900 hover:text-orange-500 rounded-lg transition-all duration-200"><Tiktok className="w-4 h-4" /></a>
//             </div>
//           </div>

//           {/* Newsletter Input */}
//           <div className="lg:col-span-7 space-y-6">
//             <h4 className="font-display font-semibold text-lg text-white">Join the Print Revolution</h4>
//             <p className="text-gray-400 text-sm max-w-lg">
//               Receive limited invitations to luxury card batches, unique customized templates, and smart corporate branding insights.
//             </p>
            
//             <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-xl">
//               <div className="relative flex-1">
//                 <input
//                   type="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your corporate email address"
//                   className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 rounded-xl px-4 py-3.5 pl-11 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200"
//                 />
//                 <Mail className="w-4.5 h-4.5 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
//               </div>
//               <button
//                 type="submit"
//                 className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
//               >
//                 {subscribed ? "Subscribed!" : "Subscribe"}
//                 <Send className="w-3.5 h-3.5" />
//               </button>
//             </form>
//             {subscribed && (
//               <p className="text-xs text-orange-400 animate-fade-in font-mono">✓ Welcome to WAO PRINTS. Your invite discount code is on the way!</p>
//             )}
//           </div>

//         </div>

//         {/* Middle Segment: Column Directories */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 text-sm">
          
//           {/* Services Column */}
//           <div className="space-y-4">
//             <h5 className="font-semibold text-white tracking-wider uppercase text-xs">Print Services</h5>
//             <ul className="space-y-2 text-gray-400">
//               <li><button onClick={() => onTabChange("services")} className="hover:text-orange-400 transition-colors cursor-pointer">Business Cards</button></li>
//               <li><button onClick={() => onTabChange("services")} className="hover:text-orange-400 transition-colors cursor-pointer">Mugs Printing</button></li>
//               <li><button onClick={() => onTabChange("services")} className="hover:text-orange-400 transition-colors cursor-pointer">Pens & Corporate Gifts</button></li>
//               <li><button onClick={() => onTabChange("services")} className="hover:text-orange-400 transition-colors cursor-pointer">Heavy Garments/T-Shirts</button></li>
//               <li><button onClick={() => onTabChange("services")} className="hover:text-orange-400 transition-colors cursor-pointer">Custom Package Boxes</button></li>
//             </ul>
//           </div>

//           {/* Quick Nav Directory */}
//           <div className="space-y-4">
//             <h5 className="font-semibold text-white tracking-wider uppercase text-xs">Explore</h5>
//             <ul className="space-y-2 text-gray-400">
//               <li><button onClick={() => onTabChange("shop")} className="hover:text-orange-400 transition-colors cursor-pointer">Custom Shop</button></li>
//               <li><button onClick={() => onTabChange("portfolio")} className="hover:text-orange-400 transition-colors cursor-pointer">Our Portfolio</button></li>
//               <li><button onClick={() => onTabChange("about")} className="hover:text-orange-400 transition-colors cursor-pointer">About WAO Story</button></li>
//               <li><button onClick={() => onTabChange("track-order")} className="hover:text-orange-400 transition-colors cursor-pointer">Track Your Order</button></li>
//               <li><button onClick={() => onTabChange("dashboard")} className="hover:text-orange-400 transition-colors cursor-pointer">Customer Portal</button></li>
//             </ul>
//           </div>

//           {/* Contact Details Column */}
//           <div className="space-y-4">
//             <h5 className="font-semibold text-white tracking-wider uppercase text-xs">Support Hub</h5>
//             <ul className="space-y-2.5 text-gray-400">
//               <li className="flex items-start gap-2.5">
//                 <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
//                 <span>742 Printing Way, Sector 5, Los Angeles, CA</span>
//               </li>
//               <li className="flex items-center gap-2.5">
//                 <Phone className="w-4 h-4 text-orange-500 shrink-0" />
//                 <span>+1 (555) 019-2831</span>
//               </li>
//               <li className="flex items-center gap-2.5">
//                 <Mail className="w-4 h-4 text-orange-500 shrink-0" />
//                 <span>orders@waoprints.com</span>
//               </li>
//             </ul>
//           </div>

//           {/* Business Hours Column */}
//           <div className="space-y-4">
//             <h5 className="font-semibold text-white tracking-wider uppercase text-xs">Printers HQ Hours</h5>
//             <p className="text-gray-400 leading-relaxed">
//               Our automated Gemini AI layout engines and live proof preview canvas operate 24/7. Physical heavy lithography presses and shipment parcel packaging run:
//             </p>
//             <div className="font-mono text-xs text-orange-400">
//               Monday - Friday: 08:00 - 18:00 PST
//             </div>
//           </div>

//         </div>

//         {/* Bottom Segment: Trust and Copyright */}
//         <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-gray-500">
//           <div className="flex items-center gap-2">
//             <ShieldCheck className="w-4 h-4 text-emerald-500" />
//             <span>WAO PRINTS is ISO 9001:2015 Certified for Premium Lithographic Printing Standards.</span>
//           </div>
//           <div>
//             &copy; {new Date().getFullYear()} WAO PRINTS Corp. All rights reserved. Designed for elite brands.
//           </div>
//           <div className="flex gap-4">
//             <button onClick={() => onTabChange("terms")} className="hover:text-white cursor-pointer">Terms of Service</button>
//             <button onClick={() => onTabChange("terms")} className="hover:text-white cursor-pointer">Privacy Policy</button>
//             <button onClick={() => onTabChange("terms")} className="hover:text-white cursor-pointer">Refund Policy</button>
//           </div>
//         </div>

//       </div>
//     </footer>
//   );
// }
