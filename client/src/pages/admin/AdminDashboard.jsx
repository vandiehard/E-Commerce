import { useEffect, useState } from 'react';
import { adminAPI } from '../../api';
import { formatPrice } from '../../utils/format';
import { Spinner } from '../../components/UI';
import { DollarSign, ShoppingBag, Package, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.dashboard().then((res) => { setData(res.data.data); setLoading(false); });
  }, []);

  if (loading) return <Spinner />;

  const stats = data?.stats || {};
  const cards = [
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue || 0), icon: DollarSign },
    { label: 'Total Orders', value: stats.totalOrders || 0, icon: ShoppingBag },
    { label: 'Total Products', value: stats.totalProducts || 0, icon: Package },
    { label: 'Total Customers', value: stats.totalUsers || 0, icon: Users },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <card.icon className="w-5 h-5 text-text-light" />
              <span className="text-sm text-text-light">{card.label}</span>
            </div>
            <p className="text-xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Order</th>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {data?.recentOrders?.map((order) => (
              <tr key={order.id} className="border-t border-border">
                <td className="px-4 py-3">#{order.id}</td>
                <td className="px-4 py-3">{order.user?.name}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-surface rounded text-xs">{order.status}</span></td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
