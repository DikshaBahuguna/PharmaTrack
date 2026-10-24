/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { parseCdciExpiryKey, isExpired } from '../../utils/keyHelper';
import {
  Boxes,
  Search,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Pill,
  Clock,
} from 'lucide-react';

interface StockTableViewProps {
  onOpenSellModal?: (cdciExpiryKey: string) => void;
}

export const StockTableView: React.FC<StockTableViewProps> = ({
  onOpenSellModal,
}) => {
  const { stockTable, infoTable, thresholdTable, currentUser, currentDate } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');

  const isSeller = currentUser?.type === 'seller';

  const infoMap = new Map(infoTable.map((i) => [i.cdciExpiryKey, i]));
  const thresholdMap = new Map(thresholdTable.map((t) => [t.cdciCode, t]));

  const enrichedStock = stockTable.map((stock) => {
    const info = infoMap.get(stock.cdciExpiryKey);
    const parsedKey = parseCdciExpiryKey(stock.cdciExpiryKey);
    const cdciCode = info?.cdciCode || parsedKey.cdciCode;
    const thresholdInfo = thresholdMap.get(cdciCode);
    const expired = info ? isExpired(info.expiryDate, currentDate) : false;

    return {
      ...stock,
      medicineName: info?.medicineName || 'Unknown Medicine',
      batchCode: info?.batchCode || 'N/A',
      expiryDate: info?.expiryDate || parsedKey.isoDate,
      formattedExpiry: parsedKey.formattedDate,
      cdciCode,
      isExpired: expired,
      isBelowThreshold: thresholdInfo
        ? thresholdInfo.totalUnitsAvailable < thresholdInfo.thresholdAmount
        : false,
    };
  });

  const filteredItems = enrichedStock.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.medicineName.toLowerCase().includes(q) ||
      item.cdciExpiryKey.toLowerCase().includes(q) ||
      item.cdciCode.toLowerCase().includes(q) ||
      item.batchCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-[#0e1422] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden flex flex-col transition-all duration-200">
      {/* Header Toolbar */}
      <div className="p-6 border-b border-white/[0.06] bg-[#0c101a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Stock Details Table</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Live inventory units per batch and dispensary stock availability
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search stock by name, batch, key..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-white/[0.12] bg-[#080c14] focus:bg-[#0c101a] text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600 font-mono"
            />
          </div>

          {isSeller && onOpenSellModal && (
            <button
              type="button"
              onClick={() => onOpenSellModal('')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-blue-950/60 transition-all duration-200 shrink-0 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Enter Stock Sold</span>
            </button>
          )}
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#090d16] text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/[0.08]">
              <th className="py-3.5 px-5">CDCI Code + Expiry Date</th>
              <th className="py-3.5 px-5">Medicine Name</th>
              <th className="py-3.5 px-5">Batch</th>
              <th className="py-3.5 px-5">Expiry Date</th>
              <th className="py-3.5 px-5 text-center">Units Available</th>
              <th className="py-3.5 px-5">Batch Status</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-xs">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-mono">
                  No stock records available.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.cdciExpiryKey} className="hover:bg-white/[0.02] transition-colors duration-150">
                  <td className="py-4 px-5">
                    <span className="font-mono font-bold text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20 inline-block text-xs">
                      {item.cdciExpiryKey}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <Pill className="w-3.5 h-3.5 text-blue-400/80 shrink-0" />
                      <span>{item.medicineName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono text-slate-300">
                    {item.batchCode}
                  </td>
                  <td className="py-4 px-5 font-mono text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{item.formattedExpiry}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span
                      className={`font-mono font-extrabold text-sm px-3 py-1 rounded-full border ${
                        item.unitsAvailable === 0
                          ? 'bg-slate-800 text-slate-400 border-white/[0.08]'
                          : item.unitsAvailable < 20
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {item.unitsAvailable}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    {item.isExpired ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        Expired (Alert Active)
                      </span>
                    ) : item.isBelowThreshold ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" />
                        Below Threshold
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle className="w-3 h-3" />
                        Available
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isSeller ? (
                        <button
                          type="button"
                          onClick={() => onOpenSellModal?.(item.cdciExpiryKey)}
                          disabled={item.unitsAvailable <= 0 || item.isExpired}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-semibold text-xs transition-all duration-200 cursor-pointer shadow-sm"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Sell Stock</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono italic">Read-only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-[#090d16] border-t border-white/[0.06] text-xs text-slate-400 flex justify-between items-center font-mono">
        <span>Active Batches in Stock: <strong className="text-white">{stockTable.length}</strong></span>
        <span>
          Total Stock Across All Batches:{' '}
          <strong className="text-emerald-400 font-mono text-sm">
            {stockTable.reduce((acc, s) => acc + s.unitsAvailable, 0)} units
          </strong>
        </span>
      </div>
    </div>
  );
};
