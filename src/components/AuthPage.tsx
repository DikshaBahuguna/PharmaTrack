/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import {
  ShieldCheck,
  ShoppingBag,
  Pill,
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
  Activity,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login } = useDatabase();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const res = login(phone, password);
      if (!res.success) {
        setError(res.error || 'Failed to authenticate');
      }
      setLoading(false);
    }, 200);
  };

  const handleQuickLogin = (demoPhone: string, demoPass: string) => {
    setError(null);
    login(demoPhone, demoPass);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header Bar */}
      <header className="border-b border-white/[0.06] bg-[#0c101a]/70 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/20">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-white tracking-tight">PharmaTrack</span>
                <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  Secure OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Pharmaceutical Safety & Verification Gateway</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.06]">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Telemetry: Operational</span>
          </div>
        </div>
      </header>

      {/* Main Container - Asymmetric Architectural Layout */}
      <main className="max-w-7xl w-full mx-auto px-6 py-10 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center flex-1">
        {/* Left Column: Asymmetric Brand & Telemetry Showcase (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Controlled Dispensary Access Protocol
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
              Real-time Expiry Audits & Stock Verification.
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed font-normal">
              A dual-verification operating environment. Sellers log newly received stock and physically isolate expired batches; Administrators audit, verify, and sign off disposal.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            <div className="p-4 rounded-xl bg-[#0f1523] border border-white/[0.07] space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">Physical Audit</div>
              <div className="text-xs font-semibold text-slate-200">Mandatory Shelf Quarantine</div>
              <p className="text-[11px] text-slate-400 leading-normal">Seller confirms physical removal before admin approval.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0f1523] border border-white/[0.07] space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">Delivery Intake</div>
              <div className="text-xs font-semibold text-slate-200">Automated Safety Clears</div>
              <p className="text-[11px] text-slate-400 leading-normal">Logging stock instantly resolves low threshold alerts.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0f1523] border border-white/[0.07] space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">Audit Ledger</div>
              <div className="text-xs font-semibold text-slate-200">Immutable Records</div>
              <p className="text-[11px] text-slate-400 leading-normal">Every unit sold or discarded is stamped with actor credentials.</p>
            </div>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="p-5 rounded-2xl bg-[#0e1422] border border-white/[0.08] shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  ⚡ 1-Click Evaluation Accounts
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded">
                  Instant Test Session
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">Select a persona to test flows</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Admin Persona */}
              <button
                type="button"
                onClick={() => handleQuickLogin('+919876543210', 'admin')}
                className="group p-3.5 rounded-xl bg-[#121929] hover:bg-[#162035] border border-emerald-500/20 hover:border-emerald-500/40 text-left flex items-start gap-3 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform duration-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                    Administrator
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">Approval Lead</span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-0.5">Dr. Rajesh Sharma</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">+919876543210</div>
                </div>
              </button>

              {/* Seller Persona */}
              <button
                type="button"
                onClick={() => handleQuickLogin('+919876543220', 'seller')}
                className="group p-3.5 rounded-xl bg-[#121929] hover:bg-[#162035] border border-blue-500/20 hover:border-blue-500/40 text-left flex items-start gap-3 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform duration-200">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5">
                    Dispensary Seller
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300">Counter Staff</span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-0.5">Amit Patel</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">+919876543220</div>
                </div>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              *User creation is restricted to Administrators from the internal dashboard management console.
            </p>
          </div>
        </div>

        {/* Right Column: Sign In Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-[#0e1422] border border-white/[0.09] rounded-2xl p-7 sm:p-9 shadow-2xl relative overflow-hidden">
            {/* Subtle top indicator bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

            <div className="space-y-2 mb-7">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Sign In</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide your verified pharmaceutical phone credentials to establish an active session.
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Phone Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Registered Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full bg-[#080c14] border border-white/[0.12] focus:border-emerald-500/80 rounded-xl py-3 pl-10 pr-3.5 text-sm font-mono text-white placeholder-slate-600 focus:outline-none transition-all duration-200 focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Security Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#080c14] border border-white/[0.12] focus:border-emerald-500/80 rounded-xl py-3 pl-10 pr-3.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-all duration-200 focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="font-mono text-xs">Authenticating token...</span>
                ) : (
                  <>
                    <span>Enter Workplace Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-5 border-t border-white/[0.06] text-center">
              <p className="text-xs text-slate-500">
                Staff accounts are provisioned exclusively by internal Pharmacist Administrators.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0c101a]/70 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        PharmaTrack Clinical Architecture &bull; ISO-9001 Safety Compliance &bull; Strict Role Isolation
      </footer>
    </div>
  );
};
