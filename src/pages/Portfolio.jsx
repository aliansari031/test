import React, { useState, useEffect } from "react";
import { Search, Heart, Share2, Sparkles } from "lucide-react";

export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/portfolio");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to load portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleLike = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/portfolio/${id}/like`, { method: "POST" });
      if (res.ok) {
        const updated = await res.json();
        setProjects(projects.map(p => p.id === id ? updated : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/portfolio/${id}/share`, { method: "POST" });
      if (res.ok) {
        const updated = await res.json();
        setProjects(projects.map(p => p.id === id ? updated : p));
        alert("Portfolio link copied! Share count updated.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const CATEGORIES = ["All", "Corporate", "Events", "Packaging", "Merchandise", "Branding"];

  const filtered = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === "All" || p.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in" id="portfolio-page">
      
      {/* Title Header */}
      <div className="text-center space-y-3">
        <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">LITHOGRAPHY DISPLAY</span>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white">Prism Design Portfolio</h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed">
          Feast your eyes on actual customized merchandise, embossed cards, and luxury brand box sets completed for premier clients.
        </p>
      </div>

      {/* Search and Filters controls */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-slate-950/40 border border-slate-900 p-4 rounded-3xl">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search masterworks..."
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-orange-500/60 rounded-xl px-4 py-2.5 pl-10 text-xs text-white outline-none"
          />
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Category filters list */}
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                category === cat
                  ? "bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/10"
                  : "bg-slate-900 text-gray-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Portfolio Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="aspect-4/3 rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No portfolio projects match your active search terms.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              className="group bg-slate-950/40 border border-slate-900 hover:border-slate-800 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-101 flex flex-col justify-between"
            >
              
              {/* Image Frame */}
              <div className="relative aspect-square sm:aspect-4/3 bg-[#080d15] overflow-hidden border-b border-slate-900">
                <img
                  src={proj.imageUrl}
                  alt={proj.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Category tag overlay */}
                <span className="absolute top-4 left-4 bg-slate-950/80 border border-slate-800/80 text-orange-400 font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                  {proj.category}
                </span>

                {proj.isFeatured && (
                  <span className="absolute top-4 right-4 bg-orange-600 text-white font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 animate-spin-slow" />
                    Featured Project
                  </span>
                )}
              </div>

              {/* Text metadata */}
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-display font-bold text-lg text-white group-hover:text-orange-400 transition-colors">{proj.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{proj.description}</p>
                </div>

                {/* Like & Share interactive toolbar */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-900/60">
                  
                  {/* Likes count */}
                  <button
                    onClick={(e) => handleLike(proj.id, e)}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-rose-500 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500/10 hover:fill-rose-500 transition-all" />
                    <span>{proj.likes}</span>
                  </button>

                  {/* Share count */}
                  <button
                    onClick={(e) => handleShare(proj.id, e)}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-orange-400 transition-colors text-xs font-semibold cursor-pointer"
                  >
                    <Share2 className="w-4.5 h-4.5" />
                    <span>{proj.shares} Shares</span>
                  </button>

                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
