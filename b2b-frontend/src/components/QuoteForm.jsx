import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Mail, Handshake } from "lucide-react";

const QuoteForm = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query || !phone) return;
    router.push(
      `/post-requirement?q=${encodeURIComponent(query)}&phone=${encodeURIComponent(phone)}`,
    );
  };

  const steps = [
    {
      icon: <Send className="w-8 h-8 text-blue-400" />,
      label: "What are you looking for?",
      bgColor: "bg-[#164e33]/5",
    },
    {
      icon: <Mail className="w-8 h-8 text-teal-400" />,
      label: "Get quotes from top suppliers",
      bgColor: "bg-teal-50",
    },
    {
      icon: <Handshake className="w-8 h-8 text-purple-400" />,
      label: "Choose the best and close the deal",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <section className="w-full bg-white py-16">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Side: Marketing/Steps */}
          <div className="space-y-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 leading-tight">
              Get free quotes from <br className="hidden md:block" /> verified
              suppliers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-row sm:flex-col items-center sm:items-start text-left gap-4 group">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 ${step.bgColor} rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    {step.icon}
                  </div>
                  <p className="text-[14px] sm:text-sm md:text-base font-medium text-slate-800 leading-snug">
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Lead Form */}
          <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-6">
              Tell us what you need
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Name Input */}
              <div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What product or service do you need?"
                  className="w-full h-14 px-5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33] transition-all text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white shadow-sm"
                  required
                />
              </div>

              {/* Mobile Number Input Group */}
              <div className="flex shadow-sm rounded-lg">
                <div className="h-14 px-5 border border-slate-200 border-r-0 rounded-l-lg bg-slate-50/50 flex items-center text-slate-700 font-medium whitespace-nowrap shrink-0">
                  +91
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your mobile"
                  className="w-full h-14 px-5 border border-slate-200 rounded-r-lg focus:outline-none focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33] transition-all text-slate-800 placeholder-slate-400 bg-slate-50/50 focus:bg-white"
                  required
                />
              </div>

              {/* Submit Button aligned to the right */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-14 bg-[#E64600] hover:bg-[#CC3E00] text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  Get Free Quotes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteForm;
