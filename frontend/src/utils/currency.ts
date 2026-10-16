// Currency & Geo-Localization Utilities for Aura Career Engine
import { useState, useEffect } from 'react';

export type CurrencyType = 'INR' | 'USD';

const CURRENCY_STORAGE_KEY = 'aura_preferred_currency';

export function getInitialCurrency(): CurrencyType {
  try {
    const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (saved === 'INR' || saved === 'USD') {
      return saved;
    }
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    if (
      tz.includes('Kolkata') ||
      tz.includes('Calcutta') ||
      lang.includes('IN') ||
      lang.includes('hi')
    ) {
      return 'INR';
    }
  } catch (e) {
    // fallback
  }
  return 'INR'; // Default to INR for Indian market beta testers
}

// Global listener for currency change across tabs & components
const listeners = new Set<(c: CurrencyType) => void>();

export function setPreferredCurrency(c: CurrencyType) {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, c);
  } catch (e) {}
  listeners.forEach((fn) => fn(c));
}

export function useCurrency(): [CurrencyType, (c: CurrencyType) => void] {
  const [currency, setCurrencyState] = useState<CurrencyType>(getInitialCurrency);

  useEffect(() => {
    const handler = (newC: CurrencyType) => setCurrencyState(newC);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const updateCurrency = (newC: CurrencyType) => {
    setPreferredCurrency(newC);
  };

  return [currency, updateCurrency];
}

/**
 * Converts or translates compensation strings into target currency.
 * Handles both predefined Indian bands (Lakhs/Crores) and USD ($k / $M).
 */
export function formatCompensation(comp: string | undefined | null, currency: CurrencyType): string {
  if (!comp) return '';
  const text = comp.trim();

  if (currency === 'INR') {
    // If it's already in INR format (contains ₹ or L or LPA)
    if (text.includes('₹') || text.toLowerCase().includes('lpa') || text.toLowerCase().includes('lakh')) {
      return text;
    }

    // Map common USD ranges to standard Indian market compensation bands
    const clean = text.toLowerCase();
    if (clean.includes('65k') || clean.includes('78k') || clean.includes('70k') || clean.includes('50k')) {
      return '₹6L – ₹10L';
    }
    if (clean.includes('80k') || clean.includes('95k') || clean.includes('85k')) {
      return '₹10L – ₹15L';
    }
    if (clean.includes('110k') || clean.includes('135k') || clean.includes('120k') || clean.includes('130k')) {
      return '₹16L – ₹24L';
    }
    if (clean.includes('150k') || clean.includes('180k') || clean.includes('160k') || clean.includes('175k')) {
      return '₹25L – ₹35L';
    }
    if (clean.includes('200k') || clean.includes('240k') || clean.includes('220k')) {
      return '₹35L – ₹50L';
    }
    if (clean.includes('280k') || clean.includes('340k') || clean.includes('300k') || clean.includes('350k') || clean.includes('1.85m')) {
      return '₹55L – ₹80L+';
    }

    // Generic number converter if starts with $
    const numMatches = text.match(/\$?(\d+)(k|m)?/gi);
    if (numMatches && numMatches.length > 0) {
      // Return localized Lakhs estimate
      return text.replace(/\$([0-9.]+)[kK]/g, (_, n) => `₹${(parseFloat(n) * 0.15).toFixed(1)}L`)
                 .replace(/\$([0-9.]+)[mM]/g, (_, n) => `₹${(parseFloat(n) * 1.5).toFixed(1)}Cr`);
    }

    return text.replace('$', '₹');
  } else {
    // USD requested
    if (text.includes('$')) {
      return text;
    }
    // Convert ₹ Lakhs to USD
    if (text.includes('₹') || text.toLowerCase().includes('l')) {
      return text.replace(/₹\s*([0-9.]+)\s*L/gi, (_, n) => `$${Math.round(parseFloat(n) * 6.5)}k`)
                 .replace(/₹\s*([0-9.]+)\s*Cr/gi, (_, n) => `$${(parseFloat(n) * 0.65).toFixed(2)}M`);
    }
    return `$${text}`;
  }
}
