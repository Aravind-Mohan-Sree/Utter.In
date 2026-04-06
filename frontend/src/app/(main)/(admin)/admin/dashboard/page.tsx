'use client';

import { useEffect, useState } from 'react';
import { FaExclamationCircle,FaLaptopCode, FaUserCheck, FaUsers, FaWallet } from 'react-icons/fa';

import { DashboardData,getDashboardData } from '~services/admin/dashboardService';

const DashboardStats = ({ data }: { data: DashboardData }) => {
  const stats = [
    {
      title: 'Total Users',
      value: data.stats.totalUsers.toLocaleString(),
      growth: `+${data.stats.userGrowth}% this month`,
      icon: <FaUsers size={24} />,
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      shadowColor: 'shadow-blue-200/50'
    },
    {
      title: 'Active Tutors',
      value: data.stats.activeTutors.toLocaleString(),
      growth: `+${data.stats.tutorGrowth}% this month`,
      icon: <FaUserCheck size={24} />,
      bgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      shadowColor: 'shadow-emerald-200/50'
    },
    {
      title: 'Sessions Completed',
      value: data.stats.sessionsCompleted.toLocaleString(),
      growth: `+${data.stats.sessionGrowth}% this month`,
      icon: <FaLaptopCode size={24} />,
      bgColor: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      shadowColor: 'shadow-amber-200/50'
    },
    {
      title: 'Total Earnings',
      value: data.stats.totalEarnings >= 1000000 
        ? `₹${(data.stats.totalEarnings / 1000000).toFixed(1)}M`
        : `₹${(data.stats.totalEarnings / 1000).toFixed(1)}K`,
      growth: `+${data.stats.earningsGrowth}% this month`,
      icon: <FaWallet size={24} />,
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      shadowColor: 'shadow-purple-200/50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, idx) => (
        <div 
          key={idx} 
          className={`bg-white/80 backdrop-blur-xl border border-gray-100 p-6 rounded-[32px] shadow-sm ${stat.shadowColor} group`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-4 rounded-2xl ${stat.bgColor} ${stat.iconColor}`}>
              {stat.icon}
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-gray-800 tracking-tight">{stat.value}</h3>
            <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <span className={`text-[11px] font-black uppercase tracking-widest ${stat.iconColor}`}>
              {stat.growth}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const RecentActivity = ({ activity }: { activity: DashboardData['recentActivity'] }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return <FaUsers className="text-blue-500" />;
      case 'session_completed': return <FaLaptopCode className="text-emerald-500" />;
      case 'tutor_verification': return <FaUserCheck className="text-amber-500" />;
      case 'abuse_report': return <FaExclamationCircle className="text-rose-500" />;
      default: return null;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case 'user_registration': return 'bg-blue-50';
      case 'session_completed': return 'bg-emerald-50';
      case 'tutor_verification': return 'bg-amber-50';
      case 'abuse_report': return 'bg-rose-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[40px] p-8 shadow-sm h-full">
      <h2 className="text-2xl font-black text-gray-800 mb-8 tracking-tight">Recent Activity</h2>
      <div className="space-y-6">
        {activity.map((item, idx) => (
          <div key={idx} className="flex items-center gap-5 group cursor-default">
            <div className={`w-12 h-12 rounded-2xl ${getBg(item.type)} flex items-center justify-center shrink-0`}>
              {getIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-gray-800 truncate leading-snug">{item.message}</p>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(item.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
        {activity.length === 0 && <p className="text-gray-400 font-bold text-center py-10">No recent activity</p>}
      </div>
    </div>
  );
};

const PopularLanguages = ({ languages }: { languages: DashboardData['popularLanguages'] }) => {
  const maxSessions = languages.length > 0 ? Math.max(...languages.map(l => l.sessionCount)) : 100;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[40px] p-8 shadow-sm h-full">
      <h2 className="text-2xl font-black text-gray-800 mb-8 tracking-tight">Popular Languages</h2>
      <div className="space-y-8">
        {languages.map((lang, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-sm font-black text-gray-800 tracking-wide uppercase">{lang.language}</span>
              <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">{lang.sessionCount.toLocaleString()} sessions</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full"
                style={{ width: `${(lang.sessionCount / maxSessions) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {languages.length === 0 && <p className="text-gray-400 font-bold text-center py-10">No session data available</p>}
      </div>
    </div>
  );
};

const AdminDashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-[6px] border-rose-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-[6px] border-transparent border-t-rose-500 rounded-full animate-spin"></div>
          <div className="absolute inset-6 bg-rose-500/5 rounded-full animate-pulse"></div>
        </div>
        <p className="mt-10 text-[12px] font-black text-gray-400 uppercase tracking-[0.5em] animate-pulse">Retrieving Analytical Data</p>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-center font-bold text-rose-500">Error loading dashboard data.</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFE] p-8 lg:p-12">
      <div className="max-w-[1600px] mx-auto">
        <DashboardStats data={data} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RecentActivity activity={data.recentActivity} />
          <PopularLanguages languages={data.popularLanguages} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
