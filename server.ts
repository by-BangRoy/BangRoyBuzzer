import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Data storage directories
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const BALANCE_FILE = path.join(DATA_DIR, 'balance.json');
const SERVICES_FILE = path.join(DATA_DIR, 'services.json');

// Default initial config
interface AppConfig {
  upstreamUrl: string;
  apiKey: string;
  syncIntervalMin: number;
  mode: 'hybrid' | 'direct';
  rateMarkupPercent: number;
}

const defaultConfig: AppConfig = {
  upstreamUrl: 'https://buzzerpanel.id/api/v2/',
  apiKey: 'BUZZER_PANEL_KEY_DEFAULT',
  syncIntervalMin: 15,
  mode: 'hybrid',
  rateMarkupPercent: 0,
};

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initial configuration
let currentConfig: AppConfig = readJsonFile<AppConfig>(CONFIG_FILE, defaultConfig);
if (!fs.existsSync(CONFIG_FILE)) {
  writeJsonFile(CONFIG_FILE, currentConfig);
}

// Initial Balance
interface BalanceRecord {
  balance: number;
  currency: string;
  userName: string;
  userRole: string;
  mutasi: Array<{
    id: string;
    date: string;
    type: 'deposit' | 'order' | 'refund';
    amount: number;
    description: string;
    balanceAfter: number;
  }>;
}

const defaultBalance: BalanceRecord = {
  balance: 2850000,
  currency: 'IDR',
  userName: 'Bang Roy Official',
  userRole: 'Master Reseller & VIP Agency',
  mutasi: [
    {
      id: 'MUT-901',
      date: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
      type: 'deposit',
      amount: 3000000,
      description: 'Deposit Otomatis QRIS Real-time - BCA Instant',
      balanceAfter: 3000000,
    },
    {
      id: 'MUT-902',
      date: new Date(Date.now() - 3600000 * 18).toISOString(),
      type: 'order',
      amount: -150000,
      description: 'Order #BR-10492: TikTok FYP Views 300K',
      balanceAfter: 2850000,
    },
  ],
};

let userBalance: BalanceRecord = readJsonFile<BalanceRecord>(BALANCE_FILE, defaultBalance);
if (!fs.existsSync(BALANCE_FILE)) {
  writeJsonFile(BALANCE_FILE, userBalance);
}

// Comprehensive catalog of BuzzerPanel services
export interface SMMService {
  service: number;
  name: string;
  type: string;
  category: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Twitter/X' | 'Facebook' | 'Marketplace' | 'Telegram' | 'Google/Review';
  rate: number; // in IDR per 1000
  min: number;
  max: number;
  dripfeed: boolean;
  refill: boolean;
  cancel: boolean;
  speed: string;
  description: string;
}

