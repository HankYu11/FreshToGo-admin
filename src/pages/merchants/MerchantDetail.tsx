import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { Merchant } from '../../types/api';
import { useDetail } from '../../lib/useDetail';
import { useConfirmAction } from '../../lib/useConfirmAction';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import DetailCard from '../../components/DetailCard';
import { VERIFIED_COLORS } from '../../constants/statusColors';
import styles from './MerchantDetail.module.css';

export default function MerchantDetail() {
  const navigate = useNavigate();
  const { data: merchant, setData: setMerchant, loading, id } = useDetail<Merchant>(
    '/api/admin/merchants',
    { errorMessage: 'Failed to load merchant' },
  );
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', latitude: '', longitude: '' });
  const [saving, setSaving] = useState(false);

  const deleteAction = useConfirmAction(async () => {
    await api.delete(`/api/admin/merchants/${id}`);
    toast.success('Merchant deleted');
    navigate('/merchants');
  }, { errorMessage: 'Failed to delete merchant' });

  // Sync form when merchant loads
  const synced = useRef(false);
  useEffect(() => {
    if (merchant && !synced.current) {
      setForm({
        name: merchant.name,
        email: merchant.email,
        phone: merchant.phone,
        address: merchant.address,
        latitude: String(merchant.latitude),
        longitude: String(merchant.longitude),
      });
      synced.current = true;
    }
  }, [merchant]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const lat = parseFloat(form.latitude);
      const lng = parseFloat(form.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        toast.error('Latitude and longitude must be valid numbers');
        setSaving(false);
        return;
      }
      const payload = { ...form, latitude: lat, longitude: lng };
      const { data } = await api.patch<Merchant>(`/api/admin/merchants/${id}`, payload);
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

  if (loading || !merchant) {
    return (
      <div>
        <h1>Merchant Detail</h1>
        <div className="skeleton" style={{ width: '100%', height: 200, marginTop: '1rem' }} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={merchant.name}>
        <button className="btn-secondary" onClick={handleVerifyToggle}>
          {merchant.verified ? 'Unverify' : 'Verify'}
        </button>
        {!editing && (
          <button className="btn-primary" onClick={() => setEditing(true)}>
            Edit
          </button>
        )}
        <button className="btn-danger" onClick={deleteAction.requestConfirm}>
          Delete
        </button>
      </PageHeader>

      {editing ? (
        <div className={styles.editForm}>
          <form onSubmit={handleSave}>
            <label>
              Store Name
              <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </label>
            <label>
              Address
              <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
            </label>
            <div className={styles.coordRow}>
              <label>
                Latitude
                <input
                  type="number"
                  step="any"
                  required
                  value={form.latitude}
                  onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))}
                />
              </label>
              <label>
                Longitude
                <input
                  type="number"
                  step="any"
                  required
                  value={form.longitude}
                  onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))}
                />
              </label>
            </div>
            <div className={styles.formActions}>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <DetailCard>
          <DetailCard.Field label="Email">{merchant.email}</DetailCard.Field>
          <DetailCard.Field label="Phone">{merchant.phone || '—'}</DetailCard.Field>
          <DetailCard.Field label="Address">{merchant.address || '—'}</DetailCard.Field>
          <DetailCard.Field label="Latitude">{merchant.latitude}</DetailCard.Field>
          <DetailCard.Field label="Longitude">{merchant.longitude}</DetailCard.Field>
          <DetailCard.Field label="Verified">
            <StatusBadge
              status={merchant.verified ? 'Yes' : 'No'}
              colorMap={VERIFIED_COLORS}
            />
          </DetailCard.Field>
          <DetailCard.Field label="Created">{new Date(merchant.createdAt).toLocaleString()}</DetailCard.Field>
        </DetailCard>
      )}

      <ConfirmDialog
        open={deleteAction.open}
        title="Delete Merchant"
        message={`Are you sure you want to delete "${merchant.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteAction.loading}
        onConfirm={deleteAction.confirm}
        onCancel={deleteAction.cancel}
      />
    </div>
  );
}
