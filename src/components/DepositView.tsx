import React, { useState } from 'react';
import { 
  Wallet, 
  QrCode, 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowDownLeft, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { BalanceRecord } from '../types';

interface DepositViewProps {
  balance: BalanceRecord | null;
  onDepositSuccess: () => void;
}

export const DepositView: React.FC<DepositViewProps> = ({
  balance,
  onDepositSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'qris' | 'bank' | 'ewallet'>('qris');
  const [amount, setAmount] = useState<number>(100000);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [depositNotice, setDepositNotice] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const presets = [50000, 100000, 250000, 500000, 1000000, 2500000];

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleProcessDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 10000) {
      alert('Minimal deposit adalah Rp 10.000');
      return;
    }

    setIsLoading(true);
    setDepositNotice(null);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          method: selectedMethod === 'qris' ? 'QRIS Realtime 24 Jam' : selectedMethod === 'bank' ? 'Transfer Bank Otomatis' : 'E-Wallet Instant',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses deposit');
      }

      setDepositNotice(data.message);
      onDepositSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Isi Saldo & Riwayat Mutasi
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Deposit saldo otomatis 24 jam dengan QRIS Real-time, Transfer Bank, dan E-Wallet tanpa biaya admin.
        </p>
      </div>

      {depositNotice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{depositNotice}</span>
          </div>
          <button onClick={() => setDepositNotice(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Grid: Deposit Form + Account Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleProcessDeposit} className="space-y-6">
            
            {/* Step 1: Select Method */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                1. Pilih Saluran Pembayaran
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('qris')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'qris'
                      ? 'bg-cyan-500/15 border-cyan-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                  <span className="text-xs font-bold block">QRIS Realtime</span>
                  <span className="text-[10px] text-slate-400">Semua Bank & E-Wallet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('bank')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'bank'
                      ? 'bg-cyan-500/15 border-cyan-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
                  <span className="text-xs font-bold block">Transfer Bank</span>
                  <span className="text-[10px] text-slate-400">BCA, BRI, Mandiri</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('ewallet')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedMethod === 'ewallet'
                      ? 'bg-cyan-500/15 border-cyan-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                  <span className="text-xs font-bold block">E-Wallet</span>
                  <span className="text-[10px] text-slate-400">DANA, OVO, GoPay</span>
                </button>
              </div>
            </div>

            {/* Step 2: Nominal Input & Presets */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                2. Jumlah Deposit (Rupiah)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">
                  Rp
                </span>
                <input
                  type="number"
                  min={10000}
                  step={5000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  required
                />
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2.5">
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium transition-colors border ${
                      amount === val
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {val >= 1000000 ? `${val / 1000000} Juta` : `${val / 1000}K`}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Method Details Preview */}
            {selectedMethod === 'qris' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
                <div className="p-3 bg-white rounded-xl shadow-md shrink-0 flex items-center justify-center">
                  <div className="w-28 h-28 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white p-2 text-center">
                    <QrCode className="w-14 h-14 text-cyan-400" />
                    <span className="text-[9px] font-mono font-bold mt-1 text-slate-300">QRIS REALTIME</span>
                  </div>
                </div>
                <div className="text-xs text-slate-300 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Instan Otomatis 24 Jam</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Dapat di-scan memakai GoPay, OVO, DANA, ShopeePay, BCA Mobile, Livin Mandiri, BRImo, dan seluruh perbankan Indonesia.
                  </p>
                  <p className="text-[11px] text-cyan-400 font-mono">
                    Total bayar: {formatRupiah(amount)} (Termasuk kode verifikasi)
                  </p>
                </div>
              </div>
            )}

            {selectedMethod === 'bank' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <div>
                    <span className="text-white font-bold block">BCA (Bank Central Asia)</span>
                    <span className="text-slate-400 font-mono">Rekening: 8830-1928-44</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('8830192844', 'bca')}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 hover:text-white"
                  >
                    {copiedField === 'bca' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Salin</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-400">
                  Atas Nama: <b className="text-slate-200">BANG ROY BUZZER INDONESIA</b>
                </div>
              </div>
            )}

            {selectedMethod === 'ewallet' && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <div>
                    <span className="text-white font-bold block">DANA / OVO / GoPay</span>
                    <span className="text-slate-400 font-mono">Nomor: 0812-8899-7721</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('081288997721', 'ewallet')}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 hover:text-white"
                  >
                    {copiedField === 'ewallet' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Salin</span>
                  </button>
                </div>
                <div className="text-[11px] text-slate-400">
                  Nama Akun: <b className="text-slate-200">Bang Roy Buzzer Official</b>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Memproses Verifikasi Real-time...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Konfirmasi & Isi Saldo Sekarang ({formatRupiah(amount)})</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right Info: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Account Balance Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400">
                <Wallet className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Dompet Buzzer</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                AKTIF 24 JAM
              </span>
            </div>

            <div className="my-5">
              <span className="text-xs text-slate-400">Sisa Saldo Tersedia:</span>
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white mt-1 tabular-nums">
                {balance ? formatRupiah(balance.balance) : 'Rp 2.850.000'}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Nama Akun:</span>
                <span className="font-semibold text-slate-200">{balance?.userName || 'Bang Roy Official'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Level Reseller:</span>
                <span className="font-mono text-cyan-400 font-semibold">{balance?.userRole || 'Master VIP'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mata Uang:</span>
                <span className="font-mono text-slate-300">IDR (Rupiah Indonesia)</span>
              </div>
            </div>
          </div>

          {/* Deposit Info Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Keamanan Saldo & Transaksi
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Saldo akun BangRoy Buzzer aman dan langsung terkoneksi ke API gateway buzzerpanel.id untuk eksekusi pesanan otomatis tanpa penundaan.
            </p>
            <div className="text-[11px] text-slate-400 space-y-1">
              <p>• Minimal pengisian saldo adalah Rp 10.000</p>
              <p>• Bebas potongan biaya admin untuk semua metode pembayaran</p>
              <p>• Layanan bantuan konfirmasi WhatsApp: 24 Jam standby</p>
            </div>
          </div>

        </div>

      </div>

      {/* Mutasi Saldo Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Riwayat Mutasi Saldo
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Catatan transaksi deposit dan pembayaran pesanan secara transparan.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">ID Transaksi</th>
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Keterangan Transaksi</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Nominal</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Sisa Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {!balance?.mutasi || balance.mutasi.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada riwayat mutasi saldo.
                  </td>
                </tr>
              ) : (
                balance.mutasi.map((m) => {
                  const isDeposit = m.amount > 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-cyan-400">
                        {m.id}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(m.date).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-sans">
                        {m.description}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold whitespace-nowrap tabular-nums ${isDeposit ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isDeposit ? `+${formatRupiah(m.amount)}` : formatRupiah(m.amount)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 font-bold whitespace-nowrap tabular-nums">
                        {formatRupiah(m.balanceAfter)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
