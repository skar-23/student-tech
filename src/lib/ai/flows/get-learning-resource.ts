/**
 * @fileOverview Generates a detailed description and a list of resources for a learning topic.
 *
 * - getLearningResource - A function that generates the description and resources.
 * - GetLearningResourceInput - The input type for the getLearningResource function.
 * - GetLearningResourceOutput - The return type for the getLearningResource function.
 */

import { ai } from '@/lib/ai/genkit';
import { z } from 'zod';

const GetLearningResourceInputSchema = z.object({
  topic: z.string().describe('The learning topic to get a description for.'),
  userLevel: z.string().optional().describe('The user\'s experience level with this topic.'),
  learningStyle: z.string().optional().describe('The user\'s preferred learning style (visual, hands-on, reading, etc.).'),
});

export type GetLearningResourceInput = z.infer<typeof GetLearningResourceInputSchema>;

const ResourceSchema = z.object({
  type: z.string().describe('The type of the resource, e.g., "Official", "Video", "Course", "Interactive", "Article", "Certification".'),
  title: z.string().describe('The title of the resource.'),
  url: z.string().describe('The URL for the resource.'),
  description: z.string().describe('A brief description of what the resource covers.'),
  difficulty: z.string().describe('The difficulty level (Beginner, Intermediate, Advanced).'),
  estimatedTime: z.string().describe('Estimated time to complete (e.g., "2 hours", "1 week").'),
  price: z.string().optional().describe('Price information (e.g., "Free", "$49", "Free with subscription").'),
});

const GetLearningResourceOutputSchema = z.object({
  topicOverview: z.string().describe('A comprehensive overview of the learning topic.'),
  learningPath: z.string().describe('Suggested learning path and approach for this topic.'),
  freeResources: z.array(ResourceSchema).describe('A list of high-quality free learning resources.'),
  premiumResources: z.array(ResourceSchema).describe('A list of premium learning resources.'),
  practiceProjects: z.array(z.string()).describe('Suggested hands-on projects to practice the topic.'),
  certifications: z.array(ResourceSchema).describe('A list of relevant certifications.'),
  communityResources: z.array(ResourceSchema).describe('Community resources like forums, Discord servers, etc.'),
});

export type GetLearningResourceOutput = z.infer<typeof GetLearningResourceOutputSchema>;

export async function getLearningResource(input: GetLearningResourceInput): Promise<GetLearningResourceOutput> {
  return getLearningResourceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getLearningResourcePrompt',
  input: { schema: GetLearningResourceInputSchema },
  output: { schema: GetLearningResourceOutputSchema },
  prompt: `You are an expert educator and learning resource curator with deep knowledge of online educational platforms and learning methodologies.

Topic: "{{{topic}}}"
User Level: {{{userLevel}}}
Learning Style: {{{learningStyle}}}

Provide comprehensive learning resources and guidance:

1. **Topic Overview**: Write a detailed 2-3 paragraph overview explaining:
   - What this topic covers and why it's important
   - Key concepts and skills involved
   - How it fits into broader career development
   - Prerequisites or foundational knowledge needed

2. **Learning Path**: Suggest the optimal sequence for learning this topic, including:
   - Where to start
   - How to progress systematically
   - Common pitfalls to avoid
   - How to know when you've mastered it

3. **Free Resources** (5-7 high-quality options):
   - Official documentation and tutorials
   - YouTube channels and video series
   - Interactive platforms (freeCodeCamp, Codecademy free tier)
   - Open source books and guides
   - University courses (MIT OpenCourseWare, etc.)

4. **Premium Resources** (5-7 options):
   - Udemy, Coursera, Pluralsight courses
   - Specialized bootcamps
   - Premium interactive platforms
   - Professional training programs

5. **Practice Projects** (3-5 hands-on projects):
   - Beginner-friendly projects to start with
   - Intermediate projects to challenge skills
   - Portfolio-worthy advanced projects

6. **Certifications** (2-4 relevant certifications):
   - Industry-recognized certifications
   - Platform-specific certifications
   - Professional credentials

7. **Community Resources** (3-5 communities):
   - Reddit communities
   - Discord servers
   - Stack Overflow tags
   - Professional forums

For all resources, provide:
- Accurate, helpful descriptions
- Realistic difficulty levels
- Time estimates
- For URLs: Use well-known, stable platforms. If uncertain about exact URLs, use descriptive search queries like "https://www.google.com/search?q=learn+{topic}+{platform}"
- Price information when relevant

Make recommendations practical and current, focusing on resources that are actively maintained and widely recommended by the community.`,
});

const getLearningResourceFlow = ai.defineFlow(
  {
    name: 'getLearningResourceFlow',
    inputSchema: GetLearningResourceInputSchema,
    outputSchema: GetLearningResourceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
