// src/pages/user_management/Clients.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { listClients, createClient, deleteClient } from '../../api/clientApi';

const PLAN_CONFIG = {
  PLATINUM: { label: 'Platinum', color: '#8E24AA', textColor: '#fff' },
  DIAMOND: { label: 'Diamond', color: '#1E88E5', textColor: '#fff' },
  GOLD: { label: 'Gold', color: '#D4AF37', textColor: '#000' },
  SILVER: { label: 'Silver', color: '#B0BEC5', textColor: '#000' },
  BRONZE: { label: 'Bronze', color: '#CD7F32', textColor: '#fff' },
};

const STATUS_BADGE = {
  ACTIVE: 'success',
  INACTIVE: 'secondary',
  BLOCKED: 'danger',
};

const EMPTY_FORM = {
  full_name: '',
  email: '',
  phone_number: '',
  state: '',
  city: '',
  country: 'India',
  subscription_plan: 'SILVER',
};

// ── Google Maps loader (singleton) ────────────────────────────
let googleMapsPromise = null;
function loadGoogleMaps() {
  if (googleMapsPromise) return googleMapsPromise;
  googleMapsPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve(window.google.maps);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return googleMapsPromise;
}

export default function Clients() {
  const navigate = useNavigate();

  // ── Data state ─────────────────────────────────────────────
  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 1,
  });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Filter state ───────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  // ── Add Client modal state ─────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Delete state ───────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [toast, setToast] = useState('');

  // ── State/City Google Places state ────────────────────────
  const [stateSuggestions, setStateSuggestions] = useState([]);
  const [showStateSug, setShowStateSug] = useState(false);
  const [citiesForState, setCitiesForState] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const stateDebounceRef = useRef(null);

  // ── Fetch clients ──────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, page_size: 10 };
      if (search) params.search = search;
      if (city) params.city = city;
      if (planFilter) params.plan_type = planFilter;
      if (status) params.status = status;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await listClients(params);
      const data = res.data.data;

      setClients(data.results || []);
      setPagination(data.pagination || {});

      if (
        !city &&
        !search &&
        !planFilter &&
        !status &&
        !startDate &&
        !endDate
      ) {
        const uniqueCities = [
          ...new Set((data.results || []).map((c) => c.city).filter(Boolean)),
        ].sort();
        if (uniqueCities.length > 0) setCities(uniqueCities);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load clients.');
    } finally {
      setLoading(false);
    }
  }, [search, city, planFilter, status, startDate, endDate, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchClients();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    fetchClients();
  }, [city, planFilter, status, startDate, endDate, page]);

  // ── State autocomplete ─────────────────────────────────────
  const handleStateInput = (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, state: val, city: '' }));
    setCitiesForState([]);

    clearTimeout(stateDebounceRef.current);
    if (val.length < 2) {
      setStateSuggestions([]);
      setShowStateSug(false);
      return;
    }

    stateDebounceRef.current = setTimeout(() => {
      loadGoogleMaps().then((maps) => {
        const service = new maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input: val,
            types: ['administrative_area_level_1'],
            componentRestrictions: { country: 'in' },
          },
          (predictions, status) => {
            if (status === maps.places.PlacesServiceStatus.OK && predictions) {
              setStateSuggestions(
                predictions.map((p) => ({
                  placeId: p.place_id,
                  mainText: p.structured_formatting.main_text,
                })),
              );
              setShowStateSug(true);
            } else {
              setStateSuggestions([]);
              setShowStateSug(false);
            }
          },
        );
      });
    }, 300);
  };

  const selectState = (suggestion) => {
    setForm((prev) => ({ ...prev, state: suggestion.mainText, city: '' }));
    setShowStateSug(false);
    setStateSuggestions([]);
    // Fetch cities for the selected state
    setLoadingCities(true);
    setCitiesForState([]);
    loadGoogleMaps().then((maps) => {
      const service = new maps.places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: suggestion.mainText,
          types: ['(cities)'],
          componentRestrictions: { country: 'in' },
        },
        (predictions, status) => {
          setLoadingCities(false);
          if (status === maps.places.PlacesServiceStatus.OK && predictions) {
            const cityNames = predictions
              .map((p) => p.structured_formatting.main_text)
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .slice(0, 25);
            setCitiesForState(cityNames);
          }
        },
      );
    });
  };

  // ── Form handlers ──────────────────────────────────────────
  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!form.full_name.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Invalid email address';
    if (!form.phone_number.trim()) return 'Phone number is required';
    if (!/^\d{10}$/.test(form.phone_number)) return 'Phone must be 10 digits';
    return null;
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }
    setSubmitting(true);
    try {
      await createClient(form);
      setFormSuccess('Client created successfully!');
      setForm(EMPTY_FORM);
      setCitiesForState([]);
      fetchClients();
      setTimeout(() => {
        setFormSuccess('');
        document.getElementById('addClientModalClose')?.click();
      }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create client.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setFormError('');
    setFormSuccess('');
    setForm(EMPTY_FORM);
    setCitiesForState([]);
    setStateSuggestions([]);
    setShowStateSug(false);
  };

  // ── Delete handlers ────────────────────────────────────────
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const confirmDelete = (client) => {
    setDeleteTarget({ id: client.id, name: client.full_name });
    setDeleteError('');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteClient(deleteTarget.id);
      setDeleteTarget(null);
      fetchClients();
      showToast(`${deleteTarget.name} has been deleted.`);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete client.');
    } finally {
      setDeleting(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCity('');
    setPlanFilter('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const hasFilters =
    search || city || planFilter || status || startDate || endDate;

  return (
    <>
      <style>{`
        .nuvo-input { background-color: #f8f9fa !important; border: 1px solid #f8f9fa !important; }
        .nuvo-input:focus { border-color: #435ebe !important; box-shadow: 0 0 0 0.2rem rgba(67,94,190,0.15) !important; background-color: #fff !important; }
        .section-title { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 1.2px; color: #aaa; font-weight: 700; display: flex; align-items: center; margin-bottom: 14px; }
        .section-title::after { content: ""; flex: 1; height: 1px; background: #f0f0f0; margin-left: 10px; }
        .state-suggestions { position: absolute; top: calc(100% + 2px); left: 0; right: 0; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); z-index: 1055; max-height: 200px; overflow-y: auto; }
        .state-suggestion-item { padding: 9px 14px; cursor: pointer; font-size: 0.88rem; transition: background 0.12s; }
        .state-suggestion-item:hover { background: #f0f4ff; color: #435ebe; }
        .state-suggestion-item + .state-suggestion-item { border-top: 1px solid #f5f5f5; }
        .cl-toast { position:fixed; top:24px; right:24px; z-index:9999; background:#fff; border-left:4px solid #28a745; border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,.13); padding:13px 20px; display:flex; align-items:center; gap:10px; font-size:.86rem; font-weight:600; color:#2c3249; animation:clSlide .3s ease; }
        @keyframes clSlide { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
      `}</style>

      {toast && (
        <div className="cl-toast">
          <i className="bi bi-check-circle-fill text-success fs-5"></i>
          {toast}
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="page-heading">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h3>Client Management</h3>
            <p className="text-muted mb-0">
              Manage client accounts, bookings, and subscriptions.
              {!loading && (
                <span className="ms-2 fw-bold text-dark">
                  {pagination.total} total
                </span>
              )}
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-success">
              <i className="bi bi-file-earmark-excel"></i> Export Excel
            </button>
            <button
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#addClientModal"
            >
              <i className="bi bi-person-plus me-1"></i> Add Client
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* FILTERS */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="small fw-bold">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name or Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="small fw-bold">City</label>
                <select
                  className="form-select"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Cities</option>
                  {cities.map((c) => (
                    <option
                      key={c}
                      value={c}
                    >
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="small fw-bold">Plan</label>
                <select
                  className="form-select"
                  value={planFilter}
                  onChange={(e) => {
                    setPlanFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Plans</option>
                  <option value="PLATINUM">Platinum</option>
                  <option value="DIAMOND">Diamond</option>
                  <option value="GOLD">Gold</option>
                  <option value="SILVER">Silver</option>
                  <option value="BRONZE">Bronze</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="small fw-bold">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="small fw-bold">From</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="col-md-1">
                <label className="small fw-bold">To</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              {hasFilters && (
                <div className="col-auto">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={resetFilters}
                  >
                    <i className="bi bi-x-circle me-1"></i> Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card shadow-sm">
          <div className="card-body">
            {error && <div className="alert alert-danger py-2">{error}</div>}

            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                />
                <p className="text-muted mt-3">Loading clients...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-people fs-1 d-block mb-2"></i>
                No clients found.{' '}
                {hasFilters && (
                  <span
                    className="text-primary"
                    style={{ cursor: 'pointer' }}
                    onClick={resetFilters}
                  >
                    Clear filters
                  </span>
                )}
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Client</th>
                        <th>Phone</th>
                        <th>City</th>
                        <th>Joined</th>
                        <th>Plan</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((client) => {
                        const plan =
                          PLAN_CONFIG[
                            client.subscription_plan?.toUpperCase()
                          ] || PLAN_CONFIG.SILVER;
                        const statusKey = client.status?.toUpperCase();
                        return (
                          <tr key={client.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                                  style={{
                                    width: 40,
                                    height: 40,
                                    flexShrink: 0,
                                    background: '#435ebe',
                                    fontSize: 14,
                                  }}
                                >
                                  {(client.full_name || '?')[0].toUpperCase()}
                                </div>
                                <div>
                                  <div className="fw-bold text-primary">
                                    {client.full_name}
                                  </div>
                                  <small className="text-muted">
                                    {client.email}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>{client.phone_number || '—'}</td>
                            <td>{client.city || '—'}</td>
                            <td>
                              {client.joined_date
                                ? new Date(
                                    client.joined_date,
                                  ).toLocaleDateString('en-IN')
                                : '—'}
                            </td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: plan.color,
                                  color: plan.textColor,
                                }}
                              >
                                {plan.label}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`badge bg-${STATUS_BADGE[statusKey] || 'secondary'}`}
                              >
                                {client.status}
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="d-flex gap-1 justify-content-end">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() =>
                                    navigate(`/admin/clients/${client.id}`)
                                  }
                                >
                                  <i className="bi bi-eye me-1"></i> View
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => confirmDelete(client)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#deleteClientModal"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <nav className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                  <small className="text-muted">
                    Showing {(pagination.page - 1) * pagination.page_size + 1}–
                    {Math.min(
                      pagination.page * pagination.page_size,
                      pagination.total,
                    )}{' '}
                    of {pagination.total} clients
                  </small>
                  <ul className="pagination pagination-primary mb-0">
                    <li
                      className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setPage((p) => p - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(pagination.total_pages)].map((_, i) => (
                      <li
                        key={i}
                        className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setPage(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li
                      className={`page-item ${pagination.page === pagination.total_pages ? 'disabled' : ''}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── ADD CLIENT MODAL ─────────────────────────────────── */}
      <div
        className="modal fade"
        id="addClientModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div
            className="modal-content shadow-lg"
            style={{ borderRadius: 14 }}
          >
            <div className="modal-header border-0 p-4 pb-0">
              <h5 className="fw-bold">Register New Client</h5>
              <button
                id="addClientModalClose"
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                onClick={closeModal}
              />
            </div>

            <div className="modal-body p-4">
              {formError && (
                <div className="alert alert-danger  py-2 mb-3">{formError}</div>
              )}
              {formSuccess && (
                <div className="alert alert-success py-2 mb-3">
                  {formSuccess}
                </div>
              )}

              <form
                id="addClientForm"
                onSubmit={handleAddClient}
              >
                {/* ── Account Details ── */}
                <div className="section-title">Account Details</div>
                <div className="row g-3 mb-2">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">
                      Full Name *
                    </label>
                    <input
                      name="full_name"
                      type="text"
                      className="form-control nuvo-input"
                      placeholder="Enter full name"
                      value={form.full_name}
                      onChange={handleFormChange}
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Email *</label>
                    <input
                      name="email"
                      type="email"
                      className="form-control nuvo-input"
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={handleFormChange}
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Phone *</label>
                    <input
                      name="phone_number"
                      type="tel"
                      className="form-control nuvo-input"
                      placeholder="10-digit number"
                      value={form.phone_number}
                      onChange={handleFormChange}
                      maxLength={10}
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* ── Location ── */}
                <div className="section-title mt-3">Location</div>
                <div className="row g-3 mb-2">
                  {/* State — autocomplete */}
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">State</label>
                    <div className="position-relative">
                      <input
                        type="text"
                        className="form-control nuvo-input"
                        placeholder="Search state..."
                        value={form.state}
                        onChange={handleStateInput}
                        onFocus={() =>
                          stateSuggestions.length > 0 && setShowStateSug(true)
                        }
                        onBlur={() =>
                          setTimeout(() => setShowStateSug(false), 180)
                        }
                        disabled={submitting}
                        autoComplete="off"
                      />
                      {showStateSug && stateSuggestions.length > 0 && (
                        <div className="state-suggestions">
                          {stateSuggestions.map((s) => (
                            <div
                              key={s.placeId}
                              className="state-suggestion-item"
                              onMouseDown={() => selectState(s)}
                            >
                              <i className="bi bi-geo-alt me-2 text-muted"></i>
                              {s.mainText}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <small
                      className="text-muted"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Type to search Indian states
                    </small>
                  </div>

                  {/* City — populated after state selected */}
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">City</label>
                    {loadingCities ? (
                      <div
                        className="form-control nuvo-input d-flex align-items-center gap-2 text-muted"
                        style={{ height: 38 }}
                      >
                        <span className="spinner-border spinner-border-sm"></span>
                        <span style={{ fontSize: '0.85rem' }}>
                          Loading cities...
                        </span>
                      </div>
                    ) : citiesForState.length > 0 ? (
                      <select
                        name="city"
                        className="form-select nuvo-input"
                        value={form.city}
                        onChange={handleFormChange}
                        disabled={submitting}
                      >
                        <option value="">— Select city —</option>
                        {citiesForState.map((c) => (
                          <option
                            key={c}
                            value={c}
                          >
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        name="city"
                        type="text"
                        className="form-control nuvo-input"
                        placeholder={
                          form.state
                            ? 'Enter city name'
                            : 'Select a state first'
                        }
                        value={form.city}
                        onChange={handleFormChange}
                        disabled={submitting || !form.state}
                      />
                    )}
                    <small
                      className="text-muted"
                      style={{ fontSize: '0.75rem' }}
                    >
                      {loadingCities
                        ? ''
                        : citiesForState.length > 0
                          ? `Cities in ${form.state}`
                          : form.state
                            ? 'No suggestions — type manually'
                            : ''}
                    </small>
                  </div>
                </div>

                {/* ── Subscription Plan ── */}
                <div className="section-title mt-3">Subscription Plan</div>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">
                      Select Plan
                    </label>
                    <select
                      name="subscription_plan"
                      className="form-select nuvo-input"
                      value={form.subscription_plan}
                      onChange={handleFormChange}
                      disabled={submitting}
                    >
                      <option value="SILVER">Silver</option>
                      <option value="BRONZE">Bronze</option>
                      <option value="GOLD">Gold</option>
                      <option value="PLATINUM">Platinum</option>
                      <option value="DIAMOND">Diamond</option>
                    </select>
                  </div>
                  <div className="col-md-6 d-flex align-items-end pb-1">
                    {PLAN_CONFIG[form.subscription_plan] && (
                      <span
                        className="badge fs-6 px-3 py-2"
                        style={{
                          backgroundColor:
                            PLAN_CONFIG[form.subscription_plan].color,
                          color: PLAN_CONFIG[form.subscription_plan].textColor,
                        }}
                      >
                        {PLAN_CONFIG[form.subscription_plan].label} Plan
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer border-0 p-4 pt-0">
              <button
                className="btn btn-light"
                data-bs-dismiss="modal"
                onClick={closeModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="addClientForm"
                className="btn btn-primary px-4"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creating...
                  </>
                ) : (
                  'Register Client'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRM MODAL ─────────────────────────────── */}
      <div
        className="modal fade"
        id="deleteClientModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ maxWidth: 420 }}
        >
          <div
            className="modal-content shadow-lg"
            style={{ borderRadius: 14 }}
          >
            <div className="modal-body p-4 text-center">
              <div
                className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 64, height: 64 }}
              >
                <i className="bi bi-trash text-danger fs-3"></i>
              </div>
              <h5 className="fw-bold mb-1">Delete Client?</h5>
              <p
                className="text-muted mb-0"
                style={{ fontSize: '.9rem' }}
              >
                You are about to permanently delete{' '}
                <strong>{deleteTarget?.name}</strong>. This action cannot be
                undone.
              </p>
              {deleteError && (
                <div className="alert alert-danger py-2 mt-3 mb-0">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {deleteError}
                </div>
              )}
            </div>
            <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex gap-2">
              <button
                className="btn btn-light flex-fill"
                data-bs-dismiss="modal"
                onClick={() => setDeleteTarget(null)}
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
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-trash me-2"></i>Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
