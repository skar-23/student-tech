import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Brain, Clock, Target, CheckCircle, XCircle, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Question {
  id: number;
  question_text: string;
  solution: string;
  topic: string;
  difficulty: string;
  difficulty_score: number;
  tags: string[];
  estimated_time: number;
}

export default function Practice() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  // Get user's current skill assessments
  const { data: userAssessments } = useQuery({
    queryKey: ['userAssessments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Get available topics for practice
  const { data: topics } = useQuery({
    queryKey: ['practiceTopics'],
    queryFn: async () => {
      const { data } = await supabase
        .from('question_bank')
        .select('topic')
        .order('topic');
      
      const uniqueTopics = [...new Set(data?.map(q => q.topic) || [])];
      return uniqueTopics;
    },
  });

  // ML Algorithm: Get next appropriate question based on user's skill level
  const getNextQuestionMutation = useMutation({
    mutationFn: async (topic: string) => {
      const assessment = userAssessments?.find(a => a.topic === topic);
      let targetDifficultyRange: [number, number];

      if (!assessment) {
        // New topic - start with easy questions
        targetDifficultyRange = [1, 4];
      } else {
        // Adaptive difficulty based on accuracy
        const { accuracy_rate, skill_level } = assessment;
        
        if (skill_level === 'beginner' || accuracy_rate < 60) {
          targetDifficultyRange = [1, 4]; // Easy questions
        } else if (skill_level === 'intermediate' || accuracy_rate < 80) {
          targetDifficultyRange = [4, 7]; // Medium questions
        } else {
          targetDifficultyRange = [7, 10]; // Hard questions
        }
      }

      // Get questions that user hasn't answered correctly recently
      const { data: recentCorrect } = await supabase
        .from('question_attempts')
        .select('question_id')
        .eq('user_id', user?.id)
        .eq('is_correct', true)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const excludeIds = recentCorrect?.map(a => a.question_id) || [];

      // Fetch appropriate question
      let query = supabase
        .from('question_bank')
        .select('*')
        .eq('topic', topic)
        .gte('difficulty_score', targetDifficultyRange[0])
        .lte('difficulty_score', targetDifficultyRange[1]);

      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }

      const { data } = await query
        .order('difficulty_score')
        .limit(1)
        .single();

      return data;
    },
    onSuccess: (question) => {
      setCurrentQuestion(question);
      setUserAnswer('');
      setShowSolution(false);
      setQuestionStartTime(Date.now());
    },
    onError: () => {
      toast.error('No more questions available for this topic level');
    },
  });

  // Submit answer and update ML model
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ isCorrect }: { isCorrect: boolean }) => {
      if (!currentQuestion || !user?.id) return;

      const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

      // Record the attempt
      await supabase
        .from('question_attempts')
        .insert({
          user_id: user.id,
          question_id: currentQuestion.id,
          user_answer: userAnswer,
          is_correct: isCorrect,
          time_taken: timeTaken,
        });

      // Update or create user assessment
      const { data: existingAssessment } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('topic', currentQuestion.topic)
        .single();

      if (existingAssessment) {
        // Update existing assessment
        const newAttempts = existingAssessment.questions_attempted + 1;
        const newCorrect = existingAssessment.questions_correct + (isCorrect ? 1 : 0);
        const newAccuracy = (newCorrect / newAttempts) * 100;

        // Determine new skill level based on accuracy and question difficulty
        let newSkillLevel = existingAssessment.skill_level;
        if (newAccuracy >= 80 && currentQuestion.difficulty_score >= 7) {
          newSkillLevel = 'advanced';
        } else if (newAccuracy >= 70 && currentQuestion.difficulty_score >= 4) {
          newSkillLevel = 'intermediate';
        } else {
          newSkillLevel = 'beginner';
        }

        await supabase
          .from('user_assessments')
          .update({
            accuracy_rate: newAccuracy,
            questions_attempted: newAttempts,
            questions_correct: newCorrect,
            skill_level: newSkillLevel,
            last_assessment_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingAssessment.id);
      } else {
        // Create new assessment
        await supabase
          .from('user_assessments')
          .insert({
            user_id: user.id,
            topic: currentQuestion.topic,
            skill_level: isCorrect ? (currentQuestion.difficulty_score >= 7 ? 'intermediate' : 'beginner') : 'beginner',
            accuracy_rate: isCorrect ? 100 : 0,
            questions_attempted: 1,
            questions_correct: isCorrect ? 1 : 0,
          });
      }

      // Award credits for correct answers
      if (isCorrect) {
        const creditReward = Math.ceil(currentQuestion.difficulty_score);
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ credits: profile.credits + creditReward })
            .eq('id', user.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAssessments', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  const currentAssessment = userAssessments?.find(a => a.topic === selectedTopic);
  const accuracyRate = currentAssessment?.accuracy_rate || 0;
  const skillLevel = currentAssessment?.skill_level || 'beginner';

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-blue-100/80 backdrop-blur-sm border border-blue-200/50 rounded-full px-4 py-2">
          <Brain className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">AI-Powered Practice</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
          Smart <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Practice Arena</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Our ML algorithm adapts to your skill level, providing personalized question difficulty
        </p>
      </div>

      {/* Topic Selection */}
      {!selectedTopic && (
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Choose Your Practice Topic
            </CardTitle>
            <CardDescription>
              Select a topic to begin your adaptive learning session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics?.map((topic) => {
                const assessment = userAssessments?.find(a => a.topic === topic);
                return (
                  <Card
                    key={topic}
                    className="cursor-pointer hover-lift border-2 hover:border-blue-300 transition-all"
                    onClick={() => setSelectedTopic(topic)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-800">{topic}</h3>
                        {assessment && (
                          <Badge variant={
                            assessment.skill_level === 'advanced' ? 'default' :
                            assessment.skill_level === 'intermediate' ? 'secondary' : 'outline'
                          }>
                            {assessment.skill_level}
                          </Badge>
                        )}
                      </div>
                      {assessment ? (
                        <div className="space-y-2">
                          <div className="text-sm text-slate-600">
                            Accuracy: {assessment.accuracy_rate.toFixed(1)}%
                          </div>
                          <div className="text-sm text-slate-600">
                            Questions: {assessment.questions_attempted}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500">
                          Start your first assessment
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Topic Practice */}
      {selectedTopic && (
        <div className="space-y-6">
          {/* Topic Header */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl text-slate-800">{selectedTopic}</CardTitle>
                  <CardDescription>
                    Current Level: <Badge variant="secondary">{skillLevel}</Badge> | 
                    Accuracy: {accuracyRate.toFixed(1)}%
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedTopic('');
                      setCurrentQuestion(null);
                    }}
                  >
                    Change Topic
                  </Button>
                  <Button
                    onClick={() => getNextQuestionMutation.mutate(selectedTopic)}
                    disabled={getNextQuestionMutation.isPending}
                    className="gradient-primary text-white"
                  >
                    {currentQuestion ? 'Next Question' : 'Start Practice'}
                  </Button>
                </div>
              </div>

              {/* Progress Bar for Skill Level */}
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span>Skill Progress</span>
                  <span>{accuracyRate.toFixed(0)}%</span>
                </div>
                <Progress value={accuracyRate} className="h-2" />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Beginner (0-60%)</span>
                  <span>Intermediate (60-80%)</span>
                  <span>Advanced (80%+)</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Current Question */}
          {currentQuestion && (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Question #{currentQuestion.id}
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <Badge variant={
                      currentQuestion.difficulty === 'Easy' ? 'outline' :
                      currentQuestion.difficulty === 'Medium' ? 'secondary' : 'default'
                    }>
                      {currentQuestion.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      ~{currentQuestion.estimated_time}m
                    </div>
                  </div>
                </div>
                {currentQuestion.tags && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {currentQuestion.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-50 rounded-lg p-6">
                  <h3 className="font-medium text-slate-800 mb-4">Question:</h3>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {currentQuestion.question_text}
                  </p>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="answer">Your Answer:</Label>
                  <Textarea
                    id="answer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={6}
                    disabled={showSolution}
                    className="font-mono"
                  />
                </div>

                {!showSolution && (
                  <div className="flex gap-4">
                    <Button
                      onClick={() => {
                        submitAnswerMutation.mutate({ isCorrect: false });
                        setShowSolution(true);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Show Solution
                    </Button>
                    <Button
                      onClick={() => {
                        // Simple check - in real app, you'd want more sophisticated answer validation
                        const isCorrect = userAnswer.trim().toLowerCase().includes(
                          currentQuestion.solution.toLowerCase().split(' ')[0]
                        );
                        submitAnswerMutation.mutate({ isCorrect });
                        setShowSolution(true);
                        
                        if (isCorrect) {
                          toast.success('Correct! Great job!');
                        } else {
                          toast.error('Not quite right. Check the solution below.');
                        }
                      }}
                      disabled={!userAnswer.trim()}
                      className="gradient-primary text-white flex-1"
                    >
                      Submit Answer
                    </Button>
                  </div>
                )}

                {showSolution && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-medium text-green-800 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Solution:
                    </h3>
                    <p className="text-green-700 leading-relaxed whitespace-pre-wrap">
                      {currentQuestion.solution}
                    </p>
                    <Button
                      onClick={() => getNextQuestionMutation.mutate(selectedTopic)}
                      className="mt-4 gradient-primary text-white"
                      disabled={getNextQuestionMutation.isPending}
                    >
                      Next Question →
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
