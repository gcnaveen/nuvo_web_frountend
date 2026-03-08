// src/pages/user_management/ClientDetails.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getClient,
  updateSubscription,
  changeClientStatus,
  deleteClient,
} from "../../api/clientApi";

// ── Constants ──────────────────────────────────────────────────────────────
const PLAN_CONFIG = {
  PLATINUM: { label: "Platinum", color: "#8E24AA", light: "#f3e5f5" },
  DIAMOND: { label: "Diamond", color: "#1E88E5", light: "#e3f2fd" },
  GOLD: { label: "Gold", color: "#D4AF37", light: "#fffde7" },
  SILVER: { label: "Silver", color: "#78909C", light: "#eceff1" },
  BRONZE: { label: "Bronze", color: "#A1621A", light: "#fbe9e7" },
};

const STATUS_CONFIG = {
  ACTIVE: { label: "Active", badge: "success", icon: "bi-check-circle-fill" },
  INACTIVE: {
    label: "Inactive",
    badge: "secondary",
    icon: "bi-dash-circle-fill",
  },
  BLOCKED: { label: "Blocked", badge: "danger", icon: "bi-x-circle-fill" },
};

const PLANS = ["SILVER", "BRONZE", "GOLD", "PLATINUM", "DIAMOND"];
const STATUSES = ["ACTIVE", "INACTIVE", "BLOCKED"];

