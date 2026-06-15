import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, addressAPI } from '../api';
import { Spinner } from '../components/UI';
import { User, MapPin, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loadUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: '', phone: '' });
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: '', street: '', city: '', province: '', postal_code: '' });
  const [showAddrForm, setShowAddrForm] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone || '' });
  }, [user]);

  useEffect(() => {
    if (tab === 'addresses') {
      addressAPI.list().then((res) => setAddresses(res.data.data));
    }
  }, [tab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile(form);
      await loadUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addressAPI.create(addrForm);
      const res = await addressAPI.list();
      setAddresses(res.data.data);
      setAddrForm({ label: '', street: '', city: '', province: '', postal_code: '' });
      setShowAddrForm(false);
      toast.success('Address added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressAPI.delete(id);
      setAddresses(addresses.filter((a) => a.id !== id));
      toast.success('Address deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('profile')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'profile' ? 'bg-primary text-white' : 'border border-border hover:bg-surface'}`}>
          <User className="w-4 h-4 inline mr-1" /> Profile
        </button>
        <button onClick={() => setTab('addresses')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'addresses' ? 'bg-primary text-white' : 'border border-border hover:bg-surface'}`}>
          <MapPin className="w-4 h-4 inline mr-1" /> Addresses
        </button>
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={user?.email} disabled className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary" />
          </div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'addresses' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">My Addresses</h2>
            <button onClick={() => setShowAddrForm(true)} className="flex items-center gap-1 text-sm font-medium hover:underline">
              <Plus className="w-4 h-4" /> Add Address
            </button>
          </div>

          {showAddrForm && (
            <form onSubmit={handleAddAddress} className="border border-border rounded-lg p-4 mb-4 space-y-3">
              <input placeholder="Label" value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm" required />
              <input placeholder="Street" value={addrForm.street} onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })} className="w-full px-3 py-2 border border-border rounded-lg text-sm" required />
              <div className="grid grid-cols-3 gap-2">
                <input placeholder="City" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} className="px-3 py-2 border border-border rounded-lg text-sm" required />
                <input placeholder="Province" value={addrForm.province} onChange={(e) => setAddrForm({ ...addrForm, province: e.target.value })} className="px-3 py-2 border border-border rounded-lg text-sm" required />
                <input placeholder="Postal Code" value={addrForm.postal_code} onChange={(e) => setAddrForm({ ...addrForm, postal_code: e.target.value })} className="px-3 py-2 border border-border rounded-lg text-sm" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Save</button>
                <button type="button" onClick={() => setShowAddrForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="flex items-start justify-between border border-border rounded-lg p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{addr.label}</span>
                    {addr.is_default ? <span className="text-xs bg-surface px-2 py-0.5 rounded">Default</span> : null}
                  </div>
                  <p className="text-xs text-text-light mt-1">{addr.street}, {addr.city}, {addr.province} {addr.postal_code}</p>
                </div>
                <button onClick={() => handleDeleteAddress(addr.id)} className="p-1 text-text-light hover:text-error"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
