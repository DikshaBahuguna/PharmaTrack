/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Person,
  InfoItem,
  StockItem,
  ThresholdItem,
  UpdateRecord,
  ExpiryAlertItem,
  DeliveredStockItem,
  UserRole,
} from '../types/database';
import { formatCdciExpiryKey, isExpired, getDaysUntilExpiry, getExpiryCategory } from '../utils/keyHelper';

const STORAGE_KEYS = {
  PERSONS: 'pharmatrack_persons_v1',
  INFO: 'pharmatrack_info_v1',
  STOCK: 'pharmatrack_stock_v1',
  THRESHOLDS: 'pharmatrack_thresholds_v1',
  UPDATES: 'pharmatrack_updates_v1',
  EXPIRY_WORKFLOW: 'pharmatrack_expiry_workflow_v1',
  DELIVERED_STOCK: 'pharmatrack_delivered_stock_v1',
  CURRENT_USER: 'pharmatrack_current_user_v1',
  SIM_DATE: 'pharmatrack_sim_date_v1',
};

// Initial Seed Data
const DEFAULT_SIMULATED_DATE = '2026-10-24'; // Matches runtime environment date

const SEED_PERSONS: Person[] = [
  {
    phone: '+919876543210',
    password: 'admin',
    name: 'Dr. Rajesh Sharma',
    type: 'admin',
    createdAt: '2026-01-10T08:00:00.000Z',
  },
  {
    phone: '+919876543220',
    password: 'seller',
    name: 'Amit Patel',
    type: 'seller',
    createdAt: '2026-02-15T09:30:00.000Z',
  },
  {
    phone: '+919876543221',
    password: 'seller',
    name: 'Priya Nair',
    type: 'seller',
    createdAt: '2026-03-01T10:15:00.000Z',
  },
];

const SEED_THRESHOLDS: Record<string, { medicineName: string; thresholdAmount: number }> = {
  AMOX500: { medicineName: 'Amoxicillin 500mg Capsules', thresholdAmount: 50 },
  DXM100: { medicineName: 'Cough Syrup Dextromethorphan 100ml', thresholdAmount: 30 },
  AZI500: { medicineName: 'Azithromycin 500mg Tablets', thresholdAmount: 60 },
  AMX250: { medicineName: 'Amoxicillin 250mg Oral Suspension', thresholdAmount: 30 },
  IBU400: { medicineName: 'Ibuprofen 400mg Anti-inflammatory Tablets', thresholdAmount: 30 },
  CIP500: { medicineName: 'Ciprofloxacin 500mg Antibiotic Tablets', thresholdAmount: 40 },
  PARA650: { medicineName: 'Paracetamol 650mg Tablets (Dolo)', thresholdAmount: 40 },
  MET500: { medicineName: 'Metformin 500mg Tablets (Glycomet)', thresholdAmount: 35 },
  CET10: { medicineName: 'Cetirizine 10mg Antihistamine Tablets', thresholdAmount: 25 },
};

