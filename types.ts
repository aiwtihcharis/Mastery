export interface Task {
  id: string;
  goal: string;
  activity: string;
}

export interface Project {
  title: string;
  desc: string;
}

export interface Phase {
  id: number;
  title: string;
  subtitle: string;
  dates: string;
  focus: string;
  days: number;
  videoUrl: string;
  project: Project;
  tasks: Task[];
  progress?: number; // Calculated at runtime
}

export interface UserStats {
  completedCount: number;
  velocity: number;
  activePhaseId: number;
}

export type ViewType = 'dashboard' | 'roadmap' | 'metrics' | 'ai_coach' | 'progress' | 'settings';

export interface UserData {
  completedTasks: string[];
}