// src/pages/user_management/MakeupArtistDetails.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMua,
  updateMua,
  deleteMua,
  uploadMuaImages,
  deleteMuaGalleryImage,
} from '../../api/muaApi';

// ── Constants ──────────────────────────────────────────────────
const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', badge: 'success', icon: 'bi-check-circle-fill' },
  ONEVENT: {
    label: 'On Event',
    badge: 'warning',
    icon: 'bi-calendar-event-fill',
  },
  INACTIVE: {
    label: 'Inactive',
    badge: 'secondary',
    icon: 'bi-dash-circle-fill',
  },
  BLOCKED: { label: 'Blocked', badge: 'danger', icon: 'bi-x-circle-fill' },
};

const STATUSES = ['ACTIVE', 'INACTIVE', 'BLOCKED'];
const GENDERS = ['Female', 'Male', 'Other'];
const SPECIALITIES = [
  'Bridal',
  'HD Makeup',
  'Airbrush',
  'Editorial',
  'Special FX',
  'Theatrical',
  'Fashion',
  'Film & TV',
  'Other',
];

// ── Helpers ────────────────────────────────────────────────────
const initials = (name) =>
  (name || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const ACCENT = '#e91e8c';

// ── Sub-components ─────────────────────────────────────────────
const Field = ({ label, value }) => (
  <div>
    <label className="md-label">{label}</label>
    <div className="md-value">{value || '—'}</div>
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
    <label className="md-label">{label}</label>
    <input
      type={type}
      name={name}
      className="md-input"
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

const EditSelect = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="md-label">{label}</label>
    <select
      name={name}
      className="md-select"
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
export default function MakeupArtistDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── Core ────────────────────────────────────────────────────
  const [mua, setMua] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Edit ────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── Delete ──────────────────────────────────────────────────
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // ── Avatar upload ───────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  // ── Gallery upload ──────────────────────────────────────────
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [deletingImg, setDeletingImg] = useState(null);
  const galleryInputRef = useRef(null);

  // ── Toast ────────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  // ── Fetch ────────────────────────────────────────────────────
  const fetchMua = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMua(id);
      setMua(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load makeup artist.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMua();
  }, [fetchMua]);

  // ── Edit handlers ────────────────────────────────────────────
  const startEdit = () => {
    setDraft({
      full_name: mua.full_name || '',
      gender: mua.gender || '',
      makeup_speciality: mua.makeup_speciality || '',
      city: mua.city || '',
      state: mua.state || '',
      country: mua.country || '',
      experience_in_years: mua.experience_in_years ?? '',
      status: mua.status?.toUpperCase() || 'ACTIVE',
    });
    setSaveError('');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft({});
    setSaveError('');
  };

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!draft.full_name?.trim()) {
      setSaveError('Full name is required.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const res = await updateMua(mua.id, {
        full_name: draft.full_name.trim(),
        gender: draft.gender,
        makeup_speciality: draft.makeup_speciality,
        city: draft.city.trim(),
        state: draft.state.trim(),
        country: draft.country.trim(),
        experience_in_years:
          draft.experience_in_years !== ''
            ? Number(draft.experience_in_years)
            : null,
        status: draft.status,
      });
      setMua((prev) => ({ ...prev, ...res.data.data }));
      setIsEditing(false);
      showToast('Profile updated successfully!');
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteMua(mua.id);
      navigate('/admin/makeup-artist', { replace: true });
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete.');
      setDeleting(false);
    }
  };

  // ── Avatar ────────────────────────────────────────────────────
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('profile_picture', avatarFile);
      const res = await uploadMuaImages(mua.id, fd);
      setMua((prev) => ({
        ...prev,
        profile_picture: res.data.data.profile_picture,
      }));
      setAvatarFile(null);
      setAvatarPreview(null);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
      showToast('Profile picture updated!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed.', 'danger');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const cancelAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  // ── Gallery ───────────────────────────────────────────────────
  const handleGallerySelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setGalleryFiles(files);
    setGalleryPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleGalleryUpload = async () => {
    if (!galleryFiles.length) return;
    setUploadingGallery(true);
    try {
      const fd = new FormData();
      galleryFiles.forEach((f) => fd.append('gallery_images', f));
      const res = await uploadMuaImages(mua.id, fd);
      setMua((prev) => ({
        ...prev,
        gallery_images: res.data.data.gallery_images,
      }));
      setGalleryFiles([]);
      setGalleryPreviews([]);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      showToast(
        `${galleryFiles.length} image${galleryFiles.length > 1 ? 's' : ''} added!`,
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed.', 'danger');
    } finally {
      setUploadingGallery(false);
    }
  };

  const cancelGalleryPreview = () => {
    setGalleryFiles([]);
    setGalleryPreviews([]);
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleDeleteGalleryImage = async (imageUrl) => {
    setDeletingImg(imageUrl);
    try {
      const res = await deleteMuaGalleryImage(mua.id, imageUrl);
      setMua((prev) => ({
        ...prev,
        gallery_images: res.data.data.gallery_images,
      }));
      showToast('Image removed.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete.', 'danger');
    } finally {
      setDeletingImg(null);
    }
  };

  // ── Loading / error ───────────────────────────────────────────
  if (loading)
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: 400 }}
      >
        <div className="text-center">
          <div
            className="spinner-border mb-3"
            style={{ width: 44, height: 44, color: ACCENT }}
          />
          <p className="text-muted small">Loading artist profile…</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="page-content">
        <button
          className="btn btn-light shadow-sm mb-4"
          onClick={() => navigate('/admin/makeup-artist')}
        >
          <i className="bi bi-arrow-left me-1"></i> Back
        </button>
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  if (!mua) return null;

  const statusKey = (isEditing ? draft.status : mua.status)?.toUpperCase();
  const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.INACTIVE;
  const displayPic = avatarPreview || mua.profile_picture;

  return (
    <>
      <style>{`
        .md-label { font-size:.7rem; text-transform:uppercase; letter-spacing:.9px; font-weight:700; color:#9aa3af; margin-bottom:4px; display:block; }
        .md-value { font-size:.9rem; font-weight:600; color:#2c3249; padding:7px 0; border-bottom:1px solid #f0f2f5; min-height:34px; }
        .md-input { width:100%; border-radius:8px; border:1.5px solid #e0e3ea; background:#f8f9fc; font-size:.88rem; padding:7px 11px; color:#2c3249; font-weight:600; transition:all .2s; }
        .md-input:focus { outline:none; border-color:${ACCENT}; box-shadow:0 0 0 3px ${ACCENT}22; background:#fff; }
        .md-select { width:100%; border-radius:8px; border:1.5px solid #e0e3ea; background:#f8f9fc; font-size:.88rem; padding:7px 11px; color:#2c3249; font-weight:600; transition:all .2s; }
        .md-select:focus { outline:none; border-color:${ACCENT}; box-shadow:0 0 0 3px ${ACCENT}22; background:#fff; }
        .md-card { background:#fff; border-radius:14px; border:1px solid #eef0f4; box-shadow:0 2px 12px rgba(44,50,73,.06); overflow:hidden; margin-bottom:20px; }
        .md-card-hd { padding:14px 22px; border-bottom:1px solid #f5f6fa; display:flex; align-items:center; gap:10px; }
        .md-card-hd h6 { margin:0; font-size:.82rem; font-weight:700; text-transform:uppercase; letter-spacing:.9px; color:#4a5568; }
        .md-card-bd { padding:22px; }
        .md-avatar-wrap { position:relative; display:inline-block; cursor:pointer; }
        .md-avatar-wrap:hover .md-avatar-overlay { opacity:1; }
        .md-avatar-overlay { position:absolute; inset:0; border-radius:50%; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s; color:#fff; font-size:1.3rem; }
        .md-stat { background:#f8f9fc; border-radius:10px; padding:12px 14px; text-align:center; }
        .md-stat-val { font-size:1rem; font-weight:800; color:#2c3249; line-height:1.2; }
        .md-stat-lbl { font-size:.68rem; text-transform:uppercase; letter-spacing:.8px; color:#9aa3af; margin-top:3px; font-weight:600; }
        .md-speciality-pill { display:inline-flex; align-items:center; gap:5px; padding:5px 14px; border-radius:20px; font-size:.78rem; font-weight:700; letter-spacing:.5px; background:#fce4f0; color:#c2185b; border:1px solid #f48fb1; }
        .md-gallery-item { position:relative; border-radius:10px; overflow:hidden; }
        .md-gallery-img { height:160px; width:100%; object-fit:cover; display:block; transition:transform .2s; }
        .md-gallery-item:hover .md-gallery-img { transform:scale(1.04); }
        .md-gallery-del { position:absolute; top:7px; right:7px; opacity:0; transition:opacity .2s; }
        .md-gallery-item:hover .md-gallery-del { opacity:1; }
        .md-gallery-preview { border:2px dashed ${ACCENT}; border-radius:10px; overflow:hidden; height:160px; position:relative; }
        .md-gallery-preview img { width:100%; height:100%; object-fit:cover; opacity:.7; }
        .md-gallery-preview-lbl { position:absolute; bottom:6px; left:50%; transform:translateX(-50%); background:${ACCENT}dd; color:#fff; font-size:.68rem; font-weight:700; padding:2px 8px; border-radius:20px; white-space:nowrap; }
        .md-section-rule { font-size:.68rem; text-transform:uppercase; letter-spacing:1px; color:#c5cadb; font-weight:700; display:flex; align-items:center; gap:8px; margin:18px 0 14px; }
        .md-section-rule::after { content:""; flex:1; height:1px; background:#f0f2f5; }
        .md-toast { position:fixed; top:24px; right:24px; z-index:9999; background:#fff; border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,.13); padding:13px 20px; display:flex; align-items:center; gap:10px; font-size:.86rem; font-weight:600; color:#2c3249; animation:mdSlide .3s ease; }
        .md-toast.success { border-left:4px solid #28a745; }
        .md-toast.danger  { border-left:4px solid #dc3545; }
        @keyframes mdSlide { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
      `}</style>

      {/* Toast */}
      {toast.msg && (
        <div className={`md-toast ${toast.type}`}>
          <i
            className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-circle-fill text-danger'} fs-5`}
          ></i>
          {toast.msg}
        </div>
      )}

      {/* ── HEADING ─────────────────────────────────────────── */}
      <div className="page-heading">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-light shadow-sm"
              onClick={() => navigate('/admin/makeup-artist')}
            >
              <i className="bi bi-arrow-left me-1"></i> MUAs
            </button>
            <div>
              <h3 className="mb-0">{mua.full_name || 'Artist Profile'}</h3>
              <p className="text-muted mb-0 small">Makeup Artist Details</p>
            </div>
          </div>
          <div className="d-flex gap-2">
            {!isEditing ? (
              <>
                <button
                  className="btn btn-outline-danger px-3"
                  data-bs-toggle="modal"
                  data-bs-target="#deleteMuaModal"
                >
                  <i className="bi bi-trash me-1"></i>Delete
                </button>
                <button
                  className="btn px-4"
                  style={{ background: ACCENT, color: '#fff', border: 'none' }}
                  onClick={startEdit}
                >
                  <i className="bi bi-pencil-square me-2"></i>Edit Profile
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

      {/* ── PAGE CONTENT ─────────────────────────────────────── */}
      <div className="page-content">
        {saveError && (
          <div className="alert alert-danger py-2 mb-3">
            <i className="bi bi-exclamation-circle me-2"></i>
            {saveError}
          </div>
        )}

        <div className="row g-4">
          {/* ── LEFT ─────────────────────────────────────────── */}
          <div className="col-lg-4">
            {/* Avatar card */}
            <div className="md-card">
              <div className="md-card-bd text-center">
                {/* Clickable avatar */}
                <div
                  className="md-avatar-wrap mb-3"
                  onClick={() => avatarInputRef.current?.click()}
                  title="Click to change photo"
                >
                  {displayPic ? (
                    <img
                      src={displayPic}
                      alt={mua.full_name}
                      className="rounded-circle"
                      style={{
                        width: 110,
                        height: 110,
                        objectFit: 'cover',
                        border: `4px solid ${ACCENT}`,
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white mx-auto"
                      style={{
                        width: 110,
                        height: 110,
                        background: `linear-gradient(135deg, ${ACCENT}, #9c27b0)`,
                        fontSize: '2rem',
                        border: `4px solid ${ACCENT}55`,
                      }}
                    >
                      {initials(isEditing ? draft.full_name : mua.full_name)}
                    </div>
                  )}
                  <div className="md-avatar-overlay">
                    <i className="bi bi-camera-fill"></i>
                  </div>
                  <span
                    className={`badge bg-${statusCfg.badge} position-absolute bottom-0 end-0`}
                    style={{ fontSize: '.7rem', padding: '4px 8px' }}
                  >
                    {statusCfg.label}
                  </span>
                </div>

                <input
                  type="file"
                  ref={avatarInputRef}
                  className="d-none"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                />

                {avatarFile && (
                  <>
                    <div className="d-flex gap-2 justify-content-center mb-2">
                      <button
                        className="btn btn-sm btn-success px-3"
                        onClick={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      >
                        {uploadingAvatar ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1" />
                            Uploading…
                          </>
                        ) : (
                          <>
                            <i className="bi bi-cloud-upload me-1"></i>Save
                            Photo
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-sm btn-light"
                        onClick={cancelAvatarPreview}
                        disabled={uploadingAvatar}
                      >
                        Cancel
                      </button>
                    </div>
                    <p
                      className="text-muted mb-3"
                      style={{ fontSize: '.72rem' }}
                    >
                      <i className="bi bi-info-circle me-1 text-primary"></i>
                      Preview — click Save Photo to upload
                    </p>
                  </>
                )}

                <h5 className="fw-bold mb-1">
                  {isEditing ? draft.full_name || '—' : mua.full_name}
                </h5>
                <div className="mb-3">
                  {(isEditing
                    ? draft.makeup_speciality
                    : mua.makeup_speciality) && (
                    <span className="md-speciality-pill">
                      <i className="bi bi-stars"></i>
                      {isEditing
                        ? draft.makeup_speciality
                        : mua.makeup_speciality}
                    </span>
                  )}
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <div className="md-stat">
                      <div className="md-stat-val">
                        {(isEditing
                          ? draft.experience_in_years
                          : mua.experience_in_years) ?? '—'}
                      </div>
                      <div className="md-stat-lbl">Yrs Exp</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="md-stat">
                      <div
                        className="md-stat-val"
                        style={{ fontSize: '.85rem' }}
                      >
                        {(isEditing ? draft.city : mua.city) || '—'}
                      </div>
                      <div className="md-stat-lbl">City</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account info */}
            <div className="md-card">
              <div className="md-card-hd">
                <i className="bi bi-info-circle text-muted"></i>
                <h6>Account Info</h6>
              </div>
              <div className="md-card-bd">
                <div className="row g-3">
                  <div className="col-12">
                    <Field
                      label="Profile ID"
                      value={mua.id}
                    />
                  </div>
                  <div className="col-12">
                    <Field
                      label="User ID"
                      value={mua.user_id}
                    />
                  </div>
                  <div className="col-12">
                    <Field
                      label="Email"
                      value={mua.email}
                    />
                  </div>
                  <div className="col-12">
                    <Field
                      label="Phone"
                      value={mua.phone_number}
                    />
                  </div>
                  <div className="col-12">
                    <Field
                      label="Joined"
                      value={fmtDate(mua.joined_date)}
                    />
                  </div>
                  <div className="col-12">
                    <label className="md-label">Account Status</label>
                    {isEditing ? (
                      <EditSelect
                        name="status"
                        value={draft.status}
                        onChange={handleDraftChange}
                        options={STATUSES.map((s) => ({
                          value: s,
                          label: STATUS_CONFIG[s]?.label || s,
                        }))}
                      />
                    ) : (
                      <div className="md-value">
                        <span
                          className={`badge bg-${statusCfg.badge} px-3 py-2`}
                          style={{ fontSize: '.8rem' }}
                        >
                          <i className={`bi ${statusCfg.icon} me-1`}></i>
                          {statusCfg.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT ────────────────────────────────────────── */}
          <div className="col-lg-8">
            {/* Profile Details */}
            <div className="md-card">
              <div className="md-card-hd">
                <i
                  className="bi bi-person"
                  style={{ color: ACCENT }}
                ></i>
                <h6>Profile Details</h6>
              </div>
              <div className="md-card-bd">
                <div className="row g-4">
                  {isEditing ? (
                    <>
                      <div className="col-md-6">
                        <EditInput
                          label="Full Name *"
                          name="full_name"
                          value={draft.full_name}
                          onChange={handleDraftChange}
                          placeholder="Full name"
                        />
                      </div>
                      <div className="col-md-6">
                        <EditSelect
                          label="Gender"
                          name="gender"
                          value={draft.gender}
                          onChange={handleDraftChange}
                          options={[
                            { value: '', label: '— Select —' },
                            ...GENDERS.map((g) => ({ value: g, label: g })),
                          ]}
                        />
                      </div>
                      <div className="col-md-6">
                        <EditSelect
                          label="Makeup Speciality"
                          name="makeup_speciality"
                          value={draft.makeup_speciality}
                          onChange={handleDraftChange}
                          options={[
                            { value: '', label: '— Select —' },
                            ...SPECIALITIES.map((s) => ({
                              value: s,
                              label: s,
                            })),
                          ]}
                        />
                      </div>
                      <div className="col-md-6">
                        <EditInput
                          label="Experience (Years)"
                          name="experience_in_years"
                          type="number"
                          value={draft.experience_in_years}
                          onChange={handleDraftChange}
                          placeholder="0"
                        />
                      </div>
                      <div className="col-md-6">
                        <EditInput
                          label="City"
                          name="city"
                          value={draft.city}
                          onChange={handleDraftChange}
                          placeholder="City"
                        />
                      </div>
                      <div className="col-md-6">
                        <EditInput
                          label="State"
                          name="state"
                          value={draft.state}
                          onChange={handleDraftChange}
                          placeholder="State"
                        />
                      </div>
                      <div className="col-md-6">
                        <EditInput
                          label="Country"
                          name="country"
                          value={draft.country}
                          onChange={handleDraftChange}
                          placeholder="Country"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-md-6">
                        <Field
                          label="Full Name"
                          value={mua.full_name}
                        />
                      </div>
                      <div className="col-md-6">
                        <Field
                          label="Gender"
                          value={mua.gender}
                        />
                      </div>
                      <div className="col-md-6">
                        <Field
                          label="Makeup Speciality"
                          value={mua.makeup_speciality}
                        />
                      </div>
                      <div className="col-md-6">
                        <Field
                          label="Experience"
                          value={
                            mua.experience_in_years != null
                              ? `${mua.experience_in_years} years`
                              : null
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <Field
                          label="City"
                          value={mua.city}
                        />
                      </div>
                      <div className="col-md-6">
                        <Field
                          label="State"
                          value={mua.state}
                        />
                      </div>
                      <div className="col-md-6">
                        <Field
                          label="Country"
                          value={mua.country}
                        />
                      </div>
                      <div className="col-md-6">
                        <Field
                          label="Joined"
                          value={fmtDate(mua.joined_date)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Work Portfolio / Gallery */}
            <div className="md-card">
              <div className="md-card-hd">
                <i
                  className="bi bi-images"
                  style={{ color: ACCENT }}
                ></i>
                <h6>Work Portfolio</h6>
                <span
                  className="ms-auto badge bg-light text-muted border"
                  style={{ fontSize: '.72rem' }}
                >
                  {mua.gallery_images?.length || 0} images
                </span>
              </div>
              <div className="md-card-bd">
                {/* Staged previews */}
                {galleryPreviews.length > 0 && (
                  <div
                    className="mb-3 p-3 rounded-3"
                    style={{
                      background: '#fce4f0',
                      border: `1.5px dashed ${ACCENT}`,
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span
                        className="small fw-bold"
                        style={{ color: ACCENT }}
                      >
                        <i className="bi bi-cloud-upload me-1"></i>
                        {galleryPreviews.length} image
                        {galleryPreviews.length > 1 ? 's' : ''} ready to upload
                      </span>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-success px-3"
                          onClick={handleGalleryUpload}
                          disabled={uploadingGallery}
                        >
                          {uploadingGallery ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" />
                              Uploading…
                            </>
                          ) : (
                            <>
                              <i className="bi bi-cloud-upload me-1"></i>Upload
                              All
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-light"
                          onClick={cancelGalleryPreview}
                          disabled={uploadingGallery}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <div className="row g-2">
                      {galleryPreviews.map((src, i) => (
                        <div
                          className="col-md-4 col-6"
                          key={i}
                        >
                          <div className="md-gallery-preview">
                            <img
                              src={src}
                              alt=""
                            />
                            <span className="md-gallery-preview-lbl">New</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing images */}
                {mua.gallery_images?.length > 0 ? (
                  <div className="row g-2">
                    {mua.gallery_images.map((img, idx) => (
                      <div
                        className="col-md-4 col-6"
                        key={idx}
                      >
                        <div className="md-gallery-item">
                          <img
                            src={img}
                            alt={`Work ${idx + 1}`}
                            className="md-gallery-img"
                            onError={(e) => {
                              e.target.closest(
                                '.md-gallery-item',
                              ).style.display = 'none';
                            }}
                          />
                          <button
                            className="md-gallery-del btn btn-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                            style={{ width: 28, height: 28 }}
                            onClick={() => handleDeleteGalleryImage(img)}
                            disabled={deletingImg === img}
                            title="Remove"
                          >
                            {deletingImg === img ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                style={{ width: 12, height: 12 }}
                              />
                            ) : (
                              <i
                                className="bi bi-trash-fill"
                                style={{ fontSize: '.7rem' }}
                              ></i>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !galleryPreviews.length ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-images fs-2 d-block mb-2"></i>
                    <small>No portfolio images uploaded yet.</small>
                  </div>
                ) : null}

                {!galleryPreviews.length && (
                  <div className="mt-3 pt-3 border-top d-flex justify-content-end">
                    <button
                      className="btn btn-sm px-3"
                      style={{
                        border: `1.5px solid ${ACCENT}`,
                        color: ACCENT,
                        borderRadius: 8,
                      }}
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <i className="bi bi-plus-circle me-1"></i>Add Work Images
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={galleryInputRef}
                  className="d-none"
                  accept="image/*"
                  multiple
                  onChange={handleGallerySelect}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DELETE MODAL ──────────────────────────────────────── */}
      <div
        className="modal fade"
        id="deleteMuaModal"
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
              <h5 className="fw-bold mb-1">Delete Makeup Artist?</h5>
              <p
                className="text-muted mb-0"
                style={{ fontSize: '.9rem' }}
              >
                You are about to permanently delete{' '}
                <strong>{mua?.full_name}</strong>. This removes their profile,
                account, and all portfolio images. This cannot be undone.
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
