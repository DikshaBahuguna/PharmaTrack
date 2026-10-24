/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'seller';

export interface Person {
  phone: string; // Primary key (Phone no)
  password: string;
  name: string;
  type: UserRole; // 'admin' | 'seller'
  createdAt?: string;
}

export interface InfoItem {
  // Primary key: CDCI Code + expiry date (e.g., DDMMYYYYcode: first 8 chars are expiry date DDMMYYYY and remaining characters are CDCI code)
  cdciExpiryKey: string;
  drugLicenseNo: string; // Drug manufacturing license number
  batchCode: string; // Batch code
  expiryDate: string; // YYYY-MM-DD
  cdciCode: string; // CDCI Code
  medicineName: string; // Medicine name
  category?: string;
  createdAt: string;
}

export interface ThresholdItem {
  cdciCode: string; // Foreign key / Group key
  medicineName: string;
  thresholdAmount: number; // min amount of stock that should always be available for a medicine (fixed number)
  totalUnitsAvailable: number; // total units of a medicine actually available (computed across all active batches)
}

export interface StockItem {
  cdciExpiryKey: string; // Foreign key to Info table PK (CDCI Code + expiry date)
  unitsAvailable: number; // Units available
  lastUpdatedAt: string;
}

export type UpdateActionType =
  | 'STOCK_SOLD'
  | 'STOCK_ADDED'
  | 'STOCK_REMOVED_MANUAL'
  | 'STOCK_EXPIRED_REMOVED';

export interface UpdateRecord {
  id: string;
  date: string; // Date of update
  updaterPhone: string; // Admin/Seller phone no. who updated
  updaterName: string; // Name of Admin/Seller who updated
  updaterRole: UserRole;
  cdciExpiryKey: string; // CDCI Code + expiry date (Foreign Key)
  medicineName: string;
  actionType: UpdateActionType;
  amountRemovedOrSold: number; // Amount of stock removed expired/sold or added
  notes: string;
}

export type ExpiryAlertStatus =
  | 'active_alert' // Unchecked in Checklist 1 (Pending physical removal by seller)
  | 'under_review' // Checked by seller in Checklist 1 -> now in Checklist 2 (Awaiting admin approval)
  | 'approved_deleted'; // Approved by admin -> physically deleted from Info & Stock tables

export type ExpiryUrgency = 'expired' | 'two_weeks' | 'two_months';

export interface ExpiryAlertItem {
  id: string; // unique ID or cdciExpiryKey
  cdciExpiryKey: string;
  medicineName: string;
  batchCode: string;
  expiryDate: string;
  cdciCode: string;
  drugLicenseNo: string;
  unitsAvailable: number;
  status: ExpiryAlertStatus;
  urgency: ExpiryUrgency; // 'expired' (Red) | 'two_weeks' (Orange) | 'two_months' (Yellow)
  daysRemaining: number;
  detectedAt: string;
  removedAt?: string;
  removedByPhone?: string;
  removedByName?: string;
  approvalNotes?: string;
}

export interface DeliveredStockItem {
  id: string;
  medicineName: string;
  cdciCode: string;
  expiryDate: string; // YYYY-MM-DD
  drugLicenseNo: string;
  batchCode: string;
  category?: string;
  unitsDelivered: number;
  sellerPhone: string;
  sellerName: string;
  deliveredAt: string;
  status: 'pending_admin_approval' | 'approved';
  adminNotes?: string;
  approvedAt?: string;
  approvedByPhone?: string;
  approvedByName?: string;
}
