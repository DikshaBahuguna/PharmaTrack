/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { ExpiryAlertItem } from '../types/database';
import { parseCdciExpiryKey } from '../utils/keyHelper';
import {
  AlertOctagon,
  CheckSquare,
  Square,
  ArrowRight,
  Pill,
  Clock,
  PackageX,
  Lock,
  AlertTriangle,
} from 'lucide-react';

export const ChecklistAlerts: React.FC = () => {
  const { activeExpiryAlerts, sellerConfirmPhysicalRemoval, currentUser } = useDatabase();
  const [selectedKeys, setSelectedKeys] = useState<Record<string, boolean>>({});
  const [removalNotes, setRemovalNotes] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const isSeller = currentUser?.type === 'seller';
  const isAdmin = currentUser?.type === 'admin';

  const toggleCheck = (key: string) => {
    if (!isSeller) return;
    setSelectedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleConfirmRemoval = (item: ExpiryAlertItem) => {
    if (!isSeller) return;
    const note = removalNotes[item.cdciExpiryKey] || 'Stock physically removed from shelf and quarantined.';
    const res = sellerConfirmPhysicalRemoval(item.cdciExpiryKey, note);
    if (res.success) {
      setActionMessage(`Batch ${item.batchCode} physically removed. Sent to Admin Review checklist.`);
      setSelectedKeys((prev) => {
        const next = { ...prev };
        delete next[item.cdciExpiryKey];
        return next;
      });
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Helper for color coding based on urgency
  const getUrgencyStyles = (urgency: 'expired' | 'two_weeks' | 'two_months', isChecked: boolean) => {
    if (isChecked) {
      return {
        cardBorder: 'border-emerald-300 bg-emerald-50/40 shadow-sm',
        badgeClass: 'bg-emerald-600 text-white',
        badgeText: 'SELECTED FOR REMOVAL',
        dateText: 'text-emerald-700',
        pillIcon: 'text-emerald-600',
      };
    }

    switch (urgency) {
      case 'expired':
        // RED: expired meds
        return {
          cardBorder: 'border-rose-300 bg-rose-50/30 hover:border-rose-400',
          badgeClass: 'bg-rose-600 text-white',
          badgeText: 'EXPIRED',
          dateText: 'text-rose-700',
          pillIcon: 'text-rose-600',
        };
      case 'two_weeks':
        // ORANGE: expires in 2 weeks
        return {
          cardBorder: 'border-orange-300 bg-orange-50/30 hover:border-orange-400',
          badgeClass: 'bg-orange-500 text-white',
          badgeText: 'EXPIRES IN 2 WEEKS',
          dateText: 'text-orange-700',
          pillIcon: 'text-orange-600',
        };
      case 'two_months':
        // YELLOW: expires in 2 months
        return {
          cardBorder: 'border-amber-300 bg-amber-50/40 hover:border-amber-400',
          badgeClass: 'bg-amber-400 text-amber-950 font-extrabold',
          badgeText: 'EXPIRES IN 2 MONTHS',
          dateText: 'text-amber-800',
          pillIcon: 'text-amber-600',
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-rose-50/70 via-orange-50/50 to-amber-50/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Expiry Alerts</h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                {activeExpiryAlerts.length}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ordered by earliest expiry date &bull; Red (Expired), Orange (in 2 Weeks), Yellow (in 2 Months)
            </p>
          </div>
        </div>

        {/* Access Rights Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border">
          {isSeller ? (
            <span className="text-emerald-700 bg-emerald-50 border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              Seller Can Update
            </span>
          ) : (
            <span className="text-slate-600 bg-slate-100 border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Admin: Read Only Access
            </span>
          )}
        </div>
      </div>

      {/* Visual Color Legend */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-600">Legend:</span>
          <span className="inline-flex items-center gap-1 font-bold text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
            Expired (Red)
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-orange-700">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
            Expires in 2 Weeks (Orange)
          </span>
          <span className="inline-flex items-center gap-1 font-bold text-amber-800">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            Expires in 2 Months (Yellow)
          </span>
        </div>
        <span className="text-slate-400 font-mono text-[10px]">
          Sorted: Earliest Expiry First
        </span>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 text-emerald-800 text-xs px-4 py-2 border-b border-emerald-100 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Checklist Content */}
      <div className="p-4 sm:p-5 flex-1">
        {activeExpiryAlerts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <PackageX className="w-6 h-6" />
            </div>
            {/* EXACT REQUIRED PLACEHOLDER TEXT */}
            <p className="text-base font-medium text-slate-400">no current alerts</p>
            <p className="text-xs text-slate-400 mt-1">
              All active medicine batches are safe beyond 2 months.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeExpiryAlerts.map((item) => {
              const isChecked = !!selectedKeys[item.cdciExpiryKey];
              const parsedKey = parseCdciExpiryKey(item.cdciExpiryKey);
              const styles = getUrgencyStyles(item.urgency, isChecked);

              // Descriptive text for remaining time
              let timeLabel = '';
              if (item.daysRemaining < 0) {
                timeLabel = `Expired ${Math.abs(item.daysRemaining)} days ago`;
              } else if (item.daysRemaining === 0) {
                timeLabel = 'Expires today';
              } else {
                timeLabel = `Expires in ${item.daysRemaining} days`;
              }

              return (
                <div
                  key={item.cdciExpiryKey}
                  className={`rounded-xl border transition-all ${styles.cardBorder}`}
                >
                  {/* Two Columns Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                    {/* COLUMN 1: Batch & Medicine Info with Color Badging */}
                    <div className="lg:col-span-7 p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${styles.badgeClass}`}>
                              {styles.badgeText}
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {item.cdciExpiryKey}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1.5 flex items-center gap-1.5">
                            <Pill className={`w-4 h-4 shrink-0 ${styles.pillIcon}`} />
                            {item.medicineName}
                          </h3>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-xs font-mono font-bold block ${styles.dateText}`}>
                            {parsedKey.formattedDate}
                          </span>
                          <span className="text-[11px] text-slate-600 font-medium block">
                            {timeLabel}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Units: <strong className="text-slate-800 font-mono text-xs">{item.unitsAvailable}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400 block">Batch Code</span>
                          <span className="font-mono font-semibold text-slate-800">{item.batchCode}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">CDCI Code</span>
                          <span className="font-mono font-semibold text-slate-800">{item.cdciCode}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-slate-400 block">Drug Mfg License</span>
                          <span className="font-mono font-semibold text-slate-800 truncate block">
                            {item.drugLicenseNo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* COLUMN 2: Physical Removal Checklist Action */}
                    <div className="lg:col-span-5 p-4 bg-slate-50/60 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                            Physical Removal Verification
                          </span>
                          {isSeller ? (
                            <span className="text-[11px] text-emerald-600 font-medium">Seller Action</span>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Read-Only</span>
                          )}
                        </div>

                        {isSeller ? (
                          <div className="space-y-2">
                            <label
                              onClick={() => toggleCheck(item.cdciExpiryKey)}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition ${
                                isChecked
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium'
                                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                              }`}
                            >
                              <div className="mt-0.5 text-emerald-600 shrink-0">
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <span className="leading-snug">
                                I have physically removed all <strong>{item.unitsAvailable} units</strong> of this batch from the dispensary shelf.
                              </span>
                            </label>

                            {isChecked && (
                              <input
                                type="text"
                                placeholder="Removal location (e.g., Placed in Quarantine Box A)"
                                value={removalNotes[item.cdciExpiryKey] || ''}
                                onChange={(e) =>
                                  setRemovalNotes({
                                    ...removalNotes,
                                    [item.cdciExpiryKey]: e.target.value,
                                  })
                                }
                                className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 focus:border-emerald-500 focus:outline-none"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-500 space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              Seller Update Required
                            </div>
                            <p className="text-[11px] leading-relaxed">
                              Admin has read-only access here. Seller must physically remove the stock from shelf and check this item.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Submit action for seller */}
                      {isSeller && (
                        <div className="pt-2">
                          <button
                            type="button"
                            disabled={!isChecked}
                            onClick={() => handleConfirmRemoval(item)}
                            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <span>Confirm & Move to Admin Review</span>
                            <ArrowRight className="w-3.5 h-3.5" />
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
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          Earliest expiry displayed first &bull; Step 1 of 2: Seller Physical Removal
        </span>
      </div>
    </div>
  );
};
