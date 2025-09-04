import React from 'react';
import { Github, Twitter, Linkedin, Mail, BookOpen, Users, Award, Heart } from 'lucide-react';

const Footer = () => (
  <footer className="relative bg-slate-900 text-white overflow-hidden">
    {/* Background decoration */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
    
    <div className="relative z-10">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="gradient-primary w-12 h-12 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Tech Student Hub
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed mb-6 max-w-md">
              Empowering the next generation of tech professionals through structured learning, 
              community collaboration, and comprehensive career preparation.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/skar-23/student-tech" target="_blank" rel="noopener noreferrer" 
                 className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center hover-scale transition-all group">
                <Github className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center hover-scale transition-all group">
                <Twitter className="w-5 h-5 text-slate-300 group-hover:text-blue-400 transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center hover-scale transition-all group">
                <Linkedin className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </a>
              <a href="mailto:contact@techstudent.hub" className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center hover-scale transition-all group">
                <Mail className="w-5 h-5 text-slate-300 group-hover:text-green-400 transition-colors" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-slate-200">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: 'Learning Roadmaps', href: '/roadmaps' },
                { label: 'Notes Marketplace', href: '/notes' },
                { label: 'Practice Questions', href: '/practice' },
                { label: 'Community', href: '/community' },
                { label: 'Career Guidance', href: '/careers' },
              ].map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-1 transform inline-block">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-slate-200">Resources</h3>
            <ul className="space-y-3">
              {[
                { label: 'Getting Started', href: '/docs' },
                { label: 'API Documentation', href: '/api-docs' },
                { label: 'Help Center', href: '/help' },
                { label: 'Contact Support', href: '/support' },
                { label: 'Status Page', href: '/status' },
              ].map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-slate-400 hover:text-white transition-colors duration-200 hover:translate-x-1 transform inline-block">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Stats section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 mt-12 border-t border-slate-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">10K+</div>
            <p className="text-slate-400 text-sm">Active Students</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">50+</div>
            <p className="text-slate-400 text-sm">Learning Paths</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">1K+</div>
            <p className="text-slate-400 text-sm">Shared Notes</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">95%</div>
            <p className="text-slate-400 text-sm">Success Rate</p>
          </div>
        </div>
      </div>
      
      {/* Bottom bar */}
      <div className="border-t border-slate-800 bg-slate-950/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              &copy; {new Date().getFullYear()} Tech Student Hub. Built with 
              <Heart className="w-4 h-4 inline mx-1 text-red-400" />
              for the tech community.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="/cookies" className="text-slate-400 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
