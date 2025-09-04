/**
 * @fileOverview An AI mentor that provides guidance and motivational suggestions.
 *
 * - getMentorGuidance - A function that generates personalized guidance based on user progress and learning goals.
 * - MentorGuidanceInput - The input type for the getMentorGuidance function.
 * - MentorGuidanceOutput - The return type for the getMentorGuidance function.
 */

import { ai } from '@/lib/ai/genkit';
import { z } from 'zod';

const MentorGuidanceInputSchema = z.object({
  userProgress: z
    .string()
    .describe('Description of the user\'s current progress in their roadmap.'),
  learningGoals: z
    .string()
    .describe('The user\'s learning goals and desired career path.'),
  challenges: z
    .string()
    .optional()
    .describe('Any specific challenges or obstacles the user is facing.'),
  recentActivity: z
    .string()
    .optional()
    .describe('Recent learning activities or achievements.'),
});

export type MentorGuidanceInput = z.infer<typeof MentorGuidanceInputSchema>;

const MentorGuidanceOutputSchema = z.object({
  guidance: z.string().describe('Personalized guidance and motivational suggestions from the AI mentor.'),
  nextSteps: z.string().describe('Specific actionable next steps for the user.'),
  motivation: z.string().describe('Motivational message to encourage continued learning.'),
});

export type MentorGuidanceOutput = z.infer<typeof MentorGuidanceOutputSchema>;

export async function getMentorGuidance(input: MentorGuidanceInput): Promise<MentorGuidanceOutput> {
  return mentorGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mentorGuidancePrompt',
  input: { schema: MentorGuidanceInputSchema },
  output: { schema: MentorGuidanceOutputSchema },
  prompt: `You are an expert AI mentor and career coach with years of experience guiding students and professionals in their learning journeys. You provide personalized guidance, encouragement, and practical advice.

Analyze the user's current situation and provide comprehensive guidance:

User's Current Progress: {{{userProgress}}}
Learning Goals: {{{learningGoals}}}
Challenges: {{{challenges}}}
Recent Activity: {{{recentActivity}}}

Provide:
1. **Guidance**: Thoughtful, personalized advice based on their progress and challenges. Be empathetic and understanding while providing actionable insights.
2. **Next Steps**: 3-5 specific, actionable steps they should take immediately to continue their progress.
3. **Motivation**: An encouraging message that acknowledges their progress and motivates them to continue.

Your tone should be:
- Supportive and encouraging
- Professional but friendly
- Practical and actionable
- Personalized to their situation
- Motivational without being overly enthusiastic

Focus on helping them overcome obstacles, stay motivated, and make steady progress toward their career goals.`,
});

const mentorGuidanceFlow = ai.defineFlow(
  {
    name: 'mentorGuidanceFlow',
    inputSchema: MentorGuidanceInputSchema,
    outputSchema: MentorGuidanceOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
