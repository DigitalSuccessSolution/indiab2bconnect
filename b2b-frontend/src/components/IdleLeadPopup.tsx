import React, { useState } from 'react';
import { X, Search, Loader2 } from 'lucide-react';

interface IdleLeadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phone: string, name: string) => Promise<boolean>;
  searchKeyword?: string;
}

export default function IdleLeadPopup({ isOpen, onClose, onSubmit, searchKeyword }: IdleLeadPopupProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await onSubmit(phone, name);
    setLoading(false);
    if (success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="bg-emerald-50 px-6 py-8 text-center border-b border-emerald-100">
              <div className="w-16 h-16 bg-emerald-100 text-[#164e33] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Looking for {searchKeyword || 'Products'}?
              </h3>
              <p className="text-slate-600 text-sm">
                Enter your mobile number to get the best quotes from top verified suppliers instantly.
              </p>
            </div>

            {/* Form */}
            <div className="p-6">
              {success ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Request Sent!</h4>
                  <p className="text-slate-600">Top suppliers will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 font-semibold text-sm">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="flex-1 border border-gray-300 rounded-r-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-[#164e33] focus:ring-2 focus:ring-[#164e33]/10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Kumar"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-[#164e33] focus:ring-2 focus:ring-[#164e33]/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="w-full py-3 mt-2 bg-[#164e33] hover:bg-[#113f29] disabled:opacity-70 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Get Best Quotes
                  </button>
                  <p className="text-xs text-center text-slate-500 mt-3">
                    By submitting, you agree to our Terms and Privacy Policy.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
