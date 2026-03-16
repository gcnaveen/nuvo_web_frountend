// src/pages/Events.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addMonths from 'date-fns/addMonths';
import subMonths from 'date-fns/subMonths';
import isSameDay from 'date-fns/isSameDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { listEvents, createEvent } from '../api/eventsApi';
import { listThemes, listUniforms, listPlans } from '../api/masterApi';
import api from '../api/axiosInstance';

// ── Calendar localizer ─────────────────────────────────────────
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {},
});

// ── Status config ──────────────────────────────────────────────
const STATUS_CFG = {
  created: { label: 'Created', hex: '#435ebe', badge: 'primary' },
  planning_started: { label: 'Planning', hex: '#0dcaf0', badge: 'info' },
  staff_allocated: {
    label: 'Staff Allocated',
    hex: '#ffc107',
    badge: 'warning',
  },
  completed: { label: 'Completed', hex: '#198754', badge: 'success' },
  cancelled: { label: 'Cancelled', hex: '#dc3545', badge: 'danger' },
};
const statusCfg = (s) =>
  STATUS_CFG[s] || { label: s, hex: '#6c757d', badge: 'secondary' };

// ── Helpers ────────────────────────────────────────────────────
const fmtDate = (d) => (d ? format(new Date(d), 'd MMM yyyy') : '—');
const fmtTime = (d) => (d ? format(new Date(d), 'h:mm a') : '');
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman & Nicobar Islands',
  'Chandigarh',
  'Dadra & Nagar Haveli',
  'Daman & Diu',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

