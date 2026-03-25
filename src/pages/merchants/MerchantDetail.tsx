import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { Merchant } from '../../types/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';

export default function MerchantDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<Merchant>(`/api/admin/merchants/${id}`, { signal: controller.signal })
      .then(({ data }) => {
        setMerchant(data);
        setForm({ name: data.name, email: data.email, phone: data.phone, address: data.address });
      })
      .catch((err) => {
        if (!controller.signal.aborted) toast.error('Failed to load merchant');
        throw err;
      });
    return () => controller.abort();
  }, [id]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch<Merchant>(`/api/admin/merchants/${id}`, form);
      setMerchant(data);
      setEditing(false);
      toast.success('Merchant updated');
    } catch {
      toast.error('Failed to update merchant');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyToggle = async () => {
    if (!merchant) return;
    try {
      const { data } = await api.patch<Merchant>(`/api/admin/merchants/${id}/verify`, {
        verified: !merchant.verified,
      });
      setMerchant(data);
      toast.success(data.verified ? 'Merchant verified' : 'Merchant unverified');
    } catch {
      toast.error('Failed to update verification status');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/admin/merchants/${id}`);
      toast.success('Merchant deleted');
      navigate('/merchants');
    } catch {
      toast.error('Failed to delete merchant');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (!merchant) {
    return (
      <div>
        <h1>Merchant Detail</h1>
        <div className="skeleton" style={{ width: '100%', height: 200, marginTop: '1rem' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>{merchant.name}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={handleVerifyToggle}>
            {merchant.verified ? 'Unverify' : 'Verify'}
          </button>
          {!editing && (
            <button className="btn-primary" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
          <button className="btn-danger" onClick={() => setDeleteOpen(true)}>
            Delete
          </button>
        </div>
      </div>

      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          maxWidth: 600,
        }}
      >
        {editing ? (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              Store Name
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              Phone
              <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              Address
              <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem 1rem' }}>
            <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Email</dt>
            <dd>{merchant.email}</dd>
            <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Phone</dt>
            <dd>{merchant.phone || '—'}</dd>
            <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Address</dt>
            <dd>{merchant.address || '—'}</dd>
            <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Verified</dt>
            <dd>
              <StatusBadge
                status={merchant.verified ? 'Yes' : 'No'}
                colorMap={{ Yes: '#16a34a', No: '#d97706' }}
              />
            </dd>
            <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Created</dt>
            <dd>{new Date(merchant.createdAt).toLocaleString()}</dd>
          </dl>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Merchant"
        message={`Are you sure you want to delete "${merchant.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
