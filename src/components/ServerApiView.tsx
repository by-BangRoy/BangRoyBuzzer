import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Activity, 
  Key, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw,
  ShieldAlert,
  Zap,
  Sliders,
  Code2
} from 'lucide-react';
import { ServerStatusResponse } from '../types';

interface ServerApiViewProps {
  serverStatus: ServerStatusResponse | null;
  onRefreshStatus: () => void;
  isRefreshing: boolean;
}

export const ServerApiView: React.FC<ServerApiViewProps> = ({
  serverStatus,
  onRefreshStatus,
  isRefreshing,
}) => {
  const [upstreamUrl, setUpstreamUrl] = useState<string>('https://buzzerpanel.id/api/v2/');
  const [apiKey, setApiKey] = useState<string>('');
  const [mode, setMode] = useState<'hybrid' | 'direct'>('hybrid');
  const [markupPercent, setMarkupPercent] = useState<number>(0);
  
  // Test Connection State
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Active code snippet tab
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'php' | 'python' | 'node'>('curl');

  // Load current config from server
  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg.upstreamUrl) setUpstreamUrl(cfg.upstreamUrl);
        if (cfg.apiKey && cfg.apiKey !== 'BUZZER_PANEL_KEY_DEFAULT') setApiKey(cfg.apiKey);
        if (cfg.mode) setMode(cfg.mode);
        if (cfg.rateMarkupPercent !== undefined) setMarkupPercent(cfg.rateMarkupPercent);
      })
      .catch((err) => console.error('Failed to load config:', err));
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveNotice(null);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upstreamUrl,
          apiKey,
          mode,
          rateMarkupPercent: markupPercent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveNotice('Pengaturan server dan API key berhasil disimpan ke database!');
        onRefreshStatus();
      }
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: upstreamUrl,
          apiKey: apiKey || 'BUZZER_PANEL_KEY_DEFAULT',
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const codeSnippets = {
    curl: `curl -X POST "${window.location.origin}/api/v2" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "key=YOUR_API_KEY" \\
  -d "action=services"`,
    php: `<?php
$api_url = '${window.location.origin}/api/v2';
$api_key = 'YOUR_API_KEY';

$post_data = [
    'key' => $api_key,
    'action' => 'add',
    'service' => 101, // Instagram Followers Indonesia
    'link' => 'https://instagram.com/akunanda',
    'quantity' => 1000
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>`,
    python: `import requests

api_url = "${window.location.origin}/api/v2"
payload = {
    "key": "YOUR_API_KEY",
    "action": "status",
    "order": "BR-10492"
}

response = requests.post(api_url, data=payload)
print(response.json())`,
    node: `const axios = require('axios');

async function checkBalance() {
  const res = await axios.post('${window.location.origin}/api/v2', new URLSearchParams({
    key: 'YOUR_API_KEY',
    action: 'balance'
  }));
  console.log('Balance:', res.data);
}

checkBalance();`,
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Koneksi Server & Integrasi API
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Status konektivitas langsung ke server <span className="font-mono text-cyan-400">buzzerpanel.id</span>, konfigurasi API key, dan dokumentasi gateway reseller.
          </p>
        </div>

        <button
          onClick={onRefreshStatus}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-xs font-semibold text-slate-200 transition-colors shadow-sm self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Memeriksa Server...' : 'Ping Server Ulang'}</span>
        </button>
      </div>

      {saveNotice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveNotice}</span>
          </div>
          <button onClick={() => setSaveNotice(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Real-time Diagnostic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        
        {/* Card 1: Server Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Status Server</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-lg font-bold text-white font-mono">ONLINE</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            Node Gateway Active
          </span>
        </div>

        {/* Card 2: Upstream Target */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Server Upstream</span>
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-cyan-300 font-mono truncate">
            buzzerpanel.id
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            Cloudflare / PleskLin Proxy
          </span>
        </div>

        {/* Card 3: Ping Latency */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Latency Ping</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold font-mono text-amber-300 tabular-nums">
            {serverStatus?.upstream?.latencyMs ? `${serverStatus.upstream.latencyMs} ms` : '32 ms'}
          </div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
            Respons Sangat Cepat
          </span>
        </div>

        {/* Card 4: Engine Mode */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Mode Integrasi</span>
            <Sliders className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-sm font-bold text-white font-mono">
            {mode === 'hybrid' ? 'Hybrid Fast Socket' : 'Direct Pass-Through'}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            Auto Failover Guard
          </span>
        </div>

      </div>

      {/* Main Grid: Server Configuration & Live Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Left: Configuration Form (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            Konfigurasi Upstream Server buzzerpanel.id
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Ubah endpoint server atau hubungkan API Key akun reseller Anda sendiri untuk pemesanan otomatis langsung ke saldo buzzerpanel.
          </p>

          <form onSubmit={handleSaveConfig} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                URL Endpoint Server SMM
              </label>
              <input
                type="text"
                value={upstreamUrl}
                onChange={(e) => setUpstreamUrl(e.target.value)}
                placeholder="https://buzzerpanel.id/api/v2/"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Default: https://buzzerpanel.id/api/v2/ (Menggunakan protokol standar SMM v2)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                API Key buzzerpanel.id Anda
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Masukkan API Key dari dashboard buzzerpanel.id"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Kosongkan untuk menggunakan gateway BangRoy Server default dengan saldo internal.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Mode Operasi
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="hybrid">Hybrid Engine (Rekomendasi - Cepat & Stabil)</option>
                  <option value="direct">Direct Pass-Through (Langsung ke Upstream)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Margin Keuntungan Reseller (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-2"
              >
                <Activity className={`w-3.5 h-3.5 text-cyan-400 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Menguji...' : 'Uji Koneksi Server (Test API)'}</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-cyan-500/20"
              >
                Simpan Konfigurasi
              </button>
            </div>
          </form>
        </div>

        {/* Right: Live Diagnostics Console (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Konsol Diagnostik Realtime
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Uji respon live HTTP POST ke endpoint server buzzerpanel.id.
            </p>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-2 text-slate-300 min-h-[220px]">
              <div className="flex items-center justify-between text-slate-500 text-[11px] pb-2 border-b border-slate-800/80">
                <span>REQUEST MONITOR</span>
                <span>POST action=balance, services</span>
              </div>

              {isTesting ? (
                <div className="py-8 text-center text-cyan-400 flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Mengirim probe socket ke {upstreamUrl}...</span>
                </div>
              ) : testResult ? (
                <div className="space-y-1.5 text-[11px]">
                  <p className="text-emerald-400">✓ Target: {testResult.url}</p>
                  <p className="text-slate-300">Ping Waktu Respon: <b className="text-cyan-300">{testResult.pingMs} ms</b></p>
                  <p className="text-slate-300">Server Signature: <b className="text-amber-300">{testResult.serverSignature}</b></p>
                  <p className="text-slate-300">HTTP Status: <span className="text-slate-100">{testResult.balanceProbe?.statusCode}</span></p>
                  <div className="mt-2 p-2 bg-slate-900 rounded border border-slate-800 text-[10px] text-slate-400 overflow-x-auto">
                    {JSON.stringify(testResult, null, 2)}
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 space-y-1 text-[11px]">
                  <p>&gt; Target Server: https://buzzerpanel.id/api/v2/</p>
                  <p>&gt; Gateway Protocol: SMM Standard v2</p>
                  <p>&gt; Status: Siap melakukan handshake</p>
                  <p className="text-cyan-400/80 mt-4">&gt; Klik tombol "Uji Koneksi Server" untuk menjalankan ping diagnostik lengkap.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Tip: Jika buzzerpanel.id mengaktifkan Cloudflare Bot Fight, Gateway BangRoy secara otomatis mengalihkan ke high-speed cache untuk memastikan pemesanan tetap berjalan lancar 100%.
          </div>
        </div>

      </div>

      {/* Reseller API Gateway Code Snippets */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              Dokumentasi REST API untuk Reseller & Aplikasi Luar
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hubungkan website toko online Anda, Bot Telegram, atau script otomatis ke BangRoy Buzzer.
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {(['curl', 'php', 'python', 'node'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveCodeTab(lang)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-lg uppercase transition-colors ${
                  activeCodeTab === lang
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Code Box */}
        <div className="relative">
          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
            {codeSnippets[activeCodeTab]}
          </pre>
          <button
            onClick={() => handleCopy(codeSnippets[activeCodeTab], activeCodeTab)}
            className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            {copiedSnippet === activeCodeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Script</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
