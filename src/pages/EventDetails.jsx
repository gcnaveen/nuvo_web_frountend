// src/pages/EventDetails.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent,
  getAvailableStaff,
  assignCrew,
  initiatePayment,
} from '../api/eventsApi';
import { getPaymentTerms } from '../api/masterApi';

// ── Status config ──────────────────────────────────────────────
const STATUS_CFG = {
  created: { label: 'Created', pct: 20, color: '#435ebe' },
  planning_started: { label: 'Planning', pct: 45, color: '#0dcaf0' },
  staff_allocated: { label: 'Staff Allocated', pct: 70, color: '#ffc107' },
  completed: { label: 'Completed', pct: 100, color: '#198754' },
  cancelled: { label: 'Cancelled', pct: 100, color: '#dc3545' },
};
const sCfg = (s) => STATUS_CFG[s] || { label: s, pct: 10, color: '#6c757d' };

const PACKAGE_COLORS = {
  PLATINUM: '#7b1fa2',
  DIAMOND: '#1565c0',
  GOLD: '#f57f17',
  SILVER: '#455a64',
  BRONZE: '#bf360c',
};

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

const fmtDT = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

// ── Small reusable field components ───────────────────────────
const Field = ({ label, value }) => (
  <div>
    <label className="ed-label">{label}</label>
    <div className="ed-val">{value || '—'}</div>
  </div>
);
const EditInput = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
}) => (
  <div>
    <label className="ed-label">{label}</label>
    <input
      type={type}
      name={name}
      className="ed-input"
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);
const EditSelect = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="ed-label">{label}</label>
    <select
      name={name}
      className="ed-select"
      value={value ?? ''}
      onChange={onChange}
    >
      {options.map((o) => (
        <option
          key={o.value}
          value={o.value}
        >
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

// ══════════════════════════════════════════════════════════════
export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  const [deleting, setDeleting] = useState(false);
  const [showDelConfirm, setShowDelConfirm] = useState(false);

  // ── Venue search state (edit mode) ─────────────────────────
  const [venueMode, setVenueMode] = useState('search'); // "search" | "map"
  const [venueInput, setVenueInput] = useState('');
  const [venueSugs, setVenueSugs] = useState([]);
  const [venueLoading, setVenueLoading] = useState(false);
  const [venueConfirmed, setVenueConfirmed] = useState(null); // full venue object if selected
  const [mapPin, setMapPin] = useState(null);
  const [mapGeoLoading, setMapGeoLoading] = useState(false);
  const venueTimer = useRef(null);
  const cityCoordCache = useRef({});

  // ── Staff allocation ───────────────────────────────────────
  const [showAlloc, setShowAlloc] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSearch, setStaffSearch] = useState('');
  const [selectedCrew, setSelectedCrew] = useState([]);
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignErr, setAssignErr] = useState('');
  const staffTimer = useRef(null);

  // ── Payment ────────────────────────────────────────────────
  const [payAmount, setPayAmount] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payErr, setPayErr] = useState('');
  const [advancePct, setAdvancePct] = useState(null); // from master data

  // ── Toast ──────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
  };

  // ── Fetch event + payment terms ────────────────────────────
  const fetchEvent = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [evRes, ptRes] = await Promise.all([
        getEvent(id),
        getPaymentTerms(),
      ]);
      setEvent(evRes.data.data);
      const pct = ptRes.data.data?.advancePercentage;
      if (pct != null) setAdvancePct(pct);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load event.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // ── City coords helper (for venue search bias) ─────────────
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

  // ── Venue autocomplete ─────────────────────────────────────
  const handleVenueInput = (val) => {
    setVenueInput(val);
    setVenueConfirmed(null);
    clearTimeout(venueTimer.current);
    if (val.length < 3) {
      setVenueSugs([]);
      return;
    }
    setVenueLoading(true);
    venueTimer.current = setTimeout(async () => {
      const cityCoords = draft.city ? await _getCityCoords(draft.city) : null;
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
          service.getPlacePredictions(opts, (preds) => {
            setVenueLoading(false);
            setVenueSugs(
              (preds || []).slice(0, 6).map((p) => ({
                place_id: p.place_id,
                main_text: p.structured_formatting?.main_text || p.description,
                secondary_text: p.structured_formatting?.secondary_text || '',
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

  const _geocodePlaceId = (placeId, venueName) =>
    new Promise((resolve) => {
      new window.google.maps.Geocoder().geocode(
        { placeId },
        (results, status) => {
          if (status === 'OK' && results[0]) {
            const r = results[0];
            let city = '',
              state = '';
            for (const c of r.address_components) {
              if (c.types.includes('locality')) city = c.long_name;
              if (c.types.includes('administrative_area_level_1'))
                state = c.long_name;
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
          } else resolve(null);
        },
      );
    });

  const selectVenueSuggestion = async (sug) => {
    const venue = await _geocodePlaceId(sug.place_id, sug.main_text);
    if (venue) {
      setVenueConfirmed(venue);
      setVenueInput(venue.venue_name);
      setVenueSugs([]);
      // Update draft city/state if empty
      setDraft((p) => ({
        ...p,
        'venue.venue_name': venue.venue_name,
        'venue.formatted_address': venue.formatted_address,
        'venue.google_maps_url': venue.google_maps_url,
        'venue.latitude': venue.latitude,
        'venue.longitude': venue.longitude,
        'venue.place_id': venue.place_id,
        city: p.city || venue._city,
        state: p.state || venue._state,
      }));
    }
  };

  // ── Map click → reverse geocode ───────────────────────────
  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMapPin({ lat, lng });
    setMapGeoLoading(true);
    new window.google.maps.Geocoder().geocode(
      { location: { lat, lng } },
      (results, status) => {
        setMapGeoLoading(false);
        if (status === 'OK' && results[0]) {
          const r = results[0];
          let city = '',
            state = '',
            venueName = '';
          for (const c of r.address_components) {
            if (
              c.types.includes('premise') ||
              c.types.includes('establishment')
            )
              venueName = c.long_name;
            if (c.types.includes('locality')) city = c.long_name;
            if (c.types.includes('administrative_area_level_1'))
              state = c.long_name;
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
          setVenueConfirmed(venue);
          setVenueInput(venueName);
          setDraft((p) => ({
            ...p,
            'venue.venue_name': venue.venue_name,
            'venue.formatted_address': venue.formatted_address,
            'venue.google_maps_url': venue.google_maps_url,
            city: p.city || city,
            state: p.state || state,
          }));
        }
      },
    );
  };

  // ── Edit helpers ───────────────────────────────────────────
  const startEdit = () => {
    // Normalize datetime strings for datetime-local input (needs "T" separator)
    const toInputDT = (v) => (v ? v.slice(0, 16).replace(' ', 'T') : '');
    setDraft({
      event_name: event.event_name,
      event_type: event.event_type || '',
      city: event.city || '',
      state: event.state || '',
      no_of_days: event.no_of_days || 1,
      working_hours: event.working_hours || '',
      crew_count: event.crew_count || 0,
      event_start_datetime: toInputDT(event.event_start_datetime),
      event_end_datetime: toInputDT(event.event_end_datetime),
      'venue.venue_name': event.venue?.venue_name || '',
      'venue.formatted_address': event.venue?.formatted_address || '',
      'venue.google_maps_url': event.venue?.google_maps_url || '',
      'venue.latitude': event.venue?.latitude,
      'venue.longitude': event.venue?.longitude,
      'venue.place_id': event.venue?.place_id || '',
      'payment.total_amount': event.payment?.total_amount || 0,
      'payment.paid_amount': event.payment?.paid_amount || 0,
      'payment.gst_amount': event.payment?.gst_amount || 0,
      'payment.payment_status': event.payment?.payment_status || 'unpaid',
    });
    // Pre-fill venue input with current venue name
    setVenueInput(event.venue?.venue_name || '');
    setVenueConfirmed(
      event.venue
        ? {
            venue_name: event.venue.venue_name,
            formatted_address: event.venue.formatted_address,
            google_maps_url: event.venue.google_maps_url,
          }
        : null,
    );
    setMapPin(null);
    setVenueMode('search');
    setSaveErr('');
    setIsEditing(true);
  };

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraft((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    if (!venueConfirmed && isEditing) {
      setSaveErr('Please select a venue from the search results or map.');
      return;
    }
    setSaving(true);
    setSaveErr('');
    // Normalize datetime: datetime-local inputs may produce "2026-03-26 01:24"
    // but the backend expects ISO format "2026-03-26T01:24"
    const toISO = (v) => (v ? v.trim().replace(' ', 'T') : v);
    try {
      const payload = {
        event_name: draft.event_name,
        event_type: draft.event_type,
        city: draft.city,
        state: draft.state,
        no_of_days: Number(draft.no_of_days),
        working_hours: draft.working_hours ? Number(draft.working_hours) : null,
        crew_count: Number(draft.crew_count),
        event_start_datetime: toISO(draft.event_start_datetime),
        event_end_datetime: toISO(draft.event_end_datetime),
        venue: {
          venue_name: draft['venue.venue_name'],
          formatted_address: draft['venue.formatted_address'],
          google_maps_url: draft['venue.google_maps_url'],
          latitude: draft['venue.latitude'],
          longitude: draft['venue.longitude'],
          place_id: draft['venue.place_id'],
        },
        payment: {
          total_amount: Number(draft['payment.total_amount']),
          paid_amount: Number(draft['payment.paid_amount']),
          gst_amount: Number(draft['payment.gst_amount']),
          payment_status: draft['payment.payment_status'],
        },
      };
      const res = await updateEvent(id, payload);
      setEvent(res.data.data);
      setIsEditing(false);
      showToast('Event updated!');
    } catch (e) {
      setSaveErr(e.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  // ── Status quick-change ────────────────────────────────────
  const handleStatusChange = async (newStatus) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === 'cancelled') {
        const reason = window.prompt('Cancellation reason:');
        if (!reason) return;
        payload.cancelled_reason = reason;
      }
      const res = await updateEventStatus(id, payload);
      setEvent((p) => ({ ...p, status: res.data.data.status }));
      showToast(`Status updated to ${newStatus}`);
    } catch (e) {
      showToast(e.response?.data?.message || 'Status update failed.', 'danger');
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEvent(id);
      navigate('/admin/events', { replace: true });
    } catch (e) {
      showToast(e.response?.data?.message || 'Delete failed.', 'danger');
      setDeleting(false);
    }
  };

  // ── Staff allocation ───────────────────────────────────────
  const fetchAvailableStaff = useCallback(async () => {
    setStaffLoading(true);
    setAssignErr('');
    try {
      const res = await getAvailableStaff(
        id,
        staffSearch ? { search: staffSearch } : {},
      );
      const results = res.data.data.results || [];
      setStaffList(results);
      setSelectedCrew(
        results.filter((s) => s.already_assigned).map((s) => s.profile_id),
      );
    } catch (e) {
      setAssignErr(e.response?.data?.message || 'Failed to load staff.');
    } finally {
      setStaffLoading(false);
    }
  }, [id, staffSearch]);

  const openAlloc = () => {
    setShowAlloc(true);
    fetchAvailableStaff();
  };

  useEffect(() => {
    if (!showAlloc) return;
    clearTimeout(staffTimer.current);
    staffTimer.current = setTimeout(fetchAvailableStaff, 350);
    return () => clearTimeout(staffTimer.current);
  }, [staffSearch, fetchAvailableStaff, showAlloc]);

  const toggleCrew = (profileId) =>
    setSelectedCrew((prev) =>
      prev.includes(profileId)
        ? prev.filter((x) => x !== profileId)
        : [...prev, profileId],
    );

  const handleAssignCrew = async () => {
    setAssignSaving(true);
    setAssignErr('');
    try {
      await assignCrew(id, { crew_member_ids: selectedCrew });
      await fetchEvent();
      setShowAlloc(false);
      showToast(`${selectedCrew.length} staff assigned!`);
    } catch (e) {
      setAssignErr(e.response?.data?.message || 'Assignment failed.');
    } finally {
      setAssignSaving(false);
    }
  };

  // ── Payment — auto-fill advance amount from master % ──────
  const getAdvanceSuggested = () => {
    if (advancePct == null) return null;
    const total = event?.payment?.total_amount || 0;
    if (!total) return null;
    return Math.round((total * advancePct) / 100);
  };

  const handleInitiatePayment = async () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) {
      setPayErr('Enter a valid amount.');
      return;
    }
    setPayLoading(true);
    setPayErr('');
    try {
      const res = await initiatePayment(id, { amount: amt });
      const url = res.data.data.payment_url;
      if (url) window.open(url, '_blank');
      else showToast('Payment initiated — awaiting redirect.');
    } catch (e) {
      setPayErr(e.response?.data?.message || 'Payment initiation failed.');
    } finally {
      setPayLoading(false);
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
          <p className="text-muted small">Loading event…</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="page-content">
        <button
          className="btn btn-light shadow-sm mb-4"
          onClick={() => navigate('/admin/events')}
        >
          <i className="bi bi-arrow-left me-1"></i>Back
        </button>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  if (!event) return null;

  const sc = sCfg(event.status);
  const paid = event.payment?.paid_amount || 0;
  const total = event.payment?.total_amount || 0;
  const balance = total - paid;
  const payPct =
    total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
  const advanceSuggested = getAdvanceSuggested();

  return (
    <>
      <style>{`
        .ed-label { font-size:.7rem;text-transform:uppercase;letter-spacing:.9px;font-weight:700;color:#9aa3af;margin-bottom:4px;display:block; }
        .ed-val   { font-size:.9rem;font-weight:600;color:#2c3249;padding:7px 0;border-bottom:1px solid #f0f2f5;min-height:34px; }
        .ed-input { width:100%;border-radius:8px;border:1.5px solid #e0e3ea;background:#f8f9fc;font-size:.88rem;padding:7px 11px;color:#2c3249;font-weight:600; }
        .ed-input:focus { outline:none;border-color:#435ebe;box-shadow:0 0 0 3px rgba(67,94,190,.12);background:#fff; }
        .ed-select { width:100%;border-radius:8px;border:1.5px solid #e0e3ea;background:#f8f9fc;font-size:.88rem;padding:7px 11px;color:#2c3249;font-weight:600; }
        .ed-card  { background:#fff;border-radius:14px;border:1px solid #eef0f4;box-shadow:0 2px 12px rgba(44,50,73,.06);overflow:hidden;margin-bottom:20px; }
        .ed-card-hd { padding:14px 22px;border-bottom:1px solid #f5f6fa;display:flex;align-items:center;gap:10px; }
        .ed-card-hd h6 { margin:0;font-size:.82rem;font-weight:700;text-transform:uppercase;letter-spacing:.9px;color:#4a5568; }
        .ed-card-bd { padding:22px; }
        .staff-card { border:1.5px solid #eef0f4;border-radius:10px;padding:12px 14px;transition:all .18s;cursor:pointer;background:#fafbff; }
        .staff-card:hover { border-color:#435ebe;background:#f0f4ff; }
        .staff-card.selected { border-color:#435ebe;background:#f0f4ff; }
        .venue-sug { padding:10px 14px;cursor:pointer;border-bottom:1px solid #f5f6fa;font-size:.87rem; }
        .venue-sug:hover { background:#f0f4ff; }
        .venue-sug-main { font-weight:700;color:#2c3249; }
        .venue-sug-sub  { font-size:.75rem;color:#9aa3af; }
        .ev-toast { position:fixed;top:24px;right:24px;z-index:9999;background:#fff;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.13);padding:13px 20px;display:flex;align-items:center;gap:10px;font-size:.86rem;font-weight:600;color:#2c3249;animation:edSlide .3s ease; }
        .ev-toast.success{border-left:4px solid #28a745;} .ev-toast.danger{border-left:4px solid #dc3545;}
        @keyframes edSlide{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}
      `}</style>

      {toast.msg && (
        <div className={`ev-toast ${toast.type}`}>
          <i
            className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-circle-fill text-danger'} fs-5`}
          ></i>
          {toast.msg}
        </div>
      )}

      {/* ── HEADER ──────────────────────────────────────────── */}
      <div className="page-heading">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-light shadow-sm"
              onClick={() => navigate('/admin/events')}
            >
              <i className="bi bi-arrow-left me-1"></i>Events
            </button>
            <div>
              <h3 className="mb-0">{event.event_name}</h3>
              <small className="text-muted">
                #{event.id?.slice(-8)} · {event.event_type}
              </small>
            </div>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            {!isEditing ? (
              <>
                <button
                  className="btn btn-outline-primary"
                  onClick={openAlloc}
                >
                  <i className="bi bi-people me-1"></i>Allocate Staff
                </button>
                <Link
                  to={`/admin/events/${id}/track`}
                  className="btn btn-outline-dark"
                >
                  <i className="bi bi-geo-alt me-1"></i>Track Live
                </Link>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => setShowDelConfirm(true)}
                >
                  <i className="bi bi-trash me-1"></i>Delete
                </button>
                <button
                  className="btn btn-primary px-4"
                  onClick={startEdit}
                >
                  <i className="bi bi-pencil-square me-2"></i>Edit
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-light"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success px-4"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>Save
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="page-content">
        {saveErr && (
          <div className="alert alert-danger py-2 mb-3">
            <i className="bi bi-exclamation-circle me-2"></i>
            {saveErr}
          </div>
        )}

        {/* ── Progress bar ──────────────────────────────────── */}
        <div className="ed-card mb-4">
          <div className="ed-card-bd">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small fw-bold text-muted text-uppercase">
                Workflow
              </span>
              <span
                style={{
                  background: sc.color + '18',
                  color: sc.color,
                  borderRadius: 6,
                  padding: '3px 12px',
                  fontWeight: 700,
                  fontSize: '.78rem',
                }}
              >
                {sc.label}
              </span>
            </div>
            <div
              style={{
                height: 10,
                background: '#f0f2f5',
                borderRadius: 20,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${sc.pct}%`,
                  background: sc.color,
                  height: '100%',
                  borderRadius: 20,
                  transition: 'width .4s',
                }}
              ></div>
            </div>
            <div className="d-flex gap-2 flex-wrap mt-3">
              {Object.entries(STATUS_CFG).map(([k, v]) => (
                <button
                  key={k}
                  className="btn btn-sm"
                  disabled={event.status === k}
                  style={{
                    background: event.status === k ? v.color : v.color + '18',
                    color: event.status === k ? '#fff' : v.color,
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '.75rem',
                  }}
                  onClick={() => handleStatusChange(k)}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* ── LEFT ──────────────────────────────────────────── */}
          <div className="col-lg-8">
            {/* Event info */}
            <div className="ed-card">
              <div className="ed-card-hd">
                <i className="bi bi-calendar-event text-primary"></i>
                <h6>Event Information</h6>
              </div>
              <div className="ed-card-bd">
                <div className="row g-3">
                  {isEditing ? (
                    <>
                      <div className="col-md-6">
                        <EditInput
                          label="Event Name"
                          name="event_name"
                          value={draft.event_name}
                          onChange={handleDraftChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <EditSelect
                          label="Event Type"
                          name="event_type"
                          value={draft.event_type}
                          onChange={handleDraftChange}
                          options={[
                            'Wedding',
                            'Corporate',
                            'Birthday',
                            'Fashion Event',
                            'Other',
                          ].map((t) => ({ value: t, label: t }))}
                        />
                      </div>
                      <div className="col-md-6">
                        <EditInput
                          label="Start Date & Time"
                          name="event_start_datetime"
                          type="datetime-local"
                          value={draft.event_start_datetime}
                          onChange={handleDraftChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <EditInput
                          label="End Date & Time"
                          name="event_end_datetime"
                          type="datetime-local"
                          value={draft.event_end_datetime}
                          onChange={handleDraftChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <EditInput
                          label="No. of Days"
                          name="no_of_days"
                          type="number"
                          value={draft.no_of_days}
                          onChange={handleDraftChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <EditInput
                          label="Working Hours"
                          name="working_hours"
                          type="number"
                          value={draft.working_hours}
                          onChange={handleDraftChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <EditInput
                          label="Crew Count"
                          name="crew_count"
                          type="number"
                          value={draft.crew_count}
                          onChange={handleDraftChange}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-md-6">
                        <Field
                          label="Event Name"
                          value={event.event_name}
                        />
                      </div>
                      <div className="col-md-6">
                        <Field
                          label="Event Type"
                          value={event.event_type}
                        />
                      </div>
                      <div className="col-md-6">
                        <Field
                          label="Start"
                          value={fmtDT(event.event_start_datetime)}
                        />
                      </div>
                      <div className="col-md-6">
                        <Field
                          label="End"
                          value={fmtDT(event.event_end_datetime)}
                        />
                      </div>
                      <div className="col-md-4">
                        <Field
                          label="Days"
                          value={event.no_of_days}
                        />
                      </div>
                      <div className="col-md-4">
                        <Field
                          label="Working Hours"
                          value={
                            event.working_hours
                              ? `${event.working_hours}h`
                              : null
                          }
                        />
                      </div>
                      <div className="col-md-4">
                        <Field
                          label="Crew Count"
                          value={event.crew_count}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Venue */}
            <div className="ed-card">
              <div className="ed-card-hd">
                <i className="bi bi-geo-alt text-primary"></i>
                <h6>Venue & Location</h6>
                {!isEditing && event.venue?.google_maps_url && (
                  <a
                    href={event.venue.google_maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-danger ms-auto"
                  >
                    <i className="bi bi-geo-alt-fill me-1"></i>Open in Maps
                  </a>
                )}
              </div>
              <div className="ed-card-bd">
                {isEditing ? (
                  <div className="row g-3">
                    {/* State + City */}
                    <div className="col-md-6">
                      <label className="ed-label">State *</label>
                      <select
                        name="state"
                        className="ed-select"
                        value={draft.state}
                        onChange={handleDraftChange}
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
                    <div className="col-md-6">
                      <label className="ed-label">City *</label>
                      <input
                        name="city"
                        className="ed-input"
                        value={draft.city}
                        onChange={handleDraftChange}
                        placeholder="e.g. Bengaluru"
                        style={!draft.state ? { opacity: 0.6 } : {}}
                      />
                    </div>

                    {/* Venue search mode toggle */}
                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="ed-label mb-0">
                          Venue / Location *
                        </label>
                        <div className="d-flex gap-1">
                          {['search', 'map'].map((m) => (
                            <button
                              key={m}
                              type="button"
                              style={{
                                fontSize: '.72rem',
                                fontWeight: 700,
                                borderRadius: 6,
                                padding: '4px 12px',
                                background:
                                  venueMode === m ? '#435ebe' : '#f0f2f5',
                                color: venueMode === m ? '#fff' : '#6c757d',
                                border: 'none',
                              }}
                              onClick={() => setVenueMode(m)}
                            >
                              <i
                                className={`bi ${m === 'search' ? 'bi-search' : 'bi-map'} me-1`}
                              ></i>
                              {m === 'search' ? 'Search' : 'Pick on Map'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {venueMode === 'search' ? (
                        <div style={{ position: 'relative' }}>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-0">
                              <i className="bi bi-geo-alt text-primary"></i>
                            </span>
                            <input
                              className="form-control ed-input border-start-0 ps-0"
                              value={venueInput}
                              onChange={(e) => handleVenueInput(e.target.value)}
                              onBlur={() =>
                                setTimeout(() => setVenueSugs([]), 150)
                              }
                              placeholder={
                                draft.city
                                  ? `Search venue in ${draft.city}…`
                                  : 'Search venue or address…'
                              }
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
                          <div style={{ height: 300 }}>
                            <VenuePickMap
                              pin={mapPin}
                              onMapClick={handleMapClick}
                              cityHint={draft.city || 'India'}
                            />
                          </div>
                        </div>
                      )}

                      {/* Confirmed venue chip */}
                      {venueConfirmed && (
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
                            <strong>{venueConfirmed.venue_name}</strong>
                            <div
                              className="text-muted"
                              style={{ fontSize: '.73rem' }}
                            >
                              {venueConfirmed.formatted_address}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm p-0 ms-auto text-muted"
                            style={{ lineHeight: 1 }}
                            onClick={() => {
                              setVenueConfirmed(null);
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
                  </div>
                ) : (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <Field
                        label="Venue"
                        value={event.venue?.venue_name}
                      />
                    </div>
                    <div className="col-md-6">
                      <Field
                        label="City / State"
                        value={`${event.city || ''}${event.state ? ', ' + event.state : ''}`}
                      />
                    </div>
                    <div className="col-12">
                      <Field
                        label="Address"
                        value={event.venue?.formatted_address}
                      />
                    </div>
                    {event.venue?.google_maps_url && (
                      <div className="col-12">
                        <label className="ed-label">Map</label>
                        <a
                          href={event.venue.google_maps_url}
                          target="_blank"
                          rel="noreferrer"
                          className="small text-primary fw-semibold"
                        >
                          <i className="bi bi-box-arrow-up-right me-1"></i>
                          {event.venue.google_maps_url}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Financial */}
            <div className="ed-card">
              <div className="ed-card-hd">
                <i className="bi bi-currency-rupee text-primary"></i>
                <h6>Financial Summary</h6>
              </div>
              <div className="ed-card-bd">
                {/* Payment bar */}
                {!isEditing && total > 0 && (
                  <div
                    className="mb-4 p-3 rounded-3"
                    style={{ background: '#f8f9fc' }}
                  >
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">
                        Paid:{' '}
                        <strong className="text-success">
                          ₹{paid.toLocaleString('en-IN')}
                        </strong>
                      </small>
                      <small className="text-muted">
                        Balance:{' '}
                        <strong className="text-danger">
                          ₹{balance.toLocaleString('en-IN')}
                        </strong>
                      </small>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: '#e0e3ea',
                        borderRadius: 20,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${payPct}%`,
                          background: '#198754',
                          height: '100%',
                          borderRadius: 20,
                          transition: 'width .4s',
                        }}
                      ></div>
                    </div>
                    <small className="text-muted d-block text-end mt-1">
                      {payPct}% paid of ₹{total.toLocaleString('en-IN')}
                    </small>
                  </div>
                )}

                {isEditing ? (
                  <div className="row g-3">
                    <div className="col-md-3">
                      <EditInput
                        label="Total (₹)"
                        name="payment.total_amount"
                        type="number"
                        value={draft['payment.total_amount']}
                        onChange={handleDraftChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <EditInput
                        label="Paid (₹)"
                        name="payment.paid_amount"
                        type="number"
                        value={draft['payment.paid_amount']}
                        onChange={handleDraftChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <EditInput
                        label="GST (₹)"
                        name="payment.gst_amount"
                        type="number"
                        value={draft['payment.gst_amount']}
                        onChange={handleDraftChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <EditSelect
                        label="Pay Status"
                        name="payment.payment_status"
                        value={draft['payment.payment_status']}
                        onChange={handleDraftChange}
                        options={[
                          { value: 'unpaid', label: 'Unpaid' },
                          { value: 'advance', label: 'Advance' },
                          { value: 'paid_fully', label: 'Paid Fully' },
                        ]}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="row g-3">
                    <div className="col-md-3">
                      <Field
                        label="Total"
                        value={`₹${total.toLocaleString('en-IN')}`}
                      />
                    </div>
                    <div className="col-md-3">
                      <Field
                        label="Paid"
                        value={`₹${paid.toLocaleString('en-IN')}`}
                      />
                    </div>
                    <div className="col-md-3">
                      <Field
                        label="Balance"
                        value={`₹${balance.toLocaleString('en-IN')}`}
                      />
                    </div>
                    <div className="col-md-3">
                      <Field
                        label="Status"
                        value={event.payment?.payment_status?.replace('_', ' ')}
                      />
                    </div>
                  </div>
                )}

                {/* Initiate PhonePe payment */}
                {!isEditing &&
                  event.payment?.payment_status !== 'paid_fully' && (
                    <div
                      className="mt-4 p-3 rounded-3"
                      style={{
                        background: '#f0f4ff',
                        border: '1px solid #d0d8f5',
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="small fw-bold text-primary">
                          Initiate PhonePe Payment
                        </div>
                        {advanceSuggested && (
                          <div className="text-end">
                            <small
                              className="text-muted d-block"
                              style={{ fontSize: '.72rem' }}
                            >
                              Advance ({advancePct}% of total):
                            </small>
                            <button
                              className="btn btn-link p-0 fw-bold text-primary"
                              style={{ fontSize: '.82rem', lineHeight: 1.3 }}
                              onClick={() =>
                                setPayAmount(String(advanceSuggested))
                              }
                            >
                              ₹{advanceSuggested.toLocaleString('en-IN')} →
                            </button>
                          </div>
                        )}
                      </div>
                      {advancePct != null && total > 0 && (
                        <div
                          className="mb-2 p-2 rounded-2"
                          style={{
                            background: '#fff',
                            border: '1px solid #e0e8ff',
                            fontSize: '.78rem',
                            color: '#4a5568',
                          }}
                        >
                          <i className="bi bi-info-circle text-primary me-1"></i>
                          Master advance rate: <strong>{advancePct}%</strong> ={' '}
                          <strong>
                            ₹{advanceSuggested?.toLocaleString('en-IN')}
                          </strong>{' '}
                          of ₹{total.toLocaleString('en-IN')}. Click the amount
                          above to pre-fill.
                        </div>
                      )}
                      {payErr && (
                        <div className="alert alert-danger py-1 px-2 mb-2 small">
                          {payErr}
                        </div>
                      )}
                      <div className="d-flex gap-2">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Amount (₹)"
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          style={{ maxWidth: 160 }}
                        />
                        <button
                          className="btn btn-primary px-4"
                          onClick={handleInitiatePayment}
                          disabled={payLoading}
                        >
                          {payLoading ? (
                            <span className="spinner-border spinner-border-sm" />
                          ) : (
                            <>
                              <i className="bi bi-phone me-1"></i>Pay via
                              PhonePe
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Crew members */}
            {event.crew_members?.length > 0 && (
              <div className="ed-card">
                <div className="ed-card-hd">
                  <i className="bi bi-people text-primary"></i>
                  <h6>Assigned Crew ({event.crew_members.length})</h6>
                  <button
                    className="btn btn-sm btn-outline-primary ms-auto"
                    onClick={openAlloc}
                  >
                    <i className="bi bi-pencil me-1"></i>Modify
                  </button>
                </div>
                <div className="ed-card-bd">
                  <div className="row g-2">
                    {event.crew_members.map((m) => (
                      <div
                        className="col-md-6 col-lg-4"
                        key={m.profile_id}
                      >
                        <div
                          className="d-flex align-items-center gap-3 p-3 rounded-3"
                          style={{
                            background: '#f8f9fc',
                            border: '1px solid #eef0f4',
                          }}
                        >
                          {m.profile_picture ? (
                            <img
                              src={m.profile_picture}
                              alt={m.full_name}
                              className="rounded-circle"
                              width={42}
                              height={42}
                              style={{ objectFit: 'cover', flexShrink: 0 }}
                            />
                          ) : (
                            <div
                              className="rounded-circle bg-light d-flex align-items-center justify-content-center fw-bold"
                              style={{
                                width: 42,
                                height: 42,
                                flexShrink: 0,
                                color: PACKAGE_COLORS[m.package] || '#6c757d',
                              }}
                            >
                              {(m.full_name || '?')[0]}
                            </div>
                          )}
                          <div>
                            <div
                              className="fw-bold"
                              style={{ fontSize: '.88rem' }}
                            >
                              {m.full_name}
                            </div>
                            <div
                              style={{ fontSize: '.75rem', color: '#9aa3af' }}
                            >
                              {m.stage_name || m.city}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: sidebar ──────────────────────────────── */}
          <div className="col-lg-4">
            {/* Client */}
            <div className="ed-card">
              <div className="ed-card-hd">
                <i className="bi bi-person text-primary"></i>
                <h6>Client</h6>
              </div>
              <div className="ed-card-bd">
                <div
                  className="fw-bold"
                  style={{ fontSize: '1rem' }}
                >
                  {event.client?.full_name || '—'}
                </div>
                {event.client?.email && (
                  <div className="text-muted small mt-1">
                    {event.client.email}
                  </div>
                )}
                {event.client?.phone_number && (
                  <div className="text-muted small">
                    {event.client.phone_number}
                  </div>
                )}
                {event.client?.profile_id && (
                  <button
                    className="btn btn-light btn-sm mt-3 w-100"
                    onClick={() =>
                      navigate(`/admin/clients/${event.client.profile_id}`)
                    }
                  >
                    View Full Profile
                  </button>
                )}
              </div>
            </div>

            {/* Master data */}
            <div className="ed-card">
              <div className="ed-card-hd">
                <i className="bi bi-grid text-primary"></i>
                <h6>Master Data</h6>
              </div>
              <div className="ed-card-bd">
                <div className="row g-3">
                  <div className="col-12">
                    <Field
                      label="Theme"
                      value={event.theme?.theme_name}
                    />
                  </div>
                  <div className="col-12">
                    <Field
                      label="Uniform"
                      value={event.uniform?.category_name}
                    />
                  </div>
                  <div className="col-12">
                    <label className="ed-label">Package</label>
                    <div className="ed-val">
                      {event.package ? (
                        <span
                          style={{
                            background:
                              (PACKAGE_COLORS[event.package.name] ||
                                '#6c757d') + '18',
                            color:
                              PACKAGE_COLORS[event.package.name] || '#6c757d',
                            borderRadius: 6,
                            padding: '3px 12px',
                            fontWeight: 700,
                            fontSize: '.8rem',
                          }}
                        >
                          {event.package.name}
                        </span>
                      ) : (
                        '—'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* GST */}
            {event.gst_details?.gst_number && (
              <div className="ed-card">
                <div className="ed-card-hd">
                  <i className="bi bi-receipt text-primary"></i>
                  <h6>GST Details</h6>
                </div>
                <div className="ed-card-bd">
                  <div className="row g-3">
                    <div className="col-12">
                      <Field
                        label="Company"
                        value={event.gst_details.company_name}
                      />
                    </div>
                    <div className="col-12">
                      <Field
                        label="GST Number"
                        value={event.gst_details.gst_number}
                      />
                    </div>
                    <div className="col-12">
                      <Field
                        label="Address"
                        value={event.gst_details.address}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="ed-card">
              <div className="ed-card-hd">
                <i className="bi bi-lightning text-primary"></i>
                <h6>Quick Actions</h6>
              </div>
              <div className="ed-card-bd d-flex flex-column gap-2">
                <button
                  className="btn btn-outline-primary w-100"
                  onClick={openAlloc}
                >
                  <i className="bi bi-people me-2"></i>Allocate Staff
                </button>
                <Link
                  to={`/admin/events/${id}/track`}
                  className="btn btn-outline-dark w-100"
                >
                  <i className="bi bi-geo-alt me-2"></i>Track Live Event
                </Link>
                <button
                  className="btn btn-outline-danger w-100"
                  onClick={() => setShowDelConfirm(true)}
                >
                  <i className="bi bi-trash me-2"></i>Delete Event
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ STAFF ALLOCATION MODAL ══════════════ */}
      {showAlloc && (
        <div
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,.55)', zIndex: 1055 }}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: 16 }}
            >
              <div className="modal-header border-0 px-4 pt-4 pb-2">
                <div>
                  <h5 className="fw-bold mb-0">Allocate Staff</h5>
                  <p className="text-muted small mb-0">
                    Only staff with no scheduling conflicts are shown.
                    <strong className="text-primary">
                      {' '}
                      {selectedCrew.length} selected.
                    </strong>
                  </p>
                </div>
                <button
                  className="btn-close"
                  onClick={() => setShowAlloc(false)}
                ></button>
              </div>
              <div className="modal-body px-4 py-3">
                {assignErr && (
                  <div className="alert alert-danger py-2 mb-3">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {assignErr}
                  </div>
                )}
                <div className="mb-3">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-0">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      className="form-control border-start-0 ps-0"
                      placeholder="Search by name or stage name…"
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                    />
                    {staffSearch && (
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setStaffSearch('')}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    )}
                  </div>
                </div>
                {staffLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" />
                    <p className="text-muted mt-3 small">
                      Finding available staff…
                    </p>
                  </div>
                ) : staffList.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-people fs-1 d-block mb-2"></i>No
                    available staff found.
                  </div>
                ) : (
                  <div className="row g-3">
                    {staffList.map((s) => {
                      const isSelected = selectedCrew.includes(s.profile_id);
                      const pkgColor =
                        PACKAGE_COLORS[s.package?.toUpperCase()] || '#6c757d';
                      return (
                        <div
                          className="col-md-6 col-lg-4"
                          key={s.profile_id}
                        >
                          <div
                            className={`staff-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleCrew(s.profile_id)}
                          >
                            <div className="d-flex align-items-center gap-3">
                              {s.profile_picture ? (
                                <img
                                  src={s.profile_picture}
                                  alt={s.full_name}
                                  className="rounded-circle"
                                  width={46}
                                  height={46}
                                  style={{ objectFit: 'cover', flexShrink: 0 }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                                  style={{
                                    width: 46,
                                    height: 46,
                                    background: pkgColor,
                                    flexShrink: 0,
                                    fontSize: '.9rem',
                                  }}
                                >
                                  {(s.full_name || '?')[0]}
                                </div>
                              )}
                              <div className="flex-grow-1 min-w-0">
                                <div
                                  className="fw-bold text-truncate"
                                  style={{ fontSize: '.88rem' }}
                                >
                                  {s.full_name}
                                </div>
                                {s.stage_name && (
                                  <div
                                    className="text-muted"
                                    style={{ fontSize: '.75rem' }}
                                  >
                                    {s.stage_name}
                                  </div>
                                )}
                                <div className="d-flex gap-1 mt-1 flex-wrap">
                                  <span
                                    style={{
                                      background: pkgColor + '18',
                                      color: pkgColor,
                                      borderRadius: 4,
                                      padding: '2px 7px',
                                      fontSize: '.7rem',
                                      fontWeight: 700,
                                    }}
                                  >
                                    {s.package || '—'}
                                  </span>
                                  {s.city && (
                                    <span
                                      className="badge bg-light text-muted border"
                                      style={{ fontSize: '.7rem' }}
                                    >
                                      {s.city}
                                    </span>
                                  )}
                                  {s.price_of_staff > 0 && (
                                    <span
                                      className="badge bg-light text-dark border"
                                      style={{ fontSize: '.7rem' }}
                                    >
                                      ₹{s.price_of_staff}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {isSelected ? (
                                  <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                      width: 28,
                                      height: 28,
                                      background: '#435ebe',
                                      color: '#fff',
                                    }}
                                  >
                                    <i
                                      className="bi bi-check-lg"
                                      style={{ fontSize: '.85rem' }}
                                    ></i>
                                  </div>
                                ) : (
                                  <div
                                    className="rounded-circle border-2 border"
                                    style={{ width: 28, height: 28 }}
                                  ></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 px-4 pb-4 pt-2">
                <button
                  className="btn btn-light px-4"
                  onClick={() => setShowAlloc(false)}
                  disabled={assignSaving}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary px-5"
                  onClick={handleAssignCrew}
                  disabled={assignSaving}
                >
                  {assignSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>Assign{' '}
                      {selectedCrew.length} Staff
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ────────────────────────────────── */}
      {showDelConfirm && (
        <div
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,.5)', zIndex: 1055 }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: 420 }}
          >
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: 14 }}
            >
              <div className="modal-body p-4 text-center">
                <div
                  className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: 64, height: 64 }}
                >
                  <i className="bi bi-trash text-danger fs-3"></i>
                </div>
                <h5 className="fw-bold mb-1">Delete Event?</h5>
                <p
                  className="text-muted mb-0"
                  style={{ fontSize: '.9rem' }}
                >
                  Permanently delete <strong>{event.event_name}</strong>. Cannot
                  be undone.
                </p>
              </div>
              <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex gap-2">
                <button
                  className="btn btn-light flex-fill"
                  onClick={() => setShowDelConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger flex-fill"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Deleting…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-2"></i>Delete
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

// ── VenuePickMap (same as Events.jsx) ─────────────────────────
function VenuePickMap({ pin, onMapClick, cityHint }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const listenerRef = useRef(null);

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

  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;
    if (listenerRef.current)
      window.google.maps.event.removeListener(listenerRef.current);
    listenerRef.current = mapInstanceRef.current.addListener(
      'click',
      onMapClick,
    );
  }, [onMapClick]);

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