const SEED_INFO: InfoItem[] = [
  {
    cdciExpiryKey: '20102026AMOX500', // Expired Oct 20, 2026 (4 days ago) -> RED
    drugLicenseNo: 'DL-2023-MFG-4120',
    batchCode: 'BCH-AMX-901',
    expiryDate: '2026-10-20',
    cdciCode: 'AMOX500',
    medicineName: 'Amoxicillin 500mg Capsules',
    category: 'Antibiotics',
    createdAt: '2026-04-10T10:00:00.000Z',
  },
  {
    cdciExpiryKey: '24102026DXM100', // Expires Today Oct 24, 2026 (0 days) -> RED
    drugLicenseNo: 'DL-2022-SYR-8901',
    batchCode: 'BCH-DXM-332',
    expiryDate: '2026-10-24',
    cdciCode: 'DXM100',
    medicineName: 'Cough Syrup Dextromethorphan 100ml',
    category: 'Respiratory',
    createdAt: '2026-05-12T11:20:00.000Z',
  },
  {
    cdciExpiryKey: '03112026IBU400', // Expires Nov 3, 2026 (10 days away, <= 14 days) -> ORANGE
    drugLicenseNo: 'DL-2023-TAB-7711',
    batchCode: 'BCH-IBU-552',
    expiryDate: '2026-11-03',
    cdciCode: 'IBU400',
    medicineName: 'Ibuprofen 400mg Anti-inflammatory Tablets',
    category: 'Analgesics',
    createdAt: '2026-05-10T10:00:00.000Z',
  },
  {
    cdciExpiryKey: '05122026CIP500', // Expires Dec 5, 2026 (42 days away, <= 60 days) -> YELLOW
    drugLicenseNo: 'DL-2024-TAB-3301',
    batchCode: 'BCH-CIP-410',
    expiryDate: '2026-12-05',
    cdciCode: 'CIP500',
    medicineName: 'Ciprofloxacin 500mg Antibiotic Tablets',
    category: 'Antibiotics',
    createdAt: '2026-06-12T14:00:00.000Z',
  },
  {
    cdciExpiryKey: '15042027AZI500', // Valid until 2027, Stock: 18, Threshold: 60 -> Deficit: 42 (Highest!)
    drugLicenseNo: 'DL-2024-TAB-1152',
    batchCode: 'BCH-AZI-604',
    expiryDate: '2027-04-15',
    cdciCode: 'AZI500',
    medicineName: 'Azithromycin 500mg Tablets',
    category: 'Antibiotics',
    createdAt: '2026-06-01T09:00:00.000Z',
  },
  {
    cdciExpiryKey: '10082027AMX250', // Valid until 2027, Stock: 8, Threshold: 30 -> Deficit: 22 (Second Highest!)
    drugLicenseNo: 'DL-2024-SYR-4412',
    batchCode: 'BCH-AMX-219',
    expiryDate: '2027-08-10',
    cdciCode: 'AMX250',
    medicineName: 'Amoxicillin 250mg Oral Suspension',
    category: 'Antibiotics',
    createdAt: '2026-07-01T09:00:00.000Z',
  },
  {
    cdciExpiryKey: '30082027PARA650', // Fresh batch
    drugLicenseNo: 'DL-2024-TAB-9901',
    batchCode: 'BCH-PAR-778',
    expiryDate: '2027-08-30',
    cdciCode: 'PARA650',
    medicineName: 'Paracetamol 650mg Tablets (Dolo)',
    category: 'Analgesics',
    createdAt: '2026-07-15T14:45:00.000Z',
  },
  {
    cdciExpiryKey: '12112027MET500', // Fresh batch
    drugLicenseNo: 'DL-2023-DIA-6623',
    batchCode: 'BCH-MET-542',
    expiryDate: '2027-11-12',
    cdciCode: 'MET500',
    medicineName: 'Metformin 500mg Tablets (Glycomet)',
    category: 'Diabetes',
    createdAt: '2026-08-20T16:10:00.000Z',
  },
  {
    cdciExpiryKey: '15102026CET10', // Expired Oct 15 2026 - Already physically removed by seller, awaiting admin approval
    drugLicenseNo: 'DL-2024-ALL-3310',
    batchCode: 'BCH-CET-109',
    expiryDate: '2026-10-15',
    cdciCode: 'CET10',
    medicineName: 'Cetirizine 10mg Antihistamine Tablets',
    category: 'Allergy',
    createdAt: '2026-03-15T12:00:00.000Z',
  },
];

const SEED_STOCK: StockItem[] = [
  { cdciExpiryKey: '20102026AMOX500', unitsAvailable: 45, lastUpdatedAt: '2026-10-15T09:00:00.000Z' },
  { cdciExpiryKey: '24102026DXM100', unitsAvailable: 22, lastUpdatedAt: '2026-10-20T11:00:00.000Z' },
  { cdciExpiryKey: '03112026IBU400', unitsAvailable: 35, lastUpdatedAt: '2026-10-18T10:00:00.000Z' },
  { cdciExpiryKey: '05122026CIP500', unitsAvailable: 50, lastUpdatedAt: '2026-10-19T11:00:00.000Z' },
  { cdciExpiryKey: '15042027AZI500', unitsAvailable: 18, lastUpdatedAt: '2026-10-22T14:30:00.000Z' }, // 18 < threshold (60), Deficit: 42
  { cdciExpiryKey: '10082027AMX250', unitsAvailable: 8, lastUpdatedAt: '2026-10-21T12:00:00.000Z' }, // 8 < threshold (30), Deficit: 22
  { cdciExpiryKey: '30082027PARA650', unitsAvailable: 120, lastUpdatedAt: '2026-10-21T10:00:00.000Z' },
  { cdciExpiryKey: '12112027MET500', unitsAvailable: 95, lastUpdatedAt: '2026-10-18T13:20:00.000Z' },
  { cdciExpiryKey: '15102026CET10', unitsAvailable: 30, lastUpdatedAt: '2026-10-23T16:00:00.000Z' },
];

