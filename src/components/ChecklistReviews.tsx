/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { ExpiryAlertItem } from '../types/database';
import { parseCdciExpiryKey } from '../utils/keyHelper';
import {
  ClipboardCheck,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  UserCheck,
  Lock,
  Inbox,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const ChecklistReviews: React.FC = () => {
  const { liveReviews, adminApproveExpiredRemoval, currentUser } = useDatabase();
  const [approvingKey, setApprovingKey] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const isAdmin = currentUser?.type === 'admin';
  const isSeller = currentUser?.type === 'seller';

  const handleApprove = (item: ExpiryAlertItem) => {
    if (!isAdmin) return;
    const notes = adminNotes[item.cdciExpiryKey] || 'Disposal inspected & approved. Destroyed per biohazard guidelines.';
    const res = adminApproveExpiredRemoval(item.cdciExpiryKey, notes);
    if (res.success) {
      setActionSuccess(
        `Approved! Batch ${item.batchCode} (${item.unitsAvailable} units) permanently deleted from Info and Stock tables.`
      );
      setApprovingKey(null);
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header with Role Permission Badge */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 to-purple-50/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Admin Approval Review</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700">
                {liveReviews.length}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Checked items under review. Permanently removed from Info & Stock tables only after Admin approval.
            </p>
          </div>
        </div>

        {/* Access Rights Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border">
          {isAdmin ? (
            <span className="text-indigo-700 bg-indigo-50 border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              Admin Can Update (Approval & Table Deletion)
            </span>
          ) : (
            <span className="text-slate-600 bg-slate-100 border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Seller: Read Only Access
            </span>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 text-emerald-800 text-xs px-4 py-2.5 border-b border-emerald-100 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Review Checklist Content */}
      <div className="p-4 sm:p-5 flex-1">
        {liveReviews.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            {/* EXACT REQUIRED PLACEHOLDER TEXT */}
            <p className="text-base font-medium text-slate-400">no live reviews.</p>
            <p className="text-xs text-slate-400 mt-1">
              No physically removed items are currently pending admin verification.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-slate-500 flex items-center justify-between pb-1">
              <span>Review items list (Columns: 1. Removal Inspection | 2. Approval & Deletion)</span>
              <span className="font-mono text-[11px] text-indigo-600 font-semibold">
                Admin approval triggers table info & stock deletion
              </span>
            </div>

            {liveReviews.map((item) => {
              const parsedKey = parseCdciExpiryKey(item.cdciExpiryKey);

              return (
                <div
                  key={item.cdciExpiryKey}
                  className="rounded-xl border border-indigo-200 bg-indigo-50/20 hover:border-indigo-300 transition-all overflow-hidden"
                >
                  {/* Two Columns Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                    {/* COLUMN 1: Removal Inspection Details */}
                    <div className="lg:col-span-7 p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-600 text-white uppercase tracking-wider">
                              UNDER REVIEW
                            </span>
                            {item.urgency === 'expired' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase">
                                Expired (Red)
                              </span>
                            )}
                            {item.urgency === 'two_weeks' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white uppercase">
                                In 2 Wks (Orange)
                              </span>
                            )}
                            {item.urgency === 'two_months' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-amber-950 uppercase">
                                In 2 Mos (Yellow)
                              </span>
                            )}
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {item.cdciExpiryKey}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                            {item.medicineName}
                          </h3>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono text-slate-600 font-bold block">
                            Expiry: {parsedKey.formattedDate}
                          </span>
                          <span className="text-xs text-rose-600 font-bold font-mono">
                            {item.unitsAvailable} units to delete
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400 block">Batch Code</span>
                          <span className="font-mono font-semibold text-slate-800">{item.batchCode}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">CDCI Code</span>
                          <span className="font-mono font-semibold text-slate-800">{item.cdciCode}</span>
                        </div>
                      </div>

                      {/* Physical Removal Trail by Seller */}
                      <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Physically Removed By: {item.removedByName || 'Seller'}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono">
                            {item.removedByPhone}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800 italic">
                          &quot;{item.approvalNotes || 'Stock physically removed from dispensary shelf.'}&quot;
                        </p>
                        {item.removedAt && (
                          <div className="text-[10px] text-emerald-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Removed on {new Date(item.removedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* COLUMN 2: Admin Approval & Discard Action */}
                    <div className="lg:col-span-5 p-4 bg-slate-50/60 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                            Admin Verification & Deletion
                          </span>
                          {isAdmin ? (
                            <span className="text-[11px] text-indigo-600 font-medium">Admin Action</span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Read-Only</span>
                          )}
                        </div>

                        {isAdmin ? (
                          <div className="space-y-2">
                            <p className="text-xs text-slate-600 leading-snug">
                              Confirming this approval will <strong>permanently delete</strong> this entry from
                              both <code>info table</code> and <code>stock table</code>, and log an audit update.
                            </p>
                            <input
                              type="text"
                              placeholder="Admin disposal note (optional)"
                              value={adminNotes[item.cdciExpiryKey] || ''}
                              onChange={(e) =>
                                setAdminNotes({
                                  ...adminNotes,
                                  [item.cdciExpiryKey]: e.target.value,
                                })
                              }
                              className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-500 space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              Awaiting Head Pharmacist / Admin Review
                            </div>
                            <p className="text-[11px] leading-relaxed">
                              Seller has read-only access here. The batch will be deleted from Info and Stock tables once the Admin inspects and signs off.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Button for Admin */}
                      {isAdmin && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(item)}
                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Approve & Delete from Info & Stock</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          Enforces 2-person integrity check: Seller removes & Admin approves.
        </span>
        <span className="font-medium text-slate-600">
          Step 2 of 2: Admin Approval & Purge
        </span>
      </div>
    </div>
  );
};
