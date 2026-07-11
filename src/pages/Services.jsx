import React, { useState } from "react";
import { Send, HelpCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import { SERVICES_LIST } from "../data.js";

export default function Services() {
  const [selectedServiceId, setSelectedServiceId] = useState(SERVICES_LIST[0].id);
  
  // Inquiry Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(500);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedService = SERVICES_LIST.find(s => s.id === selectedServiceId) || SERVICES_LIST[0];

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceName: selectedService.name,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          message,
          quantity
        })
      });

      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      }
    } catch (err) {
      console.error("Failed to send inquiry:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 animate-fade-in" id="services-page">
      
      {/* Page Title */}
      <div className="text-center space-y-3">
        <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">Industrial Capabilities</span>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white">Commercial Print Services</h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
          Explore specialized lithographic and digital print capabilities. Run bulk inquiry requests directly to our presses.
        </p>
      </div>

      {/* Main split grid: Left Nav / Right detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Services Directory Menu */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest pl-3 mb-2">Capabilities Directory</p>
          <div className="space-y-2">
            {SERVICES_LIST.map((srv) => (
              <button
                key={srv.id}
                onClick={() => setSelectedServiceId(srv.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                  selectedServiceId === srv.id
                    ? "bg-gradient-to-r from-orange-600 to-orange-500/80 border-orange-500 text-white shadow-lg shadow-orange-500/10"
                    : "bg-slate-950/40 border-slate-900 hover:border-slate-800 text-gray-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm">{srv.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Service Specifications, Gallery & Bulk Inquiry Form */}
        <div className="lg:col-span-8 space-y-10 bg-slate-950/40 border border-slate-900 p-6 sm:p-10 rounded-3xl glass-card">
          
          {/* Service Header */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">{selectedService.name}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{selectedService.description}</p>
          </div>

          {/* Service Gallery */}
          <div className="grid grid-cols-2 gap-4">
            {selectedService.gallery.map((url, i) => (
              <div key={i} className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-900">
                <img
                  src={url}
                  alt={selectedService.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>

          {/* Technical FAQs Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
              <HelpCircle className="w-4 h-4 text-orange-500" />
              <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider">Technical specifications & FAQ</h4>
            </div>
            <div className="space-y-4">
              {selectedService.faqs.map((faq, i) => (
                <div key={i} className="space-y-1.5 bg-slate-900/40 p-4 rounded-xl border border-slate-900/60">
                  <p className="font-semibold text-xs text-white">Q: {faq.q}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">A: {faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bulk commercial Quote Form */}
          <div className="space-y-6 pt-6 border-t border-slate-900">
            <div>
              <h4 className="font-display font-bold text-lg text-white">Request Large Run Quote</h4>
              <p className="text-xs text-gray-500 mt-1">Need 5,000 cards or 1,000 custom corporate mugs? Complete this inquiry to fetch precise trade tier volume pricing.</p>
            </div>

            <form onSubmit={handleInquirySubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Batch Quantity Target</label>
                <input
                  type="number"
                  min="25"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="500"
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Custom specifications / Instructions</label>
                <textarea
                  value={message}
                  required
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please specify paper weight (GSM), gloss vs velvet laminate, or logo alignment preferences."
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3 text-xs text-white outline-none h-24 resize-none"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  {loading ? "Submitting Inquiry..." : "Submit Commercial Inquiry"}
                </button>
              </div>

            </form>

            {success && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-emerald-400 flex items-center gap-2.5 animate-fade-in text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Inquiry submitted straight to WAO CRM! Our master press officer will email your custom PDF quote shortly.</span>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
