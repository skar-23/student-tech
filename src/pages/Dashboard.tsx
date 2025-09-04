import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { Calendar, Download, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

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

  const { data: userProgress } = useQuery({
    queryKey: ['userProgress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: recentNotes } = useQuery({
    queryKey: ['recentNotes'],
    queryFn: async () => {
      const { data } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  // Since modules and topics are removed, we'll simplify progress tracking
  const progressPercentage = 0; // Will need to be updated based on your new progress system

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl p-8 border border-white/20 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {profile?.full_name || 'Student'}!
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Continue your learning journey and unlock new achievements.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="group hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Credits</CardTitle>
            <div className="gradient-primary w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-800 mb-2">{profile?.credits || 0}</div>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Earn more by sharing knowledge
            </p>
          </CardContent>
        </Card>

        <Card className="group hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Completed Topics</CardTitle>
            <div className="gradient-secondary w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-800 mb-2">{userProgress?.length || 0}</div>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Amazing progress streak!
            </p>
          </CardContent>
        </Card>

        <Card className="group hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Available Notes</CardTitle>
            <div className="gradient-success w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Download className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-800 mb-2">{recentNotes?.length || 0}</div>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
              Explore the marketplace
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Recent Notes Section */}
      <Card className="hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-blue-50/50"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="gradient-secondary w-8 h-8 rounded-lg flex items-center justify-center">
              <Download className="w-4 h-4 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-slate-800">Community Notes</CardTitle>
          </div>
          <CardDescription className="text-slate-600">Latest study materials shared by the community</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="space-y-4">
            {recentNotes?.slice(0, 5).map((note, i) => (
              <div 
                key={note.id} 
                className="group flex items-center justify-between p-4 bg-white/50 border border-slate-200/50 rounded-2xl hover:bg-white/80 hover:shadow-lg transition-all duration-300 hover-scale"
                style={{animationDelay: `${i * 0.1}s`}}
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{note.title}</h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{note.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-400">Downloads: {note.download_count}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <Badge className="gradient-success text-white border-0 px-3 py-1 group-hover:scale-105 transition-transform">
                    {note.subject_tag}
                  </Badge>
                </div>
              </div>
            ))}
            
            {(!recentNotes || recentNotes.length === 0) && (
              <div className="text-center py-12">
                <div className="gradient-cool w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No Notes Yet</h3>
                <p className="text-slate-500 mb-4">
                  Be the first to contribute and help the community!
                </p>
                <button className="gradient-primary text-white px-6 py-2 rounded-xl font-medium hover-scale">
                  Upload First Note
                </button>
              </div>
            )}
            
            {recentNotes && recentNotes.length > 0 && (
              <div className="pt-6 border-t border-slate-200/50">
                <Link 
                  to="/notes"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group"
                >
                  Explore All Notes
                  <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}