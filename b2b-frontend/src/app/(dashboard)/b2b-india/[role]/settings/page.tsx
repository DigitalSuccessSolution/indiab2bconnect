'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { 
  Settings, 
  ShieldCheck, 
  Database, 
  Globe, 
  Lock, 
  Bell, 
  Mail, 
  Cloud, 
  Zap, 
  RefreshCcw, 
  Save, 
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sliders,
  CreditCard
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminSettings() {
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission('settings_update');

  const [activeTab, setActiveTab] = useState<'system' | 'auth' | 'notifications' | 'infrastructure' | 'website'>('website');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    rankingWeightProfile: 0.4,
    rankingWeightPerformance: 0.6,
    marketplaceId: 'B2B-INDIA-ROOT-01',
    hubName: 'Mumbai Central',
    alertVendorOnboarding: true,
    alertPaymentExceptions: true,
    alertInquirySpikes: false,
    cdnUrl: 'https://cdn.b2b-community.com/primary'
  });
  const [globalSettings, setGlobalSettings] = useState({
    websiteName: 'Admission Master',
    contactEmail: 'contact@example.com',
    contactPhone: '+91 0000000000',
    address: 'Your Address Here',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    youtubeUrl: '',
    googleAdSenseId: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const [adminData, globalData] = await Promise.all([
        apiFetch('/admin/settings'),
        apiFetch('/settings')
      ]);
      
      if (adminData?.data) {
        setSettings({
          ...settings,
          rankingWeightProfile: adminData.data.rankingWeightProfile,
          rankingWeightPerformance: adminData.data.rankingWeightPerformance,
          marketplaceId: adminData.data.marketplaceId || 'B2B-INDIA-ROOT-01',
          hubName: adminData.data.hubName || 'Mumbai Central',
          alertVendorOnboarding: adminData.data.alertVendorOnboarding ?? true,
          alertPaymentExceptions: adminData.data.alertPaymentExceptions ?? true,
          alertInquirySpikes: adminData.data.alertInquirySpikes ?? false,
          cdnUrl: adminData.data.cdnUrl || 'https://cdn.b2b-community.com/primary'
        });
      }
      if (globalData) {
        setGlobalSettings({
          ...globalSettings,
          ...globalData
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'website') {
        await apiFetch('/settings', {
          method: 'PUT',
          body: JSON.stringify(globalSettings)
        });
      } else {
        await apiFetch('/admin/settings', {
          method: 'PATCH',
          body: JSON.stringify(settings)
        });
      }
      Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Platform settings updated successfully.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Failed to update settings: ' + error.message
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="flex flex-col gap-2 pb-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-4 bg-gray-200 rounded w-96"></div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-64 shrink-0 space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-gray-200 rounded-md w-full"></div>
          ))}
        </div>
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-8">
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-40"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`space-y-2 ${i === 4 ? 'sm:col-span-2' : ''}`}>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-1 pb-4">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your platform configuration, integrations, and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="lg:w-64 shrink-0 space-y-1">
          {[
            { id: 'website', label: 'General Info', icon: Globe },
            { id: 'system', label: 'Ranking Config', icon: Sliders },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8">
              {activeTab === 'website' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Website Details</h3>
                    <p className="text-sm text-gray-500 mt-1">Basic information about your marketplace.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Website Name</label>
                      <input 
                        type="text" 
                        value={globalSettings.websiteName}
                        onChange={(e) => setGlobalSettings({...globalSettings, websiteName: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Contact Email</label>
                      <input 
                        type="email" 
                        value={globalSettings.contactEmail}
                        onChange={(e) => setGlobalSettings({...globalSettings, contactEmail: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">Contact Phone</label>
                      <input 
                        type="text" 
                        value={globalSettings.contactPhone}
                        onChange={(e) => setGlobalSettings({...globalSettings, contactPhone: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Address</label>
                      <input 
                        type="text" 
                        value={globalSettings.address}
                        onChange={(e) => setGlobalSettings({...globalSettings, address: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Social Links</h3>
                    <p className="text-sm text-gray-500 mt-1">Platform social media presence.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     {[
                       { id: 'facebookUrl', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
                       { id: 'twitterUrl', label: 'Twitter URL', placeholder: 'https://twitter.com/...' },
                       { id: 'instagramUrl', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
                       { id: 'linkedinUrl', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
                       { id: 'youtubeUrl', label: 'YouTube URL', placeholder: 'https://youtube.com/...' }
                     ].map((social) => (
                       <div key={social.id} className="space-y-1.5">
                         <label className="text-sm font-medium text-gray-700">{social.label}</label>
                         <input 
                           type="url" 
                           value={(globalSettings as any)[social.id] || ''}
                           onChange={(e) => setGlobalSettings({...globalSettings, [social.id]: e.target.value})}
                           className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all shadow-sm"
                           placeholder={social.placeholder}
                         />
                       </div>
                     ))}
                  </div>
                </div>
              )}
              {activeTab === 'system' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Algorithm Config</h3>
                    <p className="text-sm text-gray-500 mt-1">Adjust how vendors are scored and ranked in search results.</p>
                  </div>

                  <div className="space-y-8 max-w-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Profile Completeness Weight
                        </label>
                        <span className="text-sm font-semibold text-emerald-600">
                          {Math.round(settings.rankingWeightProfile * 100)}%
                        </span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.rankingWeightProfile}
                        onChange={(e) => setSettings({...settings, rankingWeightProfile: parseFloat(e.target.value)})}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 outline-none"
                      />
                      <p className="text-xs text-gray-500">
                        Importance of a fully filled profile (photos, verified GST, descriptions).
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Service Performance Weight
                        </label>
                        <span className="text-sm font-semibold text-emerald-600">
                          {Math.round(settings.rankingWeightPerformance * 100)}%
                        </span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.rankingWeightPerformance}
                        onChange={(e) => setSettings({...settings, rankingWeightPerformance: parseFloat(e.target.value)})}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 outline-none"
                      />
                      <p className="text-xs text-gray-500">
                        Influence of response times, lead conversion rates, and buyer satisfaction.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-md bg-amber-50 p-4 border border-amber-200/50 mt-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">Recalculation Required</h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>
                            Saving these changes will trigger a background update for all vendor listings. Rankings may fluctuate for a few minutes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Action Bar */}
            {canUpdate && (
              <div className="bg-gray-50 px-6 py-4 sm:px-8 border-t border-gray-200 flex justify-end items-center">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex justify-center items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



