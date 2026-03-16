// src/pages/Uniforms.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  listInventory,
  getInventorySummary,
  updateStock,
  createUniform,
} from '../api/masterApi';

// ── Constants ──────────────────────────────────────────────────
const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const EMPTY_SIZES = Object.fromEntries(
  STANDARD_SIZES.map((s) => [s, { total: 0, in_use: 0 }]),
);

// ── Helpers ────────────────────────────────────────────────────
const calcTotals = (stock = {}) => {
  let total = 0,
    inUse = 0;
  Object.values(stock).forEach((v) => {
    total += v.total || 0;
    inUse += v.in_use || 0;
  });
  return { total, inUse, available: total - inUse };
};

const stockRatioStatus = (available, total) => {
  if (total === 0) return 'secondary';
  const ratio = available / total;
  if (ratio < 0.2) return 'danger';
  if (ratio < 0.5) return 'warning';
  return 'success';
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

// ══════════════════════════════════════════════════════════════
export default function Uniforms() {
  // ── Data ──────────────────────────────────────────────────────
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Filters ───────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const searchDebounce = useRef(null);

  // ── Manage Stock modal ────────────────────────────────────────
  const [selected, setSelected] = useState(null);
  const [editStock, setEditStock] = useState({});
  const [editHasSizes, setEditHasSizes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── Add Category modal ────────────────────────────────────────
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    category_name: '',
    unique_key: '',
    description: '',
    gender: 'unisex',
    price: '',
    is_active: true,
    has_sizes: true,
  });
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');

  // ── Toast ─────────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (lowStock) params.low_stock = 'true';
      const [invRes, sumRes] = await Promise.all([
        listInventory(params),
        getInventorySummary(),
      ]);
      setInventory(Array.isArray(invRes.data.data) ? invRes.data.data : []);
      setSummary(sumRes.data.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, [search, lowStock]);

  useEffect(() => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(fetchAll, 350);
    return () => clearTimeout(searchDebounce.current);
  }, [fetchAll]);

  // ── Open Manage Stock modal ────────────────────────────────────
  const openManage = (item) => {
    setSelected(item);
    setEditHasSizes(item.has_sizes ?? true);
    // Deep copy stock so we don't mutate state
    const stockCopy = {};
    if (item.stock && Object.keys(item.stock).length > 0) {
      Object.entries(item.stock).forEach(([k, v]) => {
        stockCopy[k] = { total: v.total || 0, in_use: v.in_use || 0 };
      });
    } else {
      // Default: either standard sizes or OS
      if (item.has_sizes !== false) {
        STANDARD_SIZES.forEach((s) => {
          stockCopy[s] = { total: 0, in_use: 0 };
        });
      } else {
        stockCopy['OS'] = { total: 0, in_use: 0 };
      }
    }
    setEditStock(stockCopy);
    setSaveError('');
  };

  const handleHasSizesToggle = (hasSizes) => {
    setEditHasSizes(hasSizes);
    if (hasSizes) {
      // Switch to standard sizes, preserve OS in_use if any
      const newStock = {};
      STANDARD_SIZES.forEach((s) => {
        newStock[s] = { total: 0, in_use: editStock[s]?.in_use || 0 };
      });
      setEditStock(newStock);
    } else {
      // Switch to free size, sum up in_use
      const totalInUse = Object.values(editStock).reduce(
        (a, v) => a + (v.in_use || 0),
        0,
      );
      setEditStock({ OS: { total: 0, in_use: totalInUse } });
    }
  };

  const handleStockChange = (size, newTotal) => {
    const val = Math.max(0, parseInt(newTotal) || 0);
    setEditStock((prev) => ({
      ...prev,
      [size]: { ...prev[size], total: val },
    }));
  };

  const handleInUseChange = (size, newInUse) => {
    const val = Math.max(0, parseInt(newInUse) || 0);
    setEditStock((prev) => ({
      ...prev,
      [size]: { ...prev[size], in_use: val },
    }));
  };

  const handleSaveStock = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveError('');
    try {
      const res = await updateStock(selected.id, {
        has_sizes: editHasSizes,
        stock: editStock,
      });
      const updated = res.data.data;
      setInventory((prev) =>
        prev.map((i) => (i.id === updated.id ? updated : i)),
      );
      // Update summary
      const sumRes = await getInventorySummary();
      setSummary(sumRes.data.data);
      setSelected(null);
      showToast('Stock updated successfully!');
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update stock.');
    } finally {
      setSaving(false);
    }
  };

  // ── Add Category ───────────────────────────────────────────────
  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    let v = type === 'checkbox' ? checked : value;
    // Auto-generate unique_key from category_name
    setAddForm((prev) => {
      const next = { ...prev, [name]: v };
      if (name === 'category_name') {
        next.unique_key = value
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
      }
      return next;
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    if (!addForm.category_name.trim()) {
      setAddError('Category name is required.');
      return;
    }
    if (!addForm.unique_key.trim()) {
      setAddError('Unique key is required.');
      return;
    }
    setAdding(true);
    try {
      const fd = new FormData();
      fd.append('category_name', addForm.category_name.trim());
      fd.append('unique_key', addForm.unique_key.trim());
      fd.append('description', addForm.description.trim());
      fd.append('gender', addForm.gender);
      fd.append('price', addForm.price || '0');
      fd.append('is_active', addForm.is_active ? 'true' : 'false');
      await createUniform(fd);
      setAddSuccess('Category created! You can now manage its stock.');
      setAddForm({
        category_name: '',
        unique_key: '',
        description: '',
        gender: 'unisex',
        price: '',
        is_active: true,
        has_sizes: true,
      });
      fetchAll();
      setTimeout(() => {
        setAddModal(false);
        setAddSuccess('');
        showToast('Uniform category created!');
      }, 1800);
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setAdding(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .inv-stat-card { background:#fff; border-radius:14px; border:1px solid #eef0f4; box-shadow:0 2px 12px rgba(44,50,73,.06); padding:20px 24px; display:flex; align-items:center; gap:16px; }
        .inv-stat-icon { width:48px; height:48px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.3rem; flex-shrink:0; }
        .inv-stat-val  { font-size:1.6rem; font-weight:800; color:#2c3249; line-height:1.1; }
        .inv-stat-lbl  { font-size:.72rem; text-transform:uppercase; letter-spacing:.9px; color:#9aa3af; font-weight:700; margin-top:2px; }
        .size-badge    { min-width:38px; text-align:center; }
        .stock-row     { display:grid; grid-template-columns:70px 1fr 1fr 130px; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid #f5f6fa; }
        .stock-row:last-child { border-bottom:none; }
        .stock-input   { width:100%; border-radius:8px; border:1.5px solid #e0e3ea; background:#f8f9fc; font-size:.9rem; padding:6px 10px; font-weight:700; color:#2c3249; text-align:center; }
        .stock-input:focus { outline:none; border-color:#435ebe; box-shadow:0 0 0 3px rgba(67,94,190,.12); background:#fff; }
        .nuvo-input { background:#f8f9fa !important; border:1px solid #eaeaea !important; }
        .nuvo-input:focus { background:#fff !important; border-color:#435ebe !important; box-shadow:0 0 0 .2rem rgba(67,94,190,.15) !important; }
        .inv-toast { position:fixed; top:24px; right:24px; z-index:9999; background:#fff; border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,.13); padding:13px 20px; display:flex; align-items:center; gap:10px; font-size:.86rem; font-weight:600; color:#2c3249; animation:invSlide .3s ease; }
        .inv-toast.success { border-left:4px solid #28a745; }
        .inv-toast.danger  { border-left:4px solid #dc3545; }
        @keyframes invSlide { from{transform:translateX(60px);opacity:0} to{transform:translateX(0);opacity:1} }
        .size-toggle-btn { padding:6px 18px; border-radius:20px; border:1.5px solid #e0e3ea; background:#f8f9fc; font-size:.82rem; font-weight:600; color:#4a5568; cursor:pointer; transition:all .18s; }
        .size-toggle-btn.active { background:#435ebe; color:#fff; border-color:#435ebe; }
      `}</style>

      {/* Toast */}
      {toast.msg && (
        <div className={`inv-toast ${toast.type}`}>
          <i
            className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-circle-fill text-danger'} fs-5`}
          ></i>
          {toast.msg}
        </div>
      )}

      {/* ── HEADING ─────────────────────────────────────────────── */}
      <div className="page-heading">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h3>Inventory Management</h3>
            <p className="text-muted mb-0">
              Track and manage uniform stock, sizes, and availability.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-success">
              <i className="bi bi-file-earmark-excel me-1"></i>Export Report
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setAddModal(true);
                setAddError('');
                setAddSuccess('');
              }}
            >
              <i className="bi bi-plus-lg me-1"></i>Add Uniform Category
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* ── SUMMARY CARDS ──────────────────────────────────────── */}
        {summary && (
          <div className="row g-3 mb-4">
            {[
              {
                label: 'Categories',
                val: summary.total_categories,
                icon: 'bi-tags',
                bg: '#e8f5e9',
                color: '#2e7d32',
              },
              {
                label: 'Total Items',
                val: summary.total_items,
                icon: 'bi-box-seam',
                bg: '#e3f2fd',
                color: '#1565c0',
              },
              {
                label: 'In Use',
                val: summary.total_in_use,
                icon: 'bi-people-fill',
                bg: '#fff3e0',
                color: '#e65100',
              },
              {
                label: 'Available',
                val: summary.total_available,
                icon: 'bi-check-circle',
                bg: '#f3e5f5',
                color: '#7b1fa2',
              },
              {
                label: 'Low Stock',
                val: summary.low_stock_count,
                icon: 'bi-exclamation-triangle',
                bg: '#fce4ec',
                color: '#c62828',
              },
            ].map((s) => (
              <div
                className="col-6 col-md-4 col-lg"
                key={s.label}
              >
                <div className="inv-stat-card">
                  <div
                    className="inv-stat-icon"
                    style={{ background: s.bg, color: s.color }}
                  >
                    <i className={`bi ${s.icon}`}></i>
                  </div>
                  <div>
                    <div className="inv-stat-val">{s.val ?? '—'}</div>
                    <div className="inv-stat-lbl">{s.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── FILTERS ────────────────────────────────────────────── */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="small fw-bold">Search</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control nuvo-input border-start-0 ps-0"
                    placeholder="Uniform name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-auto">
                <div className="form-check form-switch mt-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="lowStockSwitch"
                    checked={lowStock}
                    onChange={(e) => setLowStock(e.target.checked)}
                  />
                  <label
                    className="form-check-label fw-semibold small text-danger"
                    htmlFor="lowStockSwitch"
                  >
                    Low Stock Only
                  </label>
                </div>
              </div>
              {(search || lowStock) && (
                <div className="col-auto">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setSearch('');
                      setLowStock(false);
                    }}
                  >
                    <i className="bi bi-x-circle me-1"></i>Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── TABLE ──────────────────────────────────────────────── */}
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            {error && <div className="alert alert-danger m-3">{error}</div>}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="text-muted mt-3 small">Loading inventory...</p>
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-box-seam fs-1 d-block mb-2"></i>
                No inventory items found.{' '}
                {(search || lowStock) && (
                  <button
                    className="btn btn-link p-0 text-primary"
                    onClick={() => {
                      setSearch('');
                      setLowStock(false);
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Uniform</th>
                      <th>Category</th>
                      <th>Gender · Price</th>
                      <th>Size Breakdown</th>
                      <th className="text-center">Total</th>
                      <th className="text-center">In Use</th>
                      <th className="text-center">Available</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => {
                      const status = stockRatioStatus(
                        item.total_available,
                        item.total_stock,
                      );
                      return (
                        <tr key={item.id}>
                          <td className="ps-4">
                            <div className="d-flex align-items-center gap-3">
                              {item.images?.[0] ? (
                                <img
                                  src={item.images[0]}
                                  alt={item.category_name}
                                  className="rounded border"
                                  width="46"
                                  height="46"
                                  style={{ objectFit: 'cover', flexShrink: 0 }}
                                />
                              ) : (
                                <div
                                  className="rounded border bg-light d-flex align-items-center justify-content-center"
                                  style={{
                                    width: 46,
                                    height: 46,
                                    flexShrink: 0,
                                  }}
                                >
                                  <i className="bi bi-bag text-muted"></i>
                                </div>
                              )}
                              <div>
                                <div
                                  className="fw-bold"
                                  style={{ fontSize: '.9rem' }}
                                >
                                  {item.category_name}
                                </div>
                                <small className="text-muted">
                                  {item.unique_key}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${item.is_active ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`}
                            >
                              {item.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="small">
                              <span className="text-muted">
                                {item.gender || '—'}
                              </span>
                              {item.price > 0 && (
                                <>
                                  <span className="mx-1 text-muted">·</span>
                                  <span className="fw-semibold">
                                    ₹{item.price}
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td>
                            {item.has_sizes !== false &&
                            Object.keys(item.stock || {}).length > 0 ? (
                              <div className="d-flex flex-wrap gap-1">
                                {Object.entries(item.stock).map(
                                  ([size, data]) => {
                                    const avail =
                                      (data.total || 0) - (data.in_use || 0);
                                    return (
                                      <span
                                        key={size}
                                        className="badge bg-light text-dark border size-badge"
                                        title={`${size}: ${avail} available of ${data.total}`}
                                      >
                                        <strong>{size}</strong>: {avail}
                                      </span>
                                    );
                                  },
                                )}
                              </div>
                            ) : item.has_sizes === false ? (
                              <span className="badge bg-secondary text-white">
                                Free Size (OS)
                              </span>
                            ) : (
                              <span className="text-muted small">
                                No stock set
                              </span>
                            )}
                          </td>
                          <td className="text-center fw-bold">
                            {item.total_stock}
                          </td>
                          <td className="text-center">
                            <span
                              style={{
                                background: '#f0f2f5',
                                color: '#4a5568',
                                borderRadius: 8,
                                padding: '4px 14px',
                                fontWeight: 700,
                                fontSize: '.85rem',
                                display: 'inline-block',
                              }}
                            >
                              {item.total_in_use}
                            </span>
                          </td>
                          <td className="text-center">
                            {(() => {
                              const colors = {
                                success: { bg: '#e8f5e9', color: '#2e7d32' },
                                warning: { bg: '#fff8e1', color: '#f57f17' },
                                danger: { bg: '#fce4ec', color: '#c62828' },
                                secondary: { bg: '#f5f5f5', color: '#757575' },
                              };
                              const c = colors[status] || colors.secondary;
                              return (
                                <span
                                  style={{
                                    background: c.bg,
                                    color: c.color,
                                    borderRadius: 8,
                                    padding: '4px 14px',
                                    fontWeight: 800,
                                    fontSize: '.88rem',
                                    display: 'inline-block',
                                  }}
                                >
                                  {item.total_available}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="text-end pe-4">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openManage(item)}
                              data-bs-toggle="modal"
                              data-bs-target="#manageStockModal"
                            >
                              <i className="bi bi-box-seam me-1"></i>Manage
                              Stock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════ MANAGE STOCK MODAL ══════════════════ */}
      <div
        className="modal fade"
        id="manageStockModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div
            className="modal-content shadow-lg border-0"
            style={{ borderRadius: 15 }}
          >
            <div className="modal-header border-0 p-4 pb-0">
              <div>
                <h5 className="fw-bold mb-1">Update Inventory</h5>
                <p className="text-muted small mb-0">
                  {selected?.category_name}
                  {selected?.price > 0 && (
                    <>
                      {' '}
                      · <strong>₹{selected.price}</strong> per unit
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body p-4">
              {saveError && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {saveError}
                </div>
              )}

              <div className="alert alert-light border d-flex align-items-start gap-3 mb-4">
                <i className="bi bi-info-circle-fill text-primary fs-5 mt-1"></i>
                <small className="text-muted">
                  Update <strong>Total Owned</strong> when purchasing new stock
                  or retiring items. You can also manually correct{' '}
                  <strong>In Use</strong> if needed (e.g. after a manual event
                  adjustment). Total must always be ≥ In Use.
                </small>
              </div>

              {/* Size type toggle */}
              <div className="mb-4">
                <label className="small fw-bold text-muted d-block mb-2">
                  SIZE TYPE
                </label>
                <div className="d-flex gap-2">
                  <button
                    className={`size-toggle-btn ${editHasSizes ? 'active' : ''}`}
                    onClick={() => handleHasSizesToggle(true)}
                  >
                    <i className="bi bi-grid me-1"></i>Multiple Sizes
                  </button>
                  <button
                    className={`size-toggle-btn ${!editHasSizes ? 'active' : ''}`}
                    onClick={() => handleHasSizesToggle(false)}
                  >
                    <i className="bi bi-dash-circle me-1"></i>Free Size (One
                    Size)
                  </button>
                </div>
              </div>

              {/* Stock table — 5 columns */}
              {selected && (
                <div className="border rounded-3 overflow-hidden">
                  {/* Header */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr 1fr 130px 130px',
                      gap: 10,
                      alignItems: 'center',
                      background: '#f8f9fc',
                      padding: '10px 16px',
                    }}
                  >
                    <span className="small fw-bold text-muted">SIZE</span>
                    <span className="small fw-bold text-muted text-center">
                      AVAILABLE
                    </span>
                    <span className="small fw-bold text-muted text-center">
                      SET IN USE
                    </span>
                    <span className="small fw-bold text-muted text-center">
                      TOTAL OWNED
                    </span>
                    <span
                      className="small fw-bold"
                      style={{
                        color: '#435ebe',
                        textAlign: 'center',
                        fontSize: '.68rem',
                        textTransform: 'uppercase',
                        letterSpacing: '.8px',
                      }}
                    >
                      ✏ EDIT IN USE
                    </span>
                  </div>
                  {/* Rows */}
                  <div style={{ padding: '0 16px' }}>
                    {Object.entries(editStock).map(([size, data]) => {
                      const available = (data.total || 0) - (data.in_use || 0);
                      const isLow =
                        data.total > 0 && available / data.total < 0.2;
                      const isInvalid = (data.in_use || 0) > (data.total || 0);
                      return (
                        <div
                          key={size}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '80px 1fr 1fr 130px 130px',
                            gap: 10,
                            alignItems: 'center',
                            padding: '10px 0',
                            borderBottom: '1px solid #f5f6fa',
                          }}
                        >
                          <span
                            className="fw-bold"
                            style={{ fontSize: '.9rem' }}
                          >
                            {size === 'OS' ? 'Free Size' : `Size ${size}`}
                          </span>
                          {/* Available (computed, display only) */}
                          <div className="text-center">
                            <span
                              style={{
                                background: isInvalid
                                  ? '#fce4ec'
                                  : isLow
                                    ? '#fff8e1'
                                    : '#e8f5e9',
                                color: isInvalid
                                  ? '#c62828'
                                  : isLow
                                    ? '#f57f17'
                                    : '#2e7d32',
                                borderRadius: 7,
                                padding: '4px 12px',
                                fontWeight: 800,
                                fontSize: '.85rem',
                                display: 'inline-block',
                              }}
                            >
                              {isInvalid ? '⚠' : available}
                            </span>
                          </div>
                          {/* In Use display */}
                          <div className="text-center">
                            <span
                              style={{
                                background: '#f0f2f5',
                                color: '#4a5568',
                                borderRadius: 7,
                                padding: '4px 12px',
                                fontWeight: 700,
                                fontSize: '.85rem',
                                display: 'inline-block',
                              }}
                            >
                              {data.in_use || 0}
                            </span>
                          </div>
                          {/* Total Owned input */}
                          <input
                            type="number"
                            className="stock-input"
                            min={data.in_use || 0}
                            value={data.total || 0}
                            style={isInvalid ? { borderColor: '#dc3545' } : {}}
                            onChange={(e) =>
                              handleStockChange(size, e.target.value)
                            }
                          />
                          {/* In Use editable input */}
                          <input
                            type="number"
                            className="stock-input"
                            min={0}
                            max={data.total || 0}
                            value={data.in_use || 0}
                            style={{
                              borderColor: isInvalid ? '#dc3545' : '#435ebe',
                              borderWidth: '1.5px',
                            }}
                            onChange={(e) =>
                              handleInUseChange(size, e.target.value)
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                  {/* Footer totals */}
                  {(() => {
                    const totals = calcTotals(editStock);
                    return (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '80px 1fr 1fr 130px 130px',
                          gap: 10,
                          alignItems: 'center',
                          background: '#f8f9fc',
                          padding: '12px 16px',
                        }}
                      >
                        <span className="small fw-bold text-muted">TOTAL</span>
                        <div className="text-center">
                          <span
                            style={{
                              fontWeight: 800,
                              color: '#2e7d32',
                              fontSize: '.9rem',
                            }}
                          >
                            {totals.available}
                          </span>
                        </div>
                        <div className="text-center">
                          <span
                            style={{
                              fontWeight: 800,
                              color: '#4a5568',
                              fontSize: '.9rem',
                            }}
                          >
                            {totals.inUse}
                          </span>
                        </div>
                        <div className="text-center">
                          <span
                            style={{
                              fontWeight: 800,
                              color: '#435ebe',
                              fontSize: '.9rem',
                            }}
                          >
                            {totals.total}
                          </span>
                        </div>
                        <div></div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="modal-footer border-0 p-4 pt-0">
              <button
                className="btn btn-light px-4"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                className="btn btn-primary px-4"
                onClick={handleSaveStock}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving…
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>Save Inventory
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════ ADD UNIFORM CATEGORY MODAL ══════════════════ */}
      {addModal && (
        <div
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,.5)', zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: 15 }}
            >
              <div className="modal-header border-0 p-4 pb-0">
                <div>
                  <h5 className="fw-bold mb-0">Add Uniform Category</h5>
                  <p className="text-muted small mb-0">
                    Create in master data — then manage stock here.
                  </p>
                </div>
                <button
                  className="btn-close"
                  onClick={() => setAddModal(false)}
                ></button>
              </div>
              <div className="modal-body p-4">
                {addError && (
                  <div className="alert alert-danger py-2 mb-3">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {addError}
                  </div>
                )}
                {addSuccess && (
                  <div className="alert alert-success py-2 mb-3">
                    <i className="bi bi-check-circle me-2"></i>
                    {addSuccess}
                  </div>
                )}
                <form
                  id="addUniformForm"
                  onSubmit={handleAddSubmit}
                >
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="small fw-bold">Category Name *</label>
                      <input
                        name="category_name"
                        className="form-control nuvo-input"
                        value={addForm.category_name}
                        onChange={handleAddChange}
                        placeholder="e.g. Royal Traditional"
                        disabled={adding}
                      />
                    </div>
                    <div className="col-12">
                      <label className="small fw-bold">Unique Key *</label>
                      <input
                        name="unique_key"
                        className="form-control nuvo-input"
                        value={addForm.unique_key}
                        onChange={handleAddChange}
                        placeholder="auto-generated from name"
                        disabled={adding}
                      />
                      <small className="text-muted">
                        Auto-generated from name. Use lowercase letters,
                        numbers, underscores.
                      </small>
                    </div>
                    <div className="col-12">
                      <label className="small fw-bold">Description</label>
                      <textarea
                        name="description"
                        className="form-control nuvo-input"
                        rows={2}
                        value={addForm.description}
                        onChange={handleAddChange}
                        placeholder="Brief description..."
                        style={{ resize: 'none' }}
                        disabled={adding}
                      />
                    </div>
                    <div className="col-6">
                      <label className="small fw-bold">Gender</label>
                      <select
                        name="gender"
                        className="form-select nuvo-input"
                        value={addForm.gender}
                        onChange={handleAddChange}
                        disabled={adding}
                      >
                        <option value="unisex">Unisex</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="small fw-bold">Price (₹)</label>
                      <input
                        name="price"
                        type="number"
                        min="0"
                        className="form-control nuvo-input"
                        value={addForm.price}
                        onChange={handleAddChange}
                        placeholder="0.00"
                        disabled={adding}
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="addActiveSwitch"
                          checked={addForm.is_active}
                          onChange={(e) =>
                            setAddForm((p) => ({
                              ...p,
                              is_active: e.target.checked,
                            }))
                          }
                        />
                        <label
                          className="form-check-label fw-semibold small"
                          htmlFor="addActiveSwitch"
                        >
                          {addForm.is_active ? 'Active' : 'Inactive'}
                        </label>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button
                  className="btn btn-light flex-fill"
                  onClick={() => setAddModal(false)}
                  disabled={adding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="addUniformForm"
                  className="btn btn-primary flex-fill"
                  disabled={adding}
                >
                  {adding ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-lg me-2"></i>Create Category
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
