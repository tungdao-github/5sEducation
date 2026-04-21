/**
 * Utility Functions
 * Comprehensive collection of helper functions
 */

import type { ID, Currency } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// String Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate slug from string
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, length: number, suffix: string = '...'): string => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
};

/**
 * Capitalize first letter
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Title case conversion
 */
export const titleCase = (text: string): string => {
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

/**
 * Generate random string
 */
export const randomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Extract initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

// ─────────────────────────────────────────────────────────────────────────────
// Number & Currency Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format currency
 */
export const formatCurrency = (
  amount: number,
  currency: Currency = 'VND',
  locale: string = 'vi-VN'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(amount);
};

/**
 * Format number with separators
 */
export const formatNumber = (num: number, locale: string = 'vi-VN'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercentage = (original: number, current: number): number => {
  if (original === 0) return 0;
  return Math.round(((original - current) / original) * 100);
};

/**
 * Clamp number between min and max
 */
export const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

/**
 * Round to decimal places
 */
export const roundTo = (num: number, decimals: number = 2): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

// ─────────────────────────────────────────────────────────────────────────────
// Date & Time Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format date
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' | 'full' = 'short',
  locale: string = 'vi-VN'
): string => {
  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
  }[format];

  return new Intl.DateTimeFormat(locale, options).format(d);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: string | Date, locale: string = 'vi-VN'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'vừa xong';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} tuần trước`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
  return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
};

/**
 * Check if date is today
 */
export const isToday = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

/**
 * Check if date is in past
 */
export const isPast = (date: string | Date): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
};

/**
 * Add days to date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Get date range
 */
export const getDateRange = (
  range: 'today' | 'week' | 'month' | 'year'
): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return { start, end };
};

// ─────────────────────────────────────────────────────────────────────────────
// Array Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Chunk array into smaller arrays
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, index) =>
    array.slice(index * size, index * size + size)
  );
};

/**
 * Shuffle array
 */
export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

/**
 * Remove duplicates from array
 */
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array));
};

/**
 * Group array by key
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey]!.push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
};

/**
 * Sort array by key
 */
export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Object Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Pick properties from object
 */
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  return keys.reduce(
    (result, key) => {
      if (key in obj) {
        result[key] = obj[key];
      }
      return result;
    },
    {} as Pick<T, K>
  );
};

/**
 * Omit properties from object
 */
export const omit = <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

/**
 * Merge objects deeply
 */
export const deepMerge = <T extends object>(target: T, ...sources: Partial<T>[]): T => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (source) {
    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        Object.assign(source[key]!, deepMerge(target[key] as object, source[key] as object));
      }
    }
    Object.assign(target, source);
  }

  return deepMerge(target, ...sources);
};

// ─────────────────────────────────────────────────────────────────────────────
// Validation Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate email
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate Vietnamese phone number
 */
export const isValidPhone = (phone: string): boolean => {
  const re = /^(0|\+84)[0-9]{9,10}$/;
  return re.test(phone);
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate credit card (Luhn algorithm)
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]!);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// File & Upload Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Check file type
 */
export const isImageFile = (filename: string): boolean => {
  const ext = getFileExtension(filename).toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
};

// ─────────────────────────────────────────────────────────────────────────────
// Color Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate random color
 */
export const randomColor = (): string => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

/**
 * Lighten/Darken color
 */
export const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
};

// ─────────────────────────────────────────────────────────────────────────────
// Local Storage Utilities with Expiry
// ─────────────────────────────────────────────────────────────────────────────

interface StorageItem<T> {
  value: T;
  expiry?: number;
}

export const storage = {
  set: <T>(key: string, value: T, ttl?: number): void => {
    const item: StorageItem<T> = {
      value,
      expiry: ttl ? Date.now() + ttl : undefined,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get: <T>(key: string): T | null => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item: StorageItem<T> = JSON.parse(itemStr);
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return item.value;
    } catch {
      return null;
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Async Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sleep/delay function
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry async function
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await sleep(delay);
    return retry(fn, retries - 1, delay * 2);
  }
};

/**
 * Timeout promise
 */
export const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
  ]);
};
