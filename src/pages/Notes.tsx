import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Search, Filter, Heart, Star, Download, Upload, School, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Note {
  id: number;
  title: string;
  description: string;
  subject_tag: string;
  file_url: string;
  download_count: number;
  rating_avg: number;
  total_ratings: number;
  total_upvotes: number;
  college: string;
  author_year: number;
  file_type: string;
  created_at: string;
  uploader_id: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string;
    college: string;
  };
}

export default function Notes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [sortBy, setSortBy] = useState('upvotes'); // upvotes, rating, recent

  // Get all subjects and colleges for filtering
  const { data: filterOptions } = useQuery({
    queryKey: ['notesFilters'],
    queryFn: async () => {
      const { data } = await supabase
        .from('notes')
        .select('subject_tag, college');
      
      const subjects = [...new Set(data?.map(n => n.subject_tag).filter(Boolean) || [])];
      const colleges = [...new Set(data?.map(n => n.college).filter(Boolean) || [])];
      
      return { subjects, colleges };
    },
  });

  // Get filtered and sorted notes
  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', searchQuery, selectedSubject, selectedCollege, sortBy],
    queryFn: async () => {
      let query = supabase
        .from('notes')
        .select(`
          *,
          profiles!notes_uploader_id_fkey (
            full_name,
            username,
            avatar_url,
            college
          )
        `);

      // Apply filters
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,subject_tag.ilike.%${searchQuery}%`);
      }
      
      if (selectedSubject) {
        query = query.eq('subject_tag', selectedSubject);
      }
      
      if (selectedCollege) {
        query = query.eq('college', selectedCollege);
      }

      // Apply sorting
      switch (sortBy) {
        case 'upvotes':
          query = query.order('total_upvotes', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating_avg', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('total_upvotes', { ascending: false });
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as Note[];
    },
  });

  // Get user's upvoted notes
  const { data: userUpvotes } = useQuery({
    queryKey: ['userUpvotes', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('note_upvotes')
        .select('note_id')
        .eq('user_id', user.id);
      return data?.map(u => u.note_id) || [];
    },
    enabled: !!user?.id,
  });

  // Toggle upvote
  const toggleUpvoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      if (!user?.id) return;
      
      const isUpvoted = userUpvotes?.includes(noteId);
      
      if (isUpvoted) {
        await supabase
          .from('note_upvotes')
          .delete()
          .eq('note_id', noteId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('note_upvotes')
          .insert({
            note_id: noteId,
            user_id: user.id,
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['userUpvotes', user?.id] });
    },
  });

  // Download note
  const downloadNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      await supabase
        .from('notes')
        .update({ download_count: (notes?.find(n => n.id === noteId)?.download_count || 0) + 1 })
        .eq('id', noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Download started!');
    },
  });

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-purple-100/80 backdrop-blur-sm border border-purple-200/50 rounded-full px-4 py-2">
          <Upload className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Community Knowledge</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
          Smart <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Notes Hub</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Discover top-rated study materials from the best colleges, filtered by subject and popularity
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Find Your Perfect Study Material
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Subject Filter */}
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {filterOptions?.subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* College Filter */}
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by college" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Colleges</SelectItem>
                {filterOptions?.colleges.map((college) => (
                  <SelectItem key={college} value={college}>{college}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Options */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upvotes">Most Upvoted</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(selectedSubject || selectedCollege) && (
            <div className="flex gap-2 mt-4">
              {selectedSubject && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Subject: {selectedSubject}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto p-0 text-xs"
                    onClick={() => setSelectedSubject('')}
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {selectedCollege && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  College: {selectedCollege}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-auto p-0 text-xs"
                    onClick={() => setSelectedCollege('')}
                  >
                    ×
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading notes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes?.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isUpvoted={userUpvotes?.includes(note.id) || false}
              onUpvote={() => toggleUpvoteMutation.mutate(note.id)}
              onDownload={() => {
                // Open file in new tab
                window.open(note.file_url, '_blank');
                downloadNoteMutation.mutate(note.id);
              }}
            />
          ))}
        </div>
      )}

      {(!notes || notes.length === 0) && !isLoading && (
        <div className="text-center py-12">
          <div className="gradient-secondary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Notes Found</h3>
          <p className="text-slate-500 mb-4">
            {searchQuery || selectedSubject || selectedCollege 
              ? 'Try adjusting your filters to find more results.' 
              : 'Be the first to share study materials!'}
          </p>
          <Button className="gradient-primary text-white">
            Upload Notes
          </Button>
        </div>
      )}
    </div>
  );
}

function NoteCard({ 
  note, 
  isUpvoted, 
  onUpvote, 
  onDownload 
}: { 
  note: Note; 
  isUpvoted: boolean; 
  onUpvote: () => void; 
  onDownload: () => void; 
}) {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover-lift group overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
              {note.title}
            </CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {note.description}
            </CardDescription>
          </div>
          
          {/* Upvote Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onUpvote}
            className={`flex flex-col items-center p-2 h-auto ${
              isUpvoted ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isUpvoted ? 'fill-current' : ''}`} />
            <span className="text-xs font-medium">{note.total_upvotes}</span>
          </Button>
        </div>

        {/* Tags and Rating */}
        <div className="flex items-center justify-between mt-4">
          <Badge className="gradient-primary text-white">{note.subject_tag}</Badge>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">
              {note.rating_avg ? note.rating_avg.toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-slate-500">({note.total_ratings})</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
          <Avatar className="w-8 h-8">
            <AvatarImage src={note.profiles?.avatar_url} />
            <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              {note.profiles?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-800 truncate">
              {note.profiles?.full_name || 'Anonymous'}
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              {note.college && (
                <>
                  <School className="w-3 h-3" />
                  <span className="truncate">{note.college}</span>
                </>
              )}
              {note.author_year && (
                <span>• Year {note.author_year}</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-slate-600 mb-4">
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span>{note.download_count} downloads</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(note.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Download Button */}
        <Button
          onClick={onDownload}
          className="w-full gradient-secondary text-white group-hover:scale-105 transition-transform"
        >
          <Download className="w-4 h-4 mr-2" />
          Download {note.file_type && `(${note.file_type})`}
        </Button>
      </CardContent>
    </Card>
  );
}

// You would also add components for:
// - RatingModal (for rating notes 1-5 stars)
// - UploadModal (for uploading new notes)
// - NotePreview (for previewing notes before download)
