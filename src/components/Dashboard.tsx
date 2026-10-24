/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Header } from './Header';
import { PurchaseAlertBanner } from './PurchaseAlertBanner';
import { ChecklistAlerts } from './ChecklistAlerts';
import { ChecklistReviews } from './ChecklistReviews';
import { ListDeliveredStock } from './ListDeliveredStock';
import { ChecklistStockApprovals } from './ChecklistStockApprovals';
import { InfoTableView } from './tables/InfoTableView';
import { StockTableView } from './tables/StockTableView';
import { UpdatesTableView } from './tables/UpdatesTableView';
import { ThresholdTableView } from './tables/ThresholdTableView';
import { EnterStockSoldModal } from './modals/EnterStockSoldModal';
import { AddMedicineModal } from './modals/AddMedicineModal';
import { SellerManagementModal } from './modals/SellerManagementModal';
import {
  Boxes,
  FileText,
  History,
  Gauge,
  Users,
  ShoppingCart,
  PlusCircle,
  Truck,
  Activity,
  Layers,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser, stockTable, infoTable, updatesTable } = useDatabase();

  const isAdmin = currentUser?.type === 'admin';
  const isSeller = currentUser?.type === 'seller';

  // Navigation tabs
  type TabType = 'stock' | 'info' | 'updates' | 'threshold';
  const [activeTab, setActiveTab] = useState<TabType>('stock');

  // Modal States
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldInitialKey, setSoldInitialKey] = useState('');
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [prefillCdci, setPrefillCdci] = useState('');
  const [prefillName, setPrefillName] = useState('');
  const [showSellerModal, setShowSellerModal] = useState(false);

  const openSellModalForBatch = (key: string) => {
    setSoldInitialKey(key);
    setShowSoldModal(true);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header */}
      <Header />

      {/* Main Container with Generous Breathing Room */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8 flex-1">
        {/* 1. WELCOME BACK MESSAGE AT TOP (as requested in UI updates) */}
        <section aria-label="Welcome Section">
          <div className="bg-[#0e1422] rounded-2xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl relative overflow-hidden space-y-6">
            {/* Subtle top accent hairline */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600"></div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 bg-white/[0.04] px-2.5 py-0.5 rounded border border-white/[0.06]">
                    Active Session Console
                  </span>
                  <span
                    className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded border ${
                      isAdmin
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    {isAdmin ? '🛡️ Administrator Access' : '🛒 Dispensary Seller Access'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Welcome back, {currentUser?.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                  {isAdmin
                    ? 'Administrator authority enabled: Audit seller-logged stock deliveries, review and authorize expired batch destruction, manage dispensary personnel, and monitor audit ledgers.'
                    : 'Seller operational authority enabled: Enter customer stock sales, record incoming stock deliveries for Admin verification, and physically quarantine expired shelf inventory.'}
                </p>
              </div>

              {/* Status pill on right */}
              <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#090d16] px-3.5 py-2 rounded-xl border border-white/[0.06] shrink-0 self-start">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Role Isolation Enforced</span>
              </div>
            </div>

            {/* BUTTONS DISPLAYED AS A LIST BELOW THE MESSAGE (not beside it) */}
            <div className="pt-5 border-t border-white/[0.06] space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Quick Actions Dock
                </span>
                <span className="text-[10px] text-slate-500">&bull; Contextual to {currentUser?.type} role</span>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                {/* If Seller: Option to update stocks table -> Enter stock sold */}
                {isSeller && (
                  <button
                    type="button"
                    onClick={() => openSellModalForBatch('')}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-xs font-bold shadow-lg shadow-blue-950/60 transition-all duration-200 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Enter Stock Sold</span>
                  </button>
                )}

                {/* If Admin: Option to add medicine to Info table, and manage sellers */}
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setPrefillCdci('');
                        setPrefillName('');
                        setShowAddMedicineModal(true);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white text-xs font-bold shadow-lg shadow-teal-950/60 transition-all duration-200 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Medicine Batch to Info Table</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowSellerModal(true)}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e2638] hover:bg-[#263148] active:scale-[0.99] text-slate-200 hover:text-white border border-white/[0.1] text-xs font-bold shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>Manage Sellers (Add / Remove)</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 2. PURCHASE ALERT MESSAGE (Automatically cleared when seller logs stock in List 1) */}
        <section aria-label="Purchase Alerts Section">
          <PurchaseAlertBanner />
        </section>

        {/* 3. CHECKLISTS: EXPIRY SAFETY WORKFLOW */}
        <section aria-label="Expiry Safety Workflow Checklists" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Phase 1 &bull; Expiry Quarantine & Audit Ledger
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">Two-Phase Physical Sign-Off</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Expiry Alerts (Seller updates, Admin read-only) */}
            <div className="flex flex-col">
              <ChecklistAlerts />
            </div>

            {/* Admin Approval Review (Admin updates, Seller read-only) */}
            <div className="flex flex-col">
              <ChecklistReviews />
            </div>
          </div>
        </section>

        {/* 4. LIST 1 & CHECKLIST 3: NEW STOCK DELIVERY & APPROVALS WORKFLOW */}
        <section aria-label="New Stock Delivery and Approvals Workflow" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Phase 2 &bull; Delivered Stock Intake & Reconciliation
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">Seller Input &bull; Admin Sign-Off</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* List 1: Delivered Stock Intake (Seller can update, Admin read-only) */}
            <div className="flex flex-col">
              <ListDeliveredStock />
            </div>

            {/* Checklist 3: Stock Delivery Approvals (Admin can update, Seller read-only) */}
            <div className="flex flex-col">
              <ChecklistStockApprovals />
            </div>
          </div>
        </section>

        {/* 5. TABLE VIEWS & MASTER DATA */}
        <section aria-label="Database Tables Section" className="space-y-4 pt-2">
          {/* Navigation Tabs */}
          <div className="bg-[#0e1422] rounded-xl p-1.5 border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Stock Table (Visible to both Admin and Seller) */}
              <button
                type="button"
                onClick={() => setActiveTab('stock')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'stock'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-950/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Boxes className="w-4 h-4" />
                <span>Stock Table</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    activeTab === 'stock' ? 'bg-blue-800 text-white' : 'bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {stockTable.length}
                </span>
              </button>

              {/* Info Table (Admin only) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'info'
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-950/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Info Table</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      activeTab === 'info' ? 'bg-teal-800 text-white' : 'bg-white/[0.06] text-slate-400'
                    }`}
                  >
                    {infoTable.length}
                  </span>
                </button>
              )}

              {/* Updates Table (Admin only) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setActiveTab('updates')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    activeTab === 'updates'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Updates Table</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      activeTab === 'updates' ? 'bg-indigo-800 text-white' : 'bg-white/[0.06] text-slate-400'
                    }`}
                  >
                    {updatesTable.length}
                  </span>
                </button>
              )}

              {/* Threshold Table */}
              <button
                type="button"
                onClick={() => setActiveTab('threshold')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                  activeTab === 'threshold'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Gauge className="w-4 h-4" />
                <span>Threshold Targets</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-500 pr-3 hidden sm:block">
              Clinical Telemetry Engine
            </div>
          </div>

          {/* Active Tab View */}
          <div>
            {activeTab === 'stock' && (
              <StockTableView
                onOpenSellModal={openSellModalForBatch}
              />
            )}

            {activeTab === 'info' && isAdmin && (
              <InfoTableView
                onOpenAddMedicine={() => {
                  setPrefillCdci('');
                  setPrefillName('');
                  setShowAddMedicineModal(true);
                }}
              />
            )}

            {activeTab === 'updates' && isAdmin && <UpdatesTableView />}

            {activeTab === 'threshold' && (
              <ThresholdTableView />
            )}
          </div>
        </section>
      </main>

      {/* Modals */}
      {showSoldModal && (
        <EnterStockSoldModal
          initialKey={soldInitialKey}
          onClose={() => {
            setShowSoldModal(false);
            setSoldInitialKey('');
          }}
        />
      )}

      {showAddMedicineModal && (
        <AddMedicineModal
          prefillCdciCode={prefillCdci}
          prefillMedicineName={prefillName}
          onClose={() => {
            setShowAddMedicineModal(false);
            setPrefillCdci('');
            setPrefillName('');
          }}
        />
      )}

      {showSellerModal && (
        <SellerManagementModal onClose={() => setShowSellerModal(false)} />
      )}
    </div>
  );
};