const SEED_UPDATES: UpdateRecord[] = [
  {
    id: 'upd-001',
    date: '2026-10-23T15:30:00.000Z',
    updaterPhone: '+919876543220',
    updaterName: 'Amit Patel',
    updaterRole: 'seller',
    cdciExpiryKey: '30082027PARA650',
    medicineName: 'Paracetamol 650mg Tablets (Dolo)',
    actionType: 'STOCK_SOLD',
    amountRemovedOrSold: 15,
    notes: 'Prescription sale counter #1 (Customer #8921)',
  },
  {
    id: 'upd-002',
    date: '2026-10-22T11:15:00.000Z',
    updaterPhone: '+919876543210',
    updaterName: 'Dr. Rajesh Sharma',
    updaterRole: 'admin',
    cdciExpiryKey: '12112027MET500',
    medicineName: 'Metformin 500mg Tablets (Glycomet)',
    actionType: 'STOCK_ADDED',
    amountRemovedOrSold: 50,
    notes: 'Direct distributor intake from SunPharma Logistics',
  },
  {
    id: 'upd-003',
    date: '2026-10-21T17:40:00.000Z',
    updaterPhone: '+919876543221',
    updaterName: 'Priya Nair',
    updaterRole: 'seller',
    cdciExpiryKey: '15042027AZI500',
    medicineName: 'Azithromycin 500mg Tablets',
    actionType: 'STOCK_SOLD',
    amountRemovedOrSold: 12,
    notes: 'Walk-in prescription sale (Stock dropped below threshold)',
  },
];

// Workflow items for Expiry Checklist
const SEED_EXPIRY_WORKFLOW: Record<string, {
  status: 'active_alert' | 'under_review' | 'approved_deleted';
  removedAt?: string;
  removedByPhone?: string;
  removedByName?: string;
  approvalNotes?: string;
}> = {
  // CET10 is already checked by seller, currently under review in Review checklist
  '15102026CET10': {
    status: 'under_review',
    removedAt: '2026-10-23T16:00:00.000Z',
    removedByPhone: '+919876543220',
    removedByName: 'Amit Patel',
    approvalNotes: 'Physically removed 30 strips from Shelf B-4. Placed in biohazard quarantine box.',
  },
};

// Seed for List 1: Delivered stock items added by seller
const SEED_DELIVERED_STOCK: DeliveredStockItem[] = [
  {
    id: 'deliv-init-001',
    medicineName: 'Metformin 500mg Tablets (Glycomet)',
    cdciCode: 'MET500',
    expiryDate: '2028-02-15',
    drugLicenseNo: 'DL-2024-DIA-8819',
    batchCode: 'BCH-MET-889',
    category: 'Diabetes',
    unitsDelivered: 40,
    sellerPhone: '+919876543220',
    sellerName: 'Amit Patel',
    deliveredAt: '2026-10-24T00:30:00.000Z',
    status: 'pending_admin_approval',
  },
];

