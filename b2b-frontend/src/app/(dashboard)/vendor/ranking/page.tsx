'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  Award, Target, Zap, ShieldCheck, CheckCircle2, Clock, Briefcase, ChevronRight, UserCircle2, Package, Settings, Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded shadow-md border border-gray-200 flex items-center gap-3 z-50 relative">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></div>
        <div>
          <p className="text-xs text-slate-500">{payload[0].name}</p>
          <p className="text-sm font-medium text-slate-900">{payload[0].value} Leads</p>
        </div>
      </div>
    );
  }
  return null;
};

export default function VendorPerformanceSimple() {
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, analyticsRes] = await Promise.all([
          apiFetch('/vendors/me'),
          apiFetch('/vendors/analytics')
        ]);
        setProfile(profileRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Performance fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-4 lg:p-8 pb-20 animate-pulse">
        {/* Header Skeleton */}
        <div className="pb-4">
          <div className="h-6 bg-slate-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-64"></div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between h-[108px]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-slate-100 rounded"></div>
                <div className="h-3 bg-slate-200 rounded w-24"></div>
              </div>
              <div className="h-6 bg-slate-200 rounded w-16 mb-1.5"></div>
              <div className="h-3 bg-slate-100 rounded w-32"></div>
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-5 h-[350px]">
            <div className="h-5 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-slate-100 rounded-full w-64 mx-auto mt-4"></div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5 h-[350px]">
            <div className="h-5 bg-slate-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3 mt-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0"></div>
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const relevantStatuses = [
    { key: 'DISTRIBUTED', label: 'ACTIVE' },
    { key: 'CLOSED', label: 'CONVERTED' },
    { key: 'EXPIRED', label: 'MISSED' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DISTRIBUTED': return '#3b82f6'; // blue
      case 'CLOSED': return '#10b981'; // emerald
      case 'EXPIRED': return '#ef4444'; // red
      default: return '#94a3b8'; // slate
    }
  };

  // Ensure relevant statuses show up with their real data and better labels
  const leadsChartData = relevantStatuses.map(statusObj => {
    const found = analytics?.leads?.find((l: any) => l.status === statusObj.key);
    return {
      name: statusObj.label,
      value: found ? found._count.id : 0,
      color: getStatusColor(statusObj.key)
    };
  });

  const kpis = [
    { label: 'Total Score', value: profile?.totalScore?.toFixed(1) || '0.0', desc: 'Algorithmic standing', icon: Award },
    { label: 'Category Rank', value: analytics?.categoryRank || '#-', desc: profile?.categories?.[0]?.name || 'Products', icon: Target },
    { label: 'Response Rate', value: analytics?.responseRate || 'N/A', desc: 'Lead handling efficiency', icon: Zap },
    { 
      label: 'Trust Factor', 
      value: profile?.trustBadge && profile.trustBadge !== 'NONE' 
        ? profile.trustBadge.toLowerCase().split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') 
        : (profile?.verified ? 'Verified Seal' : 'Standard'), 
      desc: profile?.trustBadge && profile.trustBadge !== 'NONE' 
        ? 'Premium Trust Partner' 
        : (profile?.verified ? 'Verified Supplier' : 'Unverified'), 
      icon: ShieldCheck 
    },
  ];

  const getDynamicRecommendations = () => {
    const recs = [];
    if (!profile?.verified) {
      recs.push({ label: 'Complete Verification', desc: 'Verified vendors get higher visibility.', impact: 'High Priority', link: '/vendor/profile' });
    }
    if (!profile?.products || profile.products.length === 0) {
      recs.push({ label: 'Add Products', desc: 'Add detailed descriptions to your catalog.', impact: 'High Priority', link: '/vendor/products' });
    } else {
      recs.push({ label: 'Keyword Optimization', desc: 'Add missing keywords to products.', impact: 'Medium Priority', link: '/vendor/products' });
    }

    if (profile?.profileCompleteness < 80) {
      recs.push({ label: 'Complete Profile Details', desc: 'A complete profile attracts more leads.', impact: 'Medium Priority', link: '/vendor/profile' });
    }

    if (recs.length === 0) {
      recs.push({ label: 'Profile Optimized', desc: 'Your profile is fully optimized.', impact: 'Low Priority', link: '/vendor/ranking' });
    }

    return recs.slice(0, 3);
  };

  return (
    <div className="space-y-6 p-4 lg:p-8 pb-20">

      {/* Header */}
      <div className="pb-4">
        <h1 className="text-xl font-semibold text-slate-900">Performance & Ranking</h1>
        <p className="text-sm text-slate-500 mt-1">Track your business standing and visibility.</p>
      </div>

      {/* KPI Cards (Dashboard Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-slate-600">
                  <kpi.icon size={16} />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{kpi.label}</span>
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 leading-none mb-1.5">{kpi.value}</h3>
              <p className="text-xs text-slate-500">{kpi.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Recommendations & Graph */}
        <div className="lg:col-span-2 space-y-6">

          {/* Graph Section */}
          <section className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-medium text-slate-900">Leads Distribution</h3>
            </div>

            <div className="h-[280px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Pie
                    data={leadsChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {leadsChartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ outline: 'none' }} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    content={(props) => {
                      const { payload } = props;
                      return (
                        <ul className="flex flex-wrap items-center justify-center gap-6 mt-2">
                          {payload?.map((entry, index) => (
                            <li key={`item-${index}`} className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                              <span className="text-sm text-slate-600">{entry.value}</span>
                            </li>
                          ))}
                        </ul>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Inner Text for Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-6">
                <span className="text-2xl font-semibold text-slate-900">
                  {leadsChartData.reduce((acc: number, curr: any) => acc + curr.value, 0)}
                </span>
                <span className="text-xs text-slate-500 mt-1">Total Leads</span>
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
            <h3 className="text-base font-medium text-slate-900 mb-4 pb-2 border-b border-gray-200">Recommendations</h3>
            <div className="space-y-3">
              {getDynamicRecommendations().map((task, i) => (
                <Link href={task.link} key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded hover:bg-gray-50 transition-colors gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{task.label}</h4>
                    <p className="text-sm text-slate-500 mt-0.5">{task.desc}</p>
                  </div>
                  <div className="px-2.5 py-1 rounded border border-gray-200 bg-white text-xs text-slate-600 shrink-0">
                    {task.impact}
                  </div>
                </Link>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">

          <section className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
            <h3 className="text-base font-medium text-slate-900 mb-4 pb-2 border-b border-gray-200">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Edit Profile', icon: UserCircle2, link: '/vendor/profile' },
                { label: 'Manage Products', icon: Package, link: '/vendor/products' },
                { label: 'View Leads', icon: Target, link: '/vendor/leads' },
                { label: 'Settings', icon: Settings, link: '/vendor/settings' },
              ].map((action, i) => (
                <Link href={action.link} key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <action.icon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-700">{action.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
