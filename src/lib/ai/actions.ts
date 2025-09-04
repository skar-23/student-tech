/**
 * @fileOverview Client-side actions for AI integration
 * These functions provide a bridge between React components and AI flows
 */

import { 
  generateRoadmap, 
  GenerateRoadmapInput, 
  GenerateRoadmapOutput,
  generateSyllabusBasedRoadmap,
  getMentorGuidance,
  MentorGuidanceInput,
  MentorGuidanceOutput,
  getLearningResource,
  GetLearningResourceInput,
  GetLearningResourceOutput
} from './browser-ai';

export async function generateRoadmapAction(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  try {
    return await generateRoadmap(input);
  } catch (error) {
    console.error('Error generating roadmap:', error);
    throw new Error('Failed to generate roadmap. Please try again.');
  }
}

// Enhanced function to handle both career and syllabus-based roadmap generation
export async function generateCustomRoadmapAction(input: {
  type: 'career' | 'syllabus';
  data: any;
}): Promise<GenerateRoadmapOutput> {
  try {
    if (input.type === 'career') {
      return await generateRoadmap(input.data);
    } else {
      return await generateSyllabusBasedRoadmap(input.data);
    }
  } catch (error) {
    console.error('Error generating custom roadmap:', error);
    throw new Error('Failed to generate roadmap. Please try again.');
  }
}

export async function getMentorGuidanceAction(input: MentorGuidanceInput): Promise<MentorGuidanceOutput> {
  try {
    return await getMentorGuidance(input);
  } catch (error) {
    console.error('Error getting mentor guidance:', error);
    throw new Error('Failed to get mentor guidance. Please try again.');
  }
}

export async function getLearningResourceAction(input: GetLearningResourceInput): Promise<GetLearningResourceOutput> {
  try {
    return await getLearningResource(input);
  } catch (error) {
    console.error('Error getting learning resources:', error);
    throw new Error('Failed to get learning resources. Please try again.');
  }
}

// Helper function to parse roadmap text into structured data
export function parseRoadmapText(text: string) {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const structure: any = {
    phases: [],
    currentPhase: null,
    currentSection: null
  };

  let currentPhase: any = null;
  let currentSection: any = null;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Main title (# Career Roadmap: ...)
    if (/^#\s/.test(trimmedLine) && !structure.title) {
      structure.title = trimmedLine.replace(/^#\s*/, '');
    }
    // Phase headers (## Phase 1: ...)
    else if (/^##\s/.test(trimmedLine)) {
      currentPhase = {
        id: `phase-${structure.phases.length + 1}`,
        title: trimmedLine.replace(/^##\s*/, ''),
        sections: [],
        skills: [],
        milestones: [],
        projects: []
      };
      structure.phases.push(currentPhase);
      currentSection = null;
    }
    // Section headers (### Skills to Acquire:, ### Milestones:, etc.)
    else if (/^###\s/.test(trimmedLine)) {
      const sectionTitle = trimmedLine.replace(/^###\s*/, '').toLowerCase();
      currentSection = sectionTitle;
    }
    // List items (- Item name: description)
    else if (/^[-*]\s/.test(trimmedLine) && currentPhase && currentSection) {
      const itemText = trimmedLine.replace(/^[-*]\s*/, '');
      const item = {
        id: `item-${index}`,
        text: itemText,
        completed: false
      };
      
      if (currentSection.includes('skill')) {
        currentPhase.skills.push(item);
      } else if (currentSection.includes('milestone') || currentSection.includes('project')) {
        currentPhase.milestones.push(item);
      } else {
        // Default to skills if section type is unclear
        currentPhase.skills.push(item);
      }
    }
  });

  return structure;
}

// Helper function to calculate roadmap progress
export function calculateRoadmapProgress(roadmapStructure: any, completedItems: string[] = []): number {
  let totalItems = 0;
  let completedCount = 0;

  roadmapStructure.phases?.forEach((phase: any) => {
    if (phase.skills) {
      totalItems += phase.skills.length;
      completedCount += phase.skills.filter((skill: any) => completedItems.includes(skill.id)).length;
    }
    if (phase.milestones) {
      totalItems += phase.milestones.length;
      completedCount += phase.milestones.filter((milestone: any) => completedItems.includes(milestone.id)).length;
    }
  });

  return totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
}
