import React from "react";
import { ShieldCheck, Eye, Sparkles } from "lucide-react";

export default function About() {
  const CORE_VALUES = [
    {
      title: "Unyielding Rigor",
      desc: "We test every dye blend, count warp-weft threads, and examine foil adhesion to guarantee absolute fidelity.",
      icon: ShieldCheck
    },
    {
      title: "Artisanal Vision",
      desc: "Printing is not a purely automated process. It requires physical color-balance correction, margin adjustment, and texture design.",
      icon: Eye
    },
    {
      title: "Gemini Intelligence",
      desc: "Integrating state-of-the-art vision models directly into the customizer workspace to prevent manual layout faults.",
      icon: Sparkles
    }
  ];

  const TEAM = [
    {
      name: "Jean-Louis Vance",
      role: "Managing Director & Lithography Master",
      bio: "30+ years perfecting multi-plate high-volume offset lithography color systems.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60"
    },
    {
      name: "Elise Montgomery",
      role: "Chief Creative Architect",
      bio: "Award-winning editorial packaging artist, specializing in textured luxury linen stock.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=60"
    },
    {
      name: "Aris Thorne",
      role: "Lead Sublimation Systems Engineer",
      bio: "Specializes in high-temperature double-sided dye porcelain transfer matrices.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60"
    }
  ];

  const TIMELINE_EVENTS = [
    {
      year: "2018",
      title: "PRESS RUN 01",
      desc: "Founded in Los Angeles with a single vintage 4-color Heidelberg offset press, printing cards for boutique local galleries."
    },
    {
      year: "2021",
      title: "PACKAGING MATRIX",
      desc: "Expanded into massive custom corrugated cardboard die-cut boxes, installing our first UV-curable flatbed printing system."
    },
    {
      year: "2024",
      title: "INTELLIGENT WORKSPACE",
      desc: "Launched our full-stack live-customizer system, integrating Google Gemini AI to analyze background alpha masks automatically."
    }
  ];

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 animate-fade-in" id="about-page">
      
      {/* 1. BRAND STORY SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">THE WAO ANTECEDENT</span>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-none">
            We exist to print<br />
            the impossible.
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            WAO PRINTS was forged under a simple architectural thesis: physical brand touchpoints should evoke the exact same awe as modern, high-end digital designs.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            While most online printers automated their processes into a race for the cheapest materials, we invested in premium linen papers, heavy organic hoodies, triple-glazed mugs, and custom fiber lasers. We combined centuries-old plate stamping craft with modern web engineering and real-time Gemini AI analysis.
          </p>
        </div>

        {/* Decorative Grid Art */}
        <div className="lg:col-span-5 relative aspect-square rounded-3xl bg-slate-950 border border-slate-900/80 overflow-hidden flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/10 to-amber-500/10" />
          <div className="space-y-4 text-center relative z-10">
            <span className="font-display font-black text-7xl text-orange-500">WAO</span>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-gray-400">Pristine CMYK Calibrated Lab</p>
            <div className="flex justify-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-400" />
              <span className="w-3.5 h-3.5 rounded-full bg-pink-500" />
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-400" />
              <span className="w-3.5 h-3.5 rounded-full bg-slate-900" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE VALUES */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">Foundational Pillars</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">Our Print Philosophy</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CORE_VALUES.map((val, i) => {
            const Icon = val.icon;
            return (
              <div key={i} className="bg-slate-950/40 border border-slate-900/60 p-8 rounded-3xl space-y-4">
                <div className="p-3 bg-orange-500/15 text-orange-500 rounded-xl w-11 h-11 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-display font-bold text-lg text-white">{val.title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{val.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. HISTORY TIMELINE */}
      <section className="bg-[#070a12] py-20 rounded-3xl border border-slate-900 p-8 sm:p-12 space-y-12">
        <div className="space-y-3">
          <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">Meticulous Evolution</span>
          <h2 className="font-display font-bold text-3xl text-white">Our Milestones</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TIMELINE_EVENTS.map((evt, i) => (
            <div key={i} className="space-y-4 relative pl-6 border-l border-orange-500/30">
              <span className="font-mono text-xs font-bold text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded">
                {evt.year}
              </span>
              <h4 className="font-display font-bold text-lg text-white pt-2">{evt.title}</h4>
              <p className="text-gray-400 text-xs leading-relaxed">{evt.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. MEET THE TEAM */}
      <section className="space-y-12">
        <div className="text-center space-y-3">
          <span className="text-orange-500 text-xs font-mono uppercase tracking-widest font-bold">The Brain Trust</span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">Press Masters & Engineers</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TEAM.map((member, i) => (
            <div key={i} className="bg-slate-950/40 border border-slate-900 p-6 rounded-3xl text-center space-y-4 hover:border-slate-800 transition-colors">
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-slate-800 hover:border-orange-500 transition-all"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <h4 className="font-display font-bold text-base text-white">{member.name}</h4>
                <p className="text-[10px] font-mono text-orange-500 uppercase tracking-wider">{member.role}</p>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
