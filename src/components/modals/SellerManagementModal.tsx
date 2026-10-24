/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from '../../context/DatabaseContext';
import { X, Users, UserPlus, Trash2, Phone, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SellerManagementModalProps {
  onClose: () => void;
}

export const SellerManagementModal: React.FC<SellerManagementModalProps> = ({ onClose }) => {
  const { persons, adminAddSeller, adminRemoveSeller } = useDatabase();
  const [newPhone, setNewPhone] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const sellers = persons.filter((p) => p.type === 'seller');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!newPhone || !newName || !newPassword) {
      setError('Phone, Name and Password are all required.');
      return;
    }

    const res = adminAddSeller(newPhone, newName, newPassword);
    if (!res.success) {
      setError(res.error || 'Failed to add seller.');
    } else {
      setFeedback(`Seller ${newName} registered successfully!`);
      setNewPhone('');
      setNewName('');
      setNewPassword('');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleRemove = (phone: string, name: string) => {
    if (confirm(`Confirm removal of seller ${name} (${phone}) from active dispensary registry?`)) {
      const res = adminRemoveSeller(phone);
      if (!res.success) {
        setError(res.error || 'Failed to remove seller');
      } else {
        setFeedback(`Seller ${name} removed.`);
        setTimeout(() => setFeedback(null), 3000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060910]/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e1422] rounded-2xl max-w-lg w-full shadow-2xl border border-white/[0.12] overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-white/[0.08] bg-[#0c101a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Manage Dispensary Personnel</h3>
              <p className="text-xs text-slate-400">Admin authority: Provision or revoke seller accounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {feedback && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Add New Seller Form */}
          <form onSubmit={handleAdd} className="p-4 rounded-xl bg-[#090d16] border border-white/[0.08] space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              <UserPlus className="w-4 h-4 text-purple-400" />
              <span>Register New Seller Account</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-white/[0.1] bg-[#0c101a] text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+919876543299"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-white/[0.1] bg-[#0c101a] text-white font-mono focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Temporary Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Set initial password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-white/[0.1] bg-[#0c101a] text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.99] text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-950/60"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Seller Credentials</span>
            </button>
          </form>

          {/* Existing Sellers List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Current Registered Staff ({sellers.length})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Dispensary Personnel</span>
            </div>

            <div className="divide-y divide-white/[0.05] border border-white/[0.08] rounded-xl overflow-hidden bg-[#090d16]">
              {sellers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-mono">
                  No sellers registered.
                </div>
              ) : (
                sellers.map((seller) => (
                  <div
                    key={seller.phone}
                    className="p-3.5 hover:bg-white/[0.02] flex items-center justify-between gap-3 transition-colors duration-150"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{seller.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{seller.phone}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(seller.phone, seller.name)}
                      title="Remove Seller Account"
                      className="p-2 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#0c101a] border-t border-white/[0.08] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
