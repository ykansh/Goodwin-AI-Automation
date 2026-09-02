import { useState, useMemo } from 'react';
import { Clock, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { useData } from '../../store/DataContext';
import toast from 'react-hot-toast';

export function AttendancePage() {
  const { hrmsAttendance, hrmsEmployees, markAttendance } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const todayDate = new Date().toISOString().split('T')[0];
  
  // Use actual HRMS Employees from the database
  const activeEmployees = hrmsEmployees.filter(emp => emp.status === 'Active');
  const filteredEmployees = activeEmployees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarkAttendance = async (employeeId: string, status: string) => {
    setLoading(employeeId);
    try {
      let checkIn = undefined;
      let checkOut = undefined;
      
      if (status === 'Present') {
        checkIn = '09:00';
        checkOut = '18:00';
      } else if (status === 'Half-Day') {
        checkIn = '09:00';
        checkOut = '13:00';
      } else if (status === 'Late') {
        checkIn = '10:30';
        checkOut = '18:00';
      }

      await markAttendance({
        employee_id: employeeId,
        date: todayDate,
        status,
        check_in: checkIn,
        check_out: checkOut,
        notes: ''
      });
      
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(null);
    }
  };

  const getTodayStatus = (employeeId: string) => {
    const att = hrmsAttendance.find(a => a.employee_id === employeeId && a.date === todayDate);
    return att ? att.status : null;
  };

  if (selectedEmployeeId) {
    return <EmployeeAttendanceCalendar employeeId={selectedEmployeeId} onBack={() => setSelectedEmployeeId(null)} />;
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white flex items-center gap-2">
            <Clock className="w-8 h-8 text-[#00a631]" />
            Today's Attendance
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 bg-white/40 dark:bg-[#1b1e1b] border border-gray-200 dark:border-[#2d302d] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00a631] text-[#3a3b39] dark:text-white font-bold"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map((emp) => {
          const name = `${emp.first_name} ${emp.last_name}`.trim();
          const status = getTodayStatus(emp.id);
          const isProcessing = loading === emp.id;
          
          return (
            <div key={emp.id} className="bg-white dark:bg-[#222421] rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-[#2d302d] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[260px] relative group">
              
              <button 
                onClick={() => setSelectedEmployeeId(emp.id)}
                className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-[#00a631] hover:bg-[#00a631]/10 transition-colors opacity-0 group-hover:opacity-100"
                title="View Calendar"
              >
                <CalendarIcon className="w-5 h-5" />
              </button>

              <div className="p-4 rounded-3xl transition-transform flex items-center justify-center shrink-0 mb-4 bg-[#00a631]/10 dark:bg-[#173b22]">
                <Clock className="w-7 h-7 text-[#00a631] dark:text-[#34c759]" />
              </div>
              
              <p className="text-xs font-black tracking-widest text-gray-500 dark:text-gray-400 mb-2 uppercase">
                {name}
              </p>
              
              <p className={`text-4xl font-black mb-6 tracking-tight ${
                status === 'Present' ? 'text-green-600 dark:text-[#34c759]' :
                status === 'Absent' ? 'text-red-500' :
                status === 'Half-Day' ? 'text-purple-500' :
                status === 'Late' ? 'text-yellow-500' :
                'text-[#3a3b39] dark:text-white'
              }`}>
                {status ? status.toUpperCase() : 'PENDING'}
              </p>

              <div className="grid grid-cols-2 gap-2 mt-auto w-full">
                <button
                  onClick={() => handleMarkAttendance(emp.id, 'Present')}
                  disabled={isProcessing || status === 'Present'}
                  className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-black transition-all ${
                    status === 'Present' ? 'bg-[#00a631] text-white opacity-50 cursor-not-allowed' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-[#00a631] hover:text-white'
                  }`}
                >
                  Present
                </button>
                <button
                  onClick={() => handleMarkAttendance(emp.id, 'Absent')}
                  disabled={isProcessing || status === 'Absent'}
                  className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-black transition-all ${
                    status === 'Absent' ? 'bg-red-500 text-white opacity-50 cursor-not-allowed' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  Absent
                </button>
                <button
                  onClick={() => handleMarkAttendance(emp.id, 'Half-Day')}
                  disabled={isProcessing || status === 'Half-Day'}
                  className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-black transition-all ${
                    status === 'Half-Day' ? 'bg-purple-500 text-white opacity-50 cursor-not-allowed' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-500 hover:text-white'
                  }`}
                >
                  Half Day
                </button>
                <button
                  onClick={() => handleMarkAttendance(emp.id, 'Late')}
                  disabled={isProcessing || status === 'Late'}
                  className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-black transition-all ${
                    status === 'Late' ? 'bg-yellow-500 text-white opacity-50 cursor-not-allowed' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-yellow-500 hover:text-white'
                  }`}
                >
                  Late
                </button>
              </div>
            </div>
          );
        })}
        
        {filteredEmployees.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500">
            <Clock className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-bold">No employees found.</p>
            <p className="text-sm">Please add Employees in the Employees section to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Calendar View Component ──────────────────────────────────────────────────
function EmployeeAttendanceCalendar({ employeeId, onBack }: { employeeId: string, onBack: () => void }) {
  const { hrmsAttendance, hrmsEmployees } = useData();
  
  // Setup standard calendar logic
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  
  const emp = hrmsEmployees.find(e => e.id === employeeId);
  const name = emp ? `${emp.first_name} ${emp.last_name}`.trim() : 'Unknown';
  
  const attendanceForMonth = useMemo(() => {
    if (!emp) return [];
    return hrmsAttendance.filter(a => {
      if (a.employee_id !== emp.id) return false;
      const d = new Date(a.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [hrmsAttendance, emp, currentMonth, currentYear]);

  // Generate days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null); // padding
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else { setCurrentMonth(m => m - 1); }
  };
  
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else { setCurrentMonth(m => m + 1); }
  };

  const getDayStatus = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = attendanceForMonth.find(a => a.date === dateStr);
    return record ? record.status : null;
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'Present': return 'bg-green-500 text-white';
      case 'Absent': return 'bg-red-500 text-white';
      case 'Half-Day': return 'bg-purple-500 text-white';
      case 'Late': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-white dark:bg-gray-800 rounded-xl hover:shadow-lg transition-all">
          <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-[#3a3b39] dark:text-white uppercase tracking-tight">
            {name}'s Attendance
          </h1>
          <p className="text-sm font-bold text-gray-500 mt-1">Monthly View</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-[#222421] rounded-[2rem] p-6 sm:p-10 shadow-sm border border-gray-100 dark:border-[#2d302d]">
        <div className="flex justify-between items-center mb-8">
          <button onClick={handlePrevMonth} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold text-gray-600 dark:text-gray-300">&larr; Prev</button>
          <h2 className="text-xl font-black text-[#3a3b39] dark:text-white uppercase">
            {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={handleNextMonth} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold text-gray-600 dark:text-gray-300">Next &rarr;</button>
        </div>
        
        <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center font-black text-gray-400 dark:text-gray-500 text-xs sm:text-sm uppercase">{d}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="h-16 sm:h-24 rounded-2xl" />;
            const status = getDayStatus(day);
            return (
              <div 
                key={day} 
                className={`h-16 sm:h-24 rounded-2xl flex flex-col items-center justify-center border border-gray-100 dark:border-gray-800 transition-transform hover:scale-105 ${getStatusColor(status)}`}
              >
                <span className="text-lg sm:text-2xl font-black">{day}</span>
                {status && <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest mt-1 hidden sm:block">{status}</span>}
              </div>
            );
          })}
        </div>
        
        <div className="flex flex-wrap justify-center gap-6 mt-10 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div><span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Present</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500"></div><span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Absent</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-yellow-500"></div><span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Late</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-500"></div><span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">Half Day</span></div>
        </div>
      </div>
    </div>
  );
}