// ── Helpers ────────────────────────────────────────────────────────────────
const initials = (name) =>
  (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// ── Read-only field ────────────────────────────────────────────────────────
const Field = ({ label, value }) => (
  <div>
    <label className="cd-field-label">{label}</label>
    <div className="cd-field-value">{value || "—"}</div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ── Fetch ─────────────────────────────────────────────────────────────
  const fetchClient = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getClient(id);
      setClient(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load client.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  // ── Edit ──────────────────────────────────────────────────────────────
  const startEdit = () => {
    setDraft({
      subscription_plan: client.subscription_plan,
      status: client.status,
    });
    setSaveError("");
    setSaveSuccess("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft({});
    setSaveError("");
  };

  const handleDraftChange = (e) =>
    setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Save ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const promises = [];
      if (draft.subscription_plan !== client.subscription_plan)
        promises.push(
          updateSubscription(client.user_id, draft.subscription_plan),
        );
      if (draft.status !== client.status)
        promises.push(changeClientStatus(client.user_id, draft.status));

      await Promise.all(promises);

      setClient((prev) => ({
        ...prev,
        subscription_plan: draft.subscription_plan,
        status: draft.status,
      }));
      setSaveSuccess("Changes saved successfully!");
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteClient(client.id);
      navigate("/clients", { replace: true });
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete client.");
      setDeleting(false);
    }
  };

  // ── Loading / error states ─────────────────────────────────────────────
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
          <p className="text-muted small">Loading client details…</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="page-content">
        <button
          className="btn btn-light shadow-sm mb-4"
          onClick={() => navigate("/clients")}
        >
          <i className="bi bi-arrow-left me-1"></i> Back
        </button>
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  if (!client) return null;

  const planKey = (
    isEditing ? draft.subscription_plan : client.subscription_plan
  )?.toUpperCase();
  const statusKey = (isEditing ? draft.status : client.status)?.toUpperCase();
  const plan = PLAN_CONFIG[planKey] || PLAN_CONFIG.SILVER;
  const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.ACTIVE;

  return (
    <>
      <style>{`
        /* inputs */
        .cd-select {
          border-radius: 8px; border: 1.5px solid #e0e3ea;
          background: #f8f9fc; font-size: 0.88rem; padding: 7px 12px;
          width: 100%; color: #2c3249; font-weight: 600;
          appearance: auto; transition: all 0.2s;
        }
        .cd-select:focus {
          outline: none; border-color: #435ebe;
          box-shadow: 0 0 0 3px rgba(67,94,190,0.12); background: #fff;
        }
        /* fields */
        .cd-field-label {
          font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.9px;
          font-weight: 700; color: #9aa3af; margin-bottom: 4px; display: block;
        }
        .cd-field-value {
          font-size: 0.9rem; font-weight: 600; color: #2c3249;
          padding: 7px 0; border-bottom: 1px solid #f0f2f5; min-height: 34px;
        }
        /* cards */
        .cd-card {
          background: #fff; border-radius: 14px;
          border: 1px solid #eef0f4;
          box-shadow: 0 2px 12px rgba(44,50,73,0.06);
          overflow: hidden; margin-bottom: 20px;
        }
        .cd-card-hd {
          padding: 14px 22px; border-bottom: 1px solid #f5f6fa;
          display: flex; align-items: center; gap: 10px;
        }
        .cd-card-hd h6 {
          margin: 0; font-size: 0.82rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.9px; color: #4a5568;
        }
        .cd-card-bd { padding: 22px; }
        /* avatar */
        .cd-avatar {
          width: 80px; height: 80px; border-radius: 50%;
          display: flex; align-items: center; justify-content-center;
          font-size: 1.7rem; font-weight: 800; color: #fff; flex-shrink: 0;
          border: 3px solid;
        }
        /* plan pill */
        .cd-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 20px; font-size: 0.75rem;
          font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
        }
        /* section rule */
        .cd-rule {
          font-size: 0.68rem; text-transform: uppercase; letter-spacing: 1px;
          color: #c5cadb; font-weight: 700; display: flex; align-items: center;
          gap: 8px; margin: 18px 0 14px;
        }
        .cd-rule::after { content:""; flex:1; height:1px; background:#f0f2f5; }
        /* stat box */
        .cd-stat { background:#f8f9fc; border-radius:10px; padding:12px 14px; text-align:center; }
        .cd-stat-val { font-size:1rem; font-weight:800; color:#2c3249; line-height:1.2; }
        .cd-stat-lbl { font-size:0.68rem; text-transform:uppercase; letter-spacing:0.8px; color:#9aa3af; margin-top:3px; font-weight:600; }
        /* toast */
        .cd-toast {
          position:fixed; top:24px; right:24px; z-index:9999;
          background:#fff; border-left:4px solid #28a745; border-radius:10px;
          box-shadow:0 4px 20px rgba(0,0,0,0.13); padding:13px 20px;
          display:flex; align-items:center; gap:10px; font-size:0.86rem;
          font-weight:600; color:#2c3249; animation:cdSlide 0.3s ease;
        }
        @keyframes cdSlide {
          from { transform:translateX(60px); opacity:0; }
          to   { transform:translateX(0); opacity:1; }
        }
      `}</style>

      {saveSuccess && (
        <div className="cd-toast">
          <i className="bi bi-check-circle-fill text-success fs-5"></i>
          {saveSuccess}
        </div>
      )}

      {/* ── PAGE HEADING ──────────────────────────────────────────────── */}
      <div className="page-heading">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-light shadow-sm"
              onClick={() => navigate("/clients")}
            >
              <i className="bi bi-arrow-left me-1"></i> Clients
            </button>
            <div>
              <h3 className="mb-0">{client.full_name || "Client Details"}</h3>
              <p className="text-muted mb-0 small">
                Client Profile &amp; Subscription
              </p>
            </div>
          </div>

          <div className="d-flex gap-2">
            {!isEditing ? (
              <>
                <button
                  className="btn btn-outline-danger px-3"
                  data-bs-toggle="modal"
                  data-bs-target="#deleteClientDetailModal"
                >
                  <i className="bi bi-trash me-1"></i>Delete
                </button>
                <button className="btn btn-primary px-4" onClick={startEdit}>
                  <i className="bi bi-pencil-square me-2"></i>Edit
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-light"
                  onClick={cancelEdit}
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
                      <i className="bi bi-check-lg me-2"></i>Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── PAGE CONTENT ─────────────────────────────────────────────── */}
      <div className="page-content">
        {saveError && (
          <div className="alert alert-danger py-2 mb-3">
            <i className="bi bi-exclamation-circle me-2"></i>
            {saveError}
          </div>
        )}

        <div className="row g-4">
          {/* ── LEFT COLUMN ────────────────────────────────────────── */}
          <div className="col-lg-4">
            {/* Identity + plan + status */}
            <div className="cd-card">
              <div className="cd-card-bd">
                {/* Avatar + name */}
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div
                    className="cd-avatar"
                    style={{
                      background: plan.color,
                      borderColor: plan.color + "55",
                    }}
                  >
                    {initials(client.full_name)}
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0">{client.full_name}</h5>
                    <div className="text-muted small">{client.email}</div>
                    <div className="text-muted small">
                      {client.phone_number || "No phone"}
                    </div>
                  </div>
                </div>

                {/* Mini stats */}
                <div className="row g-2 mb-1">
                  <div className="col-6">
                    <div className="cd-stat">
                      <div className="cd-stat-val">
                        {fmtDate(client.joined_date).split(" ")[2] || "—"}
                      </div>
                      <div className="cd-stat-lbl">Since</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="cd-stat">
                      <div
                        className="cd-stat-val"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {client.city || "—"}
                      </div>
                      <div className="cd-stat-lbl">City</div>
                    </div>
                  </div>
                </div>

                {/* Plan */}
                <div className="cd-rule">Subscription Plan</div>
                <div
                  className="rounded-3 p-3 mb-3 d-flex align-items-center justify-content-between gap-2"
                  style={{
                    background: plan.light,
                    border: `1px solid ${plan.color}25`,
                  }}
                >
                  <span
                    className="cd-pill"
                    style={{ background: plan.color, color: "#fff" }}
                  >
                    <i className="bi bi-gem"></i>
                    {plan.label}
                  </span>
                  {isEditing && (
                    <select
                      name="subscription_plan"
                      className="cd-select"
                      style={{ width: "auto", flex: 1, marginLeft: 8 }}
                      value={draft.subscription_plan}
                      onChange={handleDraftChange}
                    >
                      {PLANS.map((p) => (
                        <option key={p} value={p}>
                          {PLAN_CONFIG[p]?.label || p}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Status */}
                <div className="cd-rule">Account Status</div>
                <div className="d-flex align-items-center justify-content-between gap-2">
                  <span
                    className={`badge bg-${statusCfg.badge} px-3 py-2`}
                    style={{ fontSize: "0.8rem" }}
                  >
                    <i className={`bi ${statusCfg.icon} me-1`}></i>
                    {statusCfg.label}
                  </span>
                  {isEditing && (
                    <select
                      name="status"
                      className="cd-select"
                      style={{ width: "auto", flex: 1, marginLeft: 8 }}
                      value={draft.status}
                      onChange={handleDraftChange}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_CONFIG[s]?.label || s}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Account meta */}
            <div className="cd-card">
              <div className="cd-card-hd">
                <i className="bi bi-info-circle text-muted"></i>
                <h6>Account Info</h6>
              </div>
              <div className="cd-card-bd">
                <div className="row g-3">
                  <div className="col-12">
                    <Field label="Profile ID" value={client.id} />
                  </div>
                  <div className="col-12">
                    <Field label="Joined" value={fmtDate(client.joined_date)} />
                  </div>
                  <div className="col-12">
                    <Field label="Country" value={client.country} />
                  </div>
                  <div className="col-12">
                    <Field label="State" value={client.state} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ───────────────────────────────────────── */}
          <div className="col-lg-8">
            {/* General info */}
            <div className="cd-card">
              <div className="cd-card-hd">
                <i className="bi bi-person text-primary"></i>
                <h6>General Information</h6>
              </div>
              <div className="cd-card-bd">
                <div className="row g-4">
                  <div className="col-md-6">
                    <Field label="Full Name" value={client.full_name} />
                  </div>
                  <div className="col-md-6">
                    <Field label="Email Address" value={client.email} />
                  </div>
                  <div className="col-md-6">
                    <Field label="Phone Number" value={client.phone_number} />
                  </div>
                  <div className="col-md-6">
                    <Field label="City" value={client.city} />
                  </div>
                  <div className="col-md-6">
                    <Field label="State" value={client.state} />
                  </div>
                  <div className="col-md-6">
                    <Field label="Country" value={client.country} />
                  </div>
                </div>

                <div
                  className="d-flex align-items-center gap-2 mt-4 p-3 rounded-3"
                  style={{
                    background: "#f8f9fc",
                    fontSize: "0.81rem",
                    color: "#6b7280",
                  }}
                >
                  <i className="bi bi-info-circle text-primary"></i>
                  Name, email, and phone are set by the client's account. Only{" "}
                  <strong className="ms-1 me-1">plan</strong> and{" "}
                  <strong>status</strong> can be edited here.
                </div>
              </div>
            </div>

            {/* Subscription settings */}
            <div className="cd-card">
              <div className="cd-card-hd">
                <i className="bi bi-gem text-primary"></i>
                <h6>Subscription Settings</h6>
              </div>
              <div className="cd-card-bd">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="cd-field-label">Plan Tier</label>
                    {isEditing ? (
                      <select
                        name="subscription_plan"
                        className="cd-select"
                        value={draft.subscription_plan}
                        onChange={handleDraftChange}
                      >
                        {PLANS.map((p) => (
                          <option key={p} value={p}>
                            {PLAN_CONFIG[p]?.label || p}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="cd-field-value">
                        <span
                          className="cd-pill"
                          style={{ background: plan.color, color: "#fff" }}
                        >
                          <i className="bi bi-gem"></i>
                          {plan.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="cd-field-label">Account Status</label>
                    {isEditing ? (
                      <select
                        name="status"
                        className="cd-select"
                        value={draft.status}
                        onChange={handleDraftChange}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_CONFIG[s]?.label || s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="cd-field-value">
                        <span
                          className={`badge bg-${statusCfg.badge} px-3 py-2`}
                          style={{ fontSize: "0.8rem" }}
                        >
                          <i className={`bi ${statusCfg.icon} me-1`}></i>
                          {statusCfg.label}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <Field
                      label="Member Since"
                      value={fmtDate(client.joined_date)}
                    />
                  </div>
                  <div className="col-md-6">
                    <Field label="User ID" value={client.user_id} />
                  </div>
                </div>

                {/* Plan tier comparison */}
                <div className="cd-rule mt-4">Plan Tiers</div>
                <div className="d-flex flex-wrap gap-2">
                  {PLANS.map((p) => {
                    const cfg = PLAN_CONFIG[p];
                    const active = p === planKey;
                    return (
                      <span
                        key={p}
                        className="cd-pill"
                        style={{
                          background: active ? cfg.color : cfg.light,
                          color: active ? "#fff" : cfg.color,
                          border: `1.5px solid ${cfg.color}50`,
                          transform: active ? "scale(1.07)" : "scale(1)",
                          transition: "all 0.2s",
                        }}
                      >
                        {active && <i className="bi bi-check-lg"></i>}
                        {cfg.label}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRM MODAL ─────────────────────────────── */}
      <div
        className="modal fade"
        id="deleteClientDetailModal"
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
              <h5 className="fw-bold mb-1">Delete Client?</h5>
              <p className="text-muted mb-0" style={{ fontSize: ".9rem" }}>
                You are about to permanently delete{" "}
                <strong>{client?.full_name}</strong>. This action cannot be
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
