import React, { useState } from 'react';
import { Habit, HabitType } from '../types';
import { Trash2, Plus, X } from 'lucide-react';

interface HabitManagerProps {
  habits: Habit[];
  onAddHabit: (habit: Habit) => void;
  onDeleteHabit: (id: string) => void;
}

const HabitManager: React.FC<HabitManagerProps> = ({ habits, onAddHabit, onDeleteHabit }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newHabit, setNewHabit] = useState<Partial<Habit>>({
    name: '',
    icon: '🎯',
    type: 'count',
    goal: 1,
    unit: '次',
    color: 'blue'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.name) return;

    onAddHabit({
      id: Date.now().toString(),
      name: newHabit.name,
      icon: newHabit.icon || '🎯',
      type: newHabit.type as HabitType,
      goal: Number(newHabit.goal),
      unit: newHabit.unit || '次',
      color: newHabit.color || 'blue'
    });
    
    setIsAdding(false);
    setNewHabit({ name: '', icon: '🎯', type: 'count', goal: 1, unit: '次', color: 'blue' });
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
       <header className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">计划管理</h1>
           <p className="text-slate-500">编辑你的 Flag 列表</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary-dark text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-3xl shadow-md border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-800">新建习惯</h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">名称</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-primary-dark" 
              placeholder="例如: 冥想、喝水"
              value={newHabit.name}
              onChange={e => setNewHabit({...newHabit, name: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">图标 (Emoji)</label>
              <input 
                type="text" 
                className="w-full p-3 bg-slate-50 rounded-xl border-none text-center"
                value={newHabit.icon}
                onChange={e => setNewHabit({...newHabit, icon: e.target.value})}
                maxLength={2}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">类型</label>
              <select 
                className="w-full p-3 bg-slate-50 rounded-xl border-none"
                value={newHabit.type}
                onChange={e => {
                   const type = e.target.value as HabitType;
                   setNewHabit({
                       ...newHabit, 
                       type,
                       unit: type === 'duration' ? '分钟' : type === 'boolean' ? '完成' : '次',
                       goal: type === 'boolean' ? 1 : 10
                   })
                }}
              >
                <option value="count">计数 (如: 杯)</option>
                <option value="duration">时长 (如: 分钟)</option>
                <option value="boolean">是否完成 (Yes/No)</option>
              </select>
            </div>
          </div>

          {newHabit.type !== 'boolean' && (
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">目标值</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-slate-50 rounded-xl border-none"
                    value={newHabit.goal}
                    onChange={e => setNewHabit({...newHabit, goal: Number(e.target.value)})}
                  />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">单位</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-50 rounded-xl border-none"
                    value={newHabit.unit}
                    onChange={e => setNewHabit({...newHabit, unit: e.target.value})}
                  />
               </div>
             </div>
          )}

          <button type="submit" className="w-full bg-primary-dark text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors">
            创建 Flag
          </button>
        </form>
      )}

      <div className="space-y-3">
        {habits.map(habit => (
          <div key={habit.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">{habit.icon}</span>
              <div>
                <h3 className="font-semibold text-slate-800">{habit.name}</h3>
                <p className="text-xs text-slate-400 capitalize">
                   目标: {habit.goal} {habit.unit}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onDeleteHabit(habit.id)}
              className="text-slate-300 hover:text-red-500 p-2"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {habits.length === 0 && (
          <div className="text-center text-slate-400 py-10">
            暂无计划，快去添加一个吧!
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitManager;