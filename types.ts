export type HabitType = 'boolean' | 'count' | 'duration';

export interface Habit {
  id: string;
  name: string;
  icon: string; // Emoji character
  type: HabitType;
  goal: number; // 1 for boolean, N for others
  unit: string; // 'times', 'mins', 'pages', etc.
  color: string; // Tailwind color class prefix e.g. 'bg-blue-500'
}

export interface Log {
  habitId: string;
  date: string; // ISO Date String YYYY-MM-DD
  value: number;
}

export type ViewState = 'dashboard' | 'checkin' | 'analytics' | 'settings';

export interface DailyProgress {
  date: string;
  percentage: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (habits: Habit[], logs: Log[]) => boolean;
}

export const PRESET_HABITS: Habit[] = [
  { id: '1', name: 'Swimming', icon: '🏊', type: 'duration', goal: 45, unit: 'mins', color: 'blue' },
  { id: '2', name: 'Reading', icon: '📚', type: 'count', goal: 20, unit: 'pages', color: 'yellow' },
  { id: '3', name: 'Water', icon: '💧', type: 'count', goal: 8, unit: 'cups', color: 'cyan' },
  { id: '4', name: 'Sleep', icon: '😴', type: 'duration', goal: 8, unit: 'hours', color: 'indigo' },
  { id: '5', name: 'Running', icon: '🏃', type: 'duration', goal: 30, unit: 'mins', color: 'red' },
];