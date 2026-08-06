import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone } from 'lucide-react';

interface DemandDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  leads: any[];
  loading: boolean;
  loadingMore?: boolean;
  total?: number;
  onLoadMore?: () => void;
}

export default function DemandDrawer({ isOpen, onClose, title, leads, loading, loadingMore = false, total = 0, onLoadMore }: DemandDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="relative bg-white shadow-2xl w-full max-w-2xl h-full flex flex-col z-10 will-change-transform"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">{title}</h2>
              <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-gray-100">Lead</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-gray-100">Category / Keyword</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-gray-100">Contact</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-gray-100">City</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      [1, 2, 3, 4, 5, 6].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded w-28"></div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </td>
                        </tr>
                      ))
                    ) : leads.length > 0 ? (
                      leads.map((lead: any) => (
                        <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2">
                            <div className="font-medium text-gray-900">{lead.buyerName || 'Unknown User'}</div>
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {lead.category?.name || 'No Category'}
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {lead.phone}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-gray-700 capitalize">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {lead.city || 'N/A'}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-10 px-4 text-gray-500">
                          No leads found for this selection.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {!loading && total > leads.length && (
                  <div className="flex justify-center p-6 border-t border-gray-100">
                    <button
                      onClick={onLoadMore}
                      disabled={loadingMore}
                      className="px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg shadow-sm transition-all text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </>
                      ) : (
                        'Load More Leads'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
