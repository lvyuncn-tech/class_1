import { Habit, Log, PRESET_HABITS } from '../types';

const HABITS_KEY = 'flagtracker_habits';
const LOGS_KEY = 'flagtracker_logs';

export const getHabits = (): Habit[] => {
  const stored = localStorage.getItem(HABITS_KEY);
  if (!stored) return PRESET_HABITS;
  try {
    return JSON.parse(stored);
  } catch (e) {
    return PRESET_HABITS;
  }
};

export const saveHabits = (habits: Habit[]) => {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
};

export const getLogs = (): Log[] => {
  const stored = localStorage.getItem(LOGS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

export const saveLogs = (logs: Log[]) => {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};