// src/pages/user_management/MakeupArtist.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { listMuas, createMua } from "../../api/muaApi";

// ── Constants ──────────────────────────────────────────────────
const STATUS_CONFIG = {
  ACTIVE: { label: "Active", badge: "success" },
  ONEVENT: { label: "On Event", badge: "warning" },
  INACTIVE: { label: "Inactive", badge: "secondary" },
  BLOCKED: { label: "Blocked", badge: "danger" },
};

const SPECIALITIES = [
  "Bridal",
  "HD Makeup",
  "Airbrush",
  "Editorial",
  "Special FX",
  "Theatrical",
  "Fashion",
  "Film & TV",
  "Other",
];

const GENDERS = ["Female", "Male", "Other"];

const initials = (name) =>
  (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// ── Debounce hook ──────────────────────────────────────────────
function useDebounce(value, delay = 400) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// ══════════════════════════════════════════════════════════════
export default function MakeupArtist() {
  const navigate = useNavigate();

  // ── Filters ────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [expFilter, setExpFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  // ── Data ───────────────────────────────────────────────────
  const [muas, setMuas] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Delete (from row) ──────────────────────────────────────
  const [deletingId, setDeletingId] = useState(null);

  // ── Add MUA modal ─────────────────────────────────────────
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const closeModalRef = useRef(null);
  const EMPTY_FORM = {
    full_name: "",
    email: "",
    phone_number: "",
    gender: "",
    makeup_speciality: "",
    city: "",
    state: "",
    country: "",
    experience_in_years: "",
  };
  const [form, setForm] = useState(EMPTY_FORM);

  // ── Toast ──────────────────────────────────────────────────
  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const debouncedSearch = useDebounce(search);

  // ── Fetch ──────────────────────────────────────────────────
  const fetchMuas = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (debouncedSearch) params.search = debouncedSearch;
      if (cityFilter) params.city = cityFilter;
      if (expFilter) params.experience = expFilter;
      if (statusFilter) params.status = statusFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await listMuas(params);
      setMuas(res.data.data.results);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load makeup artists.");
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    cityFilter,
    expFilter,
    statusFilter,
    startDate,
    endDate,
    page,
  ]);

  useEffect(() => {
    fetchMuas();
  }, [fetchMuas]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    cityFilter,
    expFilter,
    statusFilter,
    startDate,
    endDate,
  ]);

  // ── Add MUA ────────────────────────────────────────────────
  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreate = async () => {
    if (
      !form.full_name.trim() ||
      !form.email.trim() ||
      !form.phone_number.trim()
    ) {
      setAddError("Full name, email, and phone number are required.");
      return;
    }
    setAdding(true);
    setAddError("");
    try {
      await createMua({
        ...form,
        experience_in_years:
          form.experience_in_years !== ""
            ? Number(form.experience_in_years)
            : 0,
      });
      closeModalRef.current?.click();
      setForm(EMPTY_FORM);
      showToast("Makeup artist created successfully!");
      fetchMuas();
    } catch (err) {
      setAddError(
        err.response?.data?.message || "Failed to create makeup artist.",
      );
    } finally {
      setAdding(false);
    }
  };

  const statusCfg = (s) =>
    STATUS_CONFIG[s?.toUpperCase()] || { label: s || "—", badge: "secondary" };

  return (
    <>
      <style>{`
        .mua-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: .9rem; font-weight: 800; color: #fff; flex-shrink: 0;
          background: linear-gradient(135deg, #e91e8c, #9c27b0);
        }
        .mua-filter-card { background:#fff; border-radius:12px; border:1px solid #eef0f4; box-shadow:0 2px 10px rgba(44,50,73,.05); padding:18px 22px; margin-bottom:20px; }
        .mua-table-card  { background:#fff; border-radius:12px; border:1px solid #eef0f4; box-shadow:0 2px 10px rgba(44,50,73,.05); overflow:hidden; }
        .mua-table th    { font-size:.72rem; text-transform:uppercase; letter-spacing:.8px; color:#9aa3af; font-weight:700; border-bottom:2px solid #f0f2f5; padding:12px 16px; }
        .mua-table td    { padding:13px 16px; vertical-align:middle; border-bottom:1px solid #f8f9fc; font-size:.88rem; }
        .mua-table tbody tr:hover { background:#fafbff; cursor:pointer; }
        .mua-input { background:#f8f9fc!important; border:1.5px solid #eef0f4!important; border-radius:8px!important; font-size:.85rem!important; }
        .mua-input:focus { border-color:#e91e8c!important; box-shadow:0 0 0 3px rgba(233,30,140,.1)!important; background:#fff!important; }
        .mua-speciality-badge { background:#fce4f0; color:#c2185b; border-radius:6px; padding:3px 10px; font-size:.75rem; font-weight:700; }
        .mua-toast { position:fixed; top:24px; right:24px; z-index:9999; background:#fff; border-left:4px solid #28a745; border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,.13); padding:13px 20px; display:flex; align-items:center; gap:10px; font-size:.86rem; font-weight:600; color:#2c3249; animation:muaSlide .3s ease; }
        @keyframes muaSlide { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
        .nuvo-modal-input { background:#f8f9fc!important; border:1.5px solid #eef0f4!important; border-radius:8px!important; font-size:.88rem!important; padding:8px 12px!important; }
        .nuvo-modal-input:focus { border-color:#e91e8c!important; box-shadow:0 0 0 3px rgba(233,30,140,.1)!important; background:#fff!important; }
        .nuvo-section-rule { font-size:.68rem; text-transform:uppercase; letter-spacing:1px; color:#c5cadb; font-weight:700; display:flex; align-items:center; gap:8px; margin:16px 0 12px; }
        .nuvo-section-rule::after { content:""; flex:1; height:1px; background:#f0f2f5; }
      `}</style>

      {toast && (
        <div className="mua-toast">
          <i className="bi bi-check-circle-fill text-success fs-5"></i>
          {toast}
        </div>
      )}

      {/* ── HEADING ─────────────────────────────────────────── */}
      <div className="page-heading">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h3>Makeup Artist Management</h3>
            <p className="text-muted mb-0">
              Manage profiles and portfolios for all MUAs.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#addMuaModal"
            >
              <i className="bi bi-person-plus me-1"></i>Add MUA
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* ── FILTERS ─────────────────────────────────────────── */}
        <div className="mua-filter-card">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="small fw-bold text-muted mb-1">
                Search Artist
              </label>
              <div className="input-group">
                <span
                  className="input-group-text bg-transparent border-end-0"
                  style={{
                    background: "#f8f9fc",
                    border: "1.5px solid #eef0f4",
                    borderRight: "none",
                    borderRadius: "8px 0 0 8px",
                  }}
                >
                  <i
                    className="bi bi-search text-muted"
                    style={{ fontSize: ".8rem" }}
                  ></i>
                </span>
                <input
                  type="text"
                  className="form-control mua-input"
                  style={{ borderLeft: "none", borderRadius: "0 8px 8px 0" }}
                  placeholder="Name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-2">
              <label className="small fw-bold text-muted mb-1">City</label>
              <input
                type="text"
                className="form-control mua-input"
                placeholder="All cities"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="small fw-bold text-muted mb-1">
                Min Experience
              </label>
              <select
                className="form-select mua-input"
                value={expFilter}
                onChange={(e) => setExpFilter(e.target.value)}
              >
                <option value="">Any</option>
                <option value="1">1+ Years</option>
                <option value="3">3+ Years</option>
                <option value="5">5+ Years</option>
                <option value="8">8+ Years</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="small fw-bold text-muted mb-1">Status</label>
              <select
                className="form-select mua-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
            <div className="col-md-1-5 col-md">
              <label className="small fw-bold text-muted mb-1">From</label>
              <input
                type="date"
                className="form-control mua-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-1-5 col-md">
              <label className="small fw-bold text-muted mb-1">To</label>
              <input
                type="date"
                className="form-control mua-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Active filter chips */}
          {(search ||
            cityFilter ||
            expFilter ||
            statusFilter ||
            startDate ||
            endDate) && (
            <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top">
              {search && (
                <span className="badge bg-light text-dark border px-3 py-2">
                  Search: {search}{" "}
                  <button
                    className="btn-close btn-close-sm ms-1"
                    style={{ fontSize: ".5rem" }}
                    onClick={() => setSearch("")}
                  ></button>
                </span>
              )}
              {cityFilter && (
                <span className="badge bg-light text-dark border px-3 py-2">
                  City: {cityFilter}{" "}
                  <button
                    className="btn-close btn-close-sm ms-1"
                    style={{ fontSize: ".5rem" }}
                    onClick={() => setCityFilter("")}
                  ></button>
                </span>
              )}
              {expFilter && (
                <span className="badge bg-light text-dark border px-3 py-2">
                  Exp: {expFilter}+ yrs{" "}
                  <button
                    className="btn-close btn-close-sm ms-1"
                    style={{ fontSize: ".5rem" }}
                    onClick={() => setExpFilter("")}
                  ></button>
                </span>
              )}
              {statusFilter && (
                <span className="badge bg-light text-dark border px-3 py-2">
                  Status: {statusFilter}{" "}
                  <button
                    className="btn-close btn-close-sm ms-1"
                    style={{ fontSize: ".5rem" }}
                    onClick={() => setStatusFilter("")}
                  ></button>
                </span>
              )}
              <button
                className="btn btn-sm btn-link text-danger p-0 ms-1"
                onClick={() => {
                  setSearch("");
                  setCityFilter("");
                  setExpFilter("");
                  setStatusFilter("");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── TABLE ───────────────────────────────────────────── */}
        <div className="mua-table-card">
          {loading ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                style={{ width: 36, height: 36 }}
              />
              <p className="text-muted small mt-3">Loading makeup artists…</p>
            </div>
          ) : error ? (
            <div className="p-4">
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
                <button
                  className="btn btn-sm btn-outline-danger ms-3"
                  onClick={fetchMuas}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                <span className="small text-muted fw-bold">
                  {pagination.total} makeup artist
                  {pagination.total !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="table-responsive">
                <table className="table mua-table mb-0">
                  <thead>
                    <tr>
                      <th>Artist</th>
                      <th>Speciality</th>
                      <th>Location</th>
                      <th>Experience</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {muas.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted">
                          <i className="bi bi-person-x fs-2 d-block mb-2"></i>
                          No makeup artists found.
                        </td>
                      </tr>
                    ) : (
                      muas.map((mua) => {
                        const sc = statusCfg(mua.status);
                        return (
                          <tr
                            key={mua.id}
                            onClick={() => navigate(`/makeup-artist/${mua.id}`)}
                          >
                            <td>
                              <div className="d-flex align-items-center gap-3">
                                {mua.profile_picture ? (
                                  <img
                                    src={mua.profile_picture}
                                    alt=""
                                    className="rounded-circle"
                                    style={{
                                      width: 42,
                                      height: 42,
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div className="mua-avatar">
                                    {initials(mua.full_name)}
                                  </div>
                                )}
                                <div>
                                  <div
                                    className="fw-bold"
                                    style={{ color: "#2c3249" }}
                                  >
                                    {mua.full_name}
                                  </div>
                                  <small className="text-muted">
                                    {mua.email}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              {mua.makeup_speciality ? (
                                <span className="mua-speciality-badge">
                                  {mua.makeup_speciality}
                                </span>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td>
                              <span className="text-muted">
                                {[mua.city, mua.state]
                                  .filter(Boolean)
                                  .join(", ") || "—"}
                              </span>
                            </td>
                            <td>
                              {mua.experience_in_years != null ? (
                                <span className="fw-semibold">
                                  {mua.experience_in_years} yrs
                                </span>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge bg-${sc.badge} px-3 py-2`}
                                style={{ fontSize: ".75rem" }}
                              >
                                {sc.label}
                              </span>
                            </td>
                            <td>
                              <span className="text-muted">
                                {mua.joined_date
                                  ? new Date(
                                      mua.joined_date,
                                    ).toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </span>
                            </td>
                            <td
                              className="text-end"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="btn btn-sm btn-outline-primary px-3"
                                onClick={() =>
                                  navigate(`/makeup-artist/${mua.id}`)
                                }
                              >
                                <i className="bi bi-eye me-1"></i>View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="d-flex justify-content-between align-items-center px-4 py-3 border-top">
                  <small className="text-muted">
                    Page {page} of {pagination.total_pages} — {pagination.total}{" "}
                    total
                  </small>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-light"
                      disabled={page === 1}
                      onClick={() => setPage(1)}
                    >
                      «
                    </button>
                    <button
                      className="btn btn-sm btn-light"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      ‹
                    </button>
                    {Array.from(
                      { length: Math.min(5, pagination.total_pages) },
                      (_, i) => {
                        const start = Math.max(
                          1,
                          Math.min(page - 2, pagination.total_pages - 4),
                        );
                        const pg = start + i;
                        return (
                          <button
                            key={pg}
                            className={`btn btn-sm ${pg === page ? "btn-primary" : "btn-light"}`}
                            onClick={() => setPage(pg)}
                          >
                            {pg}
                          </button>
                        );
                      },
                    )}
                    <button
                      className="btn btn-sm btn-light"
                      disabled={page === pagination.total_pages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      ›
                    </button>
                    <button
                      className="btn btn-sm btn-light"
                      disabled={page === pagination.total_pages}
                      onClick={() => setPage(pagination.total_pages)}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── ADD MUA MODAL ────────────────────────────────────── */}
      <div
        className="modal fade"
        id="addMuaModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div
            className="modal-content border-0 shadow-lg"
            style={{ borderRadius: 16 }}
          >
            <div className="modal-header border-0 p-4 pb-2">
              <div>
                <h5 className="fw-bold mb-0">Register New Makeup Artist</h5>
                <p className="text-muted small mb-0">
                  Account is created Active immediately — no OTP required.
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                ref={closeModalRef}
              ></button>
            </div>
            <div className="modal-body p-4">
              {addError && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {addError}
                </div>
              )}
              <div className="row g-3">
                <div className="col-12">
                  <div className="nuvo-section-rule">Account Details</div>
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold mb-1">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    name="full_name"
                    className="form-control nuvo-modal-input"
                    placeholder="Full name"
                    value={form.full_name}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold mb-1">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    className="form-control nuvo-modal-input"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold mb-1">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    name="phone_number"
                    className="form-control nuvo-modal-input"
                    placeholder="+91..."
                    value={form.phone_number}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold mb-1">Gender</label>
                  <select
                    name="gender"
                    className="form-select nuvo-modal-input"
                    value={form.gender}
                    onChange={handleFormChange}
                  >
                    <option value="">— Select —</option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 mt-2">
                  <div className="nuvo-section-rule">Professional Details</div>
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold mb-1">
                    Makeup Speciality
                  </label>
                  <select
                    name="makeup_speciality"
                    className="form-select nuvo-modal-input"
                    value={form.makeup_speciality}
                    onChange={handleFormChange}
                  >
                    <option value="">— Select —</option>
                    {SPECIALITIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold mb-1">
                    Experience (Years)
                  </label>
                  <input
                    name="experience_in_years"
                    type="number"
                    min="0"
                    className="form-control nuvo-modal-input"
                    placeholder="0"
                    value={form.experience_in_years}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold mb-1">City</label>
                  <input
                    name="city"
                    className="form-control nuvo-modal-input"
                    placeholder="City"
                    value={form.city}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold mb-1">State</label>
                  <input
                    name="state"
                    className="form-control nuvo-modal-input"
                    placeholder="State"
                    value={form.state}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="small fw-bold mb-1">Country</label>
                  <input
                    name="country"
                    className="form-control nuvo-modal-input"
                    placeholder="Country"
                    value={form.country}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex gap-2">
              <button
                className="btn btn-light flex-fill"
                data-bs-dismiss="modal"
                disabled={adding}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary flex-fill"
                onClick={handleCreate}
                disabled={adding}
              >
                {adding ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creating…
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus me-2"></i>Create MUA
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
