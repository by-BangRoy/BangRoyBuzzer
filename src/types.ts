export interface SMMService {
  service: number;
  name: string;
  type: string;
  category: string;
  platform: 'Instagram' | 'TikTok' | 'YouTube' | 'Twitter/X' | 'Facebook' | 'Marketplace' | 'Telegram' | 'Google/Review';
  rate: number;
  min: number;
  max: number;
  dripfeed: boolean;
  refill: boolean;
  cancel: boolean;
  speed: string;
  description: string;
}

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

export interface BalanceRecord {
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

export interface ServerStatusResponse {
  app: string;
  version: string;
  uptime: number;
  timestamp: string;
  config: {
    upstreamUrl: string;
    mode: 'hybrid' | 'direct';
    hasApiKey: boolean;
  };
  upstream: {
    target: string;
    httpStatus: number;
    latencyMs: number;
    serverHeader: string;
    isReachable: boolean;
    upstreamResponse: any;
    gatewayEngine: string;
  };
  systemMetrics: {
    totalServices: number;
    totalOrders: number;
    userBalance: number;
    currency: string;
  };
}

export interface BuzzerTemplate {
  id: string;
  name: string;
  platform: string;
  comments: string[];
}
