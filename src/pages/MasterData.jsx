// src/pages/MasterData.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  listThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  listUniforms,
  createUniform,
  updateUniform,
  deleteUniform,
  listPlans,
  updatePlan,
  getPaymentTerms,
  updatePaymentTerms,
} from "../api/masterApi";

// ── helpers ────────────────────────────────────────────────────
const PLAN_COLORS = {
  PLATINUM: { bg: "#f3e5f5", color: "#7b1fa2", border: "#ce93d8" },
  DIAMOND: { bg: "#e3f2fd", color: "#1565c0", border: "#90caf9" },
  GOLD: { bg: "#fffde7", color: "#f57f17", border: "#ffe082" },
  SILVER: { bg: "#eceff1", color: "#455a64", border: "#b0bec5" },
  BRONZE: { bg: "#fbe9e7", color: "#bf360c", border: "#ffab91" },
};

const PLAN_ORDER = ["PLATINUM", "DIAMOND", "GOLD", "SILVER", "BRONZE"];

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

// ══════════════════════════════════════════════════════════════
export default function MasterData() {
  const [activeTab, setActiveTab] = useState("themes");

  // ── Toast ──────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  return (
    <>
      <style>{`
        /* ── Layout ── */
        .md-page { }
        .md-tabs  { display:flex; gap:4px; background:#f0f2f8; border-radius:12px; padding:5px; margin-bottom:28px; width:fit-content; }
        .md-tab   { padding:8px 22px; border-radius:9px; border:none; background:transparent; font-size:.85rem; font-weight:600; color:#7a839e; cursor:pointer; transition:all .18s; white-space:nowrap; }
        .md-tab.active { background:#fff; color:#2c3249; box-shadow:0 2px 8px rgba(44,50,73,.12); }
        .md-tab:hover:not(.active) { color:#2c3249; background:#e8eaf0; }

        /* ── Cards ── */
        .ms-card  { background:#fff; border-radius:14px; border:1px solid #eef0f4; box-shadow:0 2px 12px rgba(44,50,73,.06); overflow:hidden; margin-bottom:20px; }
        .ms-card-hd { padding:16px 22px; border-bottom:1px solid #f5f6fa; display:flex; align-items:center; justify-content:space-between; }
        .ms-card-hd h5 { margin:0; font-size:.92rem; font-weight:700; color:#2c3249; }
        .ms-card-bd { padding:22px; }

        /* ── Section grid items ── */
        .ms-item  { display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:10px; border:1px solid #eef0f4; background:#fafbff; transition:all .18s; }
        .ms-item:hover { border-color:#d0d4e8; box-shadow:0 2px 10px rgba(44,50,73,.07); }
        .ms-item-thumb { width:56px; height:56px; border-radius:8px; object-fit:cover; flex-shrink:0; background:#f0f2f8; }
        .ms-item-thumb-ph { width:56px; height:56px; border-radius:8px; background:linear-gradient(135deg,#e8eaf0,#d0d4e0); display:flex; align-items:center; justify-content:center; color:#9aa3af; font-size:1.2rem; flex-shrink:0; }
        .ms-item-name  { font-size:.9rem; font-weight:700; color:#2c3249; }
        .ms-item-sub   { font-size:.75rem; color:#9aa3af; margin-top:2px; }
        .ms-badge-active   { background:#e8f5e9; color:#2e7d32; border-radius:6px; padding:2px 9px; font-size:.72rem; font-weight:700; }
        .ms-badge-inactive { background:#f5f5f5; color:#757575; border-radius:6px; padding:2px 9px; font-size:.72rem; font-weight:700; }

        /* ── Plan cards ── */
        .plan-card { border-radius:14px; border:2px solid; padding:22px; transition:box-shadow .2s; }
        .plan-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.1); }
        .plan-input { width:100%; border-radius:8px; border:1.5px solid #e0e3ea; background:#f8f9fc; font-size:.88rem; padding:7px 11px; font-weight:600; color:#2c3249; transition:all .2s; }
        .plan-input:focus { outline:none; border-color:#435ebe; box-shadow:0 0 0 3px rgba(67,94,190,.12); background:#fff; }

        /* ── Payment card ── */
        .pay-big-input { font-size:2rem; font-weight:800; border:none; background:transparent; color:#2c3249; width:120px; text-align:center; outline:none; border-bottom:3px solid #435ebe; }

        /* ── Form inputs inside modals ── */
        .ms-input { width:100%; border-radius:8px; border:1.5px solid #e0e3ea; background:#f8f9fc; font-size:.88rem; padding:8px 12px; font-weight:600; color:#2c3249; transition:all .2s; }
        .ms-input:focus { outline:none; border-color:#435ebe; box-shadow:0 0 0 3px rgba(67,94,190,.12); background:#fff; }
        .ms-select { width:100%; border-radius:8px; border:1.5px solid #e0e3ea; background:#f8f9fc; font-size:.88rem; padding:8px 12px; font-weight:600; color:#2c3249; }
        .ms-select:focus { outline:none; border-color:#435ebe; box-shadow:0 0 0 3px rgba(67,94,190,.12); }
        .ms-label { font-size:.72rem; text-transform:uppercase; letter-spacing:.9px; font-weight:700; color:#9aa3af; margin-bottom:4px; display:block; }
        .ms-section-rule { font-size:.68rem; text-transform:uppercase; letter-spacing:1px; color:#c5cadb; font-weight:700; display:flex; align-items:center; gap:8px; margin:14px 0 12px; }
        .ms-section-rule::after { content:""; flex:1; height:1px; background:#f0f2f5; }

        /* ── Gallery preview strip ── */
        .ms-gallery-strip { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
        .ms-gallery-thumb { width:72px; height:72px; border-radius:8px; object-fit:cover; position:relative; }
        .ms-gallery-wrap  { position:relative; display:inline-block; }
        .ms-gallery-del   { position:absolute; top:-6px; right:-6px; background:#dc3545; color:#fff; border:none; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:.6rem; cursor:pointer; z-index:2; }

        /* ── Toast ── */
        .ms-toast { position:fixed; top:24px; right:24px; z-index:9999; background:#fff; border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,.13); padding:13px 20px; display:flex; align-items:center; gap:10px; font-size:.86rem; font-weight:600; color:#2c3249; animation:msTsl .3s ease; }
        .ms-toast.success { border-left:4px solid #28a745; }
        .ms-toast.danger  { border-left:4px solid #dc3545; }
        @keyframes msTsl { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
      `}</style>

      {/* Toast */}
      {toast.msg && (
        <div className={`ms-toast ${toast.type}`}>
          <i
            className={`bi ${toast.type === "success" ? "bi-check-circle-fill text-success" : "bi-exclamation-circle-fill text-danger"} fs-5`}
          ></i>
          {toast.msg}
        </div>
      )}

      {/* ── HEADING ─────────────────────────────────────────── */}
      <div className="page-heading">
        <div>
          <h3>Master Data</h3>
          <p className="text-muted mb-0">
            Manage event themes, uniforms, subscription plans, and payment
            settings.
          </p>
        </div>
      </div>

      <div className="page-content">
        {/* ── TABS ──────────────────────────────────────────── */}
        <div className="md-tabs">
          {[
            { key: "themes", label: "Event Themes", icon: "bi-palette" },
            { key: "uniforms", label: "Uniforms", icon: "bi-bag" },
            { key: "subscription", label: "Subscription", icon: "bi-gem" },
            { key: "payment", label: "Payment Terms", icon: "bi-credit-card" },
          ].map((t) => (
            <button
              key={t.key}
              className={`md-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              <i className={`bi ${t.icon} me-2`}></i>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PANELS ─────────────────────────────────────────── */}
        {activeTab === "themes" && <ThemesPanel showToast={showToast} />}
        {activeTab === "uniforms" && <UniformsPanel showToast={showToast} />}
        {activeTab === "subscription" && (
          <SubscriptionPanel showToast={showToast} />
        )}
        {activeTab === "payment" && <PaymentPanel showToast={showToast} />}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// THEMES PANEL
// ══════════════════════════════════════════════════════════════
function ThemesPanel({ showToast }) {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state: null | {mode:"add"} | {mode:"edit"|"view", item}
  const [modal, setModal] = useState(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listThemes();
      setThemes(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setError("Failed to load themes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTheme(deleteTarget.id);
      setThemes((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Theme deleted.");
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed.", "danger");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ms-card">
      <div className="ms-card-hd">
        <h5>
          <i className="bi bi-palette me-2 text-primary"></i>Event Themes
        </h5>
        <button
          className="btn btn-primary btn-sm px-3"
          onClick={() => setModal({ mode: "add" })}
        >
          <i className="bi bi-plus-lg me-1"></i>Add Theme
        </button>
      </div>
      <div className="ms-card-bd">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" />
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : themes.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-palette fs-2 d-block mb-2"></i>No themes yet.
          </div>
        ) : (
          <div className="row g-3">
            {themes.map((t) => (
              <div className="col-md-6 col-lg-4" key={t.id}>
                <div className="ms-item">
                  {t.cover_image ? (
                    <img
                      src={t.cover_image}
                      className="ms-item-thumb"
                      alt=""
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <div className="ms-item-thumb-ph">
                      <i className="bi bi-image"></i>
                    </div>
                  )}
                  <div className="flex-grow-1 min-w-0">
                    <div className="ms-item-name text-truncate">
                      {t.theme_name}
                    </div>
                    <div className="ms-item-sub">
                      {t.gallery_images?.length || 0} gallery images
                    </div>
                    <span
                      className={
                        t.status === "ACTIVE"
                          ? "ms-badge-active"
                          : "ms-badge-inactive"
                      }
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <button
                      className="btn btn-sm btn-outline-primary px-2 py-1"
                      onClick={() => setModal({ mode: "view", item: t })}
                      title="View"
                    >
                      <i
                        className="bi bi-eye"
                        style={{ fontSize: ".75rem" }}
                      ></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary px-2 py-1"
                      onClick={() => setModal({ mode: "edit", item: t })}
                      title="Edit"
                    >
                      <i
                        className="bi bi-pencil"
                        style={{ fontSize: ".75rem" }}
                      ></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger px-2 py-1"
                      onClick={() => setDeleteTarget(t)}
                      title="Delete"
                    >
                      <i
                        className="bi bi-trash"
                        style={{ fontSize: ".75rem" }}
                      ></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal && modal.mode !== "view" && (
        <ThemeFormModal
          mode={modal.mode}
          initial={modal.item}
          onClose={() => setModal(null)}
          onSaved={(saved) => {
            if (modal.mode === "add") setThemes((prev) => [saved, ...prev]);
            else
              setThemes((prev) =>
                prev.map((t) => (t.id === saved.id ? saved : t)),
              );
            setModal(null);
            showToast(
              modal.mode === "add" ? "Theme created!" : "Theme updated!",
            );
          }}
        />
      )}

      {/* View Modal */}
      {modal?.mode === "view" && (
        <ThemeViewModal
          item={modal.item}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ mode: "edit", item: modal.item })}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete Theme?"
          message={
            <>
              Permanently delete <strong>{deleteTarget.theme_name}</strong>? All
              images will also be removed from storage.
            </>
          }
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

// ── Theme Form Modal ───────────────────────────────────────────
function ThemeFormModal({ mode, initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    theme_name: initial?.theme_name || "",
    description: initial?.description || "",
    status: initial?.status || "ACTIVE",
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initial?.cover_image || "");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [deleteGallery, setDeleteGallery] = useState([]); // existing URLs to delete
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const coverRef = useRef(null);
  const galleryRef = useRef(null);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleCover = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const handleGalleryAdd = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setGalleryFiles((prev) => [...prev, ...files]);
    setGalleryPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeStagedGallery = (idx) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== idx));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleDeleteExisting = (url) => {
    setDeleteGallery((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
    );
  };

  const handleSubmit = async () => {
    if (!form.theme_name.trim()) {
      setErr("Theme name is required.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("theme_name", form.theme_name.trim());
      fd.append("description", form.description.trim());
      fd.append("status", form.status);
      if (coverFile) fd.append("cover_image", coverFile);
      galleryFiles.forEach((f) => fd.append("gallery_images", f));
      if (deleteGallery.length)
        fd.append("delete_gallery_urls", JSON.stringify(deleteGallery));

      const res =
        mode === "add"
          ? await createTheme(fd)
          : await updateTheme(initial.id, fd);
      onSaved(res.data.data);
    } catch (e) {
      setErr(e.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,.5)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: 16 }}
        >
          <div className="modal-header border-0 px-4 pt-4 pb-2">
            <div>
              <h5 className="fw-bold mb-0">
                {mode === "add" ? "Add Event Theme" : "Edit Event Theme"}
              </h5>
              <p className="text-muted small mb-0">
                {mode === "add"
                  ? "Create a new theme for events."
                  : `Editing: ${initial.theme_name}`}
              </p>
            </div>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3">
            {err && (
              <div className="alert alert-danger py-2 mb-3">
                <i className="bi bi-exclamation-circle me-2"></i>
                {err}
              </div>
            )}

            <div className="row g-3">
              <div className="col-12">
                <div className="ms-section-rule">Basic Info</div>
              </div>

              <div className="col-md-8">
                <label className="ms-label">Theme Name *</label>
                <input
                  name="theme_name"
                  className="ms-input"
                  value={form.theme_name}
                  onChange={handleChange}
                  placeholder="e.g. Royal Garden"
                />
              </div>
              <div className="col-md-4">
                <label className="ms-label">Status</label>
                <select
                  name="status"
                  className="ms-select"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="col-12">
                <label className="ms-label">Description</label>
                <textarea
                  name="description"
                  className="ms-input"
                  rows={2}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Brief description..."
                  style={{ resize: "none" }}
                />
              </div>

              <div className="col-12">
                <div className="ms-section-rule">Cover Image</div>
              </div>
              <div className="col-12">
                <div className="d-flex align-items-center gap-3">
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt=""
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 10,
                        objectFit: "cover",
                        border: "2px solid #e0e3ea",
                      }}
                    />
                  )}
                  <button
                    className="btn btn-outline-secondary btn-sm px-3"
                    onClick={() => coverRef.current?.click()}
                  >
                    <i className="bi bi-image me-1"></i>
                    {coverPreview ? "Change Cover" : "Upload Cover"}
                  </button>
                  {coverPreview && !coverFile && (
                    <button
                      className="btn btn-outline-danger btn-sm px-2"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview("");
                      }}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  ref={coverRef}
                  className="d-none"
                  accept="image/*"
                  onChange={handleCover}
                />
              </div>

              <div className="col-12">
                <div className="ms-section-rule">Gallery Images</div>
              </div>

              {/* Existing gallery (edit mode) */}
              {mode === "edit" && initial?.gallery_images?.length > 0 && (
                <div className="col-12">
                  <label className="ms-label">
                    Existing Images (click to mark for removal)
                  </label>
                  <div className="ms-gallery-strip">
                    {initial.gallery_images.map((url, i) => (
                      <div
                        className="ms-gallery-wrap"
                        key={i}
                        onClick={() => toggleDeleteExisting(url)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={url}
                          className="ms-gallery-thumb"
                          alt=""
                          style={{
                            opacity: deleteGallery.includes(url) ? 0.3 : 1,
                            border: deleteGallery.includes(url)
                              ? "2px solid #dc3545"
                              : "2px solid transparent",
                          }}
                        />
                        {deleteGallery.includes(url) && (
                          <div className="ms-gallery-del">
                            <i className="bi bi-x"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {deleteGallery.length > 0 && (
                    <small className="text-danger">
                      <i className="bi bi-info-circle me-1"></i>
                      {deleteGallery.length} image(s) will be removed on save.
                    </small>
                  )}
                </div>
              )}

              {/* Staged new gallery */}
              {galleryPreviews.length > 0 && (
                <div className="col-12">
                  <label className="ms-label">New Images (staged)</label>
                  <div className="ms-gallery-strip">
                    {galleryPreviews.map((src, i) => (
                      <div className="ms-gallery-wrap" key={i}>
                        <img src={src} className="ms-gallery-thumb" alt="" />
                        <button
                          className="ms-gallery-del"
                          onClick={() => removeStagedGallery(i)}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="col-12">
                <button
                  className="btn btn-outline-primary btn-sm px-3"
                  onClick={() => galleryRef.current?.click()}
                >
                  <i className="bi bi-plus-circle me-1"></i>Add Gallery Images
                </button>
                <input
                  type="file"
                  ref={galleryRef}
                  className="d-none"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryAdd}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer border-0 px-4 pb-4 pt-2 d-flex gap-2">
            <button
              className="btn btn-light flex-fill"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary flex-fill"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving…
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  {mode === "add" ? "Create Theme" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Theme View Modal ───────────────────────────────────────────
function ThemeViewModal({ item, onClose, onEdit }) {
  return (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,.5)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: 16 }}
        >
          <div className="modal-header border-0 px-4 pt-4 pb-2">
            <h5 className="fw-bold mb-0">{item.theme_name}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3">
            {item.cover_image && (
              <img
                src={item.cover_image}
                alt="cover"
                style={{
                  width: "100%",
                  height: 200,
                  objectFit: "cover",
                  borderRadius: 12,
                  marginBottom: 20,
                }}
              />
            )}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <span className="ms-label d-block">Status</span>
                <span
                  className={
                    item.status === "ACTIVE"
                      ? "ms-badge-active"
                      : "ms-badge-inactive"
                  }
                >
                  {item.status}
                </span>
              </div>
              <div className="col-md-6">
                <span className="ms-label d-block">Created</span>
                <span className="fw-semibold">{fmtDate(item.created_at)}</span>
              </div>
              {item.description && (
                <div className="col-12">
                  <span className="ms-label d-block">Description</span>
                  <p className="mb-0" style={{ fontSize: ".9rem" }}>
                    {item.description}
                  </p>
                </div>
              )}
            </div>
            {item.gallery_images?.length > 0 && (
              <>
                <div className="ms-section-rule">
                  Gallery ({item.gallery_images.length})
                </div>
                <div className="row g-2">
                  {item.gallery_images.map((url, i) => (
                    <div className="col-4 col-md-3" key={i}>
                      <img
                        src={url}
                        alt=""
                        style={{
                          width: "100%",
                          height: 90,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="modal-footer border-0 px-4 pb-4 pt-2 d-flex gap-2">
            <button className="btn btn-light flex-fill" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary flex-fill" onClick={onEdit}>
              <i className="bi bi-pencil me-2"></i>Edit Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// UNIFORMS PANEL
// ══════════════════════════════════════════════════════════════
function UniformsPanel({ showToast }) {
  const [uniforms, setUniforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listUniforms();
      setUniforms(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setError("Failed to load uniform categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUniform(deleteTarget.id);
      setUniforms((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Uniform category deleted.");
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed.", "danger");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="ms-card">
      <div className="ms-card-hd">
        <h5>
          <i className="bi bi-bag me-2 text-primary"></i>Uniform Categories
        </h5>
        <button
          className="btn btn-primary btn-sm px-3"
          onClick={() => setModal({ mode: "add" })}
        >
          <i className="bi bi-plus-lg me-1"></i>Add Category
        </button>
      </div>
      <div className="ms-card-bd">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" />
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : uniforms.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-bag fs-2 d-block mb-2"></i>No uniform categories
            yet.
          </div>
        ) : (
          <div className="row g-3">
            {uniforms.map((u) => (
              <div className="col-md-6 col-lg-4" key={u.id}>
                <div className="ms-item">
                  {u.images?.[0] ? (
                    <img
                      src={u.images[0]}
                      className="ms-item-thumb"
                      alt=""
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <div className="ms-item-thumb-ph">
                      <i className="bi bi-bag"></i>
                    </div>
                  )}
                  <div className="flex-grow-1 min-w-0">
                    <div className="ms-item-name text-truncate">
                      {u.category_name}
                    </div>
                    <div className="ms-item-sub">
                      {u.unique_key} · {u.images?.length || 0} images
                    </div>
                    <span
                      className={
                        u.is_active ? "ms-badge-active" : "ms-badge-inactive"
                      }
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <button
                      className="btn btn-sm btn-outline-primary px-2 py-1"
                      onClick={() => setModal({ mode: "view", item: u })}
                      title="View"
                    >
                      <i
                        className="bi bi-eye"
                        style={{ fontSize: ".75rem" }}
                      ></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary px-2 py-1"
                      onClick={() => setModal({ mode: "edit", item: u })}
                      title="Edit"
                    >
                      <i
                        className="bi bi-pencil"
                        style={{ fontSize: ".75rem" }}
                      ></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger px-2 py-1"
                      onClick={() => setDeleteTarget(u)}
                      title="Delete"
                    >
                      <i
                        className="bi bi-trash"
                        style={{ fontSize: ".75rem" }}
                      ></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && modal.mode !== "view" && (
        <UniformFormModal
          mode={modal.mode}
          initial={modal.item}
          onClose={() => setModal(null)}
          onSaved={(saved) => {
            if (modal.mode === "add") setUniforms((prev) => [saved, ...prev]);
            else
              setUniforms((prev) =>
                prev.map((u) => (u.id === saved.id ? saved : u)),
              );
            setModal(null);
            showToast(
              modal.mode === "add" ? "Category created!" : "Category updated!",
            );
          }}
        />
      )}

      {modal?.mode === "view" && (
        <UniformViewModal
          item={modal.item}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ mode: "edit", item: modal.item })}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete Uniform Category?"
          message={
            <>
              Permanently delete <strong>{deleteTarget.category_name}</strong>?
              All images will be removed from storage.
            </>
          }
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

// ── Uniform Form Modal ─────────────────────────────────────────
function UniformFormModal({ mode, initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    category_name: initial?.category_name || "",
    unique_key: initial?.unique_key || "",
    description: initial?.description || "",
    is_active: initial?.is_active !== false,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [deleteImgs, setDeleteImgs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const imgRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImgsAdd = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeStaged = (idx) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleDelete = (url) =>
    setDeleteImgs((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
    );

  const handleSubmit = async () => {
    if (!form.category_name.trim()) {
      setErr("Category name is required.");
      return;
    }
    if (mode === "add" && !form.unique_key.trim()) {
      setErr("Unique key is required.");
      return;
    }
    setSaving(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("category_name", form.category_name.trim());
      if (mode === "add") fd.append("unique_key", form.unique_key.trim());
      fd.append("description", form.description.trim());
      fd.append("is_active", form.is_active ? "true" : "false");
      imageFiles.forEach((f) => fd.append("images", f));
      if (deleteImgs.length)
        fd.append("delete_image_urls", JSON.stringify(deleteImgs));
      const res =
        mode === "add"
          ? await createUniform(fd)
          : await updateUniform(initial.id, fd);
      onSaved(res.data.data);
    } catch (e) {
      setErr(e.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,.5)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: 16 }}
        >
          <div className="modal-header border-0 px-4 pt-4 pb-2">
            <div>
              <h5 className="fw-bold mb-0">
                {mode === "add"
                  ? "Add Uniform Category"
                  : "Edit Uniform Category"}
              </h5>
            </div>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3">
            {err && (
              <div className="alert alert-danger py-2 mb-3">
                <i className="bi bi-exclamation-circle me-2"></i>
                {err}
              </div>
            )}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="ms-label">Category Name *</label>
                <input
                  name="category_name"
                  className="ms-input"
                  value={form.category_name}
                  onChange={handleChange}
                  placeholder="e.g. Western Formal"
                />
              </div>
              <div className="col-md-6">
                <label className="ms-label">
                  Unique Key {mode === "add" ? "*" : "(read-only)"}
                </label>
                <input
                  name="unique_key"
                  className="ms-input"
                  value={form.unique_key}
                  onChange={handleChange}
                  disabled={mode === "edit"}
                  placeholder="e.g. western_formal"
                  style={
                    mode === "edit"
                      ? { opacity: 0.6, cursor: "not-allowed" }
                      : {}
                  }
                />
              </div>
              <div className="col-12">
                <label className="ms-label">Description</label>
                <textarea
                  name="description"
                  className="ms-input"
                  rows={2}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Brief description..."
                  style={{ resize: "none" }}
                />
              </div>
              <div className="col-12">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    id="unifActiveSwitch"
                  />
                  <label
                    className="form-check-label fw-semibold small"
                    htmlFor="unifActiveSwitch"
                  >
                    {form.is_active ? "Active" : "Inactive"}
                  </label>
                </div>
              </div>

              <div className="col-12">
                <div className="ms-section-rule">Images</div>
              </div>

              {mode === "edit" && initial?.images?.length > 0 && (
                <div className="col-12">
                  <label className="ms-label">Existing (click to remove)</label>
                  <div className="ms-gallery-strip">
                    {initial.images.map((url, i) => (
                      <div
                        className="ms-gallery-wrap"
                        key={i}
                        onClick={() => toggleDelete(url)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={url}
                          className="ms-gallery-thumb"
                          alt=""
                          style={{
                            opacity: deleteImgs.includes(url) ? 0.3 : 1,
                            border: deleteImgs.includes(url)
                              ? "2px solid #dc3545"
                              : "2px solid transparent",
                          }}
                        />
                        {deleteImgs.includes(url) && (
                          <div className="ms-gallery-del">
                            <i className="bi bi-x"></i>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {imagePreviews.length > 0 && (
                <div className="col-12">
                  <label className="ms-label">New (staged)</label>
                  <div className="ms-gallery-strip">
                    {imagePreviews.map((src, i) => (
                      <div className="ms-gallery-wrap" key={i}>
                        <img src={src} className="ms-gallery-thumb" alt="" />
                        <button
                          className="ms-gallery-del"
                          onClick={() => removeStaged(i)}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="col-12">
                <button
                  className="btn btn-outline-primary btn-sm px-3"
                  onClick={() => imgRef.current?.click()}
                >
                  <i className="bi bi-plus-circle me-1"></i>Add Images
                </button>
                <input
                  type="file"
                  ref={imgRef}
                  className="d-none"
                  accept="image/*"
                  multiple
                  onChange={handleImgsAdd}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer border-0 px-4 pb-4 pt-2 d-flex gap-2">
            <button
              className="btn btn-light flex-fill"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary flex-fill"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving…
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  {mode === "add" ? "Create" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Uniform View Modal ─────────────────────────────────────────
function UniformViewModal({ item, onClose, onEdit }) {
  return (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,.5)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: 16 }}
        >
          <div className="modal-header border-0 px-4 pt-4 pb-2">
            <h5 className="fw-bold mb-0">{item.category_name}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3">
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <span className="ms-label d-block">Unique Key</span>
                <code>{item.unique_key}</code>
              </div>
              <div className="col-md-4">
                <span className="ms-label d-block">Status</span>
                <span
                  className={
                    item.is_active ? "ms-badge-active" : "ms-badge-inactive"
                  }
                >
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="col-md-4">
                <span className="ms-label d-block">Created</span>
                <span className="fw-semibold">{fmtDate(item.created_at)}</span>
              </div>
              {item.description && (
                <div className="col-12">
                  <span className="ms-label d-block">Description</span>
                  <p className="mb-0" style={{ fontSize: ".9rem" }}>
                    {item.description}
                  </p>
                </div>
              )}
            </div>
            {item.images?.length > 0 && (
              <>
                <div className="ms-section-rule">
                  Images ({item.images.length})
                </div>
                <div className="row g-2">
                  {item.images.map((url, i) => (
                    <div className="col-4 col-md-3" key={i}>
                      <img
                        src={url}
                        alt=""
                        style={{
                          width: "100%",
                          height: 90,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="modal-footer border-0 px-4 pb-4 pt-2 d-flex gap-2">
            <button className="btn btn-light flex-fill" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary flex-fill" onClick={onEdit}>
              <i className="bi bi-pencil me-2"></i>Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SUBSCRIPTION PANEL
// ══════════════════════════════════════════════════════════════
function SubscriptionPanel({ showToast }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({}); // { [planName]: { monthlyPrice, yearlyPrice, prioritySupport, isFree } }
  const [saving, setSaving] = useState({}); // { [planName]: bool }
  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await listPlans();
        const fetched = Array.isArray(res.data.data) ? res.data.data : [];
        setPlans(fetched);
        const d = {};
        fetched.forEach((p) => {
          d[p.name] = {
            monthlyPrice: p.monthlyPrice ?? 0,
            yearlyPrice: p.yearlyPrice ?? 0,
            prioritySupport: !!p.prioritySupport,
            isFree: !!p.isFree,
          };
        });
        // Init missing plans from PLAN_ORDER
        PLAN_ORDER.forEach((name) => {
          if (!d[name])
            d[name] = {
              monthlyPrice: 0,
              yearlyPrice: 0,
              prioritySupport: false,
              isFree: false,
            };
        });
        setDrafts(d);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDraftChange = (planName, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [planName]: { ...prev[planName], [field]: value },
    }));
  };

  const handleSave = async (planName) => {
    setSaving((prev) => ({ ...prev, [planName]: true }));
    setErrors((prev) => ({ ...prev, [planName]: "" }));
    try {
      const d = drafts[planName];
      const res = await updatePlan(planName, {
        monthlyPrice: parseFloat(d.monthlyPrice) || 0,
        yearlyPrice: parseFloat(d.yearlyPrice) || 0,
        prioritySupport: d.prioritySupport,
        isFree: d.isFree,
      });
      const updated = res.data.data;
      setPlans((prev) => {
        const exists = prev.find((p) => p.name === planName);
        return exists
          ? prev.map((p) => (p.name === planName ? updated : p))
          : [...prev, updated];
      });
      showToast(`${planName} plan saved!`);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [planName]: err.response?.data?.message || "Save failed.",
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [planName]: false }));
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );

  return (
    <div>
      <div className="row g-4">
        {PLAN_ORDER.map((planName) => {
          const cfg = PLAN_COLORS[planName] || PLAN_COLORS.SILVER;
          const draft = drafts[planName] || {
            monthlyPrice: 0,
            yearlyPrice: 0,
            prioritySupport: false,
            isFree: false,
          };
          const isSav = saving[planName];
          const err = errors[planName];
          return (
            <div className="col-md-6 col-lg-4" key={planName}>
              <div
                className="plan-card"
                style={{ background: cfg.bg, borderColor: cfg.border }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <span
                      className="fw-800 fs-5"
                      style={{ color: cfg.color, fontWeight: 800 }}
                    >
                      {planName}
                    </span>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <div className="form-check form-switch mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`free-${planName}`}
                          checked={draft.isFree}
                          onChange={(e) =>
                            handleDraftChange(
                              planName,
                              "isFree",
                              e.target.checked,
                            )
                          }
                        />
                        <label
                          className="form-check-label small"
                          htmlFor={`free-${planName}`}
                          style={{ color: cfg.color, fontWeight: 600 }}
                        >
                          Free plan
                        </label>
                      </div>
                    </div>
                  </div>
                  <i
                    className="bi bi-gem fs-3"
                    style={{ color: cfg.color, opacity: 0.7 }}
                  ></i>
                </div>

                {err && (
                  <div
                    className="alert alert-danger py-1 px-2 mb-2"
                    style={{ fontSize: ".8rem" }}
                  >
                    {err}
                  </div>
                )}

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="ms-label" style={{ color: cfg.color }}>
                      Monthly (₹)
                    </label>
                    <input
                      type="number"
                      className="plan-input"
                      min="0"
                      step="0.01"
                      value={draft.monthlyPrice}
                      onChange={(e) =>
                        handleDraftChange(
                          planName,
                          "monthlyPrice",
                          e.target.value,
                        )
                      }
                      disabled={draft.isFree}
                      style={
                        draft.isFree
                          ? { opacity: 0.5, cursor: "not-allowed" }
                          : {}
                      }
                    />
                  </div>
                  <div className="col-6">
                    <label className="ms-label" style={{ color: cfg.color }}>
                      Yearly (₹)
                    </label>
                    <input
                      type="number"
                      className="plan-input"
                      min="0"
                      step="0.01"
                      value={draft.yearlyPrice}
                      onChange={(e) =>
                        handleDraftChange(
                          planName,
                          "yearlyPrice",
                          e.target.value,
                        )
                      }
                      disabled={draft.isFree}
                      style={
                        draft.isFree
                          ? { opacity: 0.5, cursor: "not-allowed" }
                          : {}
                      }
                    />
                  </div>
                </div>

                <div className="form-check form-switch mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`ps-${planName}`}
                    checked={draft.prioritySupport}
                    onChange={(e) =>
                      handleDraftChange(
                        planName,
                        "prioritySupport",
                        e.target.checked,
                      )
                    }
                  />
                  <label
                    className="form-check-label small fw-semibold"
                    htmlFor={`ps-${planName}`}
                    style={{ color: cfg.color }}
                  >
                    Priority Support
                  </label>
                </div>

                <button
                  className="btn btn-sm w-100 fw-bold"
                  style={{
                    background: cfg.color,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                  }}
                  onClick={() => handleSave(planName)}
                  disabled={isSav}
                >
                  {isSav ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i>Save {planName}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PAYMENT PANEL
// ══════════════════════════════════════════════════════════════
function PaymentPanel({ showToast }) {
  const [pct, setPct] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpd, setLastUpd] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getPaymentTerms();
        const d = res.data.data;
        if (d.advancePercentage !== null && d.advancePercentage !== undefined) {
          setPct(String(d.advancePercentage));
          setLastUpd(d.lastUpdatedAt);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    const val = parseFloat(pct);
    if (isNaN(val) || val < 0 || val > 100) {
      setError("Please enter a valid percentage between 0 and 100.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await updatePaymentTerms({ advancePercentage: val });
      setLastUpd(res.data.data.lastUpdatedAt);
      showToast("Payment terms updated!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
      </div>
    );

  const numPct = parseFloat(pct) || 0;

  return (
    <div className="ms-card" style={{ maxWidth: 560 }}>
      <div className="ms-card-hd">
        <h5>
          <i className="bi bi-credit-card me-2 text-primary"></i>Payment Terms
        </h5>
      </div>
      <div className="ms-card-bd">
        <p className="text-muted mb-4" style={{ fontSize: ".9rem" }}>
          Set the advance payment percentage required when a client books an
          event. The remaining balance is due as per agreement.
        </p>

        {error && <div className="alert alert-danger py-2 mb-4">{error}</div>}

        {/* Big input */}
        <div className="text-center mb-4">
          <label
            className="ms-label d-block mb-3 text-center"
            style={{ fontSize: ".8rem" }}
          >
            Advance Payment Required (%)
          </label>
          <div className="d-flex align-items-center justify-content-center gap-3">
            <input
              type="number"
              className="pay-big-input"
              min="0"
              max="100"
              step="1"
              value={pct}
              onChange={(e) => setPct(e.target.value)}
              placeholder="0"
            />
            <span
              style={{ fontSize: "2rem", fontWeight: 800, color: "#9aa3af" }}
            >
              %
            </span>
          </div>
          {/* Visual bar */}
          <div className="mt-3 mx-auto" style={{ maxWidth: 320 }}>
            <div className="d-flex justify-content-between mb-1">
              <small className="text-muted">Advance</small>
              <small className="text-muted">On Completion</small>
            </div>
            <div
              style={{
                background: "#f0f2f5",
                borderRadius: 20,
                height: 14,
                overflow: "hidden",
                border: "1px solid #e0e3ea",
              }}
            >
              <div
                style={{
                  width: `${Math.min(numPct, 100)}%`,
                  background: "linear-gradient(90deg,#435ebe,#6979f8)",
                  height: "100%",
                  borderRadius: 20,
                  transition: "width .4s ease",
                }}
              ></div>
            </div>
            <div className="d-flex justify-content-between mt-1">
              <small className="fw-bold text-primary">{numPct}%</small>
              <small className="fw-bold text-muted">
                {Math.max(0, 100 - numPct)}%
              </small>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div
          className="p-3 rounded-3 mb-4"
          style={{ background: "#f0f4ff", border: "1px solid #d0d8f5" }}
        >
          <div className="d-flex gap-3 align-items-start">
            <i className="bi bi-info-circle text-primary mt-1"></i>
            <div style={{ fontSize: ".85rem", color: "#4a5568" }}>
              Example: For an event worth <strong>₹1,00,000</strong>, the client
              pays{" "}
              <strong>
                ₹{Math.round((100000 * numPct) / 100).toLocaleString("en-IN")}
              </strong>{" "}
              upfront and{" "}
              <strong>
                ₹
                {Math.round((100000 * (100 - numPct)) / 100).toLocaleString(
                  "en-IN",
                )}
              </strong>{" "}
              on completion.
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary w-100 py-2 fw-bold"
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
              <i className="bi bi-check-lg me-2"></i>Update Payment Terms
            </>
          )}
        </button>

        {lastUpd && (
          <p
            className="text-center text-muted mt-3 mb-0"
            style={{ fontSize: ".78rem" }}
          >
            <i className="bi bi-clock me-1"></i>Last updated: {fmtDate(lastUpd)}
          </p>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SHARED: Confirm Delete Modal
// ══════════════════════════════════════════════════════════════
function ConfirmDeleteModal({ title, message, onConfirm, onClose, loading }) {
  return (
    <div
      className="modal d-block"
      style={{ background: "rgba(0,0,0,.5)", zIndex: 1060 }}
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
            <h5 className="fw-bold mb-2">{title}</h5>
            <p className="text-muted mb-0" style={{ fontSize: ".9rem" }}>
              {message}
            </p>
          </div>
          <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex gap-2">
            <button
              className="btn btn-light flex-fill"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger flex-fill"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
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
  );
}



