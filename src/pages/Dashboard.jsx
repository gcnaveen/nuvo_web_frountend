// src/pages/Dashboard.jsx - Live admin dashboard
// Fetches all data from GET /api/events/dashboard/stats/
// Auto-refreshes every 60 seconds.

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getDashboardStats } from "../api/dashboardApi";

// -- Helpers ----------------------------------------------------
const fmt = (n) =>
  n >= 1_00_000
    ? `₹${(n / 1_00_000).toFixed(1)}L`
    : n >= 1000
      ? `₹${(n / 1000).toFixed(1)}k`
      : `₹${n}`;

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

const STATUS_CFG = {
  created: { label: "Created", color: "#435ebe", bg: "#eef1fb" },
  planning_started: { label: "Planning", color: "#0dcaf0", bg: "#e0f8fd" },
  staff_allocated: {
    label: "Staff Allocated",
    color: "#f59f00",
    bg: "#fff8e1",
  },
  completed: { label: "Completed", color: "#198754", bg: "#e8f5e9" },
  cancelled: { label: "Cancelled", color: "#dc3545", bg: "#fdecea" },
};
const sCfg = (s) =>
  STATUS_CFG[s] || { label: s, color: "#6c757d", bg: "#f0f2f5" };

const PAY_CFG = {
  paid_fully: { label: "Paid", icon: "bi-check-circle-fill", color: "#198754" },
  advance: { label: "Advance", icon: "bi-clock-fill", color: "#f59f00" },
  unpaid: { label: "Unpaid", icon: "bi-x-circle-fill", color: "#dc3545" },
};
const pCfg = (s) =>
  PAY_CFG[s] || { label: s, icon: "bi-dash", color: "#6c757d" };

// -- Mini bar chart (CSS only, no external lib) -----------------
function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        height: 160,
        paddingBottom: 4,
      }}
    >
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const pct = Math.round((d.count / max) * 100);
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span
              style={{
                fontSize: ".72rem",
                fontWeight: 700,
                color: isLast ? "#435ebe" : "#9aa3af",
              }}
            >
              {d.count}
            </span>
            <div
              style={{
                width: "100%",
                borderRadius: "4px 4px 0 0",
                background: isLast ? "#435ebe" : "#d0d8f8",
                height: `${Math.max(pct, 4)}%`,
                transition: "height .4s ease",
              }}
            />
            <span
              style={{
                fontSize: ".72rem",
                fontWeight: 600,
                color: isLast ? "#435ebe" : "#9aa3af",
              }}
            >
              {d.month}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// -- Donut-style status breakdown -------------------------------
