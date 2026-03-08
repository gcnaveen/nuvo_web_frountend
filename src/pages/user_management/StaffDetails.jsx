// src/pages/user_management/StaffDetails.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getStaff,
  updateStaff,
  deleteStaff,
  uploadStaffImages,
  deleteGalleryImage,
} from "../../api/staffApi";

// ── Constants ──────────────────────────────────────────────────
const PACKAGE_CONFIG = {
  PLATINUM: {
    label: "Platinum",
    color: "#8E24AA",
    textColor: "#fff",
    light: "#f3e5f5",
  },
  DIAMOND: {
    label: "Diamond",
    color: "#1E88E5",
    textColor: "#fff",
    light: "#e3f2fd",
  },
  GOLD: {
    label: "Gold",
    color: "#D4AF37",
    textColor: "#000",
    light: "#fffde7",
  },
  SILVER: {
    label: "Silver",
    color: "#78909C",
    textColor: "#fff",
    light: "#eceff1",
  },
  BRONZE: {
    label: "Bronze",
    color: "#A1621A",
    textColor: "#fff",
    light: "#fbe9e7",
  },
};

const STATUS_CONFIG = {
  ACTIVE: { label: "Active", badge: "success", icon: "bi-check-circle-fill" },
  ONEVENT: {
    label: "On Event",
    badge: "warning",
    icon: "bi-calendar-event-fill",
  },
  INACTIVE: {
    label: "Inactive",
    badge: "secondary",
    icon: "bi-dash-circle-fill",
  },
  BLOCKED: { label: "Blocked", badge: "danger", icon: "bi-x-circle-fill" },
};

const PACKAGES = ["PLATINUM", "DIAMOND", "GOLD", "SILVER", "BRONZE"];
const STATUSES = ["ACTIVE", "INACTIVE", "BLOCKED"];
const GENDERS = ["Male", "Female", "Other"];

// ── Helpers ────────────────────────────────────────────────────
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

// Read-only display field
const Field = ({ label, value }) => (
  <div>
    <label className="sd-label">{label}</label>
    <div className="sd-value">{value || "—"}</div>
  </div>
);