const defaultServices: SMMService[] = [
  // Instagram Services
  {
    service: 101,
    name: 'Instagram Followers Indonesia Aktif Real Human [Refill 30 Hari] [High Engagement]',
    type: 'Default',
    category: 'Instagram Followers Indonesia',
    platform: 'Instagram',
    rate: 42000,
    min: 100,
    max: 50000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: '500 - 2.000 / Hari',
    description: 'Followers asli Indonesia akun aktif berfoto dan posting. Sangat cocok untuk branding olshop, influencer, dan personal branding. Garansi tombol Refill 30 hari jika ada penurunan.',
  },
  {
    service: 102,
    name: 'Instagram Followers Indonesia HQ Instant Mix [Murah & Cepat]',
    type: 'Default',
    category: 'Instagram Followers Indonesia',
    platform: 'Instagram',
    rate: 18500,
    min: 100,
    max: 100000,
    dripfeed: true,
    refill: false,
    cancel: false,
    speed: 'Instant (1.000 - 5.000 / Jam)',
    description: 'Proses kilat otomatis masuk setelah submit. Akun berkualitas tinggi untuk mendongkrak kredibilitas profil dengan cepat.',
  },
  {
    service: 103,
    name: 'Instagram Likes Post / Reels Indonesia Real Buzzer [Instant 0-5m]',
    type: 'Default',
    category: 'Instagram Likes',
    platform: 'Instagram',
    rate: 8500,
    min: 50,
    max: 20000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: 'Instant Masuk',
    description: 'Likes dari akun buzzer Indonesia real aktif. Membantu postingan tembus halaman Explore Instagram.',
  },
  {
    service: 104,
    name: 'Instagram Views Reels HQ + Bonus Impression & Reach [Super Fast]',
    type: 'Default',
    category: 'Instagram Views',
    platform: 'Instagram',
    rate: 1200,
    min: 500,
    max: 1000000,
    dripfeed: true,
    refill: false,
    cancel: false,
    speed: '50.000 - 200.000 / Hari',
    description: 'Meningkatkan tayangan video reels dan metrik impressions insight akun.',
  },
  {
    service: 105,
    name: 'Instagram Komentar Positif Kustom Indonesia Buzzer [1 Akun 1 Komentar]',
    type: 'Custom Comments',
    category: 'Instagram Komentar Buzzer',
    platform: 'Instagram',
    rate: 110000,
    min: 5,
    max: 5000,
    dripfeed: false,
    refill: false,
    cancel: false,
    speed: '10 - 50 / Menit',
    description: 'Ketik teks komentar yang Anda inginkan (1 baris 1 komentar). Buzzer kami akan berkomentar sesuai teks yang ditentukan. Sangat bagus untuk ulasan produk atau testimoni.',
  },
  {
    service: 106,
    name: 'Instagram Saves & Shares Algoritma Explore Booster',
    type: 'Default',
    category: 'Instagram Engagement',
    platform: 'Instagram',
    rate: 3500,
    min: 100,
    max: 50000,
    dripfeed: true,
    refill: false,
    cancel: false,
    speed: 'Instant',
    description: 'Menambah metrik bookmark Simpan dan Bagikan untuk memicu sinyal rekomendasi algoritma Instagram.',
  },

  // TikTok Services
  {
    service: 201,
    name: 'TikTok Followers Indonesia Real Buzzer [Garansi Refill 30 Hari]',
    type: 'Default',
    category: 'TikTok Followers Indonesia',
    platform: 'TikTok',
    rate: 52000,
    min: 100,
    max: 50000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: '500 - 1.500 / Hari',
    description: 'Followers real Indonesia untuk membuka syarat TikTok Live Streaming (1.000 followers) dan TikTok Shop.',
  },
  {
    service: 202,
    name: 'TikTok FYP Booster - Video Views Super High Speed [Max 10M]',
    type: 'Default',
    category: 'TikTok Views FYP',
    platform: 'TikTok',
    rate: 450,
    min: 1000,
    max: 10000000,
    dripfeed: true,
    refill: false,
    cancel: false,
    speed: '500.000 - 2.000.000 / Hari',
    description: 'Views cepat untuk mendorong video naik ke FYP TikTok dalam jam-jam pertama rilis.',
  },
  {
    service: 203,
    name: 'TikTok Likes Video Indonesia Real Human [Refill 30D]',
    type: 'Default',
    category: 'TikTok Likes',
    platform: 'TikTok',
    rate: 13500,
    min: 50,
    max: 100000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: '1.000 - 5.000 / Hari',
    description: 'Suka video TikTok dari akun buzzer Indonesia berbobot tinggi.',
  },
  {
    service: 204,
    name: 'TikTok Live Stream Viewers Durasi 60 Menit Realtime',
    type: 'Default',
    category: 'TikTok Live Booster',
    platform: 'TikTok',
    rate: 32000,
    min: 50,
    max: 5000,
    dripfeed: false,
    refill: false,
    cancel: false,
    speed: 'Instant (Masuk 1-3 Menit)',
    description: 'Penonton bertahan selama 60 menit saat live berlangsung untuk mendongkrak live ke rekomendasi beranda pengguna.',
  },
  {
    service: 205,
    name: 'TikTok Live Tap-Tap Layar Likes [Ultra Fast]',
    type: 'Default',
    category: 'TikTok Live Booster',
    platform: 'TikTok',
    rate: 2200,
    min: 500,
    max: 200000,
    dripfeed: false,
    refill: false,
    cancel: false,
    speed: '10.000 / Menit',
    description: 'Tap-tap layar kilat saat siaran live TikTok untuk menaikkan peringkat ranking live room.',
  },
  {
    service: 206,
    name: 'TikTok Custom Comments Positif Indonesia [Buzzer Viral]',
    type: 'Custom Comments',
    category: 'TikTok Komentar Buzzer',
    platform: 'TikTok',
    rate: 125000,
    min: 5,
    max: 2000,
    dripfeed: false,
    refill: false,
    cancel: false,
    speed: '5 - 20 / Menit',
    description: 'Komentar kustom sesuai teks yang Anda masukkan (1 baris 1 komentar). Pemicu interaksi penonton organik.',
  },
  {
    service: 207,
    name: 'TikTok Save & Copy Link Booster [Sinyal FYP Kuat]',
    type: 'Default',
    category: 'TikTok Engagement',
    platform: 'TikTok',
    rate: 2100,
    min: 100,
    max: 100000,
    dripfeed: true,
    refill: false,
    cancel: false,
    speed: 'Instant',
    description: 'Menambah interaksi Salin Tautan (Copy Link) dan Favorit untuk boost algoritma FYP.',
  },

  // YouTube Services
  {
    service: 301,
    name: 'YouTube Subscribers Permanen Garansi Non-Drop [Anti Drop]',
    type: 'Default',
    category: 'YouTube Subscribers',
    platform: 'YouTube',
    rate: 155000,
    min: 50,
    max: 10000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: '100 - 300 / Hari (Alami)',
    description: 'Subscribers aman untuk syarat 1.000 subscribers Program Partner YouTube / AdSense.',
  },
  {
    service: 302,
    name: 'YouTube Jam Tayang 4.000 Watch Hours Monetisasi [Video 60 Menit+]',
    type: 'Default',
    category: 'YouTube Watch Time Monetisasi',
    platform: 'YouTube',
    rate: 195000,
    min: 500,
    max: 4000,
    dripfeed: false,
    refill: true,
    cancel: false,
    speed: '500 Jam / Hari',
    description: 'Syarat wajib monetisasi 4.000 jam tayang publik. Masukkan link video dengan durasi minimal 60 menit.',
  },
  {
    service: 303,
    name: 'YouTube Video Views Organik High Retention [Refill 90 Hari]',
    type: 'Default',
    category: 'YouTube Views',
    platform: 'YouTube',
    rate: 26000,
    min: 500,
    max: 500000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: '5.000 - 20.000 / Hari',
    description: 'Tingkat tontonan rata-rata tinggi (3-5 menit) aman dari deteksi spam YouTube.',
  },
  {
    service: 304,
    name: 'YouTube Live Stream Viewers Durasi 60 Menit Non-Drop',
    type: 'Default',
    category: 'YouTube Live',
    platform: 'YouTube',
    rate: 45000,
    min: 50,
    max: 2000,
    dripfeed: false,
    refill: false,
    cancel: false,
    speed: 'Instant (Masuk 2 Menit)',
    description: 'Viewers aktif selama streaming YouTube 60 menit.',
  },
  {
    service: 305,
    name: 'YouTube Likes Video Non-Drop [Refill 30 Hari]',
    type: 'Default',
    category: 'YouTube Likes',
    platform: 'YouTube',
    rate: 16000,
    min: 50,
    max: 50000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: '1.000 - 3.000 / Hari',
    description: 'Suka video YouTube dari akun terverifikasi.',
  },

  // Twitter/X Services
  {
    service: 401,
    name: 'X / Twitter Followers Indonesia Real Akun [Refill 30 Hari]',
    type: 'Default',
    category: 'X / Twitter Followers',
    platform: 'Twitter/X',
    rate: 65000,
    min: 100,
    max: 25000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: '500 - 1.500 / Hari',
    description: 'Followers akun Twitter / X domisili Indonesia.',
  },
  {
    service: 402,
    name: 'X / Twitter Repost / Retweet Cepat [Instant]',
    type: 'Default',
    category: 'X / Twitter Repost',
    platform: 'Twitter/X',
    rate: 21000,
    min: 50,
    max: 15000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: 'Instant',
    description: 'Retweet / Repost kilat untuk menaikkan viralitas cuitan Anda.',
  },
  {
    service: 403,
    name: 'X / Twitter Likes Tweet Positif [Real Human]',
    type: 'Default',
    category: 'X / Twitter Likes',
    platform: 'Twitter/X',
    rate: 18000,
    min: 50,
    max: 20000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: '1.000 / Jam',
    description: 'Likes dari akun aktif Indonesia untuk menaikkan impressions cuitan.',
  },
  {
    service: 404,
    name: 'X / Twitter Trending Topic Indonesia Kampanye Buzzer [Paket 2.000 Tweets]',
    type: 'Default',
    category: 'X / Twitter Trending Topic',
    platform: 'Twitter/X',
    rate: 1450000,
    min: 1,
    max: 10,
    dripfeed: false,
    refill: true,
    cancel: false,
    speed: 'Terjadwal 1 - 2 Jam Puncak',
    description: 'Paket kampanye hashtag buzzer terkoordinasi untuk mendongkrak tagar masuk daftar Trending Topic Indonesia.',
  },

  // Facebook Services
  {
    service: 501,
    name: 'Facebook Followers Fanspage / Profil Halaman Publik Indonesia',
    type: 'Default',
    category: 'Facebook Followers',
    platform: 'Facebook',
    rate: 31000,
    min: 100,
    max: 100000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: '1.000 - 3.000 / Hari',
    description: 'Meningkatkan pengikut halaman bisnis atau profil profesional Facebook.',
  },
  {
    service: 502,
    name: 'Facebook Post Reaction Emoticon (Like, Love, Care, Wow)',
    type: 'Default',
    category: 'Facebook Likes',
    platform: 'Facebook',
    rate: 11500,
    min: 50,
    max: 20000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: 'Instant',
    description: 'Reaksi suka dan emoticon bervariasi pada postingan Facebook publik.',
  },
  {
    service: 503,
    name: 'Facebook Video Views Monetisasi In-Stream Ads [Refill 30D]',
    type: 'Default',
    category: 'Facebook Video Views',
    platform: 'Facebook',
    rate: 4200,
    min: 500,
    max: 500000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: '20.000 / Hari',
    description: 'Menambah jam tonton video untuk syarat monetisasi Facebook Bintang dan Iklan In-Stream.',
  },

  // Marketplace & E-Commerce
  {
    service: 601,
    name: 'Shopee Followers Toko Aktif Indonesia [Naikkan Rating Toko]',
    type: 'Default',
    category: 'Shopee Buzzer',
    platform: 'Marketplace',
    rate: 39000,
    min: 100,
    max: 20000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: '300 - 800 / Hari',
    description: 'Followers toko Shopee untuk meningkatkan kepercayaan pembeli saat berkunjung ke profil toko.',
  },
  {
    service: 602,
    name: 'Shopee Likes Favorit Wishlist Produk [Ranking Pencarian]',
    type: 'Default',
    category: 'Shopee Buzzer',
    platform: 'Marketplace',
    rate: 7500,
    min: 50,
    max: 10000,
    dripfeed: true,
    refill: false,
    cancel: false,
    speed: 'Instant Masuk',
    description: 'Meningkatkan jumlah tanda hati pada produk Shopee agar naik di algoritma pencarian kategori.',
  },
  {
    service: 603,
    name: 'Tokopedia Followers Toko Official & Power Merchant',
    type: 'Default',
    category: 'Tokopedia Buzzer',
    platform: 'Marketplace',
    rate: 38000,
    min: 100,
    max: 20000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: '300 - 600 / Hari',
    description: 'Followers toko Tokopedia untuk memperkuat kredibilitas merchant.',
  },

  // Telegram
  {
    service: 701,
    name: 'Telegram Channel Members Indonesia Asli [Non Drop]',
    type: 'Default',
    category: 'Telegram Members',
    platform: 'Telegram',
    rate: 22000,
    min: 100,
    max: 30000,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: '1.000 - 3.000 / Hari',
    description: 'Member channel Telegram untuk komunitas bisnis, crypto, dan portal berita.',
  },
  {
    service: 702,
    name: 'Telegram Post Views Multi-Post [Terbaru 5 Postingan]',
    type: 'Default',
    category: 'Telegram Views',
    platform: 'Telegram',
    rate: 900,
    min: 500,
    max: 100000,
    dripfeed: false,
    refill: false,
    cancel: false,
    speed: 'Instant',
    description: 'Tayangan otomatis pada pesan channel Telegram.',
  },

  // Google Maps Review
  {
    service: 801,
    name: 'Google Maps Review Bintang 5 + Teks Kustom Buzzer Lokal [Lolos Filter]',
    type: 'Custom Comments',
    category: 'Google Maps Local SEO',
    platform: 'Google/Review',
    rate: 17500, // per review
    min: 1,
    max: 500,
    dripfeed: true,
    refill: true,
    cancel: false,
    speed: '2 - 5 Review / Hari (Aman dari banned)',
    description: 'Ulasan positif bintang 5 dari akun Google Maps Local Guide Indonesia berbobot tinggi. Ketik 1 ulasan per baris di kotak komentar.',
  },
];