function StatusBreakdown({ counts }) {
  const order = [
    "created",
    "planning_started",
    "staff_allocated",
    "completed",
    "cancelled",
  ];
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {order.map((k) => {
        const cfg = sCfg(k);
        const pct = Math.round(((counts[k] || 0) / total) * 100);
        return (
          <div key={k}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 3,
              }}
            >
              <span
                style={{
                  fontSize: ".78rem",
                  fontWeight: 600,
                  color: "#4a5568",
                }}
              >
                {cfg.label}
              </span>
              <span
                style={{
                  fontSize: ".78rem",
                  fontWeight: 700,
                  color: cfg.color,
                }}
              >
                {counts[k] || 0}
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 10,
                background: "#f0f2f5",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 10,
                  background: cfg.color,
                  transition: "width .5s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==============================================================
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data.data);
      setLastRefresh(new Date());
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60_000); // auto-refresh every 60s
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
        }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: 44, height: 44 }}
          />
          <p className="text-muted small">Loading dashboard…</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="page-content">
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill"></i>
          {error}
          <button
            className="btn btn-sm btn-outline-danger ms-auto"
            onClick={fetchStats}
          >
            Retry
          </button>
        </div>
      </div>
    );

  const s = stats || {};
  const trend = Array.isArray(s.monthly_trend) ? s.monthly_trend : [];
  const recent = Array.isArray(s.recent_bookings) ? s.recent_bookings : [];
  const liveEvents = Array.isArray(s.live_events) ? s.live_events : [];
  const statusCounts = s.status_counts || {};

  return (
    <>
      <style>{`
        .db-card { background:#fff; border-radius:14px; border:1px solid #eef0f4; box-shadow:0 2px 12px rgba(44,50,73,.06); overflow:hidden; }
        .db-card-hover { transition:transform .18s,box-shadow .18s; }
        .db-card-hover:hover { transform:translateY(-3px); box-shadow:0 6px 24px rgba(44,50,73,.11)!important; }
        .db-metric-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
        .db-section-title { font-size:.72rem; text-transform:uppercase; letter-spacing:1px; font-weight:700; color:#9aa3af; margin-bottom:14px; }
        .live-pulse { display:inline-block; width:8px; height:8px; border-radius:50%; background:#dc3545; animation:livePulse 1.2s infinite; margin-right:6px; }
        @keyframes livePulse { 0%,100%{box-shadow:0 0 0 0 rgba(220,53,69,.6)} 50%{box-shadow:0 0 0 6px rgba(220,53,69,0)} }
        .db-table th { font-size:.72rem; text-transform:uppercase; letter-spacing:.8px; color:#9aa3af; font-weight:700; background:#fafbff; }
        .db-table td { font-size:.86rem; vertical-align:middle; }
        .db-badge { display:inline-block; border-radius:6px; padding:2px 10px; font-size:.73rem; font-weight:700; }
        .on-duty-chip { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px; background:#f8f9fc; border:1px solid #eef0f4; }
      `}</style>

      {/* -- HEADING -------------------------------------------- */}
      <div className="page-heading">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h3 className="fw-bold mb-0">Admin Overview</h3>
            <p className="text-muted mb-0 small">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {lastRefresh && (
                <span
                  className="ms-2 text-muted"
                  style={{ fontSize: ".75rem" }}
                >
                  · Updated{" "}
                  {lastRefresh.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </p>
          </div>
          <button
            className="btn btn-light btn-sm shadow-sm"
            onClick={fetchStats}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* -- METRIC CARDS ----------------------------------- */}
        <div className="row g-3 mb-4">
          {[
            {
              label: "Total Bookings",
              value: s.total_bookings ?? "-",
              icon: "bi-calendar-check-fill",
              bg: "#eef1fb",
              color: "#435ebe",
              sub: `${s.upcoming_events ?? 0} upcoming`,
            },
            {
              label: "Revenue Collected",
              value: s.total_revenue != null ? fmt(s.total_revenue) : "-",
              icon: "bi-wallet2",
              bg: "#e8f5e9",
              color: "#198754",
              sub: `${fmt(s.pending_revenue ?? 0)} pending`,
              subColor: "#dc3545",
            },
            {
              label: "Staff On Duty",
              value: s.on_duty_staff ?? "-",
              icon: "bi-person-badge-fill",
              bg: "#fff8e1",
              color: "#f59f00",
              sub: `${s.total_staff ?? 0} total staff`,
            },
            {
              label: "Active Clients",
              value: s.total_clients ?? "-",
              icon: "bi-people-fill",
              bg: "#fce4ec",
              color: "#e91e63",
              sub: `${s.live_events_count ?? 0} live event${(s.live_events_count ?? 0) !== 1 ? "s" : ""} now`,
            },
          ].map((m, i) => (
            <div className="col-6 col-lg-3" key={i}>
              <div className="db-card db-card-hover p-4 h-100">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div
                    className="db-metric-icon"
                    style={{ background: m.bg, color: m.color }}
                  >
                    <i className={`bi ${m.icon}`}></i>
                  </div>
                  <div>
                    <div
                      className="text-muted fw-bold"
                      style={{
                        fontSize: ".72rem",
                        textTransform: "uppercase",
                        letterSpacing: ".8px",
                      }}
                    >
                      {m.label}
                    </div>
                    <div
                      className="fw-bold"
                      style={{
                        fontSize: "1.6rem",
                        lineHeight: 1.1,
                        color: "#2c3249",
                      }}
                    >
                      {m.value}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: ".78rem",
                    fontWeight: 600,
                    color: m.subColor || "#9aa3af",
                  }}
                >
                  {m.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          {/* -- LEFT COLUMN ---------------------------------- */}
          <div className="col-12 col-lg-8">
            {/* Booking trend chart */}
            <div className="db-card mb-4 p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div className="db-section-title mb-0">Booking Trend</div>
                  <div
                    className="fw-bold"
                    style={{ fontSize: ".95rem", color: "#2c3249" }}
                  >
                    Last 6 Months
                  </div>
                </div>
                <span
                  className="badge"
                  style={{
                    background: "#eef1fb",
                    color: "#435ebe",
                    fontWeight: 700,
                  }}
                >
                  {trend.reduce((a, d) => a + d.count, 0)} total
                </span>
              </div>
              {trend.length > 0 ? (
                <BarChart data={trend} />
              ) : (
                <div className="text-center text-muted py-4 small">
                  No booking data yet
                </div>
              )}
            </div>

            {/* Recent bookings table */}
            <div className="db-card">
              <div className="d-flex justify-content-between align-items-center px-4 pt-4 pb-3 border-bottom">
                <div
                  className="fw-bold"
                  style={{ fontSize: ".95rem", color: "#2c3249" }}
                >
                  Recent Bookings
                </div>
                <Link
                  to="/admin/events"
                  className="btn btn-sm btn-light fw-bold"
                  style={{ color: "#435ebe" }}
                >
                  View All <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
              {recent.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>No
                  bookings yet.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table db-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="ps-4 py-3">Client / Event</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th className="text-end pe-4">Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((ev) => {
                        const sc = sCfg(ev.status);
                        const pc = pCfg(ev.payment_status);
                        return (
                          <tr
                            key={ev.id}
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/admin/events/${ev.id}`)}
                          >
                            <td className="ps-4 py-3">
                              <div
                                className="fw-bold"
                                style={{ color: "#2c3249" }}
                              >
                                {ev.client_name || "-"}
                              </div>
                              <small className="text-muted">
                                {ev.event_name} · {ev.city}
                              </small>
                            </td>
                            <td>
                              <div style={{ fontSize: ".84rem" }}>
                                {fmtDate(ev.event_start_datetime)}
                              </div>
                              <small className="text-muted">
                                {ev.event_type || ""}
                              </small>
                            </td>
                            <td>
                              <span
                                className="db-badge"
                                style={{ background: sc.bg, color: sc.color }}
                              >
                                {sc.label}
                              </span>
                            </td>
                            <td className="text-end pe-4">
                              <span
                                style={{
                                  color: pc.color,
                                  fontWeight: 700,
                                  fontSize: ".84rem",
                                }}
                              >
                                <i className={`bi ${pc.icon} me-1`}></i>
                                {pc.label}
                              </span>
                              {ev.total_amount > 0 && (
                                <div
                                  className="text-muted"
                                  style={{ fontSize: ".72rem" }}
                                >
                                  {fmt(ev.paid_amount)} / {fmt(ev.total_amount)}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* -- RIGHT COLUMN --------------------------------- */}
          <div className="col-12 col-lg-4">
            {/* Live events now */}
            <div className="db-card mb-4 p-4">
              <div className="db-section-title">
                <span className="live-pulse"></span>Live Now
              </div>
              {liveEvents.length === 0 ? (
                <div className="text-center py-3 text-muted small">
                  No events happening right now
                </div>
              ) : (
                liveEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="mb-3 p-3 rounded-3"
                    style={{
                      background: "#f8f9fc",
                      border: "1px solid #eef0f4",
                    }}
                  >
                    <div
                      className="fw-bold"
                      style={{ fontSize: ".9rem", color: "#2c3249" }}
                    >
                      {ev.event_name}
                    </div>
                    <div className="text-muted" style={{ fontSize: ".78rem" }}>
                      <i className="bi bi-geo-alt me-1"></i>
                      {ev.venue_name} · {ev.city}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <small className="text-muted">
                        <i className="bi bi-people me-1"></i>
                        {ev.crew_count} crew
                      </small>
                      <Link
                        to={`/admin/events/${ev.id}/track`}
                        className="btn btn-primary btn-sm px-3"
                        style={{ fontSize: ".75rem" }}
                      >
                        Track <i className="bi bi-geo-alt-fill ms-1"></i>
                      </Link>
                    </div>
                  </div>
                ))
              )}
              {liveEvents.length === 0 && (
                <Link
                  to="/admin/events"
                  className="btn btn-outline-primary btn-sm w-100"
                >
                  View All Events
                </Link>
              )}
            </div>

            {/* Event status breakdown */}
            <div className="db-card mb-4 p-4">
              <div className="db-section-title">Event Status Breakdown</div>
              <StatusBreakdown counts={statusCounts} />
              <div className="text-center mt-3">
                <Link
                  to="/admin/events"
                  className="btn btn-light btn-sm fw-bold"
                  style={{ color: "#435ebe", fontSize: ".78rem" }}
                >
                  Manage Events <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>

            {/* On-duty staff */}
            <div className="db-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="db-section-title mb-0">Staff On Duty</div>
                <span
                  className="badge"
                  style={{
                    background: s.on_duty_staff > 0 ? "#e8f5e9" : "#f0f2f5",
                    color: s.on_duty_staff > 0 ? "#198754" : "#9aa3af",
                    fontWeight: 700,
                  }}
                >
                  {s.on_duty_staff ?? 0} online
                </span>
              </div>
              {(s.on_duty_staff ?? 0) === 0 ? (
                <div className="text-center py-3 text-muted small">
                  <i className="bi bi-person-slash fs-3 d-block mb-1"></i>No
                  staff on duty right now
                </div>
              ) : (
                <div className="text-center py-3">
                  <div
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: 800,
                      color: "#198754",
                    }}
                  >
                    {s.on_duty_staff}
                  </div>
                  <div className="text-muted small">
                    staff member{s.on_duty_staff !== 1 ? "s" : ""} currently on
                    duty
                  </div>
                </div>
              )}
              <div className="d-flex gap-2 mt-3">
                <Link
                  to="/admin/staff"
                  className="btn btn-light btn-sm flex-fill fw-bold"
                  style={{ color: "#435ebe", fontSize: ".78rem" }}
                >
                  <i className="bi bi-people me-1"></i>All Staff
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
