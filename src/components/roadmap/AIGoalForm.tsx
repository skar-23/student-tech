import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Target, Brain, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { generateRoadmapAction, parseRoadmapText } from '@/lib/ai/actions';

const formSchema = z.object({
  careerPath: z.string().min(2, { message: 'Career path must be at least 2 characters.' }),
  currentSkills: z.string().min(5, { message: 'Please describe your current skills.' }),
  goals: z.string().min(5, { message: 'Please describe your goals.' }),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Please select your experience level.',
  }),
  timeline: z.string().min(1, { message: 'Please specify your timeline.' }),
});

type FormData = z.infer<typeof formSchema>;

interface AIGoalFormProps {
  onRoadmapGenerated: (roadmapData: {
    rawRoadmap: string;
    structuredRoadmap: any;
    metadata: {
      careerPath: string;
      estimatedDuration: string;
      difficultyLevel: string;
    };
  }) => void;
  className?: string;
}

const careerPaths = [
  "Full Stack Developer",
  "Frontend Developer", 
  "Backend Developer",
  "Data Scientist",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Mobile App Developer",
  "Cybersecurity Specialist",
  "Cloud Architect",
  "Product Manager",
  "UI/UX Designer",
  "Blockchain Developer"
];

const timelineOptions = [
  { value: "3 months", label: "3 months (Intensive)" },
  { value: "6 months", label: "6 months (Standard)" },
  { value: "9 months", label: "9 months (Relaxed)" },
  { value: "12 months", label: "12 months (Part-time)" },
  { value: "18 months", label: "18+ months (Very Flexible)" }
];

export function AIGoalForm({ onRoadmapGenerated, className }: AIGoalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      careerPath: '',
      currentSkills: '',
      goals: '',
      experienceLevel: 'beginner',
      timeline: '6 months',
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    try {
      const result = await generateRoadmapAction({
        careerPath: values.careerPath,
        currentSkills: values.currentSkills,
        goals: values.goals,
        experienceLevel: values.experienceLevel,
        timeline: values.timeline,
      });

      // Parse the roadmap into structured data
      const structuredRoadmap = parseRoadmapText(result.roadmap);

      onRoadmapGenerated({
        rawRoadmap: result.roadmap,
        structuredRoadmap,
        metadata: {
          careerPath: values.careerPath,
          estimatedDuration: result.estimatedDuration,
          difficultyLevel: result.difficultyLevel,
        },
      });

      toast.success("AI Roadmap Generated!", {
        description: "Your personalized learning path is ready!",
        duration: 5000,
      });

      // Reset form
      form.reset();
      
    } catch (error) {
      console.error('Error generating roadmap:', error);
      toast.error('Failed to Generate Roadmap', {
        description: error instanceof Error ? error.message : 'Please try again later.',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className={`border-0 shadow-2xl bg-white/80 backdrop-blur-sm ${className}`}>
      <CardHeader className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mx-auto mb-2">
          <Brain className="w-8 h-8 text-purple-500" />
          <CardTitle className="text-3xl font-bold">AI Roadmap Generator</CardTitle>
        </div>
        <CardDescription className="text-lg">
          Our AI analyzes your goals and creates a personalized learning path in seconds
        </CardDescription>
        
        <div className="flex justify-center gap-2 mt-4">
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Target className="w-3 h-3 mr-1" />
            Personalized
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Zap className="w-3 h-3 mr-1" />
            Instant
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="careerPath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Career Goal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="What do you want to become?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {careerPaths.map((path) => (
                          <SelectItem key={path} value={path}>
                            {path}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
                        <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                        <SelectItem value="advanced">Advanced - Significant experience</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timeline
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timelineOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentSkills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Current Skills</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., HTML, CSS, basic JavaScript, Python fundamentals, worked with databases..."
                      className="h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Your Goals & Aspirations</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Land a developer job at a tech company, build my own startup, freelance remotely, transition from my current career..."
                      className="h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-[1.02] shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    AI is crafting your roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-3 h-5 w-5" />
                    Generate My AI Roadmap
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
