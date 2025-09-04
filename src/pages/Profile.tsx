import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, BookOpen, Trophy, TrendingUp, Calendar, Phone, Mail, School } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: userStats } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Get user assessments
      const { data: assessments } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', user.id);

      // Get question attempts
      const { data: attempts } = await supabase
        .from('question_attempts')
        .select('*')
        .eq('user_id', user.id);

      // Get uploaded notes
      const { data: notes } = await supabase
        .from('notes')
        .select('*')
        .eq('uploader_id', user.id);

      return {
        assessments: assessments || [],
        totalAttempts: attempts?.length || 0,
        correctAttempts: attempts?.filter(a => a.is_correct).length || 0,
        uploadedNotes: notes?.length || 0,
        totalDownloads: notes?.reduce((sum, note) => sum + note.download_count, 0) || 0,
      };
    },
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error(error);
    },
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Profile Header */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">
                    {profile?.full_name || 'Anonymous User'}
                  </h1>
                  <p className="text-slate-600 mt-1">@{profile?.username || 'student'}</p>
                  {profile?.bio && (
                    <p className="text-slate-600 mt-2 max-w-2xl">{profile.bio}</p>
                  )}
                </div>
                
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className="gradient-primary text-white"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 mt-4">
                {profile?.college && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <School className="w-4 h-4" />
                    {profile.college}
                  </div>
                )}
                {profile?.branch && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BookOpen className="w-4 h-4" />
                    {profile.branch} {profile.current_year && `- Year ${profile.current_year}`}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        {isEditing && (
          <CardContent>
            <ProfileEditForm
              profile={profile}
              onSubmit={(data) => updateProfileMutation.mutate(data)}
              isSubmitting={updateProfileMutation.isPending}
            />
          </CardContent>
        )}
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={Trophy}
          title="Credits"
          value={profile?.credits || 0}
          description="Total earned credits"
          gradient="gradient-primary"
        />
        
        <StatsCard
          icon={TrendingUp}
          title="Accuracy"
          value={userStats?.totalAttempts > 0 ? 
            `${Math.round((userStats.correctAttempts / userStats.totalAttempts) * 100)}%` : '0%'}
          description={`${userStats?.correctAttempts || 0}/${userStats?.totalAttempts || 0} correct`}
          gradient="gradient-secondary"
        />
        
        <StatsCard
          icon={BookOpen}
          title="Notes Shared"
          value={userStats?.uploadedNotes || 0}
          description={`${userStats?.totalDownloads || 0} total downloads`}
          gradient="gradient-success"
        />
        
        <StatsCard
          icon={Calendar}
          title="Skill Areas"
          value={userStats?.assessments?.length || 0}
          description="Topics assessed"
          gradient="gradient-warm"
        />
      </div>

      {/* Skill Assessment Progress */}
      {userStats?.assessments && userStats.assessments.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Skill Assessment Progress
            </CardTitle>
            <CardDescription>
              Your current skill levels across different topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userStats.assessments.map((assessment: any) => (
                <div key={assessment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{assessment.topic}</h3>
                    <Badge variant={
                      assessment.skill_level === 'advanced' ? 'default' :
                      assessment.skill_level === 'intermediate' ? 'secondary' : 'outline'
                    }>
                      {assessment.skill_level}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div>Accuracy: {assessment.accuracy_rate}%</div>
                    <div>Questions: {assessment.questions_attempted}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatsCard({ 
  icon: Icon, 
  title, 
  value, 
  description, 
  gradient 
}: { 
  icon: any; 
  title: string; 
  value: string | number; 
  description: string; 
  gradient: string; 
}) {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div className={`${gradient} w-8 h-8 rounded-lg flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function ProfileEditForm({ 
  profile, 
  onSubmit, 
  isSubmitting 
}: { 
  profile: any; 
  onSubmit: (data: any) => void; 
  isSubmitting: boolean; 
}) {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    college: profile?.college || '',
    branch: profile?.branch || '',
    current_year: profile?.current_year || '',
    phone: profile?.phone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Enter your username"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          placeholder="Tell us about yourself..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="college">College/University</Label>
          <Input
            id="college"
            value={formData.college}
            onChange={(e) => setFormData({ ...formData, college: e.target.value })}
            placeholder="Your college name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="branch">Branch/Department</Label>
          <Input
            id="branch"
            value={formData.branch}
            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            placeholder="e.g., Computer Science"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="current_year">Current Year</Label>
          <Select
            value={formData.current_year?.toString() || ''}
            onValueChange={(value) => setFormData({ ...formData, current_year: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1st Year</SelectItem>
              <SelectItem value="2">2nd Year</SelectItem>
              <SelectItem value="3">3rd Year</SelectItem>
              <SelectItem value="4">4th Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Your phone number"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="gradient-primary text-white"
      >
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
