import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    // Admin Credentials
    if (email.trim() === "admin@waoprints.com" && password === "admin123") {
      localStorage.setItem("wao_admin_logged_in", "true");
      navigate("/admin/dashboard"); // Login ke baad direct dashboard par bheje
    } else {
      setError("Invalid Admin Email or Security Password.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900/40 border border-slate-900 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-6 backdrop-blur-xl">
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-display font-extrabold text-2xl text-white tracking-tight">Access Admin Portal</h3>
          <p className="text-gray-400 text-xs font-medium">Enter corporate security credentials to access active matrices.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@waoprints.com"
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 text-white outline-none transition-all"
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">SECURITY PASSWORD</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500/60 rounded-xl p-3.5 pr-10 text-white outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-600/10 cursor-pointer flex items-center justify-center gap-2 mt-2 uppercase tracking-wider text-[11px]"
          >
            Connect Security Portal →
          </button>
        </form>
      </div>
    </div>
  );
}