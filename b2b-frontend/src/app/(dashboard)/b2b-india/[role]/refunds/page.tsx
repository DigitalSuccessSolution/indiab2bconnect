'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  Briefcase, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  IndianRupee,
  Clock,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/refunds/admin/all');
      setRefunds(res.data?.refunds || []);
    } catch (err) {
      console.error('Failed to fetch refunds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to mark this refund as ${newStatus}?`)) return;

    try {
      await apiFetch(`/refunds/admin/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      fetchRefunds();
      alert(`Refund marked as ${newStatus}`);
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-simple-fade pb-20 p-2 md:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 max-w-7xl mx-auto">
        <div>
           <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-3">
             Refund Processing
             <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
                <Briefcase className="w-5 h-5" />
             </div>
           </h1>
           <p className="text-slate-700 font-medium mt-1 text-sm">Review, approve, or reject vendor refund requests globally.</p>
        </div>

        <button onClick={fetchRefunds} className="p-2.5 bg-white border border-gray-200 rounded-lg text-slate-700 hover:text-[#164e33] hover:bg-[#164e33]/5 transition-all ">
           <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
         <div className="bg-white rounded-lg border border-gray-200  relative w-full">
            <div className="overflow-x-auto w-full">
               <table className="w-full text-left whitespace-nowrap min-w-[800px]">
               <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                     <th className="px-6 py-4 text-sm font-semibold text-slate-700 uppercase ">Date / Vendor</th>
                     <th className="px-6 py-4 text-sm font-semibold text-slate-700 uppercase ">Transaction ID</th>
                     <th className="px-6 py-4 text-sm font-semibold text-slate-700 uppercase ">Amount</th>
                     <th className="px-6 py-4 text-sm font-semibold text-slate-700 uppercase ">Reason</th>
                     <th className="px-6 py-4 text-sm font-semibold text-slate-700 uppercase ">Status / Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {loading ? (
                     [1,2,3].map(i => (
                        <tr key={i} className="animate-pulse">
                           <td colSpan={5} className="px-6 py-8"><div className="h-10 bg-gray-50 rounded-lg"></div></td>
                        </tr>
                     ))
                  ) : refunds.length > 0 ? (
                     refunds.map((refund) => (
                        <tr key={refund.id} className="group hover:bg-gray-50/50 transition-colors">
                           <td className="px-6 py-4">
                             <div className="flex flex-col gap-1">
                               <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                                 <Clock className="w-3 h-3 text-slate-700" />
                                 {new Date(refund.createdAt).toLocaleDateString()}
                               </span>
                               <span className="text-sm font-semibold uppercase  text-slate-600">
                                 Vendor: {refund.vendorId}
                               </span>
                             </div>
                           </td>
                           <td className="px-6 py-4 text-sm font-semibold text-[#164e33]">
                             {refund.transactionId}
                           </td>
                           <td className="px-6 py-4">
                              <span className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                                <IndianRupee className="w-3.5 h-3.5 text-slate-700" />
                                {refund.amount.toLocaleString()}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-sm font-medium text-slate-700 max-w-[250px]">
                             {refund.reason}
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center justify-between gap-4">
                                 <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-semibold uppercase  ${
                                    refund.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                    refund.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                    'bg-rose-50 text-rose-700 border border-rose-100'
                                 }`}>
                                    {refund.status === 'PENDING' && <AlertCircle className="w-3 h-3" />}
                                    {refund.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                                    {refund.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                                    {refund.status}
                                 </div>

                                 {/* Admin Actions */}
                                 {refund.status === 'PENDING' && (
                                     <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                          title="Approve Refund"
                                          onClick={() => handleUpdateStatus(refund.id, 'APPROVED')}
                                          className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg border border-emerald-100 transition-colors"
                                        >
                                           <CheckCircle2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                          title="Reject Refund"
                                          onClick={() => handleUpdateStatus(refund.id, 'REJECTED')}
                                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-lg border border-rose-100 transition-colors"
                                        >
                                           <XCircle className="w-4 h-4" />
                                        </button>
                                     </div>
                                 )}
                              </div>
                           </td>
                        </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan={5} className="py-24 text-center">
                           <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                           <p className="text-sm font-semibold text-slate-700">No pending refunds.</p>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
            </div>
         </div>
      </div>
    </div>
  );
}



