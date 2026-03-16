import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import eventsData from '../data/events.json';

export default function Dashboard() {
  // --- METRICS CALCULATION ---
  const metrics = useMemo(() => {
    const now = new Date();

    let upcoming = 0;
    let pendingRevenue = 0;
    let totalRevenue = 0;

    eventsData.forEach((event) => {
      const eventDate = new Date(event.start);
      if (eventDate >= now && event.workflowStage !== 'cancelled') {
        upcoming++;
      }

      const total = event.payment?.totalAmount || 0;
      const paid = event.payment?.paidAmount || 0;

      totalRevenue += paid;
      if (
        event.payment?.paymentStatus !== 'paid' &&
        event.workflowStage !== 'cancelled'
      ) {
        pendingRevenue += total - paid;
      }
    });

    return {
      totalBookings: eventsData.length,
      upcomingEvents: upcoming,
      pendingRevenue,
      totalRevenue,
    };
  }, []);

  // Get Top 5 Recent/Upcoming Events for the table
  const recentEvents = [...eventsData]
    .sort((a, b) => new Date(b.start) - new Date(a.start))
    .slice(0, 5);

  // Helper for Workflow Badges
  const getBadgeColor = (stage) => {
    const map = {
      created: 'primary',
      planning: 'info',
      staffs_assigned: 'warning',
      event_completed: 'success',
      cancelled: 'danger',
    };
    return map[stage] || 'secondary';
  };

  return (
    <>
      <style>
        {`
          .stats-icon { width: 3rem; height: 3rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
          .stats-icon.purple { background-color: rgba(142, 36, 170, 0.15); color: #8E24AA; }
          .stats-icon.blue { background-color: rgba(30, 136, 229, 0.15); color: #1E88E5; }
          .stats-icon.green { background-color: rgba(40, 167, 69, 0.15); color: #28a745; }
          .stats-icon.orange { background-color: rgba(255, 152, 0, 0.15); color: #ff9800; }
          .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
          .card-hover:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.08)!important; }
          .mock-chart-bar { background: #8E24AA; border-radius: 4px 4px 0 0; width: 12%; margin: 0 2%; transition: height 0.3s ease; }
          .map-placeholder { background: url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop') center/cover; position: relative; border-radius: 10px; overflow: hidden; }
          .map-overlay { background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); position: absolute; bottom: 0; width: 100%; padding: 15px; }
        `}
      </style>

      <div className="page-heading mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="fw-bold mb-0">Admin Overview</h3>
          <p className="text-muted mb-0">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="text-end d-none d-md-block">
          <p className="text-muted small mb-0">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="page-content">
        {/* ================= TOP METRIC CARDS ================= */}
        <section className="row g-3 mb-4">
          <div className="col-6 col-lg-3">
            <div className="card shadow-sm border-0 h-100 card-hover">
              <div className="card-body p-4 d-flex align-items-center gap-3">
                <div className="stats-icon blue">
                  <i className="bi bi-calendar-check-fill"></i>
                </div>
                <div>
                  <h6 className="text-muted fw-bold mb-1 small text-uppercase">
                    Total Bookings
                  </h6>
                  <h4 className="fw-bold mb-0">{metrics.totalBookings}</h4>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card shadow-sm border-0 h-100 card-hover">
              <div className="card-body p-4 d-flex align-items-center gap-3">
                <div className="stats-icon purple">
                  <i className="bi bi-hourglass-split"></i>
                </div>
                <div>
                  <h6 className="text-muted fw-bold mb-1 small text-uppercase">
                    Upcoming Events
                  </h6>
                  <h4 className="fw-bold mb-0">{metrics.upcomingEvents}</h4>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card shadow-sm border-0 h-100 card-hover">
              <div className="card-body p-4 d-flex align-items-center gap-3">
                <div className="stats-icon green">
                  <i className="bi bi-wallet2"></i>
                </div>
                <div>
                  <h6 className="text-muted fw-bold mb-1 small text-uppercase">
                    Revenue Collected
                  </h6>
                  <h4 className="fw-bold mb-0">
                    ₹{(metrics.totalRevenue / 1000).toFixed(1)}k
                  </h4>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <div className="card shadow-sm border-0 h-100 card-hover">
              <div className="card-body p-4 d-flex align-items-center gap-3">
                <div className="stats-icon orange">
                  <i className="bi bi-exclamation-circle-fill"></i>
                </div>
                <div>
                  <h6 className="text-muted fw-bold mb-1 small text-uppercase">
                    Pending Payments
                  </h6>
                  <h4 className="fw-bold mb-0 text-danger">
                    ₹{(metrics.pendingRevenue / 1000).toFixed(1)}k
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="row g-4">
          {/* ================= LEFT MAIN COLUMN ================= */}
          <div className="col-12 col-lg-8">
            {/* MOCK CHART */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white pt-4 pb-0 border-0 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">Booking Trends (Last 6 Months)</h5>
                <select className="form-select form-select-sm w-auto border-0 bg-light fw-bold">
                  <option>2026</option>
                  <option>2025</option>
                </select>
              </div>
              <div
                className="card-body d-flex align-items-end justify-content-center"
                style={{ height: '250px', paddingBottom: '0' }}
              >
                {/* Visual CSS Chart Placeholder */}
                <div className="w-100 d-flex align-items-end justify-content-between border-bottom pb-2 h-100 px-4">
                  <div
                    className="mock-chart-bar"
                    style={{ height: '40%' }}
                    title="Sep"
                  ></div>
                  <div
                    className="mock-chart-bar"
                    style={{ height: '65%' }}
                    title="Oct"
                  ></div>
                  <div
                    className="mock-chart-bar"
                    style={{ height: '45%' }}
                    title="Nov"
                  ></div>
                  <div
                    className="mock-chart-bar"
                    style={{ height: '85%' }}
                    title="Dec"
                  ></div>
                  <div
                    className="mock-chart-bar"
                    style={{ height: '55%' }}
                    title="Jan"
                  ></div>
                  <div
                    className="mock-chart-bar"
                    style={{ height: '95%', backgroundColor: '#1E88E5' }}
                    title="Feb"
                  ></div>
                </div>
              </div>
              <div className="d-flex justify-content-between px-5 pb-3 text-muted small fw-bold">
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
                <span>Jan</span>
                <span className="text-primary">Feb</span>
              </div>
            </div>

            {/* RECENT BOOKINGS TABLE */}
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white pt-4 pb-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">Recent Bookings</h5>
                <Link
                  to="/admin/events"
                  className="btn btn-sm btn-light text-primary fw-bold"
                >
                  View All <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-muted small text-uppercase">
                      <tr>
                        <th className="ps-4">Client / Event</th>
                        <th>Date</th>
                        <th>Stage</th>
                        <th className="text-end pe-4">Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEvents.map((event) => (
                        <tr key={event.bookingId}>
                          <td className="ps-4">
                            <div className="fw-bold text-dark">
                              {event.client.name}
                            </div>
                            <small className="text-muted">
                              {event.eventType} • {event.location.city}
                            </small>
                          </td>
                          <td>
                            <div className="fw-semibold">
                              {new Date(event.start).toLocaleDateString(
                                'en-GB',
                                { day: 'numeric', month: 'short' },
                              )}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge bg-light-${getBadgeColor(event.workflowStage)} text-${getBadgeColor(event.workflowStage)} text-uppercase`}
                            >
                              {event.workflowStage.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="text-end pe-4">
                            {event.payment.paymentStatus === 'paid' ? (
                              <span className="text-success fw-bold">
                                <i className="bi bi-check-circle-fill me-1"></i>{' '}
                                Paid
                              </span>
                            ) : event.payment.paymentStatus === 'partial' ? (
                              <span className="text-warning fw-bold">
                                <i className="bi bi-clock-fill me-1"></i>{' '}
                                Advance
                              </span>
                            ) : (
                              <span className="text-danger fw-bold">
                                <i className="bi bi-x-circle-fill me-1"></i>{' '}
                                Unpaid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDEBAR ================= */}
          <div className="col-12 col-lg-4">
            {/* LIVE EVENT TRACKING */}
            <div
              className="card shadow-sm border-0 mb-4 map-placeholder"
              style={{ height: '280px' }}
            >
              <div className="map-overlay">
                <span className="badge bg-danger mb-2 pulse-animation">
                  <i className="bi bi-record-circle"></i> 1 LIVE EVENT
                </span>
                <h5 className="text-white fw-bold mb-1">Mumbai Fashion Show</h5>
                <p className="text-light small mb-3">
                  <i className="bi bi-geo-alt-fill text-primary"></i> NSCI Dome,
                  Worli
                </p>
                <Link
                  to="/events/track"
                  className="btn btn-primary btn-sm w-100 fw-bold shadow"
                >
                  Open Live Tracker{' '}
                  <i className="bi bi-box-arrow-up-right ms-1"></i>
                </Link>
              </div>
            </div>

            {/* INVENTORY ALERTS */}
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white pt-4 pb-2 border-0">
                <h5 className="fw-bold mb-0">Inventory Alerts</h5>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between p-3 bg-light-danger rounded mb-3 border border-danger border-opacity-25">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-white p-2 rounded shadow-sm text-danger">
                      <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold text-dark">
                        Classic Black Tuxedo
                      </h6>
                      <small className="text-danger fw-bold">
                        Size XL Out of Stock
                      </small>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline-danger px-2 py-1">
                    Restock
                  </button>
                </div>

                <div className="d-flex align-items-center justify-content-between p-3 bg-light-warning rounded border border-warning border-opacity-25">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-white p-2 rounded shadow-sm text-warning">
                      <i className="bi bi-box-seam-fill fs-5"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold text-dark">
                        White Banquet Shirt
                      </h6>
                      <small className="text-warning fw-bold text-dark">
                        Size S Running Low (5 left)
                      </small>
                    </div>
                  </div>
                  <Link
                    to="/admin/uniforms"
                    className="btn btn-sm btn-outline-warning text-dark px-2 py-1"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
