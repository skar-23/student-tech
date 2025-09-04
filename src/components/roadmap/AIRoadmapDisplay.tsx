import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  ExternalLink, 
  Trophy, 
  Star, 
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RoadmapItem {
  id: string;
  text: string;
  level: number;
  completed: boolean;
  children: RoadmapItem[];
}

interface AIRoadmapDisplayProps {
  roadmapText: string;
  metadata: {
    careerPath: string;
    estimatedDuration: string;
    difficultyLevel: string;
  };
  className?: string;
}

const parseRoadmapToHierarchy = (text: string): RoadmapItem[] => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const root: RoadmapItem = { id: 'root', text: 'root', level: -1, completed: false, children: [] };
  const parentStack: RoadmapItem[] = [root];

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    let level = 0;

    if (/^#\s/.test(trimmedLine)) level = 0;
    else if (/^##\s/.test(trimmedLine)) level = 1;
    else if (/^###\s/.test(trimmedLine)) level = 2;
    else if (/^####\s/.test(trimmedLine)) level = 3;
    else if (/^[-*]\s/.test(trimmedLine)) level = 4;
    else level = (line.match(/^\s*/) || [''])[0].length / 2 + 4;

    const text = trimmedLine.replace(/^(#+\s*|[-*]\s*)/, '');
    const newItem: RoadmapItem = { 
      id: `item-${index}`, 
      text, 
      level, 
      completed: false, 
      children: [] 
    };

    while (parentStack.length > 1 && level <= parentStack[parentStack.length - 1].level) {
      parentStack.pop();
    }
    
    parentStack[parentStack.length - 1].children.push(newItem);
    parentStack.push(newItem);
  });

  return root.children;
};

const RoadmapNode = ({ 
  item, 
  progress, 
  onToggle, 
  isLast, 
  onLearnMore 
}: { 
  item: RoadmapItem; 
  progress: Record<string, boolean>; 
  onToggle: (id: string, text: string) => void; 
  isLast: boolean;
  onLearnMore: (topic: string) => void;
}) => {
  const isCompleted = progress[item.id];
  const isLeaf = item.children.length === 0;

  const renderTextWithFormatting = (text: string) => {
    const boldKeywords = /Phase\s\d+:|Ongoing:|Goals:|Skills to Acquire:|Skills:|Milestones:|Projects?:/gi;
    if (text.match(boldKeywords)) {
      return <strong className="text-slate-800">{text.replace(/[*#]/g, '').trim()}</strong>;
    }
    return <span className="text-slate-700">{text.replace(/[*#]/g, '').trim()}</span>;
  };

  const cleanTextForSearch = (text: string) => {
    return text.replace(/[*#]|Phase\s\d+:|Ongoing:|Goals:|Skills to Acquire:|Skills:|Milestones:|Projects?:/gi, '').trim();
  };

  return (
    <div className="relative pl-8 sm:pl-12">
      {!isLast && (
        <div className="absolute left-3 sm:left-5 top-6 h-full w-0.5 bg-gradient-to-b from-purple-400 to-blue-400 opacity-30"></div>
      )}
      
      <div className="relative flex items-start gap-4">
        <div className="absolute left-3 sm:left-5 top-3 -translate-x-1/2">
          {isLeaf ? (
            <div className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-300",
              isCompleted 
                ? "bg-gradient-to-r from-green-400 to-green-500 border-green-400 shadow-lg" 
                : "bg-white border-slate-300 hover:border-purple-400"
            )}>
              {isCompleted && <CheckCircle2 className="w-3 h-3 text-white absolute -top-0.5 -left-0.5" />}
            </div>
          ) : (
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300",
              isCompleted 
                ? "bg-gradient-to-r from-purple-500 to-blue-500 border-purple-400" 
                : "bg-white border-slate-300 hover:border-purple-400"
            )}>
              <ArrowRight className={cn(
                "h-3 w-3 transition-colors",
                isCompleted ? "text-white" : "text-slate-500"
              )} />
            </div>
          )}
        </div>

        <Card className={cn(
          "w-full mb-3 transition-all duration-300 hover:shadow-lg",
          isCompleted 
            ? "bg-gradient-to-r from-green-50 to-green-100 border-green-200" 
            : "bg-white border-slate-200 hover:border-purple-300 hover:shadow-xl transform hover:scale-[1.01]"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {isLeaf && (
                  <Checkbox
                    id={item.id}
                    checked={isCompleted}
                    onCheckedChange={() => onToggle(item.id, item.text)}
                    className="h-5 w-5"
                  />
                )}
                
                <label 
                  htmlFor={item.id} 
                  className={cn(
                    "font-medium cursor-pointer flex-1",
                    isCompleted ? "line-through text-slate-500" : "text-slate-800"
                  )}
                >
                  {renderTextWithFormatting(item.text)}
                </label>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {isLeaf && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onLearnMore(cleanTextForSearch(item.text))}
                    className="h-8 px-2 text-xs hover:bg-purple-100"
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    Learn
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    const searchUrl = `https://www.google.com/search?q=learn+${encodeURIComponent(cleanTextForSearch(item.text))}`;
                    window.open(searchUrl, '_blank');
                  }}
                  className="h-8 px-2 text-xs hover:bg-blue-100"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {item.children.length > 0 && (
        <div className="mt-2 space-y-1">
          {item.children.map((child, idx) => (
            <RoadmapNode 
              key={child.id} 
              item={child} 
              progress={progress} 
              onToggle={onToggle} 
              onLearnMore={onLearnMore}
              isLast={idx === item.children.length - 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function AIRoadmapDisplay({ roadmapText, metadata, className }: AIRoadmapDisplayProps) {
  const [parsedRoadmap, setParsedRoadmap] = useState<RoadmapItem[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [xp, setXp] = useState(0);

  useEffect(() => {
    setParsedRoadmap(parseRoadmapToHierarchy(roadmapText));
    
    const storedProgress = localStorage.getItem(`roadmap_progress_${metadata.careerPath}`);
    const storedXp = localStorage.getItem('user_xp');
    
    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    }
    if (storedXp) {
      setXp(parseInt(storedXp, 10));
    }
  }, [roadmapText, metadata.careerPath]);

  const handleToggle = (id: string, text: string) => {
    const newProgress = { ...progress, [id]: !progress[id] };
    setProgress(newProgress);
    localStorage.setItem(`roadmap_progress_${metadata.careerPath}`, JSON.stringify(newProgress));

    if (!progress[id]) {
      const xpGain = 10;
      const newXP = xp + xpGain;
      setXp(newXP);
      localStorage.setItem('user_xp', newXP.toString());
      
      toast.success(`+${xpGain} XP!`, {
        description: `Completed: ${text.replace(/[*#]|Phase\s\d+:|Ongoing:|Goals:|Skills:|Milestones:/gi, '').trim()}`,
        duration: 3000,
      });
    }
  };

  const handleLearnMore = (topic: string) => {
    window.location.href = `#/learn/${encodeURIComponent(topic)}`;
  };

  const totalItems = parsedRoadmap.reduce((total, phase) => {
    return total + countLeafNodes(phase);
  }, 0);
  
  const completedItems = Object.values(progress).filter(Boolean).length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  function countLeafNodes(item: RoadmapItem): number {
    if (item.children.length === 0) return 1;
    return item.children.reduce((count, child) => count + countLeafNodes(child), 0);
  }

  return (
    <div className={`w-full max-w-5xl mx-auto space-y-6 ${className}`}>
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <div className="text-center space-y-4">
            <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Your {metadata.careerPath} Roadmap
            </CardTitle>
            
            <div className="flex justify-center gap-3 flex-wrap">
              <Badge variant="secondary" className="px-3 py-1">
                <Clock className="w-3 h-3 mr-1" />
                {metadata.estimatedDuration}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Target className="w-3 h-3 mr-1" />
                {metadata.difficultyLevel}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Trophy className="w-3 h-3 mr-1" />
                {xp} XP
              </Badge>
            </div>
            
            <div className="space-y-3 max-w-md mx-auto">
              <div className="flex justify-between text-sm font-medium">
                <span>Overall Progress</span>
                <span>{progressPercentage}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-3 bg-slate-200" />
              <div className="text-sm text-slate-600">
                {completedItems} of {totalItems} tasks completed
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="relative">
            <div className="absolute left-3 sm:left-5 top-0 h-full w-0.5 bg-gradient-to-b from-purple-400 via-blue-400 to-purple-400 opacity-20"></div>
            
            {parsedRoadmap.map((item, idx) => (
              <RoadmapNode 
                key={item.id} 
                item={item} 
                progress={progress} 
                onToggle={handleToggle}
                onLearnMore={handleLearnMore}
                isLast={idx === parsedRoadmap.length - 1} 
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {progressPercentage === 100 && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-4xl mb-4">🎉</div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Congratulations! 🏆</h3>
                <p className="text-slate-600">
                  You've completed your {metadata.careerPath} roadmap! 
                  You're now ready to take the next step in your career journey.
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2">
                <Star className="w-4 h-4 mr-1" />
                {xp} Total XP Earned
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {progressPercentage > 0 && progressPercentage < 100 && (
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Keep Going!</p>
                  <p className="text-sm text-slate-600">
                    {progressPercentage < 25 ? "You're just getting started!" :
                     progressPercentage < 50 ? "You're making great progress!" :
                     progressPercentage < 75 ? "More than halfway there!" :
                     "Almost finished - you've got this!"}
                  </p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {xp} XP
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
