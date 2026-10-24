/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';

export const PurchaseAlertBanner: React.FC = () => {
  const { purchaseAlerts } = useDatabase();

  if (purchaseAlerts.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-emerald-800 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Stock Levels Healthy:</span>
          <span className="text-emerald-700">All medicines currently have units at or above their minimum threshold.</span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium text-[11px]">
          Auto-monitoring active
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <TrendingDown className="w-4 h-4 text-rose-500" />
          Purchase Alerts (Ordered by Highest Deficit First)
        </span>
        <span className="text-[11px] text-amber-700 font-medium">
          {purchaseAlerts.length} medicine{purchaseAlerts.length > 1 ? 's' : ''} below threshold
        </span>
      </div>

      {purchaseAlerts.map((item, index) => {
        const unitsDeficit = item.thresholdAmount - item.totalUnitsAvailable;
        return (
          <div
            key={item.cdciCode}
            className="bg-amber-50/90 border-2 border-amber-400/90 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-white">
                  Purchase Alert
                </span>
                <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-amber-300">
                  CDCI: {item.cdciCode}
                </span>
                <span className="text-xs text-rose-700 font-extrabold bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                  <span>Priority #{index + 1}</span> &bull; <span>Deficit: -{unitsDeficit} units</span>
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {item.medicineName}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Total available stock is{' '}
                <span className="font-bold text-rose-700 font-mono text-sm">
                  {item.totalUnitsAvailable} units
                </span>
                , which is below the minimum safety threshold of{' '}
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {item.thresholdAmount} units
                </span>
                . Please purchase new stock.
                <span className="block mt-1 text-amber-800 font-medium">
                  &bull; Automatically removed when stock is logged in Delivered Stock Intake by seller.
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
