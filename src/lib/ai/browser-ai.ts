/**
 * Browser-compatible AI service that works with Vite
 * This avoids Node.js dependencies that cause browser compatibility issues
 */

export interface GenerateRoadmapInput {
  careerPath: string;
  currentSkills: string;
  goals: string;
  experienceLevel: string;
  timeline: string;
}

export interface GenerateRoadmapOutput {
  roadmap: string;
  estimatedDuration: string;
  difficultyLevel: string;
}

export interface MentorGuidanceInput {
  userProgress: string;
  learningGoals: string;
  challenges?: string;
  recentActivity?: string;
}

export interface MentorGuidanceOutput {
  guidance: string;
  nextSteps: string;
  motivation: string;
}

export interface GetLearningResourceInput {
  topic: string;
  userLevel?: string;
  learningStyle?: string;
}

export interface Resource {
  type: string;
  title: string;
  url: string;
  description: string;
  difficulty: string;
  estimatedTime: string;
  price?: string;
}

export interface GetLearningResourceOutput {
  topicOverview: string;
  learningPath: string;
  freeResources: Resource[];
  premiumResources: Resource[];
  practiceProjects: string[];
  certifications: Resource[];
  communityResources: Resource[];
}

// Mock AI functions for development (replace with actual API calls)
export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate a structured roadmap based on input
  const roadmap = generateMockRoadmap(input);
  
  return {
    roadmap,
    estimatedDuration: input.timeline,
    difficultyLevel: input.experienceLevel,
  };
}

export async function getMentorGuidance(input: MentorGuidanceInput): Promise<MentorGuidanceOutput> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    guidance: `Based on your progress in ${input.learningGoals}, here's my personalized advice: ${input.challenges ? `Regarding your challenge with ${input.challenges}, I recommend breaking it down into smaller, manageable steps. Focus on understanding the fundamentals first, then gradually build complexity.` : 'You\'re making excellent progress! Keep maintaining your current momentum and don\'t hesitate to seek help when needed.'}`,
    nextSteps: `1. Review the concepts you've recently learned\n2. Practice with hands-on exercises\n3. ${input.challenges ? 'Research additional resources for your specific challenge' : 'Move on to the next phase of your roadmap'}\n4. Connect with the community for support\n5. Set aside dedicated time for focused learning`,
    motivation: `🌟 You're on an incredible journey of growth! ${input.userProgress.includes('completed') ? 'Your progress shows real dedication and commitment.' : 'Every expert was once a beginner, and you\'re taking the right steps.'} Remember, consistency beats perfection. Keep moving forward, one step at a time, and you'll achieve your goal of becoming a ${input.learningGoals}! 💪`
  };
}

export async function getLearningResource(input: GetLearningResourceInput): Promise<GetLearningResourceOutput> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  return generateMockLearningResources(input.topic);
}

// New function for syllabus-based roadmap generation
export async function generateSyllabusBasedRoadmap(input: {
  syllabusContent: string;
  totalDuration: string;
  studyHoursPerWeek: number;
  priorityFocus?: string;
  examDate?: string;
  currentProgress?: string;
}): Promise<GenerateRoadmapOutput> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const roadmap = analyzeSyllabusAndCreatePlan(input);
  
  return {
    roadmap,
    estimatedDuration: input.totalDuration,
    difficultyLevel: 'Custom',
  };
}

