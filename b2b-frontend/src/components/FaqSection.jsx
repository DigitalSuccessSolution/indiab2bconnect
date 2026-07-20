"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FaqSection = () => {
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  const faqData = [
    [
      {
        q: "How does B2B Community help my business?",
        a: "B2B Community connects you with millions of buyers, helping you generate leads and grow your brand visibility globally.",
      },
      {
        q: "How do I find verified partners?",
        a: "Our platform features verified badges for trusted vendors, allowing you to choose partners with confidence based on reviews and ratings.",
      },
      {
        q: "Is there a fee for creating a profile?",
        a: "You can start with a basic profile for free. We also offer premium listing options to help you stand out in competitive categories.",
      },
      {
        q: "Can I manage my inquiries on mobile?",
        a: "Yes, our platform is fully responsive and we offer a mobile app for real-time lead management.",
      },
    ],
    [
      {
        q: "How does billing work?",
        a: "Our billing is transparent and flexible. You can choose between various payment models based on your listing tier and lead generation needs.",
      },
      {
        q: "Can I share an individual app?",
        a: "Yes, our platform allows you to export and share specific service presentations or vendor profiles with your local teams.",
      },
      {
        q: "When should I use a new table vs. a view?",
        a: "New tables are best for distinct data types, while views allow you to filter and slice existing vendor data for specific project needs.",
      },
      {
        q: "How can I transfer data from one base to another?",
        a: "We provide easy-to-use export tools that allow you to download vendor analytics and re-upload them to your internal CRM systems.",
      },
    ],
  ];

  return (
    <section className="faq-section py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-left mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
            Frequently asked questions
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-x-8 gap-y-2">
          {faqData.map((column, colIndex) => (
            <div key={colIndex} className="flex-1 space-y-2">
              {column.map((faq, index) => {
                const faqIndex = colIndex * 4 + index;
                return (
                  <div
                    key={faqIndex}
                    className="bg-[#f9f9f9] rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setActiveFaqIndex(
                          activeFaqIndex === faqIndex ? null : faqIndex,
                        )
                      }
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100/50 transition-colors cursor-pointer"
                    >
                      <span className="text-base font-semibold text-slate-800">
                        {faq.q}
                      </span>
                      {activeFaqIndex === faqIndex ? (
                        <Minus className="w-5 h-5 text-slate-800" />
                      ) : (
                        <Plus className="w-5 h-5 text-slate-800" />
                      )}
                    </button>
                    <AnimatePresence>
                      {activeFaqIndex === faqIndex && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-5 text-slate-800 text-base leading-relaxed">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
