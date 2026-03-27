import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { MerchantDetail } from '../../types/api';
import styles from './MerchantCreate.module.css';

export default function MerchantCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    storeName: '',
    storeAddress: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post<MerchantDetail>('/api/admin/merchants', form);
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
      <div className={styles.createForm}>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" required value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          </label>
          <label>
            Password
            <input type="password" required value={form.password} onChange={(e) => handleChange('password', e.target.value)} />
          </label>
          <label>
            Store Name
            <input required value={form.storeName} onChange={(e) => handleChange('storeName', e.target.value)} />
          </label>
          <label>
            Store Address
            <input value={form.storeAddress} onChange={(e) => handleChange('storeAddress', e.target.value)} />
          </label>
          <div className={styles.formActions}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/merchants')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