// Mock roadmap generator
function generateMockRoadmap(input: GenerateRoadmapInput): string {
  const { careerPath, experienceLevel, timeline } = input;
  
  const roadmapTemplates: Record<string, any> = {
    "Full Stack Developer": `# Career Roadmap: ${careerPath}

## Phase 1: Foundation (Weeks 1-4)
### Skills to Acquire:
- HTML5 & Semantic Markup: Structure web content properly and accessibly
- CSS3 & Responsive Design: Style and layout for all device sizes
- JavaScript Fundamentals: Variables, functions, loops, and DOM manipulation
- Git & Version Control: Track changes and collaborate effectively

### Milestones:
- Build a personal portfolio website
- Complete 5 coding challenges on FreeCodeCamp
- Set up GitHub profile with your first repositories

## Phase 2: Frontend Mastery (Weeks 5-8)
### Skills to Acquire:
- React.js: Component-based UI development and state management
- Modern CSS: Flexbox, Grid, and CSS-in-JS solutions
- API Integration: Fetch data and handle async operations
- Build Tools: Understanding Webpack, Vite, and bundlers

### Milestones:
- Create 3 React projects with different complexity levels
- Integrate with REST APIs and display dynamic data
- Deploy projects to Netlify or Vercel

## Phase 3: Backend Development (Weeks 9-12)
### Skills to Acquire:
- Node.js & Express: Server-side JavaScript development
- Database Design: SQL and NoSQL database fundamentals
- Authentication: User management and security best practices
- RESTful APIs: Design and implement backend services

### Milestones:
- Build a full-stack application with user authentication
- Design and implement a database schema
- Create comprehensive API documentation`,

    "Data Scientist": `# Career Roadmap: ${careerPath}

## Phase 1: Mathematical Foundation (Weeks 1-6)
### Skills to Acquire:
- Statistics & Probability: Descriptive and inferential statistics fundamentals
- Linear Algebra: Vectors, matrices, and eigenvalues for ML algorithms
- Python Programming: Data structures, functions, and object-oriented concepts
- Data Manipulation: Pandas, NumPy for data cleaning and analysis

### Milestones:
- Complete statistics course with practical exercises
- Build 3 Python projects demonstrating core concepts
- Analyze a real dataset using Pandas and NumPy

## Phase 2: Data Analysis & Visualization (Weeks 7-10)
### Skills to Acquire:
- Data Visualization: Matplotlib, Seaborn, Plotly for insights
- SQL for Data: Query databases and join multiple data sources
- Exploratory Data Analysis: Pattern recognition and hypothesis testing
- Statistical Modeling: Regression, classification, and model evaluation

### Milestones:
- Create an interactive dashboard with Plotly
- Complete end-to-end data analysis project
- Build predictive model with >80% accuracy

## Phase 3: Machine Learning (Weeks 11-16)
### Skills to Acquire:
- Scikit-learn: Implement ML algorithms and pipelines
- Deep Learning: Neural networks with TensorFlow or PyTorch
- Model Deployment: MLOps and production considerations
- Big Data Tools: Introduction to Spark and cloud platforms

### Milestones:
- Deploy a machine learning model to production
- Complete Kaggle competition with top 25% finish
- Build portfolio showcasing 5 diverse ML projects`
  };

  return roadmapTemplates[careerPath] || `# Career Roadmap: ${careerPath}

## Phase 1: Getting Started (Weeks 1-4)
### Skills to Acquire:
- Industry Research: Understand the ${careerPath} landscape and requirements
- Foundation Skills: Core technologies and tools used in this field
- Learning Resources: Identify the best educational materials and platforms
- Community Engagement: Connect with professionals in your target field

### Milestones:
- Complete comprehensive research on ${careerPath} requirements
- Set up development environment with necessary tools
- Join relevant online communities and forums
- Create a learning schedule based on your ${timeline} timeline`;
}

