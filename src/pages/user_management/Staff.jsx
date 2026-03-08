// src/pages/user_management/Staff.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { listStaff, createStaff, deleteStaff } from "../../api/staffApi";

// ── Constants ──────────────────────────────────────────────────
const PACKAGE_CONFIG = {
  PLATINUM: { label: "Platinum", color: "#8E24AA", textColor: "#fff" },
  DIAMOND: { label: "Diamond", color: "#1E88E5", textColor: "#fff" },
  GOLD: { label: "Gold", color: "#D4AF37", textColor: "#000" },
  SILVER: { label: "Silver", color: "#B0BEC5", textColor: "#000" },
  BRONZE: { label: "Bronze", color: "#CD7F32", textColor: "#fff" },
};

const STATUS_BADGE = {
  ACTIVE: "success",
  ONEVENT: "warning",
  INACTIVE: "secondary",
  BLOCKED: "danger",
};

const EMPTY_FORM = {
  full_name: "",
  stage_name: "",
  email: "",
  phone_number: "",
  gender: "Male",
  city: "",
  state: "",
  country: "India",
  package: "SILVER",
  experience_in_years: "",
  price_of_staff: "",
};

const initials = (name) =>
  (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

// ══════════════════════════════════════════════════════════════
export default function Staff() {
  const navigate = useNavigate();

  // ── Data ─────────────────────────────────────────────────────
  const [staff, setStaff] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 15,
    total_pages: 1,
  });
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Filters ──────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [pkg, setPkg] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // ── Create modal ─────────────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Delete confirm ───────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ── Toast ────────────────────────────────────────────────────
  const [toast, setToast] = useState("");

  const searchDebounce = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, page_size: 15 };
      if (search) params.search = search;
      if (city) params.city = city;
      if (pkg) params.package = pkg;
      if (status) params.status = status;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const res = await listStaff(params);
      const data = res.data.data;

      setStaff(data.results || []);
      setPagination(data.pagination || {});

      if (!city && !search && !pkg && !status && !startDate && !endDate) {
        const unique = [
          ...new Set((data.results || []).map((s) => s.city).filter(Boolean)),
        ].sort();
        if (unique.length) setCities(unique);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load staff.");
    } finally {
      setLoading(false);
    }
  }, [search, city, pkg, status, startDate, endDate, page]);

  useEffect(() => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setPage(1);
      fetchStaff();
    }, 400);
    return () => clearTimeout(searchDebounce.current);
  }, [search]);

  useEffect(() => {
    fetchStaff();
  }, [city, pkg, status, startDate, endDate, page]);

  // ── Create ────────────────────────────────────────────────────
  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateForm = () => {
    if (!form.full_name.trim()) return "Full name is required";
    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email";
    if (!form.phone_number.trim()) return "Phone number is required";
    if (!/^\d{10}$/.test(form.phone_number)) return "Phone must be 10 digits";
    if (!form.gender) return "Gender is required";
    if (!form.city.trim()) return "City is required";
    return null;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        experience_in_years: parseInt(form.experience_in_years) || 0,
        price_of_staff: parseFloat(form.price_of_staff) || 0,
      };
      await createStaff(payload);
      setFormSuccess("Staff member created successfully!");
      setForm(EMPTY_FORM);
      fetchStaff();
      setTimeout(() => {
        setFormSuccess("");
        document.getElementById("addStaffModalClose")?.click();
        showToast("Staff member created successfully!");
      }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to create staff.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setFormError("");
    setFormSuccess("");
    setForm(EMPTY_FORM);
  };

  // ── Delete ────────────────────────────────────────────────────
  const confirmDelete = (member) => {
    setDeleteTarget({ id: member.id, name: member.full_name });
    setDeleteError("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteStaff(deleteTarget.id);
      setDeleteTarget(null);
      fetchStaff();
      showToast(`${deleteTarget.name} has been deleted.`);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete staff.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Filters ───────────────────────────────────────────────────
  const resetFilters = () => {
    setSearch("");
    setCity("");
    setPkg("");
    setStatus("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };
  const hasFilters = search || city || pkg || status || startDate || endDate;

  // ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .nuvo-input { background:#f8f9fa !important; border:1px solid #eaeaea !important; }
        .nuvo-input:focus { background:#fff !important; border-color:#435ebe !important; box-shadow:0 0 0 .2rem rgba(67,94,190,.15) !important; }
        .section-title { font-size:.78rem; text-transform:uppercase; letter-spacing:1.2px; color:#aaa; font-weight:700; display:flex; align-items:center; margin-bottom:14px; }
        .section-title::after { content:""; flex:1; height:1px; background:#f0f0f0; margin-left:10px; }
        .staff-toast { position:fixed; top:24px; right:24px; z-index:9999; background:#fff; border-left:4px solid #28a745; border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,.13); padding:13px 20px; display:flex; align-items:center; gap:10px; font-size:.86rem; font-weight:600; color:#2c3249; animation:stSlide .3s ease; }
        @keyframes stSlide { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
      `}</style>

      {toast && (
        <div className="staff-toast">
          <i className="bi bi-check-circle-fill text-success fs-5"></i>
          {toast}
        </div>
      )}

      {/* ── HEADING ───────────────────────────────────────────── */}
      <div className="page-heading">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h3>Staff Management</h3>
            <p className="text-muted mb-0">
              Manage hosting staff profiles and assignments.
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
              data-bs-target="#addStaffModal"
            >
              <i className="bi bi-person-plus me-1"></i> Add Staff
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* ── FILTERS ───────────────────────────────────────────── */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="small fw-bold">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name or Stage Name..."
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
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="small fw-bold">Package</label>
                <select
                  className="form-select"
                  value={pkg}
                  onChange={(e) => {
                    setPkg(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Packages</option>
                  {Object.entries(PACKAGE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
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
                  <option value="unassigned">Available</option>
                  <option value="assigned">On Event</option>
                </select>
              </div>
              <div className="col-md-1">
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
                    <i className="bi bi-x-circle me-1"></i>Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── TABLE ─────────────────────────────────────────────── */}
        <div className="card shadow-sm">
          <div className="card-body">
            {error && <div className="alert alert-danger py-2">{error}</div>}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="text-muted mt-3">Loading staff...</p>
              </div>
            ) : staff.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-people fs-1 d-block mb-2"></i>
                No staff found.{" "}
                {hasFilters && (
                  <span
                    className="text-primary"
                    style={{ cursor: "pointer" }}
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
                        <th>Staff Member</th>
                        <th>Stage Name</th>
                        <th>Package</th>
                        <th>City</th>
                        <th>Joined</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((member) => {
                        const pkgKey = member.package?.toUpperCase();
                        const p = PACKAGE_CONFIG[pkgKey] || {
                          label: member.package || "—",
                          color: "#eee",
                          textColor: "#333",
                        };
                        const stKey = member.status?.toUpperCase();
                        return (
                          <tr key={member.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white overflow-hidden"
                                  style={{
                                    width: 40,
                                    height: 40,
                                    flexShrink: 0,
                                    background: "#435ebe",
                                    fontSize: 13,
                                  }}
                                >
                                  {member.profile_picture ? (
                                    <img
                                      src={member.profile_picture}
                                      alt=""
                                      className="w-100 h-100"
                                      style={{ objectFit: "cover" }}
                                    />
                                  ) : (
                                    initials(member.full_name)
                                  )}
                                </div>
                                <div>
                                  <div className="fw-bold text-primary">
                                    {member.full_name}
                                  </div>
                                  <small className="text-muted">
                                    {member.gender || "—"}
                                  </small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="text-muted">
                                {member.stage_name || "—"}
                              </span>
                            </td>
                            <td>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: p.color,
                                  color: p.textColor,
                                  padding: "0.45em 0.8em",
                                }}
                              >
                                {p.label}
                              </span>
                            </td>
                            <td>{member.city || "—"}</td>
                            <td>{fmtDate(member.joined_date)}</td>
                            <td>
                              <span
                                className={`badge bg-${STATUS_BADGE[stKey] || "secondary"}`}
                              >
                                {member.status || "—"}
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="d-flex gap-1 justify-content-end">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() =>
                                    navigate(`/staff/${member.id}`)
                                  }
                                >
                                  <i className="bi bi-eye me-1"></i>View
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => confirmDelete(member)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#deleteStaffModal"
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
                    )}{" "}
                    of {pagination.total} staff
                  </small>
                  <ul className="pagination pagination-primary mb-0">
                    <li
                      className={`page-item ${pagination.page === 1 ? "disabled" : ""}`}
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
                        className={`page-item ${pagination.page === i + 1 ? "active" : ""}`}
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
                      className={`page-item ${pagination.page === pagination.total_pages ? "disabled" : ""}`}
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

      {/* ── ADD STAFF MODAL ─────────────────────────────────────── */}
      <div
        className="modal fade"
        id="addStaffModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content shadow-lg" style={{ borderRadius: 14 }}>
            <div className="modal-header border-0 p-4 pb-0">
              <div className="d-flex align-items-center gap-3">
                <div className="bg-light rounded-circle p-2">
                  <i className="bi bi-person-plus text-primary fs-5"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0">Add New Staff Member</h5>
                  <small className="text-muted">
                    Account will be created immediately as Active
                  </small>
                </div>
              </div>
              <button
                id="addStaffModalClose"
                type="button"
                className="btn-close ms-auto"
                data-bs-dismiss="modal"
                onClick={closeModal}
              />
            </div>

            <div className="modal-body p-4">
              {formError && (
                <div className="alert alert-danger  py-2 mb-3">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="alert alert-success py-2 mb-3">
                  <i className="bi bi-check-circle me-2"></i>
                  {formSuccess}
                </div>
              )}

              <form id="addStaffForm" onSubmit={handleCreate}>
                {/* Identity */}
                <div className="section-title">Identity</div>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">
                      Full Name *
                    </label>
                    <input
                      name="full_name"
                      type="text"
                      className="form-control nuvo-input"
                      placeholder="Legal full name"
                      value={form.full_name}
                      onChange={handleFormChange}
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">
                      Stage Name
                    </label>
                    <input
                      name="stage_name"
                      type="text"
                      className="form-control nuvo-input"
                      placeholder="Public display name"
                      value={form.stage_name}
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
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0">
                        +91
                      </span>
                      <input
                        name="phone_number"
                        type="tel"
                        className="form-control nuvo-input"
                        placeholder="10-digit number"
                        value={form.phone_number}
                        maxLength={10}
                        onChange={handleFormChange}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Gender *</label>
                    <select
                      name="gender"
                      className="form-select nuvo-input"
                      value={form.gender}
                      onChange={handleFormChange}
                      disabled={submitting}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div className="section-title">Location</div>
                <div className="row g-3 mb-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">City *</label>
                    <input
                      name="city"
                      type="text"
                      className="form-control nuvo-input"
                      placeholder="City"
                      value={form.city}
                      onChange={handleFormChange}
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">State</label>
                    <input
                      name="state"
                      type="text"
                      className="form-control nuvo-input"
                      placeholder="State"
                      value={form.state}
                      onChange={handleFormChange}
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Country</label>
                    <input
                      name="country"
                      type="text"
                      className="form-control nuvo-input"
                      value={form.country}
                      onChange={handleFormChange}
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Professional */}
                <div className="section-title">Professional Details</div>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">
                      Package Tier
                    </label>
                    <select
                      name="package"
                      className="form-select nuvo-input"
                      value={form.package}
                      onChange={handleFormChange}
                      disabled={submitting}
                    >
                      {Object.entries(PACKAGE_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">
                      Experience (Years)
                    </label>
                    <input
                      name="experience_in_years"
                      type="number"
                      min="0"
                      className="form-control nuvo-input"
                      placeholder="0"
                      value={form.experience_in_years}
                      onChange={handleFormChange}
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">
                      Price (₹)
                    </label>
                    <input
                      name="price_of_staff"
                      type="number"
                      min="0"
                      className="form-control nuvo-input"
                      placeholder="0"
                      value={form.price_of_staff}
                      onChange={handleFormChange}
                      disabled={submitting}
                    />
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
                form="addStaffForm"
                className="btn btn-primary px-4"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-check me-2"></i>Create Staff
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRM MODAL ─────────────────────────────────── */}
      <div
        className="modal fade"
        id="deleteStaffModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ maxWidth: 420 }}
        >
          <div className="modal-content shadow-lg" style={{ borderRadius: 14 }}>
            <div className="modal-body p-4 text-center">
              <div
                className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 64, height: 64 }}
              >
                <i className="bi bi-trash text-danger fs-3"></i>
              </div>
              <h5 className="fw-bold mb-1">Delete Staff Member?</h5>
              <p className="text-muted mb-0" style={{ fontSize: ".9rem" }}>
                You are about to permanently delete{" "}
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
