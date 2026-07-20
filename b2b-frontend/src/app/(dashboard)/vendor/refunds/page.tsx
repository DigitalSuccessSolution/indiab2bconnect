'use client';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  Briefcase, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  IndianRupee,
  Clock,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VendorRefunds() {
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    transactionId: '',
    amount: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/refunds/my-refunds');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (!formData.transactionId || !formData.amount || !formData.reason) {
         throw new Error('All fields are required');
      }

      await apiFetch('/refunds/request', {
        method: 'POST',
        body: JSON.stringify({
          transactionId: formData.transactionId,
          amount: parseFloat(formData.amount),
          reason: formData.reason
        })
      });
      
      setIsModalOpen(false);
      setFormData({ transactionId: '', amount: '', reason: '' });
      fetchRefunds();
      alert('Refund request submitted successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to submit refund request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-simple-fade pb-20 p-2 md:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100 max-w-7xl mx-auto">
        <div>
           <h1 className="text-2xl font-semibold text-slate-900  flex items-center gap-3">
             Refund Management
             <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
                <Briefcase className="w-5 h-5" />
             </div>
           </h1>
           <p className="text-slate-700 font-medium mt-1 text-sm">Track your refund requests and submit new disputes.</p>
        </div>

        <div className="flex items-center gap-3">
           <button onClick={fetchRefunds} className="p-2.5 bg-white border border-gray-200 rounded-lg text-slate-700 hover:text-[#164e33] hover:bg-[#164e33]/5 transition-all ">
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="px-6 py-2.5 bg-[#164e33] text-white rounded-lg font-semibold text-sm  hover:bg-[#113f29] transition-all  flex items-center gap-2"
           >
              <Plus className="w-4 h-4" /> Request Refund
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
         <div className="bg-white rounded-lg border border-gray-200 overflow-hidden ">
            <div className="overflow-x-auto w-full">
               <table className="w-full text-left min-w-[800px]">
               <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                     <th className="px-6 py-4 text-sm font-semibold text-slate-700 uppercase ">Date</th>
                     <th className="px-6 py-4 text-sm font-semibold text-slate-700 uppercase ">Transaction ID</th>
                     <th className="px-6 py-4 text-sm font-semibold text-slate-700 uppercase ">Amount</th>
                     <th className="px-6 py-4 text-sm font-semibold text-slate-700 uppercase ">Reason</th>
                     <th className="px-6 py-4 text-sm font-semibold text-slate-700 uppercase ">Status</th>
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
                           <td className="px-6 py-4 text-sm font-semibold text-slate-700 flex items-center gap-2">
                             <Clock className="w-3.5 h-3.5" />
                             {new Date(refund.createdAt).toLocaleDateString()}
                           </td>
                           <td className="px-6 py-4 text-sm font-semibold text-[#164e33]">
                             {refund.transactionId.substring(0, 12)}...
                           </td>
                           <td className="px-6 py-4">
                              <span className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                                <IndianRupee className="w-3.5 h-3.5 text-slate-700" />
                                {refund.amount.toLocaleString()}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-sm font-medium text-slate-700 max-w-[200px] truncate">
                             {refund.reason}
                           </td>
                           <td className="px-6 py-4">
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
                           </td>
                        </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan={5} className="py-24 text-center">
                           <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                           <p className="text-sm font-semibold text-slate-700">No refunds requested yet.</p>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg  w-full max-w-lg overflow-hidden border border-gray-100"
            >
              <div className="p-8 pb-6 border-b border-gray-50 flex justify-between items-center">
                 <h2 className="text-lg font-semibold text-slate-900">Request Refund</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-700 hover:text-slate-800 transition-colors">
                    <XCircle className="w-6 h-6" />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 {error && (
                    <div className="p-3 bg-rose-50 rounded-lg text-rose-600 text-sm font-semibold border border-rose-100">
                       {error}
                    </div>
                 )}

                 <div className="space-y-4">
                    <div>
                       <label className="text-sm font-semibold text-slate-700 uppercase  pl-1">Transaction ID</label>
                       <input 
                         required
                         type="text"
                         value={formData.transactionId}
                         onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                         className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
                         placeholder="Enter Txn ID"
                       />
                    </div>
                    <div>
                       <label className="text-sm font-semibold text-slate-700 uppercase  pl-1">Requested Amount (₹)</label>
                       <input 
                         required
                         type="number"
                         min="1"
                         value={formData.amount}
                         onChange={(e) => setFormData({...formData, amount: e.target.value})}
                         className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all"
                         placeholder="e.g. 5000"
                       />
                    </div>
                    <div>
                       <label className="text-sm font-semibold text-slate-700 uppercase  pl-1">Reason for Refund</label>
                       <textarea 
                         required
                         rows={4}
                         value={formData.reason}
                         onChange={(e) => setFormData({...formData, reason: e.target.value})}
                         className="w-full mt-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white text-sm font-medium transition-all resize-none"
                         placeholder="Please explain why you are requesting a refund..."
                       />
                    </div>
                 </div>

                 <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-3 font-semibold text-slate-700 hover:text-slate-900 transition-colors text-sm rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="px-8 py-3 bg-[#164e33] hover:bg-[#113f29] text-white font-semibold  rounded-lg  transition-all disabled:opacity-50 text-sm"
                    >
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                 </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
}