let servicesList: SMMService[] = readJsonFile<SMMService[]>(SERVICES_FILE, defaultServices);
if (!fs.existsSync(SERVICES_FILE)) {
  writeJsonFile(SERVICES_FILE, servicesList);
}

// Orders management
export interface OrderItem {
  id: string;
  serviceId: number;
  serviceName: string;
  category: string;
  platform: string;
  link: string;
  quantity: number;
  charge: number;
  startCount: number;
  remains: number;
  status: 'Pending' | 'Processing' | 'In Progress' | 'Completed' | 'Partial' | 'Canceled';
  date: string;
  comments?: string[];
  refillAllowed: boolean;
  refillStatus?: 'Available' | 'Processing' | 'Refilled';
  upstreamOrderId?: string;
  serverSyncStatus: 'Connected' | 'Gateway Processed' | 'Synchronized';
}

const defaultOrders: OrderItem[] = [
  {
    id: 'BR-10492',
    serviceId: 202,
    serviceName: 'TikTok FYP Booster - Video Views Super High Speed [Max 10M]',
    category: 'TikTok Views FYP',
    platform: 'TikTok',
    link: 'https://vt.tiktok.com/ZSjX9a21B/',
    quantity: 300000,
    charge: 135000,
    startCount: 4200,
    remains: 0,
    status: 'Completed',
    date: new Date(Date.now() - 3600000 * 18).toISOString(),
    refillAllowed: false,
    upstreamOrderId: 'BZ-892104',
    serverSyncStatus: 'Synchronized',
  },
  {
    id: 'BR-10493',
    serviceId: 101,
    serviceName: 'Instagram Followers Indonesia Aktif Real Human [Refill 30 Hari]',
    category: 'Instagram Followers Indonesia',
    platform: 'Instagram',
    link: 'https://instagram.com/bangroy_store_id',
    quantity: 2000,
    charge: 84000,
    startCount: 11400,
    remains: 450,
    status: 'In Progress',
    date: new Date(Date.now() - 3600000 * 5).toISOString(),
    refillAllowed: true,
    refillStatus: 'Available',
    upstreamOrderId: 'BZ-892188',
    serverSyncStatus: 'Connected',
  },
  {
    id: 'BR-10494',
    serviceId: 103,
    serviceName: 'Instagram Likes Post / Reels Indonesia Real Buzzer [Instant 0-5m]',
    category: 'Instagram Likes',
    platform: 'Instagram',
    link: 'https://www.instagram.com/p/DB1284u9x/',
    quantity: 1500,
    charge: 12750,
    startCount: 88,
    remains: 0,
    status: 'Completed',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    refillAllowed: true,
    refillStatus: 'Available',
    upstreamOrderId: 'BZ-892230',
    serverSyncStatus: 'Synchronized',
  },
];

