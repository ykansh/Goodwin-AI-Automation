import { Users, Clock, Calendar, DollarSign, ArrowUpRight } from 'lucide-react';
import { useData } from '../../store/DataContext';

interface HrmsDashboardProps {
  onNavigate: (module: string) => void;
}

export function HrmsDashboard({ onNavigate }: HrmsDashboardProps) {
  const { hrmsEmployees, hrmsAttendance, hrmsLeaves, hrmsPayroll } = useData();

  const stats = [
    { 
      title: 'TOTAL EMPLOYEES', 
      value: hrmsEmployees.filter(e => e.status !== 'Inactive').length.toString(), 
      icon: Users, 
      module: 'employees', 
      trendText: '+2 new this month', 
      trendColor: 'text-[#00a631] dark:text-[#34c759]', 
      iconBg: 'bg-[#00a631]/10 dark:bg-[#173b22]', 
      iconColor: 'text-[#00a631] dark:text-[#34c759]' 
    },
    { 
      title: "TODAY'S ATTENDANCE", 
      value: hrmsAttendance.length.toString(), 
      icon: Clock, 
      module: 'attendance', 
      trendText: '95% on time', 
      trendColor: 'text-[#00a631] dark:text-[#34c759]', 
      iconBg: 'bg-[#00a631]/10 dark:bg-[#173b22]', 
      iconColor: 'text-[#00a631] dark:text-[#34c759]' 
    },
    { 
      title: 'ACTIVE LEAVES', 
      value: hrmsLeaves.filter(l => l.status === 'Approved').length.toString(), 
      icon: Calendar, 
      module: 'leave', 
      trendText: '-1 from last week', 
      trendColor: 'text-[#00a631] dark:text-[#34c759]', 
      iconBg: 'bg-[#00a631]/10 dark:bg-[#173b22]', 
      iconColor: 'text-[#00a631] dark:text-[#34c759]' 
    },
    { 
      title: 'PAYROLL PROCESSED', 
      value: hrmsPayroll.length.toString(), 
      icon: DollarSign, 
      module: 'payroll', 
      trendText: '100% completed', 
      trendColor: 'text-[#00a631] dark:text-[#34c759]', 
      iconBg: 'bg-[#00a631]/10 dark:bg-[#173b22]', 
      iconColor: 'text-[#00a631] dark:text-[#34c759]' 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white">HRMS Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            onClick={() => onNavigate(stat.module)}
            className="bg-white dark:bg-[#222421] p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center text-center min-h-[220px]"
          >
            <div className={`p-4 rounded-3xl transition-transform group-hover:scale-110 flex items-center justify-center shrink-0 mb-4 ${stat.iconBg}`}>
              <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
            </div>
            
            <p className="text-xs font-black tracking-widest text-gray-500 dark:text-gray-400 mb-2">
              {stat.title}
            </p>
            
            <p className="text-5xl font-black text-[#3a3b39] dark:text-white mb-4 tracking-tight">
              {stat.value}
            </p>
            
            <div className="flex items-center justify-center gap-2 mt-auto">
              <ArrowUpRight className={`w-5 h-5 ${stat.trendColor}`} strokeWidth={3} />
              <span className={`text-sm font-extrabold ${stat.trendColor}`}>
                {stat.trendText}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
