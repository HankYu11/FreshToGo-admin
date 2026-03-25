import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { User } from '../../types/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<User>(`/api/admin/users/${id}`, { signal: controller.signal })
      .then(({ data }) => setUser(data))
      .catch((err) => {
        if (!controller.signal.aborted) toast.error('Failed to load user');
        throw err;
      });
    return () => controller.abort();
  }, [id]);

  const handleBlockToggle = async () => {
    if (!user) return;
    try {
      const { data } = await api.patch<User>(`/api/admin/users/${id}/block`, {
        blocked: !user.blocked,
      });
      setUser(data);
      toast.success(data.blocked ? 'User blocked' : 'User unblocked');
    } catch {
      toast.error('Failed to update block status');
    }
  };

  const handleResetNoShow = async () => {
    setResetting(true);
    try {
      const { data } = await api.patch<User>(`/api/admin/users/${id}/reset-noshow`);
      setUser(data);
      toast.success('No-show count reset');
    } catch {
      toast.error('Failed to reset no-show count');
    } finally {
      setResetting(false);
      setResetOpen(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/admin/users/${id}`);
      toast.success('User deleted');
      navigate('/users');
    } catch {
      toast.error('Failed to delete user');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (!user) {
    return (
      <div>
        <h1>User Detail</h1>
        <div className="skeleton" style={{ width: '100%', height: 200, marginTop: '1rem' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>{user.name}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={handleBlockToggle}>
            {user.blocked ? 'Unblock' : 'Block'}
          </button>
          <button className="btn-secondary" onClick={() => setResetOpen(true)}>
            Reset No-Shows
          </button>
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
        <dl style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem 1rem' }}>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Email</dt>
          <dd>{user.email}</dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Phone</dt>
          <dd>{user.phone || '—'}</dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>No-Show Count</dt>
          <dd>{user.noShowCount}</dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Status</dt>
          <dd>
            <StatusBadge
              status={user.blocked ? 'Blocked' : 'Active'}
              colorMap={{ Blocked: '#dc2626', Active: '#16a34a' }}
            />
          </dd>
          <dt style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>Created</dt>
          <dd>{new Date(user.createdAt).toLocaleString()}</dd>
        </dl>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset No-Show Count"
        message={`Reset no-show count for "${user.name}" to 0?`}
        confirmLabel="Reset"
        loading={resetting}
        onConfirm={handleResetNoShow}
        onCancel={() => setResetOpen(false)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete User"
        message={`Are you sure you want to delete "${user.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
