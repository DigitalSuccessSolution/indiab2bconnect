'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [txnId, setTxnId] = useState<string | null>(null);

  useEffect(() => {
    // PhonePe redirects back with transactionId (or we can use our merchantTransactionId if we passed it in state/URL)
    const transactionId = searchParams.get('transactionId');

    if (transactionId) {
      verifyPayment(transactionId);
    } else {
      // If we don't have it in URL, check local storage from when they clicked subscribe
      const savedTxnId = localStorage.getItem('pendingTxnId');
      if (savedTxnId) {
        verifyPayment(savedTxnId);
      } else {
        setStatus('error');
        setMessage('Transaction ID not found. Please check your billing history.');
      }
    }
  }, [searchParams]);

  const verifyPayment = async (merchantTransactionId: string) => {
    try {
      const res = await apiFetch('/payments/verify', {
        method: 'POST',
        body: JSON.stringify({ merchantTransactionId }),
      });

      if (res.success) {
        const paymentStatus = res.data?.status;

        if (paymentStatus === 'PENDING') {
          setStatus('pending');
          setMessage('Your payment is currently pending with the bank. Please wait a few minutes while it processes.');
          setTxnId(merchantTransactionId);
        } else if (paymentStatus === 'FAILED') {
          setStatus('error');
          setMessage('Your payment failed or was declined. Please try again.');
          setTxnId(merchantTransactionId);
        } else {
          // Success
          setStatus('success');
          setInvoiceUrl(res.data?.invoiceUrl || null);
          setTxnId(merchantTransactionId);
          setMessage('Your payment was successful and your subscription is now active!');
          localStorage.removeItem('pendingTxnId');
        }
      } else {
        setStatus('error');
        setMessage(res.message || 'Payment verification failed.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'An error occurred while verifying the payment.');
    }
  };

  const handleDownloadInvoice = () => {
    if (!invoiceUrl) return;
    // Open the PDF in a new secure tab. 
    // The browser's native PDF viewer will perfectly render the document and allow downloading, avoiding all CORS/transformation issues.
    window.open(invoiceUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">

        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-[#164e33] animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h2>
            <p className="text-gray-500">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 mb-8 text-sm max-w-xs mx-auto">
              Your subscription has been upgraded successfully. You now have access to premium features.
            </p>

            <div className="w-full bg-gray-50 rounded-xl p-5 border border-gray-100 mb-8 text-left space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-semibold text-gray-900">{txnId || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Status</span>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">Paid</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold text-gray-900">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              {invoiceUrl && (
                <button
                  onClick={handleDownloadInvoice}
                  className="w-full flex items-center justify-center py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  Download Invoice
                </button>
              )}
              <a
                href="/vendor/billing"
                className="w-full flex items-center justify-center py-3.5 bg-[#164e33] text-white rounded-xl font-bold hover:bg-[#113a26] transition-all shadow-md"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-orange-50">
              <Clock className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Pending</h2>
            <p className="text-gray-500 mb-8 text-sm">{message}</p>
            <div className="w-full bg-orange-50 rounded-xl p-5 border border-orange-100 mb-8 text-left space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-orange-700">Transaction ID</span>
                <span className="font-semibold text-orange-900">{txnId || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-orange-700">Status</span>
                <span className="font-semibold text-orange-600 bg-white px-2.5 py-0.5 rounded-full border border-orange-200">Processing</span>
              </div>
            </div>
            <Link
              href="/vendor/billing"
              className="w-full flex items-center justify-center py-3.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-md"
            >
              Return to Billing
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-500 mb-8 text-sm">{message}</p>
            <Link
              href="/vendor/billing"
              className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center"
            >
              Return to Billing
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