// Mock learning resources generator
function generateMockLearningResources(topic: string): GetLearningResourceOutput {
  const topicLower = topic.toLowerCase();
  
  return {
    topicOverview: `${topic} is a crucial skill in modern software development that enables developers to build robust, scalable applications. This technology has gained significant traction in the industry due to its versatility, performance, and extensive ecosystem.\n\nLearning ${topic} will equip you with the knowledge to tackle complex problems, improve your development workflow, and make you more valuable in the job market. Whether you're building web applications, mobile apps, or enterprise solutions, mastering ${topic} will significantly boost your technical capabilities.\n\nThis topic builds upon fundamental programming concepts and introduces advanced patterns that are widely used in professional development environments.`,
    
    learningPath: `Start with the fundamentals: Begin by understanding the core concepts and basic syntax. Practice with simple examples and gradually increase complexity.\n\nNext, dive into practical applications: Build small projects to reinforce your learning and gain hands-on experience.\n\nThen, explore advanced features: Once comfortable with basics, study advanced patterns, best practices, and real-world use cases.\n\nFinally, practice with projects: Create portfolio projects that demonstrate your mastery and can be showcased to potential employers.`,
    
    freeResources: [
      {
        type: "Official Documentation",
        title: `${topic} Official Documentation`,
        url: `https://www.google.com/search?q=${encodeURIComponent(topic)}+official+documentation`,
        description: `Comprehensive official guide covering all aspects of ${topic}`,
        difficulty: "Beginner to Advanced",
        estimatedTime: "Ongoing reference",
        price: "Free"
      },
      {
        type: "Video Tutorial",
        title: `${topic} Crash Course - YouTube`,
        url: `https://www.google.com/search?q=${encodeURIComponent(topic)}+crash+course+youtube`,
        description: `Popular video tutorial series covering ${topic} from basics to advanced`,
        difficulty: "Beginner",
        estimatedTime: "4-6 hours",
        price: "Free"
      },
      {
        type: "Interactive Course",
        title: `Learn ${topic} - freeCodeCamp`,
        url: `https://www.freecodecamp.org/learn`,
        description: `Hands-on interactive lessons with coding challenges`,
        difficulty: "Beginner to Intermediate",
        estimatedTime: "20-30 hours",
        price: "Free"
      },
      {
        type: "Article Series",
        title: `${topic} Tutorial Series - Medium`,
        url: `https://medium.com/search?q=${encodeURIComponent(topic)}+tutorial`,
        description: `In-depth articles and tutorials from experienced developers`,
        difficulty: "Intermediate",
        estimatedTime: "5-10 hours",
        price: "Free"
      }
    ],
    
    premiumResources: [
      {
        type: "Course",
        title: `Complete ${topic} Bootcamp - Udemy`,
        url: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(topic)}`,
        description: `Comprehensive course with projects and lifetime access`,
        difficulty: "Beginner to Advanced",
        estimatedTime: "30-50 hours",
        price: "$49-89"
      },
      {
        type: "Specialization",
        title: `${topic} Professional Certificate - Coursera`,
        url: `https://www.coursera.org/search?query=${encodeURIComponent(topic)}`,
        description: `University-level course with professional certificate`,
        difficulty: "Intermediate to Advanced",
        estimatedTime: "3-6 months",
        price: "$39-79/month"
      },
      {
        type: "Course",
        title: `Mastering ${topic} - Pluralsight`,
        url: `https://www.pluralsight.com/search?q=${encodeURIComponent(topic)}`,
        description: `Professional development courses with skill assessments`,
        difficulty: "Intermediate",
        estimatedTime: "15-25 hours",
        price: "$29/month"
      }
    ],
    
    practiceProjects: [
      `Build a simple ${topic} application with basic functionality`,
      `Create a more complex project integrating ${topic} with databases`,
      `Develop a portfolio-worthy application showcasing advanced ${topic} features`,
      `Contribute to an open-source project using ${topic}`,
      `Build a full-scale application and deploy it to production`
    ],
    
    certifications: [
      {
        type: "Certification",
        title: `${topic} Developer Certification`,
        url: `https://www.google.com/search?q=${encodeURIComponent(topic)}+developer+certification`,
        description: `Industry-recognized certification validating your ${topic} skills`,
        difficulty: "Intermediate",
        estimatedTime: "2-3 months prep",
        price: "$150-300"
      }
    ],
    
    communityResources: [
      {
        type: "Community",
        title: `${topic} Reddit Community`,
        url: `https://www.reddit.com/search/?q=${encodeURIComponent(topic)}`,
        description: `Active community for discussions, questions, and sharing projects`,
        difficulty: "All Levels",
        estimatedTime: "Ongoing",
        price: "Free"
      },
      {
        type: "Forum",
        title: `${topic} Stack Overflow`,
        url: `https://stackoverflow.com/questions/tagged/${encodeURIComponent(topic.replace(/\s+/g, '-').toLowerCase())}`,
        description: `Technical Q&A platform for specific coding questions`,
        difficulty: "All Levels",
        estimatedTime: "Ongoing",
        price: "Free"
      },
      {
        type: "Community",
        title: `${topic} Discord Server`,
        url: `https://www.google.com/search?q=${encodeURIComponent(topic)}+discord+community`,
        description: `Real-time chat and support from other learners and experts`,
        difficulty: "All Levels",
        estimatedTime: "Ongoing",
        price: "Free"
      }
    ]
  };
}


