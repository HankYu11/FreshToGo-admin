import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../../lib/api';
import type { UserDetail as UserDetailType } from '../../types/api';
import { useDetail } from '../../lib/useDetail';
import { useConfirmAction } from '../../lib/useConfirmAction';
import ConfirmDialog from '../../components/ConfirmDialog';
import StatusBadge from '../../components/StatusBadge';
import PageHeader from '../../components/PageHeader';
import DetailCard from '../../components/DetailCard';
import { USER_STATUS_COLORS } from '../../constants/statusColors';

export default function UserDetail() {
  const navigate = useNavigate();
  const { data: user, setData: setUser, loading, id } = useDetail<UserDetailType>(
    '/api/admin/users',
    { errorMessage: 'Failed to load user' },
  );

  const deleteAction = useConfirmAction(async () => {
    await api.delete(`/api/admin/users/${id}`);
    toast.success('User deleted');
    navigate('/users');
  }, { errorMessage: 'Failed to delete user' });

  const resetAction = useConfirmAction(async () => {
    const { data } = await api.patch<UserDetailType>(`/api/admin/users/${id}`, {
      noShowCount: 0,
    });
    setUser(data);
    toast.success('No-show count reset');
  }, { errorMessage: 'Failed to reset no-show count' });

  const handleBlockToggle = async () => {
    if (!user) return;
    try {
      const { data } = await api.patch<UserDetailType>(`/api/admin/users/${id}`, {
        isBlocked: !user.isBlocked,
      });
      setUser(data);
      toast.success(data.isBlocked ? 'User blocked' : 'User unblocked');
    } catch {
      toast.error('Failed to update block status');
    }
  };

  if (loading || !user) {
    return (
      <div>
        <h1>User Detail</h1>
        <div className="skeleton" style={{ width: '100%', height: 200, marginTop: '1rem' }} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={user.displayName}>
        <button className="btn-secondary" onClick={handleBlockToggle}>
          {user.isBlocked ? 'Unblock' : 'Block'}
        </button>
        <button className="btn-secondary" onClick={resetAction.requestConfirm}>
          Reset No-Shows
        </button>
        <button className="btn-danger" onClick={deleteAction.requestConfirm}>
          Delete
        </button>
      </PageHeader>

      <DetailCard>
        <DetailCard.Field label="No-Show Count">{user.noShowCount}</DetailCard.Field>
        <DetailCard.Field label="Status">
          <StatusBadge
            status={user.isBlocked ? 'Blocked' : 'Active'}
            colorMap={USER_STATUS_COLORS}
          />
        </DetailCard.Field>
        <DetailCard.Field label="Total Reservations">{user.totalReservations}</DetailCard.Field>
        <DetailCard.Field label="Completed Pickups">{user.completedPickups}</DetailCard.Field>
        <DetailCard.Field label="Cancellations">{user.cancellations}</DetailCard.Field>
        <DetailCard.Field label="No-Shows">{user.noShows}</DetailCard.Field>
        <DetailCard.Field label="Created">{new Date(user.createdAt).toLocaleString()}</DetailCard.Field>
      </DetailCard>

      <ConfirmDialog
        open={resetAction.open}
        title="Reset No-Show Count"
        message={`Reset no-show count for "${user.displayName}" to 0?`}
        confirmLabel="Reset"
        loading={resetAction.loading}
        onConfirm={resetAction.confirm}
        onCancel={resetAction.cancel}
      />

      <ConfirmDialog
        open={deleteAction.open}
        title="Delete User"
        message={`Are you sure you want to delete "${user.displayName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteAction.loading}
        onConfirm={deleteAction.confirm}
        onCancel={deleteAction.cancel}
      />
    </div>
  );
}
