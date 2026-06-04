import { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3,
  PieChart as PieChartIcon,
  CircleDollarSign,
  LineChart,
  Layers,
  Award
} from 'lucide-react';
import { Client, Order } from '../types';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface AnalyticsViewProps {
  clients: Client[];
  orders: Order[];
}

// Category distribution config (business-defined, not mock)
const CATEGORY_DISTRIBUTION = [
  { name: 'Athleisure', value: 35, color: '#6366F1' },
  { name: 'Outerwear', value: 25, color: '#3B82F6' },
  { name: 'Streetwear', value: 20, color: '#A3E635' },
  { name: 'Formal/Luxe', value: 15, color: '#8B5CF6' },
  { name: 'Accessories', value: 5, color: '#EC4899' },
];

export default function AnalyticsView({ clients, orders }: AnalyticsViewProps) {
  const [chartTab, setChartTab] = useState<'h1' | 'target'>('target');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  // Compute sales trend data dynamically from orders
  const activeOrders = orders.filter(o => o.status !== 'Cancelled');
  const totalWholesaleVolume = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Group orders by month for the trend chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const ordersByMonth: Record<string, { sales: number; orders: number }> = {};
  
  activeOrders.forEach(order => {
    const date = new Date(order.createdAt);
    const monthKey = monthNames[date.getMonth()];
    if (!ordersByMonth[monthKey]) {
      ordersByMonth[monthKey] = { sales: 0, orders: 0 };
    }
    ordersByMonth[monthKey].sales += order.totalAmount;
    ordersByMonth[monthKey].orders += 1;
  });

  // Build trend data for the last 6 months (or all available)
  const targets = [40000, 60000, 90000, 115000, 150000, 195000];
  const currentMonth = new Date().getMonth();
  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    const monthIdx = (currentMonth - i + 12) % 12;
    const monthName = monthNames[monthIdx];
    const monthData = ordersByMonth[monthName] || { sales: 0, orders: 0 };
    trendData.push({
      month: monthName,
      sales: monthData.sales,
      orders: monthData.orders,
      target: targets[5 - i] || 50000,
    });
  }

  // Dynamic: top 5 wholesale clients by spend
  const topBuyersData = [...clients]
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 5)
    .map(buyer => ({
      name: buyer.company.length > 15 ? buyer.company.slice(0, 13) + '..' : buyer.company,
      spend: buyer.totalSpend,
      orders: buyer.totalOrders,
    }));

  // Dynamic: spend by client Tier
  const tierSpendMap = clients.reduce((acc, client) => {
    const tier = client.tier;
    const spend = client.totalSpend;
    acc[tier] = (acc[tier] || 0) + spend;
    return acc;
  }, {} as Record<string, number>);

  const tierChartData = ['Platinum', 'Gold', 'Silver', 'Bronze'].map(tier => ({
    tier,
    spend: tierSpendMap[tier] || 0,
    color: tier === 'Platinum' ? '#6366F1' : tier === 'Gold' ? '#F59E0B' : tier === 'Silver' ? '#10B981' : '#3B82F6',
  }));

  // Analytical stats
  const avgOrderValue = activeOrders.length > 0 
    ? activeOrders.reduce((sum, o) => sum + o.totalAmount, 0) / activeOrders.length 
    : 0;

  const platinumSpend = tierSpendMap['Platinum'] || 0;
  const platinumRatio = totalWholesaleVolume > 0 ? (platinumSpend / totalWholesaleVolume) * 100 : 0;

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/85 shadow-xs">
        <div>
          <span className="text-xs font-mono tracking-widest text-[#6366F1] uppercase block mb-1 font-semibold">
            MARKET INTELLIGENCE & ANALYSIS
          </span>
          <h1 className="text-2xl font-bold text-slate-900 font-sans tracking-tight">
            Wholesale Capital Analytics
          </h1>
          <p className="text-sm font-light text-slate-500 mt-1">
            Analyze account spending patterns, regional class distribution, and seasonal sales targets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 font-mono">SEASON FILTER:</span>
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-220 rounded-xl text-xs font-medium text-slate-700 shadow-xs cursor-pointer focus:outline-hidden"
          >
            <option value="all">All Seasons (AY 25/26)</option>
            <option value="autumn">Autumn Run (Active)</option>
            <option value="winter">Winter Release</option>
          </select>
        </div>
      </div>

      {/* Specialty Analytical KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Order Size */}
        <div className="bg-white/85 border border-slate-200/80 p-6 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops)) from-indigo-50/30 via-transparent to-transparent opacity-100 transition-all group-hover:scale-110" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono tracking-wider font-semibold text-slate-400 block uppercase">
                AVERAGE ACQUISITION VALUE
              </span>
              <span className="text-2xl font-bold font-sans text-slate-950 block mt-2">
                {formatCurrency(avgOrderValue)}
              </span>
              <p className="text-xs text-slate-500 font-light mt-1.5 leading-relaxed">
                Calculated from {activeOrders.length} active orders in the pipeline.
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <CircleDollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Premium Contribution Ratio */}
        <div className="bg-white/85 border border-slate-200/80 p-6 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops)) from-purple-50/30 via-transparent to-transparent opacity-100 transition-all group-hover:scale-110" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono tracking-wider font-semibold text-slate-400 block uppercase">
                PLATINUM RATIO SHARE
              </span>
              <span className="text-2xl font-bold font-sans text-slate-950 block mt-2">
                {platinumRatio.toFixed(1)}%
              </span>
              <p className="text-xs text-slate-500 font-light mt-1.5 leading-relaxed">
                Percentage of total pipeline powered by Platinum accounts.
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Total Pipeline */}
        <div className="bg-white/85 border border-slate-200/80 p-6 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops)) from-emerald-50/30 via-transparent to-transparent opacity-100 transition-all group-hover:scale-110" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-mono tracking-wider font-semibold text-slate-400 block uppercase">
                TOTAL PIPELINE VALUE
              </span>
              <span className="text-2xl font-bold font-sans text-emerald-600 block mt-2">
                {formatCurrency(totalWholesaleVolume)}
              </span>
              <p className="text-xs text-slate-500 font-light mt-1.5 leading-relaxed">
                Wholesale order intake across {clients.length} registered buyers.
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Area + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <LineChart className="h-4.5 w-4.5 text-indigo-600" />
                Performance Track & Target Trends
              </h2>
              <p className="text-xs font-light text-slate-400 mt-0.5">
                Compare actual processed wholesale totals with defined collection milestones
              </p>
            </div>
            
            <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/40">
              <button
                onClick={() => setChartTab('h1')}
                className={`text-xs px-2.5 py-1 font-sans rounded-lg cursor-pointer transition-all ${
                  chartTab === 'h1' 
                    ? 'bg-white font-semibold text-indigo-700 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                H1 Progress Only
              </button>
              <button
                onClick={() => setChartTab('target')}
                className={`text-xs px-2.5 py-1 font-sans rounded-lg cursor-pointer transition-all ${
                  chartTab === 'target' 
                    ? 'bg-white font-semibold text-indigo-700 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                Show Target Trend
              </button>
            </div>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                  tickFormatter={(v) => `$${v/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px', 
                    color: '#0f172a', 
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    fontFamily: 'sans-serif',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.05)'
                  }}
                  formatter={(val, name) => {
                    const label = name === 'sales' ? 'Wholesale Volume' : 'Defined Target Milestone';
                    return [`$${Number(val).toLocaleString()}`, label];
                  }}
                />
                
                {chartTab === 'target' && (
                  <Area 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#F59E0B" 
                    strokeWidth={2} 
                    strokeDasharray="4 4"
                    fillOpacity={1} 
                    fill="url(#colorTarget)" 
                    name="target"
                  />
                )}
                
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#6366F1" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  name="sales"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-indigo-600" />
                Fabric Segment Mix
              </h2>
              <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-150 uppercase font-semibold">
                By Volume %
              </span>
            </div>
            <p className="text-xs font-light text-slate-400 mb-4">
              Total sales share breakdown across your custom garment catalogs
            </p>
          </div>

          <div className="h-[180px] flex items-center justify-center relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CATEGORY_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Garment Sector Mix']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(8px)', 
                    borderRadius: '12px', 
                    color: '#0f172a', 
                    border: '1px solid rgba(226, 232, 240, 0.8)', 
                    fontSize: 11 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold font-sans tracking-tight text-slate-900 border-b border-indigo-100 pb-0.5">
                5
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest leading-none mt-1">
                GARMENT LABELS
              </span>
            </div>
          </div>

          <div className="space-y-2 mt-2">
            {CATEGORY_DISTRIBUTION.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-600 font-sans font-medium">{cat.name}</span>
                </div>
                <span className="text-slate-550 font-mono">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Top Wholesalers (Bar Chart) & Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Buyer Standings */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-[#6366F1]" />
                Primary Buyer Spending Hierarchies
              </h2>
              <p className="text-xs font-light text-slate-400 mt-0.5">
                Accumulative wholesale orders pipeline of your top accounts
              </p>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#6366F1] bg-indigo-50/50 rounded-md px-2 py-0.5 border border-indigo-150 font-bold">
              Account Value Rank
            </span>
          </div>

          <div className="h-[240px] w-full">
            {topBuyersData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topBuyersData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis 
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                    tickFormatter={(v) => `$${v/1000}k`}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={110}
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      backdropFilter: 'blur(8px)',
                      borderRadius: '12px', 
                      color: '#0f172a', 
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      fontFamily: 'sans-serif',
                      fontSize: '11px',
                      boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.05)'
                    }}
                    formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Accumulated Capital Spend']}
                  />
                  <Bar 
                    dataKey="spend" 
                    fill="#6366F1" 
                    radius={[0, 8, 8, 0]}
                    barSize={16}
                  >
                    {topBuyersData.map((entry, index) => {
                      const colors = ['#6366F1', '#4F46E5', '#4338CA', '#3730A3', '#312E81'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-light">
                No client data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Tier Distribution */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <PieChartIcon className="h-4.5 w-4.5 text-[#6366F1]" />
                Client Tier Capital Volume
              </h2>
              <span className="text-[10px] font-mono bg-indigo-50 text-[#6366F1] px-2 py-0.5 rounded border border-indigo-150 uppercase font-semibold">
                Memberships
              </span>
            </div>
            <p className="text-xs font-light text-slate-400 mb-4">
              Gross sales allocation grouped by customer standing tier
            </p>
          </div>

          <div className="h-[180px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tierChartData}
                margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="tier"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(v) => `$${v/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px', 
                    color: '#0f172a', 
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    fontFamily: 'sans-serif',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.05)'
                  }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Tier Cumulative Spend']}
                />
                <Bar 
                  dataKey="spend" 
                  radius={[8, 8, 0, 0]}
                  barSize={24}
                >
                  {tierChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
            {tierChartData.map((tier, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium leading-none">
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: tier.color }} />
                  {tier.tier}
                </span>
                <span className="text-xs font-bold font-mono text-slate-800 mt-1">
                  {formatCurrency(tier.spend)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
