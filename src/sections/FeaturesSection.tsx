import React from 'react';
import { BookOpen, Users, Award, TrendingUp, Code, Brain, Target, Rocket } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Curated Roadmaps',
    desc: 'Expert-designed learning paths for Web Development, Machine Learning, Data Structures & Algorithms, and System Design',
    gradient: 'gradient-primary',
    bgColor: 'from-blue-50 to-indigo-100',
  },
  {
    icon: Users,
    title: 'Community Notes',
    desc: 'Access premium study materials and share your knowledge with fellow students worldwide',
    gradient: 'gradient-secondary',
    bgColor: 'from-purple-50 to-pink-100',
  },
  {
    icon: Brain,
    title: 'Smart Practice',
    desc: 'AI-powered question recommendations tailored to your learning progress and weak areas',
    gradient: 'gradient-success',
    bgColor: 'from-cyan-50 to-blue-100',
  },
  {
    icon: TrendingUp,
    title: 'Progress Analytics',
    desc: 'Detailed insights into your learning patterns, achievements, and areas for improvement',
    gradient: 'gradient-warm',
    bgColor: 'from-orange-50 to-red-100',
  },
  {
    icon: Target,
    title: 'Placement Prep',
    desc: 'Comprehensive interview preparation with company-specific questions and mock interviews',
    gradient: 'gradient-cool',
    bgColor: 'from-green-50 to-emerald-100',
  },
  {
    icon: Rocket,
    title: 'Career Guidance',
    desc: 'Industry mentorship, resume reviews, and career pathway recommendations',
    gradient: 'gradient-primary',
    bgColor: 'from-violet-50 to-purple-100',
  },
];

const FeaturesSection = () => (
  <section className="py-24 px-4 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50 relative overflow-hidden">
    {/* Background decoration */}
    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    
    <div className="container mx-auto relative z-10">
      <div className="text-center mb-20 animate-fade-in">
        <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm border border-blue-200/50 rounded-full px-4 py-2 mb-6">
          <Code className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Comprehensive Platform</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800">
          Everything You Need to
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
            Excel in Tech
          </span>
        </h2>
        
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          From structured learning paths to collaborative knowledge sharing, 
          we provide all the tools you need for a successful tech career.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div 
              key={i} 
              className={`group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover-lift animate-scale-in border border-white/20`}
              style={{animationDelay: `${i * 0.1}s`}}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>
              
              <div className="relative z-10">
                {/* Icon with gradient background */}
                <div className={`${feature.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-slate-800 group-hover:text-slate-900 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-slate-600 group-hover:text-slate-700 leading-relaxed transition-colors">
                  {feature.desc}
                </p>
                
                {/* Subtle hover indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Bottom CTA */}
      <div className="text-center mt-20 animate-fade-in">
        <div className="inline-flex items-center gap-4">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1"></div>
          <span className="text-slate-500 font-medium px-6">Ready to start your journey?</span>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent flex-1"></div>
        </div>
      </div>
    </div>
  </section>
);

export default FeaturesSection;
