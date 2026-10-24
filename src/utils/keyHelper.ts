/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Generates the Primary Key for Info Table & Foreign Key for Stock/Updates
 * Format: DDMMYYYYcode (first 8 characters are expiry date and remaining characters are CDCI code)
 * Example: date 2026-10-24 and code PARA500 => 24102026PARA500
 */
export function formatCdciExpiryKey(expiryDateStr: string, cdciCode: string): string {
  // Supports YYYY-MM-DD or Date object
  const dateObj = new Date(expiryDateStr);
  let day = '';
  let month = '';
  let year = '';

  if (expiryDateStr.includes('-')) {
    const parts = expiryDateStr.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        year = parts[0];
        month = parts[1].padStart(2, '0');
        day = parts[2].padStart(2, '0');
      } else {
        // DD-MM-YYYY
        day = parts[0].padStart(2, '0');
        month = parts[1].padStart(2, '0');
        year = parts[2];
      }
    }
  } else if (!isNaN(dateObj.getTime())) {
    day = String(dateObj.getDate()).padStart(2, '0');
    month = String(dateObj.getMonth() + 1).padStart(2, '0');
    year = String(dateObj.getFullYear());
  } else {
    // fallback
    day = '01';
    month = '01';
    year = '2026';
  }

  const cleanCode = cdciCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${day}${month}${year}${cleanCode}`;
}

/**
 * Parses a DDMMYYYYcode primary key into its components
 */
export function parseCdciExpiryKey(key: string): {
  expiryDay: string;
  expiryMonth: string;
  expiryYear: string;
  formattedDate: string;
  isoDate: string;
  cdciCode: string;
} {
  if (!key || key.length < 9) {
    return {
      expiryDay: '',
      expiryMonth: '',
      expiryYear: '',
      formattedDate: 'N/A',
      isoDate: '',
      cdciCode: key || 'UNKNOWN',
    };
  }

  const day = key.slice(0, 2);
  const month = key.slice(2, 4);
  const year = key.slice(4, 8);
  const cdciCode = key.slice(8);

  return {
    expiryDay: day,
    expiryMonth: month,
    expiryYear: year,
    formattedDate: `${day}/${month}/${year}`,
    isoDate: `${year}-${month}-${day}`,
    cdciCode,
  };
}

/**
 * Checks if a given expiry date has expired relative to a reference date
 * Defaults to current environment date: 2026-10-24
 */
export function isExpired(expiryDateStr: string, referenceDateStr: string = '2026-10-24'): boolean {
  try {
    const expiry = new Date(expiryDateStr);
    const ref = new Date(referenceDateStr);
    // Strip time for exact date comparison
    expiry.setHours(0, 0, 0, 0);
    ref.setHours(0, 0, 0, 0);
    return expiry.getTime() <= ref.getTime();
  } catch {
    return false;
  }
}

/**
 * Returns difference in days between expiry and reference date
 */
export function getDaysUntilExpiry(expiryDateStr: string, referenceDateStr: string = '2026-10-24'): number {
  try {
    const expiry = new Date(expiryDateStr);
    const ref = new Date(referenceDateStr);
    expiry.setHours(0, 0, 0, 0);
    ref.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - ref.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Categorizes medicine batches into urgency levels:
 * - 'expired': <= 0 days (Red)
 * - 'two_weeks': 1 - 14 days (Orange)
 * - 'two_months': 15 - 60 days (Yellow)
 * - 'safe': > 60 days
 */
export function getExpiryCategory(expiryDateStr: string, referenceDateStr: string = '2026-10-24'): {
  urgency: 'expired' | 'two_weeks' | 'two_months' | 'safe';
  daysRemaining: number;
} {
  const days = getDaysUntilExpiry(expiryDateStr, referenceDateStr);
  if (days <= 0) {
    return { urgency: 'expired', daysRemaining: days };
  } else if (days <= 14) {
    return { urgency: 'two_weeks', daysRemaining: days };
  } else if (days <= 60) {
    return { urgency: 'two_months', daysRemaining: days };
  } else {
    return { urgency: 'safe', daysRemaining: days };
  }
}
