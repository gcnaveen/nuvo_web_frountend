// src/pages/master/MasterData.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  listThemes,
  createTheme,
  updateTheme,
  deleteTheme,
  listUniforms,
  createUniform,
  updateUniform,
  deleteUniform,
  listCrewPackages,
  updateCrewPackage,
  getPaymentTerms,
  updatePaymentTerms,
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listCrewMembers,
  createCrewMember,
  updateCrewMember,
  deleteCrewMember,
} from "../api/masterApi";

// ── helpers ────────────────────────────────────────────────────
const PLAN_COLORS = {
  PLATINUM: { bg: '#f3e5f5', color: '#7b1fa2', border: '#ce93d8' },
  DIAMOND: { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' },
  GOLD: { bg: '#fffde7', color: '#f57f17', border: '#ffe082' },
  SILVER: { bg: '#eceff1', color: '#455a64', border: '#b0bec5' },
  BRONZE: { bg: '#fbe9e7', color: '#bf360c', border: '#ffab91' },
};

const PLAN_ORDER = ['PLATINUM', 'DIAMOND', 'GOLD', 'SILVER', 'BRONZE'];

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

// ══════════════════════════════════════════════════════════════
export default function MasterData() {
  const [activeTab, setActiveTab] = useState('themes');

  // ── Toast ──────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
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
            className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-circle-fill text-danger'} fs-5`}
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
            { key: 'themes', label: 'Event Themes', icon: 'bi-palette' },
            { key: 'uniforms', label: 'Uniforms', icon: 'bi-bag' },
            { key: 'payment', label: 'Payment Terms', icon: 'bi-credit-card' },
            { key: 'coupons', label: 'Coupons', icon: 'bi-ticket-perforated' },
          ].map((t) => (
            <button
              key={t.key}
              className={`md-tab ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              <i className={`bi ${t.icon} me-2`}></i>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── PANELS ─────────────────────────────────────────── */}
        {activeTab === 'themes' && <ThemesPanel showToast={showToast} />}
        {activeTab === 'uniforms' && <UniformsPanel showToast={showToast} />}
        {activeTab === 'payment' && <PaymentPanel showToast={showToast} />}
        {activeTab === 'coupons' && <CouponsPanel showToast={showToast} />}
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
  const [error, setError] = useState('');

  // Modal state: null | {mode:"add"} | {mode:"edit"|"view", item}
  const [modal, setModal] = useState(null);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listThemes();
      setThemes(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setError('Failed to load themes.');
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
      showToast('Theme deleted.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.', 'danger');
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
          onClick={() => setModal({ mode: 'add' })}
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
              <div
                className="col-md-6 col-lg-4"
                key={t.id}
              >
                <div className="ms-item">
                  {t.cover_image ? (
                    <img
                      src={t.cover_image}
                      className="ms-item-thumb"
                      alt=""
                      onError={(e) => (e.target.style.display = 'none')}
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
                        t.status === 'ACTIVE'
                          ? 'ms-badge-active'
                          : 'ms-badge-inactive'
                      }
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <button
                      className="btn btn-sm btn-outline-primary px-2 py-1"
                      onClick={() => setModal({ mode: 'view', item: t })}
                      title="View"
                    >
                      <i
                        className="bi bi-eye"
                        style={{ fontSize: '.75rem' }}
                      ></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary px-2 py-1"
                      onClick={() => setModal({ mode: 'edit', item: t })}
                      title="Edit"
                    >
                      <i
                        className="bi bi-pencil"
                        style={{ fontSize: '.75rem' }}
                      ></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger px-2 py-1"
                      onClick={() => setDeleteTarget(t)}
                      title="Delete"
                    >
                      <i
                        className="bi bi-trash"
                        style={{ fontSize: '.75rem' }}
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
      {modal && modal.mode !== 'view' && (
        <ThemeFormModal
          mode={modal.mode}
          initial={modal.item}
          onClose={() => setModal(null)}
          onSaved={(saved) => {
            if (modal.mode === 'add') setThemes((prev) => [saved, ...prev]);
            else
              setThemes((prev) =>
                prev.map((t) => (t.id === saved.id ? saved : t)),
              );
            setModal(null);
            showToast(
              modal.mode === 'add' ? 'Theme created!' : 'Theme updated!',
            );
          }}
        />
      )}

      {/* View Modal */}
      {modal?.mode === 'view' && (
        <ThemeViewModal
          item={modal.item}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ mode: 'edit', item: modal.item })}
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
    theme_name: initial?.theme_name || '',
    description: initial?.description || '',
    status: initial?.status || 'ACTIVE',
  });
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initial?.cover_image || '');
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [deleteGallery, setDeleteGallery] = useState([]); // existing URLs to delete
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
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
      setErr('Theme name is required.');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('theme_name', form.theme_name.trim());
      fd.append('description', form.description.trim());
      fd.append('status', form.status);
      if (coverFile) fd.append('cover_image', coverFile);
      galleryFiles.forEach((f) => fd.append('gallery_images', f));
      if (deleteGallery.length)
        fd.append('delete_gallery_urls', JSON.stringify(deleteGallery));

      const res =
        mode === 'add'
          ? await createTheme(fd)
          : await updateTheme(initial.id, fd);
      onSaved(res.data.data);
    } catch (e) {
      setErr(e.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ background: 'rgba(0,0,0,.5)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: 16 }}
        >
          <div className="modal-header border-0 px-4 pt-4 pb-2">
            <div>
              <h5 className="fw-bold mb-0">
                {mode === 'add' ? 'Add Event Theme' : 'Edit Event Theme'}
              </h5>
              <p className="text-muted small mb-0">
                {mode === 'add'
                  ? 'Create a new theme for events.'
                  : `Editing: ${initial.theme_name}`}
              </p>
            </div>
            <button
              className="btn-close"
              onClick={onClose}
            ></button>
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
                  style={{ resize: 'none' }}
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
                        objectFit: 'cover',
                        border: '2px solid #e0e3ea',
                      }}
                    />
                  )}
                  <button
                    className="btn btn-outline-secondary btn-sm px-3"
                    onClick={() => coverRef.current?.click()}
                  >
                    <i className="bi bi-image me-1"></i>
                    {coverPreview ? 'Change Cover' : 'Upload Cover'}
                  </button>
                  {coverPreview && !coverFile && (
                    <button
                      className="btn btn-outline-danger btn-sm px-2"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview('');
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
              {mode === 'edit' && initial?.gallery_images?.length > 0 && (
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
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={url}
                          className="ms-gallery-thumb"
                          alt=""
                          style={{
                            opacity: deleteGallery.includes(url) ? 0.3 : 1,
                            border: deleteGallery.includes(url)
                              ? '2px solid #dc3545'
                              : '2px solid transparent',
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
                      <div
                        className="ms-gallery-wrap"
                        key={i}
                      >
                        <img
                          src={src}
                          className="ms-gallery-thumb"
                          alt=""
                        />
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
                  {mode === 'add' ? 'Create Theme' : 'Save Changes'}
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
      style={{ background: 'rgba(0,0,0,.5)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: 16 }}
        >
          <div className="modal-header border-0 px-4 pt-4 pb-2">
            <h5 className="fw-bold mb-0">{item.theme_name}</h5>
            <button
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body px-4 py-3">
            {item.cover_image && (
              <img
                src={item.cover_image}
                alt="cover"
                style={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
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
                    item.status === 'ACTIVE'
                      ? 'ms-badge-active'
                      : 'ms-badge-inactive'
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
                  <p
                    className="mb-0"
                    style={{ fontSize: '.9rem' }}
                  >
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
                    <div
                      className="col-4 col-md-3"
                      key={i}
                    >
                      <img
                        src={url}
                        alt=""
                        style={{
                          width: '100%',
                          height: 90,
                          objectFit: 'cover',
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
            <button
              className="btn btn-light flex-fill"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="btn btn-primary flex-fill"
              onClick={onEdit}
            >
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
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listUniforms();
      setUniforms(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setError('Failed to load uniform categories.');
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
      showToast('Uniform category deleted.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.', 'danger');
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
          onClick={() => setModal({ mode: 'add' })}
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
              <div
                className="col-md-6 col-lg-4"
                key={u.id}
              >
                <div className="ms-item">
                  {u.images?.[0] ? (
                    <img
                      src={u.images[0]}
                      className="ms-item-thumb"
                      alt=""
                      onError={(e) => (e.target.style.display = 'none')}
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
                      {u.gender ? ` · ${u.gender}` : ''}
                      {u.price > 0 ? ` · ₹${u.price}` : ''}
                    </div>
                    <span
                      className={
                        u.is_active ? 'ms-badge-active' : 'ms-badge-inactive'
                      }
                    >
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <button
                      className="btn btn-sm btn-outline-primary px-2 py-1"
                      onClick={() => setModal({ mode: 'view', item: u })}
                      title="View"
                    >
                      <i
                        className="bi bi-eye"
                        style={{ fontSize: '.75rem' }}
                      ></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary px-2 py-1"
                      onClick={() => setModal({ mode: 'edit', item: u })}
                      title="Edit"
                    >
                      <i
                        className="bi bi-pencil"
                        style={{ fontSize: '.75rem' }}
                      ></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger px-2 py-1"
                      onClick={() => setDeleteTarget(u)}
                      title="Delete"
                    >
                      <i
                        className="bi bi-trash"
                        style={{ fontSize: '.75rem' }}
                      ></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && modal.mode !== 'view' && (
        <UniformFormModal
          mode={modal.mode}
          initial={modal.item}
          onClose={() => setModal(null)}
          onSaved={(saved) => {
            if (modal.mode === 'add') setUniforms((prev) => [saved, ...prev]);
            else
              setUniforms((prev) =>
                prev.map((u) => (u.id === saved.id ? saved : u)),
              );
            setModal(null);
            showToast(
              modal.mode === 'add' ? 'Category created!' : 'Category updated!',
            );
          }}
        />
      )}

      {modal?.mode === 'view' && (
        <UniformViewModal
          item={modal.item}
          onClose={() => setModal(null)}
          onEdit={() => setModal({ mode: 'edit', item: modal.item })}
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
    category_name: initial?.category_name || '',
    unique_key: initial?.unique_key || '',
    description: initial?.description || '',
    is_active: initial?.is_active !== false,
    gender: initial?.gender || '',
    price: initial?.price ?? '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [deleteImgs, setDeleteImgs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const imgRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
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
      setErr('Category name is required.');
      return;
    }
    if (mode === 'add' && !form.unique_key.trim()) {
      setErr('Unique key is required.');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('category_name', form.category_name.trim());
      if (mode === 'add') fd.append('unique_key', form.unique_key.trim());
      fd.append('description', form.description.trim());
      fd.append('is_active', form.is_active ? 'true' : 'false');
      fd.append('gender', form.gender);
      fd.append('price', form.price !== '' ? String(form.price) : '0');
      imageFiles.forEach((f) => fd.append('images', f));
      if (deleteImgs.length)
        fd.append('delete_image_urls', JSON.stringify(deleteImgs));
      const res =
        mode === 'add'
          ? await createUniform(fd)
          : await updateUniform(initial.id, fd);
      onSaved(res.data.data);
    } catch (e) {
      setErr(e.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ background: 'rgba(0,0,0,.5)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: 16 }}
        >
          <div className="modal-header border-0 px-4 pt-4 pb-2">
            <div>
              <h5 className="fw-bold mb-0">
                {mode === 'add'
                  ? 'Add Uniform Category'
                  : 'Edit Uniform Category'}
              </h5>
            </div>
            <button
              className="btn-close"
              onClick={onClose}
            ></button>
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
                  Unique Key {mode === 'add' ? '*' : '(read-only)'}
                </label>
                <input
                  name="unique_key"
                  className="ms-input"
                  value={form.unique_key}
                  onChange={handleChange}
                  disabled={mode === 'edit'}
                  placeholder="e.g. western_formal"
                  style={
                    mode === 'edit'
                      ? { opacity: 0.6, cursor: 'not-allowed' }
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
                  style={{ resize: 'none' }}
                />
              </div>
              <div className="col-md-6">
                <label className="ms-label">Gender</label>
                <select
                  name="gender"
                  className="ms-select"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">— All / Unspecified —</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="ms-label">Price (₹)</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="ms-input"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
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
                    {form.is_active ? 'Active' : 'Inactive'}
                  </label>
                </div>
              </div>

              <div className="col-12">
                <div className="ms-section-rule">Images</div>
              </div>

              {mode === 'edit' && initial?.images?.length > 0 && (
                <div className="col-12">
                  <label className="ms-label">Existing (click to remove)</label>
                  <div className="ms-gallery-strip">
                    {initial.images.map((url, i) => (
                      <div
                        className="ms-gallery-wrap"
                        key={i}
                        onClick={() => toggleDelete(url)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={url}
                          className="ms-gallery-thumb"
                          alt=""
                          style={{
                            opacity: deleteImgs.includes(url) ? 0.3 : 1,
                            border: deleteImgs.includes(url)
                              ? '2px solid #dc3545'
                              : '2px solid transparent',
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
                      <div
                        className="ms-gallery-wrap"
                        key={i}
                      >
                        <img
                          src={src}
                          className="ms-gallery-thumb"
                          alt=""
                        />
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
                  {mode === 'add' ? 'Create' : 'Save Changes'}
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
      style={{ background: 'rgba(0,0,0,.5)', zIndex: 1055 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: 16 }}
        >
          <div className="modal-header border-0 px-4 pt-4 pb-2">
            <h5 className="fw-bold mb-0">{item.category_name}</h5>
            <button
              className="btn-close"
              onClick={onClose}
            ></button>
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
                    item.is_active ? 'ms-badge-active' : 'ms-badge-inactive'
                  }
                >
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="col-md-4">
                <span className="ms-label d-block">Created</span>
                <span className="fw-semibold">{fmtDate(item.created_at)}</span>
              </div>
              <div className="col-md-6">
                <span className="ms-label d-block">Gender</span>
                <span className="fw-semibold">{item.gender || '—'}</span>
              </div>
              <div className="col-md-6">
                <span className="ms-label d-block">Price</span>
                <span className="fw-semibold">
                  {item.price > 0 ? `₹${item.price}` : '—'}
                </span>
              </div>
              {item.description && (
                <div className="col-12">
                  <span className="ms-label d-block">Description</span>
                  <p
                    className="mb-0"
                    style={{ fontSize: '.9rem' }}
                  >
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
                    <div
                      className="col-4 col-md-3"
                      key={i}
                    >
                      <img
                        src={url}
                        alt=""
                        style={{
                          width: '100%',
                          height: 90,
                          objectFit: 'cover',
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
            <button
              className="btn btn-light flex-fill"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="btn btn-primary flex-fill"
              onClick={onEdit}
            >
              <i className="bi bi-pencil me-2"></i>Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CREW PANEL
// ══════════════════════════════════════════════════════════════


function CrewPanel({ showToast }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [modal, setModal]     = useState(null); // null | {mode:'add'} | {mode:'edit'|'view', item}
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await listCrewMembers();
      setMembers(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setError('Failed to load crew members.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCrewMember(deleteTarget.id);
      setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast('Crew member deleted.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed.', 'danger');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <style>{`
        .crew-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:18px; }
        .crew-card { border-radius:14px; overflow:hidden; background:#fff; border:1px solid #eef0f4; box-shadow:0 2px 10px rgba(44,50,73,.06); transition:box-shadow .2s,transform .2s; position:relative; }
        .crew-card:hover { box-shadow:0 8px 28px rgba(44,50,73,.14); transform:translateY(-3px); }
        .crew-img-wrap { position:relative; width:100%; padding-top:120%; overflow:hidden; background:#f0f2f8; }
        .crew-img-wrap img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:transform .35s ease; }
        .crew-card:hover .crew-img-wrap img { transform:scale(1.05); }
        .crew-img-placeholder { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#c5cadb; font-size:3rem; }
        .crew-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(20,20,40,.72) 0%,rgba(20,20,40,.1) 55%,transparent 100%); opacity:0; transition:opacity .25s; display:flex; align-items:flex-end; justify-content:center; padding-bottom:12px; gap:8px; }
        .crew-card:hover .crew-overlay { opacity:1; }
        .crew-action-btn { width:34px; height:34px; border-radius:50%; border:none; display:flex; align-items:center; justify-content:center; font-size:.8rem; cursor:pointer; transition:transform .15s,background .15s; }
        .crew-action-btn:hover { transform:scale(1.12); }
        .crew-inactive-badge { position:absolute; top:10px; right:10px; background:rgba(220,53,69,.85); color:#fff; font-size:.65rem; font-weight:700; padding:2px 8px; border-radius:20px; letter-spacing:.5px; }
        .crew-name { padding:10px 12px; font-size:.85rem; font-weight:700; color:#2c3249; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      `}</style>
      <div className="ms-card">
        <div className="ms-card-hd">
          <h5>
            <i className="bi bi-people me-2 text-primary"></i>Crew Gallery
            {members.length > 0 && (
              <span className="ms-badge-active ms-2" style={{ fontSize: '.72rem' }}>{members.length} members</span>
            )}
          </h5>
          <button
            className="btn btn-primary btn-sm px-3"
            onClick={() => setModal({ mode: 'add' })}
          >
            <i className="bi bi-plus-lg me-1"></i>Add Member
          </button>
        </div>
        <div className="ms-card-bd">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : members.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-people fs-1 d-block mb-3 opacity-25"></i>
              <p className="mb-1 fw-semibold">No crew members yet</p>
              <small>Click "Add Member" to upload the first photo.</small>
            </div>
          ) : (
            <div className="crew-grid">
              {members.map((m) => (
                <div className="crew-card" key={m.id}>
                  <div className="crew-img-wrap">
                    {m.image ? (
                      <>
                        <img
                          src={m.image}
                          alt={m.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="crew-img-placeholder" style={{ display: 'none' }}>
                          <i className="bi bi-person"></i>
                        </div>
                      </>
                    ) : (
                      <div className="crew-img-placeholder">
                        <i className="bi bi-person"></i>
                      </div>
                    )}
                    {!m.is_active && <span className="crew-inactive-badge">Inactive</span>}
                    <div className="crew-overlay">
                      <button
                        className="crew-action-btn"
                        style={{ background: '#fff', color: '#435ebe' }}
                        onClick={() => setModal({ mode: 'edit', item: m })}
                        title="Edit"
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button
                        className="crew-action-btn"
                        style={{ background: '#dc3545', color: '#fff' }}
                        onClick={() => setDeleteTarget(m)}
                        title="Delete"
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </div>
                  <div className="crew-name" title={m.name}>{m.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal && (
        <CrewFormModal
          mode={modal.mode}
          initial={modal.item}
          onClose={() => setModal(null)}
          onSaved={(saved) => {
            if (modal.mode === 'add') setMembers((prev) => [saved, ...prev]);
            else setMembers((prev) => prev.map((m) => (m.id === saved.id ? saved : m)));
            setModal(null);
            showToast(modal.mode === 'add' ? 'Crew member added!' : 'Crew member updated!');
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete Crew Member?"
          message={<>Permanently delete <strong>{deleteTarget.name}</strong>? The image will also be removed.</>}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  );
}

// ── Crew Form Modal ────────────────────────────────────────────
function CrewFormModal({ mode, initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:      initial?.name      || '',
    is_active: initial?.is_active !== false,
  });
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState(initial?.image || '');
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');
  const imgRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setErr('Name is required.'); return; }
    if (mode === 'add' && !imageFile) { setErr('Image is required.'); return; }

    setSaving(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('is_active', form.is_active ? 'true' : 'false');
      if (imageFile) fd.append('image', imageFile);

      const res =
        mode === 'add'
          ? await createCrewMember(fd)
          : await updateCrewMember(initial.id, fd);
      onSaved(res.data.data);
    } catch (e) {
      setErr(e.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: 500 }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
          <div className="modal-header border-0 px-4 pt-4 pb-2">
            <div>
              <h5 className="fw-bold mb-0">
                {mode === 'add' ? 'Add Crew Member' : 'Edit Crew Member'}
              </h5>
              <p className="text-muted small mb-0">
                {mode === 'add' ? 'Upload a photo and set details.' : `Editing: ${initial.name}`}
              </p>
            </div>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3">
            {err && (
              <div className="alert alert-danger py-2 mb-3">
                <i className="bi bi-exclamation-circle me-2"></i>{err}
              </div>
            )}

            <div className="row g-3">
              {/* Image upload */}
              <div className="col-12">
                <label className="ms-label">Photo {mode === 'add' ? '*' : ''}</label>
                <div className="d-flex align-items-center gap-3">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt=""
                      style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', border: '2px solid #e0e3ea' }}
                    />
                  ) : (
                    <div
                      style={{ width: 80, height: 80, borderRadius: 10, background: '#f0f2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aa3af', fontSize: '1.5rem', border: '2px dashed #e0e3ea' }}
                    >
                      <i className="bi bi-person"></i>
                    </div>
                  )}
                  <button
                    className="btn btn-outline-secondary btn-sm px-3"
                    onClick={() => imgRef.current?.click()}
                  >
                    <i className="bi bi-image me-1"></i>
                    {imagePreview ? 'Change Photo' : 'Upload Photo'}
                  </button>
                </div>
                <input type="file" ref={imgRef} className="d-none" accept="image/*" onChange={handleImage} />
              </div>

              {/* Name */}
              <div className="col-12">
                <label className="ms-label">Name *</label>
                <input
                  name="name"
                  className="ms-input"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Priya Sharma"
                />
              </div>

              {/* Active toggle */}
              <div className="col-12">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    id="crewActiveSwitch"
                  />
                  <label className="form-check-label fw-semibold small" htmlFor="crewActiveSwitch">
                    {form.is_active ? 'Active (visible in app)' : 'Inactive (hidden)'}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer border-0 px-4 pb-4 pt-2 d-flex gap-2">
            <button className="btn btn-light flex-fill" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn btn-primary flex-fill" onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
              ) : (
                <><i className="bi bi-check-lg me-2"></i>{mode === 'add' ? 'Add Member' : 'Save Changes'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CREW PACKAGES PANEL (Luxury / Premium)
// ══════════════════════════════════════════════════════════════
const PKG_META = {
  LUXURY:  { color: '#6f42c1', bg: '#f5f0ff', border: '#d6bbfb', icon: 'bi-star-fill' },
  PREMIUM: { color: '#856404', bg: '#fff3cd', border: '#ffc107', icon: 'bi-award-fill' },
};

function CrewPackagesPanel({ showToast }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({ LUXURY: { price_per_person: 20000, standard_hours: 8 }, PREMIUM: { price_per_person: 10000, standard_hours: 8 } });
  const [saving, setSaving] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await listCrewPackages();
        const fetched = Array.isArray(res.data.data) ? res.data.data : [];
        setPackages(fetched);
        const d = { ...drafts };
        fetched.forEach((p) => {
          d[p.type] = { price_per_person: p.price_per_person ?? 0, standard_hours: p.standard_hours ?? 8 };
        });
        setDrafts(d);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (pkgType, field, value) =>
    setDrafts((prev) => ({ ...prev, [pkgType]: { ...prev[pkgType], [field]: value } }));

  const handleSave = async (pkgType) => {
    setSaving((prev) => ({ ...prev, [pkgType]: true }));
    setErrors((prev) => ({ ...prev, [pkgType]: '' }));
    try {
      const d = drafts[pkgType];
      const res = await updateCrewPackage(pkgType, {
        price_per_person: parseFloat(d.price_per_person) || 0,
        standard_hours: parseInt(d.standard_hours, 10) || 8,
      });
      const updated = res.data.data;
      setPackages((prev) => {
        const exists = prev.find((p) => p.type === pkgType);
        return exists ? prev.map((p) => (p.type === pkgType ? updated : p)) : [...prev, updated];
      });
      showToast(`${pkgType} package saved!`);
    } catch (err) {
      setErrors((prev) => ({ ...prev, [pkgType]: err.response?.data?.message || 'Save failed.' }));
    } finally {
      setSaving((prev) => ({ ...prev, [pkgType]: false }));
    }
  };

  if (loading)
    return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div>
      <p className="text-muted mb-4" style={{ fontSize: '.9rem' }}>
        Set the per-person price and standard working hours for each crew package.
        The extra-hour rate is automatically calculated as <strong>price ÷ standard hours</strong>.
      </p>
      <div className="row g-4">
        {['LUXURY', 'PREMIUM'].map((pkgType) => {
          const cfg = PKG_META[pkgType];
          const draft = drafts[pkgType] || { price_per_person: 0, standard_hours: 8 };
          const extraRate = draft.standard_hours > 0
            ? Math.round(parseFloat(draft.price_per_person || 0) / parseInt(draft.standard_hours, 10))
            : 0;
          return (
            <div className="col-md-6" key={pkgType}>
              <div className="plan-card" style={{ background: cfg.bg, borderColor: cfg.border }}>
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="fw-800 fs-5" style={{ color: cfg.color, fontWeight: 800 }}>
                    <i className={`bi ${cfg.icon} me-2`}></i>{pkgType}
                  </span>
                </div>
                {errors[pkgType] && (
                  <div className="alert alert-danger py-1 px-2 mb-2" style={{ fontSize: '.8rem' }}>
                    {errors[pkgType]}
                  </div>
                )}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="ms-label" style={{ color: cfg.color }}>Price / Person (₹)</label>
                    <input type="number" className="plan-input" min="0" step="1"
                      value={draft.price_per_person}
                      onChange={(e) => handleChange(pkgType, 'price_per_person', e.target.value)} />
                  </div>
                  <div className="col-6">
                    <label className="ms-label" style={{ color: cfg.color }}>Standard Hours</label>
                    <input type="number" className="plan-input" min="1" step="1"
                      value={draft.standard_hours}
                      onChange={(e) => handleChange(pkgType, 'standard_hours', e.target.value)} />
                  </div>
                </div>
                <div className="mb-3 px-1" style={{ fontSize: '.82rem', color: cfg.color }}>
                  Extra hour rate: <strong>₹{extraRate.toLocaleString('en-IN')}/hr per person</strong>
                </div>
                <button className="btn btn-sm w-100 fw-bold"
                  style={{ background: cfg.color, color: '#fff', border: 'none', borderRadius: 8 }}
                  onClick={() => handleSave(pkgType)} disabled={saving[pkgType]}>
                  {saving[pkgType] ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
                  ) : (
                    <><i className="bi bi-check-lg me-1"></i>Save {pkgType}</>
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
const STAFF_PKG_META = [
  { key: 'LUXURY',  label: 'Luxury',  color: '#6f42c1', bg: '#f5f0ff', border: '#d6bbfb', icon: 'bi-star-fill' },
  { key: 'PREMIUM', label: 'Premium', color: '#856404', bg: '#fff3cd', border: '#ffc107', icon: 'bi-award-fill' },
];

function PaymentPanel({ showToast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [lastUpd, setLastUpd] = useState(null);

  const [pct, setPct]               = useState('');
  const [staffPricing, setStaffPricing] = useState({ LUXURY: 20000, PREMIUM: 10000 });
  const [hoursPerDay, setHoursPerDay]   = useState('5');
  const [overtimeRate, setOvertimeRate] = useState('3000');

  useEffect(() => {
    (async () => {
      try {
        const res = await getPaymentTerms();
        const d = res.data.data;
        if (d.advancePercentage != null) setPct(String(d.advancePercentage));
        if (d.staff_pricing)          setStaffPricing(d.staff_pricing);
        if (d.default_hours_per_day)  setHoursPerDay(String(d.default_hours_per_day));
        if (d.overtime_rate_per_hour) setOvertimeRate(String(d.overtime_rate_per_hour));
        setLastUpd(d.lastUpdatedAt);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    const val = parseFloat(pct);
    if (isNaN(val) || val < 0 || val > 100) {
      setError('Advance percentage must be between 0 and 100.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await updatePaymentTerms({
        advancePercentage: val,
        staff_pricing: {
          LUXURY: parseFloat(staffPricing.LUXURY) || 0,
          PREMIUM: parseFloat(staffPricing.PREMIUM) || 0,
        },
        default_hours_per_day: parseFloat(hoursPerDay) || 5,
        overtime_rate_per_hour: parseFloat(overtimeRate) || 3000,
      });
      setLastUpd(res.data.data.lastUpdatedAt);
      showToast('Payment terms updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  const numPct = parseFloat(pct) || 0;

  return (
    <div className="row g-4">

      {/* ── Left column: Advance % + Billing Hours ── */}
      <div className="col-lg-5">
        <div className="ms-card h-100">
          <div className="ms-card-hd">
            <h5><i className="bi bi-credit-card me-2 text-primary"></i>Advance Payment</h5>
          </div>
          <div className="ms-card-bd">
            <p className="text-muted mb-4" style={{ fontSize: '.88rem' }}>
              Percentage of event total collected upfront from the client.
            </p>
            {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
            <div className="text-center mb-3">
              <label className="ms-label d-block mb-2 text-center">Advance Required (%)</label>
              <div className="d-flex align-items-center justify-content-center gap-2">
                <input
                  type="number" className="pay-big-input" min="0" max="100" step="1"
                  value={pct} onChange={(e) => setPct(e.target.value)} placeholder="0"
                />
                <span style={{ fontSize: '2rem', fontWeight: 800, color: '#9aa3af' }}>%</span>
              </div>
            </div>
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-1">
                <small className="text-muted">Advance</small>
                <small className="text-muted">On Completion</small>
              </div>
              <div style={{ background: '#f0f2f5', borderRadius: 20, height: 12, overflow: 'hidden', border: '1px solid #e0e3ea' }}>
                <div style={{ width: `${Math.min(numPct, 100)}%`, background: 'linear-gradient(90deg,#435ebe,#6979f8)', height: '100%', borderRadius: 20, transition: 'width .4s' }} />
              </div>
              <div className="d-flex justify-content-between mt-1">
                <small className="fw-bold text-primary">{numPct}%</small>
                <small className="fw-bold text-muted">{Math.max(0, 100 - numPct)}%</small>
              </div>
            </div>

            <div className="ms-section-rule">Billing Hours</div>
            <div className="row g-3 mb-3">
              <div className="col-6">
                <label className="ms-label">Default Hours / Day</label>
                <div className="input-group input-group-sm">
                  <input
                    type="number" className="form-control ms-input" min="1" step="0.5"
                    value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)}
                  />
                  <span className="input-group-text" style={{ fontSize: '.8rem', background: '#f0f2f8', border: '1.5px solid #e0e3ea' }}>hrs</span>
                </div>
              </div>
              <div className="col-6">
                <label className="ms-label">Overtime Rate / hr</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text" style={{ fontSize: '.8rem', background: '#f0f2f8', border: '1.5px solid #e0e3ea' }}>₹</span>
                  <input
                    type="number" className="form-control ms-input" min="0" step="100"
                    value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="p-2 rounded-3 mb-3" style={{ background: '#f0f4ff', border: '1px solid #d0d8f5', fontSize: '.8rem', color: '#4a5568' }}>
              <i className="bi bi-info-circle text-primary me-1"></i>
              After <strong>{hoursPerDay || 5} hours</strong>, each extra hour is charged at <strong>₹{Number(overtimeRate || 3000).toLocaleString('en-IN')}/hr</strong>.
            </div>

            <button className="btn btn-primary w-100 py-2 fw-bold" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : <><i className="bi bi-check-lg me-2"></i>Save All Payment Terms</>}
            </button>
            {lastUpd && (
              <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: '.75rem' }}>
                <i className="bi bi-clock me-1"></i>Last updated: {fmtDate(lastUpd)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Right column: Staff Pricing per Package ── */}
      <div className="col-lg-7">
        <div className="ms-card h-100">
          <div className="ms-card-hd">
            <h5><i className="bi bi-people me-2 text-primary"></i>Staff Pricing per Package</h5>
            <span className="text-muted" style={{ fontSize: '.78rem' }}>per person / per day</span>
          </div>
          <div className="ms-card-bd">
            <p className="text-muted mb-4" style={{ fontSize: '.88rem' }}>
              Price charged per staff member per day for each package type. Used by the mobile app to calculate event costs.
            </p>
            <div className="row g-3">
              {STAFF_PKG_META.map(({ key, label, color, bg, border, icon }) => (
                <div className="col-md-6" key={key}>
                  <div className="p-3 rounded-3" style={{ background: bg, border: `1.5px solid ${border}` }}>
                    <label className="ms-label d-flex align-items-center gap-1 mb-2" style={{ color }}>
                      <i className={`bi ${icon}`}></i>
                      {label} — Price per Person / Day
                    </label>
                    <div className="input-group">
                      <span className="input-group-text fw-bold" style={{ background: color, color: '#fff', border: 'none', fontSize: '.85rem' }}>₹</span>
                      <input
                        type="number" min="0" step="500"
                        className="form-control fw-bold"
                        style={{ borderColor: `${color}50`, fontSize: '1rem' }}
                        value={staffPricing[key] ?? ''}
                        onChange={(e) => setStaffPricing((p) => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                    <small className="text-muted mt-1 d-block" style={{ fontSize: '.72rem' }}>
                      5 staff × 1 day = ₹{(Number(staffPricing[key] || 0) * 5).toLocaleString('en-IN')}
                    </small>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-3 d-flex gap-3 align-items-start" style={{ background: '#f0f4ff', border: '1px solid #d0d8f5' }}>
              <i className="bi bi-info-circle text-primary mt-1"></i>
              <div style={{ fontSize: '.83rem', color: '#4a5568' }}>
                These prices are sent to the mobile app via the public pricing API and used to calculate the total event cost before the client books.
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COUPONS PANEL
// ══════════════════════════════════════════════════════════════
function CouponsPanel({ showToast }) {
  const [coupons, setCoupons]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [modal, setModal]           = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await listCoupons();
      setCoupons(Array.isArray(res.data.data) ? res.data.data : []);
    } catch { setError('Failed to load coupons.'); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCoupon(deleteTarget.id);
      setCoupons((p) => p.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast('Coupon deleted.');
    } catch (err) { showToast(err.response?.data?.message || 'Delete failed.', 'danger'); }
    finally { setDeleting(false); }
  };

  const isExpired = (c) => c.expiry_date && new Date(c.expiry_date) < new Date();
  const isExhausted = (c) => c.usage_limit > 0 && c.used_count >= c.usage_limit;

  return (
    <div className="ms-card">
      <div className="ms-card-hd">
        <h5><i className="bi bi-ticket-perforated me-2 text-primary"></i>Coupon Codes</h5>
        <button className="btn btn-primary btn-sm px-3" onClick={() => setModal({ mode: 'add' })}>
          <i className="bi bi-plus-lg me-1"></i>Create Coupon
        </button>
      </div>
      <div className="ms-card-bd">
        {loading ? (
          <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-ticket-perforated fs-1 d-block mb-3 opacity-25"></i>
            <p className="mb-1 fw-semibold">No coupons yet</p>
            <small>Create a coupon to share discount codes with clients.</small>
          </div>
        ) : (
          <div className="row g-3">
            {coupons.map((c) => {
              const expired   = isExpired(c);
              const exhausted = isExhausted(c);
              const usagePct  = c.usage_limit > 0 ? Math.min((c.used_count / c.usage_limit) * 100, 100) : 0;
              return (
                <div className="col-md-6 col-lg-4" key={c.id}>
                  <div className="ms-item flex-column align-items-start gap-2" style={{ padding: '16px 18px' }}>
                    {/* Code + badge row */}
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <code style={{ fontSize: '1rem', fontWeight: 800, color: '#435ebe', letterSpacing: 1 }}>{c.code}</code>
                      <span className={
                        !c.is_active || expired || exhausted ? 'ms-badge-inactive' : 'ms-badge-active'
                      }>
                        {!c.is_active ? 'Inactive' : expired ? 'Expired' : exhausted ? 'Exhausted' : 'Active'}
                      </span>
                    </div>

                    {/* Discount */}
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ background: '#e8f5e9', color: '#2e7d32', borderRadius: 6, padding: '2px 10px', fontSize: '.8rem', fontWeight: 700 }}>
                        {c.discount_type === 'PERCENTAGE' ? `${c.discount_value}% OFF` : `₹${Number(c.discount_value).toLocaleString('en-IN')} OFF`}
                      </span>
                      {c.description && <small className="text-muted text-truncate" style={{ maxWidth: 120 }}>{c.description}</small>}
                    </div>

                    {/* Usage bar */}
                    <div className="w-100">
                      <div className="d-flex justify-content-between mb-1">
                        <small className="text-muted" style={{ fontSize: '.72rem' }}>Used {c.used_count} / {c.usage_limit}</small>
                        {c.expiry_date && (
                          <small className={`${expired ? 'text-danger' : 'text-muted'}`} style={{ fontSize: '.72rem' }}>
                            {expired ? 'Expired ' : 'Expires '}{fmtDate(c.expiry_date)}
                          </small>
                        )}
                      </div>
                      <div style={{ background: '#f0f2f5', borderRadius: 10, height: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${usagePct}%`, background: exhausted ? '#dc3545' : '#435ebe', height: '100%', borderRadius: 10, transition: 'width .4s' }} />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-2 w-100 mt-1">
                      <button className="btn btn-sm btn-outline-secondary flex-fill" onClick={() => setModal({ mode: 'edit', item: c })}>
                        <i className="bi bi-pencil me-1"></i>Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setDeleteTarget(c)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <CouponFormModal
          mode={modal.mode}
          initial={modal.item}
          onClose={() => setModal(null)}
          onSaved={(saved) => {
            if (modal.mode === 'add') setCoupons((p) => [saved, ...p]);
            else setCoupons((p) => p.map((c) => (c.id === saved.id ? saved : c)));
            setModal(null);
            showToast(modal.mode === 'add' ? 'Coupon created!' : 'Coupon updated!');
          }}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete Coupon?"
          message={<>Permanently delete coupon <strong>{deleteTarget.code}</strong>?</>}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}

// ── Coupon Form Modal ──────────────────────────────────────────
function CouponFormModal({ mode, initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    code:           initial?.code          || '',
    description:    initial?.description   || '',
    discount_type:  initial?.discount_type || 'FLAT',
    discount_value: initial?.discount_value ?? '',
    usage_limit:    initial?.usage_limit   ?? 1,
    is_active:      initial?.is_active     !== false,
    expiry_date:    initial?.expiry_date
      ? new Date(initial.expiry_date).toISOString().split('T')[0]
      : '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    if (mode === 'add' && !form.code.trim()) { setErr('Coupon code is required.'); return; }
    if (form.discount_value === '' || isNaN(Number(form.discount_value))) { setErr('Discount value is required.'); return; }
    setSaving(true); setErr('');
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discount_value: Number(form.discount_value),
        usage_limit: Number(form.usage_limit),
        expiry_date: form.expiry_date || null,
      };
      const res = mode === 'add' ? await createCoupon(payload) : await updateCoupon(initial.id, payload);
      onSaved(res.data.data);
    } catch (e) { setErr(e.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: 480 }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
          <div className="modal-header border-0 px-4 pt-4 pb-2">
            <h5 className="fw-bold mb-0">{mode === 'add' ? 'Create Coupon' : 'Edit Coupon'}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body px-4 py-3">
            {err && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2"></i>{err}</div>}
            <div className="row g-3">
              <div className="col-12">
                <label className="ms-label">Coupon Code *</label>
                <input
                  name="code" className="ms-input fw-bold" value={form.code}
                  onChange={handleChange} placeholder="e.g. SAVE20"
                  disabled={mode === 'edit'}
                  style={{ textTransform: 'uppercase', letterSpacing: 1, ...(mode === 'edit' ? { opacity: .6, cursor: 'not-allowed' } : {}) }}
                />
              </div>
              <div className="col-12">
                <label className="ms-label">Description</label>
                <input name="description" className="ms-input" value={form.description} onChange={handleChange} placeholder="e.g. 20% off for new clients" />
              </div>
              <div className="col-6">
                <label className="ms-label">Discount Type</label>
                <select name="discount_type" className="ms-select" value={form.discount_type} onChange={handleChange}>
                  <option value="FLAT">Flat (₹)</option>
                  <option value="PERCENTAGE">Percentage (%)</option>
                </select>
              </div>
              <div className="col-6">
                <label className="ms-label">Discount Value *</label>
                <div className="input-group">
                  <span className="input-group-text" style={{ background: '#f0f2f8', border: '1.5px solid #e0e3ea', fontSize: '.85rem' }}>
                    {form.discount_type === 'PERCENTAGE' ? '%' : '₹'}
                  </span>
                  <input
                    name="discount_value" type="number" min="0" className="form-control ms-input"
                    value={form.discount_value} onChange={handleChange} placeholder="0"
                  />
                </div>
              </div>
              <div className="col-6">
                <label className="ms-label">Usage Limit</label>
                <input name="usage_limit" type="number" min="1" className="ms-input" value={form.usage_limit} onChange={handleChange} />
                <small className="text-muted" style={{ fontSize: '.72rem' }}>Max times this coupon can be used</small>
              </div>
              <div className="col-6">
                <label className="ms-label">Expiry Date</label>
                <input name="expiry_date" type="date" className="ms-input" value={form.expiry_date} onChange={handleChange} />
              </div>
              <div className="col-12">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" name="is_active" id="couponActive" checked={form.is_active} onChange={handleChange} />
                  <label className="form-check-label fw-semibold small" htmlFor="couponActive">
                    {form.is_active ? 'Active (usable by clients)' : 'Inactive (disabled)'}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer border-0 px-4 pb-4 pt-2 d-flex gap-2">
            <button className="btn btn-light flex-fill" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn btn-primary flex-fill" onClick={handleSubmit} disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : <><i className="bi bi-check-lg me-2"></i>{mode === 'add' ? 'Create Coupon' : 'Save Changes'}</>}
            </button>
          </div>
        </div>
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
      style={{ background: 'rgba(0,0,0,.5)', zIndex: 1060 }}
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
            <p
              className="text-muted mb-0"
              style={{ fontSize: '.9rem' }}
            >
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