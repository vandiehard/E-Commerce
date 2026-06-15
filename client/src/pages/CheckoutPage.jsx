import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { addressAPI, orderAPI } from '../api';
import { formatPrice, getImageUrl } from '../utils/format';
import { Spinner } from '../components/UI';
import { MapPin, Plus, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const shippingOptions = [
  { value: 'regular', label: 'Regular Shipping', cost: 15000 },
  { value: 'express', label: 'Express Shipping', cost: 30000 },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [shipping, setShipping] = useState(shippingOptions[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', street: '', city: '', province: '', postal_code: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await addressAPI.list();
        setAddresses(res.data.data);
        const defaultAddr = res.data.data.find((a) => a.is_default) || res.data.data[0];
        if (defaultAddr) setSelectedAddress(defaultAddr);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const items = cart.items || [];
  const itemsTotal = cart.total || 0;
  const total = itemsTotal + shipping.cost;

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressAPI.create({ ...newAddress, is_default: addresses.length === 0 });
      setAddresses([...addresses, res.data.data]);
      setSelectedAddress(res.data.data);
      setShowAddressForm(false);
      toast.success('Address added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    setSubmitting(true);
    try {
      const res = await orderAPI.create({
        address_id: selectedAddress.id,
        shipping_method: shipping.value,
        shipping_cost: shipping.cost,
      });
      await clearCart();

      const orderData = res.data.data;

      // Load Midtrans Snap if token is available
      if (orderData.snap_token) {
        window.snap.pay(orderData.snap_token, {
          onSuccess: () => {
            navigate(`/orders/${orderData.id}`);
          },
          onPending: () => {
            navigate(`/orders/${orderData.id}`);
          },
          onError: () => {
            navigate(`/orders/${orderData.id}`);
          },
          onClose: () => {
            navigate(`/orders/${orderData.id}`);
          },
        });
      } else {
        navigate(`/orders/${orderData.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  if (items.length === 0) {
    return <div className="text-center py-20"><p>Your cart is empty</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Shipping Address */}
          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5" /> Shipping Address</h2>
            {addresses.length > 0 ? (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label key={addr.id} className={`block border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedAddress?.id === addr.id ? 'border-primary bg-surface' : 'border-border hover:bg-surface'
                  }`}>
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === addr.id}
                      onChange={() => setSelectedAddress(addr)}
                      className="sr-only"
                    />
                    <div className="flex items-start gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                        selectedAddress?.id === addr.id ? 'border-primary bg-primary' : 'border-border'
                      }`} />
                      <div>
                        <span className="text-sm font-medium">{addr.label}</span>
                        <p className="text-xs text-text-light mt-1">{addr.street}, {addr.city}, {addr.province} {addr.postal_code}</p>
                      </div>
                    </div>
                  </label>
                ))}
                <button onClick={() => setShowAddressForm(true)} className="flex items-center gap-2 text-sm text-text-light hover:underline mt-2">
                  <Plus className="w-4 h-4" /> Add new address
                </button>
              </div>
            ) : (
              <div className="border border-border rounded-lg p-6 text-center">
                <p className="text-sm text-text-light mb-3">No addresses saved yet</p>
                <button onClick={() => setShowAddressForm(true)} className="text-sm font-medium hover:underline">
                  Add a shipping address
                </button>
              </div>
            )}

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="mt-4 border border-border rounded-lg p-4 space-y-3">
                <input placeholder="Label (e.g. Home)" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm" required />
                <input placeholder="Street" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm" required />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="px-3 py-2 border border-border rounded-lg text-sm" required />
                  <input placeholder="Province" value={newAddress.province} onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })} className="px-3 py-2 border border-border rounded-lg text-sm" required />
                </div>
                <input placeholder="Postal Code" value={newAddress.postal_code} onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm" required />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Save</button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
                </div>
              </form>
            )}
          </section>

          {/* Shipping Method */}
          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Truck className="w-5 h-5" /> Shipping Method</h2>
            <div className="space-y-2">
              {shippingOptions.map((opt) => (
                <label key={opt.value} className={`block border rounded-lg p-3 cursor-pointer transition-colors ${
                  shipping.value === opt.value ? 'border-primary bg-surface' : 'border-border hover:bg-surface'
                }`}>
                  <input type="radio" name="shipping" checked={shipping.value === opt.value} onChange={() => setShipping(opt)} className="sr-only" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-sm">{formatPrice(opt.cost)}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Order Summary */}
        <div>
          <div className="border border-border rounded-lg p-4 sticky top-24">
            <h2 className="font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface rounded overflow-hidden shrink-0">
                    <img src={getImageUrl(item.product?.images)} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs line-clamp-1">{item.product?.name}</p>
                    <p className="text-xs text-text-light">x{item.quantity}</p>
                  </div>
                  <span className="text-xs font-medium">{formatPrice(item.product?.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(itemsTotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(shipping.cost)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={submitting || !selectedAddress}
              className="w-full mt-4 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