// ══════════════════════════════════════════════════════════════
export default function Events() {
  const navigate = useNavigate();

  // ── Data ───────────────────────────────────────────────────────
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── View ───────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState('table'); // table | calendar
  const [calDate, setCalDate] = useState(new Date());
  const [calView, setCalView] = useState('month');

  // ── Filters ────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const searchTimer = useRef(null);

  // ── Calendar day modal ─────────────────────────────────────────
  const [dayModal, setDayModal] = useState(null); // null | { date, events[] }

  // ── Add event modal ────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [masterData, setMasterData] = useState({
    themes: [],
    uniforms: [],
    plans: [],
  });
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(initialForm());
  const [venueInput, setVenueInput] = useState('');
  const [venueSugs, setVenueSugs] = useState([]);
  const [venueLoading, setVenueLoading] = useState(false);
  const venueTimer = useRef(null);
  const autocompleteRef = useRef(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // ── Toast ──────────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  // ── Fetch events ───────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (cityFilter) params.city = cityFilter;
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await listEvents(params);
      setEvents(res.data.data.results || []);
      setTotal(res.data.data.pagination?.total || 0);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [search, cityFilter, statusFilter, startDate, endDate, page]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(fetchEvents, 350);
    return () => clearTimeout(searchTimer.current);
  }, [fetchEvents]);

  // ── Fetch master data for add modal ───────────────────────────
  const openAddModal = async () => {
    setAddOpen(true);
    setAddError('');
    setForm(initialForm());
    setVenueInput('');
    try {
      const [th, un, pl, cl] = await Promise.all([
        listThemes(),
        listUniforms(),
        listPlans(),
        api.get('/users/api/clients/'),
      ]);
      setMasterData({
        themes: Array.isArray(th.data.data) ? th.data.data : [],
        uniforms: Array.isArray(un.data.data) ? un.data.data : [],
        plans: Array.isArray(pl.data.data) ? pl.data.data : [],
      });
      setClients(
        Array.isArray(cl.data.data?.results) ? cl.data.data.results : [],
      );
    } catch {
      /* non-fatal */
    }
  };

  // ── Venue pick mode: "search" | "map" ────────────────────────
  const [venueMode, setVenueMode] = useState('search');
  const [mapPin, setMapPin] = useState(null); // { lat, lng } of dropped pin
  const [mapGeoLoading, setMapGeoLoading] = useState(false);
  const venueMapRef = useRef(null);

  // ── City coordinates cache ────────────────────────────────────
  const cityCoordCache = useRef({});
  const _getCityCoords = async (cityName) => {
    if (!cityName || !window.google) return null;
    if (cityCoordCache.current[cityName])
      return cityCoordCache.current[cityName];
    return new Promise((resolve) => {
      new window.google.maps.Geocoder().geocode(
        { address: `${cityName}, India` },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            const c = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            };
            cityCoordCache.current[cityName] = c;
            resolve(c);
          } else resolve(null);
        },
      );
    });
  };

  // ── Google Maps venue autocomplete (new Places API, March 2025+) ──
  const handleVenueInput = (val) => {
    setVenueInput(val);
    setForm((p) => ({ ...p, venue: null }));
    clearTimeout(venueTimer.current);
    if (val.length < 3) {
      setVenueSugs([]);
      return;
    }
    setVenueLoading(true);
    venueTimer.current = setTimeout(async () => {
      // Geocode city for a tight locationBias (30km radius)
      const cityCoords = form.city ? await _getCityCoords(form.city) : null;
      const locationBias = cityCoords
        ? { center: cityCoords, radius: 30000 }
        : { center: { lat: 20.5937, lng: 78.9629 }, radius: 2000000 };
      try {
        const { AutocompleteSuggestion } =
          await window.google.maps.importLibrary('places');
        const { suggestions } =
          await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: val,
            language: 'en',
            locationBias,
          });
        setVenueLoading(false);
        setVenueSugs(
          suggestions.slice(0, 6).map((s) => ({
            place_id: s.placePrediction.placeId,
            main_text: s.placePrediction.mainText?.toString() || '',
            secondary_text: s.placePrediction.secondaryText?.toString() || '',
            description: s.placePrediction.text?.toString() || '',
          })),
        );
      } catch {
        try {
          const service = new window.google.maps.places.AutocompleteService();
          const opts = { input: val, types: ['establishment', 'geocode'] };
          if (cityCoords) {
            opts.location = new window.google.maps.LatLng(
              cityCoords.lat,
              cityCoords.lng,
            );
            opts.radius = 30000;
          }
          service.getPlacePredictions(opts, (predictions) => {
            setVenueLoading(false);
            setVenueSugs(
              (predictions || []).slice(0, 6).map((p) => ({
                place_id: p.place_id,
                main_text: p.structured_formatting?.main_text || p.description,
                secondary_text: p.structured_formatting?.secondary_text || '',
                description: p.description,
              })),
            );
          });
        } catch {
          setVenueLoading(false);
          setVenueSugs([]);
        }
      }
    }, 400);
  };

  // Geocode a place_id and build the venue object
  const _geocodePlaceId = (placeId, venueName) =>
    new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const r = results[0];
          // Extract city and state from address components
          let city = '',
            state = '';
          for (const comp of r.address_components) {
            if (comp.types.includes('locality')) city = comp.long_name;
            if (comp.types.includes('administrative_area_level_1'))
              state = comp.long_name;
          }
          resolve({
            venue_name: venueName,
            formatted_address: r.formatted_address,
            latitude: r.geometry.location.lat(),
            longitude: r.geometry.location.lng(),
            place_id: placeId,
            google_maps_url: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
            _city: city,
            _state: state,
          });
        } else {
          resolve(null);
        }
      });
    });

  const selectVenueSuggestion = async (sug) => {
    const venue = await _geocodePlaceId(
      sug.place_id,
      sug.main_text || sug.description,
    );
    if (venue) {
      setForm((p) => ({
        ...p,
        venue,
        // Auto-fill city + state from geocode result if not already set
        city: p.city || venue._city,
        state: p.state || venue._state,
      }));
      setVenueInput(venue.venue_name);
      setVenueSugs([]);
    }
  };

  // ── Map click → reverse geocode ───────────────────────────────
  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMapPin({ lat, lng });
    setMapGeoLoading(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        setMapGeoLoading(false);
        if (status === 'OK' && results[0]) {
          const r = results[0];
          let city = '',
            state = '',
            venueName = '';
          for (const comp of r.address_components) {
            if (
              comp.types.includes('premise') ||
              comp.types.includes('establishment')
            )
              venueName = comp.long_name;
            if (comp.types.includes('locality')) city = comp.long_name;
            if (comp.types.includes('administrative_area_level_1'))
              state = comp.long_name;
          }
          if (!venueName) venueName = r.formatted_address.split(',')[0];
          const venue = {
            venue_name: venueName,
            formatted_address: r.formatted_address,
            latitude: lat,
            longitude: lng,
            place_id: r.place_id || '',
            google_maps_url: `https://www.google.com/maps?q=${lat},${lng}`,
          };
          setForm((p) => ({
            ...p,
            venue,
            city: p.city || city,
            state: p.state || state,
          }));
          setVenueInput(venueName);
        }
      });
    } catch {
      setMapGeoLoading(false);
    }
  };

  // ── Form helpers ───────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!form.event_name.trim()) {
      setAddError('Event name is required.');
      return;
    }
    if (!form.client_id) {
      setAddError('Please select a client.');
      return;
    }
    if (!form.venue) {
      setAddError('Please select a venue from the suggestions.');
      return;
    }
    if (!form.event_start_datetime || !form.event_end_datetime) {
      setAddError('Start and end datetime required.');
      return;
    }

    setAdding(true);
    setAddError('');
    try {
      const payload = {
        event_name: form.event_name,
        event_type: form.event_type,
        city: form.city,
        state: form.state,
        venue: form.venue,
        event_start_datetime: form.event_start_datetime,
        event_end_datetime: form.event_end_datetime,
        no_of_days: Number(form.no_of_days) || 1,
        working_hours: form.working_hours ? Number(form.working_hours) : null,
        crew_count: Number(form.crew_count) || 0,
        client_id: form.client_id,
        theme_id: form.theme_id || undefined,
        uniform_id: form.uniform_id || undefined,
        package_id: form.package_id || undefined,
        payment: {
          total_amount: Number(form.total_amount) || 0,
          gst_amount: Number(form.gst_amount) || 0,
          tax_amount: Number(form.tax_amount) || 0,
        },
        ...(form.gst_company
          ? {
              gst_details: {
                company_name: form.gst_company,
                address: form.gst_address,
                gst_number: form.gst_number,
              },
            }
          : {}),
      };
      const res = await createEvent(payload);
      setEvents((prev) => [res.data.data, ...prev]);
      setTotal((t) => t + 1);
      setAddOpen(false);
      showToast('Event created successfully!');
    } catch (e) {
      setAddError(e.response?.data?.message || 'Failed to create event.');
    } finally {
      setAdding(false);
    }
  };

  // ── Calendar helpers ───────────────────────────────────────────
  const calendarEvents = useMemo(
    () =>
      events.map((ev) => ({
        title: ev.event_name,
        start: new Date(ev.event_start_datetime),
        end: new Date(ev.event_end_datetime),
        resource: ev,
      })),
    [events],
  );

  const handleCalSelect = (slotInfo) => {
    const d = slotInfo.start;
    const onDay = events.filter((e) =>
      isSameDay(new Date(e.event_start_datetime), d),
    );
    setDayModal({ date: d, evs: onDay });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .ev-input { background:#f8f9fa!important; border:1px solid #eaeaea!important; border-radius:8px; padding:8px 12px; font-size:.88rem; width:100%; }
        .ev-input:focus { background:#fff!important; border-color:#435ebe!important; box-shadow:0 0 0 .2rem rgba(67,94,190,.15)!important; outline:none; }
        .ev-select { background:#f8f9fa!important; border:1px solid #eaeaea!important; border-radius:8px; padding:8px 12px; font-size:.88rem; width:100%; }
        .ev-label { font-size:.72rem; text-transform:uppercase; letter-spacing:.8px; font-weight:700; color:#9aa3af; margin-bottom:4px; display:block; }
        .ev-section { font-size:.7rem; text-transform:uppercase; letter-spacing:1px; color:#c5cadb; font-weight:700; display:flex; align-items:center; gap:8px; margin:16px 0 12px; }
        .ev-section::after { content:""; flex:1; height:1px; background:#f0f2f5; }
        .venue-sug { padding:10px 14px; cursor:pointer; border-bottom:1px solid #f5f6fa; font-size:.87rem; }
        .venue-sug:hover { background:#f0f4ff; }
        .venue-sug-main { font-weight:700; color:#2c3249; }
        .venue-sug-sub { font-size:.75rem; color:#9aa3af; }
        .ev-toast { position:fixed;top:24px;right:24px;z-index:9999;background:#fff;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.13);padding:13px 20px;display:flex;align-items:center;gap:10px;font-size:.86rem;font-weight:600;color:#2c3249;animation:evSlide .3s ease; }
        .ev-toast.success{border-left:4px solid #28a745;} .ev-toast.danger{border-left:4px solid #dc3545;}
        @keyframes evSlide{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}
        .rbc-calendar { font-family:inherit; }
        .rbc-today { background:#f0f4ff!important; }
      `}</style>

      {/* Toast */}
      {toast.msg && (
        <div className={`ev-toast ${toast.type}`}>
          <i
            className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-circle-fill text-danger'} fs-5`}
          ></i>
          {toast.msg}
        </div>
      )}

      {/* ── HEADING ─────────────────────────────────────────────── */}
      <div className="page-heading">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h3>Event Management</h3>
            <p className="text-muted mb-0">
              Manage bookings, schedules, and team allocations.
            </p>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <div className="btn-group">
              <button
                className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('table')}
                title="Table"
              >
                <i className="bi bi-table"></i>
              </button>
              <button
                className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setViewMode('calendar')}
                title="Calendar"
              >
                <i className="bi bi-calendar3"></i>
              </button>
            </div>
            <button className="btn btn-outline-success">
              <i className="bi bi-file-earmark-excel me-1"></i>Export
            </button>
            <button
              className="btn btn-primary"
              onClick={openAddModal}
            >
              <i className="bi bi-calendar-plus me-1"></i>Add Event
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* ── FILTERS ────────────────────────────────────────────── */}
        <div className="card shadow-sm mb-4 border-0">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="small fw-bold text-muted">Search</label>
                <input
                  className="form-control ev-input"
                  placeholder="Client or event name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="col-md-2">
                <label className="small fw-bold text-muted">City</label>
                <input
                  className="form-control ev-input"
                  placeholder="Any city"
                  value={cityFilter}
                  onChange={(e) => {
                    setCityFilter(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="col-md-2">
                <label className="small fw-bold text-muted">Status</label>
                <select
                  className="form-select ev-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Stages</option>
                  {Object.entries(STATUS_CFG).map(([k, v]) => (
                    <option
                      key={k}
                      value={k}
                    >
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="small fw-bold text-muted">Date Range</label>
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control ev-input"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                  />
                  <input
                    type="date"
                    className="form-control ev-input border-start-0"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
              {(search ||
                cityFilter ||
                statusFilter ||
                startDate ||
                endDate) && (
                <div className="col-auto">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setSearch('');
                      setCityFilter('');
                      setStatusFilter('');
                      setStartDate('');
                      setEndDate('');
                      setPage(1);
                    }}
                  >
                    <i className="bi bi-x-circle me-1"></i>Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {viewMode === 'table' ? (
          /* ── TABLE VIEW ──────────────────────────────────────── */
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" />
                  <p className="text-muted mt-3 small">Loading events…</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>No
                  events found.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-4">Event</th>
                        <th>Client</th>
                        <th>Date</th>
                        <th>Venue</th>
                        <th className="text-center">Crew</th>
                        <th>Status</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((ev) => {
                        const sc = statusCfg(ev.status);
                        return (
                          <tr key={ev.id}>
                            <td className="ps-4">
                              <div
                                className="fw-bold"
                                style={{ fontSize: '.9rem' }}
                              >
                                {ev.event_name}
                              </div>
                              <small className="text-muted">
                                {ev.event_type || '—'}
                              </small>
                            </td>
                            <td>
                              <div
                                className="fw-semibold"
                                style={{ fontSize: '.88rem' }}
                              >
                                {ev.client?.full_name || '—'}
                              </div>
                              <small className="text-muted">{ev.city}</small>
                            </td>
                            <td>
                              <div style={{ fontSize: '.87rem' }}>
                                {fmtDate(ev.event_start_datetime)}
                              </div>
                              <small className="text-muted">
                                {fmtTime(ev.event_start_datetime)}
                              </small>
                            </td>
                            <td>
                              <div
                                className="text-truncate"
                                style={{ maxWidth: 180, fontSize: '.87rem' }}
                                title={ev.venue?.venue_name}
                              >
                                {ev.venue?.venue_name || '—'}
                              </div>
                              <small className="text-muted">
                                {ev.venue?.formatted_address
                                  ? ev.venue.formatted_address
                                      .split(',')
                                      .slice(-2)
                                      .join(',')
                                      .trim()
                                  : ''}
                              </small>
                            </td>
                            <td className="text-center fw-bold">
                              {ev.crew_count || 0}
                            </td>
                            <td>
                              <span
                                style={{
                                  background: sc.hex + '18',
                                  color: sc.hex,
                                  borderRadius: 6,
                                  padding: '3px 10px',
                                  fontWeight: 700,
                                  fontSize: '.75rem',
                                }}
                              >
                                {sc.label}
                              </span>
                            </td>
                            <td className="text-end pe-4">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => navigate(`/events/${ev.id}`)}
                              >
                                <i className="bi bi-eye me-1"></i>View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top">
                  <small className="text-muted">
                    Showing {(page - 1) * PAGE_SIZE + 1}–
                    {Math.min(page * PAGE_SIZE, total)} of {total}
                  </small>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      ‹ Prev
                    </button>
                    {Array.from(
                      { length: Math.min(totalPages, 7) },
                      (_, i) => i + 1,
                    ).map((p) => (
                      <button
                        key={p}
                        className={`btn btn-sm ${page === p ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── CALENDAR VIEW ───────────────────────────────────── */
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">{format(calDate, 'MMMM yyyy')}</h5>
                <div className="btn-group">
                  <button
                    className="btn btn-light border"
                    onClick={() => setCalDate((d) => subMonths(d, 1))}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <button
                    className="btn btn-light border fw-bold"
                    onClick={() => setCalDate(new Date())}
                  >
                    Today
                  </button>
                  <button
                    className="btn btn-light border"
                    onClick={() => setCalDate((d) => addMonths(d, 1))}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </div>
              <div style={{ height: 640 }}>
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  date={calDate}
                  onNavigate={setCalDate}
                  view={calView}
                  onView={setCalView}
                  toolbar={false}
                  popup
                  selectable
                  onSelectEvent={(e) => handleCalSelect({ start: e.start })}
                  onSelectSlot={handleCalSelect}
                  eventPropGetter={(ev) => {
                    const hex = statusCfg(ev.resource?.status).hex;
                    return {
                      style: {
                        backgroundColor: hex,
                        border: 'none',
                        color: hex === '#ffc107' ? '#000' : '#fff',
                        fontSize: '.78rem',
                      },
                    };
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CALENDAR DAY MODAL ────────────────────────────────── */}
      {dayModal && (
        <div
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,.5)', zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: 14 }}
            >
              <div className="modal-header border-0 px-4 pt-4 pb-2">
                <h5 className="fw-bold mb-0">
                  Events on {format(dayModal.date, 'd MMMM yyyy')}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setDayModal(null)}
                ></button>
              </div>
              <div className="modal-body p-0">
                {dayModal.evs.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>No
                    events on this day.
                    <div className="mt-3">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setDayModal(null);
                          openAddModal();
                        }}
                      >
                        Add Event
                      </button>
                    </div>
                  </div>
                ) : (
                  dayModal.evs.map((ev) => {
                    const sc = statusCfg(ev.status);
                    return (
                      <div
                        key={ev.id}
                        className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-3"
                      >
                        <div>
                          <div className="fw-bold">{ev.event_name}</div>
                          <small className="text-muted">
                            <i className="bi bi-person me-1"></i>
                            {ev.client?.full_name} ·{' '}
                            <i className="bi bi-geo-alt ms-1 me-1"></i>
                            {ev.venue?.venue_name}
                          </small>
                        </div>
                        <div className="d-flex gap-2 align-items-center">
                          <span
                            style={{
                              background: sc.hex + '18',
                              color: sc.hex,
                              borderRadius: 6,
                              padding: '3px 10px',
                              fontWeight: 700,
                              fontSize: '.75rem',
                            }}
                          >
                            {sc.label}
                          </span>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              setDayModal(null);
                              navigate(`/events/${ev.id}`);
                            }}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD EVENT MODAL ──────────────────────────────────── */}
      {addOpen && (
        <div
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,.5)', zIndex: 1055 }}
        >
          <div
            className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${venueMode === 'map' ? '' : 'modal-xl'}`}
            style={
              venueMode === 'map'
                ? { maxWidth: 'min(1280px, 96vw)', margin: '16px auto' }
                : {}
            }
          >
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: 16 }}
            >
              <div className="modal-header border-0 px-4 pt-4 pb-2">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-light p-2">
                    <i className="bi bi-calendar-event text-primary fs-5"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0">Create New Event</h5>
                    <small className="text-muted">
                      Fill in the details to schedule a booking.
                    </small>
                  </div>
                </div>
                <button
                  className="btn-close"
                  onClick={() => setAddOpen(false)}
                ></button>
              </div>
              <div className="modal-body px-4 pb-0">
                {addError && (
                  <div className="alert alert-danger py-2">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {addError}
                  </div>
                )}
                <form
                  id="addEventForm"
                  onSubmit={handleCreateEvent}
                >
                  <div className="row g-4">
                    {/* ── Col 1: Client + Event Info ── */}
                    <div className="col-lg-4 border-end pe-lg-4">
                      <div className="ev-section">1. Client & Event Info</div>
                      <div className="mb-3">
                        <label className="ev-label">Client *</label>
                        <select
                          name="client_id"
                          className="form-select ev-select"
                          value={form.client_id}
                          onChange={handleFormChange}
                          disabled={adding}
                        >
                          <option value="">— Select client —</option>
                          {clients.map((c) => (
                            <option
                              key={c.id}
                              value={c.id}
                            >
                              {c.full_name} ({c.email})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="ev-label">Event Name *</label>
                        <input
                          name="event_name"
                          className="ev-input"
                          value={form.event_name}
                          onChange={handleFormChange}
                          placeholder="e.g. Sharma Wedding"
                          disabled={adding}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="ev-label">Event Type</label>
                        <select
                          name="event_type"
                          className="form-select ev-select"
                          value={form.event_type}
                          onChange={handleFormChange}
                          disabled={adding}
                        >
                          {[
                            'Wedding',
                            'Corporate',
                            'Birthday',
                            'Fashion Event',
                            'Other',
                          ].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="ev-label">No. of Days</label>
                          <input
                            type="number"
                            name="no_of_days"
                            min="1"
                            className="ev-input"
                            value={form.no_of_days}
                            onChange={handleFormChange}
                            disabled={adding}
                          />
                        </div>
                        <div className="col-6">
                          <label className="ev-label">Working Hrs</label>
                          <input
                            type="number"
                            name="working_hours"
                            min="0"
                            step="0.5"
                            className="ev-input"
                            value={form.working_hours}
                            onChange={handleFormChange}
                            placeholder="8"
                            disabled={adding}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="ev-label">Crew Count</label>
                        <input
                          type="number"
                          name="crew_count"
                          min="0"
                          className="ev-input"
                          value={form.crew_count}
                          onChange={handleFormChange}
                          placeholder="0"
                          disabled={adding}
                        />
                      </div>
                    </div>

                    {/* ── Col 2: Venue + Schedule ── */}
                    <div className="col-lg-4 border-end pe-lg-4">
                      <div className="ev-section">2. Venue & Schedule</div>

                      {/* State + City first */}
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="ev-label">State *</label>
                          <select
                            name="state"
                            className="form-select ev-select"
                            value={form.state}
                            onChange={handleFormChange}
                            disabled={adding}
                          >
                            <option value="">— Select State —</option>
                            {INDIAN_STATES.map((s) => (
                              <option
                                key={s}
                                value={s}
                              >
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-6">
                          <label className="ev-label">City *</label>
                          <input
                            name="city"
                            className="ev-input"
                            value={form.city}
                            onChange={handleFormChange}
                            placeholder="e.g. Bengaluru"
                            disabled={adding || !form.state}
                            title={!form.state ? 'Select a state first' : ''}
                            style={
                              !form.state
                                ? { opacity: 0.6, cursor: 'not-allowed' }
                                : {}
                            }
                          />
                          {form.state && !form.city && (
                            <small
                              className="text-muted"
                              style={{ fontSize: '.7rem' }}
                            >
                              Enter city to scope venue search
                            </small>
                          )}
                        </div>
                      </div>

                      {/* Venue — mode toggle */}
                      <div className="mb-1">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="ev-label mb-0">
                            Venue / Location *
                          </label>
                          <div className="d-flex gap-1">
                            <button
                              type="button"
                              className={`btn btn-xs px-2 py-1`}
                              style={{
                                fontSize: '.72rem',
                                fontWeight: 700,
                                borderRadius: 6,
                                background:
                                  venueMode === 'search'
                                    ? '#435ebe'
                                    : '#f0f2f5',
                                color:
                                  venueMode === 'search' ? '#fff' : '#6c757d',
                                border: 'none',
                              }}
                              onClick={() => setVenueMode('search')}
                            >
                              <i className="bi bi-search me-1"></i>Search
                            </button>
                            <button
                              type="button"
                              className={`btn btn-xs px-2 py-1`}
                              style={{
                                fontSize: '.72rem',
                                fontWeight: 700,
                                borderRadius: 6,
                                background:
                                  venueMode === 'map' ? '#435ebe' : '#f0f2f5',
                                color: venueMode === 'map' ? '#fff' : '#6c757d',
                                border: 'none',
                              }}
                              onClick={() => setVenueMode('map')}
                            >
                              <i className="bi bi-map me-1"></i>Pick on Map
                            </button>
                          </div>
                        </div>

                        {venueMode === 'search' ? (
                          /* ── Text search mode ───────────── */
                          <div style={{ position: 'relative' }}>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-0">
                                <i className="bi bi-geo-alt text-primary"></i>
                              </span>
                              <input
                                className="form-control ev-input border-start-0 ps-0"
                                value={venueInput}
                                onChange={(e) =>
                                  handleVenueInput(e.target.value)
                                }
                                onBlur={() =>
                                  setTimeout(() => setVenueSugs([]), 150)
                                }
                                placeholder={
                                  form.city
                                    ? `Search venue in ${form.city}…`
                                    : 'Search venue or address…'
                                }
                                disabled={adding}
                              />
                              {venueLoading && (
                                <span className="input-group-text bg-light border-0">
                                  <div className="spinner-border spinner-border-sm text-primary" />
                                </span>
                              )}
                            </div>
                            {venueSugs.length > 0 && (
                              <div
                                className="border rounded-3 shadow-sm mt-1"
                                style={{
                                  position: 'absolute',
                                  zIndex: 1060,
                                  background: '#fff',
                                  width: '100%',
                                  maxHeight: 200,
                                  overflowY: 'auto',
                                }}
                              >
                                {venueSugs.map((s) => (
                                  <div
                                    key={s.place_id}
                                    className="venue-sug"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      selectVenueSuggestion(s);
                                    }}
                                  >
                                    <div className="venue-sug-main">
                                      {s.main_text}
                                    </div>
                                    <div className="venue-sug-sub">
                                      {s.secondary_text}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* ── Map pick mode ──────────────── */
                          <div
                            style={{
                              borderRadius: 10,
                              overflow: 'hidden',
                              border: '1.5px solid #e0e3ea',
                            }}
                          >
                            <div
                              style={{
                                background: '#f0f4ff',
                                padding: '6px 12px',
                                fontSize: '.75rem',
                                fontWeight: 600,
                                color: '#435ebe',
                              }}
                            >
                              <i className="bi bi-hand-index me-1"></i>
                              {mapGeoLoading
                                ? 'Detecting location…'
                                : 'Click anywhere on the map to pin the venue'}
                            </div>
                            <div
                              id="venuePickMap"
                              style={{ height: 360 }}
                            >
                              {/* GoogleMap rendered inline via a ref-attached div — loaded by the global Maps script */}
                              <VenuePickMap
                                pin={mapPin}
                                onMapClick={handleMapClick}
                                cityHint={form.city || 'India'}
                              />
                            </div>
                          </div>
                        )}

                        {/* Confirmed venue chip */}
                        {form.venue && (
                          <div
                            className="mt-2 p-2 rounded-2 d-flex align-items-start gap-2"
                            style={{
                              background: '#e8f5e9',
                              border: '1px solid #a5d6a7',
                              fontSize: '.8rem',
                            }}
                          >
                            <i className="bi bi-check-circle-fill text-success mt-1 flex-shrink-0"></i>
                            <div>
                              <strong>{form.venue.venue_name}</strong>
                              <div
                                className="text-muted"
                                style={{ fontSize: '.73rem' }}
                              >
                                {form.venue.formatted_address}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm p-0 ms-auto text-muted"
                              style={{ lineHeight: 1 }}
                              onClick={() => {
                                setForm((p) => ({ ...p, venue: null }));
                                setVenueInput('');
                                setMapPin(null);
                              }}
                            >
                              <i
                                className="bi bi-x-lg"
                                style={{ fontSize: '.7rem' }}
                              ></i>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="mb-3 mt-3">
                        <label className="ev-label">Start Date & Time *</label>
                        <input
                          type="datetime-local"
                          name="event_start_datetime"
                          className="ev-input"
                          value={form.event_start_datetime}
                          onChange={handleFormChange}
                          disabled={adding}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="ev-label">End Date & Time *</label>
                        <input
                          type="datetime-local"
                          name="event_end_datetime"
                          className="ev-input"
                          value={form.event_end_datetime}
                          onChange={handleFormChange}
                          disabled={adding}
                        />
                      </div>
                    </div>

                    {/* ── Col 3: Master Data + Billing ── */}
                    <div className="col-lg-4">
                      <div className="ev-section">
                        3. Theme, Uniform & Billing
                      </div>
                      <div className="mb-3">
                        <label className="ev-label">Theme</label>
                        <select
                          name="theme_id"
                          className="form-select ev-select"
                          value={form.theme_id}
                          onChange={handleFormChange}
                          disabled={adding}
                        >
                          <option value="">— None —</option>
                          {masterData.themes.map((t) => (
                            <option
                              key={t.id}
                              value={t.id}
                            >
                              {t.theme_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="ev-label">Uniform Category</label>
                        <select
                          name="uniform_id"
                          className="form-select ev-select"
                          value={form.uniform_id}
                          onChange={handleFormChange}
                          disabled={adding}
                        >
                          <option value="">— None —</option>
                          {masterData.uniforms.map((u) => (
                            <option
                              key={u.id}
                              value={u.id}
                            >
                              {u.category_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="ev-label">Package Tier</label>
                        <select
                          name="package_id"
                          className="form-select ev-select"
                          value={form.package_id}
                          onChange={handleFormChange}
                          disabled={adding}
                        >
                          <option value="">— None —</option>
                          {masterData.plans.map((p) => (
                            <option
                              key={p.id}
                              value={p.id}
                            >
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="ev-label">Total Amount (₹)</label>
                          <input
                            type="number"
                            name="total_amount"
                            min="0"
                            className="ev-input"
                            value={form.total_amount}
                            onChange={handleFormChange}
                            placeholder="0"
                            disabled={adding}
                          />
                        </div>
                        <div className="col-6">
                          <label className="ev-label">GST Amount (₹)</label>
                          <input
                            type="number"
                            name="gst_amount"
                            min="0"
                            className="ev-input"
                            value={form.gst_amount}
                            onChange={handleFormChange}
                            placeholder="0"
                            disabled={adding}
                          />
                        </div>
                      </div>
                      {/* GST details (optional) */}
                      <div className="ev-section">GST Details (optional)</div>
                      <div className="mb-3">
                        <label className="ev-label">Company Name</label>
                        <input
                          name="gst_company"
                          className="ev-input"
                          value={form.gst_company}
                          onChange={handleFormChange}
                          placeholder="Company name"
                          disabled={adding}
                        />
                      </div>
                      <div className="row g-2">
                        <div className="col-7">
                          <label className="ev-label">GST Number</label>
                          <input
                            name="gst_number"
                            className="ev-input"
                            value={form.gst_number}
                            onChange={handleFormChange}
                            placeholder="27AAPFU0939F1ZV"
                            disabled={adding}
                          />
                        </div>
                        <div className="col-12">
                          <label className="ev-label">Billing Address</label>
                          <input
                            name="gst_address"
                            className="ev-input"
                            value={form.gst_address}
                            onChange={handleFormChange}
                            placeholder="Full address"
                            disabled={adding}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0 px-4 py-3">
                <button
                  className="btn btn-light px-4"
                  onClick={() => setAddOpen(false)}
                  disabled={adding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="addEventForm"
                  className="btn btn-primary px-5"
                  disabled={adding}
                >
                  {adding ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-calendar-check me-2"></i>Create Event
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── VenuePickMap — inline Google Map for pin-drop ──────────────
function VenuePickMap({ pin, onMapClick, cityHint }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const listenerRef = useRef(null);

  // Init map once on mount
  useEffect(() => {
    if (!mapRef.current || !window.google || mapInstanceRef.current) return;
    const m = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20.5937, lng: 78.9629 },
      zoom: 5,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });
    listenerRef.current = m.addListener('click', onMapClick);
    mapInstanceRef.current = m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-bind click handler whenever onMapClick reference changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;
    if (listenerRef.current)
      window.google.maps.event.removeListener(listenerRef.current);
    listenerRef.current = mapInstanceRef.current.addListener(
      'click',
      onMapClick,
    );
  }, [onMapClick]);

  // Pan to city whenever cityHint changes
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !window.google ||
      !cityHint ||
      cityHint === 'India'
    )
      return;
    new window.google.maps.Geocoder().geocode(
      { address: `${cityHint}, India` },
      (results, status) => {
        if (status === 'OK' && results[0] && mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(results[0].geometry.location);
          mapInstanceRef.current.setZoom(12);
        }
      },
    );
  }, [cityHint]);

  // Update pin marker
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    if (pin) {
      markerRef.current = new window.google.maps.Marker({
        position: pin,
        map: mapInstanceRef.current,
        animation: window.google.maps.Animation.DROP,
        title: 'Selected venue',
      });
      mapInstanceRef.current.panTo(pin);
      mapInstanceRef.current.setZoom(16);
    }
  }, [pin]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// ── Default form state ─────────────────────────────────────────
function initialForm() {
  return {
    client_id: '',
    event_name: '',
    event_type: 'Wedding',
    city: '',
    state: '',
    venue: null,
    event_start_datetime: '',
    event_end_datetime: '',
    no_of_days: 1,
    working_hours: '',
    crew_count: 0,
    theme_id: '',
    uniform_id: '',
    package_id: '',
    total_amount: '',
    gst_amount: '',
    tax_amount: '',
    gst_company: '',
    gst_number: '',
    gst_address: '',
  };
}