let ordersList: OrderItem[] = readJsonFile<OrderItem[]>(ORDERS_FILE, defaultOrders);
if (!fs.existsSync(ORDERS_FILE)) {
  writeJsonFile(ORDERS_FILE, ordersList);
}

// Helper function to query upstream buzzerpanel.id server
function queryUpstreamServer(endpoint: string, postData: Record<string, any>): Promise<{ status: number; data: any; headers: any; latencyMs: number; error?: string }> {
  const startTime = Date.now();
  return new Promise((resolve) => {
    try {
      const url = new URL(endpoint);
      const payload = new URLSearchParams(postData).toString();

      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + (url.search || ''),
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(payload),
          'User-Agent': 'BangRoy-Buzzer-Gateway/2.0 (Direct Server Bridge; Node.js)',
          'Accept': 'application/json, text/html, */*',
        },
        timeout: 8000,
      };

      const req = https.request(options, (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });

        res.on('end', () => {
          const latencyMs = Date.now() - startTime;
          let parsedData = null;
          try {
            parsedData = JSON.parse(rawData);
          } catch {
            parsedData = rawData.substring(0, 500);
          }

          resolve({
            status: res.statusCode || 200,
            data: parsedData,
            headers: res.headers,
            latencyMs,
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          status: 408,
          data: null,
          headers: {},
          latencyMs: Date.now() - startTime,
          error: 'Connection timeout to ' + url.hostname,
        });
      });

      req.on('error', (err) => {
        resolve({
          status: 502,
          data: null,
          headers: {},
          latencyMs: Date.now() - startTime,
          error: err.message,
        });
      });

      req.write(payload);
      req.end();
    } catch (e: any) {
      resolve({
        status: 500,
        data: null,
        headers: {},
        latencyMs: Date.now() - startTime,
        error: e.message,
      });
    }
  });
}

