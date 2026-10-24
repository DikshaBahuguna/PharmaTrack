/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { X, ShoppingCart, AlertCircle, CheckCircle2, Pill, Boxes } from 'lucide-react';
import { parseCdciExpiryKey } from '../../utils/keyHelper';

interface EnterStockSoldModalProps {
  initialKey?: string;
  onClose: () => void;
}

export const EnterStockSoldModal: React.FC<EnterStockSoldModalProps> = ({
  initialKey = '',
  onClose,
}) => {
  const { stockTable, infoTable, sellerRecordStockSold } = useDatabase();
  const [selectedKey, setSelectedKey] = useState<string>(initialKey || (stockTable[0]?.cdciExpiryKey || ''));
  const [unitsSold, setUnitsSold] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (initialKey) {
      setSelectedKey(initialKey);
    }
  }, [initialKey]);

  const currentStock = stockTable.find((s) => s.cdciExpiryKey === selectedKey);
  const currentInfo = infoTable.find((i) => i.cdciExpiryKey === selectedKey);
  const available = currentStock ? currentStock.unitsAvailable : 0;
  const parsedKey = parseCdciExpiryKey(selectedKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedKey) {
      setError('Please select a medicine batch.');
      return;
    }

    if (unitsSold <= 0) {
      setError('Quantity sold must be at least 1 unit.');
      return;
    }

    if (unitsSold > available) {
      setError(`Cannot sell ${unitsSold} units. Only ${available} available in this batch.`);
      return;
    }

    const res = sellerRecordStockSold(selectedKey, unitsSold, notes);
    if (!res.success) {
      setError(res.error || 'Failed to record sale.');
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060910]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e1422] rounded-2xl max-w-md w-full shadow-2xl border border-white/[0.12] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-white/[0.08] bg-[#0c101a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Record Stock Sold</h3>
              <p className="text-xs text-slate-400">Seller action &bull; Deducted from inventory</p>
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
            <h4 className="text-base font-bold text-white">Sale Recorded Successfully!</h4>
            <p className="text-xs text-slate-400 font-mono">
              Deducted {unitsSold} units from batch {selectedKey}. Logged to Updates table.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Select Medicine Batch
              </label>
              <select
                value={selectedKey}
                onChange={(e) => {
                  setSelectedKey(e.target.value);
                  setError(null);
                }}
                className="w-full text-xs p-3 rounded-xl border border-white/[0.12] bg-[#080c14] focus:bg-[#0c101a] text-white focus:outline-none focus:border-blue-500 font-mono transition-colors cursor-pointer"
              >
                {stockTable.map((s) => {
                  const info = infoTable.find((i) => i.cdciExpiryKey === s.cdciExpiryKey);
                  return (
                    <option key={s.cdciExpiryKey} value={s.cdciExpiryKey} className="bg-[#0e1422] text-white">
                      {s.cdciExpiryKey} — {info?.medicineName || 'Medicine'} ({s.unitsAvailable} avail)
                    </option>
                  );
                })}
              </select>
            </div>

            {currentStock && (
              <div className="p-3.5 rounded-xl bg-[#090d16] border border-white/[0.08] text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5 font-bold text-white">
                    <Pill className="w-3.5 h-3.5 text-blue-400" />
                    {currentInfo?.medicineName}
                  </span>
                  <span className="font-mono text-slate-400">Batch: {currentInfo?.batchCode}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 font-mono text-[11px] pt-1 border-t border-white/[0.05]">
                  <span>Expiry Date: {parsedKey.formattedDate}</span>
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Units on Shelf: {available}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Units Sold (Subtracted from stock)
              </label>
              <div className="relative">
                <Boxes className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="number"
                  min="1"
                  max={available}
                  required
                  value={unitsSold}
                  onChange={(e) => setUnitsSold(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl bg-[#080c14] border border-white/[0.12] focus:border-blue-500 text-white focus:outline-none font-mono font-bold transition-colors"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                Remaining inventory after sale: <strong className="text-white font-mono">{Math.max(0, available - unitsSold)}</strong> units
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Prescription / Customer Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Rx #9941 / Walk-in counter sale"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-[#080c14] border border-white/[0.12] focus:border-blue-500 text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
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
                disabled={available <= 0}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-40 text-white text-xs font-bold transition-all duration-200 shadow-md shadow-blue-950/60 cursor-pointer"
              >
                Confirm Sale & Subtract Stock
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
