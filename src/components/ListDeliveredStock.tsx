/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { DeliveredStockItem } from '../types/database';
import {
  PackagePlus,
  PlusCircle,
  Truck,
  CheckCircle2,
  Lock,
  Pill,
  Calendar,
  Clock,
  User,
  X,
  Boxes,
  Award,
  Hash,
} from 'lucide-react';

export const ListDeliveredStock: React.FC = () => {
  const { deliveredStockList, sellerAddDeliveredStock, currentUser } = useDatabase();

  const isSeller = currentUser?.type === 'seller';
  const isAdmin = currentUser?.type === 'admin';

  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form fields for new delivery
  const [medicineName, setMedicineName] = useState('');
  const [cdciCode, setCdciCode] = useState('');
  const [expiryDate, setExpiryDate] = useState('2028-01-30');
  const [drugLicenseNo, setDrugLicenseNo] = useState('DL-2024-DEL-901');
  const [batchCode, setBatchCode] = useState('BCH-2026-N01');
  const [category, setCategory] = useState('General');
  const [unitsDelivered, setUnitsDelivered] = useState<number>(50);

  const pendingDeliveries = deliveredStockList.filter((d) => d.status === 'pending_admin_approval');

  const handleOpenModal = () => {
    setError(null);
    setMedicineName('');
    setCdciCode('');
    setUnitsDelivered(50);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!medicineName || !cdciCode || !expiryDate || !drugLicenseNo || !batchCode) {
      setError('Please fill in all required delivery details.');
      return;
    }

    if (unitsDelivered <= 0) {
      setError('Units delivered must be greater than zero.');
      return;
    }

    const res = sellerAddDeliveredStock({
      medicineName,
      cdciCode: cdciCode.trim().toUpperCase(),
      expiryDate,
      drugLicenseNo,
      batchCode,
      category,
      unitsDelivered,
    });

    if (!res.success) {
      setError(res.error || 'Failed to submit delivered stock.');
    } else {
      setShowAddModal(false);
      setSuccessMessage(
        `Delivery logged for ${medicineName} (+${unitsDelivered} units). Purchase alerts for ${cdciCode.toUpperCase()} cleared.`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  return (
    <div className="bg-[#0e1422] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden flex flex-col h-full transition-all duration-200">
      {/* Header */}
      <div className="p-6 sm:p-7 border-b border-white/[0.06] bg-[#0c101a] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold tracking-tight text-white">Delivered Stock Intake</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                {pendingDeliveries.length} Pending
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              When new stock is delivered, the seller logs all batch info here for Admin approval.
            </p>
          </div>
        </div>

        {/* Role Access Badge & Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {isSeller ? (
              <span className="text-teal-300 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <PackagePlus className="w-3.5 h-3.5 text-teal-400" />
                Seller Can Update
              </span>
            ) : (
              <span className="text-slate-400 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                Admin: Read Only Access
              </span>
            )}
          </div>

          {isSeller && (
            <button
              type="button"
              onClick={handleOpenModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white text-xs font-bold transition-all duration-200 shadow-md shadow-teal-950/60 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Delivered Stock</span>
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-950/40 text-emerald-300 text-xs px-6 py-3 border-b border-emerald-500/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Content */}
      <div className="p-6 sm:p-7 flex-1 space-y-4">
        {pendingDeliveries.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/[0.08] rounded-xl bg-[#090d16]/50">
            <div className="w-12 h-12 rounded-full bg-white/[0.03] text-slate-500 flex items-center justify-center mb-3">
              <Truck className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-400">no pending deliveries</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              All incoming delivery records have been inspected and confirmed into inventory by the Admin.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="text-xs text-slate-400 flex items-center justify-between pb-1 font-mono">
              <span>Delivered Intakes (Awaiting Verification)</span>
              <span className="text-teal-400 font-semibold">Instantly clears threshold warnings</span>
            </div>

            {pendingDeliveries.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-teal-500/25 bg-[#091518]/50 p-5 hover:border-teal-500/40 transition-all duration-200 space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase tracking-wider">
                        NEW DELIVERY
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-200 bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.08]">
                        CDCI: {item.cdciCode}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-teal-400 shrink-0" />
                      {item.medicineName}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-mono text-teal-400 font-extrabold block">
                      +{item.unitsDelivered} units incoming
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                      Expiry: {item.expiryDate}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-[#090d16] p-3 rounded-xl border border-white/[0.06]">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-mono block">Batch Code</span>
                    <span className="font-mono font-semibold text-slate-200">{item.batchCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-mono block">Drug Mfg License</span>
                    <span className="font-mono font-semibold text-slate-200 truncate block">{item.drugLicenseNo}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-500 text-[10px] uppercase font-mono block">Logged By</span>
                    <span className="font-semibold text-slate-200 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {item.sellerName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    Intake at {new Date(item.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-medium text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 text-[11px]">
                    Pending Admin Sign-off
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Seller Adds Delivered Stock */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#060910]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1422] rounded-2xl max-w-lg w-full shadow-2xl border border-white/[0.12] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-white/[0.08] bg-[#0c101a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Log Delivered Stock</h3>
                  <p className="text-xs text-slate-400">Seller records delivered batch for Admin sign-off</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Medicine Name
                  </label>
                  <div className="relative">
                    <Pill className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Azithromycin 500mg"
                      value={medicineName}
                      onChange={(e) => setMedicineName(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-[#080c14] border border-white/[0.12] focus:border-teal-500 text-white placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    CDCI Code
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. AZI500"
                      value={cdciCode}
                      onChange={(e) => setCdciCode(e.target.value.toUpperCase())}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-[#080c14] border border-white/[0.12] focus:border-teal-500 text-white font-mono font-bold placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Expiry Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="date"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-[#080c14] border border-white/[0.12] focus:border-teal-500 text-white font-mono placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Batch Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCH-AZI-991"
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-[#080c14] border border-white/[0.12] focus:border-teal-500 text-white font-mono placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Mfg License Number
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. DL-2024-MFG-9021"
                      value={drugLicenseNo}
                      onChange={(e) => setDrugLicenseNo(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-[#080c14] border border-white/[0.12] focus:border-teal-500 text-white font-mono placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Delivered Quantity (Units)
                  </label>
                  <div className="relative">
                    <Boxes className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type="number"
                      min="1"
                      required
                      value={unitsDelivered}
                      onChange={(e) => setUnitsDelivered(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-[#080c14] border border-white/[0.12] focus:border-teal-500 text-white font-mono font-bold placeholder-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-950/20 border border-teal-500/25 text-xs text-teal-300 leading-relaxed font-mono">
                &bull; Submitting this delivery entry alerts the Administrator for verification and immediately clears any threshold procurement warnings for this CDCI code.
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white text-xs font-bold transition-all duration-200 shadow-md shadow-teal-950/60 cursor-pointer"
                >
                  Confirm & Submit Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
