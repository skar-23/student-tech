import React, { useState } from 'react';
import { Menu, X, Home, LogIn, LayoutDashboard, BookOpen } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/auth', label: 'Sign In', icon: LogIn },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-sm animate-slide-down">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="#/" className="flex items-center gap-3 group">
            <div className="gradient-primary w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Tech Student Hub
            </span>
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <a 
                  key={i}
                  href={`#${item.href}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-200 font-medium group"
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {item.label}
                </a>
              );
            })}
          </nav>
          
          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/50 animate-slide-down">
            <nav className="flex flex-col gap-2">
              {navItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <a 
                    key={i}
                    href={`#${item.href}`}
                    onClick={toggleMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-200 font-medium"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
