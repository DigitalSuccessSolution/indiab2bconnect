'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('information-collection');

  const sections = [
    {
      id: 'information-collection',
      title: '1. Information Collection',
      content: (
        <>
          <p className="mb-4">At B2B Connect India, we collect information to provide better services to all our users. The types of information we collect include:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><span className="font-semibold text-gray-800">Business Identity Data:</span> Company name, GSTIN, business registration documents, and trade licenses required for verification.</li>
            <li><span className="font-semibold text-gray-800">Contact Information:</span> Professional email addresses, phone numbers, and physical business addresses.</li>
            <li><span className="font-semibold text-gray-800">Transaction & Usage Data:</span> Logs of your interactions with the platform, search queries, buyer-seller communications, and transaction histories.</li>
            <li><span className="font-semibold text-gray-800">Device and Technical Data:</span> Information about the device you use to access our platform, including IP address, browser type, and operating system.</li>
          </ul>
        </>
      )
    },
    {
      id: 'use-of-information',
      title: '2. Use of Information',
      content: (
        <>
          <p className="mb-4">We use the information we collect for the following operational and business purposes:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>To verify business authenticity and maintain a trusted B2B environment.</li>
            <li>To optimize lead matching and connect relevant buyers with suppliers.</li>
            <li>To process payments and generate invoices for premium services.</li>
            <li>To improve our platform's algorithms, security, and overall user experience.</li>
            <li>To communicate administrative notices, updates, and promotional offers relevant to your industry.</li>
          </ul>
        </>
      )
    },
    {
      id: 'cookies-tracking',
      title: '3. Cookies & Tracking',
      content: (
        <p className="mb-4">We use cookies, web beacons, and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.</p>
      )
    },
    {
      id: 'data-sharing',
      title: '4. Data Sharing & Disclosure',
      content: (
        <>
          <p className="mb-4">We do not sell your personal or corporate data to third parties. Information is only shared under these circumstances:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><span className="font-semibold text-gray-800">With Trade Partners:</span> When you express interest in a product or send an inquiry, relevant contact details are shared with the respective vendor or buyer.</li>
            <li><span className="font-semibold text-gray-800">Service Providers:</span> We share data with trusted third-party services (e.g., cloud hosting, analytics, SMS gateways) that assist in operating our platform.</li>
            <li><span className="font-semibold text-gray-800">Legal Compliance:</span> We may disclose information if required by law, court order, or government regulations to protect our rights or the safety of our users.</li>
          </ul>
        </>
      )
    },
    {
      id: 'data-security',
      title: '5. Data Security',
      content: (
        <p className="mb-4">We implement industry-standard security measures including end-to-end encryption, secure socket layer (SSL) technology, and regular security audits to protect your data against unauthorized access, alteration, or destruction. We restrict access to personal information to our employees, contractors, and agents who need to know that information in order to process it for us, and who are subject to strict contractual confidentiality obligations.</p>
      )
    },
    {
      id: 'data-retention',
      title: '6. Data Retention',
      content: (
        <p className="mb-4">We will retain your corporate and personal data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your information to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.</p>
      )
    },
    {
      id: 'user-rights',
      title: '7. User Rights & Choices',
      content: (
        <p className="mb-4">You have the right to access, update, or delete your corporate profile information at any time through your dashboard. You may also opt out of promotional communications by clicking the "unsubscribe" link in our emails or contacting our support team directly. Please note that even if you opt out of promotional emails, we may still send you important administrative messages.</p>
      )
    },
    {
      id: 'policy-changes',
      title: '8. Changes to This Policy',
      content: (
        <p className="mb-4">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top. You are advised to review this Privacy Policy periodically for any changes.</p>
      )
    },
    {
      id: 'contact-us',
      title: '9. Contact Us',
      content: (
        <p className="mb-4">If you have any questions about this Privacy Policy or how we handle your data, please contact our Data Protection Officer at privacy@b2bconnectindia.com or call our support helpline.</p>
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
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-4">Privacy Policy</h1>
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
                Welcome to B2B Connect India. We are committed to protecting your privacy and ensuring that your personal and corporate information is handled in a safe and responsible manner. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
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
