/**
 * @fileOverview Generates a personalized roadmap based on user input.
 *
 * - generateRoadmap - A function that generates the roadmap.
 * - GenerateRoadmapInput - The input type for the generateRoadmap function.
 * - GenerateRoadmapOutput - The return type for the generateRoadmap function.
 */

import { ai } from '@/lib/ai/genkit';
import { z } from 'zod';

const GenerateRoadmapInputSchema = z.object({
  careerPath: z.string().describe('The desired career path of the user.'),
  currentSkills: z.string().describe('The current skills of the user.'),
  goals: z.string().describe('The goals of the user.'),
  experienceLevel: z.string().describe('The experience level of the user (beginner, intermediate, advanced).'),
  timeline: z.string().describe('The desired timeline for achieving the career goals.'),
});

export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;

const GenerateRoadmapOutputSchema = z.object({
  roadmap: z.string().describe('The generated roadmap with skill recommendations in markdown format.'),
  estimatedDuration: z.string().describe('The estimated duration to complete the roadmap.'),
  difficultyLevel: z.string().describe('The overall difficulty level of the roadmap.'),
});

export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRoadmapPrompt',
  input: { schema: GenerateRoadmapInputSchema },
  output: { schema: GenerateRoadmapOutputSchema },
  prompt: `You are an expert career coach and technology educator specializing in creating comprehensive, actionable learning roadmaps.

Based on the user's input, create a detailed, structured roadmap that breaks down their learning journey into clear phases and actionable steps.

User Input:
- Desired Career Path: {{{careerPath}}}
- Current Skills: {{{currentSkills}}}
- Goals: {{{goals}}}
- Experience Level: {{{experienceLevel}}}
- Timeline: {{{timeline}}}

Generate a roadmap that:
1. Uses clear markdown formatting with headers (# ## ###)
2. Breaks learning into logical phases (Phase 1, Phase 2, etc.)
3. Each phase should have specific skills and milestones
4. Includes realistic time estimates for each section
5. Provides context on why each skill is important
6. Suggests practical projects to apply the knowledge
7. Considers the user's current skill level and timeline

Format the roadmap in markdown with this structure:
# Career Roadmap: [Career Path]

## Phase 1: [Foundation/Title] (Weeks 1-X)
### Skills to Acquire:
- Skill 1: Description and importance
- Skill 2: Description and importance

### Milestones:
- Project 1: Brief description
- Project 2: Brief description

## Phase 2: [Intermediate/Title] (Weeks X-Y)
[Continue pattern...]

Make it engaging, practical, and tailored to their specific situation.`,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
