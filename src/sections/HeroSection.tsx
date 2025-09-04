import React from 'react';
import { ArrowRight, BookOpen, Users, Zap } from 'lucide-react';

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
    {/* Animated background with modern gradients */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-sky-600/5 to-teal-600/10 animate-gradient"></div>
    </div>
    
    {/* Floating geometric shapes */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 rounded-full animate-float"></div>
      <div className="absolute top-40 right-32 w-24 h-24 bg-sky-400/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-32 left-32 w-40 h-40 bg-teal-400/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 right-20 w-28 h-28 bg-cyan-400/20 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>
    </div>
    
    <div className="relative z-10 container mx-auto max-w-6xl text-center">
      {/* Main content */}
      <div className="animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200/50 rounded-full px-4 py-2 mb-8 animate-slide-down">
          <Zap className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Empowering Tech Students</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
          <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-teal-500 bg-clip-text text-transparent">
            Tech Student
          </span>
          <br />
          <span className="text-slate-800">Hub</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{animationDelay: '0.2s'}}>
          Your comprehensive platform for structured learning roadmaps, collaborative note sharing, 
          and strategic placement preparation in technology.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-scale-in" style={{animationDelay: '0.4s'}}>
          <a href="#/auth" className="group">
            <button className="gradient-primary text-white text-lg px-8 py-4 rounded-xl shadow-xl hover-lift flex items-center gap-2 font-semibold">
              Start Learning
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </a>
          <a href="#/auth" className="group">
            <button className="glass border-2 border-white/30 text-slate-700 text-lg px-8 py-4 rounded-xl shadow-xl hover-lift flex items-center gap-2 font-semibold hover:bg-white/20 transition-all">
              <Users className="w-5 h-5" />
              Join Community
            </button>
          </a>
        </div>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-up" style={{animationDelay: '0.6s'}}>
          <div className="glass rounded-2xl p-6 hover-lift">
            <div className="gradient-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Structured Roadmaps</h3>
            <p className="text-slate-600 text-sm">Follow curated learning paths designed by industry experts</p>
          </div>
          
          <div className="glass rounded-2xl p-6 hover-lift" style={{animationDelay: '0.8s'}}>
            <div className="gradient-secondary w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Note Sharing</h3>
            <p className="text-slate-600 text-sm">Access and share high-quality study materials with peers</p>
          </div>
          
          <div className="glass rounded-2xl p-6 hover-lift" style={{animationDelay: '1s'}}>
            <div className="gradient-success w-12 h-12 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Placement Prep</h3>
            <p className="text-slate-600 text-sm">Practice with curated questions and track your progress</p>
          </div>
        </div>
      </div>
    </div>
    
    {/* Scroll indicator */}
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
      <div className="w-6 h-10 border-2 border-slate-400/50 rounded-full flex justify-center">
        <div className="w-1 h-3 bg-slate-400/70 rounded-full mt-2 animate-pulse"></div>
      </div>
    </div>
  </section>
);

export default HeroSection;
