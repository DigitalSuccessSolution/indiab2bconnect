'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  History, 
  Filter, 
  User, 
  ShieldCheck, 
  RefreshCcw,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Database,
  Target,
  Bell,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';
import { format } from 'date-fns';

const formatUserFriendlyDetails = (details: string) => {
  if (!details) return 'Administrative movement logged and verified successfully.';
  
  const uuidRegex = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/g;
  const parts = details.split(uuidRegex);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.match(uuidRegex)) {
          return (
            <span key={index} className="inline-flex font-mono text-[11px] font-medium bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 mx-1">
              #{part.substring(0, 8)}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [module, setModule] = useState('');
  const [timeRange, setTimeRange] = useState('ALL');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (module) params.append('module', module);
      if (timeRange !== 'ALL') params.append('timeRange', timeRange);
      if (timeRange === 'custom' && customRange.start && customRange.end) {
        params.append('startDate', customRange.start);
        params.append('endDate', customRange.end);
      }
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (sortBy) {
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
      }
      const res = await apiFetch(`/admin/activity?${params.toString()}`);
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchLogs();
  }, [page, limit, module, timeRange, customRange, debouncedSearch, sortBy, sortOrder]);

  const getActionStyle = (action: string) => {
    if (action.includes('DELETE') || action.includes('REJECT') || action.includes('REVOKE')) return 'bg-rose-100 text-rose-700';
    if (action.includes('APPROVE') || action.includes('CREATE') || action.includes('AUTHENTICATE')) return 'bg-emerald-100 text-emerald-700';
    if (action.includes('UPDATE') || action.includes('REASSIGN')) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => {
    const isActive = sortBy === field;
    return (
      <div className="flex items-center ml-1">
        <ArrowDown size={14} className={`${isActive && sortOrder === 'desc' ? 'text-gray-900' : 'text-gray-300'}`} />
        <ArrowUp size={14} className={`-ml-1 ${isActive && sortOrder === 'asc' ? 'text-gray-900' : 'text-gray-300'}`} />
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* --- HEADER & FILTERS --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">System Activity Audit</h1>
           <p className="text-gray-500 text-sm mt-1">Chronological secure logs of all administrative team movements.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex items-center bg-white border border-gray-200 rounded-lg shadow-sm focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-300 transition-all w-full md:w-64">
              <div className="pl-3 pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, module, action..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-2 pr-3 py-1.5 text-sm font-medium text-gray-700 outline-none bg-transparent"
              />
            </div>

           {/* Date Range Selector */}
            <div className="relative flex items-center bg-white border border-gray-200 rounded-lg shadow-sm focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-300 transition-all">
              <div className="pl-3 pointer-events-none">
                <Clock size={16} className="text-gray-400" />
              </div>
              <select 
                value={timeRange}
                onChange={(e) => { setTimeRange(e.target.value); setPage(1); }}
                className="w-full pl-2 pr-8 py-1.5 text-sm font-medium text-gray-700 outline-none bg-transparent appearance-none cursor-pointer"
              >
                <option value="ALL">Lifetime</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="weekly">Last 7 Days</option>
                <option value="monthly">Last 30 Days</option>
                <option value="yearly">Last 12 Months</option>
                <option value="custom">Custom Range</option>
              </select>
              <div className="absolute right-3 pointer-events-none">
                 <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>

            {timeRange === 'custom' && (
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                  <input 
                    type="date" 
                    className="text-sm text-gray-700 outline-none bg-transparent"
                    onChange={(e) => { setCustomRange(prev => ({ ...prev, start: e.target.value })); setPage(1); }}
                  />
                  <span className="text-sm text-gray-400">to</span>
                  <input 
                    type="date" 
                    className="text-sm text-gray-700 outline-none bg-transparent"
                    onChange={(e) => { setCustomRange(prev => ({ ...prev, end: e.target.value })); setPage(1); }}
                  />
              </div>
            )}




        </div>
      </div>



      {/* --- ACTIVITY TABLE --- */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                 <thead className="bg-gray-50/50 border-b border-gray-200">
                    <tr>
                       <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('createdAt')}>
                         <div className="flex items-center gap-1">Time Trace <SortIcon field="createdAt" /></div>
                       </th>
                       <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Team Member
                       </th>
                       <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Module
                       </th>
                       <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                         Execution
                       </th>
                       <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider w-full">Transaction Details</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                    {loading ? (
                       [...Array(6)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                             <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                             <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                             <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                             <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                             <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-64"></div></td>
                          </tr>
                       ))
                    ) : logs.length > 0 ? (
                       logs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                             {/* Time Trace */}
                             <td className="px-6 py-4">
                                <div className="flex flex-col">
                                   <span className="text-sm font-medium text-gray-900">{format(new Date(log.createdAt), 'MMM dd, yyyy')}</span>
                                   <span className="text-xs text-gray-500 mt-0.5">{format(new Date(log.createdAt), 'hh:mm a')}</span>
                                </div>
                             </td>

                             {/* Team Member */}
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 shrink-0 overflow-hidden">
                                      {log.user.avatar ? (
                                        <img src={log.user.avatar} alt={log.user.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <User size={16} />
                                      )}
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-sm font-medium text-gray-900 capitalize">{log.user.name}</span>
                                      <span className="text-xs text-gray-500 mt-0.5 capitalize">{log.user.role.toLowerCase().replace('_', ' ')}</span>
                                   </div>
                                </div>
                             </td>

                             {/* Module */}
                             <td className="px-6 py-4">
                                <span className="text-sm font-medium text-gray-700 capitalize">{log.module.toLowerCase()}</span>
                             </td>

                             {/* Execution */}
                             <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${getActionStyle(log.action)}`}>
                                   {log.action.replace(/_/g, ' ').toLowerCase()}
                                </span>
                             </td>

                             {/* Transaction Details */}
                             <td className="px-6 py-4 whitespace-normal min-w-[300px]">
                                 <p className="text-sm text-gray-600 leading-relaxed">
                                    {formatUserFriendlyDetails(log.details || 'Administrative movement logged and verified successfully.')}
                                 </p>
                             </td>
                          </tr>
                       ))
                    ) : (
                       <tr>
                          <td colSpan={5} className="px-6 py-20 text-center">
                             <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                             <h3 className="text-sm font-semibold text-gray-900">No activity logs found</h3>
                             <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or time range.</p>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
          </div>

          {/* --- PAGINATION FOOTER --- */}
          {!loading && logs.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium text-gray-900">{((page - 1) * limit) + 1}</span> to <span className="font-medium text-gray-900">{Math.min(page * limit, total)}</span> of <span className="font-medium text-gray-900">{total}</span> entries
                </p>

                <div className="flex items-center gap-4">
                  <select 
                    value={limit}
                    onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                    className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 outline-none focus:border-gray-300"
                  >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                  </select>

                  <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="text-sm font-medium text-gray-700 px-3">Page {page}</span>
                      <button 
                        onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}
                        disabled={page >= Math.ceil(total / limit)}
                        className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <ChevronRight size={18} />
                      </button>
                  </div>
                </div>
            </div>
          )}
      </div>
    </div>
  );
}