// Editable text input
const EditInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) => (
  <div>
    <label className="sd-label">{label}</label>
    <input
      type={type}
      name={name}
      className="sd-input"
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

// Editable select
const EditSelect = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="sd-label">{label}</label>
    <select
      name={name}
      className="sd-select"
      value={value ?? ""}
      onChange={onChange}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

// ══════════════════════════════════════════════════════════════
export default function StaffDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── Core state ────────────────────────────────────────────────
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Edit state ────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // ── Delete state ──────────────────────────────────────────────
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ── Avatar upload ─────────────────────────────────────────────
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  // ── Gallery upload ────────────────────────────────────────────
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [deletingImg, setDeletingImg] = useState(null);
  const galleryInputRef = useRef(null);

  // ── Toast ─────────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getStaff(id);
      setStaff(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load staff member.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // ── Edit handlers ─────────────────────────────────────────────
  const startEdit = () => {
    setDraft({
      full_name: staff.full_name || "",
      stage_name: staff.stage_name || "",
      gender: staff.gender || "",
      city: staff.city || "",
      state: staff.state || "",
      country: staff.country || "",
      package: staff.package?.toUpperCase() || "SILVER",
      experience_in_years: staff.experience_in_years ?? "",
      price_of_staff: staff.price_of_staff ?? "",
      status: staff.status?.toUpperCase() || "ACTIVE",
    });
    setSaveError("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft({});
    setSaveError("");
  };

  const handleDraftChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!draft.full_name?.trim()) {
      setSaveError("Full name is required.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const res = await updateStaff(staff.id, {
        full_name: draft.full_name.trim(),
        stage_name: draft.stage_name.trim(),
        gender: draft.gender,
        city: draft.city.trim(),
        state: draft.state.trim(),
        country: draft.country.trim(),
        package: draft.package,
        experience_in_years:
          draft.experience_in_years !== ""
            ? Number(draft.experience_in_years)
            : null,
        price_of_staff:
          draft.price_of_staff !== "" ? Number(draft.price_of_staff) : null,
        status: draft.status,
      });
      setStaff((prev) => ({ ...prev, ...res.data.data }));
      setIsEditing(false);
      showToast("Staff profile updated successfully!");
    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete handlers ───────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteStaff(staff.id);
      navigate("/staff", { replace: true });
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Failed to delete staff member.",
      );
      setDeleting(false);
    }
  };

  // ── Avatar upload ─────────────────────────────────────────────
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
      fd.append("profile_picture", avatarFile);
      const res = await uploadStaffImages(staff.id, fd);
      setStaff((prev) => ({
        ...prev,
        profile_picture: res.data.data.profile_picture,
      }));
      setAvatarFile(null);
      setAvatarPreview(null);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
      showToast("Profile picture updated!");
    } catch (err) {
      showToast(err.response?.data?.message || "Upload failed.", "danger");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const cancelAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  // ── Gallery upload ────────────────────────────────────────────
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
      galleryFiles.forEach((f) => fd.append("gallery_images", f));
      const res = await uploadStaffImages(staff.id, fd);
      setStaff((prev) => ({
        ...prev,
        gallery_images: res.data.data.gallery_images,
      }));
      setGalleryFiles([]);
      setGalleryPreviews([]);
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      showToast(
        `${galleryFiles.length} image${galleryFiles.length > 1 ? "s" : ""} added!`,
      );
    } catch (err) {
      showToast(
        err.response?.data?.message || "Gallery upload failed.",
        "danger",
      );
    } finally {
      setUploadingGallery(false);
    }
  };

  const cancelGalleryPreview = () => {
    setGalleryFiles([]);
    setGalleryPreviews([]);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleDeleteGalleryImage = async (imageUrl) => {
    setDeletingImg(imageUrl);
    try {
      const res = await deleteGalleryImage(staff.id, imageUrl);
      setStaff((prev) => ({
        ...prev,
        gallery_images: res.data.data.gallery_images,
      }));
      showToast("Image removed from gallery.");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to delete image.",
        "danger",
      );
    } finally {
      setDeletingImg(null);
    }
  };

  // ── Loading / error ────────────────────────────────────────────
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
          <p className="text-muted small">Loading staff details…</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="page-content">
        <button
          className="btn btn-light shadow-sm mb-4"
          onClick={() => navigate("/staff")}
        >
          <i className="bi bi-arrow-left me-1"></i> Back
        </button>
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  if (!staff) return null;

  const pkgKey = (isEditing ? draft.package : staff.package)?.toUpperCase();
  const statusKey = (isEditing ? draft.status : staff.status)?.toUpperCase();
  const pkg = PACKAGE_CONFIG[pkgKey] || {
    label: staff.package || "—",
    color: "#78909C",
    textColor: "#fff",
    light: "#eceff1",
  };
  const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.INACTIVE;
  const displayPic = avatarPreview || staff.profile_picture;

  return (
    <>
      <style>{`
        .sd-label { font-size:.7rem; text-transform:uppercase; letter-spacing:.9px; font-weight:700; color:#9aa3af; margin-bottom:4px; display:block; }
        .sd-value { font-size:.9rem; font-weight:600; color:#2c3249; padding:7px 0; border-bottom:1px solid #f0f2f5; min-height:34px; }
        .sd-input {
          width:100%; border-radius:8px; border:1.5px solid #e0e3ea; background:#f8f9fc;
          font-size:.88rem; padding:7px 11px; color:#2c3249; font-weight:600; transition:all .2s;
        }
        .sd-input:focus { outline:none; border-color:#435ebe; box-shadow:0 0 0 3px rgba(67,94,190,.12); background:#fff; }
        .sd-select {
          width:100%; border-radius:8px; border:1.5px solid #e0e3ea; background:#f8f9fc;
          font-size:.88rem; padding:7px 11px; color:#2c3249; font-weight:600; transition:all .2s;
        }
        .sd-select:focus { outline:none; border-color:#435ebe; box-shadow:0 0 0 3px rgba(67,94,190,.12); background:#fff; }
        .sd-card { background:#fff; border-radius:14px; border:1px solid #eef0f4; box-shadow:0 2px 12px rgba(44,50,73,.06); overflow:hidden; margin-bottom:20px; }
        .sd-card-hd { padding:14px 22px; border-bottom:1px solid #f5f6fa; display:flex; align-items:center; gap:10px; }
        .sd-card-hd h6 { margin:0; font-size:.82rem; font-weight:700; text-transform:uppercase; letter-spacing:.9px; color:#4a5568; }
        .sd-card-bd { padding:22px; }
        .sd-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:20px; font-size:.75rem; font-weight:700; letter-spacing:.5px; text-transform:uppercase; }
        .sd-stat { background:#f8f9fc; border-radius:10px; padding:12px 14px; text-align:center; }
        .sd-stat-val { font-size:1rem; font-weight:800; color:#2c3249; line-height:1.2; }
        .sd-stat-lbl { font-size:.68rem; text-transform:uppercase; letter-spacing:.8px; color:#9aa3af; margin-top:3px; font-weight:600; }
        .sd-avatar-wrap { position:relative; display:inline-block; cursor:pointer; }
        .sd-avatar-wrap:hover .sd-avatar-overlay { opacity:1; }
        .sd-avatar-overlay { position:absolute; inset:0; border-radius:50%; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s; color:#fff; font-size:1.3rem; }
        .sd-gallery-item { position:relative; border-radius:10px; overflow:hidden; }
        .sd-gallery-img { height:160px; width:100%; object-fit:cover; display:block; transition:transform .2s; }
        .sd-gallery-item:hover .sd-gallery-img { transform:scale(1.04); }
        .sd-gallery-del { position:absolute; top:7px; right:7px; opacity:0; transition:opacity .2s; }
        .sd-gallery-item:hover .sd-gallery-del { opacity:1; }
        .sd-gallery-preview { border:2px dashed #435ebe; border-radius:10px; overflow:hidden; height:160px; position:relative; }
        .sd-gallery-preview img { width:100%; height:100%; object-fit:cover; opacity:.7; }
        .sd-gallery-preview-lbl { position:absolute; bottom:6px; left:50%; transform:translateX(-50%); background:rgba(67,94,190,.85); color:#fff; font-size:.68rem; font-weight:700; padding:2px 8px; border-radius:20px; white-space:nowrap; }
        .sd-pkg-strip { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
        .sd-pkg-chip { padding:5px 14px; border-radius:20px; font-size:.73rem; font-weight:700; letter-spacing:.5px; text-transform:uppercase; border:1.5px solid transparent; transition:all .18s; cursor:default; }
        .sd-toast { position:fixed; top:24px; right:24px; z-index:9999; background:#fff; border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,.13); padding:13px 20px; display:flex; align-items:center; gap:10px; font-size:.86rem; font-weight:600; color:#2c3249; animation:sdSlide .3s ease; }
        .sd-toast.success { border-left:4px solid #28a745; }
        .sd-toast.danger  { border-left:4px solid #dc3545; }
        @keyframes sdSlide { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
      `}</style>

      {/* Toast */}
      {toast.msg && (
        <div className={`sd-toast ${toast.type}`}>
          <i
            className={`bi ${toast.type === "success" ? "bi-check-circle-fill text-success" : "bi-exclamation-circle-fill text-danger"} fs-5`}
          ></i>
          {toast.msg}
        </div>
      )}

      {/* ── PAGE HEADING ─────────────────────────────────────────── */}
      <div className="page-heading">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-light shadow-sm"
              onClick={() => navigate("/staff")}
            >
              <i className="bi bi-arrow-left me-1"></i> Staff
            </button>
            <div>
              <h3 className="mb-0">{staff.full_name || "Staff Profile"}</h3>
              <p className="text-muted mb-0 small">Staff Member Details</p>
            </div>
          </div>

          <div className="d-flex gap-2">
            {!isEditing ? (
              <>
                <button
                  className="btn btn-outline-danger px-3"
                  data-bs-toggle="modal"
                  data-bs-target="#deleteStaffModal"
                >
                  <i className="bi bi-trash me-1"></i>Delete
                </button>
                <button className="btn btn-primary px-4" onClick={startEdit}>
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

      {/* ── PAGE CONTENT ─────────────────────────────────────────── */}
      <div className="page-content">
        {saveError && (
          <div className="alert alert-danger py-2 mb-3">
            <i className="bi bi-exclamation-circle me-2"></i>
            {saveError}
          </div>
        )}

        <div className="row g-4">
          {/* ── LEFT COLUMN ──────────────────────────────────────── */}
          <div className="col-lg-4">
            {/* Avatar + identity card */}
            <div className="sd-card">
              <div className="sd-card-bd text-center">
                {/* Clickable avatar */}
                <div
                  className="sd-avatar-wrap mb-3"
                  onClick={() => avatarInputRef.current?.click()}
                  title="Click to change profile picture"
                >
                  {displayPic ? (
                    <img
                      src={displayPic}
                      alt={staff.full_name}
                      className="rounded-circle border border-4"
                      style={{
                        width: 110,
                        height: 110,
                        objectFit: "cover",
                        borderColor: pkg.color,
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white mx-auto"
                      style={{
                        width: 110,
                        height: 110,
                        background: pkg.color,
                        fontSize: "2rem",
                        border: `4px solid ${pkg.color}55`,
                      }}
                    >
                      {initials(isEditing ? draft.full_name : staff.full_name)}
                    </div>
                  )}
                  <div className="sd-avatar-overlay">
                    <i className="bi bi-camera-fill"></i>
                  </div>
                  <span
                    className={`badge bg-${statusCfg.badge} position-absolute bottom-0 end-0`}
                    style={{ fontSize: ".7rem", padding: "4px 8px" }}
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

                {/* Avatar upload actions */}
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
                      style={{ fontSize: ".72rem" }}
                    >
                      <i className="bi bi-info-circle me-1 text-primary"></i>
                      Preview shown — click Save Photo to upload
                    </p>
                  </>
                )}

                <h5 className="fw-bold mb-0">
                  {isEditing ? draft.full_name || "—" : staff.full_name}
                </h5>
                <div className="text-muted small mb-1">
                  @
                  {(isEditing ? draft.stage_name : staff.stage_name) ||
                    "no_stage_name"}
                </div>
                <div className="text-muted small mb-3">
                  {(isEditing ? draft.gender : staff.gender) || ""}
                </div>

                <span
                  className="sd-pill mb-3 d-inline-flex"
                  style={{ background: pkg.color, color: pkg.textColor }}
                >
                  <i className="bi bi-gem"></i>
                  {pkg.label}
                </span>

                <div className="row g-2 text-start">
                  <div className="col-6">
                    <div className="sd-stat">
                      <div className="sd-stat-val">
                        {(isEditing
                          ? draft.experience_in_years
                          : staff.experience_in_years) ?? "—"}
                      </div>
                      <div className="sd-stat-lbl">Yrs Exp</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="sd-stat">
                      <div
                        className="sd-stat-val"
                        style={{ fontSize: ".85rem" }}
                      >
                        {(isEditing ? draft.city : staff.city) || "—"}
                      </div>
                      <div className="sd-stat-lbl">City</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="sd-card">
              <div className="sd-card-hd">
                <i className="bi bi-info-circle text-muted"></i>
                <h6>Account Info</h6>
              </div>
              <div className="sd-card-bd">
                <div className="row g-3">
                  <div className="col-12">
                    <Field label="Profile ID" value={staff.id} />
                  </div>
                  <div className="col-12">
                    <Field label="User ID" value={staff.user_id} />
                  </div>
                  <div className="col-12">
                    <Field label="Joined" value={fmtDate(staff.joined_date)} />
                  </div>
                  <div className="col-12">
                    <label className="sd-label">Account Status</label>
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
                      <div className="sd-value">
                        <span
                          className={`badge bg-${statusCfg.badge} px-3 py-2`}
                          style={{ fontSize: ".8rem" }}
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

          {/* ── RIGHT COLUMN ─────────────────────────────────────── */}
          <div className="col-lg-8">
            {/* Profile Details */}
            <div className="sd-card">
              <div className="sd-card-hd">
                <i className="bi bi-person text-primary"></i>
                <h6>Profile Details</h6>
              </div>
              <div className="sd-card-bd">
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
                        <EditInput
                          label="Stage Name"
                          name="stage_name"
                          value={draft.stage_name}
                          onChange={handleDraftChange}
                          placeholder="Stage / artist name"
                        />
                      </div>
                      <div className="col-md-6">
                        <EditSelect
                          label="Gender"
                          name="gender"
                          value={draft.gender}
                          onChange={handleDraftChange}
                          options={[
                            { value: "", label: "— Select —" },
                            ...GENDERS.map((g) => ({ value: g, label: g })),
                          ]}
                        />
                      </div>
                      <div className="col-md-6">
                        <EditInput
                          label="Experience (years)"
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
                      <div className="col-md-6">
                        <EditInput
                          label="Price (₹)"
                          name="price_of_staff"
                          type="number"
                          value={draft.price_of_staff}
                          onChange={handleDraftChange}
                          placeholder="0"
                        />
                      </div>
                      <div className="col-md-6">
                        <EditSelect
                          label="Package Tier"
                          name="package"
                          value={draft.package}
                          onChange={handleDraftChange}
                          options={PACKAGES.map((p) => ({
                            value: p,
                            label: PACKAGE_CONFIG[p]?.label || p,
                          }))}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-md-6">
                        <Field label="Full Name" value={staff.full_name} />
                      </div>
                      <div className="col-md-6">
                        <Field label="Stage Name" value={staff.stage_name} />
                      </div>
                      <div className="col-md-6">
                        <Field label="Gender" value={staff.gender} />
                      </div>
                      <div className="col-md-6">
                        <Field
                          label="Experience"
                          value={
                            staff.experience_in_years != null
                              ? `${staff.experience_in_years} years`
                              : null
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <Field label="City" value={staff.city} />
                      </div>
                      <div className="col-md-6">
                        <Field label="State" value={staff.state} />
                      </div>
                      <div className="col-md-6">
                        <Field label="Country" value={staff.country} />
                      </div>
                      <div className="col-md-6">
                        <Field
                          label="Price"
                          value={
                            staff.price_of_staff != null
                              ? `₹${staff.price_of_staff}`
                              : null
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <Field label="Package Tier" value={pkg.label} />
                      </div>
                      <div className="col-md-6">
                        <Field
                          label="Joined"
                          value={fmtDate(staff.joined_date)}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Package tier strip (view mode) */}
                {!isEditing && (
                  <>
                    <div className="sd-pkg-strip">
                      {PACKAGES.map((p) => {
                        const cfg = PACKAGE_CONFIG[p];
                        const active = p === pkgKey;
                        return (
                          <span
                            key={p}
                            className="sd-pkg-chip"
                            style={{
                              background: active ? cfg.color : cfg.light,
                              color: active ? cfg.textColor : cfg.color,
                              borderColor: cfg.color + "55",
                              transform: active ? "scale(1.07)" : "scale(1)",
                            }}
                          >
                            {active && <i className="bi bi-check-lg me-1"></i>}
                            {cfg.label}
                          </span>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Gallery */}
            <div className="sd-card">
              <div className="sd-card-hd">
                <i className="bi bi-images text-primary"></i>
                <h6>Portfolio Gallery</h6>
                <span
                  className="ms-auto badge bg-light text-muted border"
                  style={{ fontSize: ".72rem" }}
                >
                  {staff.gallery_images?.length || 0} images
                </span>
              </div>
              <div className="sd-card-bd">
                {/* Staged previews */}
                {galleryPreviews.length > 0 && (
                  <div
                    className="mb-3 p-3 rounded-3"
                    style={{
                      background: "#f0f4ff",
                      border: "1.5px dashed #435ebe",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small fw-bold text-primary">
                        <i className="bi bi-cloud-upload me-1"></i>
                        {galleryPreviews.length} image
                        {galleryPreviews.length > 1 ? "s" : ""} ready to upload
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
                        <div className="col-md-4 col-6" key={i}>
                          <div className="sd-gallery-preview">
                            <img src={src} alt="" />
                            <span className="sd-gallery-preview-lbl">New</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing images */}
                {staff.gallery_images?.length > 0 ? (
                  <div className="row g-2">
                    {staff.gallery_images.map((img, idx) => (
                      <div className="col-md-4 col-6" key={idx}>
                        <div className="sd-gallery-item">
                          <img
                            src={img}
                            alt={`Gallery ${idx + 1}`}
                            className="sd-gallery-img"
                            onError={(e) => {
                              e.target.closest(
                                ".sd-gallery-item",
                              ).style.display = "none";
                            }}
                          />
                          <button
                            className="sd-gallery-del btn btn-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                            style={{ width: 28, height: 28 }}
                            onClick={() => handleDeleteGalleryImage(img)}
                            disabled={deletingImg === img}
                            title="Remove image"
                          >
                            {deletingImg === img ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                style={{ width: 12, height: 12 }}
                              />
                            ) : (
                              <i
                                className="bi bi-trash-fill"
                                style={{ fontSize: ".7rem" }}
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

                {/* Add images button */}
                {!galleryPreviews.length && (
                  <div className="mt-3 pt-3 border-top d-flex justify-content-end">
                    <button
                      className="btn btn-outline-primary btn-sm px-3"
                      onClick={() => galleryInputRef.current?.click()}
                    >
                      <i className="bi bi-plus-circle me-1"></i>Add Images
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
                <strong>{staff?.full_name}</strong>. This will remove their
                profile, account, and all associated data. This action cannot be
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
