import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { useMemo } from 'react';
import { Package, TrendingUp, ShoppingBag, Clock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/language';
import { useStore } from '../../context/store';
import { useCatalog } from '../../context/catalog';
import AnimatedCounter from '../ui/AnimatedCounter';

const STATUS_COLORS = {
  pending: '#D97706',
  validated: '#2563EB',
  shipped: '#7C3AED',
  delivered: '#16A34A',
  cancelled: '#DC2626',
};

export default function StatsDashboard() {
  const { t } = useLanguage();
  const { orders } = useStore();
  const { products } = useCatalog();

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const averageOrderValue = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    // Orders by Wilaya
    const wilayaCounts = {};
    orders.forEach(o => {
      if (o.wilaya) {
        wilayaCounts[o.wilaya] = (wilayaCounts[o.wilaya] || 0) + 1;
      }
    });
    const wilayaData = Object.entries(wilayaCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Order Status Distribution
    const statusCounts = { pending: 0, validated: 0, shipped: 0, delivered: 0, cancelled: 0 };
    orders.forEach(o => {
      if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
    });
    const statusData = Object.entries(statusCounts)
      .filter(([_, value]) => value > 0)
      .map(([status, value]) => ({ name: t(status), status, value }));

    // Revenue by Day (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const revenueByDayData = last7Days.map(date => {
      const dayTotal = orders
        .filter(o => o.status !== 'cancelled' && o.createdAt.startsWith(date))
        .reduce((sum, o) => sum + o.total, 0);
      return {
        date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
        revenue: dayTotal
      };
    });

    // Top Selling Products
    const productSales = {};
    orders.forEach(o => {
      if (o.status !== 'cancelled') {
        o.items.forEach(item => {
          productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        });
      }
    });
    const topProductsData = Object.entries(productSales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      totalOrders: orders.length,
      totalRevenue,
      averageOrderValue,
      pendingOrders,
      wilayaData,
      statusData,
      revenueByDayData,
      topProductsData
    };
  }, [orders, t]);

  const kpis = [
    { label: t('totalOrders'), value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-100' },
    { label: t('totalRevenue'), value: stats.totalRevenue, icon: TrendingUp, color: 'text-gold', bg: 'bg-yellow-100', format: v => `${v.toLocaleString()} DZD` },
    { label: t('pendingOrders'), value: stats.pendingOrders, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-100' },
    { label: t('outOfStock'), value: products.filter(p => Number(p.stock ?? p.quantity ?? 0) === 0).length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-full ${kpi.bg} ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted">{kpi.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                <AnimatedCounter value={kpi.value} formatValue={kpi.format} />
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">{t('revenueByDay')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueByDayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D48900" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D48900" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip cursor={{ stroke: '#eee', strokeWidth: 2 }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#D48900" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">{t('ordersByWilaya')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.wilayaData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#555' }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#D48900" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">{t('topSellingProducts')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topProductsData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} interval={0} angle={-25} textAnchor="end" height={60} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#4B5563" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">{t('orderStatusDistribution')}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#6B7280'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
