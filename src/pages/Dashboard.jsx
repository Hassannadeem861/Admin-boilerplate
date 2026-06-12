import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { getDashboardAsync } from '../store/services/dashboardService';
import { asyncStatus } from '../utils/asyncStatus';
import './Dashboard.css';
import { TableLoader } from '../components/Loading';
import { makeGrad } from '../utils/helperFunctions.jsx';

Chart.register(...registerables);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user_data } = useSelector(s => s.auth);
  const { dashboard, get_status, get_error } = useSelector(s => s.dashboard ?? {});

  const barRef = useRef(null);
  const donutRef = useRef(null);
  const barChart = useRef(null);
  const donutChart = useRef(null);

  const isAdmin = user_data?.role === 'admin';
  const isLoading = get_status === asyncStatus.LOADING || get_status === asyncStatus.IDLE;
  const isError = get_status === asyncStatus.ERROR;

  useEffect(() => {
    if (isAdmin) dispatch(getDashboardAsync());
  }, [dispatch, isAdmin]);

  /* ── Build / rebuild charts whenever data arrives ── */
  useEffect(() => {
    if (!dashboard) return;

    const verified = dashboard.verifiedUsers ?? 0;
    const unverified = dashboard.unverifiedUsers ?? 0;
    const total = dashboard.totalUsers ?? 0;

    /* Destroy old instances */
    barChart.current?.destroy();
    donutChart.current?.destroy();

    /* ── Bar chart (Sirf Verified vs Unverified) ── */
    if (barRef.current) {
      const ctx = barRef.current.getContext('2d');
      barChart.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Verified Users', 'Unverified Users'],
          datasets: [
            {
              label: 'Users',
              data: [verified, unverified],
              backgroundColor: [
                makeGrad(ctx, '#EF8A46', '#F5A97A'),
                makeGrad(ctx, '#ED7B92', '#F2A3B5'),
              ],
              borderRadius: 10,
              borderSkipped: false,
              maxBarThickness: 80,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: v => ` ${v.raw} users` },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }, color: '#94A3B8' },
            },
            y: {
              grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
              ticks: { stepSize: 10, font: { size: 11 }, color: '#94A3B8' },
              beginAtZero: true,
              max: Math.ceil((total + 5) / 10) * 10,
            },
          },
        },
      });
    }

    /* ── Doughnut chart (Sirf Verified vs Unverified) ── */
    if (donutRef.current) {
      const ctx2 = donutRef.current.getContext('2d');
      donutChart.current = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Verified Users', 'Unverified Users'],
          datasets: [
            {
              data: [verified, unverified],
              backgroundColor: ['#EF8A46', '#ED7B92'],
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: v => ` ${v.label}: ${v.raw} users` } },
          },
        },
      });
    }

    return () => {
      barChart.current?.destroy();
      donutChart.current?.destroy();
    };
  }, [dashboard]);

  if (isLoading) return <TableLoader message="Loading Dashboard..." />;

  /* ── Map API response ── */
  const totalUsers = dashboard?.totalUsers ?? 0;
  const totalAdmins = dashboard?.totalAdmins ?? 0;
  const verifiedUsers = dashboard?.verifiedUsers ?? 0;
  const unverifiedUsers = dashboard?.unverifiedUsers ?? 0;

  const STATS = [
    { Icon: Users, value: totalUsers, label: 'Total Users', tag: 'Users' },
    { Icon: ShieldCheck, value: totalAdmins, label: 'Total Admins', tag: 'Admins' },
    { Icon: CheckCircle2, value: verifiedUsers, label: 'Verified Users', tag: 'Verified' },
  ];

  return (
    <div className="dash-root">

      {/* ── ERROR BANNER ── */}
      {isError && (
        <div className="dash-error">
          <AlertCircle size={15} strokeWidth={2} />
          {get_error || 'Failed to load dashboard. Please refresh the page.'}
        </div>
      )}

      {/* ── PAGE HEADER ── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">
            Welcome back, <span className="dash-greeting-name">{user_data?.name || 'Admin'}</span>
          </h1>
          <p className="dash-subtitle">Here's what's happening with your platform today.</p>
        </div>
        <div className="dash-live-pill">
          <span className="dash-live-dot" />
          Live Dashboard
        </div>
      </div>

      {/* ── OVERVIEW STAT CARDS ── */}
      <p className="dash-section-lbl">Overview</p>
      <div className="dash-stats">
        {STATS.map(({ Icon, value, label, tag }) => (
          <div key={label} className="dash-stat">
            <div className="dash-stat-top">
              <div className="dash-stat-icon-wrap">
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <span className="dash-stat-tag">{tag}</span>
            </div>
            <div className="dash-stat-val">{value}</div>
            <div className="dash-stat-lbl">{label}</div>
          </div>
        ))}
      </div>

      {/* ── CHARTS (Sirf Verified vs Unverified) ── */}
      <p className="dash-section-lbl">Analytics</p>
      <div className="dash-charts-row">

        {/* Bar chart */}
        <div className="dash-chart-card">
          <div className="dash-chart-title">User Verification Status</div>
          <div className="dash-chart-sub">Breakdown of {totalUsers} total users</div>
          <div className="dash-chart-legend">
            <span><span className="dash-legend-sq" style={{ background: '#EF8A46' }} />Verified ({verifiedUsers})</span>
            <span><span className="dash-legend-sq" style={{ background: '#ED7B92' }} />Unverified ({unverifiedUsers})</span>
          </div>
          <div className="dash-chart-canvas-wrap">
            <canvas ref={barRef} role="img" aria-label="Bar chart showing verified vs unverified users" />
          </div>
        </div>

        {/* Doughnut chart */}
        <div className="dash-chart-card">
          <div className="dash-chart-title">Verification Ratio</div>
          <div className="dash-chart-sub">Verified vs Unverified users</div>
          <div className="dash-chart-legend">
            <span><span className="dash-legend-sq" style={{ background: '#EF8A46' }} />Verified ({verifiedUsers})</span>
            <span><span className="dash-legend-sq" style={{ background: '#ED7B92' }} />Unverified ({unverifiedUsers})</span>
          </div>
          <div className="dash-chart-canvas-wrap">
            <canvas ref={donutRef} role="img" aria-label="Doughnut chart showing verified vs unverified ratio" />
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;