'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
   Users,
   CheckCircle2,
   Clock,
   TrendingUp,
   ArrowUpRight,
   ShieldCheck,
   Star,
   Activity,
   MapPin,
   Globe,
   Instagram,
   Linkedin,
   Facebook,
   Search,
   ExternalLink,
   Target,
   Zap,
   Box
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   AreaChart, Area
} from 'recharts';

// --- SparkLine Component ---
const SparkLine = ({ data, color }: { data: any[]; color: string }) => (
   <div className="h-10 w-16 sm:w-20 lg:w-16 xl:w-24 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
         <AreaChart data={data}>
            <Area
               type="monotone"
               dataKey="value"
               stroke={color}
               fill={color}
               fillOpacity={0.1}
               strokeWidth={2}
            />
         </AreaChart>
      </ResponsiveContainer>
   </div>
);

export default function VendorDashboard() {
   const [stats, setStats] = useState({
      totalLeads: 0,
      closedLeads: 0,
      responseTime: "0%",
      trustIndex: 0
   });
   const [leads, setLeads] = useState<any[]>([]);
   const [chartData, setChartData] = useState<any[]>([]);
   const [profile, setProfile] = useState<any>(null);
   const [analytics, setAnalytics] = useState<any>(null);
   const [loading, setLoading] = useState(true);

   // Mock Spark Data
   const sparkData = [
      { value: 10 }, { value: 15 }, { value: 8 }, { value: 25 }, { value: 18 }, { value: 30 }
   ];

   useEffect(() => {
      const fetchDashboardData = async () => {
         try {
            setLoading(true);
            const [leadsRes, profileRes, analyticsRes] = await Promise.all([
               apiFetch('/leads/my-leads'),
               apiFetch('/vendors/me'),
               apiFetch('/vendors/analytics')
            ]);

            const allLeads = leadsRes.data?.leads || [];
            setLeads(allLeads.slice(0, 5));
            setProfile(profileRes.data);
            setAnalytics(analyticsRes.data);

            setStats({
               totalLeads: allLeads.length,
               closedLeads: allLeads.filter((l: any) => l.status === 'CLOSED').length,
               responseTime: analyticsRes.data?.responseRate || "100%",
               trustIndex: profileRes.data?.totalScore || 0
            });

            // Generate dynamic chart data
            const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
            const dynamicChart = months.map(m => ({
               name: `${m} '26`,
               value: Math.floor(Math.random() * 5) + 1
            }));
            setChartData(dynamicChart);

         } catch (error) {
            console.error('Dashboard data fetch failed:', error);
         } finally {
            setLoading(false);
         }
      };

      fetchDashboardData();
   }, []);

   if (loading) return (
      <div className="space-y-6 animate-pulse p-4 lg:p-8 pb-20">
         {/* Top Stats Skeleton */}
         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
               <div key={i} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex flex-col justify-between h-[104px]">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-8 h-8 bg-slate-100 rounded"></div>
                     <div className="h-3 bg-slate-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-slate-200 rounded w-16"></div>
               </div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Leads Skeleton */}
            <div className="lg:col-span-2 space-y-4">
               <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
               {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between h-24">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
                        <div className="space-y-2.5">
                           <div className="h-4 bg-slate-200 rounded w-32"></div>
                           <div className="h-3 bg-slate-100 rounded w-24"></div>
                        </div>
                     </div>
                     <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
                  </div>
               ))}
            </div>

            {/* Right: Analytics Skeleton */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm h-[320px]">
               <div className="h-6 bg-slate-200 rounded w-1/2 mb-8"></div>
               <div className="space-y-6">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                  <div className="h-24 bg-slate-100 rounded w-full mt-8"></div>
               </div>
            </div>
         </div>
      </div>
   );

   return (
      <div className="space-y-6 animate-fade-in">

         {/* Top Stats Row */}
         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
               { label: 'Customer Inquiries', value: stats.totalLeads, icon: Users, color: '#10b981', sub: 'Total interest received' },
               { label: 'Qualified Leads', value: stats.closedLeads, icon: CheckCircle2, color: '#f58220', sub: 'Leads successfully closed' },
               { label: 'Response Rate', value: stats.responseTime, icon: Clock, color: '#f59e0b', sub: 'Efficiency in replying' },
               { label: 'Trust Index', value: stats.trustIndex.toFixed(1), icon: Star, color: '#10b981', sub: 'Your marketplace reputation' },
            ].map((stat, i) => (
               <div key={i} className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-slate-600 shrink-0">
                           <stat.icon size={16} />
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide truncate">{stat.label}</span>
                     </div>
                     <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-none mb-1.5">{stat.value}</h3>
                     <p className="text-[10px] sm:text-xs text-slate-500 truncate">{stat.sub}</p>
                  </div>
                  <SparkLine data={sparkData} color={stat.color} />
               </div>
            ))}
         </div>

         {/* Main Grid */}
         <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

            {/* Left Column: Activity & Analytics */}
            <div className="xl:col-span-8 space-y-6">

               {/* Recent Activity */}
               <div className="bg-white rounded border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Activity size={18} className="text-slate-700" />
                        <h3 className="text-sm font-semibold text-slate-900 uppercase">Recent Activity</h3>
                     </div>
                     <Link href="/vendor/leads" className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1.5">
                        See All Leads <ArrowUpRight size={14} />
                     </Link>
                  </div>

                  <div className="divide-y divide-gray-200">
                     {leads.length > 0 ? leads.map((lead) => (
                        <div key={lead.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                           <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                              <div className="min-w-0">
                                 <h4 className="text-sm font-medium text-slate-900 leading-none mb-1.5 truncate">{lead.buyerName || 'Marketplace Inquiry'}</h4>
                                 <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                       <MapPin size={12} /> {lead.city || 'India'}
                                    </span>
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                       {lead.category?.name || 'General'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                              <div className="text-right">
                                 <p className="text-xs text-slate-500">Received</p>
                                 <p className="text-xs sm:text-sm font-medium text-slate-900">{new Date(lead.createdAt).toLocaleDateString()}</p>
                              </div>
                              <Link href={`/vendor/leads?id=${lead.id}`} className="px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded text-xs sm:text-sm font-medium text-slate-700 hover:bg-gray-50 transition-all whitespace-nowrap">
                                 Reply to Lead
                              </Link>
                           </div>
                        </div>
                     )) : (
                        <div className="p-10 text-center text-slate-500 text-sm font-medium">
                           No Recent Activity
                        </div>
                     )}
                  </div>
               </div>



            </div>

            {/* Right Column: Social & Location */}
            <div className="xl:col-span-4 space-y-6">

               {/* Social Links */}
               <div className="bg-white rounded border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                     <h3 className="text-sm font-semibold text-slate-900 uppercase">Social Links</h3>
                     <Globe size={16} className="text-slate-500" />
                  </div>

                  <div className="space-y-3">
                     {[
                        { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { id: 'instagram', icon: Instagram, label: 'Instagram', color: 'text-pink-600', bg: 'bg-pink-50' },
                        { id: 'facebook', icon: Facebook, label: 'Facebook', color: 'text-blue-800', bg: 'bg-blue-50' },
                     ].map((social, i) => {
                        const url = profile?.socialLinks?.[social.id] || `Not Linked`;
                        return (
                           <div key={i} className="group p-3 rounded flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer">
                              <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 ${social.bg} ${social.color} rounded flex items-center justify-center`}>
                                    <social.icon size={16} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-medium text-slate-900 leading-none mb-1">{social.label}</p>
                                    <p className="text-xs text-slate-500 truncate max-w-[150px]">{url}</p>
                                 </div>
                              </div>
                              <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                           </div>
                        );
                     })}
                  </div>
               </div>

               {/* Business Location */}
               <div className="bg-white rounded border border-gray-200 p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                     <h3 className="text-sm font-semibold text-slate-900 uppercase">Business Location</h3>
                     <MapPin size={16} className="text-slate-500" />
                  </div>

                  <div className="relative rounded overflow-hidden h-32 mb-6 border border-gray-200 bg-gray-50">
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                           <div className="w-12 h-12 bg-blue-100 rounded-full animate-pulse flex items-center justify-center">
                              <MapPin className="text-blue-600" size={24} />
                           </div>
                           <div className="absolute top-0 left-0 w-12 h-12 bg-blue-400 rounded-full animate-ping opacity-20"></div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <p className="text-sm font-medium text-slate-900 leading-relaxed">
                           {profile?.address || "Address details not provided."}
                        </p>
                     </div>

                     <div className="flex items-center gap-3 py-3 border-t border-gray-200">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-slate-600">
                           <ShieldCheck size={16} />
                        </div>
                        <p className="text-sm font-medium text-slate-900">{profile?.phone || profile?.user?.phone || 'Contact pending'}</p>
                     </div>

                     <p className="text-xs text-slate-500 uppercase">{profile?.city || 'India'} Marketplace</p>
                  </div>
               </div>

            </div>

         </div>
      </div>
   );
}
