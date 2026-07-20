'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Users,
  Target,
  Wallet,
  Activity,
  RefreshCcw,
  Calendar,
  DownloadCloud,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f58220', '#a855f7', '#64748b'];

export default function SuperAdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
  const [topKeywords, setTopKeywords] = useState<any[]>([]);
  const [topLocations, setTopLocations] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('revenue');

  useEffect(() => {
    fetchDashboardStats();
  }, [timeRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const url = `/admin/analytics?timeRange=${timeRange}`;
      const data = await apiFetch(url);
      setStats(data.data?.summary || {});
      setRevenueTrends(data.data?.trends?.revenueTrends || []);
      setTopKeywords(data.data?.trends?.topKeywords || []);
      setTopLocations(data.data?.trends?.topLocations || []);
      setTopCategories(data.data?.trends?.topCategories || []);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalLeads = stats?.totalLeads || 0;
  const closedLeads = stats?.leadsByStatus?.find((s: any) => s.status === 'CLOSED')?._count?.id || 0;
  const conversionRate = totalLeads ? ((closedLeads / totalLeads) * 100).toFixed(2) : 0;

  const leadPipelineData = stats?.leadsByStatus ? stats.leadsByStatus.map((item: any, i: number) => ({
    name: item.status,
    value: item._count?.id || 0,
    color: COLORS[i % COLORS.length]
  })) : [];

  const subscriptionPlans = stats?.packageDistribution ? stats.packageDistribution.map((item: any, i: number) => ({
    name: item.name,
    vendors: item.vendors,
    color: COLORS[i % COLORS.length]
  })) : [];

  const handleExportCSV = () => {
    if (!stats) return;

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";

    // Section 1: Summary Metrics
    csvContent += "--- METRICS SUMMARY ---\n";
    csvContent += "Metric,Value\n";
    csvContent += `Total Revenue,INR ${stats.totalRevenue || 0}\n`;
    csvContent += `Active Vendors,${stats.verifiedVendors || 0}\n`;
    csvContent += `Total Leads,${totalLeads}\n`;
    csvContent += `Conversion Rate,${conversionRate}%\n\n`;

    // Section 2: Lead Pipeline
    csvContent += "--- LEAD PIPELINE ---\n";
    csvContent += "Status,Count\n";
    leadPipelineData.forEach((item: any) => {
      csvContent += `${item.name},${item.value}\n`;
    });
    csvContent += "\n";

    // Section 3: Subscription Plans
    csvContent += "--- SUBSCRIPTION PLANS ---\n";
    csvContent += "Plan Name,Vendors Enrolled\n";
    subscriptionPlans.forEach((item: any) => {
      csvContent += `${item.name},${item.vendors}\n`;
    });
    csvContent += "\n";

    // Section 4: Revenue Trends
    csvContent += "--- REVENUE TRENDS (Last 6 Months) ---\n";
    csvContent += "Month,Revenue (INR)\n";
    revenueTrends.forEach((item: any) => {
      csvContent += `${item.name},${item.revenue}\n`;
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `B2B_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  };

  // Hero Tabs definition
  const metrics = [
    { id: 'revenue', label: 'Gross Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: Wallet, trend: stats?.trends?.revenue?.value || '0.0%', trendUp: stats?.trends?.revenue?.isUp ?? true },
    { id: 'vendors', label: 'New Vendors', value: stats?.verifiedVendors || 0, icon: Users, trend: stats?.trends?.vendors?.value || '0.0%', trendUp: stats?.trends?.vendors?.isUp ?? true },
    { id: 'leads', label: 'New Leads', value: totalLeads, icon: Target, trend: stats?.trends?.leads?.value || '0.0%', trendUp: stats?.trends?.leads?.isUp ?? true },
    { id: 'conversion', label: 'Conversion Rate', value: `${conversionRate}%`, icon: Activity, trend: stats?.trends?.conversion?.value || '0.0%', trendUp: stats?.trends?.conversion?.isUp ?? true },
  ];


  
  const maxPlanVendors = Math.max(...subscriptionPlans.map((p: any) => p.vendors || 0), 1);
  const maxKw = Math.max(...topKeywords.map((k: any) => k.count || 0), 1);
  const maxCity = Math.max(...topLocations.map((l: any) => l.count || 0), 1);

  return (
    <div className="min-h-screen bg-[#fafafa] -m-4 sm:-m-6 md:-m-8 p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">Analytics Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Monitor your platform's high-level metrics and trends.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg pl-4 pr-10 py-2 outline-none hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
                <option value="yearly">Last 12 Months</option>
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={fetchDashboardStats}
              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* METRICS TABS (Stripe Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            return (
              <div
                key={metric.id}
                className="relative p-5 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {/* Subtle gradient background effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10 flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-500">{metric.label}</p>
                  <div className={`p-2 rounded-lg ${metric.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <metric.icon className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="relative z-10 flex items-end justify-between">
                  <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">{metric.value}</h3>
                  <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    metric.trendUp ? 'text-emerald-700 bg-emerald-100/50' : 'text-rose-700 bg-rose-100/50'
                  }`}>
                    {metric.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{metric.trend}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* HERO BAR CHART (Top Categories) */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-gray-900">
              Top Performing Categories
            </h3>
            <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
              By Inquiry Volume
            </span>
          </div>
          <div className="w-full h-[350px]">
            {topCategories.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">No category data available.</div>
            ) : (
              <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={topCategories} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#334155', fontWeight: 500 }} dx={-10} />
                  <RechartsTooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 600 }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={32}>
                    {topCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{ outline: 'none' }} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* INSIGHTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Lead Pipeline Progress (Donut Style) */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col lg:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-6">Lead Pipeline Conversion</h3>
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8">
              {leadPipelineData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-400 py-10">No leads available in this period.</div>
              ) : (
                <>
                  <div className="w-56 h-56 relative">
                    <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={leadPipelineData}
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {leadPipelineData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                           cursor={{ fill: '#f8fafc' }}
                           contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-semibold text-gray-900">{totalLeads}</span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Leads</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full space-y-5">
                    {leadPipelineData.map((item: any, i: number) => {
                      const percentage = totalLeads ? ((item.value / totalLeads) * 100) : 0;
                      return (
                        <div key={i} className="relative group">
                          <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="font-semibold text-gray-700 capitalize">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold text-gray-900">{item.value}</span>
                              <span className="text-sm text-gray-400 font-medium ml-1">({percentage.toFixed(0)}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000 relative"
                              style={{ width: `${percentage}%`, backgroundColor: item.color }}
                            >
                              <div className="absolute inset-0 bg-white/20 w-full h-full" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Subscription Plans Donut & Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Active Subscriptions</h3>
            <div className="flex-1 flex flex-col items-center justify-start">
              {subscriptionPlans.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-400 py-10">No active subscriptions.</div>
              ) : (
                <>
                  <div className="w-48 h-48 relative mb-6">
                    <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                      <PieChart>
                        <Pie
                          data={subscriptionPlans}
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={5}
                          dataKey="vendors"
                          stroke="none"
                        >
                          {subscriptionPlans.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                           cursor={{ fill: '#f8fafc' }}
                           contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-semibold text-gray-900">
                        {subscriptionPlans.reduce((sum: number, p: any) => sum + (p.vendors || 0), 0)}
                      </span>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Total</span>
                    </div>
                  </div>
                  
                  <div className="w-full space-y-2 mt-auto">
                    {subscriptionPlans.map((plan: any, i: number) => {
                      const barWidth = `${(plan.vendors / maxPlanVendors) * 100}%`;
                      return (
                        <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-100 hover:border-gray-200 bg-white transition-all p-3">
                          <div className="absolute inset-0 z-0 bg-gray-50 opacity-100 transition-opacity" style={{ width: barWidth }} />
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} />
                              <span className="font-medium text-gray-700">{plan.name}</span>
                            </div>
                            <span className="font-semibold text-gray-900">{plan.vendors}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* DEMAND ANALYTICS GRID (New) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          
          {/* Keyword Demand Table */}
          <div className="bg-white border border-gray-200 rounded-xl p-0 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Keyword-wise Demand</h3>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">Top 5</span>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-slate-700 font-semibold">
                  <tr>
                    <th className="px-5 py-3 border-b border-gray-100">Keyword</th>
                    <th className="px-5 py-3 border-b border-gray-100 text-right">Total Inquiries</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topKeywords.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-5 py-8 text-center text-gray-400">No keyword data</td>
                    </tr>
                  ) : topKeywords.map((kw: any, i: number) => {
                    const barWidth = `${(kw.count / maxKw) * 100}%`;
                    return (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors relative group">
                        <td className="px-5 py-3 font-medium text-gray-700 capitalize relative z-10">{kw.name}</td>
                        <td className="px-5 py-3 text-right font-semibold text-blue-600 relative z-10">{kw.count}</td>
                        {/* Inline Data Bar */}
                        <td className="absolute inset-0 z-0 pointer-events-none py-2 px-4">
                          <div 
                            className="h-full rounded bg-blue-50/50 opacity-100 transition-all duration-500 group-hover:bg-blue-100/50" 
                            style={{ width: barWidth }} 
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* City Demand Table */}
          <div className="bg-white border border-gray-200 rounded-xl p-0 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">City-wise Demand</h3>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-100">Top 5</span>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-slate-700 font-semibold">
                  <tr>
                    <th className="px-5 py-3 border-b border-gray-100">City</th>
                    <th className="px-5 py-3 border-b border-gray-100 text-right">Total Leads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topLocations.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-5 py-8 text-center text-gray-400">No city data</td>
                    </tr>
                  ) : topLocations.map((loc: any, i: number) => {
                    const barWidth = `${(loc.count / maxCity) * 100}%`;
                    return (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors relative group">
                        <td className="px-5 py-3 font-medium text-gray-700 capitalize relative z-10">{loc.name}</td>
                        <td className="px-5 py-3 text-right font-semibold text-purple-600 relative z-10">{loc.count}</td>
                        {/* Inline Data Bar */}
                        <td className="absolute inset-0 z-0 pointer-events-none py-2 px-4">
                          <div 
                            className="h-full rounded bg-purple-50/50 opacity-100 transition-all duration-500 group-hover:bg-purple-100/50" 
                            style={{ width: barWidth }} 
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
