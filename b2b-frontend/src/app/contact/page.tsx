'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Support',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      setFormSubmitted(true);
      setFormData({ name: '', email: '', subject: 'General Support', message: '' });
      setTimeout(() => setFormSubmitted(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans tracking-tight">
      
      {/* --- HERO SECTION --- */}
      <section className="pt-24 md:pt-32 pb-12 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full mb-6 border border-orange-100/50"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#E64600] animate-pulse" />
            <span className="text-xs font-medium text-[#E64600]">24/7 Support Desk</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-semibold text-slate-900 leading-tight"
          >
            Get in touch with our team
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-600 mt-5 max-w-2xl mx-auto text-base md:text-lg font-normal leading-relaxed"
          >
            Whether you have a question about our platform, need sourcing assistance, or want to partner with us, we're here to help.
          </motion.p>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-start max-w-6xl mx-auto">
            
            {/* LEFT: INFO */}
            <div className="lg:col-span-5 space-y-12">
              <div>
                <h2 className="text-2xl font-medium text-slate-900 mb-6">
                  Contact Information
                </h2>
                
                <div className="space-y-8">
                  {[
                    { icon: Mail, label: "Email Support", val: "support@b2bconnect.com", desc: "For general and technical inquiries" },
                    { icon: Phone, label: "Toll-Free Helpline", val: "+91 1800 123 4567", desc: "Available Mon-Sat, 9AM-7PM IST" },
                    { icon: MapPin, label: "Registered Office", val: "Sector 62, Noida, Uttar Pradesh, India", desc: "IndiaB2B Connect HQ" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 group">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-600 shrink-0 border border-slate-100 group-hover:bg-orange-50 group-hover:text-[#E64600] group-hover:border-orange-100 transition-colors duration-300">
                        <item.icon size={20} strokeWidth={1.5} />
                      </div>
                      <div className="pt-1">
                        <p className="text-sm font-medium text-slate-700 mb-0.5">{item.label}</p>
                        <p className="text-base font-semibold text-slate-900 mb-1">{item.val}</p>
                        <p className="text-sm text-slate-700">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: FORM */}
            <div className="lg:col-span-7">
              <div className="bg-white">
                <h2 className="text-2xl font-medium text-slate-900 mb-8">
                  Send us a message
                </h2>

                {formSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-2">
                      <CheckCircle2 size={32} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">Message Sent Successfully!</h3>
                    <p className="text-base text-slate-600 max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting us. Our support team will review your inquiry and get back to you shortly.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                        <input 
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-lg focus:border-slate-300 outline-none transition-all text-base text-slate-800 placeholder:text-slate-400" 
                          placeholder="John Doe" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email Address</label>
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-lg focus:border-slate-300 outline-none transition-all text-base text-slate-800 placeholder:text-slate-400" 
                          placeholder="name@company.com" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Inquiry Type</label>
                      <select 
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-lg focus:border-slate-300 outline-none transition-all text-base text-slate-800 cursor-pointer">
                        <option>General Support</option>
                        <option>Bulk Sourcing Requirement</option>
                        <option>Vendor Registration</option>
                        <option>Technical Issue</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Message</label>
                      <textarea 
                        rows={5} 
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-lg focus:border-slate-300 outline-none transition-all text-base text-slate-800 resize-none placeholder:text-slate-400" 
                        placeholder="How can we help you?" 
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-500 font-medium">{error}</p>
                    )}

                    <div className="pt-4">
                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full sm:w-auto px-8 py-3.5 bg-[#E64600] text-white rounded-lg font-medium text-base hover:bg-[#CC3E00] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {loading ? 'Sending...' : (
                          <>Send Message <Send size={16} /></>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
