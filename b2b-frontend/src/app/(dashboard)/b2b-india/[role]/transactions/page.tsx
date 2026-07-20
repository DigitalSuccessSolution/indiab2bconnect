'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import {
  CreditCard,
  Search,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Download,
  Building2,
  Calendar,
  Wallet,
  Receipt
} from 'lucide-react';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchVendor, setSearchVendor] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [timeRange, setTimeRange] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalRev: 0, pending: 0, count: 0 });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVendor);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchVendor]);

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, timeRange, debouncedSearch, page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let url = `/admin/transactions?page=${page}&limit=10`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
      if (timeRange !== 'ALL') url += `&timeRange=${timeRange}`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      
      const data = await apiFetch(url);
      const list = data.data?.transactions || [];
      setTransactions(list);
      setTotalPages(data.data?.totalPages || 1);
      
      // Use global stats returned from the backend aggregation
      setStats({ 
        totalRev: data.data?.totalRevenue || 0, 
        pending: data.data?.totalPending || 0, 
        count: data.data?.totalCount || 0
      });
      
    } catch (error) {
      console.error('Failed to fetch ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Filtered transactions are now directly the backend response since filtering is server-side
  const filteredTransactions = transactions;

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous Button
    buttons.push(
      <button
        key="prev"
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        className="px-2.5 py-1.5 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="sr-only">Previous</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
    );

    // Page 1
    if (startPage > 1) {
      buttons.push(
        <button key={1} onClick={() => setPage(1)} className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${page === 1 ? 'bg-[#164e33] text-white border-[#164e33]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>1</button>
      );
      if (startPage > 2) {
        buttons.push(<span key="ellipsis1" className="px-2 py-1.5 text-gray-400">...</span>);
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${page === i ? 'bg-[#164e33] text-white border-[#164e33]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
        >
          {i}
        </button>
      );
    }

    // Last Page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis2" className="px-2 py-1.5 text-gray-400">...</span>);
      }
      buttons.push(
        <button key={totalPages} onClick={() => setPage(totalPages)} className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors ${page === totalPages ? 'bg-[#164e33] text-white border-[#164e33]' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{totalPages}</button>
      );
    }

    // Next Button
    buttons.push(
      <button
        key="next"
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        className="px-2.5 py-1.5 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className="sr-only">Next</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    );

    return buttons;
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header & Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">Audit platform revenue and vendor subscriptions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search vendor..."
              value={searchVendor}
              onChange={(e) => setSearchVendor(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white border border-gray-300 rounded-md text-sm outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 hidden sm:flex">
             <select 
               value={timeRange}
               onChange={(e) => { setTimeRange(e.target.value); setPage(1); }}
               className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none transition-all shadow-sm font-medium text-gray-700 cursor-pointer"
             >
               <option value="ALL">All Time</option>
               <option value="today">Today</option>
               <option value="yesterday">Yesterday</option>
               <option value="weekly">Last 7 Days</option>
               <option value="monthly">Last 30 Days</option>
             </select>

             <div className="relative">
               <select 
                 value={statusFilter}
                 onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                 className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none transition-all shadow-sm font-medium text-gray-700 cursor-pointer"
               >
                 <option value="ALL">All Status</option>
                 <option value="COMPLETED">Completed</option>
                 <option value="PENDING">Pending</option>
                 <option value="FAILED">Failed</option>
               </select>
               <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
             </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter */}
      <div className="sm:hidden grid grid-cols-2 gap-2">
         <select 
           value={timeRange}
           onChange={(e) => { setTimeRange(e.target.value); setPage(1); }}
           className="w-full appearance-none px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm font-medium text-gray-700 cursor-pointer"
         >
           <option value="ALL">All Time</option>
           <option value="today">Today</option>
           <option value="yesterday">Yesterday</option>
           <option value="weekly">Last 7 Days</option>
           <option value="monthly">Last 30 Days</option>
         </select>
         <select 
           value={statusFilter}
           onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
           className="w-full appearance-none px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm font-medium text-gray-700 cursor-pointer"
         >
           <option value="ALL">All Status</option>
           <option value="COMPLETED">Completed</option>
           <option value="PENDING">Pending</option>
           <option value="FAILED">Failed</option>
         </select>
      </div>

      {/* Slim Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Volume', value: `₹${stats.totalRev.toLocaleString()}` },
          { label: 'Transactions', value: stats.count },
          { label: 'Pending Settlement', value: `₹${(stats.pending || 0).toLocaleString()}` }
        ].map((s, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{s.value}</h2>
          </div>
        ))}
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Method</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                // Skeleton Loader
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-6 py-4 text-right">
                       <div className="ml-auto h-5 bg-gray-200 rounded-full w-16"></div>
                    </td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <code className="text-sm font-mono font-medium text-gray-700">
                        {t.gatewayTransactionId || t.id.slice(0, 12)}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{t.vendor?.businessName || 'Unknown Vendor'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{t.vendor?.ownerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(t.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900">₹{t.amount?.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${getStatusColor(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                // Empty state
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3 border border-gray-100">
                      <Receipt className="w-5 h-5 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-900">No transactions found</h3>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 gap-4 sm:gap-0">
            <span className="text-sm text-gray-600">
              Showing <span className="font-medium text-gray-900">{(page - 1) * 10 + 1}</span> to <span className="font-medium text-gray-900">{Math.min(page * 10, stats.count)}</span> of <span className="font-medium text-gray-900">{stats.count}</span> results
            </span>
            <div className="flex items-center gap-1.5">
              {renderPaginationButtons()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



