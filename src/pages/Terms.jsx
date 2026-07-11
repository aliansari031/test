import React, { useState } from "react";
import { Scale, ShieldCheck, Scroll } from "lucide-react";

export default function Terms() {
  const [activeTab, setActiveTab] = useState("terms");

  return (
    <div className="pt-28 pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in" id="legal-terms-page">
      
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">LEGAl COMPLIANCE</span>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white">WAO Prints Legal Policies</h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
          Review our terms of use, data security frameworks, and client refund policies for industrial print orders.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-b border-slate-900 gap-4">
        <button
          onClick={() => setActiveTab("terms")}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "terms" ? "border-orange-500 text-white" : "border-transparent text-gray-500 hover:text-white"
          }`}
        >
          Terms & Conditions
        </button>
        <button
          onClick={() => setActiveTab("privacy")}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "privacy" ? "border-orange-500 text-white" : "border-transparent text-gray-500 hover:text-white"
          }`}
        >
          Privacy Safeguards
        </button>
        <button
          onClick={() => setActiveTab("refund")}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "refund" ? "border-orange-500 text-white" : "border-transparent text-gray-500 hover:text-white"
          }`}
        >
          Refund & Re-press Policy
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="bg-slate-950/40 border border-slate-900 p-6 sm:p-10 rounded-3xl space-y-6 glass-card text-xs sm:text-sm text-gray-300 leading-relaxed">
        
        {activeTab === "terms" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 text-white">
              <Scroll className="w-5 h-5 text-orange-500" />
              <h2 className="font-display font-bold text-lg uppercase tracking-wider">Terms & Conditions of service</h2>
            </div>
            
            <p>Welcome to WAO PRINTS. By utilizing our live visual canvas customizer and checking out print batches, you agree to comply with the legal conditions listed below:</p>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h4 className="font-bold text-white uppercase text-xs">1. Intellectual Property & Brand Graphics</h4>
                <p>When uploading business logos, SVG typography vectors, or design files inside the visual safe margins, you explicitly confirm that you own the license or copyright for the graphic files. WAO PRINTS accepts zero accountability for trademark infringements.</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white uppercase text-xs">2. Proof Approval Commitments</h4>
                <p>By approving the visual customizer layout and bypassing the Gemini AI print inspection warnings, the customer acknowledges that spelling errors, pixelation from low resolution uploads (under 150 DPI), and alignment issues are fully the responsibility of the customer.</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white uppercase text-xs">3. Color Calibration Differences</h4>
                <p>Please note that browser preview monitors display RGB light pixels while high fidelity mechanical plates utilize CMYK ink dyes. Slight color tone variations are natural mechanical outcomes and fall within international print thresholds.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-5 h-5 text-orange-500" />
              <h2 className="font-display font-bold text-lg uppercase tracking-wider">Privacy & Data Safeguards</h2>
            </div>

            <p>At WAO PRINTS, your digital corporate brand assets, personal phone directories, and transaction histories are securely isolated.</p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <h4 className="font-bold text-white uppercase text-xs">1. File Storage Retentions</h4>
                <p>Uploaded corporate logos and high resolution SVG assets are stored on secure Cloudinary servers with strict expiration tokens. Non-checkout artwork is auto-cleared every 14 days to prevent storage leaks.</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white uppercase text-xs">2. Payment Security</h4>
                <p>We process all direct card billing through certified PCI-DSS level-1 Stripe processors. Your full credit numbers never enter or touch our local database records.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "refund" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-2 text-white">
              <Scale className="w-5 h-5 text-orange-500" />
              <h2 className="font-display font-bold text-lg uppercase tracking-wider">Refund, Repress & Guarantee Policy</h2>
            </div>

            <p>Because physical print batches are engineered specifically to your exact corporate coordinates, they carry zero reselling value. Thus, we enforce the specific guarantee framework below:</p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <h4 className="font-bold text-white uppercase text-xs">1. Defect Re-Press Guarantee</h4>
                <p>If the physically delivered merchandise displays mechanical color smudges, alignment deviations of more than 2.0mm from the approved proof coordinate, or incorrect paper weights, submit a support ticket in your Customer Dashboard with photo evidence. We will re-press the entire run free of cost.</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white uppercase text-xs">2. Order Cancellations</h4>
                <p>Once a print job has been set up on mechanical plates (typically 4 hours after purchase checkout), it cannot be cancelled or modified.</p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
