import React, { useState, useMemo } from 'react';
import { 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Layers, 
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { SMMService } from '../types';

interface ServicesCatalogViewProps {
  services: SMMService[];
  onSelectService: (serviceId: number) => void;
  onRefreshServices: () => Promise<void>;
  isSyncing: boolean;
}

export const ServicesCatalogView: React.FC<ServicesCatalogViewProps> = ({
  services,
  onSelectService,
  onRefreshServices,
  isSyncing,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [filterRefillOnly, setFilterRefillOnly] = useState<boolean>(false);
  const [selectedDetailService, setSelectedDetailService] = useState<SMMService | null>(null);

  const platforms = [
    { id: 'All', name: 'Semua Layanan' },
    { id: 'Instagram', name: 'Instagram' },
    { id: 'TikTok', name: 'TikTok' },
    { id: 'YouTube', name: 'YouTube' },
    { id: 'Twitter/X', name: 'Twitter / X' },
    { id: 'Facebook', name: 'Facebook' },
    { id: 'Marketplace', name: 'Shopee & Toped' },
    { id: 'Telegram', name: 'Telegram' },
    { id: 'Google/Review', name: 'Google Review' },
  ];

  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      // Platform filter
      if (selectedPlatform !== 'All' && svc.platform !== selectedPlatform) {
        return false;
      }
      // Refill only filter
      if (filterRefillOnly && !svc.refill) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = svc.name.toLowerCase().includes(query);
        const matchesCategory = svc.category.toLowerCase().includes(query);
        const matchesId = svc.service.toString().includes(query);
        const matchesDesc = (svc.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesId && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [services, selectedPlatform, filterRefillOnly, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Katalog Layanan & Harga
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Daftar lengkap paket buzzer dan optimasi media sosial dari server pusat buzzerpanel.id.
          </p>
        </div>

        {/* Sync Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshServices}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-xs font-semibold text-slate-200 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Mensinkronisasi Server...' : 'Sinkronkan dari buzzerpanel.id'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID layanan, nama layanan, TikTok FYP, Followers Indonesia, YouTube Watchtime..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Platform Tabs & Filter Toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-slate-800">
          
          {/* Platform Segmented Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {platforms.map((p) => {
              const isActive = selectedPlatform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* Quick Filter Checkbox */}
          <div className="flex items-center gap-4 shrink-0">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={filterRefillOnly}
                onChange={(e) => setFilterRefillOnly(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-950 border-slate-700"
              />
              <span>Garansi Refill</span>
            </label>
            <span className="text-xs text-slate-500 font-mono">
              Total: {filteredServices.length} layanan
            </span>
          </div>

        </div>

      </div>

      {/* Services Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 w-16">ID</th>
                <th className="py-3 px-4">Nama Layanan & Deskripsi</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Tarif / 1.000</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Min / Maks</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Kecepatan</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Refill</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada layanan yang sesuai dengan kata kunci "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredServices.map((svc) => (
                  <tr 
                    key={svc.service} 
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                      #{svc.service}
                    </td>

                    {/* Service Name & Category */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {svc.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                          <span className="text-slate-400 font-mono">{svc.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-400">{svc.platform}</span>
                          {svc.dripfeed && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-indigo-400 font-mono">Drip-Feed Support</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Rate */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 whitespace-nowrap tabular-nums">
                      Rp {svc.rate.toLocaleString('id-ID')}
                    </td>

                    {/* Min/Max */}
                    <td className="py-3.5 px-4 text-center font-mono text-slate-300 whitespace-nowrap tabular-nums">
                      {svc.min.toLocaleString('id-ID')} / {svc.max.toLocaleString('id-ID')}
                    </td>

                    {/* Speed */}
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400 whitespace-nowrap">
                      {svc.speed}
                    </td>

                    {/* Refill Guarantee */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {svc.refill ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                          <ShieldCheck className="w-3 h-3" />
                          30D
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          No Refill
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailService(svc)}
                          title="Lihat detail lengkap"
                          className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectService(svc.service)}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 font-semibold transition-all border border-cyan-500/40 hover:border-cyan-500 text-xs flex items-center gap-1"
                        >
                          <span>Pesan</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedDetailService && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-cyan-400">
                  Layanan #{selectedDetailService.service} · {selectedDetailService.platform}
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedDetailService.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetailService(null)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Deskripsi Pengerjaan:</span>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {selectedDetailService.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Tarif per 1.000 Unit:</span>
                  <span className="text-sm font-bold font-mono text-cyan-300">
                    Rp {selectedDetailService.rate.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Kecepatan Masuk:</span>
                  <span className="font-semibold text-white font-mono">
                    {selectedDetailService.speed}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Batasan Pemesanan:</span>
                  <span className="font-semibold text-white font-mono">
                    {selectedDetailService.min.toLocaleString('id-ID')} s/d {selectedDetailService.max.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Garansi Refill:</span>
                  <span className={`font-semibold font-mono ${selectedDetailService.refill ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {selectedDetailService.refill ? 'Ya, Garansi 30 Hari' : 'Tidak Bergaransi'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedDetailService(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  onSelectService(selectedDetailService.service);
                  setSelectedDetailService(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
              >
                Pesan Layanan Ini
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
