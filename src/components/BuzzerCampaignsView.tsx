import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Send, 
  MessageSquare, 
  Shuffle, 
  Layers, 
  CheckCircle2,
  TrendingUp,
  Store,
  MapPin,
  Flame
} from 'lucide-react';
import { BuzzerTemplate } from '../types';

interface BuzzerCampaignsViewProps {
  onUseTemplate: (comments: string[], targetPlatform?: string) => void;
}

export const BuzzerCampaignsView: React.FC<BuzzerCampaignsViewProps> = ({
  onUseTemplate,
}) => {
  const [templates, setTemplates] = useState<BuzzerTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('olshop-umkm');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Spintax Generator State
  const [spintaxInput, setSpintaxInput] = useState<string>(
    '{Produknya|Barangnya|Orderan} {bagus|mantap|keren|recomended} banget {min|kak|gan}! Pengiriman {super kilat|cepat|aman} dan packaging {rapi|tebal}. {Pasti langganan|Next beli lagi|Terima kasih}!'
  );
  const [generatedSpins, setGeneratedSpins] = useState<string[]>([]);
  const [spinCount, setSpinCount] = useState<number>(10);

  useEffect(() => {
    fetch('/api/buzzer-templates')
      .then((r) => r.json())
      .then((data) => {
        if (data.templates) setTemplates(data.templates);
      })
      .catch((err) => console.error('Error fetching templates:', err));
  }, []);

  // Spin Spintax function
  const spin = (text: string): string => {
    return text.replace(/\{([^{}]+)\}/g, (_, choices) => {
      const options = choices.split('|');
      return options[Math.floor(Math.random() * options.length)];
    });
  };

  const handleGenerateSpintax = () => {
    const list: string[] = [];
    for (let i = 0; i < spinCount; i++) {
      list.push(spin(spintaxInput));
    }
    setGeneratedSpins(list);
  };

  useEffect(() => {
    handleGenerateSpintax();
  }, []);

  const handleCopyComments = (comments: string[], id: string) => {
    navigator.clipboard.writeText(comments.join('\n'));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-cyan-400" />
          <span>Tools Kampanye Buzzer Indonesia</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Koleksi template komentar buzzer siap pakai dan generator teks spintax unik agar interaksi akun terlihat sangat alami.
        </p>
      </div>

      {/* Main Grid: Template Library & Spintax Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        
        {/* Left: Template Library (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Koleksi Template Komentar Siap Pakai
              </h3>
              <span className="text-xs text-slate-400">
                Pilih kategori dan langsung kirim ke form pemesanan
              </span>
            </div>
          </div>

          {/* Template Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {templates.map((tpl) => {
              const isActive = selectedTemplateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 border-cyan-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-xs font-bold block truncate">{tpl.name}</span>
                  <span className="text-[10px] text-cyan-400/80 block mt-0.5">{tpl.platform}</span>
                </button>
              );
            })}
          </div>

          {/* Active Template Comments List */}
          {activeTemplate && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span>Daftar {activeTemplate.comments.length} Komentar Alami:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyComments(activeTemplate.comments, activeTemplate.id)}
                    className="flex items-center gap-1 text-slate-300 hover:text-white"
                  >
                    {copiedId === activeTemplate.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === activeTemplate.id ? 'Tersalin' : 'Salin Semua'}</span>
                  </button>
                  <span aria-hidden="true">·</span>
                  <button
                    onClick={() => onUseTemplate(activeTemplate.comments, activeTemplate.platform)}
                    className="flex items-center gap-1 text-cyan-400 hover:underline font-semibold"
                  >
                    <Send className="w-3 h-3" />
                    <span>Gunakan di Form</span>
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {activeTemplate.comments.map((comment, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-2.5"
                  >
                    <span className="font-mono text-cyan-500 font-bold text-[11px] shrink-0 mt-0.5">
                      #{idx + 1}
                    </span>
                    <span className="leading-relaxed">{comment}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onUseTemplate(activeTemplate.comments, activeTemplate.platform)}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Masukkan {activeTemplate.comments.length} Komentar Ini ke Form Pemesanan</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Spintax Custom Generator (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-cyan-400" />
              Generator Spintax Buzzer Unik
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Acak variasi kata dengan format <code className="text-cyan-400 font-mono">{"{pilihan 1|pilihan 2}"}</code> untuk menghasilkan puluhan teks unik.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">
                  Pola Teks Spintax:
                </label>
                <textarea
                  value={spintaxInput}
                  onChange={(e) => setSpintaxInput(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Jumlah:</span>
                  <select
                    value={spinCount}
                    onChange={(e) => setSpinCount(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                  >
                    <option value={5}>5 Variasi</option>
                    <option value={10}>10 Variasi</option>
                    <option value={20}>20 Variasi</option>
                    <option value={50}>50 Variasi</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateSpintax}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-400 flex items-center gap-1.5"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Generate Acak</span>
                </button>
              </div>

              {/* Output Preview */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span>Hasil Acak ({generatedSpins.length} teks):</span>
                  <button
                    onClick={() => handleCopyComments(generatedSpins, 'spintax')}
                    className="text-cyan-400 hover:underline"
                  >
                    {copiedId === 'spintax' ? 'Tersalin!' : 'Salin Semua'}
                  </button>
                </div>
                
                <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 max-h-48 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1.5">
                  {generatedSpins.map((s, idx) => (
                    <div key={idx} className="pb-1 border-b border-slate-900 last:border-0">
                      {idx + 1}. {s}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onUseTemplate(generatedSpins)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gunakan Hasil Acak Ini di Form Pesanan ({generatedSpins.length} Unit)</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
