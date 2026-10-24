/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import {
  Gauge,
  Search,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Check,
  Pill,
} from 'lucide-react';

export const ThresholdTableView: React.FC = () => {
  const { thresholdTable, adminUpdateThreshold, currentUser } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const isAdmin = currentUser?.type === 'admin';

  const handleStartEdit = (cdciCode: string, currentVal: number) => {
    if (!isAdmin) return;
    setEditingCode(cdciCode);
    setEditValue(currentVal);
  };

  const handleSaveEdit = (cdciCode: string) => {
    adminUpdateThreshold(cdciCode, editValue);
    setEditingCode(null);
  };

  const filtered = thresholdTable.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.medicineName.toLowerCase().includes(q) ||
      item.cdciCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-[#0e1422] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden flex flex-col transition-all duration-200">
      {/* Header Toolbar */}
      <div className="p-6 border-b border-white/[0.06] bg-[#0c101a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Gauge className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Threshold Targets</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Minimum safety targets grouped per CDCI Code. Automatically triggers procurement warnings if violated.
              </p>
            </div>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search CDCI Code or Medicine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-white/[0.12] bg-[#080c14] focus:bg-[#0c101a] text-white focus:outline-none focus:border-amber-500 transition-colors placeholder-slate-600 font-mono"
          />
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#090d16] text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/[0.08]">
              <th className="py-3.5 px-5">CDCI Code</th>
              <th className="py-3.5 px-5">Medicine Name</th>
              <th className="py-3.5 px-5 text-center">
                Threshold Target (Min Target)
              </th>
              <th className="py-3.5 px-5 text-center">
                Total Units Actually Available
              </th>
              <th className="py-3.5 px-5">Compliance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-xs">
            {filtered.map((item) => {
              const isBelow = item.totalUnitsAvailable < item.thresholdAmount;
              const isEditing = editingCode === item.cdciCode;

              return (
                <tr key={item.cdciCode} className="hover:bg-white/[0.02] transition-colors duration-150">
                  <td className="py-4 px-5 font-mono font-bold text-white">
                    <span className="bg-white/[0.05] px-2.5 py-1 rounded border border-white/[0.08] text-slate-200">
                      {item.cdciCode}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <Pill className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                      <span>{item.medicineName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-center">
                    {isEditing ? (
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          className="w-16 px-2 py-1 text-xs border border-indigo-500 rounded bg-[#080c14] text-white text-center focus:outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item.cdciCode)}
                          className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer transition-colors"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 font-mono font-bold text-slate-200 text-sm">
                        <span>{item.thresholdAmount}</span>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item.cdciCode, item.thresholdAmount)}
                            title="Edit Threshold Target"
                            className="text-slate-500 hover:text-amber-400 p-1 rounded hover:bg-white/[0.04] cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <span
                      className={`font-mono font-extrabold text-sm px-3.5 py-1 rounded-full border ${
                        isBelow
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {item.totalUnitsAvailable} units
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    {isBelow ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Below Threshold (Alert Active)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Safety Threshold Met
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-[#090d16] border-t border-white/[0.06] text-xs text-slate-400 flex justify-between items-center font-mono">
        <span>Tracked Formulations: <strong className="text-white">{thresholdTable.length}</strong></span>
        <span className="text-slate-500">Real-time Batch Aggregation</span>
      </div>
    </div>
  );
};
