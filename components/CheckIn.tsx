import React from 'react';
import { Habit, Log } from '../types';
import { Check, Plus, Minus } from 'lucide-react';

interface CheckInProps {
  habits: Habit[];
  todayLogs: Log[];
  onUpdateLog: (habitId: string, newValue: number) => void;
}

const CheckIn: React.FC<CheckInProps> = ({ habits, todayLogs, onUpdateLog }) => {
  return (
    <div className="space-y-6 pb-20 animate-fade-in">
       <header className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">每日打卡</h1>
        <p className="text-slate-500">记录今天的每一个小成就。</p>
      </header>

      <div className="space-y-4">
        {habits.map(habit => {
          const log = todayLogs.find(l => l.habitId === habit.id);
          const value = log ? log.value : 0;
          const isCompleted = value >= habit.goal;

          return (
            <div key={habit.id} className={`p-5 rounded-3xl transition-all duration-300 ${isCompleted ? 'bg-green-50 border-green-100 border shadow-sm' : 'bg-white border border-slate-100 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{habit.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{habit.name}</h3>
                    <p className="text-xs text-slate-500">目标: {habit.goal} {habit.unit}</p>
                  </div>
                </div>
                {isCompleted && (
                  <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
                    完成 <Check size={12} className="ml-1"/>
                  </span>
                )}
              </div>

              {/* Controls based on Type */}
              <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-2 border border-slate-100">
                
                {habit.type === 'boolean' ? (
                   <button 
                    onClick={() => onUpdateLog(habit.id, value === 0 ? 1 : 0)}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${value >= 1 ? 'bg-red-50 text-red-400 hover:bg-red-100' : 'bg-primary-dark text-white shadow-md hover:bg-blue-500'}`}
                   >
                     {value >= 1 ? '撤销打卡' : '完成打卡'}
                   </button>
                ) : (
                  <>
                     <button 
                      onClick={() => onUpdateLog(habit.id, Math.max(0, value - (habit.type === 'duration' ? 5 : 1)))}
                      className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm text-slate-600 hover:bg-slate-100 active:scale-95 transition-all border border-slate-200"
                    >
                      <Minus size={20} />
                    </button>

                    <div className="flex flex-col items-center min-w-[80px]">
                      <span className="text-xl font-bold text-slate-800">{value}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{habit.unit}</span>
                    </div>

                    <button 
                      onClick={() => onUpdateLog(habit.id, value + (habit.type === 'duration' ? 5 : 1))}
                      className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-xl shadow-md hover:bg-primary-dark active:scale-95 transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {habits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">列表空空如也</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckIn;