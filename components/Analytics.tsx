import React, { useState, useMemo } from 'react';
import { Habit, Log, Badge } from '../types';
import { generateWeeklyInsight } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';
import { 
  startOfWeek, endOfWeek, startOfMonth, endOfMonth, 
  eachDayOfInterval, format, subDays, isSameDay, parseISO 
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Sparkles, Loader2, AlertCircle, Medal, TrendingUp, Clock, CalendarDays, Trophy } from 'lucide-react';

interface AnalyticsProps {
  habits: Habit[];
  logs: Log[];
}

const Analytics: React.FC<AnalyticsProps> = ({ habits, logs }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  // --- 1. Badge System Logic ---
  const badges: Badge[] = [
    {
      id: 'streak_3',
      name: '起步之星',
      description: '任意习惯连续打卡3天',
      icon: '🌱',
      condition: (habits, logs) => {
        const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
        for (const habit of habits) {
          const hLogs = sortedLogs.filter(l => l.habitId === habit.id && l.value >= habit.goal);
          let streak = 0;
          for (let i = 0; i < hLogs.length - 1; i++) {
             const curr = parseISO(hLogs[i].date);
             const next = parseISO(hLogs[i+1].date);
             const diff = (next.getTime() - curr.getTime()) / (1000 * 3600 * 24);
             if (Math.round(diff) === 1) {
               streak++;
               if (streak >= 2) return true; // 2 intervals = 3 days
             } else {
               streak = 0;
             }
          }
        }
        return false;
      }
    },
    {
      id: 'streak_7',
      name: '习惯大师',
      description: '任意习惯连续打卡7天',
      icon: '🔥',
      condition: (habits, logs) => {
        const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
        for (const habit of habits) {
          const hLogs = sortedLogs.filter(l => l.habitId === habit.id && l.value >= habit.goal);
          let streak = 0;
          for (let i = 0; i < hLogs.length - 1; i++) {
             const diff = (parseISO(hLogs[i+1].date).getTime() - parseISO(hLogs[i].date).getTime()) / (1000 * 3600 * 24);
             if (Math.round(diff) === 1) {
               streak++;
               if (streak >= 6) return true; 
             } else {
               streak = 0;
             }
          }
        }
        return false;
      }
    },
    {
      id: 'volume_duration',
      name: '运动健将',
      description: '累计时长超过120分钟',
      icon: '🏃',
      condition: (habits, logs) => {
        const durationHabitIds = habits.filter(h => h.type === 'duration').map(h => h.id);
        const totalDuration = logs
          .filter(l => durationHabitIds.includes(l.habitId))
          .reduce((acc, curr) => acc + curr.value, 0);
        return totalDuration >= 120;
      }
    },
    {
      id: 'volume_count',
      name: '博览群书',
      description: '累计计数任务超过50次',
      icon: '📚',
      condition: (habits, logs) => {
        const countHabitIds = habits.filter(h => h.type === 'count').map(h => h.id);
        const totalCount = logs
          .filter(l => countHabitIds.includes(l.habitId))
          .reduce((acc, curr) => acc + curr.value, 0);
        return totalCount >= 50;
      }
    }
  ];

  const unlockedBadges = useMemo(() => {
    return badges.map(badge => ({
      ...badge,
      unlocked: badge.condition(habits, logs)
    }));
  }, [habits, logs]);


  // --- 2. Chart Data Preparation ---
  const today = new Date();
  const dateInterval = timeRange === 'week' 
    ? { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfWeek(today, { weekStartsOn: 1 }) }
    : { start: startOfMonth(today), end: endOfMonth(today) };

  const daysInInterval = eachDayOfInterval(dateInterval);

  // Line Chart: Completion Rate Trend
  const trendData = daysInInterval.map(date => {
    const dayStr = format(date, 'yyyy-MM-dd');
    let completedGoals = 0;
    
    habits.forEach(h => {
      const log = logs.find(l => l.habitId === h.id && l.date === dayStr);
      if (log && log.value >= h.goal) completedGoals++;
    });

    const rate = habits.length > 0 ? Math.round((completedGoals / habits.length) * 100) : 0;

    return {
      date: timeRange === 'week' ? format(date, 'EEE', { locale: zhCN }) : format(date, 'd日'),
      rate: rate,
      fullDate: dayStr
    };
  });

  // Bar Chart: Duration Distribution (Sum of minutes for duration habits in interval)
  const durationData = habits
    .filter(h => h.type === 'duration')
    .map(h => {
      const totalMinutes = logs
        .filter(l => l.habitId === h.id && l.date >= format(dateInterval.start, 'yyyy-MM-dd') && l.date <= format(dateInterval.end, 'yyyy-MM-dd'))
        .reduce((acc, curr) => acc + curr.value, 0);
      
      return {
        name: h.name,
        minutes: totalMinutes,
        color: h.color
      };
    })
    .filter(d => d.minutes > 0);


  const handleGenerateInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateWeeklyInsight(
        habits, 
        logs.filter(l => l.date >= format(dateInterval.start, 'yyyy-MM-dd')), 
        `${format(dateInterval.start, 'yyyy-MM-dd')} to ${format(dateInterval.end, 'yyyy-MM-dd')}`
      );
      setInsight(result);
    } catch (err) {
      setError("AI 连接失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-24 animate-fade-in">
       <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">数据复盘</h1>
          <p className="text-slate-500 text-sm">见证每一天的进步</p>
        </div>
        
        {/* Time Range Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === 'week' ? 'bg-white text-primary-dark shadow-sm' : 'text-slate-500'}`}
          >
            本周
          </button>
          <button 
             onClick={() => setTimeRange('month')}
             className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === 'month' ? 'bg-white text-primary-dark shadow-sm' : 'text-slate-500'}`}
          >
            本月
          </button>
        </div>
      </header>

      {/* 1. Achievements Wall */}
      <section>
        <div className="flex items-center space-x-2 mb-3">
          <Trophy className="text-accent" size={20} />
          <h2 className="font-bold text-slate-800">成就墙</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {unlockedBadges.map((badge) => (
            <div 
              key={badge.id} 
              className={`p-3 rounded-2xl border flex items-center space-x-3 transition-all ${
                badge.unlocked 
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-sm' 
                  : 'bg-slate-50 border-slate-100 opacity-60 grayscale'
              }`}
            >
              <div className="text-3xl filter drop-shadow-sm">{badge.icon}</div>
              <div>
                <h3 className={`font-bold text-sm ${badge.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                  {badge.name}
                </h3>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Completion Trend Chart */}
      <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-primary-dark" size={18} />
            <h3 className="font-bold text-slate-700">完成率趋势</h3>
          </div>
          <span className="text-xs text-slate-400">平均: {trendData.length > 0 ? Math.round(trendData.reduce((a,b)=>a+b.rate,0)/trendData.length) : 0}%</span>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{top: 5, right: 10, left: -20, bottom: 0}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94a3b8'}} 
                dy={10} 
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                itemStyle={{color: '#60A5FA', fontWeight: 'bold'}}
                labelStyle={{color: '#64748b', fontSize: '12px', marginBottom: '4px'}}
                formatter={(value: number) => [`${value}%`, '完成率']}
              />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#93C5FD" 
                strokeWidth={3} 
                dot={{r: 4, fill: '#60A5FA', strokeWidth: 2, stroke: '#fff'}}
                activeDot={{r: 6, fill: '#2563EB'}} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3. Duration Distribution Chart */}
      {durationData.length > 0 && (
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="text-secondary" size={18} />
            <h3 className="font-bold text-slate-700">时长投入分布 ({timeRange === 'week' ? '本周' : '本月'})</h3>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={durationData} layout="vertical" margin={{left: 0, right: 10}}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={70} 
                  tickLine={false} 
                  axisLine={false}
                  tick={{fontSize: 11, fill: '#64748b'}} 
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  formatter={(value: number) => [`${value} 分钟`, '时长']}
                />
                <Bar dataKey="minutes" radius={[0, 6, 6, 0]} barSize={20}>
                  {durationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#F9A8D4" opacity={0.6 + (index * 0.1)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* 4. AI Insight Section */}
      <section className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="text-yellow-200" />
          <h2 className="text-lg font-bold">AI 智能教练</h2>
        </div>

        {!insight && !loading && (
          <div className="text-center py-4">
            <p className="text-blue-50 mb-4 text-sm">生成本阶段的个性化分析报告。</p>
            <button 
              onClick={handleGenerateInsight}
              className="bg-white text-primary-dark px-6 py-3 rounded-full font-bold text-sm shadow-md hover:bg-blue-50 transition-colors w-full"
            >
              开始分析我的表现
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="animate-spin text-white mb-3" size={32} />
            <p className="text-blue-50 text-sm">AI 正在思考中...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 p-4 rounded-xl flex items-center space-x-3 border border-red-500/30">
            <AlertCircle className="text-red-200" size={20} />
            <p className="text-red-100 text-sm">{error}</p>
          </div>
        )}

        {insight && (
          <div className="prose prose-invert prose-sm max-w-none max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 pr-2">
            <ReactMarkdown>{insight}</ReactMarkdown>
            <button 
              onClick={handleGenerateInsight} 
              className="mt-4 text-xs text-blue-100 hover:text-white underline"
            >
              刷新报告
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Analytics;