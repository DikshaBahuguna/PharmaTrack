/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { DeliveredStockItem } from '../types/database';
import {
  ClipboardCheck,
  CheckCircle2,
  ShieldCheck,
  Lock,
  User,
  Boxes,
  Truck,
  Clock,
  Pill,
  Sparkles,
} from 'lucide-react';

export const ChecklistStockApprovals: React.FC = () => {
  const { deliveredStockList, adminApproveDeliveredStock, currentUser } = useDatabase();

  const isAdmin = currentUser?.type === 'admin';
  const isSeller = currentUser?.type === 'seller';

  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pendingApprovals = deliveredStockList.filter((d) => d.status === 'pending_admin_approval');

  const handleApprove = (item: DeliveredStockItem) => {
    if (!isAdmin) return;
    const notes = approvalNotes[item.id] || 'Verified stock condition and packaging.';
    const res = adminApproveDeliveredStock(item.id, notes);
    if (res.success) {
      setSuccessMessage(
        `Approved delivery of ${item.unitsDelivered} units of ${item.medicineName}. Info, Stock, and Updates tables updated!`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  return (
    <div className="bg-[#0e1422] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden flex flex-col h-full transition-all duration-200">
      {/* Header */}
      <div className="p-6 sm:p-7 border-b border-white/[0.06] bg-[#0c101a] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold tracking-tight text-white">Stock Delivery Approvals</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                {pendingApprovals.length}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Admin approves seller deliveries to update Info, Stock, and Updates tables.
            </p>
          </div>
        </div>

        {/* Role Access Badge */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {isAdmin ? (
            <span className="text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Admin Can Update
            </span>
          ) : (
            <span className="text-slate-400 bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-full flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Seller: Read Only Access
            </span>
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
        {pendingApprovals.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/[0.08] rounded-xl bg-[#090d16]/50">
            <div className="w-12 h-12 rounded-full bg-white/[0.03] text-slate-500 flex items-center justify-center mb-3">
              <Boxes className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-400">no pending stock approvals</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              All incoming seller deliveries have been approved and reconciled into master tables.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 flex items-center justify-between pb-1 font-mono">
              <span>Approval Queue (Delivery Verification &bull; Table Sync)</span>
              <span className="text-blue-400 font-semibold">Admin sign-off only</span>
            </div>

            {pendingApprovals.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-blue-500/25 bg-[#0d1424]/50 overflow-hidden hover:border-blue-500/40 transition-all duration-200"
              >
                {/* Two Columns Grid: Column 1 = Delivery Details | Column 2 = Admin Approval */}
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.06]">
                  {/* COLUMN 1: Delivery Information (7 cols) */}
                  <div className="lg:col-span-7 p-5 sm:p-6 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                            PENDING APPROVAL
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-200 bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.08]">
                            CDCI: {item.cdciCode}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                          <Pill className="w-4 h-4 text-blue-400 shrink-0" />
                          {item.medicineName}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-mono text-blue-400 font-extrabold block">
                          Units: <strong className="text-base">{item.unitsDelivered}</strong>
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                          Expiry: {item.expiryDate}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#090d16] p-3 rounded-xl border border-white/[0.06]">
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-mono block">Batch Code</span>
                        <span className="font-mono font-semibold text-slate-200">{item.batchCode}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] uppercase font-mono block">Drug Mfg License</span>
                        <span className="font-mono font-semibold text-slate-200 truncate block">{item.drugLicenseNo}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300 bg-[#090d16] p-3 rounded-xl border border-white/[0.06]">
                      <span className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Logged by Seller: <strong>{item.sellerName}</strong>
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {item.sellerPhone}
                      </span>
                    </div>
                  </div>

                  {/* COLUMN 2: Admin Approval (5 cols) */}
                  <div className="lg:col-span-5 p-5 sm:p-6 bg-[#0a0e18]/60 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Reconciliation
                        </span>
                        {isAdmin ? (
                          <span className="text-[11px] font-mono text-blue-400 font-medium">Authorized</span>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-500 font-medium">Read-Only</span>
                        )}
                      </div>

                      {isAdmin ? (
                        <div className="space-y-3">
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Approving commits <strong className="text-slate-200 font-mono">+{item.unitsDelivered} units</strong> into stock, writes the batch to the <code className="text-slate-200 font-mono">info</code> table, and records an immutable entry in the <code className="text-slate-200 font-mono">updates</code> table.
                          </p>
                          <input
                            type="text"
                            placeholder="Verification note (optional)"
                            value={approvalNotes[item.id] || ''}
                            onChange={(e) =>
                              setApprovalNotes({
                                ...approvalNotes,
                                [item.id]: e.target.value,
                              })
                            }
                            className="w-full text-xs p-2.5 rounded-xl bg-[#090d16] border border-white/[0.12] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400 space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                            <Lock className="w-3.5 h-3.5 text-slate-500" />
                            Awaiting Pharmacist Sign-Off
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-400">
                            Seller has read-only access here. Stock counts update once the Admin signs off.
                          </p>
                        </div>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(item)}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-black/50 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Update Master Tables</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3.5 bg-[#090d16] border-t border-white/[0.06] text-xs text-slate-500 flex items-center justify-between font-mono">
        <span className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-slate-500" />
          The admin only approves seller-logged stock updates and does not restock directly.
        </span>
      </div>
    </div>
  );
};
