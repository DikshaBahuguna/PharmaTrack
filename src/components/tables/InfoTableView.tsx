/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { parseCdciExpiryKey } from '../../utils/keyHelper';
import {
  FileText,
  Search,
  PlusCircle,
  Pill,
  Calendar,
  Hash,
  Award,
} from 'lucide-react';

interface InfoTableViewProps {
  onOpenAddMedicine?: () => void;
}

export const InfoTableView: React.FC<InfoTableViewProps> = ({ onOpenAddMedicine }) => {
  const { infoTable, currentUser } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = currentUser?.type === 'admin';

  const filteredItems = infoTable.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.medicineName.toLowerCase().includes(q) ||
      item.cdciExpiryKey.toLowerCase().includes(q) ||
      item.cdciCode.toLowerCase().includes(q) ||
      item.batchCode.toLowerCase().includes(q) ||
      item.drugLicenseNo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-[#0e1422] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden flex flex-col transition-all duration-200">
      {/* Table Header Toolbar */}
      <div className="p-6 border-b border-white/[0.06] bg-[#0c101a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Info Table</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Master records of medicine formulas, batch codes, and manufacturing licenses
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search CDCI, Batch, Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-white/[0.12] bg-[#080c14] focus:bg-[#0c101a] text-white focus:outline-none focus:border-teal-500 transition-colors placeholder-slate-600 font-mono"
            />
          </div>

          {isAdmin && onOpenAddMedicine && (
            <button
              type="button"
              onClick={onOpenAddMedicine}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white text-xs font-bold shadow-md shadow-teal-950/60 transition-all duration-200 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Medicine Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#090d16] text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/[0.08]">
              <th className="py-3.5 px-5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Hash className="w-3.5 h-3.5 text-teal-400" />
                  CDCI Code + Expiry Date
                </span>
              </th>
              <th className="py-3.5 px-5">Medicine Name</th>
              <th className="py-3.5 px-5">CDCI Code</th>
              <th className="py-3.5 px-5">Batch Code</th>
              <th className="py-3.5 px-5">Expiry Date</th>
              <th className="py-3.5 px-5">Drug Mfg License No</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-xs">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                  No matching records in Info table.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const parsed = parseCdciExpiryKey(item.cdciExpiryKey);
                return (
                  <tr key={item.cdciExpiryKey} className="hover:bg-white/[0.02] transition-colors duration-150">
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded border border-teal-500/20 inline-block text-xs">
                        {item.cdciExpiryKey}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-1 font-mono">
                        Date: {parsed.formattedDate} &bull; Code: {parsed.cdciCode}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Pill className="w-3.5 h-3.5 text-teal-400/80 shrink-0" />
                        <span>{item.medicineName}</span>
                      </div>
                      {item.category && (
                        <span className="text-[10px] text-slate-400 block ml-5 font-mono mt-0.5">
                          {item.category}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-slate-300 bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.08]">
                        {item.cdciCode}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-300 font-medium">
                      {item.batchCode}
                    </td>
                    <td className="py-4 px-5">
                      <span className="flex items-center gap-1.5 font-mono text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {parsed.formattedDate}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{item.drugLicenseNo}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-[#090d16] border-t border-white/[0.06] text-xs text-slate-400 flex justify-between items-center font-mono">
        <span>Total Records in Info Table: <strong className="text-white">{infoTable.length}</strong></span>
        <span className="text-slate-500">Master Formula Index</span>
      </div>
    </div>
  );
};
