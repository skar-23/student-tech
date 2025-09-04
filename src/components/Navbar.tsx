import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Coins, User, BookOpen, Home, LayoutDashboard, Brain, FileText, Menu, X, LogOut, Settings, Trophy, Upload } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="gradient-primary w-8 h-8 rounded-xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Tech Student Hub
            </span>
          </div>
          <div className="animate-pulse bg-slate-200 h-8 w-24 rounded-lg"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="gradient-primary w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
            Tech Student Hub
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <>
              {/* Main Navigation Links */}
              <nav className="flex items-center gap-1">
                <Link to="/dashboard">
                  <Button variant="ghost" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors px-4 py-2 rounded-xl font-medium">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                
                {/* Learning Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-slate-600 hover:text-purple-600 hover:bg-purple-50 transition-colors px-4 py-2 rounded-xl font-medium">
                      <Brain className="w-4 h-4 mr-2" />
                      Learning
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-white/95 backdrop-blur-md border border-white/20 shadow-xl">
                    <DropdownMenuItem asChild>
                      <Link to="/practice" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors cursor-pointer">
                        <Brain className="h-4 w-4" />
                        <span>Smart Practice</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/roadmaps" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>AI Roadmaps</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Resources Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors px-4 py-2 rounded-xl font-medium">
                      <FileText className="w-4 h-4 mr-2" />
                      Resources
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 bg-white/95 backdrop-blur-md border border-white/20 shadow-xl">
                    <DropdownMenuItem asChild>
                      <Link to="/notes" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition-colors cursor-pointer">
                        <FileText className="h-4 w-4" />
                        <span>Notes Hub</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/upload" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <span>Upload Notes</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>

              {/* Credits Display */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-full px-4 py-2 shadow-sm">
                <div className="gradient-warm w-6 h-6 rounded-full flex items-center justify-center">
                  <Coins className="h-3 w-3 text-white" />
                </div>
                <span className="font-bold text-slate-800">{profile?.credits || 0}</span>
                <span className="text-xs text-slate-600 font-medium">credits</span>
              </div>

              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative p-1 rounded-full hover:bg-slate-100 transition-colors group">
                    <Avatar className="h-9 w-9 ring-2 ring-white shadow-lg group-hover:scale-105 transition-transform">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="gradient-primary text-white font-semibold text-sm">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Online indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 bg-white/95 backdrop-blur-md border border-white/20 shadow-xl">
                  {/* User Info */}
                  <div className="px-3 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="gradient-primary text-white font-semibold">
                          {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 truncate">
                          {profile?.full_name || 'Anonymous User'}
                        </div>
                        <div className="text-sm text-slate-500 truncate">
                          @{profile?.username || 'student'}
                        </div>
                      </div>
                    </div>
                    {profile?.college && (
                      <div className="mt-2 text-xs text-slate-600 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {profile.college}
                      </div>
                    )}
                  </div>
                  
                  {/* Menu Items */}
                  <div className="py-2">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors cursor-pointer">
                        <User className="h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition-colors cursor-pointer">
                        <Trophy className="h-4 w-4" />
                        <span>My Progress</span>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                  
                  <DropdownMenuSeparator className="my-2" />
                  
                  <div className="py-2">
                    <DropdownMenuItem 
                      onClick={signOut}
                      className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="gradient-primary text-white shadow-lg hover-scale font-medium px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Mobile Credits */}
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-full px-3 py-1">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-bold text-slate-800">{profile?.credits || 0}</span>
              </div>
              
              {/* Mobile Menu */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button className="gradient-primary text-white text-sm px-4 py-2 rounded-xl">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && user && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-white/20 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            {/* Navigation Groups */}
            <div className="space-y-4">
              {/* Main Navigation */}
              <div className="space-y-1">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">
                    <Home className="h-4 w-4" />
                    <span className="font-medium">Dashboard</span>
                  </div>
                </Link>
              </div>
              
              {/* Learning Section */}
              <div className="space-y-1">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Learning</div>
                <Link to="/practice" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-colors">
                    <Brain className="h-4 w-4" />
                    <span className="font-medium">Smart Practice</span>
                    <Badge className="ml-auto bg-purple-100 text-purple-700 text-xs">AI</Badge>
                  </div>
                </Link>
                
                <Link to="/roadmaps" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition-colors">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="font-medium">AI Roadmaps</span>
                    <Badge className="ml-auto bg-green-100 text-green-700 text-xs">New</Badge>
                  </div>
                </Link>
              </div>
              
              {/* Resources Section */}
              <div className="space-y-1">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Resources</div>
                <Link to="/notes" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-orange-50 hover:text-orange-700 rounded-xl transition-colors">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Notes Hub</span>
                  </div>
                </Link>
                
                <Link to="/upload" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">
                    <Upload className="h-4 w-4" />
                    <span className="font-medium">Upload Notes</span>
                  </div>
                </Link>
              </div>
              
              {/* User Section */}
              <div className="border-t border-slate-100 pt-4 space-y-1">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Account</div>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Profile Settings</span>
                  </div>
                </Link>
                
                <button 
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
