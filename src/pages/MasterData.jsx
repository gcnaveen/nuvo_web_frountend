import React, { useState } from "react";
import themesData from "../data/master_data/themes.json";
import uniformsData from "../data/master_data/uniforms.json";
import packagesData from "../data/master_data/packages_settings.json";

// Shared Package Colors
const packageConfig = {
  Platinum: { color: "#8E24AA", textColor: "#FFFFFF" },
  Diamond: { color: "#1E88E5", textColor: "#FFFFFF" },
  Gold: { color: "#D4AF37", textColor: "#000000" },
  Silver: { color: "#B0BEC5", textColor: "#000000" },
  Bronze: { color: "#CD7F32", textColor: "#FFFFFF" },
};

export default function MasterData() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState("themes");

  // Local state for CRUD operations
  const [themes, setThemes] = useState(themesData || []);
  const [uniforms, setUniforms] = useState(uniformsData || []);
  const [packages, setPackages] = useState(packagesData || []);
  const [paymentSettings, setPaymentSettings] = useState({
    AdvancePercentage: 30,
    lastUpdatedAt: "2026-02-20",
  });

  // Modal State
  const [modalMode, setModalMode] = useState("view"); // 'add', 'view', or 'edit'
  const [activeItem, setActiveItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // --- HANDLERS ---
  const handleViewTheme = (theme) => {
    setActiveItem(theme);
    setModalMode("view");
  };
  const handleViewUniform = (uniform) => {
    setActiveItem(uniform);
    setModalMode("view");
  };
  const handleEditPackage = (pkg) => {
    setActiveItem(pkg);
    setModalMode("edit");
  };

  const handleDeletePrompt = (item, type) => {
    setItemToDelete({ ...item, type });
  };

  const confirmDelete = () => {
    console.log(`Deleting ${itemToDelete.type} with ID: ${itemToDelete.id}`);
    // Add real deletion logic here (e.g., setThemes(themes.filter(...)))
    setItemToDelete(null);
  };

  const handleSaveSettings = () => {
    const today = new Date().toISOString().split("T")[0];
    setPaymentSettings({ ...paymentSettings, lastUpdatedAt: today });
    console.log("Saved Payment Settings:", paymentSettings);
  };

  // --- TAB RENDERING FUNCTIONS ---

  // 1. THEMES TAB
  const renderThemes = () => (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-bold">Event Themes</h5>
        <button
          className="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#themeModal"
          onClick={() => {
            setModalMode("add");
            setActiveItem(null);
          }}
        >
          <i className="bi bi-plus-lg"></i> Add Theme
        </button>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Theme Details</th>
                <th>Theme ID</th>
                <th>Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {themes.map((theme) => (
                <tr key={theme.id}>
                  <td className="ps-4">
                    <div className="d-flex align-items-center">
                      <div>
                        <div className="fw-bold">{theme.name}</div>
                        <small
                          className="text-muted text-truncate d-inline-block"
                          style={{ maxWidth: "300px" }}
                        >
                          {theme.description}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted">{theme.id}</td>
                  <td>
                    <span
                      className={`badge bg-light-${theme.status === "active" ? "success" : "secondary"} text-${theme.status === "active" ? "success" : "secondary"}`}
                    >
                      {theme.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <button
                      className="btn btn-sm btn-light text-primary me-2"
                      data-bs-toggle="modal"
                      data-bs-target="#themeModal"
                      onClick={() => handleViewTheme(theme)}
                    >
                      <i className="bi bi-eye"></i> View
                    </button>
                    <button
                      className="btn btn-sm btn-light text-danger"
                      data-bs-toggle="modal"
                      data-bs-target="#deleteConfirmModal"
                      onClick={() => handleDeletePrompt(theme, "Theme")}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 2. UNIFORMS TAB
  const renderUniforms = () => (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 fw-bold">Uniform Categories</h5>
        <button
          className="btn btn-primary btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#uniformModal"
          onClick={() => {
            setModalMode("add");
            setActiveItem(null);
          }}
        >
          <i className="bi bi-plus-lg"></i> Add Category
        </button>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Category Name</th>
                <th>Category Key</th>
                <th>Status</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {uniforms.map((uniform) => (
                <tr key={uniform.id}>
                  <td className="ps-4">
                    <div className="fw-bold">{uniform.name}</div>
                    <small className="text-muted">{uniform.description}</small>
                  </td>
                  <td>
                    <code className="text-muted bg-light px-2 py-1 rounded">
                      {uniform.key}
                    </code>
                  </td>
                  <td>
                    <span
                      className={`badge bg-${uniform.isActive ? "success" : "secondary"}`}
                    >
                      {uniform.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <button
                      className="btn btn-sm btn-light text-primary me-2"
                      data-bs-toggle="modal"
                      data-bs-target="#uniformModal"
                      onClick={() => handleViewUniform(uniform)}
                    >
                      <i className="bi bi-eye"></i> View
                    </button>
                    <button
                      className="btn btn-sm btn-light text-danger"
                      data-bs-toggle="modal"
                      data-bs-target="#deleteConfirmModal"
                      onClick={() =>
                        handleDeletePrompt(uniform, "Uniform Category")
                      }
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 3. SUBSCRIPTIONS TAB (Unchanged)
  const renderSubscriptions = () => (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3">
        <h5 className="mb-0 fw-bold">Subscription Plan Pricing</h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Plan Tier</th>
                <th>Monthly Price (₹)</th>
                <th>Yearly Price (₹)</th>
                <th>Priority Support</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => {
                const config = packageConfig[pkg.name] || {
                  color: "#6c757d",
                  textColor: "#fff",
                };
                return (
                  <tr key={pkg.id}>
                    <td className="ps-4">
                      <span
                        className="badge px-3 py-2"
                        style={{
                          backgroundColor: config.color,
                          color: config.textColor,
                        }}
                      >
                        {pkg.name}
                      </span>
                      {pkg.isFree && (
                        <span className="ms-2 badge bg-light text-dark border">
                          FREE TIER
                        </span>
                      )}
                    </td>
                    <td className={pkg.isFree ? "text-muted" : "fw-bold"}>
                      {pkg.isFree
                        ? "₹ 0"
                        : `₹ ${pkg.monthlyPrice.toLocaleString()}`}
                    </td>
                    <td className={pkg.isFree ? "text-muted" : "fw-bold"}>
                      {pkg.isFree
                        ? "₹ 0"
                        : `₹ ${pkg.yearlyPrice.toLocaleString()}`}
                    </td>
                    <td>
                      {pkg.prioritySupport ? (
                        <i className="bi bi-check-circle-fill text-success fs-5"></i>
                      ) : (
                        <i className="bi bi-x-circle-fill text-secondary fs-5"></i>
                      )}
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#packageModal"
                        onClick={() => handleEditPackage(pkg)}
                      >
                        <i className="bi bi-pencil me-1"></i> Edit Pricing
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 4. GLOBAL SETTINGS TAB (Unchanged)
  const renderSettings = () => (
    <div className="row">
      <div className="col-md-6">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-bold">Global Payment Terms</h5>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <label className="form-label fw-bold">
                Advance Payment Required (%)
              </label>
              <div className="input-group input-group-lg">
                <input
                  type="number"
                  className="form-control nuvo-input bg-light"
                  value={paymentSettings.AdvancePercentage}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      AdvancePercentage: e.target.value,
                    })
                  }
                  min="0"
                  max="100"
                />
                <span className="input-group-text bg-light text-muted border-0">
                  %
                </span>
              </div>
              <small className="text-muted mt-2 d-block">
                This percentage will be automatically calculated as the required
                advance amount when creating a new event.
              </small>
            </div>
            <hr />
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                <i className="bi bi-clock-history me-1"></i> Last updated:{" "}
                {paymentSettings.lastUpdatedAt}
              </small>
              <button
                className="btn btn-dark px-4"
                onClick={handleSaveSettings}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>
        {`
          .nuvo-input { background-color: #f8f9fa !important; border: 1px solid #f8f9fa !important; transition: all 0.2s ease;}
          .nuvo-input:focus { border-color: #8E24AA !important; box-shadow: 0 0 0 0.25rem rgba(142, 36, 170, 0.1) !important; background-color: #fff !important; }
          .nav-tabs .nav-link { color: #6c757d; font-weight: 500; border: none; border-bottom: 3px solid transparent; padding: 1rem 1.5rem; }
          .nav-tabs .nav-link.active { color: #8E24AA; border-bottom: 3px solid #8E24AA; background: transparent; }
          .nav-tabs .nav-link:hover:not(.active) { border-bottom: 3px solid #dee2e6; color: #495057; }
          .image-grid-item { height: 120px; width: 100%; object-fit: cover; border-radius: 8px; border: 1px solid #dee2e6; }
        `}
      </style>

      <div className="page-heading mb-4">
        <h3>Master Data Configuration</h3>
        <p className="text-muted">
          Manage global settings, themes, uniform categories, and subscription
          pricing.
        </p>
      </div>

      <div className="page-content">
        <ul className="nav nav-tabs mb-4 border-bottom">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "themes" ? "active" : ""}`}
              onClick={() => setActiveTab("themes")}
            >
              <i className="bi bi-palette me-2"></i> Event Themes
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "uniforms" ? "active" : ""}`}
              onClick={() => setActiveTab("uniforms")}
            >
              <i className="bi bi-person-badge me-2"></i> Uniform Categories
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "subscriptions" ? "active" : ""}`}
              onClick={() => setActiveTab("subscriptions")}
            >
              <i className="bi bi-tags me-2"></i> Subscription Plans
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <i className="bi bi-gear me-2"></i> Payment Terms
            </button>
          </li>
        </ul>

        {activeTab === "themes" && renderThemes()}
        {activeTab === "uniforms" && renderUniforms()}
        {activeTab === "subscriptions" && renderSubscriptions()}
        {activeTab === "settings" && renderSettings()}
      </div>

      {/* ================= THEME MODAL ================= */}
      <div className="modal fade" id="themeModal" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div
            className="modal-content border-0 shadow-lg"
            style={{ borderRadius: "15px" }}
          >
            <div className="modal-header border-0 p-4 pb-0 d-flex justify-content-between align-items-start">
              <div>
                <h5 className="fw-bold mb-0">
                  {modalMode === "add"
                    ? "Add New Theme"
                    : modalMode === "edit"
                      ? "Edit Theme"
                      : "Theme Details"}
                </h5>
                {modalMode === "view" && activeItem?.status && (
                  <span
                    className={`badge mt-2 bg-light-${activeItem.status === "active" ? "success" : "secondary"} text-${activeItem.status === "active" ? "success" : "secondary"}`}
                  >
                    {String(activeItem.status).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="d-flex gap-2">
                {modalMode === "view" && (
                  <button
                    className="btn btn-primary btn-sm px-3"
                    onClick={() => setModalMode("edit")}
                  >
                    <i className="bi bi-pencil-square me-1"></i> Edit
                  </button>
                )}
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
            </div>

            <div className="modal-body p-4">
              {modalMode === "view" && activeItem ? (
                // --- VIEW MODE ---
                <div>
                  <img
                    src={
                      activeItem.coverImage ||
                      "https://via.placeholder.com/800x300?text=No+Cover+Image"
                    }
                    alt="Cover"
                    className="img-fluid rounded mb-4 shadow-sm w-100"
                    style={{ maxHeight: "300px", objectFit: "cover" }}
                  />
                  <h4 className="fw-bold">{activeItem.name}</h4>
                  <p className="text-muted">{activeItem.description}</p>

                  <h6 className="fw-bold mt-4 mb-3 border-bottom pb-2">
                    Theme Gallery
                  </h6>
                  {activeItem.gallery && activeItem.gallery.length > 0 ? (
                    <div className="row g-2">
                      {activeItem.gallery.map((img, idx) => (
                        <div className="col-4" key={idx}>
                          <img
                            src={img}
                            alt={`Gallery ${idx}`}
                            className="image-grid-item"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small italic">
                      No gallery images uploaded for this theme.
                    </p>
                  )}
                </div>
              ) : (
                // --- ADD/EDIT MODE ---
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="small fw-bold text-muted mb-1">
                      Theme Name
                    </label>
                    <input
                      type="text"
                      className="form-control nuvo-input"
                      defaultValue={activeItem?.name || ""}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="small fw-bold text-muted mb-1">
                      Status
                    </label>
                    <select
                      className="form-select nuvo-input"
                      defaultValue={activeItem?.status || "active"}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="small fw-bold text-muted mb-1">
                      Description
                    </label>
                    <textarea
                      className="form-control nuvo-input"
                      rows="3"
                      defaultValue={activeItem?.description || ""}
                    ></textarea>
                  </div>
                  <div className="col-12 mt-3">
                    <h6 className="fw-bold border-bottom pb-2">
                      Media Uploads
                    </h6>
                  </div>
                  <div className="col-md-6">
                    <label className="small fw-bold text-muted mb-1">
                      Upload Cover Image
                    </label>
                    <input
                      type="file"
                      className="form-control nuvo-input"
                      accept="image/*"
                    />
                    <small className="text-muted">
                      High resolution main image.
                    </small>
                  </div>
                  <div className="col-md-6">
                    <label className="small fw-bold text-muted mb-1">
                      Upload Gallery Images
                    </label>
                    <input
                      type="file"
                      className="form-control nuvo-input"
                      accept="image/*"
                      multiple
                    />
                    <small className="text-muted">
                      Select multiple images for the portfolio.
                    </small>
                  </div>
                </div>
              )}
            </div>

            {(modalMode === "edit" || modalMode === "add") && (
              <div className="modal-footer border-0 p-4 pt-0">
                <button
                  className="btn btn-light"
                  onClick={() =>
                    modalMode === "edit" ? setModalMode("view") : null
                  }
                  data-bs-dismiss={modalMode === "add" ? "modal" : ""}
                >
                  Cancel
                </button>
                <button className="btn btn-dark" data-bs-dismiss="modal">
                  Save Theme
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= UNIFORM MODAL ================= */}
      <div className="modal fade" id="uniformModal" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div
            className="modal-content border-0 shadow-lg"
            style={{ borderRadius: "15px" }}
          >
            <div className="modal-header border-0 p-4 pb-0 d-flex justify-content-between align-items-start">
              <div>
                <h5 className="fw-bold mb-0">
                  {modalMode === "add"
                    ? "Add Uniform Category"
                    : modalMode === "edit"
                      ? "Edit Category"
                      : "Category Details"}
                </h5>
                {/* SAFE CHECK FOR isACTIVE BOOLEAN */}
                {modalMode === "view" &&
                  activeItem &&
                  activeItem.isActive !== undefined && (
                    <span
                      className={`badge mt-2 bg-light-${activeItem.isActive ? "success" : "secondary"} text-${activeItem.isActive ? "success" : "secondary"}`}
                    >
                      {activeItem.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  )}
              </div>
              <div className="d-flex gap-2">
                {modalMode === "view" && (
                  <button
                    className="btn btn-primary btn-sm px-3"
                    onClick={() => setModalMode("edit")}
                  >
                    <i className="bi bi-pencil-square me-1"></i> Edit
                  </button>
                )}
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
            </div>

            <div className="modal-body p-4">
              {modalMode === "view" && activeItem ? (
                // --- VIEW MODE ---
                <div>
                  <h4 className="fw-bold">{activeItem.name}</h4>
                  <p className="text-muted mb-2">{activeItem.description}</p>
                  <p>
                    <code className="bg-light px-2 py-1 rounded text-dark">
                      Key: {activeItem.key}
                    </code>
                  </p>

                  <h6 className="fw-bold mt-4 mb-3 border-bottom pb-2">
                    Uniform Images
                  </h6>
                  {activeItem.images && activeItem.images.length > 0 ? (
                    <div className="row g-3">
                      {activeItem.images.map((img, idx) => (
                        <div className="col-md-3 col-6" key={idx}>
                          <div className="p-2 border rounded text-center bg-light">
                            <img
                              src={img}
                              alt="Uniform"
                              className="img-fluid"
                              style={{
                                maxHeight: "100px",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small italic">
                      No images uploaded for this uniform category.
                    </p>
                  )}
                </div>
              ) : (
                // --- ADD/EDIT MODE ---
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="small fw-bold text-muted mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      className="form-control nuvo-input"
                      defaultValue={activeItem?.name || ""}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="small fw-bold text-muted mb-1">
                      Unique Key (No spaces)
                    </label>
                    <input
                      type="text"
                      className="form-control nuvo-input"
                      defaultValue={activeItem?.key || ""}
                      readOnly={modalMode === "edit"}
                    />
                  </div>
                  <div className="col-12">
                    <label className="small fw-bold text-muted mb-1">
                      Description
                    </label>
                    <textarea
                      className="form-control nuvo-input"
                      rows="2"
                      defaultValue={activeItem?.description || ""}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="small fw-bold text-muted mb-1">
                      Upload Uniform Images
                    </label>
                    <input
                      type="file"
                      className="form-control nuvo-input"
                      accept="image/*"
                      multiple
                    />
                    <small className="text-muted">
                      Upload sample photos of the uniforms in this category.
                    </small>
                  </div>
                  <div className="col-12 form-check form-switch mt-3 ms-2">
                    <input
                      className="form-check-input cursor-pointer"
                      type="checkbox"
                      id="uniformActive"
                      defaultChecked={activeItem ? activeItem.isActive : true}
                    />
                    <label
                      className="form-check-label fw-bold cursor-pointer"
                      htmlFor="uniformActive"
                    >
                      Category is Active
                    </label>
                  </div>
                </div>
              )}
            </div>

            {(modalMode === "edit" || modalMode === "add") && (
              <div className="modal-footer border-0 p-4 pt-0">
                <button
                  className="btn btn-light"
                  onClick={() =>
                    modalMode === "edit" ? setModalMode("view") : null
                  }
                  data-bs-dismiss={modalMode === "add" ? "modal" : ""}
                >
                  Cancel
                </button>
                <button className="btn btn-dark" data-bs-dismiss="modal">
                  Save Category
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= SUBSCRIPTION MODAL (Unchanged) ================= */}
      <div className="modal fade" id="packageModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content border-0 shadow-lg"
            style={{ borderRadius: "15px" }}
          >
            <div className="modal-header border-0 p-4 pb-0">
              <h5 className="fw-bold">Edit Pricing: {activeItem?.name}</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body p-4">
              {activeItem?.isFree && (
                <div className="alert alert-info border-0 text-dark small">
                  <i className="bi bi-info-circle-fill me-2"></i> This is a free
                  tier package. Price edits are disabled.
                </div>
              )}
              <div className="row g-3">
                <div className="col-6">
                  <label className="small fw-bold text-muted mb-1">
                    Monthly Price (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control nuvo-input"
                    defaultValue={activeItem?.monthlyPrice || 0}
                    disabled={activeItem?.isFree}
                  />
                </div>
                <div className="col-6">
                  <label className="small fw-bold text-muted mb-1">
                    Yearly Price (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control nuvo-input"
                    defaultValue={activeItem?.yearlyPrice || 0}
                    disabled={activeItem?.isFree}
                  />
                </div>
              </div>
              <div className="form-check form-switch mt-4">
                <input
                  className="form-check-input cursor-pointer"
                  type="checkbox"
                  id="prioritySupport"
                  defaultChecked={activeItem?.prioritySupport}
                />
                <label
                  className="form-check-label fw-bold cursor-pointer"
                  htmlFor="prioritySupport"
                >
                  Include Priority Support
                </label>
              </div>
            </div>
            <div className="modal-footer border-0 p-4 pt-0">
              <button className="btn btn-light" data-bs-dismiss="modal">
                Cancel
              </button>
              <button className="btn btn-dark" data-bs-dismiss="modal">
                Update Pricing
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= DELETE CONFIRMATION MODAL ================= */}
      <div className="modal fade" id="deleteConfirmModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div
            className="modal-content border-0 shadow-lg"
            style={{ borderRadius: "15px" }}
          >
            <div className="modal-body text-center p-4">
              <div className="text-danger mb-3">
                <i
                  className="bi bi-exclamation-triangle-fill"
                  style={{ fontSize: "3rem" }}
                ></i>
              </div>
              <h5 className="fw-bold">Are you sure?</h5>
              <p className="text-muted small">
                You are about to delete the {itemToDelete?.type}{" "}
                <strong>{itemToDelete?.name}</strong>. This action cannot be
                undone.
              </p>
              <div className="d-flex justify-content-center gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-light"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  data-bs-dismiss="modal"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
