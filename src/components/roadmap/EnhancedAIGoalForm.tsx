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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Sparkles, 
  Target, 
  Brain, 
  Clock, 
  Zap, 
  FileText, 
  ListChecks,
  TrendingUp,
  BookOpen,
  Calendar,
  ArrowUp
} from 'lucide-react';
import { toast } from 'sonner';
import { generateCustomRoadmapAction, parseRoadmapText } from '@/lib/ai/actions';

const careerFormSchema = z.object({
  careerPath: z.string().min(2, { message: 'Career path must be at least 2 characters.' }),
  currentSkills: z.string().min(5, { message: 'Please describe your current skills.' }),
  goals: z.string().min(5, { message: 'Please describe your goals.' }),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  timeline: z.string().min(1, { message: 'Please specify your timeline.' }),
});

const syllabusFormSchema = z.object({
  syllabusContent: z.string().min(10, { message: 'Please paste your syllabus or curriculum content.' }),
  totalDuration: z.string().min(1, { message: 'Please specify total time available.' }),
  studyHoursPerWeek: z.number().min(1).max(168, { message: 'Please enter valid study hours per week.' }),
  priorityFocus: z.string().optional(),
  examDate: z.string().optional(),
  currentProgress: z.string().optional(),
});

type CareerFormData = z.infer<typeof careerFormSchema>;
type SyllabusFormData = z.infer<typeof syllabusFormSchema>;

