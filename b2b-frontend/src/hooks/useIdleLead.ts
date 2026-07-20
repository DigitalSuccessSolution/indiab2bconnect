import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface IdleLeadData {
  buyerName?: string;
  phone?: string;
  city?: string;
  categoryId?: string;
  searchKeyword?: string;
  message?: string;
}

export function useIdleLead(leadData: IdleLeadData, timeoutMs: number = 20000) {
  const [showIdlePopup, setShowIdlePopup] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const firedRef = useRef<boolean>(false);
  const dataRef = useRef(leadData);

  useEffect(() => {
    dataRef.current = leadData;
  }, [leadData]);

  useEffect(() => {
    if (firedRef.current) return;

    const fireIdleLead = async () => {
      if (firedRef.current) return;
      const data = dataRef.current;
      // Backend strictly requires categoryId to save a lead
      if (!data.categoryId) return;

      firedRef.current = true; // Mark as fired so it doesn't trigger again

      // If user is already logged in (has phone), log silently
      if (data.phone && data.phone !== 'N/A') {
        try {
          const payload: any = {
            buyerName: data.buyerName || 'Registered User',
            phone: data.phone,
            city: data.city || 'Unknown',
            message: data.message || 'System detected active registered user exploring products.',
          };
          if (data.categoryId) payload.categoryId = data.categoryId;
          if (data.searchKeyword) payload.searchKeyword = data.searchKeyword;

          await apiFetch('/leads/idle', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          console.log('[IdleLead] Successfully logged active registered visitor.');
        } catch (err) {
          console.error('[IdleLead] Failed to log active lead:', err);
        }
      } else {
        // Not logged in -> Show Popup
        setShowIdlePopup(true);
      }
    };

    // 1. Time on Page Trigger
    timeoutRef.current = setTimeout(fireIdleLead, timeoutMs);

    // 2. Scroll Depth Trigger
    const handleScroll = () => {
      if (firedRef.current) return;
      
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      
      const scrollPercent = scrollY / (docHeight - winHeight);
      
      if (scrollPercent > 0.5) { // If scrolled more than 50%
        fireIdleLead();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [timeoutMs]);

  const submitIdlePopup = async (phone: string, name: string) => {
    const data = dataRef.current;
    try {
      const payload: any = {
        buyerName: name || 'Guest User',
        phone: phone,
        city: data.city || 'Unknown',
        message: data.message || `Guest submitted info after idle prompt while looking at ${data.searchKeyword || 'products'}`,
      };
      if (data.categoryId) payload.categoryId = data.categoryId;
      if (data.searchKeyword) payload.searchKeyword = data.searchKeyword;

      await apiFetch('/leads/idle', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setShowIdlePopup(false);
      return true;
    } catch (err) {
      console.error('[IdleLead] Failed to log popup lead:', err);
      return false;
    }
  };

  return { showIdlePopup, setShowIdlePopup, submitIdlePopup };
}
