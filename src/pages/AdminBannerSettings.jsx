import React, { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminBannerSettings() {
  const [bannerUrl, setBannerUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // 1. Fetch current active banner on component mount
  useEffect(() => {
    fetch("/api/settings/banner")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load configuration.");
      })
      .then((data) => {
        if (data && data.bannerUrl) {
          setBannerUrl(data.bannerUrl);
          setPreviewUrl(data.bannerUrl);
        }
      })
      .catch((err) => console.error("Error fetching banner:", err));
    }, []);

  // 2. Handle local file select and convert to Base64 for instant preview & storage
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File validation (Only images allowed)
    if (!file.type.startsWith("image/")) {
      showStatus("error", "Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result); // Base64 string for instant frontend preview
      showStatus("", "");
    };
    reader.readAsDataURL(file);
  };

  // 3. Save Banner configuration to Backend Database via API
  const handleSaveBanner = async () => {
    if (!previewUrl) {
      showStatus("error", "Please select an image first.");
      return;
    }

    setLoading(true);
    showStatus("", "");

    try {
      const response = await fetch("/api/settings/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerUrl: previewUrl }),
      });

      if (!response.ok) throw new Error("Server error while updating.");
      
      const data = await response.json();
      const confirmedUrl = data.bannerUrl || previewUrl;
      
      setBannerUrl(confirmedUrl);
      setPreviewUrl(confirmedUrl);
      showStatus("success", "Hero Banner successfully updated and live!");
    } catch (error) {
      showStatus("error", "Failed to update banner. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 4. Delete/Remove active banner (Reverts back to standard text hero)
  const handleDeleteBanner = async () => {
    if (!window.confirm("Are you sure you want to remove the custom banner? The default typography hero layout will be restored.")) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/settings/banner", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete.");

      setBannerUrl("");
      setPreviewUrl("");
      showStatus("success", "Custom banner removed. Default text hero active.");
    } catch (error) {
      showStatus("error", "Failed to remove banner.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, message) => {
    setStatus({ type, message });
    if (type === "success") {
      setTimeout(() => setStatus({ type: "", message: "" }), 4000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-950/40 border border-slate-900 rounded-3xl space-y-8 text-white animate-fade-in">
      
      {/* Header Info */}
      <div className="space-y-2">
        <h2 className="text-2xl font-display font-extrabold flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-orange-500" />
          Hero Banner Management
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm">
          Yahan se aap main website ka dynamic banner update kar sakte hain. Image upload karne se standard heavy text bypass ho jayega.
        </p>
      </div>

      {/* Notifications Alert */}
      {status.message && (
        <div className={`flex items-center gap-2 p-4 rounded-xl text-xs sm:text-sm font-medium border ${
          status.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
        }`}>
          {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {status.message}
        </div>
      )}

      {/* Live Preview / Upload Frame */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase text-gray-500 tracking-wider">Banner Display Preview</label>
        
        {previewUrl ? (
          /* Image Chosen View */
          <div className="relative border border-slate-800 rounded-2xl overflow-hidden bg-black/40 max-h-[350px] flex items-center justify-center group">
            <img src={previewUrl} alt="Hero Banner Preview" className="w-full h-auto object-cover max-h-[350px]" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
              <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all text-white">
                Change Image
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
              {(bannerUrl || previewUrl !== bannerUrl) && (
                <button 
                  onClick={handleDeleteBanner}
                  className="bg-rose-600 hover:bg-rose-500 text-white p-2.5 rounded-xl transition-all cursor-pointer"
                  title="Remove Active Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Empty / Upload Trigger State */
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-orange-500/50 rounded-2xl p-12 text-center cursor-pointer bg-slate-900/20 hover:bg-slate-900/40 transition-all duration-200 group">
            <div className="p-4 bg-slate-900 rounded-full text-gray-400 group-hover:text-orange-500 transition-colors mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-sm">Click to upload banner artwork</p>
              <p className="text-gray-500 text-xs">Supports WEBP, PNG, JPEG (Recommended width: 1920px)</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>

      {/* Actions Trigger Footer */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-900">
        {previewUrl !== bannerUrl && (
          <button
            onClick={() => { setPreviewUrl(bannerUrl); showStatus("", ""); }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
            disabled={loading}
          >
            Cancel Changes
          </button>
        )}
        <button
          onClick={handleSaveBanner}
          disabled={loading || previewUrl === bannerUrl}
          className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
            previewUrl === bannerUrl
              ? "bg-slate-900 text-gray-600 cursor-not-allowed border border-slate-850"
              : "bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-lg shadow-orange-500/10 cursor-pointer"
          }`}
        >
          {loading ? "Publishing Updates..." : "Save & Push Live"}
        </button>
      </div>

    </div>
  );
}