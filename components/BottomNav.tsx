import React from 'react';
import { Home, CheckCircle2, BarChart2, Settings } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const navItems: { view: ViewState; label: string; icon: React.ReactNode }[] = [
    { view: 'dashboard', label: '今日概览', icon: <Home size={24} /> },
    { view: 'checkin', label: '打卡', icon: <CheckCircle2 size={24} /> },
    { view: 'analytics', label: '复盘分析', icon: <BarChart2 size={24} /> },
    { view: 'settings', label: '计划管理', icon: <Settings size={24} /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe px-6 py-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex flex-col items-center space-y-1 transition-colors duration-200 ${
              currentView === item.view ? 'text-primary-dark' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;