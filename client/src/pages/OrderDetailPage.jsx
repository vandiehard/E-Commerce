import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../api';
import { formatPrice, formatDateTime, getImageUrl, ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from '../utils/format';
import { Badge, Spinner } from '../components/UI';
import { Package, MapPin, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await orderAPI.getDetail(id);
        setOrder(res.data.data);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await orderAPI.cancel(id);
      setOrder(res.data.data);
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) return <Spinner />;
  if (!order) return <div className="text-center py-20">Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <p className="text-sm text-text-light">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={ORDER_STATUS_COLORS[order.status]}>{order.status}</Badge>
          <Badge className={PAYMENT_STATUS_COLORS[order.payment_status]}>{order.payment_status}</Badge>
        </div>
      </div>

      {/* Pay button if pending */}
      {order.snap_token && order.payment_status === 'pending' && (
        <div className="bg-surface rounded-lg p-4 mb-6">
          <p className="text-sm mb-3">Complete your payment to process this order</p>
          <button
            onClick={() => {
              window.snap.pay(order.snap_token, {
                onSuccess: () => window.location.reload(),
                onPending: () => window.location.reload(),
              });
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90"
          >
            Pay Now
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Items */}
          <section className="border border-border rounded-lg p-4">
            <h2 className="font-bold mb-4 flex items-center gap-2"><Package className="w-5 h-5" /> Items</h2>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <Link to={`/products/${item.product?.slug}`} className="w-14 h-14 bg-surface rounded overflow-hidden shrink-0">
                    <img src={getImageUrl(item.product?.images)} alt="" className="w-full h-full object-cover" />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/products/${item.product?.slug}`} className="text-sm font-medium hover:underline">
                      {item.product?.name}
                    </Link>
                    <p className="text-xs text-text-light">x{item.quantity} @ {formatPrice(item.price)}</p>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Shipping Address */}
          {order.address && (
            <section className="border border-border rounded-lg p-4">
              <h2 className="font-bold mb-3 flex items-center gap-2"><MapPin className="w-5 h-5" /> Shipping Address</h2>
              <p className="text-sm">{order.address.label}</p>
              <p className="text-sm text-text-light">{order.address.street}, {order.address.city}, {order.address.province} {order.address.postal_code}</p>
            </section>
          )}

          {/* Tracking */}
          {order.tracking_number && (
            <section className="border border-border rounded-lg p-4">
              <h2 className="font-bold mb-3 flex items-center gap-2"><Truck className="w-5 h-5" /> Tracking</h2>
              <p className="text-sm font-mono">{order.tracking_number}</p>
            </section>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="border border-border rounded-lg p-4">
            <h2 className="font-bold mb-4">Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-light">Subtotal</span><span>{formatPrice(order.total - (order.shipping_cost || 0))}</span></div>
              <div className="flex justify-between"><span className="text-text-light">Shipping ({order.shipping_method})</span><span>{formatPrice(order.shipping_cost)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {order.status === 'pending' && (
              <button
                onClick={handleCancel}
                className="w-full mt-4 py-2 border border-border rounded-lg text-sm hover:bg-surface"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
