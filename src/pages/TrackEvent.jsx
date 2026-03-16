// src/pages/TrackEvent.jsx
// Uses window.google (loaded via index.html script tag) — no @react-google-maps/api needed.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { trackEvent } from '../api/eventsApi';

// ── Status config ──────────────────────────────────────────────
const CREW_STATUS = {
  on_event: { label: 'At Venue', color: '#28a745', icon: 'bi-geo-alt-fill' },
  away: {
    label: 'On Duty / Away',
    color: '#ffc107',
    icon: 'bi-arrow-right-circle',
  },
  offline: { label: 'Not on Duty', color: '#6c757d', icon: 'bi-dash-circle' },
};
const crewSt = (s) => CREW_STATUS[s] || CREW_STATUS.offline;
const initials = (name) =>
  (name || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
const POLL_INTERVAL = 15_000;

// ══════════════════════════════════════════════════════════════
export default function TrackEvent() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePin, setActivePin] = useState(null);
  const pollRef = useRef(null);

  // ── Map refs ───────────────────────────────────────────────
  const mapRef = useRef(null); // DOM div
  const mapInstanceRef = useRef(null); // google.maps.Map
  const venueMarkerRef = useRef(null);
  const crewMarkersRef = useRef({}); // { profile_id: AdvancedMarkerElement | Marker }
  const infoWindowRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchTracking = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const res = await trackEvent(id);
        setData(res.data.data);
        setError('');
      } catch (e) {
        if (!silent)
          setError(
            e.response?.data?.message || 'Failed to load tracking data.',
          );
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchTracking();
    pollRef.current = setInterval(() => fetchTracking(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchTracking]);

  // ── Init map once ──────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !window.google || mapInstanceRef.current) return;
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 5,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    infoWindowRef.current = new window.google.maps.InfoWindow();
  }, [loading]); // run after first load completes so mapRef is visible

  // ── Update markers whenever data changes ──────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google || !data) return;
    const G = window.google.maps;
    const map = mapInstanceRef.current;
    const { event: ev, crew } = data;

    // ── Venue marker ────────────────────────────────────────
    if (venueMarkerRef.current) {
      venueMarkerRef.current.setMap(null);
      venueMarkerRef.current = null;
    }
    if (ev?.venue_lat && ev?.venue_lng) {
      venueMarkerRef.current = new G.Marker({
        position: { lat: ev.venue_lat, lng: ev.venue_lng },
        map,
        title: ev.venue_name || 'Venue',
        icon: {
          path: G.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#dc3545',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        label: { text: '📍', fontSize: '20px' },
        zIndex: 10,
      });
    }

    // ── Crew markers ─────────────────────────────────────────
    // Remove stale markers
    const incomingIds = new Set((crew || []).map((c) => c.id));
    Object.keys(crewMarkersRef.current).forEach((pid) => {
      if (!incomingIds.has(pid)) {
        crewMarkersRef.current[pid].setMap(null);
        delete crewMarkersRef.current[pid];
      }
    });

    (crew || [])
      .filter((c) => c.lat && c.lng)
      .forEach((c) => {
        const st = crewSt(c.status);
        const pos = { lat: c.lat, lng: c.lng };

        if (crewMarkersRef.current[c.id]) {
          // Update existing marker position
          crewMarkersRef.current[c.id].setPosition(pos);
        } else {
          // Create new marker
          const marker = new G.Marker({
            position: pos,
            map,
            title: c.name || c.stage_name,
            icon: {
              path: G.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: st.color,
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            },
            label: {
              text: (c.name || '?')[0].toUpperCase(),
              color: '#fff',
              fontSize: '11px',
              fontWeight: 'bold',
            },
            zIndex: 20,
          });

          marker.addListener('click', () => {
            const content = `
            <div style="font-family:inherit;min-width:160px">
              <div style="font-weight:700;font-size:.9rem;margin-bottom:4px">${c.name || c.stage_name || 'Staff'}</div>
              ${c.stage_name ? `<div style="font-size:.75rem;color:#9aa3af;margin-bottom:6px">${c.stage_name}</div>` : ''}
              <div style="display:inline-block;background:${st.color}18;color:${st.color};border-radius:4px;padding:2px 8px;font-size:.72rem;font-weight:700">
                ${st.label}
              </div>
              ${c.timestamp ? `<div style="font-size:.68rem;color:#9aa3af;margin-top:6px">Updated: ${new Date(c.timestamp).toLocaleTimeString('en-IN')}</div>` : ''}
            </div>`;
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(map, marker);
            setActivePin(c.id);
          });

          crewMarkersRef.current[c.id] = marker;
        }
      });

    // ── Fit bounds to all markers ─────────────────────────────
    const crewWithLoc = (crew || []).filter((c) => c.lat && c.lng);
    if (crewWithLoc.length > 0) {
      const bounds = new G.LatLngBounds();
      crewWithLoc.forEach((c) => bounds.extend({ lat: c.lat, lng: c.lng }));
      if (ev?.venue_lat && ev?.venue_lng)
        bounds.extend({ lat: ev.venue_lat, lng: ev.venue_lng });
      map.fitBounds(bounds, { top: 60, bottom: 60, left: 40, right: 40 });
    } else if (ev?.venue_lat && ev?.venue_lng) {
      map.setCenter({ lat: ev.venue_lat, lng: ev.venue_lng });
      map.setZoom(15);
    }
  }, [data]);

  // ── Fly to crew pin ────────────────────────────────────────
  const flyTo = (crew) => {
    if (!mapInstanceRef.current || !crew.lat || !crew.lng) return;
    const map = mapInstanceRef.current;
    const currentZoom = map.getZoom();
    if (currentZoom > 13) map.setZoom(13);
    setTimeout(() => {
      map.panTo({ lat: crew.lat, lng: crew.lng });
      setTimeout(() => map.setZoom(16), 800);
    }, 400);
    setActivePin(crew.id);
    // Trigger click on the marker to show InfoWindow
    if (crewMarkersRef.current[crew.id]) {
      window.google.maps.event.trigger(
        crewMarkersRef.current[crew.id],
        'click',
      );
    }
  };

  // ── Render guards ──────────────────────────────────────────
  if (loading)
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: 400 }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: 44, height: 44 }}
          />
          <p className="text-muted small">Loading event tracking…</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="page-content">
        <Link
          to={`/admin/events/${id}`}
          className="btn btn-light shadow-sm mb-4"
        >
          <i className="bi bi-arrow-left me-1"></i>Back
        </Link>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  if (!data) return null;

  const { event: ev, crew, total_crew } = data;
  const eventStarted =
    ev?.event_start_datetime && new Date(ev.event_start_datetime) <= new Date();
  const onlineCount = (crew || []).filter((c) => c.status !== 'offline').length;
  const atVenueCount = (crew || []).filter(
    (c) => c.status === 'on_event',
  ).length;

  return (
    <>
      <style>{`
        .tr-card { background:#fff;border-radius:14px;border:1px solid #eef0f4;box-shadow:0 2px 12px rgba(44,50,73,.06);overflow:hidden;margin-bottom:16px; }
        .tr-card-hd { padding:12px 18px;border-bottom:1px solid #f5f6fa;display:flex;align-items:center;justify-content:space-between; }
        .tr-card-hd h6 { margin:0;font-size:.82rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#4a5568; }
        .staff-btn { border:1.5px solid #eef0f4;border-radius:10px;background:#fff;transition:.2s;cursor:pointer;padding:10px 12px;width:100%;text-align:left; }
        .staff-btn:hover { background:#f0f4ff;border-color:#435ebe; }
        .stat-box { text-align:center;padding:12px 8px;border-radius:10px; }
        .stat-val { font-size:1.4rem;font-weight:800;color:#2c3249;line-height:1; }
        .stat-lbl { font-size:.68rem;text-transform:uppercase;letter-spacing:.8px;color:#9aa3af;font-weight:700;margin-top:3px; }
        .pulse { animation:trPulse 1.8s infinite; }
        @keyframes trPulse { 0%,100%{opacity:1}50%{opacity:.4} }
      `}</style>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="page-heading">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <Link
              to={`/admin/events/${id}`}
              className="btn btn-light shadow-sm mb-2"
            >
              <i className="bi bi-arrow-left me-1"></i>Event Details
            </Link>
            <h3 className="mb-0">Live Tracking — {ev?.event_name}</h3>
            <p className="text-muted mb-0 small">
              {ev?.venue_name} · {ev?.city}
              {ev?.state ? ', ' + ev.state : ''}
            </p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            {eventStarted ? (
              <span
                className="badge text-white py-2 px-3 pulse"
                style={{ background: '#28a745', fontSize: '.8rem' }}
              >
                <i className="bi bi-broadcast me-1"></i>Live Tracking Active
              </span>
            ) : (
              <span
                className="badge bg-warning text-dark py-2 px-3"
                style={{ fontSize: '.8rem' }}
              >
                <i className="bi bi-clock me-1"></i>Event Not Started Yet
              </span>
            )}
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => fetchTracking()}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* ── Stats ──────────────────────────────────────────── */}
        <div className="row g-3 mb-4">
          {[
            {
              val: total_crew,
              lbl: 'Total Crew',
              bg: '#e3f2fd',
              color: '#1565c0',
            },
            {
              val: onlineCount,
              lbl: 'On Duty',
              bg: '#e8f5e9',
              color: '#2e7d32',
            },
            {
              val: atVenueCount,
              lbl: 'At Venue',
              bg: '#f3e5f5',
              color: '#7b1fa2',
            },
            {
              val: total_crew - onlineCount,
              lbl: 'Offline',
              bg: '#f5f5f5',
              color: '#757575',
            },
          ].map((s) => (
            <div
              className="col-6 col-md-3"
              key={s.lbl}
            >
              <div className="tr-card p-0">
                <div
                  className="stat-box"
                  style={{ background: s.bg }}
                >
                  <div
                    className="stat-val"
                    style={{ color: s.color }}
                  >
                    {s.val}
                  </div>
                  <div
                    className="stat-lbl"
                    style={{ color: s.color }}
                  >
                    {s.lbl}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4">
          {/* ── Map ───────────────────────────────────────────── */}
          <div className="col-lg-8">
            <div className="tr-card">
              <div className="tr-card-hd">
                <h6>
                  <i className="bi bi-map me-2 text-primary"></i>Live Location
                </h6>
                {!window.google && (
                  <small className="text-warning">
                    <i className="bi bi-exclamation-triangle me-1"></i>Maps
                    loading…
                  </small>
                )}
              </div>
              <div
                ref={mapRef}
                style={{
                  width: '100%',
                  height: '62vh',
                  borderRadius: '0 0 14px 14px',
                }}
              />
            </div>
          </div>

          {/* ── Crew list ─────────────────────────────────────── */}
          <div className="col-lg-4">
            <div
              className="tr-card"
              style={{ maxHeight: '72vh', overflowY: 'auto' }}
            >
              <div className="tr-card-hd">
                <h6>
                  <i className="bi bi-people me-2 text-primary"></i>Assigned
                  Crew
                </h6>
                <span
                  className="badge text-white"
                  style={{ background: '#28a745', fontSize: '.72rem' }}
                >
                  {onlineCount} Online
                </span>
              </div>
              <div style={{ padding: '12px' }}>
                {!crew || crew.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-people fs-2 d-block mb-2"></i>
                    <small>No crew assigned.</small>
                  </div>
                ) : (
                  crew.map((c) => {
                    const st = crewSt(c.status);
                    const hasLocation = c.lat && c.lng;
                    return (
                      <button
                        key={c.id}
                        className="staff-btn mb-2"
                        onClick={() => hasLocation && flyTo(c)}
                        style={
                          !hasLocation
                            ? { cursor: 'default', opacity: 0.7 }
                            : {}
                        }
                      >
                        <div className="d-flex align-items-center gap-3">
                          {c.image_url ? (
                            <img
                              src={c.image_url}
                              className="rounded-circle"
                              width={44}
                              height={44}
                              style={{
                                objectFit: 'cover',
                                flexShrink: 0,
                                border: `2px solid ${st.color}`,
                              }}
                              alt={c.name}
                            />
                          ) : (
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                              style={{
                                width: 44,
                                height: 44,
                                flexShrink: 0,
                                background: st.color,
                                fontSize: '.85rem',
                              }}
                            >
                              {initials(c.name)}
                            </div>
                          )}
                          <div className="flex-grow-1 min-w-0">
                            <div
                              className="fw-bold text-truncate"
                              style={{ fontSize: '.88rem' }}
                            >
                              {c.name}
                            </div>
                            {c.stage_name && (
                              <div
                                className="text-muted"
                                style={{ fontSize: '.73rem' }}
                              >
                                {c.stage_name}
                              </div>
                            )}
                            <div className="d-flex align-items-center gap-1 mt-1">
                              <span
                                style={{
                                  background: st.color + '18',
                                  color: st.color,
                                  borderRadius: 4,
                                  padding: '2px 7px',
                                  fontSize: '.7rem',
                                  fontWeight: 700,
                                }}
                              >
                                <i className={`bi ${st.icon} me-1`}></i>
                                {st.label}
                              </span>
                            </div>
                            {c.timestamp && (
                              <div
                                className="text-muted"
                                style={{ fontSize: '.68rem', marginTop: 2 }}
                              >
                                Updated:{' '}
                                {new Date(c.timestamp).toLocaleTimeString(
                                  'en-IN',
                                )}
                              </div>
                            )}
                            {c.location_error && (
                              <div
                                style={{
                                  fontSize: '.68rem',
                                  color: '#dc3545',
                                  marginTop: 2,
                                }}
                              >
                                <i className="bi bi-exclamation-triangle me-1"></i>
                                {c.location_error}
                              </div>
                            )}
                          </div>
                          {hasLocation && (
                            <i
                              className="bi bi-crosshair text-primary"
                              style={{ flexShrink: 0 }}
                            ></i>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Event summary */}
            <div className="tr-card">
              <div className="tr-card-hd">
                <h6>
                  <i className="bi bi-calendar-event me-2 text-primary"></i>
                  Event Summary
                </h6>
              </div>
              <div style={{ padding: '16px' }}>
                <div
                  style={{ fontSize: '.87rem' }}
                  className="d-flex flex-column gap-2"
                >
                  <div>
                    <span className="text-muted">Event:</span>{' '}
                    <strong>{ev?.event_name}</strong>
                  </div>
                  <div>
                    <span className="text-muted">Client:</span>{' '}
                    <strong>{ev?.client_name || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-muted">Start:</span>{' '}
                    {ev?.event_start_datetime
                      ? new Date(ev.event_start_datetime).toLocaleString(
                          'en-IN',
                        )
                      : '—'}
                  </div>
                  <div>
                    <span className="text-muted">Venue:</span>{' '}
                    {ev?.venue_name || '—'}
                  </div>
                  <hr className="my-1" />
                  <div>
                    <span className="text-muted">Status: </span>
                    <strong
                      style={{ color: eventStarted ? '#28a745' : '#ffc107' }}
                    >
                      {eventStarted ? 'Live / In Progress' : 'Not Started Yet'}
                    </strong>
                  </div>
                  <div
                    className="text-muted"
                    style={{ fontSize: '.75rem' }}
                  >
                    Auto-refreshes every {POLL_INTERVAL / 1000}s
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
