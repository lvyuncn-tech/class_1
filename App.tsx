import React, { useState, useEffect } from 'react';
import { ViewState, Habit, Log } from './types';
import { getHabits, saveHabits, getLogs, saveLogs } from './services/storageService';
import Dashboard from './components/Dashboard';
import CheckIn from './components/CheckIn';
import Analytics from './components/Analytics';
import HabitManager from './components/HabitManager';
import BottomNav from './components/BottomNav';
import { format } from 'date-fns';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);

  // Initial Load
  useEffect(() => {
    setHabits(getHabits());
    setLogs(getLogs());
  }, []);

  // Update Habit
  const handleAddHabit = (newHabit: Habit) => {
    const updated = [...habits, newHabit];
    setHabits(updated);
    saveHabits(updated);
  };

  const handleDeleteHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);
    saveHabits(updated);
  };

  // Update Logs
  const handleUpdateLog = (habitId: string, newValue: number) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingLogIndex = logs.findIndex(l => l.habitId === habitId && l.date === today);
    
    let newLogs = [...logs];
    
    if (existingLogIndex >= 0) {
      newLogs[existingLogIndex] = { ...newLogs[existingLogIndex], value: newValue };
    } else {
      newLogs.push({ habitId, date: today, value: newValue });
    }

    setLogs(newLogs);
    saveLogs(newLogs);
  };

  const getTodayLogs = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return logs.filter(l => l.date === today);
  };

  const renderView = () => {
    switch(view) {
      case 'dashboard':
        return <Dashboard habits={habits} todayLogs={getTodayLogs()} />;
      case 'checkin':
        return <CheckIn habits={habits} todayLogs={getTodayLogs()} onUpdateLog={handleUpdateLog} />;
      case 'analytics':
        return <Analytics habits={habits} logs={logs} />;
      case 'settings':
        return <HabitManager habits={habits} onAddHabit={handleAddHabit} onDeleteHabit={handleDeleteHabit} />;
      default:
        return <Dashboard habits={habits} todayLogs={getTodayLogs()} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100">
      <main className="max-w-md mx-auto min-h-screen bg-slate-50 relative">
        <div className="p-6">
           {renderView()}
        </div>
      </main>
      <BottomNav currentView={view} setView={setView} />
    </div>
  );
};

export default App;