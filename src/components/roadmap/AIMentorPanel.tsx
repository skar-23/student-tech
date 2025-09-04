import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Loader2, 
  Sparkles, 
  MessageCircle, 
  Lightbulb,
  Target,
  ArrowRight,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';
import { getMentorGuidanceAction } from '@/lib/ai/actions';
import { cn } from '@/lib/utils';

interface MentorGuidanceData {
  guidance: string;
  nextSteps: string;
  motivation: string;
}

interface AIMentorPanelProps {
  userProgress?: {
    completedTasks: number;
    totalTasks: number;
    currentPhase: string;
    careerGoal: string;
  };
  className?: string;
}

export function AIMentorPanel({ userProgress, className }: AIMentorPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [challenges, setChallenges] = useState('');
  const [guidanceData, setGuidanceData] = useState<MentorGuidanceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetGuidance = async () => {
    if (!challenges.trim() && !userProgress) {
      toast.error('Please describe your challenges or complete some roadmap tasks first.');
      return;
    }

    setIsLoading(true);
    setGuidanceData(null);
    
    try {
      const progressDescription = userProgress 
        ? `User is working on becoming a ${userProgress.careerGoal}. They have completed ${userProgress.completedTasks} out of ${userProgress.totalTasks} tasks (${Math.round((userProgress.completedTasks / userProgress.totalTasks) * 100)}% complete). Currently in: ${userProgress.currentPhase}.`
        : 'User is just starting their learning journey.';

      const input = {
        userProgress: progressDescription,
        learningGoals: userProgress?.careerGoal || 'General career development',
        challenges: challenges.trim() || 'Looking for general guidance and motivation',
        recentActivity: userProgress?.completedTasks > 0 
          ? `Recently completed ${userProgress.completedTasks} learning tasks` 
          : 'Just started learning'
      };

      const result = await getMentorGuidanceAction(input);
      setGuidanceData(result);
      
      toast.success('AI Mentor Response Ready!', {
        description: 'Your personalized guidance is available below.',
      });
      
    } catch (error) {
      console.error('Error getting mentor guidance:', error);
      toast.error('Failed to Get Guidance', {
        description: 'Please try again later or check your connection.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercentage = userProgress 
    ? Math.round((userProgress.completedTasks / userProgress.totalTasks) * 100)
    : 0;

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              size="lg" 
              className={cn(
                "rounded-full h-16 w-16 shadow-2xl animate-pulse bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 border-0",
                className
              )}
            >
              <Bot className="h-8 w-8 text-white" />
              <span className="sr-only">Open AI Mentor</span>
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[80vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                AI Mentor Assistant
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Get personalized guidance, motivation, and actionable advice for your learning journey.
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-6 space-y-6">
              {/* Progress Overview */}
              {userProgress && (
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-800">Your Progress</h4>
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {progressPercentage}% Complete
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p>🎯 Goal: {userProgress.careerGoal}</p>
                      <p>📚 Progress: {userProgress.completedTasks}/{userProgress.totalTasks} tasks</p>
                      <p>🚀 Current Phase: {userProgress.currentPhase}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Input Section */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    What challenges are you facing? (Optional)
                  </label>
                  <Textarea 
                    placeholder="e.g., I'm struggling with understanding React hooks, finding it hard to stay motivated, confused about which framework to learn next..."
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Leave blank for general motivation and guidance based on your progress.
                  </p>
                </div>
                
                <Button 
                  onClick={handleGetGuidance} 
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      AI is thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Get AI Guidance
                    </>
                  )}
                </Button>
              </div>

              {/* Guidance Results */}
              {guidanceData && (
                <ScrollArea className="max-h-96">
                  <div className="space-y-4">
                    {/* Main Guidance */}
                    <Card className="border-purple-200 bg-purple-50/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Lightbulb className="w-5 h-5 text-purple-600" />
                          Personalized Guidance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                          {guidanceData.guidance}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Next Steps */}
                    <Card className="border-blue-200 bg-blue-50/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Target className="w-5 h-5 text-blue-600" />
                          Next Steps
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                          {guidanceData.nextSteps}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Motivation */}
                    <Card className="border-green-200 bg-green-50/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Heart className="w-5 h-5 text-green-600" />
                          Motivation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-slate-700 whitespace-pre-line leading-relaxed font-medium">
                          {guidanceData.motivation}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              )}

              {/* Loading State */}
              {isLoading && (
                <Card className="border-slate-200">
                  <CardContent className="p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
                        <Bot className="h-6 w-6 text-white animate-bounce" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">AI Mentor is thinking...</p>
                        <p className="text-sm text-slate-600">Analyzing your progress and preparing personalized guidance</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Access Mentor Button (Alternative placement) */}
      <Card className={cn("border-0 shadow-lg bg-gradient-to-r from-purple-100 to-blue-100 hover:shadow-xl transition-all duration-300", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">AI Mentor Available</h3>
                <p className="text-sm text-slate-600">
                  Need guidance or motivation? Ask your AI mentor for help!
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setIsOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat with AI
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
