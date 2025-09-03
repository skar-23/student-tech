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
        .select(`
          *,
          roadmap_topics (
            *,
            roadmap_modules (
              *,
              roadmaps (*)
            )
          )
        `)
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

  // Calculate progress percentage for the first roadmap the user has progress in
  const activeRoadmap = userProgress?.[0]?.roadmap_topics?.roadmap_modules?.roadmaps;
  const progressPercentage = activeRoadmap ? Math.round((userProgress?.length || 0) / 20 * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.full_name || 'Student'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Continue your learning journey and track your progress.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.credits || 0}</div>
            <p className="text-xs text-muted-foreground">
              Earn more by uploading notes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProgress?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Keep up the great work!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notes Available</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentNotes?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Browse the marketplace
            </p>
          </CardContent>
        </Card>
      </div>

      {activeRoadmap && (
        <Card>
          <CardHeader>
            <CardTitle>Your Active Roadmap</CardTitle>
            <CardDescription>Track your learning progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{activeRoadmap.title}</h3>
                <Badge variant="secondary">{activeRoadmap.domain}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{activeRoadmap.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              <Link 
                to={`/roadmaps/${activeRoadmap.id}`}
                className="inline-block text-sm text-primary hover:underline"
              >
                Continue Learning →
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recently Added Notes</CardTitle>
          <CardDescription>Latest study materials from the community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentNotes?.slice(0, 5).map((note) => (
              <div key={note.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{note.title}</h4>
                  <p className="text-sm text-muted-foreground">{note.description}</p>
                </div>
                <Badge variant="outline">{note.subject_tag}</Badge>
              </div>
            ))}
            {(!recentNotes || recentNotes.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                No notes available yet. Be the first to contribute!
              </p>
            )}
            <div className="pt-4">
              <Link 
                to="/notes"
                className="text-sm text-primary hover:underline"
              >
                View all notes →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}