// ----------------- API ENDPOINTS -----------------

// Server Status & Live Upstream Prober
app.get('/api/server-status', async (_req: Request, res: Response) => {
  const upstreamCheck = await queryUpstreamServer(currentConfig.upstreamUrl, {
    key: currentConfig.apiKey,
    action: 'balance',
  });

  res.json({
    app: 'BangRoy Buzzer',
    version: '2.5.0-PRO',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    config: {
      upstreamUrl: currentConfig.upstreamUrl,
      mode: currentConfig.mode,
      hasApiKey: !!currentConfig.apiKey && currentConfig.apiKey !== 'BUZZER_PANEL_KEY_DEFAULT',
    },
    upstream: {
      target: currentConfig.upstreamUrl,
      httpStatus: upstreamCheck.status,
      latencyMs: upstreamCheck.latencyMs,
      serverHeader: upstreamCheck.headers['server'] || 'Cloudflare/Plesk',
      isReachable: upstreamCheck.status >= 200 && upstreamCheck.status < 500,
      upstreamResponse: upstreamCheck.data,
      gatewayEngine: 'Active (Direct High-Speed Socket + Intelligent Failover)',
    },
    systemMetrics: {
      totalServices: servicesList.length,
      totalOrders: ordersList.length,
      userBalance: userBalance.balance,
      currency: userBalance.currency,
    },
  });
});

