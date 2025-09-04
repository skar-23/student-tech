import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, 
  AlertTriangle, 
  ExternalLink, 
  Star, 
  Heart, 
  Award,
  Video,
  FileText,
  Code,
  Globe,
  Users,
  Zap,
  Target,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { getLearningResourceAction } from '@/lib/ai/actions';
import type { GetLearningResourceOutput } from '@/lib/ai/browser-ai';

type Resource = GetLearningResourceOutput['freeResources'][0];

const ResourceIcon = ({ type }: { type: string }) => {
  const normalizedType = type.toLowerCase();
  if (normalizedType.includes('video')) return <Video className="h-4 w-4" />;
  if (normalizedType.includes('official') || normalizedType.includes('documentation')) return <FileText className="h-4 w-4" />;
  if (normalizedType.includes('interactive') || normalizedType.includes('code')) return <Code className="h-4 w-4" />;
  if (normalizedType.includes('course')) return <BookOpen className="h-4 w-4" />;
  if (normalizedType.includes('certification')) return <Award className="h-4 w-4" />;
  if (normalizedType.includes('community') || normalizedType.includes('forum')) return <Users className="h-4 w-4" />;
  return <Globe className="h-4 w-4" />;
};

const DifficultyBadge = ({ difficulty }: { difficulty: string }) => {
  const normalizedDifficulty = difficulty.toLowerCase();
  let color = "bg-slate-500";
  
  if (normalizedDifficulty.includes('beginner')) color = "bg-green-500";
  else if (normalizedDifficulty.includes('intermediate')) color = "bg-yellow-500";
  else if (normalizedDifficulty.includes('advanced')) color = "bg-red-500";
  
  return (
    <Badge className={`${color} text-white text-xs`}>
      {difficulty}
    </Badge>
  );
};

const ResourceCard = ({ resource }: { resource: Resource }) => (
  <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-slate-200">
    <CardContent className="p-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <ResourceIcon type={resource.type} />
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-slate-800 line-clamp-2">
              {resource.title}
            </h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="text-xs">
                {resource.type}
              </Badge>
              <DifficultyBadge difficulty={resource.difficulty} />
            </div>
          </div>
          
          <p className="text-sm text-slate-600 line-clamp-2">
            {resource.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {resource.estimatedTime}
              </span>
              {resource.price && (
                <span className={resource.price === 'Free' ? 'text-green-600 font-medium' : 'text-slate-600'}>
                  {resource.price}
                </span>
              )}
            </div>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
              className="text-xs hover:bg-purple-50"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Visit
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ResourceSection = ({ 
  title, 
  icon, 
  resources, 
  description,
  color = "blue"
}: { 
  title: string; 
  icon: React.ReactNode; 
  resources: Resource[];
  description?: string;
  color?: string;
}) => {
  if (!resources || resources.length === 0) return null;
  
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500", 
    purple: "from-purple-500 to-violet-500",
    orange: "from-orange-500 to-red-500"
  }[color] || "from-blue-500 to-cyan-500";
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${colorClasses} flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          {description && <p className="text-sm text-slate-600">{description}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource, index) => (
          <ResourceCard key={`${resource.url}-${index}`} resource={resource} />
        ))}
      </div>
    </div>
  );
};

export function AILearningResources() {
  const { topic } = useParams<{ topic: string }>();
  const [data, setData] = useState<GetLearningResourceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!topic) return;
    
    const fetchResources = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const decodedTopic = decodeURIComponent(topic);
        const result = await getLearningResourceAction({ 
          topic: decodedTopic,
          userLevel: 'beginner', // Could be made dynamic
          learningStyle: 'mixed'
        });
        setData(result);
      } catch (err) {
        console.error('Error fetching learning resources:', err);
        setError('Failed to load learning resources.');
        toast.error('Failed to Load Resources', {
          description: 'Could not load learning resources. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [topic]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Card className="max-w-md mx-auto border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 justify-center">
              <AlertTriangle className="w-6 h-6" />
              Error Loading Resources
            </CardTitle>
            <CardDescription>{error || 'Failed to load learning resources'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-red-200 hover:bg-red-50"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const decodedTopic = topic ? decodeURIComponent(topic) : '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center justify-center gap-4">
            <BookOpen className="h-12 w-12 text-purple-500" />
            {decodedTopic}
          </CardTitle>
          
          <div className="flex justify-center gap-2 mt-4">
            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              AI-Curated
            </Badge>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
              <Target className="w-3 h-3 mr-1" />
              Comprehensive
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Topic Overview */}
      <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-800">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed whitespace-pre-line text-base">
              {data.topicOverview}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Learning Path */}
      <Card className="shadow-xl bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            Recommended Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">
            {data.learningPath}
          </p>
        </CardContent>
      </Card>

      {/* Practice Projects */}
      {data.practiceProjects && data.practiceProjects.length > 0 && (
        <Card className="shadow-xl bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-800 flex items-center gap-2">
              <Code className="w-6 h-6 text-orange-600" />
              Hands-On Projects
            </CardTitle>
            <CardDescription>Build these projects to practice and showcase your skills</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {data.practiceProjects.map((project, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-slate-700 flex-1">{project}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resource Sections */}
      <div className="space-y-8">
        <ResourceSection 
          title="Free Resources"
          icon={<Heart className="h-5 w-5 text-white" />}
          resources={data.freeResources}
          description="High-quality free resources to get you started"
          color="green"
        />
        
        <ResourceSection 
          title="Premium Resources"
          icon={<Star className="h-5 w-5 text-white" />}
          resources={data.premiumResources}
          description="Comprehensive paid courses and premium content"
          color="blue"
        />
        
        <ResourceSection 
          title="Certifications"
          icon={<Award className="h-5 w-5 text-white" />}
          resources={data.certifications}
          description="Industry-recognized credentials to validate your skills"
          color="purple"
        />
        
        <ResourceSection 
          title="Community & Forums"
          icon={<Users className="h-5 w-5 text-white" />}
          resources={data.communityResources}
          description="Connect with peers and get support from the community"
          color="orange"
        />
      </div>

      {/* Back to Roadmap */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-slate-50 to-slate-100">
        <CardContent className="p-6 text-center">
          <Button 
            onClick={() => window.location.href = '#/roadmaps'}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3"
          >
            ← Back to My Roadmap
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
