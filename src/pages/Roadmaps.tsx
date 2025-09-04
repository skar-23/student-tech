import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, Sparkles, Rocket, Target, BookOpen, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { EnhancedAIGoalForm } from '@/components/roadmap/EnhancedAIGoalForm';
import { AIRoadmapDisplay } from '@/components/roadmap/AIRoadmapDisplay';
import { AIMentorPanel } from '@/components/roadmap/AIMentorPanel';

interface RoadmapData {
  rawRoadmap: string;
  structuredRoadmap: any;
  metadata: {
    careerPath: string;
    estimatedDuration: string;
    difficultyLevel: string;
  };
}

export default function Roadmaps() {
  const [currentRoadmap, setCurrentRoadmap] = useState<RoadmapData | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [savedRoadmaps, setSavedRoadmaps] = useState<RoadmapData[]>([]);

  useEffect(() => {
    // Load saved roadmaps from localStorage
    const saved = localStorage.getItem('ai_roadmaps');
    if (saved) {
      setSavedRoadmaps(JSON.parse(saved));
    }
    
    // Load current active roadmap
    const current = localStorage.getItem('current_ai_roadmap');
    if (current) {
      setCurrentRoadmap(JSON.parse(current));
    }
  }, []);

  const handleRoadmapGenerated = (roadmapData: RoadmapData) => {
    // Save the new roadmap
    const updatedRoadmaps = [roadmapData, ...savedRoadmaps.slice(0, 4)]; // Keep only last 5
    setSavedRoadmaps(updatedRoadmaps);
    setCurrentRoadmap(roadmapData);
    
    // Persist to localStorage
    localStorage.setItem('ai_roadmaps', JSON.stringify(updatedRoadmaps));
    localStorage.setItem('current_ai_roadmap', JSON.stringify(roadmapData));
    
    setShowGenerator(false);
  };

  const loadRoadmap = (roadmapData: RoadmapData) => {
    setCurrentRoadmap(roadmapData);
    localStorage.setItem('current_ai_roadmap', JSON.stringify(roadmapData));
    toast.success('Roadmap Loaded', {
      description: `Switched to your ${roadmapData.metadata.careerPath} roadmap`,
    });
  };

  const getCurrentPhase = () => {
    if (!currentRoadmap?.structuredRoadmap?.phases) return 'Getting Started';
    return currentRoadmap.structuredRoadmap.phases[0]?.title || 'Phase 1';
  };

  const getUserProgress = () => {
    if (!currentRoadmap) return undefined;
    
    const progressKey = `roadmap_progress_${currentRoadmap.metadata.careerPath}`;
    const storedProgress = localStorage.getItem(progressKey);
    const progress = storedProgress ? JSON.parse(storedProgress) : {};
    
    const completedTasks = Object.values(progress).filter(Boolean).length;
    const totalTasks = countTotalTasks(currentRoadmap.structuredRoadmap);
    
    return {
      completedTasks,
      totalTasks,
      currentPhase: getCurrentPhase(),
      careerGoal: currentRoadmap.metadata.careerPath,
    };
  };

  const countTotalTasks = (roadmapStructure: any): number => {
    if (!roadmapStructure?.phases) return 0;
    return roadmapStructure.phases.reduce((total: number, phase: any) => {
      return total + (phase.skills?.length || 0) + (phase.milestones?.length || 0);
    }, 0);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 backdrop-blur-sm border border-purple-200 rounded-full px-6 py-3">
          <Brain className="w-5 h-5 text-purple-600" />
          <span className="text-sm font-semibold text-purple-700">AI-Powered Career Guidance</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-slate-800">
          Smart <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Roadmaps</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Get personalized, AI-generated learning paths tailored to your career goals, current skills, and timeline. 
          Track progress, earn XP, and get mentor guidance along the way.
        </p>
      </div>

      {/* Current Active Roadmap */}
      {currentRoadmap ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              Active Roadmap
            </h2>
            <Button
              onClick={() => setShowGenerator(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create New Roadmap
            </Button>
          </div>
          
          <AIRoadmapDisplay 
            roadmapText={currentRoadmap.rawRoadmap}
            metadata={currentRoadmap.metadata}
          />
          
          {/* AI Mentor Panel */}
          <AIMentorPanel userProgress={getUserProgress()} />
        </div>
      ) : (
        <div className="space-y-8">
          {/* No Active Roadmap - Show Generator */}
          {!showGenerator ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Rocket className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Ready to Start Your Journey?</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Our AI will analyze your goals and create a personalized learning roadmap just for you.
              </p>
              <Button
                onClick={() => setShowGenerator(true)}
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold shadow-xl"
              >
                <Brain className="w-5 h-5 mr-3" />
                Generate My AI Roadmap
              </Button>
            </div>
          ) : (
            <EnhancedAIGoalForm onRoadmapGenerated={handleRoadmapGenerated} />
          )}
        </div>
      )}

      {/* Saved Roadmaps */}
      {savedRoadmaps.length > 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Your Roadmap History
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedRoadmaps.slice(1).map((roadmap, index) => (
              <Card 
                key={index} 
                className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                onClick={() => loadRoadmap(roadmap)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-800 truncate">
                    {roadmap.metadata.careerPath}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {roadmap.metadata.difficultyLevel}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {roadmap.metadata.estimatedDuration}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    size="sm" 
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Switch to this Roadmap
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Generate New Roadmap Modal */}
      {showGenerator && currentRoadmap && (
        <Card className="border-2 border-purple-200 shadow-2xl bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-slate-800">Create Another Roadmap</CardTitle>
              <Button
                onClick={() => setShowGenerator(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <EnhancedAIGoalForm onRoadmapGenerated={handleRoadmapGenerated} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
