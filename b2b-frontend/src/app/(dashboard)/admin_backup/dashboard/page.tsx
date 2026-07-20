'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  BarChart3,
  Users,
  Target,
  Briefcase,
  Zap,
  ArrowUpRight,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  ShieldAlert,
  ArrowRight,
  RefreshCcw,
  MapPin,
  Building2,
  Package,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const mockTrendData = [
  { name: 'Mon', queries: 20 },
  { name: 'Tue', queries: 45 },
  { name: 'Wed', queries: 28 },
  { name: 'Thu', queries: 80 },
  { name: 'Fri', queries: 95 },
  { name: 'Sat', queries: 40 },
  { name: 'Sun', queries: 15 },
];

const mockPieData = [
  { name: 'Price', value: 1250000, color: '#319280' },
  { name: 'Solution', value: 1780000, color: '#addccf' },
  { name: 'Personality', value: 781000, color: '#f58220' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hubInfo, setHubInfo] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('all');
  const [pieData, setPieData] = useState(mockPieData);
  const [trendData, setTrendData] = useState(mockTrendData);

  useEffect(() => {
    fetchDashboardStats();
  }, [timeRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const url = timeRange === 'all' ? '/admin/analytics' : `/admin/analytics?timeRange=${timeRange}`;
      const data = await apiFetch(url);
      const summary = data.data?.summary || {};

      setHubInfo(data.data?.hubInfo);
      
      const statusMap = summary.leadsByStatus;
      if (statusMap && statusMap.length > 0) {
         const colors = ['#319280', '#addccf', '#f58220', '#164e33'];
         setPieData(statusMap.map((item: any, idx: number) => ({
            name: item.status,
            value: item._count.id,
            color: colors[idx % colors.length]
         })));
      }

      const topLocations = data.data?.trends?.topLocations;
      if (topLocations && topLocations.length > 0) {
         setTrendData(topLocations.map((item: any) => ({
            name: item.name,
            queries: item.count,
            value: item.count
         })));
      }

      setStats({
        totalLeads: summary.totalLeads || 0,
        totalVendors: summary.totalVendors || 0,
        pendingApprovals: summary.pendingVendors || 0,
        activeSubscribers: summary.activeSubscribers || 0,
        recentActivity: data.data?.recentLeads || []
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentZone = hubInfo?.name || "Regional Hub";

  const dashboardCards = [
    { label: 'Active Vendors', value: stats?.totalVendors || 0, icon: Building2, color: '#10b981', desc: 'Verified in ' + currentZone },
    { label: 'Market Demand', value: stats?.totalLeads || 0, icon: Target, color: '#3b82f6', desc: 'Live hub inquiries' },
    { label: 'Pending Verification', value: stats?.pendingApprovals || 0, icon: ShieldAlert, color: '#f59e0b', desc: 'Action required' },
    { label: 'Active Subscribers', value: stats?.activeSubscribers || 0, icon: Zap, color: '#8b5cf6', desc: 'Premium vendors' }
  ];

  return (
    <div className="space-y-6 animate-simple-fade pb-20 bg-[#f8fafc] p-4 md:p-8 min-h-screen">
      {/* Top Header Equivalent */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Key metrics for {currentZone}</h1>
          <p className="text-sm font-medium text-slate-500">Regional intelligence & performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-[#164e33]/5 focus:border-[#164e33]/20 transition-all cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="yearly">This Year</option>
            <option value="monthly">This Month</option>
            <option value="weekly">This Week</option>
          </select>
          <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm active:scale-95">
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, idx) => (
          <div
            key={card.label}
            className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 relative flex flex-col justify-between min-h-[180px] group overflow-hidden"
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                 <div className="min-h-[36px] flex items-start">
                    <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase leading-tight tracking-normal">{card.label}</p>
                 </div>
                 <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-none">{loading ? '...' : card.value}</h3>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500`} style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                 <card.icon size={20} />
              </div>
            </div>

            <div className="mt-4 relative z-10">
              <p className="text-[10px] md:text-[11px] font-bold text-slate-600 mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: card.color }} />
                {card.desc}
              </p>
              
              <div className="h-12 w-full -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id={`color${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={card.color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={card.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="queries" 
                      stroke={card.color} 
                      fillOpacity={1} 
                      fill={`url(#color${idx})`} 
                      strokeWidth={2.5}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Top Left: Bar Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200  col-span-1 min-h-[300px] flex flex-col relative">
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-800">Forecast - weighted</h3>
            <button className="text-gray-600 hover:text-gray-600"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg></button>
          </div>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => val > 1000 ? `${(val / 1000).toFixed(1)}K` : val} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="#addccf" barSize={40} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Middle: Donut Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200  col-span-1 min-h-[300px] flex flex-col relative">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-base font-semibold text-slate-800">Won leads by reason</h3>
            <button className="text-gray-600 hover:text-gray-600"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg></button>
          </div>
          <div className="flex-1 w-full flex items-center justify-center relative min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-0">
              <span className="text-[18px] font-bold text-slate-800 tabular-nums">{stats?.totalLeads || 0}</span>
              <span className="text-xs text-slate-700 font-medium uppercase">TOTAL</span>
            </div>
          </div>
          <div className="flex flex-wrap flex-row items-center justify-center gap-3 mt-4">
            {pieData.map((item: any) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-medium text-[#164e33]">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Large Area Chart overlapping */}
        <div className="bg-white p-6 rounded-lg border border-gray-200  col-span-1 lg:col-span-1 min-h-[300px] flex flex-col relative">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">Demand this year compared</h3>
            <button className="text-gray-600 hover:text-gray-600"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg></button>
          </div>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="queries" stroke="#319280" fill="#addccf" fillOpacity={0.7} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Layout Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Live Activity (reusing functionality) */}
        <div className="lg:col-span-8 bg-white rounded-lg p-6 border border-gray-200  min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-800">Live Regional Demand Activity</h3>
            <button onClick={fetchDashboardStats} className="text-gray-600 hover:text-gray-600">
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-4">
            {stats?.recentActivity?.length > 0 ? stats.recentActivity.slice(0, 5).map((lead: any, i: number) => (
              <div key={lead.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#186a5a] text-white flex items-center justify-center font-bold text-xs">{lead.buyerName?.charAt(0) || 'U'}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{lead.searchKeyword ? lead.searchKeyword : `Requirement from ${lead.buyerName}`}</p>
                    <p className="text-xs text-slate-700">{lead.city}</p>
                  </div>
                </div>
                <span className="text-sm font-medium tabular-nums text-slate-700">Just now</span>
              </div>
            )) : (
              <div className="py-10 text-center text-sm text-slate-700">Scanning for regional trade signals...</div>
            )}
          </div>
        </div>

        {/* Sales falling behind Equivalent */}
        <div className="lg:col-span-4 bg-white rounded-lg p-6 border border-gray-200  min-h-[300px]">
          <div className="flex items-start justify-between mb-6">
            <h3 className="text-base font-semibold text-slate-800">Pending Actions - Act now</h3>
            <button className="text-gray-600 hover:text-gray-600"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg></button>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#164e33] flex items-center justify-center text-white"><ShieldAlert className="w-4 h-4" /></div>
                <div>
                  <p className="text-[14px] font-semibold text-slate-800 leading-tight">{stats?.pendingApprovals || 0} Vendors</p>
                  <p className="text-xs text-slate-700">Awaiting Profile Review</p>
                </div>
              </div>
              <Link href="/admin/vendors" className="text-xs font-bold text-[#f58220] opacity-0 group-hover:opacity-100 transition-opacity">VERIFY</Link>
            </div>
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#164e33] flex items-center justify-center text-white"><Target className="w-4 h-4" /></div>
                <div>
                  <p className="text-[14px] font-semibold text-slate-800 leading-tight">Product Moderation</p>
                  <p className="text-xs text-slate-700">Catalog Checks</p>
                </div>
              </div>
              <Link href="/admin/products" className="text-xs font-bold text-[#f58220] opacity-0 group-hover:opacity-100 transition-opacity">REVIEW</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


