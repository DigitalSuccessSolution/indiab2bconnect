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
      icon: <Send className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-blue-500" />,
      label: "What are you looking for?",
      bgColor: "bg-blue-50",
    },
    {
      icon: <Mail className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-teal-500" />,
      label: "Get quotes from top suppliers",
      bgColor: "bg-teal-50",
    },
    {
      icon: <Handshake className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-purple-500" />,
      label: "Choose the best and close the deal",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <section className="w-full py-10 md:py-16">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          {/* Left Side: Marketing/Steps */}
          <div className="space-y-6 md:space-y-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
              Get free quotes from <br className="hidden md:block" /> verified
              suppliers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-row sm:flex-col items-center sm:items-start text-left gap-3 sm:gap-4 group">
                  <div
                    className={`w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 ${step.bgColor} rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    {step.icon}
                  </div>
                  <p className="text-[13px] sm:text-sm md:text-base font-medium text-slate-800 leading-snug">
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Lead Form */}
          <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-slate-900 mb-4 md:mb-6">
              Tell us what you need
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {/* Product Name Input */}
              <div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What product or service do you need?"
                  className="w-full h-12 md:h-14 px-4 md:px-5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33] transition-all text-[15px] md:text-base text-slate-800 placeholder-slate-400 bg-white"
                  required
                />
              </div>

              {/* Mobile Number Input Group */}
              <div className="flex rounded-lg">
                <div className="h-12 md:h-14 px-4 md:px-5 border border-slate-200 border-r-0 rounded-l-lg bg-white flex items-center text-[15px] md:text-base text-slate-700 font-medium whitespace-nowrap shrink-0">
                  +91
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your mobile"
                  className="w-full h-12 md:h-14 px-4 md:px-5 border border-slate-200 rounded-r-lg focus:outline-none focus:border-[#164e33] focus:ring-1 focus:ring-[#164e33] transition-all text-[15px] md:text-base text-slate-800 placeholder-slate-400 bg-white"
                  required
                />
              </div>

              {/* Submit Button aligned to the right */}
              <div className="pt-1 md:pt-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full md:w-auto h-12 md:h-14 px-10 bg-[#E64600] hover:bg-[#CC3E00] text-white font-medium rounded-lg transition-colors shadow-sm text-[15px] md:text-base"
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
