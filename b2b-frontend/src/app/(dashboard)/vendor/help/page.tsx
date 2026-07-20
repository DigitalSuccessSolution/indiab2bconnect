'use client';

import React from 'react';
import { Mail, Phone, MessageSquare, FileText, ChevronRight, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VendorHelpPage() {
    const faqs = [
        {
            question: "How do I edit my locked profile details?",
            answer: "Once your profile is Verified, critical fields like Business Name, GST, and Aadhaar are locked for security. If you need to update them due to a business change, please click the 'Open Ticket' button or email support with your new documents."
        },
        {
            question: "How do I add new products/services?",
            answer: "You can add new offerings by navigating to the 'Products & Services' tab in your dashboard sidebar and clicking 'Add Item'."
        },
        {
            question: "How can I improve my ranking in search results?",
            answer: "Ensure your profile is fully complete, respond to buyer leads quickly, and request your customers to leave verified reviews."
        }
    ];

    return (
        <div className="max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-[#164e33]" /> Help & Support
                </h1>
                <p className="text-gray-500 mt-1">Get assistance, find answers, or contact our support team.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Contact Options */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">Email Support</h3>
                        <p className="text-sm text-gray-600 mt-2 mb-4 leading-relaxed">
                            Need to change locked profile details or have a complex query? Email us anytime.
                        </p>
                        <a href="mailto:support@indiab2bconnect.com?subject=Profile Edit Request" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
                            support@indiab2bconnect.com <ChevronRight className="w-4 h-4 ml-1" />
                        </a>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <Phone className="w-6 h-6" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg">Call Us</h3>
                        <p className="text-sm text-gray-600 mt-2 mb-4 leading-relaxed">
                            Speak directly with our vendor success team for immediate assistance.
                        </p>
                        <a href="tel:18001234567" className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700">
                            1800-123-4567 <ChevronRight className="w-4 h-4 ml-1" />
                        </a>
                    </div>


                </div>

                {/* Right Column: FAQs */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                            <FileText className="w-5 h-5 text-gray-500" />
                            <h3 className="font-semibold text-gray-900 text-lg">Frequently Asked Questions</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="p-6 hover:bg-gray-50/50 transition-colors">
                                    <h4 className="text-base font-medium text-gray-900 mb-2">{faq.question}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-600">
                                Didn't find what you're looking for? <a href="#" className="text-emerald-600 font-medium hover:underline">View All Documentation</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
