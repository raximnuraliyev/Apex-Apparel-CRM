import { motion } from 'motion/react';
import { 
  Users, 
  ShoppingBag, 
  CircleDollarSign, 
  ArrowUpRight, 
  Truck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Client, Order, ActiveTab } from '../types';

interface DashboardViewProps {
  clients: Client[];
  orders: Order[];
  onNavigateToTab: (tab: ActiveTab) => void;
  userName: string;
}

export default function DashboardView({ clients, orders, onNavigateToTab, userName }: DashboardViewProps) {
  // Compute key stats
  const totalRegisteredBuyers = clients.length;
  
  // Pending and Processing orders count
  const activeOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const processingOrdersCount = orders.filter(o => o.status === 'Processing').length;
  const shippedOrdersCount = orders.filter(o => o.status === 'Shipped').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  
  // Total wholesale volume (sales) - sum of non-cancelled orders
  const totalWholesaleVolume = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((add, o) => add + o.totalAmount, 0);

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Compute dynamic performance stats from real data
  const totalOrders = orders.length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
  const fulfillmentRate = totalOrders > 0 ? (((totalOrders - cancelledOrders) / totalOrders) * 100).toFixed(1) : '0.0';
  const avgOrderValue = orders.filter(o => o.status !== 'Cancelled').length > 0
    ? Math.round(totalWholesaleVolume / orders.filter(o => o.status !== 'Cancelled').length)
    : 0;

  const performanceMetrics = [
    { label: 'SLA Fulfillment Rate', value: `${fulfillmentRate}%`, type: 'up' as const },
    { label: 'Avg Order Value', value: formatCurrency(avgOrderValue), type: 'up' as const },
    { label: 'Active Pipeline Orders', value: `${activeOrdersCount}`, type: 'up' as const }
  ];

  // Recent 4 orders
  const recentOrders = [...orders]
    .sort((a,b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#6366F1] uppercase block mb-1 font-semibold">
            OPERATIONAL LOGISTICS
          </span>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-sm font-light text-slate-500 mt-1">
            Wholesale operations are running smoothly. View your buyer metrics and active queue below.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-450 block font-mono font-semibold uppercase">SEASONAL RUN</span>
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50/50 rounded-md px-2.5 py-1 border border-indigo-200/70 font-mono">
              Autumn Collection 25/26
            </span>
          </div>
          <button 
            id="create-order-shortcut-button"
            onClick={() => onNavigateToTab('orders')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-indigo-100 flex items-center gap-2 cursor-pointer"
          >
            Go to Kanban Queue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            id: 'metric-wholesale-buyers',
            title: 'Registered Wholesalers',
            value: totalRegisteredBuyers,
            change: `${clients.filter(c => c.status === 'Active').length} active accounts`,
            isPositive: true,
            icon: Users,
            iconColor: 'text-indigo-600',
            iconBg: 'bg-indigo-50',
            actionTab: 'clients' as const
          },
          {
            id: 'metric-active-orders',
            title: 'Active Orders',
            value: activeOrdersCount,
            change: `${pendingOrdersCount} pending, ${processingOrdersCount} in work`,
            isPositive: true,
            icon: ShoppingBag,
            iconColor: 'text-amber-600',
            iconBg: 'bg-amber-50',
            actionTab: 'orders' as const
          },
          {
            id: 'metric-shipped-orders',
            title: 'Shipped & Delivered',
            value: shippedOrdersCount + deliveredOrdersCount,
            change: `${shippedOrdersCount} shipped, ${deliveredOrdersCount} delivered`,
            isPositive: true,
            icon: Truck,
            iconColor: 'text-lime-600',
            iconBg: 'bg-lime-50',
            actionTab: 'orders' as const
          },
          {
            id: 'metric-wholesale-value',
            title: 'Total Pipeline Value',
            value: formatCurrency(totalWholesaleVolume),
            change: `${orders.filter(o => o.status !== 'Cancelled').length} active orders`,
            isPositive: true,
            icon: CircleDollarSign,
            iconColor: 'text-purple-600',
            iconBg: 'bg-purple-50',
            actionTab: 'dashboard' as const
          }
        ].map((item, idx) => {
          const IconComp = item.icon;
          return (
            <motion.div
              id={item.id}
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onNavigateToTab(item.actionTab)}
              className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/85 hover:border-indigo-200/80 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops)) from-indigo-50/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-start justify-between mb-4">
                <span className="text-sm font-medium text-slate-500 block">
                  {item.title}
                </span>
                <div className={`p-2.5 rounded-xl ${item.iconBg} ${item.iconColor} transition-transform group-hover:scale-110`}>
                  <IconComp className="h-5 w-5" />
                </div>
              </div>
              
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
                  {item.value}
                </span>
              </div>
              
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-sans">
                  {item.change}
                </span>
                <span className="text-xs text-indigo-600 group-hover:underline flex items-center font-mono font-medium">
                  View <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Grid: Live Activity and Operational SLA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Stream */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Recent Orders Queue
                </h2>
                <p className="text-xs font-light text-slate-400 mt-0.5">
                  Latest wholesale sequences requested by buyers
                </p>
              </div>
              <button 
                id="view-all-orders-dashboard-button"
                onClick={() => onNavigateToTab('orders')}
                className="text-xs font-mono text-indigo-600 hover:underline flex items-center cursor-pointer font-semibold"
              >
                Open Kanban Panel <ArrowUpRight className="h-4.5 w-4.5 ml-0.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {recentOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm font-light">
                  No orders found. Create your first order to get started.
                </div>
              ) : recentOrders.map((ord) => {
                const statusStyles: Record<string, string> = {
                  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
                  Processing: 'bg-indigo-50 text-indigo-700 border-indigo-150',
                  Shipped: 'bg-lime-50 text-lime-700 border-lime-200',
                  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  Cancelled: 'bg-slate-100 text-slate-600 border-slate-250'
                };
                const displayDate = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-CA') : '';
                return (
                  <div 
                    key={ord._id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border border-slate-150/50 hover:border-indigo-200/80 hover:bg-indigo-50/40 bg-white/40 rounded-xl transition-all gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-white/70 flex items-center justify-center rounded-lg border border-slate-150 shrink-0">
                        <ShoppingBag className="h-4.5 w-4.5 text-indigo-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-900">
                            {ord.orderNumber}
                          </span>
                          <span className="text-xs text-slate-400">• {displayDate}</span>
                        </div>
                        <span className="text-xs text-slate-500 block font-light">
                          {ord.companyName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="text-sm font-mono font-bold text-slate-930">
                        {formatCurrency(ord.totalAmount)}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusStyles[ord.status] || ''}`}>
                        {ord.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Operational KPI Overview */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-200/10 backdrop-blur-xl text-white p-6 rounded-2xl shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-x-0 bottom-0 top-1/2 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
          <div className="absolute top-[10%] left-[60%] w-[180px] h-[180px] bg-indigo-500/10 rounded-full blur-[50px]" />

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <span className="px-2.5 py-0.5 bg-white/10 text-indigo-300 text-[10px] font-mono tracking-wider rounded uppercase font-bold">
                OPERATIONAL KPI
              </span>
              <Sparkles className="h-4 w-4 text-indigo-300" />
            </div>

            <h3 className="text-xl font-light tracking-tight text-white mb-1.5 font-sans">
              Distribution Health
            </h3>
            <p className="text-slate-350 text-xs font-light leading-relaxed mb-6">
              Real-time dispatch efficiency, order fulfillment rate, and pipeline metrics computed from live data.
            </p>

            <div className="space-y-4">
              {performanceMetrics.map((met, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase block tracking-wider font-semibold">
                      {met.label}
                    </span>
                    <span className="text-lg font-semibold text-white tracking-tight mt-0.5 block font-sans">
                      {met.value}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold rounded-md uppercase">
                    {met.type === 'up' ? 'OPTIMAL' : 'NOMINAL'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-4 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>OPERATIONAL STATUS:</span>
            <span className="text-emerald-400 font-bold uppercase">Optimal Level</span>
          </div>
        </div>

      </div>
    </div>
  );
}