function analyzeSyllabusAndCreatePlan(input: any): string {
  const topics = extractTopicsFromSyllabus(input.syllabusContent);
  const prioritizedTopics = prioritizeTopics(topics, input.priorityFocus);
  const hasDeadline = input.examDate && new Date(input.examDate) > new Date();
  const deadlineText = hasDeadline ? `\n**⏰ Deadline: ${new Date(input.examDate!).toLocaleDateString()}**` : '';
  const progressNote = input.currentProgress ? `\n**📍 Starting Point: ${input.currentProgress}**` : '';
  
  return `# 📚 Smart Study Plan: Optimized Learning Schedule\n\n## 🎯 Plan Overview\n**Duration:** ${input.totalDuration}\n**Study Time:** ${input.studyHoursPerWeek} hours/week\n**Focus:** ${input.priorityFocus || 'Balanced approach'}${deadlineText}${progressNote}\n\n## 📊 AI Analysis\n✅ **${prioritizedTopics.length} Topics Identified**\n🔥 **${prioritizedTopics.filter(t => t.priority === 'High').length} High Priority**\n⚡ **${Math.round((input.studyHoursPerWeek * getDurationInWeeks(input.totalDuration)) / prioritizedTopics.length)} hrs/topic**\n\n${generatePhasedStudyPlan(prioritizedTopics, input.totalDuration)}`;
}

function extractTopicsFromSyllabus(content: string) {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const topics: any[] = [];
  
  lines.forEach((line) => {
    const cleanLine = line.trim().replace(/^[-*\d\.\)\s]+/, '');
    if (cleanLine.length > 3) {
      topics.push({
        topic: cleanLine,
        priority: determinePriority(cleanLine),
        estimatedHours: estimateTopicHours(cleanLine)
      });
    }
  });
  
  return topics.length > 0 ? topics : [
    { topic: 'Foundation Concepts', priority: 'High', estimatedHours: 8 },
    { topic: 'Core Development', priority: 'High', estimatedHours: 12 },
    { topic: 'Practical Applications', priority: 'Medium', estimatedHours: 10 },
    { topic: 'Advanced Topics', priority: 'Low', estimatedHours: 8 }
  ];
}

function determinePriority(topic: string): 'High' | 'Medium' | 'Low' {
  const high = ['fundamental', 'basic', 'intro', 'foundation', 'core', 'essential', 'important'];
  const low = ['advanced', 'optional', 'extra', 'bonus', 'review', 'recap'];
  const topicLower = topic.toLowerCase();
  if (high.some(k => topicLower.includes(k))) return 'High';
  if (low.some(k => topicLower.includes(k))) return 'Low';
  return 'Medium';
}

function estimateTopicHours(topic: string): number {
  const topicLower = topic.toLowerCase();
  if (topicLower.includes('project')) return 12;
  if (topicLower.includes('advanced')) return 10;
  if (topicLower.includes('basic')) return 6;
  return 8;
}

function prioritizeTopics(topics: any[], focusArea?: string) {
  return topics.sort((a, b) => {
    const order = { 'High': 3, 'Medium': 2, 'Low': 1 };
    return order[b.priority] - order[a.priority];
  });
}

function generatePhasedStudyPlan(topics: any[], duration: string): string {
  const weeks = getDurationInWeeks(duration);
  const phases = Math.min(Math.ceil(weeks / 4), 4);
  
  let plan = '';
  let currentWeek = 1;
  
  for (let i = 0; i < phases; i++) {
    const phaseTopics = topics.slice(i * Math.ceil(topics.length / phases), (i + 1) * Math.ceil(topics.length / phases));
    const endWeek = currentWeek + Math.ceil(weeks / phases) - 1;
    
    plan += `\n## 📅 Phase ${i + 1}: ${getPhaseTitle(i)} (Weeks ${currentWeek}-${endWeek})\n\n### 🎯 Topics:\n`;
    
    phaseTopics.forEach(topic => {
      const emoji = topic.priority === 'High' ? '🔥' : topic.priority === 'Medium' ? '⚡' : '📝';
      plan += `- ${emoji} ${topic.topic} (${topic.estimatedHours}h - ${topic.priority} Priority)\n`;
    });
    
    plan += `\n### ✅ Milestones:\n`;
    phaseTopics.forEach(topic => {
      plan += `- Master ${topic.topic}\n`;
    });
    
    currentWeek = endWeek + 1;
  }
  
  return plan;
}

function getPhaseTitle(index: number): string {
  return ['Foundation', 'Development', 'Application', 'Mastery'][index] || `Phase ${index + 1}`;
}

function getDurationInWeeks(duration: string): number {
  const map = { '1 month': 4, '2 months': 8, '3 months': 12, '4 months': 16, '6 months': 24, '1 year': 52 };
  return map[duration] || 12;
}
