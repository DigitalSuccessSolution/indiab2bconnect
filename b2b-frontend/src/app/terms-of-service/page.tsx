'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState('acceptance');

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: (
        <p className="mb-4">By accessing, browsing, or using the B2B Connect India platform ("Platform"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use our services.</p>
      )
    },
    {
      id: 'user-responsibilities',
      title: '2. User Responsibilities & Account Security',
      content: (
        <>
          <p className="mb-4">As a registered buyer or supplier on our platform, you agree to the following:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><span className="font-semibold text-gray-800">Accuracy of Information:</span> You must provide accurate, current, and complete information regarding your business identity, registration (like GSTIN), and contact details.</li>
            <li><span className="font-semibold text-gray-800">Account Security:</span> You are responsible for safeguarding your login credentials and OTPs. You must immediately notify us of any unauthorized use of your account.</li>
            <li><span className="font-semibold text-gray-800">Prohibited Activities:</span> You shall not use the platform for any illegal activities, fraud, or misrepresentation of goods/services.</li>
            <li><span className="font-semibold text-gray-800">Compliance:</span> You agree to comply with all applicable local, state, national, and international laws and regulations regarding online conduct and acceptable content.</li>
          </ul>
        </>
      )
    },
    {
      id: 'platform-fees',
      title: '3. Platform Fees and Subscriptions',
      content: (
        <p className="mb-4">While basic registration and access may be free, certain premium features, lead access, and advanced analytics are subject to subscription fees. All payments are non-refundable unless otherwise explicitly stated. We reserve the right to modify our pricing structure at any time with prior notice to active subscribers.</p>
      )
    },
    {
      id: 'trade-conduct',
      title: '4. Platform Role & Trade Conduct',
      content: (
        <>
          <p className="mb-4">B2B Connect India acts merely as a facilitator for business-to-business discovery and communication.</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><span className="font-semibold text-gray-800">No Agency:</span> We are not a party to any contract, transaction, or dispute between buyers and sellers. We do not guarantee the quality, safety, or legality of the products listed.</li>
            <li><span className="font-semibold text-gray-800">Ethical Conduct:</span> All business interactions, negotiations, and communications facilitated through the platform must adhere to ethical trade practices.</li>
            <li><span className="font-semibold text-gray-800">Dispute Resolution:</span> Any disputes between buyers and sellers must be resolved independently. We do not offer mediation or arbitration services for trade disputes.</li>
          </ul>
        </>
      )
    },
    {
      id: 'intellectual-property',
      title: '5. Intellectual Property Rights',
      content: (
        <p className="mb-4">All content on this platform, including text, graphics, logos, icons, and software architecture, is the exclusive property of B2B Connect India or its content suppliers. Unauthorized copying, extraction, scraping, or reproduction of the platform's data or design is strictly prohibited and may result in legal action.</p>
      )
    },
    {
      id: 'user-content',
      title: '6. User Generated Content',
      content: (
        <p className="mb-4">By posting product listings, reviews, or other content on the platform, you grant B2B Connect India a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such content. You represent and warrant that you own or have the necessary rights to use and authorize the use of the content you submit.</p>
      )
    },
    {
      id: 'termination',
      title: '7. Termination and Suspension',
      content: (
        <p className="mb-4">We reserve the right to suspend or terminate your account and access to the platform immediately, without prior notice or liability, for any reason, including without limitation if you breach these Terms of Service. Upon termination, your right to use the platform will immediately cease.</p>
      )
    },
    {
      id: 'limitation-of-liability',
      title: '8. Limitation of Liability',
      content: (
        <p className="mb-4">To the maximum extent permitted by applicable law, B2B Connect India shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business goodwill, arising from your use of or inability to use the platform.</p>
      )
    },
    {
      id: 'governing-law',
      title: '9. Governing Law & Jurisdiction',
      content: (
        <p className="mb-4">These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these terms or platform usage shall be subject to the exclusive jurisdiction of the courts located in New Delhi, India.</p>
      )
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => document.getElementById(s.id));
      const currentScrollPos = window.scrollY + 200;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element && element.offsetTop <= currentScrollPos) {
          setActiveSection(element.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-4">Terms of Service</h1>
          <p className="text-gray-500 text-base">Effective Date: May 07, 2026</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-1/4 lg:sticky lg:top-32 hidden lg:block">
            <nav className="flex flex-col space-y-1 border-l-2 border-gray-200">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`pl-4 py-2 text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'text-[#164e33] border-l-2 -ml-[2px] border-[#164e33]'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="w-full lg:w-3/4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10 lg:p-12">
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="text-lg leading-relaxed mb-10 pb-10 border-b border-gray-100">
                Welcome to B2B Connect India. These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity, and B2B Connect India concerning your access to and use of our platform.
              </p>

              <div className="space-y-12">
                {sections.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-32">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">{section.title}</h2>
                    <div className="text-base leading-relaxed text-gray-600">
                      {section.content}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
