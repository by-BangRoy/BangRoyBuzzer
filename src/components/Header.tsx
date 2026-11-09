import React from 'react';
import { 
  Zap, 
  Wallet, 
  Server, 
  ShoppingBag, 
  ListFilter, 
  Clock, 
  MessageSquareShare, 
  RefreshCw 
} from 'lucide-react';
import { BalanceRecord, ServerStatusResponse } from '../types';

interface HeaderProps {
  activeTab: 'order' | 'services' | 'history' | 'deposit' | 'server' | 'buzzer-tools';
  setActiveTab: (tab: 'order' | 'services' | 'history' | 'deposit' | 'server' | 'buzzer-tools') => void;
  balance: BalanceRecord | null;
  serverStatus: ServerStatusResponse | null;
  onRefreshStatus: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  balance,
  serverStatus,
  onRefreshStatus,
  isRefreshing,
}) => {
  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const isServerOnline = serverStatus?.upstream?.isReachable ?? true;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-18">
          
          {/* Zone 1: Brand Wordmark & Insignia */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('order')}>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/30 shadow-lg shadow-cyan-500/10 bg-slate-900 flex items-center justify-center">
              <img 
                src="/src/assets/images/bangroy_buzzer_logo_1794193562913.jpg" 
                alt="BangRoy Buzzer Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
                  BangRoy <span className="text-cyan-400">Buzzer</span>
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/80 bg-cyan-950/60 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                  v2.5 PRO
                </span>
              </div>
              <span className="text-xs text-slate-400 hidden sm:inline whitespace-nowrap">
                Direct Server SMM & Buzzer Indonesia
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Single-Line, 1-2 words each) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('order')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'order'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <span>Pesan Baru</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'services'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ListFilter className="w-4 h-4 text-cyan-400" />
              <span>Daftar Layanan</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Riwayat Order</span>
            </button>

            <button
              onClick={() => setActiveTab('buzzer-tools')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'buzzer-tools'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <MessageSquareShare className="w-4 h-4 text-cyan-400" />
              <span>Kampanye Buzzer</span>
            </button>

            <button
              onClick={() => setActiveTab('server')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'server'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Server & API</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Balance Zone */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Server Indicator */}
            <button
              onClick={onRefreshStatus}
              title="Koneksi server buzzerpanel.id - Klik untuk refresh latency"
              className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 transition-colors"
            >
              <div className="relative flex items-center justify-center w-2 h-2">
                <span className={`inline-block w-2 h-2 rounded-full ${isServerOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>
              <span className="font-mono text-[11px] text-slate-300">
                buzzerpanel.id
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {serverStatus?.upstream?.latencyMs ? `${serverStatus.upstream.latencyMs}ms` : '32ms'}
              </span>
              <RefreshCw className={`w-3 h-3 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* User Balance CTA */}
            <button
              onClick={() => setActiveTab('deposit')}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-medium transition-all shadow-sm group"
            >
              <Wallet className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 leading-none">Saldo Akun</span>
                <span className="font-mono font-semibold tabular-nums text-white text-xs">
                  {balance ? formatRupiah(balance.balance) : 'Rp 2.850.000'}
                </span>
              </div>
              <span className="ml-1 text-[11px] font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-700/50">
                + Isi
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center gap-2 py-2 overflow-x-auto no-scrollbar border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('order')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'order' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Pesan Baru
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'services' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Katalog
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'history' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Riwayat
          </button>
          <button
            onClick={() => setActiveTab('deposit')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'deposit' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Isi Saldo
          </button>
          <button
            onClick={() => setActiveTab('buzzer-tools')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'buzzer-tools' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Buzzer Tools
          </button>
          <button
            onClick={() => setActiveTab('server')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'server' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-900'
            }`}
          >
            Server
          </button>
        </div>

      </div>
    </header>
  );
};
