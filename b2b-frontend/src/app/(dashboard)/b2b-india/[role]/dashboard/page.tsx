"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  Users,
  Store,
  Box,
  Send,
  Calendar,
  RefreshCcw,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  MapPin,
  Clock,
  ArrowRight,
  Wallet
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

export default function SuperAdminDashboard() {
  const params = useParams();
  const role = (params?.role as string) || '';
  const isSuperAdmin = role === 'super-admin';
  const displayRole = isSuperAdmin ? 'Super Admin' : 'Admin';

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("monthly");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchCategories();
  }, [timeRange, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const data = await apiFetch("/vendors/categories");
      setCategories(data.success ? data.data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      let url = `/admin/analytics?timeRange=${timeRange}`;
      if (selectedCategory !== "All") {
        url += `&category=${selectedCategory}`;
      }
      const data = await apiFetch(url);
      setDashboardData(data.data || {});
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const summary = dashboardData?.summary || {};
  const trends = dashboardData?.trends || {};
  const recentLeads = dashboardData?.recentLeads || [];

  const statCards = [
    { label: "Total Revenue", value: `₹${(summary.totalRevenue || 0).toLocaleString()}`, icon: Wallet, color: "text-emerald-600", trend: trends?.revenue?.value, isUp: trends?.revenue?.isUp ?? true },
    { label: "New Vendors", value: summary.verifiedVendors || 0, icon: Store, color: "text-blue-600", trend: trends?.vendors?.value, isUp: trends?.vendors?.isUp ?? true },
    { label: "Total Offerings", value: summary.totalProducts || 0, icon: Box, color: "text-purple-600" },
    { label: "New Leads", value: summary.totalLeads || 0, icon: Send, color: "text-amber-600", trend: trends?.leads?.value, isUp: trends?.leads?.isUp ?? true },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] -m-4 sm:-m-6 md:-m-8 p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">{displayRole} Dashboard</h1>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-sm text-gray-500">Monitor platform health, verify applications, and track growth.</p>
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
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-semibold text-gray-900 tracking-tight">{stat.value}</h3>
                {stat.trend && (
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${stat.isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {stat.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.trend}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT COLUMN (DATA) */}
          <div className="xl:col-span-2 space-y-6">

            {/* Revenue Area Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Revenue Trends</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Platform income over time</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="w-full h-[300px]">
                {(!trends.revenueTrends || trends.revenueTrends.length === 0) ? (
                  <div className="flex items-center justify-center h-full text-sm text-gray-400">No trend data available for this period.</div>
                ) : (
                  <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                    <AreaChart data={trends.revenueTrends}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0D824D" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0D824D" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        tickFormatter={(val) => `₹${val}`}
                        dx={-10}
                      />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}
                        itemStyle={{ color: '#0D824D', fontWeight: 600 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#0D824D"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRev)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Top Locations Bar Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Top Locations</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Cities with highest vendor density</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div className="w-full h-[250px]">
                {(!trends.topLocations || trends.topLocations.length === 0) ? (
                  <div className="flex items-center justify-center h-full text-sm text-gray-400">No location data available.</div>
                ) : (
                  <ResponsiveContainer width="99%" height="100%" minWidth={1} minHeight={1}>
                    <BarChart data={trends.topLocations} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#ea580c', fontWeight: 600 }}
                      />
                      <Bar dataKey="count" fill="#ea580c" radius={[0, 4, 4, 0]} barSize={24} style={{ outline: 'none' }} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (ACTIONS) */}
          <div className="space-y-6">

            {/* Verification Status */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 mb-6">Vendor Verification</h3>

              <div className="flex-1 space-y-6">
                {/* Verified */}
                <div className="relative">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700">Verified</span>
                    <span className="font-semibold text-gray-900">{summary.verifiedVendors || 0}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: `${summary.totalVendors ? ((summary.verifiedVendors || 0) / summary.totalVendors) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Pending */}
                <div className="relative">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700">Pending</span>
                    <span className="font-semibold text-gray-900">{summary.pendingVendors || 0}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-amber-500 transition-all duration-1000"
                      style={{ width: `${summary.totalVendors ? ((summary.pendingVendors || 0) / summary.totalVendors) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Rejected */}
                <div className="relative">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700">Rejected</span>
                    <span className="font-semibold text-gray-900">{summary.rejectedVendors || 0}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-rose-500 transition-all duration-1000"
                      style={{ width: `${summary.totalVendors ? ((summary.rejectedVendors || 0) / summary.totalVendors) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Applications</span>
                <span className="text-lg font-semibold text-gray-900">{summary.totalVendors || 0}</span>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
                <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">View All</button>
              </div>
              <div className="flex-1 overflow-auto max-h-[350px]">
                {recentLeads.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400">No recent activity.</div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {recentLeads.slice(0, 6).map((lead: any, i: number) => (
                      <div key={i} className="p-4 hover:bg-gray-50/50 transition-colors">
                        <p className="text-sm font-medium text-gray-900 mb-1 leading-tight">
                          New inquiry for {lead.productName || "Offering"}
                        </p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 mx-1" />
                          <span className="text-xs text-gray-500 truncate max-w-[120px]">{lead.buyerName || "Unknown Buyer"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
