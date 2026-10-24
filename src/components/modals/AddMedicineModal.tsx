/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { formatCdciExpiryKey } from '../../utils/keyHelper';
import { X, PlusCircle, Pill, Calendar, Award, Hash, CheckCircle2, AlertCircle } from 'lucide-react';

interface AddMedicineModalProps {
  onClose: () => void;
  prefillCdciCode?: string;
  prefillMedicineName?: string;
}

export const AddMedicineModal: React.FC<AddMedicineModalProps> = ({
  onClose,
  prefillCdciCode = '',
  prefillMedicineName = '',
}) => {
  const { adminAddNewMedicine } = useDatabase();

  const [medicineName, setMedicineName] = useState(prefillMedicineName);
  const [cdciCode, setCdciCode] = useState(prefillCdciCode);
  const [expiryDate, setExpiryDate] = useState('2027-06-30');
  const [batchCode, setBatchCode] = useState('BCH-2026-001');
  const [drugLicenseNo, setDrugLicenseNo] = useState('DL-2024-MFG-771');
  const [category, setCategory] = useState('General');
  const [initialUnits, setInitialUnits] = useState<number>(50);
  const [thresholdAmount, setThresholdAmount] = useState<number>(30);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const previewKey = cdciCode && expiryDate ? formatCdciExpiryKey(expiryDate, cdciCode) : 'DDMMYYYYCODE';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!medicineName || !cdciCode || !expiryDate || !batchCode || !drugLicenseNo) {
      setError('All fields are required.');
      return;
    }

    const res = adminAddNewMedicine(
      {
        medicineName,
        cdciCode,
        expiryDate,
        batchCode,
        drugLicenseNo,
        category,
      },
      initialUnits,
      thresholdAmount
    );

    if (!res.success) {
      setError(res.error || 'Failed to add medicine');
    } else {
      setSuccess(`Created Info entry with key ${res.key} and added ${initialUnits} units to Stock.`);
      setTimeout(() => onClose(), 1600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060910]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e1422] rounded-2xl max-w-lg w-full shadow-2xl border border-white/[0.12] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-white/[0.08] bg-[#0c101a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Add Medicine Batch</h3>
              <p className="text-xs text-slate-400">Admin authority: Updates Info, Stock & Threshold tables</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Batch Registered!</h4>
            <p className="text-xs text-slate-400 font-mono">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Generated Key Callout */}
            <div className="p-3.5 rounded-xl bg-[#090d16] border border-teal-500/30 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-teal-400 tracking-wider block">
                  Generated CDCI + Expiry Key
                </span>
                <span className="font-mono text-sm font-extrabold text-teal-300">{previewKey}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono bg-white/[0.04] px-2 py-1 rounded border border-white/[0.08]">
                DDMMYYYY + CDCI
              </span>
            </div>

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
                    placeholder="e.g. Ibuprofen 400mg"
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
                    placeholder="e.g. IBU400"
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
                  placeholder="e.g. BCH-8831"
                  value={batchCode}
                  onChange={(e) => setBatchCode(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#080c14] border border-white/[0.12] focus:border-teal-500 text-white font-mono placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Drug Mfg License
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-2024-MFG-990"
                    value={drugLicenseNo}
                    onChange={(e) => setDrugLicenseNo(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-[#080c14] border border-white/[0.12] focus:border-teal-500 text-white font-mono placeholder-slate-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Category (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Analgesic, Antibiotic"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#080c14] border border-white/[0.12] focus:border-teal-500 text-white placeholder-slate-600 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-[#090d16] rounded-xl border border-white/[0.08]">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Initial Units to Add
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={initialUnits}
                  onChange={(e) => setInitialUnits(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#0e1422] border border-white/[0.12] focus:border-teal-500 text-white font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Minimum Safety Threshold
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={thresholdAmount}
                  onChange={(e) => setThresholdAmount(parseInt(e.target.value) || 1)}
                  className="w-full text-xs p-2.5 rounded-xl bg-[#0e1422] border border-white/[0.12] focus:border-teal-500 text-white font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:scale-[0.99] text-white text-xs font-bold transition-all duration-200 shadow-md shadow-teal-950/60 cursor-pointer"
              >
                Save Batch & Sync Master Tables
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
