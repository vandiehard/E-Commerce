import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../api';
import { formatPrice, formatDate, ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS, getImageUrl } from '../utils/format';
import { Badge, Spinner, EmptyState } from '../components/UI';
import { Package } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await orderAPI.list();
        setOrders(res.data.data);
        setPagination(res.data.pagination);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Spinner />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="Start shopping to see your orders here"
        action={
          <Link to="/products" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90">
            Browse Products
          </Link>
        }
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Order #{order.id}</span>
              <span className="text-xs text-text-light">{formatDate(order.created_at)}</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              {order.items?.slice(0, 3).map((item) => (
                <div key={item.id} className="w-12 h-12 bg-surface rounded overflow-hidden">
                  <img src={getImageUrl(item.product?.images)} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {order.items?.length > 3 && (
                <span className="text-xs text-text-light">+{order.items.length - 3} more</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={ORDER_STATUS_COLORS[order.status]}>{order.status}</Badge>
                <Badge className={PAYMENT_STATUS_COLORS[order.payment_status]}>{order.payment_status}</Badge>
              </div>
              <span className="font-bold text-sm">{formatPrice(order.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
