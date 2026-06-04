import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shirt, 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  LogOut, 
  Menu, 
  X, 
  BarChart3
} from 'lucide-react';
import { Client, Order, User as UserType, ActiveTab, OrderStatus, ClientTier, ClientStatus } from './types';
import { apiGetClients, apiCreateClient, apiGetOrders, apiCreateOrder, apiUpdateOrderStatus } from './api';
import LoginScreen from './components/LoginScreen';
import DashboardView from './components/DashboardView';
import ClientDirectory from './components/ClientDirectory';
import OrderKanban from './components/OrderKanban';
import AnalyticsView from './components/AnalyticsView';

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user session from localStorage
  useEffect(() => {
    const cachedUser = localStorage.getItem('apex_user');
    const cachedToken = localStorage.getItem('apex_token');
    if (cachedUser && cachedToken) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        localStorage.removeItem('apex_user');
        localStorage.removeItem('apex_token');
      }
    }
    setIsLoading(false);
  }, []);

  // Fetch data from API when user is authenticated
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [clientsData, ordersData] = await Promise.all([
        apiGetClients(),
        apiGetOrders(),
      ]);
      setClients(clientsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogin = (newUser: UserType) => {
    setUser(newUser);
    localStorage.setItem('apex_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    setClients([]);
    setOrders([]);
    localStorage.removeItem('apex_user');
    localStorage.removeItem('apex_token');
    setActiveTab('dashboard');
    setIsMobileSidebarOpen(false);
  };

  const handleAddClient = async (newClient: {
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string;
    tier: ClientTier;
    status: ClientStatus;
  }) => {
    try {
      await apiCreateClient({
        company: newClient.companyName,
        name: newClient.contactPerson,
        email: newClient.email,
        phone: newClient.phone,
        tier: newClient.tier,
        status: newClient.status,
      });
      // Refresh clients from API
      const updatedClients = await apiGetClients();
      setClients(updatedClients);
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  const handleUpdateOrderStatus = async (
    orderId: string, 
    nextStatus: OrderStatus, 
    trackingInfo?: { carrier: string; trackingNum: string }
  ) => {
    try {
      const updateData: { status: string; shippingCarrier?: string; trackingNumber?: string } = {
        status: nextStatus,
      };
      if (trackingInfo && nextStatus === 'Shipped') {
        updateData.shippingCarrier = trackingInfo.carrier;
        updateData.trackingNumber = trackingInfo.trackingNum;
      }
      await apiUpdateOrderStatus(orderId, updateData);
      // Refresh orders from API
      const updatedOrders = await apiGetOrders();
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleAddOrder = async (newOrder: {
    clientId: string;
    clientName: string;
    companyName: string;
    totalAmount: number;
    status: OrderStatus;
    items: Array<{ name: string; qty: number; price: number }>;
    note?: string;
  }) => {
    try {
      await apiCreateOrder({
        clientId: newOrder.clientId,
        clientName: newOrder.clientName,
        companyName: newOrder.companyName,
        totalAmount: newOrder.totalAmount,
        status: newOrder.status,
        items: newOrder.items,
        note: newOrder.note,
      });
      // Refresh both orders and clients from API
      const [updatedOrders, updatedClients] = await Promise.all([
        apiGetOrders(),
        apiGetClients(),
      ]);
      setOrders(updatedOrders);
      setClients(updatedClients);
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLoginSuccess={handleLogin} />;
  }

  // Render main layout
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex font-sans relative overflow-x-hidden">
      
      {/* Ambient Blurred Background Glows */}
      <div className="fixed bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/8 blur-[140px] rounded-full pointer-events-none z-0" />

      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-white/70 backdrop-blur-xl text-slate-800 flex-col justify-between shrink-0 border-r border-slate-200/80 relative select-none z-10 transition-all duration-300">
        {/* Fine grid noise overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

        <div className="relative z-10">
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-150">
              <Shirt className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-sans text-lg font-bold tracking-tight text-slate-900 block">APEX</span>
              <span className="font-mono text-[9px] text-indigo-650 tracking-widest leading-none block font-semibold">Wholesale Portal</span>
            </div>
          </div>

          {/* Nav Categories */}
          <nav className="p-4 space-y-2.5 mt-4">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider px-3 block mb-1">
              Main Menu
            </span>

            {[
              { id: 'dashboard' as const, label: 'Overview Metrics', icon: LayoutDashboard },
              { id: 'clients' as const, label: 'Client Directory', icon: Users },
              { id: 'orders' as const, label: 'Order Queue', icon: ShoppingBag },
              { id: 'analytics' as const, label: 'Business Analytics', icon: BarChart3 }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  id={`sidebar-link-${tab.id}`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer font-medium ${
                    isActive 
                      ? 'bg-indigo-50 border border-indigo-100/60 text-indigo-700 font-semibold shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <IconComp className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}

            <div className="pt-6 border-t border-slate-100 mt-6 space-y-3">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider px-3.5 block mb-1">
                Active Session Summary
              </span>
              
              <div className="mx-3.5 p-3.5 bg-gradient-to-tr from-indigo-50/40 to-slate-50/50 border border-slate-100 rounded-2xl text-[11px] font-mono text-slate-600 space-y-2.5 shadow-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100/60">
                  <span className="text-slate-400 font-sans text-[10px] font-semibold">SESSION STATUS</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1 font-sans text-[10px]">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                    SECURE ACTIVE
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-[10px] text-slate-450 font-semibold">PARTNERS LOADED:</span>
                  <span className="text-slate-900 font-mono font-bold">{clients.length} Buyers</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-sans text-[10px] text-slate-450 font-semibold">ACTIVE PIPELINE:</span>
                  <span className="text-slate-900 font-mono font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0
                    }).format(orders.filter(o => o.status !== 'Cancelled').reduce((add, o) => add + o.totalAmount, 0))}
                  </span>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* User profile with logout button */}
        <div className="relative z-10 p-4 border-t border-slate-100 bg-white/40 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 font-bold font-sans text-xs text-indigo-700 shrink-0 select-none">
              {user.username.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-slate-900 block truncate leading-tight">
                {user.username}
              </span>
              <span className="text-[10px] text-slate-500 block truncate font-light font-sans mt-0.5">
                {user.role}
              </span>
            </div>
          </div>

          <button
            id="sidebar-logout-button"
            onClick={handleLogout}
            title="Sign out of portal"
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-md text-slate-900 border-b border-slate-200/80 flex items-center justify-between px-4 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <Shirt className="h-5 w-5 text-indigo-600" />
          <span className="font-sans font-bold tracking-wider text-sm text-slate-900">APEX CRM</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-trigger-button"
            onClick={() => setIsMobileSidebarOpen(prev => !prev)}
            className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg cursor-pointer transition-all"
          >
            {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Menu Overlay Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-slate-900/10 backdrop-blur-xs z-45 cursor-pointer top-16"
            />

            {/* Mobile Nav Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed bottom-0 left-0 w-80 bg-white/95 backdrop-blur-xl text-slate-800 border-r border-slate-200/80 z-50 p-5 pt-8 top-16 flex flex-col justify-between select-none"
            >
              <div className="space-y-6">
                {/* Active user status overview */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                  <div className="h-8 w-8 bg-indigo-50 rounded-full font-bold flex items-center justify-center text-xs text-indigo-600">
                    {user.username.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block leading-none">{user.username}</span>
                    <span className="text-[10px] text-slate-500 block mt-1 font-light">{user.role}</span>
                  </div>
                </div>

                <nav className="space-y-2">
                  {[
                    { id: 'dashboard' as const, label: 'Overview Metrics', icon: LayoutDashboard },
                    { id: 'clients' as const, label: 'Client Directory', icon: Users },
                    { id: 'orders' as const, label: 'Order Queue', icon: ShoppingBag },
                    { id: 'analytics' as const, label: 'Business Analytics', icon: BarChart3 }
                  ].map((tab) => {
                    const IconComp = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        id={`mobile-link-${tab.id}`}
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                          isActive 
                            ? 'bg-indigo-50 border border-indigo-100 text-indigo-750 font-semibold' 
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <IconComp className="h-4.5 w-4.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div>
                <button
                  id="mobile-logout-button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-500/10 text-red-500 hover:text-white hover:bg-red-600 font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-200"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="flex-1 min-w-0 pt-20 lg:pt-8 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full transition-all relative z-10">
        
        {/* Workspace Display Area */}
        <div className="w-full">
          {activeTab === 'dashboard' && (
            <DashboardView 
              clients={clients} 
              orders={orders} 
              onNavigateToTab={(tab) => setActiveTab(tab)}
              userName={user.username}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView 
              clients={clients} 
              orders={orders} 
            />
          )}

          {activeTab === 'clients' && (
            <ClientDirectory 
              clients={clients} 
              onAddClient={handleAddClient} 
            />
          )}

          {activeTab === 'orders' && (
            <OrderKanban 
              orders={orders}
              clients={clients}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onAddOrder={handleAddOrder}
            />
          )}
        </div>
        
      </main>
    </div>
  );
}
