import React, { useState, useEffect, useMemo } from 'react';
import { 
  Instagram, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  HelpCircle, 
  ExternalLink,
  ShieldCheck,
  Zap,
  RotateCcw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SMMService, BalanceRecord } from '../types';

interface NewOrderViewProps {
  services: SMMService[];
  balance: BalanceRecord | null;
  onOrderSuccess: (order: any) => void;
  onNavigateToDeposit: () => void;
  onOpenTemplates: () => void;
  initialServiceId?: number | null;
}

export const NewOrderView: React.FC<NewOrderViewProps> = ({
  services,
  balance,
  onOrderSuccess,
  onNavigateToDeposit,
  onOpenTemplates,
  initialServiceId,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Instagram');
  const [selectedServiceId, setSelectedServiceId] = useState<number>(101);
  const [link, setLink] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1000);
  const [customComments, setCustomComments] = useState<string>('');
  const [dripFeedEnabled, setDripFeedEnabled] = useState<boolean>(false);
  const [runs, setRuns] = useState<number>(5);
  const [intervalMin, setIntervalMin] = useState<number>(60);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  // Filter services by platform
  const filteredServices = useMemo(() => {
    return services.filter((s) => s.platform === selectedPlatform);
  }, [services, selectedPlatform]);

  // Set selected service
  useEffect(() => {
    if (initialServiceId) {
      const found = services.find((s) => s.service === initialServiceId);
      if (found) {
        setSelectedPlatform(found.platform);
        setSelectedServiceId(found.service);
        setQuantity(found.min);
        return;
      }
    }

    if (filteredServices.length > 0) {
      const currentExists = filteredServices.some((s) => s.service === selectedServiceId);
      if (!currentExists) {
        setSelectedServiceId(filteredServices[0].service);
        setQuantity(filteredServices[0].min);
      }
    }
  }, [selectedPlatform, filteredServices, initialServiceId, services]);

  const activeService = useMemo(() => {
    return services.find((s) => s.service === selectedServiceId) || filteredServices[0];
  }, [services, selectedServiceId, filteredServices]);

  // If comments change, update quantity automatically
  const isCustomCommentService = activeService?.type === 'Custom Comments';

  const commentLines = useMemo(() => {
    if (!customComments) return [];
    return customComments
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  }, [customComments]);

  useEffect(() => {
    if (isCustomCommentService) {
      const count = Math.max(activeService ? activeService.min : 5, commentLines.length || 5);
      setQuantity(count);
    }
  }, [commentLines, isCustomCommentService, activeService]);

  // Price calculations
  const totalCost = useMemo(() => {
    if (!activeService) return 0;
    const ratePerUnit = activeService.rate / 1000;
    return Math.round(ratePerUnit * (quantity || 0));
  }, [activeService, quantity]);

  const hasSufficientBalance = balance ? balance.balance >= totalCost : true;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!activeService) {
      setErrorMsg('Silakan pilih layanan.');
      return;
    }

    if (!link.trim()) {
      setErrorMsg('Target Link atau Username wajib diisi.');
      return;
    }

    if (quantity < activeService.min) {
      setErrorMsg(`Jumlah minimum untuk layanan ini adalah ${activeService.min.toLocaleString('id-ID')}`);
      return;
    }

    if (quantity > activeService.max) {
      setErrorMsg(`Jumlah maksimum untuk layanan ini adalah ${activeService.max.toLocaleString('id-ID')}`);
      return;
    }

    if (isCustomCommentService && commentLines.length < activeService.min) {
      setErrorMsg(`Masukkan minimal ${activeService.min} baris komentar (1 baris 1 komentar).`);
      return;
    }

    if (!hasSufficientBalance) {
      setErrorMsg('Saldo Anda tidak mencukupi untuk pesanan ini. Silakan lakukan deposit saldo terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: activeService.service,
          link: link.trim(),
          quantity,
          comments: isCustomCommentService ? commentLines : undefined,
          dripfeed: dripFeedEnabled ? { runs, interval: intervalMin } : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat pesanan');
      }

      setSuccessOrder(data.order);
      onOrderSuccess(data.order);
      setLink('');
      setCustomComments('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  const platforms = [
    { id: 'Instagram', name: 'Instagram', icon: '📸', color: 'text-pink-400' },
    { id: 'TikTok', name: 'TikTok', icon: '🎵', color: 'text-cyan-400' },
    { id: 'YouTube', name: 'YouTube', icon: '▶️', color: 'text-red-400' },
    { id: 'Twitter/X', name: 'Twitter / X', icon: '🐦', color: 'text-blue-400' },
    { id: 'Facebook', name: 'Facebook', icon: '📘', color: 'text-indigo-400' },
    { id: 'Marketplace', name: 'Marketplace', icon: '🛍️', color: 'text-orange-400' },
    { id: 'Telegram', name: 'Telegram', icon: '✈️', color: 'text-sky-400' },
    { id: 'Google/Review', name: 'Google Review', icon: '⭐', color: 'text-amber-400' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Page Title & Breadcrumb */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Pesan Layanan Buzzer & SMM
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Terhubung langsung ke server pusat buzzerpanel.id dengan pemrosesan otomatis 24/7.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenTemplates}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-xs font-medium text-slate-200 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Koleksi Template Buzzer</span>
          </button>
        </div>
      </div>

      {/* Success Modal / Banner */}
      {successOrder && (
        <div className="mb-6 p-5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 shadow-lg shadow-cyan-950/20">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold text-white">
                  Pesanan Berhasil Dikirim ke Server!
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  ID Pesanan: <span className="font-mono font-bold text-cyan-300">{successOrder.id}</span> · Server Sync: <span className="font-mono text-emerald-400">{successOrder.serverSyncStatus}</span>
                </p>
                <div className="mt-3 text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1 font-mono">
                  <span>Layanan: {successOrder.serviceName.slice(0, 40)}...</span>
                  <span>Jumlah: {successOrder.quantity.toLocaleString('id-ID')} unit</span>
                  <span>Biaya: Rp {successOrder.charge.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSuccessOrder(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-xs text-red-200">
            <span className="font-semibold text-red-100">Gagal Memproses: </span>
            {errorMsg}
          </div>
        </div>
      )}

      {/* Main Grid: Form + Service Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            
            {/* Step 1: Select Platform */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                1. Pilih Kategori Media Sosial
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {platforms.map((p) => {
                  const isActive = selectedPlatform === p.id;
                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setSelectedPlatform(p.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 border border-cyan-500 text-white shadow-sm shadow-cyan-500/20'
                          : 'bg-slate-950/60 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{p.icon}</span>
                      <span className="truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Service */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  2. Pilih Layanan Spesifik
                </label>
                <span className="text-xs text-slate-400">
                  Tersedia: {filteredServices.length} varian
                </span>
              </div>

              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              >
                {filteredServices.map((s) => (
                  <option key={s.service} value={s.service}>
                    #{s.service} - {s.name} (Rp {s.rate.toLocaleString('id-ID')} / 1K)
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3: Target Link or Username */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  3. Target Link / Username Akun
                </label>
                <span className="text-[11px] text-slate-400">
                  {activeService?.platform === 'Instagram' && activeService.category.includes('Followers') 
                    ? 'Format: https://instagram.com/username atau @username'
                    : 'Format: URL postingan lengkap'}
                </span>
              </div>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={
                  activeService?.platform === 'Instagram'
                    ? 'https://www.instagram.com/p/xxxxx/ atau username'
                    : activeService?.platform === 'TikTok'
                    ? 'https://www.tiktok.com/@user/video/xxxxx'
                    : 'https://...'
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                Pastikan akun/postingan tidak disetel privat (mode publik) selama proses pengerjaan.
              </p>
            </div>

            {/* Step 4: Custom Comments (Conditional) or Quantity */}
            {isCustomCommentService ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    4. Masukkan Teks Komentar Kustom Buzzer
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400">
                      {commentLines.length} baris komentar
                    </span>
                    <button
                      type="button"
                      onClick={onOpenTemplates}
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Gunakan Template
                    </button>
                  </div>
                </div>
                <textarea
                  value={customComments}
                  onChange={(e) => setCustomComments(e.target.value)}
                  rows={5}
                  placeholder={`Masukkan 1 komentar per baris:\nProduknya mantap banget min!\nPackaging aman dan pengiriman kilat.\nRecommended seller, bakal langganan deh.`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition-colors"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Setiap baris akan dieksekusi oleh 1 akun buzzer yang berbeda. Minimal {activeService?.min} komentar.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    4. Jumlah / Kuantitas Pemesanan
                  </label>
                  <span className="text-xs font-mono text-slate-400">
                    Min: {activeService?.min.toLocaleString('id-ID')} · Max: {activeService?.max.toLocaleString('id-ID')}
                  </span>
                </div>
                
                <input
                  type="number"
                  value={quantity}
                  min={activeService?.min || 10}
                  max={activeService?.max || 100000}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                  required
                />

                {/* Quick Add Buttons */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="text-[11px] text-slate-500 mr-1">Cepat:</span>
                  {[500, 1000, 2500, 5000, 10000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setQuantity(val)}
                      className="px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-mono text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                      +{val.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Drip Feed Option (Optional) */}
            {activeService?.dripfeed && !isCustomCommentService && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="text-xs font-semibold text-white">Mode Drip-Feed (Bertahap Alami)</span>
                      <p className="text-[11px] text-slate-400">Bagi pesanan ke beberapa batch pengiriman agar terlihat sangat organik.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={dripFeedEnabled}
                    onChange={(e) => setDripFeedEnabled(e.target.checked)}
                    className="w-4 h-4 text-cyan-500 rounded bg-slate-900 border-slate-700 focus:ring-cyan-500"
                  />
                </div>

                {dripFeedEnabled && (
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Total Eksekusi (Runs)</label>
                      <input
                        type="number"
                        min={2}
                        max={60}
                        value={runs}
                        onChange={(e) => setRuns(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Interval (Menit)</label>
                      <input
                        type="number"
                        min={10}
                        max={1440}
                        value={intervalMin}
                        onChange={(e) => setIntervalMin(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Total Charge & Balance Check */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400">Total Biaya Pemesanan:</span>
                <div className="text-xl sm:text-2xl font-extrabold text-cyan-300 font-mono tracking-tight">
                  Rp {totalCost.toLocaleString('id-ID')}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400">Sisa Saldo Anda:</span>
                <div className={`text-xs font-mono font-semibold ${hasSufficientBalance ? 'text-emerald-400' : 'text-red-400'}`}>
                  Rp {balance?.balance.toLocaleString('id-ID') || '0'}
                </div>
                {!hasSufficientBalance && (
                  <button
                    type="button"
                    onClick={onNavigateToDeposit}
                    className="mt-1 text-[11px] text-cyan-400 hover:underline font-medium flex items-center gap-1 justify-end"
                  >
                    <span>+ Top Up Saldo</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !hasSufficientBalance}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                isLoading
                  ? 'bg-cyan-700 text-slate-200 cursor-wait'
                  : !hasSufficientBalance
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Mengirimkan ke Server buzzerpanel.id...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesanan Sekarang (Proses Otomatis)</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right Info: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Service Detail Card */}
          {activeService && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono uppercase text-cyan-400">
                  Detail Layanan #{activeService.service}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activeService.category}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-3 leading-snug">
                {activeService.name}
              </h3>

              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                {activeService.description}
              </p>

              {/* Specs Strip */}
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kecepatan</span>
                  </div>
                  <span className="font-semibold text-white font-mono">{activeService.speed}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Garansi Refill</span>
                  </div>
                  <span className={`font-semibold font-mono ${activeService.refill ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {activeService.refill ? 'Tersedia (30 Hari)' : 'Tidak Ada Refill'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Min Pesanan</span>
                  <span className="font-semibold text-white font-mono">{activeService.min.toLocaleString('id-ID')} unit</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-slate-400 block mb-1">Maks Pesanan</span>
                  <span className="font-semibold text-white font-mono">{activeService.max.toLocaleString('id-ID')} unit</span>
                </div>
              </div>

              {/* Price Callout */}
              <div className="mt-4 p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-between">
                <span className="text-xs text-slate-300">Tarif Dasar per 1.000:</span>
                <span className="text-sm font-bold font-mono text-cyan-300">
                  Rp {activeService.rate.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}

          {/* Quick Guidelines Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Ketentuan & Garansi BangRoy Buzzer
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>Pesanan diproses langsung oleh sistem server buzzerpanel.id secara otomatis.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>Jangan memasukkan pesanan kedua pada link yang sama sebelum pesanan sebelumnya berstatus <b>Completed</b>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>Untuk layanan bertanda <b>Refill</b>, tombol refill otomatis aktif di menu Riwayat jika terjadi penurunan.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