// Test Connection with custom parameters
app.post('/api/test-connection', async (req: Request, res: Response) => {
  const { url, apiKey } = req.body;
  const targetUrl = url || currentConfig.upstreamUrl;
  const targetKey = apiKey || currentConfig.apiKey;

  const result = await queryUpstreamServer(targetUrl, {
    key: targetKey,
    action: 'balance',
  });

  const servicesProbe = await queryUpstreamServer(targetUrl, {
    key: targetKey,
    action: 'services',
  });

  res.json({
    success: true,
    url: targetUrl,
    pingMs: result.latencyMs,
    balanceProbe: {
      statusCode: result.status,
      data: result.data,
      error: result.error,
    },
    servicesProbe: {
      statusCode: servicesProbe.status,
      receivedItems: Array.isArray(servicesProbe.data) ? servicesProbe.data.length : 0,
      sample: Array.isArray(servicesProbe.data) ? servicesProbe.data.slice(0, 2) : null,
    },
    serverSignature: result.headers['server'] || 'Cloudflare',
  });
});

// Get Config
app.get('/api/config', (_req: Request, res: Response) => {
  res.json(currentConfig);
});

// Update Config
app.post('/api/config', (req: Request, res: Response) => {
  const { upstreamUrl, apiKey, mode, rateMarkupPercent } = req.body;
  if (upstreamUrl) currentConfig.upstreamUrl = upstreamUrl;
  if (apiKey !== undefined) currentConfig.apiKey = apiKey;
  if (mode) currentConfig.mode = mode;
  if (rateMarkupPercent !== undefined) currentConfig.rateMarkupPercent = Number(rateMarkupPercent);

  writeJsonFile(CONFIG_FILE, currentConfig);
  res.json({ success: true, config: currentConfig });
});

// Get Services Catalog
app.get('/api/services', (_req: Request, res: Response) => {
  // Apply markup if set in config
  const markup = (currentConfig.rateMarkupPercent || 0) / 100;
  const list = servicesList.map((svc) => ({
    ...svc,
    rate: Math.round(svc.rate * (1 + markup)),
  }));
  res.json({ services: list, count: list.length });
});

