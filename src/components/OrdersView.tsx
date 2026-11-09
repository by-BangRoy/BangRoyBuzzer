import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  RotateCcw, 
  RefreshCw, 
  Search, 
  ExternalLink, 
  Download,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { OrderItem } from '../types';

interface OrdersViewProps {
  orders: OrderItem[];
  onRefreshOrders: () => void;
  onNavigateToNewOrder: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onRefreshOrders,
  onNavigateToNewOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [refillLoadingId, setRefillLoadingId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== 'All' && order.status !== statusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesService = order.serviceName.toLowerCase().includes(query);
        const matchesLink = order.link.toLowerCase().includes(query);
        const matchesUpstream = (order.upstreamOrderId || '').toLowerCase().includes(query);
        if (!matchesId && !matchesService && !matchesLink && !matchesUpstream) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter((o) => o.status === 'Completed').length;
    const inProgress = orders.filter((o) => o.status === 'In Progress' || o.status === 'Processing').length;
    const totalSpent = orders.reduce((acc, o) => acc + o.charge, 0);
    return { total, completed, inProgress, totalSpent };
  }, [orders]);

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCheckStatus = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    setActionNotice(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`);
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Status pesanan #${orderId} berhasil disinkronkan langsung dari server!`);
        onRefreshOrders();
      }
    } catch (err: any) {
      setActionNotice(`Gagal mengecek status: ${err.message}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleRequestRefill = async (orderId: string) => {
    setRefillLoadingId(orderId);
    setActionNotice(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/refill`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        onRefreshOrders();
      } else {
        setActionNotice(data.error || 'Gagal meminta refill');
      }
    } catch (err: any) {
      setActionNotice(`Error: ${err.message}`);
    } finally {
      setRefillLoadingId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Tanggal', 'Layanan', 'Target Link', 'Jumlah', 'Biaya', 'Status', 'Sisa', 'Upstream ID'];
    const rows = filteredOrders.map((o) => [
      o.id,
      new Date(o.date).toLocaleString('id-ID'),
      `"${o.serviceName.replace(/"/g, '""')}"`,
      `"${o.link}"`,
      o.quantity,
      o.charge,
      o.status,
      o.remains,
      o.upstreamOrderId || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BangRoy_Buzzer_Orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const getStatusBadge = (status: OrderItem['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/40">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
            <Clock className="w-3 h-3 animate-spin" />
            In Progress
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-800/40">
            Processing
          </span>
        );
      case 'Partial':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/40">
            Partial
          </span>
        );
      case 'Canceled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-red-400 bg-red-950/60 px-2.5 py-1 rounded-md border border-red-800/40">
            Canceled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Riwayat & Status Pesanan
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pantau status pengerjaan buzzer secara realtime langsung terhubung ke server buzzerpanel.id.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-300 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onRefreshOrders}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-xs font-semibold text-slate-300 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium">Total Pesanan</span>
          <div className="text-2xl font-extrabold font-mono text-white mt-1 tabular-nums">
            {stats.total.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium">Sedang Diproses</span>
          <div className="text-2xl font-extrabold font-mono text-cyan-400 mt-1 tabular-nums">
            {stats.inProgress.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium">Selesai (Completed)</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1 tabular-nums">
            {stats.completed.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <span className="text-xs text-slate-400 font-medium">Total Pengeluaran</span>
          <div className="text-2xl font-extrabold font-mono text-cyan-300 mt-1 tabular-nums">
            {formatRupiah(stats.totalSpent)}
          </div>
        </div>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="mb-6 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-between text-xs text-cyan-200">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID Pesanan (#BR-xxxxx), URL target, atau nama layanan..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {['All', 'Processing', 'In Progress', 'Completed', 'Partial', 'Canceled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              {st === 'All' ? 'Semua Status' : st}
            </button>
          ))}
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">ID & Waktu</th>
                <th className="py-3 px-4">Layanan & Target Link</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Kuantitas</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Biaya</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Status Pesanan</th>
                <th className="py-3 px-4 text-center whitespace-nowrap">Server Sync</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p>Belum ada riwayat pesanan yang cocok.</p>
                      <button
                        onClick={onNavigateToNewOrder}
                        className="px-4 py-2 mt-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                      >
                        Buat Pesanan Pertama
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* ID & Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-cyan-400">
                          #{ord.id}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {new Date(ord.date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Service & Link */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white truncate">
                          {ord.serviceName}
                        </span>
                        
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                          <a
                            href={ord.link.startsWith('http') ? ord.link : `https://${ord.link}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:underline truncate max-w-xs font-mono"
                          >
                            {ord.link}
                          </a>
                          <button
                            onClick={() => handleCopyLink(ord.link, ord.id)}
                            title="Salin link target"
                            className="text-slate-400 hover:text-white p-0.5"
                          >
                            {copiedId === ord.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Quantity & Remains */}
                    <td className="py-3.5 px-4 text-center font-mono whitespace-nowrap">
                      <div className="font-semibold text-white tabular-nums">
                        {ord.quantity.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        Sisa: {ord.remains.toLocaleString('id-ID')}
                      </div>
                    </td>

                    {/* Charge */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-cyan-300 whitespace-nowrap tabular-nums">
                      {formatRupiah(ord.charge)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(ord.status)}
                    </td>

                    {/* Server Sync */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {ord.upstreamOrderId ? `${ord.upstreamOrderId}` : 'Server Gateway'}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        ● {ord.serverSyncStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Check Status */}
                        <button
                          type="button"
                          onClick={() => handleCheckStatus(ord.id)}
                          disabled={updatingOrderId === ord.id}
                          title="Cek status terkini dari server"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-[11px] font-medium transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 text-cyan-400 ${updatingOrderId === ord.id ? 'animate-spin' : ''}`} />
                          <span>Cek</span>
                        </button>

                        {/* Refill Button if allowed */}
                        {ord.refillAllowed && (
                          <button
                            type="button"
                            onClick={() => handleRequestRefill(ord.id)}
                            disabled={refillLoadingId === ord.id || ord.refillStatus === 'Processing'}
                            title="Ajukan refill otomatis ke buzzerpanel"
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 border ${
                              ord.refillStatus === 'Processing'
                                ? 'bg-amber-950/40 text-amber-300 border-amber-700/50 cursor-not-allowed'
                                : 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40 hover:bg-cyan-500 hover:text-slate-950'
                            }`}
                          >
                            <RotateCcw className={`w-3 h-3 ${refillLoadingId === ord.id ? 'animate-spin' : ''}`} />
                            <span>{ord.refillStatus === 'Processing' ? 'Refilling...' : 'Refill'}</span>
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
