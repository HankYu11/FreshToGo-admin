import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { Merchant } from '../../types/api';

export default function MerchantCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      };
      const { data } = await api.post<Merchant>('/api/admin/merchants', payload);
      toast.success('Merchant created');
      navigate(`/merchants/${data.id}`);
    } catch {
      toast.error('Failed to create merchant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Create Merchant</h1>
      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          Store Name
          <input required value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          Email
          <input type="email" required value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          Phone
          <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          Address
          <input value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
        </label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            Latitude
            <input
              type="number"
              step="any"
              required
              value={form.latitude}
              onChange={(e) => handleChange('latitude', e.target.value)}
              placeholder="e.g. 43.6532"
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
            Longitude
            <input
              type="number"
              step="any"
              required
              value={form.longitude}
              onChange={(e) => handleChange('longitude', e.target.value)}
              placeholder="e.g. -79.3832"
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/merchants')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