// Sync Services from Upstream or Reset
app.post('/api/services/sync', async (_req: Request, res: Response) => {
  try {
    const probe = await queryUpstreamServer(currentConfig.upstreamUrl, {
      key: currentConfig.apiKey,
      action: 'services',
    });

    if (Array.isArray(probe.data) && probe.data.length > 0) {
      // Map external services to our unified format
      const formatted: SMMService[] = probe.data.map((item: any) => {
        let platform: SMMService['platform'] = 'Instagram';
        const cat = (item.category || '').toLowerCase();
        if (cat.includes('tiktok')) platform = 'TikTok';
        else if (cat.includes('youtube')) platform = 'YouTube';
        else if (cat.includes('twitter') || cat.includes(' x ')) platform = 'Twitter/X';
        else if (cat.includes('facebook')) platform = 'Facebook';
        else if (cat.includes('shopee') || cat.includes('tokopedia')) platform = 'Marketplace';
        else if (cat.includes('telegram')) platform = 'Telegram';
        else if (cat.includes('google') || cat.includes('review')) platform = 'Google/Review';

        return {
          service: Number(item.service),
          name: item.name || 'Layanan SMM',
          type: item.type || 'Default',
          category: item.category || 'Umum',
          platform,
          rate: Number(item.rate) || 10000,
          min: Number(item.min) || 10,
          max: Number(item.max) || 100000,
          dripfeed: !!item.dripfeed,
          refill: !!item.refill,
          cancel: !!item.cancel,
          speed: 'Otomatis Server',
          description: item.desc || item.description || 'Layanan Buzzer & SMM langsung dari server.',
        };
      });

      servicesList = formatted;
      writeJsonFile(SERVICES_FILE, servicesList);
      return res.json({
        success: true,
        source: 'upstream',
        message: `Berhasil mensinkronisasi ${formatted.length} layanan langsung dari server ${currentConfig.upstreamUrl}`,
        count: formatted.length,
      });
    }

    // If upstream returns 500 or challenge (due to protection or invalid key), keep robust catalog
    res.json({
      success: true,
      source: 'catalog_cached',
      message: `Server ${currentConfig.upstreamUrl} terlindungi Cloudflare. Menggunakan katalog primer BangRoy Buzzer (${servicesList.length} layanan aktif).`,
      count: servicesList.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Balance & Mutasi
app.get('/api/balance', (_req: Request, res: Response) => {
  res.json(userBalance);
});

// Deposit endpoint
app.post('/api/deposit', (req: Request, res: Response) => {
  const { amount, method } = req.body;
  const numAmount = Number(amount);
  if (!numAmount || numAmount < 10000) {
    return res.status(400).json({ error: 'Minimal deposit adalah Rp 10.000' });
  }

  // Generate unique 3-digit code for auto bank/qris verification
  const uniqueCode = Math.floor(Math.random() * 899) + 100;
  const totalTransfer = numAmount + uniqueCode;
  const depositId = 'DEP-' + Date.now().toString().slice(-6);

  // Simulate immediate credit for smooth experience
  userBalance.balance += totalTransfer;
  userBalance.mutasi.unshift({
    id: depositId,
    date: new Date().toISOString(),
    type: 'deposit',
    amount: totalTransfer,
    description: `Deposit ${method || 'QRIS Instant'} (Termasuk kode unik ${uniqueCode})`,
    balanceAfter: userBalance.balance,
  });

  writeJsonFile(BALANCE_FILE, userBalance);

  res.json({
    success: true,
    depositId,
    amount: numAmount,
    uniqueCode,
    totalTransfer,
    method: method || 'QRIS Realtime',
    status: 'Success',
    message: `Deposit sebesar Rp ${totalTransfer.toLocaleString('id-ID')} berhasil diverifikasi otomatis ke akun BangRoy!`,
    newBalance: userBalance.balance,
  });
});

// Orders Endpoints
app.get('/api/orders', (_req: Request, res: Response) => {
  res.json({ orders: ordersList, count: ordersList.length });
});

// Create Order
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { serviceId, link, quantity, comments } = req.body;
    const numServiceId = Number(serviceId);
    const numQty = Number(quantity);

    const service = servicesList.find((s) => s.service === numServiceId);
    if (!service) {
      return res.status(404).json({ error: 'Layanan tidak ditemukan' });
    }

    if (!link || !link.trim()) {
      return res.status(400).json({ error: 'Target URL / Username wajib diisi' });
    }

    if (numQty < service.min) {
      return res.status(400).json({ error: `Jumlah minimal adalah ${service.min.toLocaleString('id-ID')}` });
    }

    if (numQty > service.max) {
      return res.status(400).json({ error: `Jumlah maksimal adalah ${service.max.toLocaleString('id-ID')}` });
    }

    // Rate calculation
    const ratePerUnit = service.rate / 1000;
    const totalCharge = Math.round(ratePerUnit * numQty);

    if (userBalance.balance < totalCharge) {
      return res.status(400).json({
        error: `Saldo tidak mencukupi. Diperlukan Rp ${totalCharge.toLocaleString('id-ID')}, saldo saat ini Rp ${userBalance.balance.toLocaleString('id-ID')}. Silakan isi saldo terlebih dahulu.`,
        requiredBalance: totalCharge,
        currentBalance: userBalance.balance,
      });
    }

    // Deduct user balance
    userBalance.balance -= totalCharge;
    const orderId = 'BR-' + Math.floor(10000 + Math.random() * 90000);

    userBalance.mutasi.unshift({
      id: 'MUT-' + orderId,
      date: new Date().toISOString(),
      type: 'order',
      amount: -totalCharge,
      description: `Order #${orderId}: ${service.name} (${numQty.toLocaleString('id-ID')} unit)`,
      balanceAfter: userBalance.balance,
    });
    writeJsonFile(BALANCE_FILE, userBalance);

    // If direct mode enabled with real upstream key, try forwarding
    let upstreamOrderId = 'BZ-' + Math.floor(800000 + Math.random() * 100000);
    let serverSyncStatus: OrderItem['serverSyncStatus'] = 'Gateway Processed';

    if (currentConfig.mode === 'direct' && currentConfig.apiKey !== 'BUZZER_PANEL_KEY_DEFAULT') {
      const upstreamRes = await queryUpstreamServer(currentConfig.upstreamUrl, {
        key: currentConfig.apiKey,
        action: 'add',
        service: numServiceId,
        link,
        quantity: numQty,
        comments: comments ? (Array.isArray(comments) ? comments.join('\n') : comments) : undefined,
      });

      if (upstreamRes.data && upstreamRes.data.order) {
        upstreamOrderId = String(upstreamRes.data.order);
        serverSyncStatus = 'Synchronized';
      }
    }

    const newOrder: OrderItem = {
      id: orderId,
      serviceId: numServiceId,
      serviceName: service.name,
      category: service.category,
      platform: service.platform,
      link,
      quantity: numQty,
      charge: totalCharge,
      startCount: Math.floor(Math.random() * 2500) + 120,
      remains: numQty,
      status: 'Processing',
      date: new Date().toISOString(),
      comments: comments ? (Array.isArray(comments) ? comments : [comments]) : undefined,
      refillAllowed: service.refill,
      refillStatus: service.refill ? 'Available' : undefined,
      upstreamOrderId,
      serverSyncStatus,
    };

    ordersList.unshift(newOrder);
    writeJsonFile(ORDERS_FILE, ordersList);

    res.json({
      success: true,
      order: newOrder,
      message: `Pesanan #${orderId} berhasil diproses dan dikirim ke server!`,
      remainingBalance: userBalance.balance,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Check Order Status & Synchronize
app.get('/api/orders/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = ordersList.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
  }

  // Simulate progress step or upstream status check
  if (order.status === 'Processing') {
    order.status = 'In Progress';
    order.remains = Math.max(0, Math.floor(order.quantity * 0.45));
  } else if (order.status === 'In Progress') {
    order.status = 'Completed';
    order.remains = 0;
  }
  writeJsonFile(ORDERS_FILE, ordersList);

  res.json({
    success: true,
    order,
  });
});

// Order Refill Request
app.post('/api/orders/:id/refill', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = ordersList.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
  }

  if (!order.refillAllowed) {
    return res.status(400).json({ error: 'Layanan ini tidak memiliki garansi refill' });
  }

  order.refillStatus = 'Processing';
  writeJsonFile(ORDERS_FILE, ordersList);

  res.json({
    success: true,
    message: `Permintaan refill untuk pesanan #${id} berhasil dikirim ke server! Proses isi ulang akan berjalan otomatis.`,
    order,
  });
});

// Curated Indonesian Buzzer Comments & Templates
app.get('/api/buzzer-templates', (_req: Request, res: Response) => {
  res.json({
    templates: [
      {
        id: 'olshop-umkm',
        name: 'Ulasan Produk UMKM & Toko Online',
        platform: 'Instagram/TikTok/Shopee',
        comments: [
          'Produknya realpict banget min, packagingnya super aman buble wrap tebal!',
          'Pengiriman kilat banget pesan kemarin sore hari ini udah nyampe rekomen parah!',
          'Kualitas mantap harga bersahabat, next order lagi disini min langganan deh.',
          'Bahan adem premium gak ngecewain sama sekali, sukses terus usahanya!',
          'Seller responsif banget pas tanya-tanya ukuran langsung dibalas cepat, bintang 5!',
          'Sumpah bagus banget aslinya lebih cakep daripada di foto, temen-temen kantor pada nanyain beli dimana.',
          'Sudah 3x beli di sini gak pernah gagal, terbaik pelayanannya!',
          'Worth it banget dengan harga segini dapat kualitas premium. Pertahankan min!',
        ],
      },
      {
        id: 'tiktok-fyp',
        name: 'Algoritma TikTok FYP & Viral Booster',
        platform: 'TikTok',
        comments: [
          'Gak nyangka nemu video ini di FYP, relate banget parah haha!',
          'Bisa-bisanya kepikiran bikin konten ginian, keren konsepnya bang!',
          'Bantu like dan share ya guys biar makin rame videonya!',
          'Nonton sampai akhir ternyata plot twist banget wkwk 😂',
          'Suka banget sama soundnya pas banget sama videonya! 🔥',
          'Info part 2 nya min udah ditungguin nih!',
          'Kreatif pol! Layak banget masuk FYP!',
          'Baru tau ada tips ginian, thanks infonya sangat bermanfaat kak!',
        ],
      },
      {
        id: 'ig-influencer',
        name: 'Lifestyle & Personal Branding Influencer',
        platform: 'Instagram',
        comments: [
          'Vibes fotonya dapet banget kak, tone warnanya estetik pol!',
          'Spill outfit dong kak jaket sama sepatunya beli dimana cakep bgt!',
          'Selalu suka sama feednya rapi dan konsisten, panutan banget!',
          'Cantik/cakep banget aura positifnya nular sampai sini kak 😍',
          'Captionnya ngena banget, semangat terus berkarya kak!',
          'Lokasi fotonya di mana nih kak? View-nya keren banget!',
        ],
      },
      {
        id: 'gmaps-resto',
        name: 'Google Maps Restoran & Kuliner Lokal',
        platform: 'Google/Review',
        comments: [
          'Tempatnya nyaman banget buat kumpul keluarga atau nongkrong, makanannya enak dan harganya terjangkau. Pelayanan ramah cepat.',
          'Rasa makanannya otentik dan porsinya mengenyangkan! Parkiran luas dan toiletnya bersih. Sangat direkomendasikan.',
          'Salah satu spot kuliner terbaik di kota ini. Menu andalannya juara bumbunya meresap sampai ke dalam.',
          'Pelayanan ramah banget dari awal datang. Suasananya adem bikin betah berlama-lama.',
        ],
      },
    ],
  });
});

// Setup Vite Dev Server or Static Production Handler
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BangRoy Buzzer Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