interface DatabaseContextType {
  currentUser: Person | null;
  currentDate: string;
  setCurrentDate: (date: string) => void;
  login: (phone: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  switchRoleDirectly: (role: UserRole) => void;

  // Tables
  persons: Person[];
  infoTable: InfoItem[];
  stockTable: StockItem[];
  thresholdTable: ThresholdItem[];
  updatesTable: UpdateRecord[];

  // Workflows
  activeExpiryAlerts: ExpiryAlertItem[]; // Expiry alerts awaiting seller physical removal
  liveReviews: ExpiryAlertItem[]; // Awaiting admin approval
  purchaseAlerts: ThresholdItem[]; // Medicines where total units available < threshold
  deliveredStockList: DeliveredStockItem[]; // List 1 & Checklist 3

  // Actions
  sellerConfirmPhysicalRemoval: (cdciExpiryKey: string, notes?: string) => { success: boolean; error?: string };
  adminApproveExpiredRemoval: (cdciExpiryKey: string, notes?: string) => { success: boolean; error?: string };
  sellerRecordStockSold: (cdciExpiryKey: string, unitsSold: number, notes?: string) => { success: boolean; error?: string };
  sellerAddDeliveredStock: (item: Omit<DeliveredStockItem, 'id' | 'sellerPhone' | 'sellerName' | 'deliveredAt' | 'status'>) => { success: boolean; error?: string; id?: string };
  adminApproveDeliveredStock: (id: string, adminNotes?: string) => { success: boolean; error?: string };
  adminAddNewMedicine: (
    info: Omit<InfoItem, 'cdciExpiryKey' | 'createdAt'>,
    initialUnits: number,
    thresholdAmount: number
  ) => { success: boolean; key?: string; error?: string };
  adminUpdateThreshold: (cdciCode: string, newThreshold: number) => { success: boolean };
  adminAddSeller: (phone: string, name: string, pass: string) => { success: boolean; error?: string };
  adminRemoveSeller: (phone: string) => { success: boolean; error?: string };
  resetToDefaultData: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or fallbacks
  const [persons, setPersons] = useState<Person[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PERSONS);
    return saved ? JSON.parse(saved) : SEED_PERSONS;
  });

  const [currentUser, setCurrentUser] = useState<Person | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [currentDate, setCurrentDateState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SIM_DATE);
    return saved || DEFAULT_SIMULATED_DATE;
  });

  const [infoTable, setInfoTable] = useState<InfoItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INFO);
    return saved ? JSON.parse(saved) : SEED_INFO;
  });

  const [stockTable, setStockTable] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCK);
    return saved ? JSON.parse(saved) : SEED_STOCK;
  });

  const [thresholdsMap, setThresholdsMap] = useState<Record<string, { medicineName: string; thresholdAmount: number }>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THRESHOLDS);
    return saved ? JSON.parse(saved) : SEED_THRESHOLDS;
  });

  const [updatesTable, setUpdatesTable] = useState<UpdateRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.UPDATES);
    return saved ? JSON.parse(saved) : SEED_UPDATES;
  });

  const [expiryWorkflow, setExpiryWorkflow] = useState<Record<string, {
    status: 'active_alert' | 'under_review' | 'approved_deleted';
    removedAt?: string;
    removedByPhone?: string;
    removedByName?: string;
    approvalNotes?: string;
  }>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPIRY_WORKFLOW);
    return saved ? JSON.parse(saved) : SEED_EXPIRY_WORKFLOW;
  });

  const [deliveredStockList, setDeliveredStockList] = useState<DeliveredStockItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DELIVERED_STOCK);
    return saved ? JSON.parse(saved) : SEED_DELIVERED_STOCK;
  });

  // Sync state changes to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PERSONS, JSON.stringify(persons));
  }, [persons]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIM_DATE, currentDate);
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INFO, JSON.stringify(infoTable));
  }, [infoTable]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stockTable));
  }, [stockTable]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THRESHOLDS, JSON.stringify(thresholdsMap));
  }, [thresholdsMap]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UPDATES, JSON.stringify(updatesTable));
  }, [updatesTable]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPIRY_WORKFLOW, JSON.stringify(expiryWorkflow));
  }, [expiryWorkflow]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DELIVERED_STOCK, JSON.stringify(deliveredStockList));
  }, [deliveredStockList]);

  // Derived: Threshold table with grouped total units available
  const thresholdTable = useMemo<ThresholdItem[]>(() => {
    // Map of CDCI code -> sum of available units in stock table
    const cdciTotals: Record<string, number> = {};

    const infoMap = new Map(infoTable.map((item) => [item.cdciExpiryKey, item]));

    stockTable.forEach((stock) => {
      const info = infoMap.get(stock.cdciExpiryKey);
      if (info) {
        cdciTotals[info.cdciCode] = (cdciTotals[info.cdciCode] || 0) + stock.unitsAvailable;
      }
    });

    return Object.entries(thresholdsMap).map(([cdciCode, config]) => ({
      cdciCode,
      medicineName: config.medicineName,
      thresholdAmount: config.thresholdAmount,
      totalUnitsAvailable: cdciTotals[cdciCode] || 0,
    }));
  }, [infoTable, stockTable, thresholdsMap]);

  // Derived: Purchase Alerts - when total units of a medicine is below threshold value
  // Requirement: "The alerts should be removed automatically when the stock is added to list 1 by seller"
  const purchaseAlerts = useMemo<ThresholdItem[]>(() => {
    // Sum units of newly delivered stock logged in List 1 (status: pending_admin_approval)
    const pendingDeliveredMap: Record<string, number> = {};
    deliveredStockList
      .filter((d) => d.status === 'pending_admin_approval')
      .forEach((d) => {
        pendingDeliveredMap[d.cdciCode] = (pendingDeliveredMap[d.cdciCode] || 0) + d.unitsDelivered;
      });

    const alerts = thresholdTable.filter((item) => {
      const deliveredInList1 = pendingDeliveredMap[item.cdciCode] || 0;
      const effectiveStock = item.totalUnitsAvailable + deliveredInList1;
      // If effective stock is below threshold, show alert.
      // Once seller adds stock to List 1 so effectiveStock >= thresholdAmount, alert is removed automatically!
      return effectiveStock < item.thresholdAmount;
    });

    // Prioritization: For purchase alert - display medicines in the order of deficit. Medicines with higher deficit should be displayed higher
    return alerts.sort((a, b) => {
      const delA = pendingDeliveredMap[a.cdciCode] || 0;
      const delB = pendingDeliveredMap[b.cdciCode] || 0;
      const deficitA = a.thresholdAmount - (a.totalUnitsAvailable + delA);
      const deficitB = b.thresholdAmount - (b.totalUnitsAvailable + delB);
      return deficitB - deficitA; // Descending: highest deficit first
    });
  }, [thresholdTable, deliveredStockList]);

  // Derived: Expiry alerts and Under Review
  const { activeExpiryAlerts, liveReviews } = useMemo(() => {
    const activeAlerts: ExpiryAlertItem[] = [];
    const reviews: ExpiryAlertItem[] = [];

    const stockMap = new Map(stockTable.map((s) => [s.cdciExpiryKey, s.unitsAvailable]));

    infoTable.forEach((info) => {
      const units = stockMap.get(info.cdciExpiryKey) ?? 0;
      // Categorize: expired (<= 0d: Red), two_weeks (1-14d: Orange), two_months (15-60d: Yellow), safe (> 60d)
      const { urgency, daysRemaining } = getExpiryCategory(info.expiryDate, currentDate);
      const workflow = expiryWorkflow[info.cdciExpiryKey];

      if (urgency !== 'safe') {
        if (!workflow || workflow.status === 'active_alert') {
          activeAlerts.push({
            id: info.cdciExpiryKey,
            cdciExpiryKey: info.cdciExpiryKey,
            medicineName: info.medicineName,
            batchCode: info.batchCode,
            expiryDate: info.expiryDate,
            cdciCode: info.cdciCode,
            drugLicenseNo: info.drugLicenseNo,
            unitsAvailable: units,
            status: 'active_alert',
            urgency,
            daysRemaining,
            detectedAt: info.createdAt,
          });
        } else if (workflow.status === 'under_review') {
          reviews.push({
            id: info.cdciExpiryKey,
            cdciExpiryKey: info.cdciExpiryKey,
            medicineName: info.medicineName,
            batchCode: info.batchCode,
            expiryDate: info.expiryDate,
            cdciCode: info.cdciCode,
            drugLicenseNo: info.drugLicenseNo,
            unitsAvailable: units,
            status: 'under_review',
            urgency,
            daysRemaining,
            detectedAt: info.createdAt,
            removedAt: workflow.removedAt,
            removedByPhone: workflow.removedByPhone,
            removedByName: workflow.removedByName,
            approvalNotes: workflow.approvalNotes,
          });
        }
      }
    });

    // Prioritization: For expiry list - display medicines in the order of expiry date. Medicines which are expiring first should be displayed higher
    activeAlerts.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    reviews.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    return { activeExpiryAlerts: activeAlerts, liveReviews: reviews };
  }, [infoTable, stockTable, currentDate, expiryWorkflow]);

  // Authentication Handlers
  const login = (phone: string, pass: string) => {
    const cleanPhone = phone.trim();
    const found = persons.find(
      (p) => p.phone === cleanPhone && p.password === pass
    );
    if (found) {
      setCurrentUser(found);
      return { success: true };
    }
    return { success: false, error: 'Invalid phone number or password. Check credentials.' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRoleDirectly = (targetRole: UserRole) => {
    const match = persons.find((p) => p.type === targetRole);
    if (match) {
      setCurrentUser(match);
    }
  };

  // CHECKLIST 1 ACTION:
  // "When they receive an alert , seller has to physically remove the stock and then click check in the alerts checklist.
  // After approval from admin, the entry will actually be deleted from table info and table stock."
  const sellerConfirmPhysicalRemoval = (cdciExpiryKey: string, notes?: string) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    if (currentUser.type !== 'seller') {
      return { success: false, error: 'Seller can update and admin has read only access.' };
    }

    setExpiryWorkflow((prev) => ({
      ...prev,
      [cdciExpiryKey]: {
        status: 'under_review',
        removedAt: new Date().toISOString(),
        removedByPhone: currentUser.phone,
        removedByName: currentUser.name,
        approvalNotes: notes || 'Stock physically removed from dispensary shelf into quarantine bin.',
      },
    }));

    return { success: true };
  };

  // CHECKLIST 2 ACTION:
  // "Checked items are displayed under review which are only removed after approval from admin."
  // "After approval from admin, the entry will actually be deleted from table info and table stock."
  const adminApproveExpiredRemoval = (cdciExpiryKey: string, notes?: string) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    if (currentUser.type !== 'admin') {
      return { success: false, error: 'Admin can update and seller has read only access.' };
    }

    const infoItem = infoTable.find((i) => i.cdciExpiryKey === cdciExpiryKey);
    const stockItem = stockTable.find((s) => s.cdciExpiryKey === cdciExpiryKey);
    const units = stockItem ? stockItem.unitsAvailable : 0;
    const medName = infoItem ? infoItem.medicineName : 'Expired Medicine';

    // 1. Delete from Info table
    setInfoTable((prev) => prev.filter((i) => i.cdciExpiryKey !== cdciExpiryKey));

    // 2. Delete from Stock table
    setStockTable((prev) => prev.filter((s) => s.cdciExpiryKey !== cdciExpiryKey));

    // 3. Mark workflow as approved_deleted
    setExpiryWorkflow((prev) => ({
      ...prev,
      [cdciExpiryKey]: {
        status: 'approved_deleted',
        removedAt: prev[cdciExpiryKey]?.removedAt || new Date().toISOString(),
        removedByPhone: prev[cdciExpiryKey]?.removedByPhone || 'N/A',
        removedByName: prev[cdciExpiryKey]?.removedByName || 'N/A',
        approvalNotes: notes || `Approved by Admin ${currentUser.name}. Disposal verified.`,
      },
    }));

    // 4. Log to Updates table
    const updateLog: UpdateRecord = {
      id: `upd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString(),
      updaterPhone: currentUser.phone,
      updaterName: currentUser.name,
      updaterRole: 'admin',
      cdciExpiryKey,
      medicineName: medName,
      actionType: 'STOCK_EXPIRED_REMOVED',
      amountRemovedOrSold: units,
      notes: `Admin approved expired stock disposal. ${units} units permanently removed from Info & Stock tables. ${notes || ''}`,
    };

    setUpdatesTable((prev) => [updateLog, ...prev]);

    return { success: true };
  };

  // LIST 1 ACTION:
  // "List1: Seller can update and admin has read only access :-
  // When new stock is delivered, the seller adds all the information about the stock
  // When the admin approves this info, then the info table, stock and updates tables are updated."
  const sellerAddDeliveredStock = (item: Omit<DeliveredStockItem, 'id' | 'sellerPhone' | 'sellerName' | 'deliveredAt' | 'status'>) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    if (currentUser.type !== 'seller') {
      return { success: false, error: 'Only sellers can add delivered stock info to List 1.' };
    }

    if (item.unitsDelivered <= 0) {
      return { success: false, error: 'Delivered units must be greater than zero.' };
    }

    const cleanCdci = item.cdciCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

    const newDelivery: DeliveredStockItem = {
      ...item,
      id: `deliv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      cdciCode: cleanCdci,
      sellerPhone: currentUser.phone,
      sellerName: currentUser.name,
      deliveredAt: new Date().toISOString(),
      status: 'pending_admin_approval',
    };

    setDeliveredStockList((prev) => [newDelivery, ...prev]);
    return { success: true, id: newDelivery.id };
  };

  // CHECKLIST 3 ACTION:
  // "Checklist3: (Admin can update and seller has read only access) :-
  // Just to approve the entries by seller in list 1.
  // The admin only approves the stock updates added by seller and does not restock."
  const adminApproveDeliveredStock = (id: string, adminNotes?: string) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    if (currentUser.type !== 'admin') {
      return { success: false, error: 'Checklist 3 is updateable by Admins only.' };
    }

    const delivery = deliveredStockList.find((d) => d.id === id);
    if (!delivery) return { success: false, error: 'Delivery record not found.' };
    if (delivery.status === 'approved') return { success: false, error: 'Delivery already approved.' };

    const cleanCdci = delivery.cdciCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cdciExpiryKey = formatCdciExpiryKey(delivery.expiryDate, cleanCdci);

    // 1. Update Info table (if not exists)
    setInfoTable((prev) => {
      const exists = prev.some((i) => i.cdciExpiryKey === cdciExpiryKey);
      if (exists) return prev;
      const newInfo: InfoItem = {
        cdciExpiryKey,
        drugLicenseNo: delivery.drugLicenseNo,
        batchCode: delivery.batchCode,
        expiryDate: delivery.expiryDate,
        cdciCode: cleanCdci,
        medicineName: delivery.medicineName,
        category: delivery.category || 'General',
        createdAt: new Date().toISOString(),
      };
      return [newInfo, ...prev];
    });

    // 2. Update Stock table (add units delivered)
    setStockTable((prev) => {
      const exists = prev.find((s) => s.cdciExpiryKey === cdciExpiryKey);
      if (exists) {
        return prev.map((s) =>
          s.cdciExpiryKey === cdciExpiryKey
            ? {
                ...s,
                unitsAvailable: s.unitsAvailable + delivery.unitsDelivered,
                lastUpdatedAt: new Date().toISOString(),
              }
            : s
        );
      } else {
        return [
          ...prev,
          {
            cdciExpiryKey,
            unitsAvailable: delivery.unitsDelivered,
            lastUpdatedAt: new Date().toISOString(),
          },
        ];
      }
    });

    // 3. Update Updates table (log audit record)
    const updateLog: UpdateRecord = {
      id: `upd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString(),
      updaterPhone: currentUser.phone,
      updaterName: currentUser.name,
      updaterRole: 'admin',
      cdciExpiryKey,
      medicineName: delivery.medicineName,
      actionType: 'STOCK_ADDED',
      amountRemovedOrSold: delivery.unitsDelivered,
      notes: `Admin approved new stock delivery submitted by seller ${delivery.sellerName} (${delivery.sellerPhone}). Batch: ${delivery.batchCode}. ${adminNotes || ''}`,
    };
    setUpdatesTable((prev) => [updateLog, ...prev]);

    // 4. Update thresholds map if new medicine
    setThresholdsMap((prev) => {
      if (!prev[cleanCdci]) {
        return {
          ...prev,
          [cleanCdci]: {
            medicineName: delivery.medicineName,
            thresholdAmount: 30,
          },
        };
      }
      return prev;
    });

    // 5. Update delivery status to approved
    setDeliveredStockList((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'approved',
              approvedAt: new Date().toISOString(),
              approvedByPhone: currentUser.phone,
              approvedByName: currentUser.name,
              adminNotes: adminNotes || 'Delivery verified and approved.',
            }
          : d
      )
    );

    return { success: true };
  };

  // SELLER ACTION:
  // "If the type is seller, then they have the option to update stocks table:
  // Enter stock sold (this amount will be subtracted from units available)"
  const sellerRecordStockSold = (cdciExpiryKey: string, unitsSold: number, notes?: string) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };
    if (currentUser.type !== 'seller' && currentUser.type !== 'admin') {
      return { success: false, error: 'Unauthorized.' };
    }

    if (unitsSold <= 0) {
      return { success: false, error: 'Units sold must be a positive number.' };
    }

    const currentStock = stockTable.find((s) => s.cdciExpiryKey === cdciExpiryKey);
    if (!currentStock) {
      return { success: false, error: 'Medicine batch not found in stock table.' };
    }

    if (currentStock.unitsAvailable < unitsSold) {
      return {
        success: false,
        error: `Insufficient stock! Only ${currentStock.unitsAvailable} units available in this batch.`,
      };
    }

    const infoItem = infoTable.find((i) => i.cdciExpiryKey === cdciExpiryKey);
    const medName = infoItem ? infoItem.medicineName : 'Medicine';

    // Deduct stock
    setStockTable((prev) =>
      prev.map((item) =>
        item.cdciExpiryKey === cdciExpiryKey
          ? {
              ...item,
              unitsAvailable: item.unitsAvailable - unitsSold,
              lastUpdatedAt: new Date().toISOString(),
            }
          : item
      )
    );

    // Record in Updates table
    const updateLog: UpdateRecord = {
      id: `upd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toISOString(),
      updaterPhone: currentUser.phone,
      updaterName: currentUser.name,
      updaterRole: currentUser.type,
      cdciExpiryKey,
      medicineName: medName,
      actionType: 'STOCK_SOLD',
      amountRemovedOrSold: unitsSold,
      notes: notes || `Sale recorded by ${currentUser.name}. Stock subtracted.`,
    };

    setUpdatesTable((prev) => [updateLog, ...prev]);

    return { success: true };
  };

  // ADMIN ACTION:
  // Option to update info table directly
  const adminAddNewMedicine = (
    info: Omit<InfoItem, 'cdciExpiryKey' | 'createdAt'>,
    initialUnits: number,
    thresholdAmount: number
  ) => {
    if (!currentUser || currentUser.type !== 'admin') {
      return { success: false, error: 'Only admins can add to Info table.' };
    }

    const cdciCodeClean = info.cdciCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const generatedKey = formatCdciExpiryKey(info.expiryDate, cdciCodeClean);

    if (infoTable.some((i) => i.cdciExpiryKey === generatedKey)) {
      return {
        success: false,
        error: `A batch with key ${generatedKey} already exists in Info table.`,
      };
    }

    const newInfo: InfoItem = {
      ...info,
      cdciCode: cdciCodeClean,
      cdciExpiryKey: generatedKey,
      createdAt: new Date().toISOString(),
    };

    setInfoTable((prev) => [newInfo, ...prev]);

    if (initialUnits > 0) {
      setStockTable((prev) => [
        ...prev,
        {
          cdciExpiryKey: generatedKey,
          unitsAvailable: Math.max(0, initialUnits),
          lastUpdatedAt: new Date().toISOString(),
        },
      ]);

      const updateLog: UpdateRecord = {
        id: `upd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: new Date().toISOString(),
        updaterPhone: currentUser.phone,
        updaterName: currentUser.name,
        updaterRole: 'admin',
        cdciExpiryKey: generatedKey,
        medicineName: info.medicineName,
        actionType: 'STOCK_ADDED',
        amountRemovedOrSold: initialUnits,
        notes: `Initial stock intake for new batch ${info.batchCode}`,
      };
      setUpdatesTable((prev) => [updateLog, ...prev]);
    }

    setThresholdsMap((prev) => ({
      ...prev,
      [cdciCodeClean]: {
        medicineName: info.medicineName,
        thresholdAmount: thresholdAmount > 0 ? thresholdAmount : (prev[cdciCodeClean]?.thresholdAmount || 30),
      },
    }));

    return { success: true, key: generatedKey };
  };

  const adminUpdateThreshold = (cdciCode: string, newThreshold: number) => {
    if (!currentUser || currentUser.type !== 'admin') {
      return { success: false };
    }
    setThresholdsMap((prev) => {
      const existing = prev[cdciCode];
      if (!existing) return prev;
      return {
        ...prev,
        [cdciCode]: {
          ...existing,
          thresholdAmount: Math.max(1, newThreshold),
        },
      };
    });
    return { success: true };
  };

  // ADMIN ACTION:
  // "They can add or remove sellers"
  const adminAddSeller = (phone: string, name: string, pass: string) => {
    if (!currentUser || currentUser.type !== 'admin') {
      return { success: false, error: 'Only admins can add sellers.' };
    }
    const cleanPhone = phone.trim();
    if (persons.some((p) => p.phone === cleanPhone)) {
      return { success: false, error: 'User with this phone number already exists.' };
    }

    const newSeller: Person = {
      phone: cleanPhone,
      name: name.trim(),
      password: pass,
      type: 'seller',
      createdAt: new Date().toISOString(),
    };

    setPersons((prev) => [...prev, newSeller]);
    return { success: true };
  };

  const adminRemoveSeller = (phone: string) => {
    if (!currentUser || currentUser.type !== 'admin') {
      return { success: false, error: 'Only admins can remove sellers.' };
    }
    if (currentUser.phone === phone) {
      return { success: false, error: 'Cannot remove yourself.' };
    }

    setPersons((prev) => prev.filter((p) => p.phone !== phone));
    return { success: true };
  };

  const setCurrentDate = (date: string) => {
    setCurrentDateState(date);
  };

  const resetToDefaultData = () => {
    setPersons(SEED_PERSONS);
    setInfoTable(SEED_INFO);
    setStockTable(SEED_STOCK);
    setThresholdsMap(SEED_THRESHOLDS);
    setUpdatesTable(SEED_UPDATES);
    setExpiryWorkflow(SEED_EXPIRY_WORKFLOW);
    setDeliveredStockList(SEED_DELIVERED_STOCK);
    setCurrentDateState(DEFAULT_SIMULATED_DATE);
    localStorage.removeItem(STORAGE_KEYS.PERSONS);
    localStorage.removeItem(STORAGE_KEYS.INFO);
    localStorage.removeItem(STORAGE_KEYS.STOCK);
    localStorage.removeItem(STORAGE_KEYS.THRESHOLDS);
    localStorage.removeItem(STORAGE_KEYS.UPDATES);
    localStorage.removeItem(STORAGE_KEYS.EXPIRY_WORKFLOW);
    localStorage.removeItem(STORAGE_KEYS.DELIVERED_STOCK);
    localStorage.removeItem(STORAGE_KEYS.SIM_DATE);
  };

  return (
    <DatabaseContext.Provider
      value={{
        currentUser,
        currentDate,
        setCurrentDate,
        login,
        logout,
        switchRoleDirectly,

        persons,
        infoTable,
        stockTable,
        thresholdTable,
        updatesTable,

        activeExpiryAlerts,
        liveReviews,
        purchaseAlerts,
        deliveredStockList,

        sellerConfirmPhysicalRemoval,
        adminApproveExpiredRemoval,
        sellerRecordStockSold,
        sellerAddDeliveredStock,
        adminApproveDeliveredStock,
        adminAddNewMedicine,
        adminUpdateThreshold,
        adminAddSeller,
        adminRemoveSeller,
        resetToDefaultData,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
