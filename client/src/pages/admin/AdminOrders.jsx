import { useEffect, useState } from 'react';
import { adminOrderAPI, adminAPI } from '../../api';
import { formatPrice, formatDate } from '../../utils/format';
import { Spinner, Badge, Modal } from '../../components/UI';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', tracking_number: '' });

  const load = async () => {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    const res = await adminOrderAPI.list(params);
    setOrders(res.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const openStatusModal = (order) => {
    setSelected(order);
    setStatusForm({ status: order.status, tracking_number: order.tracking_number || '' });
    setShowModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await adminOrderAPI.updateStatus(selected.id, statusForm);
      toast.success('Order updated');
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleExport = async () => {
    try {
      const res = await adminAPI.exportOrders();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Export failed'); }
  };

  if (loading) return <Spinner />;

  const statuses = ['', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-surface">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {statuses.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${filter === s ? 'bg-primary text-white' : 'border border-border hover:bg-surface'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Order</th>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">#{o.id}</td>
                <td className="px-4 py-3">{o.user?.name}</td>
                <td className="px-4 py-3 text-text-light">{formatDate(o.created_at)}</td>
                <td className="px-4 py-3">
                  <Badge className="bg-surface">{o.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(o.total)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openStatusModal(o)} className="text-xs hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Update Order #${selected?.id}`}>
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tracking Number</label>
            <input type="text" value={statusForm.tracking_number} onChange={(e) => setStatusForm({ ...statusForm, tracking_number: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Update</button>
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
