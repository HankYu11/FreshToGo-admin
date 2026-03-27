import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../lib/api';
import type { DashboardStats, TimeseriesPoint, TimeseriesResponse } from '../types/api';
import StatCard from '../components/StatCard';
import styles from './Dashboard.module.css';

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getDefaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

interface ChartData {
  reservations: TimeseriesPoint[];
  revenue: TimeseriesPoint[];
  dateKey: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [dateRange, setDateRange] = useState(getDefaultDateRange);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<DashboardStats>('/api/admin/dashboard', { signal: controller.signal })
      .then(({ data }) => setStats(data))
      .catch(() => {
        if (!controller.signal.aborted) toast.error('Failed to load dashboard stats');
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const dateKey = `${dateRange.from}:${dateRange.to}`;

    Promise.all([
      api.get<TimeseriesResponse>('/api/admin/analytics/timeseries', {
        params: { metric: 'reservations', dateFrom: dateRange.from, dateTo: dateRange.to },
        signal: controller.signal,
      }),
      api.get<TimeseriesResponse>('/api/admin/analytics/timeseries', {
        params: { metric: 'revenue', dateFrom: dateRange.from, dateTo: dateRange.to },
        signal: controller.signal,
      }),
    ])
      .then(([resRes, revRes]) => {
        setChartData({
          reservations: resRes.data.data,
          revenue: revRes.data.data,
          dateKey,
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) toast.error('Failed to load chart data');
      });

    return () => controller.abort();
  }, [dateRange]);

  const statsLoading = stats === null;
  const currentDateKey = `${dateRange.from}:${dateRange.to}`;
  const chartsLoading = chartData === null || chartData.dateKey !== currentDateKey;

  return (
    <div>
      <h1 className={styles.heading}>Dashboard</h1>

      <div className={styles.statsGrid}>
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} loading={statsLoading} />
        <StatCard title="Total Merchants" value={stats?.totalMerchants ?? 0} loading={statsLoading} />
        <StatCard title="Active Merchants" value={stats?.activeMerchants ?? 0} loading={statsLoading} />
        <StatCard title="Today's Reservations" value={stats?.todayReservations ?? 0} loading={statsLoading} />
        <StatCard title="Today's Revenue" value={formatCurrency(stats?.todayRevenue ?? 0)} loading={statsLoading} />
        <StatCard title="No-Show Rate" value={`${((stats?.noShowRate ?? 0) * 100).toFixed(1)}%`} loading={statsLoading} />
      </div>

      <div className={styles.dateRange}>
        <label>
          From
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
          />
        </label>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <h2>Reservations</h2>
          {chartsLoading ? (
            <div className={`skeleton ${styles.chartSkeleton}`} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.reservations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className={styles.chartCard}>
          <h2>Revenue</h2>
          {chartsLoading ? (
            <div className={`skeleton ${styles.chartSkeleton}`} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="var(--color-success)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
