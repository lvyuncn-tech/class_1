import React from 'react';
import { Habit, Log } from '../types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  habits: Habit[];
  todayLogs: Log[];
}

const Dashboard: React.FC<DashboardProps> = ({ habits, todayLogs }) => {
  const todayStr = format(new Date(), 'M月d日 EEEE', { locale: zhCN });
  
  // Calculate today's overall completion percentage
  const totalGoals = habits.length;
  let completedGoals = 0;

  habits.forEach(habit => {
    const log = todayLogs.find(l => l.habitId === habit.id);
    const value = log ? log.value : 0;
    if (value >= habit.goal) {
      completedGoals += 1;
    } else if (value > 0 && habit.type !== 'boolean') {
        // Partial credit for dashboard visualization
        completedGoals += Math.min(value / habit.goal, 1);
    }
  });

  const percentage = totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

  const data = [
    { name: 'Completed', value: completedGoals },
    { name: 'Remaining', value: totalGoals - completedGoals },
  ];

  const COLORS = ['#93C5FD', '#F1F5F9'];

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">你好, 追梦人! 👋</h1>
        <p className="text-slate-500 mt-1">{todayStr}</p>
      </header>

      {/* Progress Card */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-6 shadow-sm border border-blue-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">今日进度</h2>
          <p className="text-slate-500 text-sm mt-1">
            {percentage === 100 ? "太棒了，全部完成! 🎉" : "继续加油，保持节奏!"}
          </p>
          <div className="mt-4 text-4xl font-bold text-primary-dark">
            {percentage}%
          </div>
        </div>
        <div className="h-24 w-24">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={40}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Glance List */}
      <div className="space-y-3">
        <h3 className="text-slate-700 font-bold text-sm uppercase tracking-wider">今日目标</h3>
        {habits.map(habit => {
           const log = todayLogs.find(l => l.habitId === habit.id);
           const currentVal = log ? log.value : 0;
           const isDone = currentVal >= habit.goal;
           const progressPercent = Math.min((currentVal / habit.goal) * 100, 100);

           return (
             <div key={habit.id} className="bg-white p-4 rounded-2xl flex items-center shadow-sm border border-slate-50">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl ${isDone ? 'bg-green-100' : 'bg-slate-50'}`}>
                  {habit.icon}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-700">{habit.name}</span>
                    <span className="text-xs font-semibold text-slate-400">
                      {currentVal} / {habit.goal} {habit.unit}
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-green-400' : 'bg-primary'}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
             </div>
           );
        })}
        {habits.length === 0 && (
          <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400">还没有添加任何计划哦</p>
            <p className="text-xs text-slate-300 mt-1">去"计划管理"添加你的第一个Flag吧!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
