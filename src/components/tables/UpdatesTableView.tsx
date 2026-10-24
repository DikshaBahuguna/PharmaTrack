/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  History,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Phone,
  User,
  Trash2,
  Calendar,
  Filter,
} from 'lucide-react';
import { UpdateActionType } from '../../types/database';

export const UpdatesTableView: React.FC = () => {
  const { updatesTable } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredUpdates = updatesTable.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      item.medicineName.toLowerCase().includes(q) ||
      item.cdciExpiryKey.toLowerCase().includes(q) ||
      item.updaterName.toLowerCase().includes(q) ||
      item.updaterPhone.includes(q) ||
      item.notes.toLowerCase().includes(q);

    const matchesAction = actionFilter === 'ALL' || item.actionType === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: UpdateActionType) => {
    switch (action) {
      case 'STOCK_SOLD':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <ArrowDownRight className="w-3 h-3 text-blue-400" />
            Stock Sold (Seller)
          </span>
        );
      case 'STOCK_EXPIRED_REMOVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <Trash2 className="w-3 h-3 text-rose-400" />
            Expired Approved & Deleted
          </span>
        );
      case 'STOCK_ADDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            Stock Added (Admin Approved)
          </span>
        );
      case 'STOCK_REMOVED_MANUAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <ArrowDownRight className="w-3 h-3 text-amber-400" />
            Manual Removal
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0e1422] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden flex flex-col transition-all duration-200">
      {/* Header Toolbar */}
      <div className="p-6 border-b border-white/[0.06] bg-[#0c101a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <History className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Updates Table (Audit Trail)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Immutable audit ledger recording all stock sold, expired purges, and restock actions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Filter by user, medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-white/[0.12] bg-[#080c14] focus:bg-[#0c101a] text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-600 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#080c14] border border-white/[0.12] rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-slate-300 text-xs py-1.5 focus:outline-none font-mono cursor-pointer"
            >
              <option value="ALL" className="bg-[#0e1422] text-white">All Actions</option>
              <option value="STOCK_SOLD" className="bg-[#0e1422] text-white">Stock Sold</option>
              <option value="STOCK_EXPIRED_REMOVED" className="bg-[#0e1422] text-white">Expired Approved</option>
              <option value="STOCK_ADDED" className="bg-[#0e1422] text-white">Stock Added</option>
              <option value="STOCK_REMOVED_MANUAL" className="bg-[#0e1422] text-white">Manual Removed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#090d16] text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/[0.08]">
              <th className="py-3.5 px-5">Date of Update</th>
              <th className="py-3.5 px-5">Updater Name & Phone</th>
              <th className="py-3.5 px-5">CDCI Code + Expiry Date</th>
              <th className="py-3.5 px-5">Action Type</th>
              <th className="py-3.5 px-5 text-center">Amount Removed / Added</th>
              <th className="py-3.5 px-5">Notes & Context</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-xs">
            {filteredUpdates.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                  No records found in Updates table.
                </td>
              </tr>
            ) : (
              filteredUpdates.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block ml-5 mt-0.5">
                      {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{item.updaterName}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded uppercase bg-white/[0.06] text-slate-400 border border-white/[0.08]">
                        {item.updaterRole}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                      <Phone className="w-3 h-3 text-slate-600" />
                      <span>{item.updaterPhone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 inline-block text-[11px]">
                      {item.cdciExpiryKey}
                    </span>
                    <span className="block text-xs text-slate-300 font-medium mt-1">
                      {item.medicineName}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    {getActionBadge(item.actionType)}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span
                      className={`font-mono font-extrabold text-sm px-3 py-1 rounded-lg inline-block border ${
                        item.actionType === 'STOCK_ADDED'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {item.actionType === 'STOCK_ADDED' ? `+${item.amountRemovedOrSold}` : `-${item.amountRemovedOrSold}`}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">units</span>
                  </td>
                  <td className="py-4 px-5 text-slate-400 max-w-xs text-xs leading-relaxed">
                    {item.notes}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-[#090d16] border-t border-white/[0.06] text-xs text-slate-400 flex justify-between items-center font-mono">
        <span>Total Audit Records: <strong className="text-white">{updatesTable.length}</strong></span>
        <span className="text-slate-500">Cryptographically Chronological</span>
      </div>
    </div>
  );
};
