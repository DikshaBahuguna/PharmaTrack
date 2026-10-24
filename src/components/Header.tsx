/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
  Pill,
  ShieldCheck,
  ShoppingBag,
  LogOut,
  RotateCcw,
  Calendar,
  Phone,
  Radio,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    switchRoleDirectly,
    currentDate,
    setCurrentDate,
    resetToDefaultData,
  } = useDatabase();

  const isAdmin = currentUser?.type === 'admin';
  const isSeller = currentUser?.type === 'seller';

  return (
    <header className="bg-[#0b0f19] border-b border-white/[0.08] sticky top-0 z-40 backdrop-blur-md">
      {/* Simulation & Telemetry Status Bar */}
      <div className="bg-[#070a11] text-slate-400 text-xs px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] text-slate-400 tracking-tight">
            System Clock: <strong className="text-slate-200 font-mono">{currentDate}</strong>
          </span>
          <span className="text-slate-600 hidden md:inline text-[11px]">&bull; Expiry Evaluation Baseline</span>
        </div>

        <div className="flex items-center gap-3">
          {/* System Date Shifter */}
          <div className="flex items-center gap-1.5 bg-[#0f1422] px-2 py-0.5 rounded-lg border border-white/[0.08]">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              aria-label="Simulated Date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-mono focus:outline-none cursor-pointer"
            />
          </div>

          {/* Quick Persona Switcher for Evaluation */}
          <div className="flex items-center gap-1 bg-[#0f1422] p-1 rounded-lg border border-white/[0.08]">
            <span className="text-[10px] uppercase font-mono text-slate-400 px-1 font-bold">Role:</span>
            <button
              type="button"
              onClick={() => switchRoleDirectly('admin')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                isAdmin
                  ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => switchRoleDirectly('seller')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                isSeller
                  ? 'bg-blue-500 text-slate-950 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              Seller
            </button>
          </div>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={resetToDefaultData}
            title="Reset to default seeded state"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors duration-150 cursor-pointer px-2 py-1 rounded hover:bg-white/[0.04]"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/50 text-white border border-emerald-400/20">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-white tracking-tight">PharmaTrack</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Inventory & Expiry Safety Control System
            </p>
          </div>
        </div>

        {/* User Card & Actions */}
        <div className="flex items-center gap-3">
          {/* Active User Persona Badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#0f1422] border border-white/[0.08]">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-slate-950 font-bold ${
                isAdmin ? 'bg-emerald-400' : 'bg-blue-400'
              }`}
            >
              {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200 leading-none">
                  {currentUser?.name || 'User'}
                </span>
                <span
                  className={`text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded leading-tight ${
                    isAdmin
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {currentUser?.type}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                <Phone className="w-2.5 h-2.5 text-slate-500" />
                {currentUser?.phone}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 border border-rose-500/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
