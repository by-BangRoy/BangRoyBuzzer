/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { NewOrderView } from './components/NewOrderView';
import { ServicesCatalogView } from './components/ServicesCatalogView';
import { OrdersView } from './components/OrdersView';
import { DepositView } from './components/DepositView';
import { ServerApiView } from './components/ServerApiView';
import { BuzzerCampaignsView } from './components/BuzzerCampaignsView';
import { SMMService, OrderItem, BalanceRecord, ServerStatusResponse } from './types';
import { ShieldCheck, Server, Zap, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'order' | 'services' | 'history' | 'deposit' | 'server' | 'buzzer-tools'>('order');
  const [services, setServices] = useState<SMMService[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [balance, setBalance] = useState<BalanceRecord | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatusResponse | null>(null);

  const [isRefreshingStatus, setIsRefreshingStatus] = useState<boolean>(false);
  const [isSyncingServices, setIsSyncingServices] = useState<boolean>(false);
  const [initialServiceIdForOrder, setInitialServiceIdForOrder] = useState<number | null>(null);
  const [prefilledComments, setPrefilledComments] = useState<string[] | null>(null);

  // Fetch all initial data
  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.services) setServices(data.services);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }, []);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/balance');
      const data = await res.json();
      setBalance(data);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  }, []);

  const fetchServerStatus = useCallback(async () => {
    setIsRefreshingStatus(true);
    try {
      const res = await fetch('/api/server-status');
      const data = await res.json();
      setServerStatus(data);
    } catch (err) {
      console.error('Failed to fetch server status:', err);
    } finally {
      setIsRefreshingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchOrders();
    fetchBalance();
    fetchServerStatus();
  }, [fetchServices, fetchOrders, fetchBalance, fetchServerStatus]);

  // Handle Sync Services from Upstream
  const handleSyncServices = async () => {
    setIsSyncingServices(true);
    try {
      const res = await fetch('/api/services/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchServices();
        alert(data.message);
      }
    } catch (err: any) {
      alert(`Gagal sync: ${err.message}`);
    } finally {
      setIsSyncingServices(false);
    }
  };

  // Switch to order with preselected service from catalog
  const handleSelectServiceFromCatalog = (serviceId: number) => {
    setInitialServiceIdForOrder(serviceId);
    setActiveTab('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to order with preselected comments from templates
  const handleUseTemplate = (comments: string[]) => {
    setPrefilledComments(comments);
    // Find custom comment service (e.g., 105 or 206)
    const customService = services.find((s) => s.type === 'Custom Comments');
    if (customService) {
      setInitialServiceIdForOrder(customService.service);
    }
    setActiveTab('order');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (_order: any) => {
    fetchOrders();
    fetchBalance();
    fetchServerStatus();
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        balance={balance}
        serverStatus={serverStatus}
        onRefreshStatus={fetchServerStatus}
        isRefreshing={isRefreshingStatus}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 pb-16">
        {activeTab === 'order' && (
          <NewOrderView
            services={services}
            balance={balance}
            onOrderSuccess={handleOrderSuccess}
            onNavigateToDeposit={() => setActiveTab('deposit')}
            onOpenTemplates={() => setActiveTab('buzzer-tools')}
            initialServiceId={initialServiceIdForOrder}
          />
        )}

        {activeTab === 'services' && (
          <ServicesCatalogView
            services={services}
            onSelectService={handleSelectServiceFromCatalog}
            onRefreshServices={handleSyncServices}
            isSyncing={isSyncingServices}
          />
        )}

        {activeTab === 'history' && (
          <OrdersView
            orders={orders}
            onRefreshOrders={fetchOrders}
            onNavigateToNewOrder={() => setActiveTab('order')}
          />
        )}

        {activeTab === 'deposit' && (
          <DepositView
            balance={balance}
            onDepositSuccess={() => {
              fetchBalance();
              fetchServerStatus();
            }}
          />
        )}

        {activeTab === 'server' && (
          <ServerApiView
            serverStatus={serverStatus}
            onRefreshStatus={fetchServerStatus}
            isRefreshing={isRefreshingStatus}
          />
        )}

        {activeTab === 'buzzer-tools' && (
          <BuzzerCampaignsView
            onUseTemplate={handleUseTemplate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/70 text-xs text-slate-400 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">BangRoy Buzzer</span>
            <span aria-hidden="true">·</span>
            <span>Platform SMM Panel & Kampanye Buzzer Indonesia</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Direct Server Bridge: buzzerpanel.id</span>
            </div>
            <span aria-hidden="true">·</span>
            <span>Uptime 99.98%</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