interface EnhancedAIGoalFormProps {
  onRoadmapGenerated: (roadmapData: {
    rawRoadmap: string;
    structuredRoadmap: any;
    metadata: {
      careerPath: string;
      estimatedDuration: string;
      difficultyLevel: string;
      type: 'career' | 'syllabus';
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

const durationOptions = [
  { value: "1 month", label: "1 month" },
  { value: "2 months", label: "2 months" },
  { value: "3 months", label: "3 months (Semester)" },
  { value: "4 months", label: "4 months" },
  { value: "6 months", label: "6 months (Full Course)" },
  { value: "1 year", label: "1 year (Annual Program)" }
];

export function EnhancedAIGoalForm({ onRoadmapGenerated, className }: EnhancedAIGoalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('career');

  const careerForm = useForm<CareerFormData>({
    resolver: zodResolver(careerFormSchema),
    defaultValues: {
      careerPath: '',
      currentSkills: '',
      goals: '',
      experienceLevel: 'beginner',
      timeline: '6 months',
    },
  });

  const syllabusForm = useForm<SyllabusFormData>({
    resolver: zodResolver(syllabusFormSchema),
    defaultValues: {
      syllabusContent: '',
      totalDuration: '3 months',
      studyHoursPerWeek: 10,
      priorityFocus: '',
      examDate: '',
      currentProgress: '',
    },
  });

  async function onCareerSubmit(values: CareerFormData) {
    setIsLoading(true);
    try {
      const result = await generateCustomRoadmapAction({
        type: 'career',
        data: values
      });

      const structuredRoadmap = parseRoadmapText(result.roadmap);

      onRoadmapGenerated({
        rawRoadmap: result.roadmap,
        structuredRoadmap,
        metadata: {
          careerPath: values.careerPath,
          estimatedDuration: result.estimatedDuration,
          difficultyLevel: result.difficultyLevel,
          type: 'career'
        },
      });

      toast.success("AI Career Roadmap Generated!", {
        description: "Your personalized career path is ready!",
        duration: 5000,
      });

      careerForm.reset();
      
    } catch (error) {
      console.error('Error generating career roadmap:', error);
      toast.error('Failed to Generate Roadmap', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSyllabusSubmit(values: SyllabusFormData) {
    setIsLoading(true);
    try {
      const result = await generateCustomRoadmapAction({
        type: 'syllabus',
        data: values
      });

      const structuredRoadmap = parseRoadmapText(result.roadmap);

      onRoadmapGenerated({
        rawRoadmap: result.roadmap,
        structuredRoadmap,
        metadata: {
          careerPath: `Custom Study Plan`,
          estimatedDuration: values.totalDuration,
          difficultyLevel: 'Custom',
          type: 'syllabus'
        },
      });

      toast.success("AI Study Plan Generated!", {
        description: "Your optimized learning schedule is ready!",
        duration: 5000,
      });

      syllabusForm.reset();
      
    } catch (error) {
      console.error('Error generating study plan:', error);
      toast.error('Failed to Generate Study Plan', {
        description: error instanceof Error ? error.message : 'Please try again later.',
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
          <CardTitle className="text-3xl font-bold">AI Learning Planner</CardTitle>
        </div>
        <CardDescription className="text-lg">
          Choose your approach: Career-focused roadmap or Custom syllabus analysis
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
            <ArrowUp className="w-3 h-3 mr-1" />
            Priority-Based
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="career" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Career Roadmap
            </TabsTrigger>
            <TabsTrigger value="syllabus" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Custom Syllabus
            </TabsTrigger>
          </TabsList>

          {/* Career Roadmap Tab */}
          <TabsContent value="career" className="space-y-6">
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Career-Focused Learning Path
              </h3>
              <p className="text-sm text-slate-600">
                AI analyzes your career goals and creates a structured path with industry-relevant skills
              </p>
            </div>

            <Form {...careerForm}>
              <form onSubmit={careerForm.handleSubmit(onCareerSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={careerForm.control}
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
                    control={careerForm.control}
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
                  control={careerForm.control}
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
                  control={careerForm.control}
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
                  control={careerForm.control}
                  name="goals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Your Goals & Aspirations</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Land a developer job at a tech company, build my own startup, freelance remotely..."
                          className="h-24 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      AI is crafting your career roadmap...
                    </>
                  ) : (
                    <>
                      <Target className="mr-3 h-5 w-5" />
                      Generate Career Roadmap
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Custom Syllabus Tab */}
          <TabsContent value="syllabus" className="space-y-6">
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center justify-center gap-2">
                <ListChecks className="w-5 h-5 text-green-600" />
                Smart Syllabus Analysis
              </h3>
              <p className="text-sm text-slate-600">
                Upload your curriculum, syllabus, or todo list. AI will analyze topics, prioritize by importance, and create an optimized study schedule
              </p>
            </div>

            <Form {...syllabusForm}>
              <form onSubmit={syllabusForm.handleSubmit(onSyllabusSubmit)} className="space-y-6">
                <FormField
                  control={syllabusForm.control}
                  name="syllabusContent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Syllabus / Curriculum Content
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Paste your syllabus, curriculum, or todo list here. For example:

Course: Advanced Web Development
1. JavaScript ES6+ Features
2. React.js and Component Architecture  
3. Node.js and Express.js
4. Database Design with MongoDB
5. Authentication and Security
6. Deployment and DevOps
7. Testing and Quality Assurance

OR

Todo List:
- Learn React Hooks
- Build portfolio website
- Master API integration
- Study database design
- Practice algorithm problems`}
                          className="h-48 resize-none text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={syllabusForm.control}
                    name="totalDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Total Duration
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {durationOptions.map((option) => (
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
                    control={syllabusForm.control}
                    name="studyHoursPerWeek"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Study Hours per Week
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="168"
                            placeholder="e.g., 10"
                            className="h-12"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={syllabusForm.control}
                  name="priorityFocus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <ArrowUp className="w-4 h-4" />
                        Priority Focus (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any specific topics you want to prioritize or need to focus on more? e.g., 'Focus heavily on React and JavaScript', 'Prioritize practical projects over theory'"
                          className="h-20 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={syllabusForm.control}
                    name="examDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Exam/Deadline Date (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={syllabusForm.control}
                    name="currentProgress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Current Progress (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What have you already covered or completed?"
                            className="h-12 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      AI is analyzing your syllabus...
                    </>
                  ) : (
                    <>
                      <ListChecks className="mr-3 h-5 w-5" />
                      Analyze & Create Study Plan
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
