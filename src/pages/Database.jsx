import React, { useState, useEffect, useRef } from 'react';
import {
  listCategories, createCategory, deleteCategory,
  listContacts, createContact, updateContact, deleteContact,
} from '../api/contactsApi';

// ── constants ──────────────────────────────────────────────────
const TITLES = ['Mr', 'Ms', 'Mrs', 'Dr'];

const EMPTY_FORM = {
  category: '', title: '', full_name: '', contact_number_1: '',
  contact_number_2: '', email: '', address: '', company_name: '',
  department_name: '', designation: '', referred_by: '',
};

// ── helpers ────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function Database() {
  // ── state ──────────────────────────────────────────────────────
  const [categories, setCategories]     = useState([]);
  const [contacts, setContacts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch]             = useState('');
  const [toast, setToast]               = useState({ msg: '', type: 'success' });

  // modal state
  const [modal, setModal]     = useState(null); // null | {mode:'add'|'edit'|'view', contact?}
  const [form, setForm]       = useState(EMPTY_FORM);
  const [formErr, setFormErr] = useState('');
  const [saving, setSaving]   = useState(false);

  // delete confirm
  const [delTarget, setDelTarget] = useState(null); // contact to delete
  const [deleting, setDeleting]   = useState(false);

  // category manager
  const [catModal, setCatModal]   = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catSaving, setCatSaving] = useState(false);
  const [catErr, setCatErr]       = useState('');
  const [catDeleting, setCatDeleting] = useState(null);

  const searchTimeout = useRef(null);

  // ── data loading ───────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  const loadCategories = async () => {
    try {
      const res = await listCategories();
      setCategories(Array.isArray(res.data.data) ? res.data.data : []);
    } catch { /* silent */ }
  };

  const loadContacts = async (category, searchVal) => {
    setLoading(true);
    try {
      const params = {};
      if (category && category !== 'ALL') params.category = category;
      if (searchVal) params.search = searchVal;
      const res = await listContacts(params);
      setContacts(Array.isArray(res.data.data) ? res.data.data : []);
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadContacts('ALL', '');
  }, []);

  // debounced search
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => loadContacts(activeCategory, val), 350);
  };

  const handleCategoryTab = (cat) => {
    setActiveCategory(cat);
    loadContacts(cat, search);
  };

  // ── modal handlers ─────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormErr('');
    setModal({ mode: 'add' });
  };

  const openEdit = (contact) => {
    setForm({
      category: contact.category || '',
      title: contact.title || '',
      full_name: contact.full_name || '',
      contact_number_1: contact.contact_number_1 || '',
      contact_number_2: contact.contact_number_2 || '',
      email: contact.email || '',
      address: contact.address || '',
      company_name: contact.company_name || '',
      department_name: contact.department_name || '',
      designation: contact.designation || '',
      referred_by: contact.referred_by || '',
    });
    setFormErr('');
    setModal({ mode: 'edit', contact });
  };

  const openView = (contact) => setModal({ mode: 'view', contact });

  const closeModal = () => { setModal(null); setFormErr(''); };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { setFormErr('Full name is required.'); return; }
    if (!form.contact_number_1.trim()) { setFormErr('Contact number 1 is required.'); return; }
    setSaving(true); setFormErr('');
    try {
      if (modal.mode === 'add') {
        await createContact(form);
        showToast('Contact added successfully');
      } else {
        await updateContact(modal.contact.id, form);
        showToast('Contact updated successfully');
      }
      closeModal();
      loadContacts(activeCategory, search);
    } catch (err) {
      setFormErr(err.response?.data?.message || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── delete ─────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try {
      await deleteContact(delTarget.id);
      showToast('Contact deleted');
      setDelTarget(null);
      loadContacts(activeCategory, search);
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'danger');
      setDelTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── category manager ───────────────────────────────────────────
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) { setCatErr('Category name is required.'); return; }
    setCatSaving(true); setCatErr('');
    try {
      await createCategory({ name: newCatName.trim() });
      setNewCatName('');
      showToast('Category added');
      loadCategories();
    } catch (err) {
      setCatErr(err.response?.data?.message || 'Failed to add category');
    } finally {
      setCatSaving(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    setCatDeleting(cat.id);
    try {
      await deleteCategory(cat.id);
      showToast('Category deleted');
      loadCategories();
      if (activeCategory === cat.name) handleCategoryTab('ALL');
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'danger');
    } finally {
      setCatDeleting(null);
    }
  };

  // ── render ─────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .db-card { background:#fff; border-radius:14px; box-shadow:0 2px 12px rgba(0,0,0,.07); padding:24px; }
        .db-tabs  { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
        .db-tab   { padding:6px 16px; border-radius:20px; border:1.5px solid #dee2e6; background:#fff;
                    font-size:.83rem; font-weight:600; cursor:pointer; transition:all .15s; color:#555; }
        .db-tab.active { background:#435ebe; border-color:#435ebe; color:#fff; }
        .db-tab:hover:not(.active) { border-color:#435ebe; color:#435ebe; }
        .db-label { font-size:.78rem; font-weight:600; color:#888; margin-bottom:4px; }
        .db-input { border-radius:8px; border:1.5px solid #dee2e6; padding:8px 12px; font-size:.88rem;
                    width:100%; outline:none; transition:border .15s; }
        .db-input:focus { border-color:#435ebe; box-shadow:0 0 0 3px rgba(67,94,190,.1); }
        .db-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:.72rem;
                    font-weight:700; background:#e8f0ff; color:#435ebe; }
        .db-table th { font-size:.75rem; font-weight:700; color:#888; text-transform:uppercase;
                       letter-spacing:.04em; border-bottom:2px solid #f0f0f0; padding:10px 12px; }
        .db-table td { font-size:.84rem; padding:12px; vertical-align:middle; border-bottom:1px solid #f5f5f5; }
        .db-table tr:hover td { background:#f9faff; }
        .db-action { background:none; border:none; cursor:pointer; padding:4px 6px; border-radius:6px;
                     font-size:.9rem; transition:background .12s; }
        .db-action:hover { background:#f0f0f0; }
        .cat-chip { display:inline-flex; align-items:center; gap:6px; padding:4px 12px 4px 14px;
                    border-radius:20px; background:#f0f0f0; font-size:.82rem; font-weight:600; margin:4px; }
        .cat-del  { background:none; border:none; cursor:pointer; color:#dc3545; font-size:.7rem;
                    padding:0 2px; line-height:1; }
      `}</style>

      {/* ── Toast ── */}
      {toast.msg && (
        <div className={`alert alert-${toast.type} position-fixed`}
          style={{ top: 20, right: 20, zIndex: 9999, minWidth: 260, boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="page-heading">
        <div className="page-title d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <h3>Database</h3>
            <p className="text-subtitle text-muted">Manage business contacts and references</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm" onClick={() => { setCatModal(true); setCatErr(''); setNewCatName(''); }}>
              <i className="bi bi-tags me-1"></i>Manage Categories
            </button>
            <button className="btn btn-primary" onClick={openAdd}>
              <i className="bi bi-person-plus me-1"></i>Add Contact
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="db-card">

          {/* ── Category filter tabs ── */}
          <div className="db-tabs">
            <button className={`db-tab ${activeCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => handleCategoryTab('ALL')}>
              All ({contacts.length})
            </button>
            {categories.map((cat) => (
              <button key={cat.id}
                className={`db-tab ${activeCategory === cat.name ? 'active' : ''}`}
                onClick={() => handleCategoryTab(cat.name)}>
                {cat.name}
              </button>
            ))}
          </div>

          {/* ── Search ── */}
          <div className="mb-3" style={{ maxWidth: 360 }}>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input type="text" className="form-control border-start-0"
                placeholder="Search name, phone, email, company…"
                value={search} onChange={(e) => handleSearch(e.target.value)} />
              {search && (
                <button className="btn btn-outline-secondary" onClick={() => { setSearch(''); loadContacts(activeCategory, ''); }}>
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {/* ── Table ── */}
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-person-x fs-1 d-block mb-2"></i>
              No contacts found.{' '}
              <button className="btn btn-link p-0" onClick={openAdd}>Add one</button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table db-table mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Contact</th>
                    <th>Company</th>
                    <th>Designation</th>
                    <th>Added</th>
                    <th style={{ width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c, i) => (
                    <tr key={c.id}>
                      <td className="text-muted">{i + 1}</td>
                      <td>
                        <div className="fw-semibold" style={{ fontSize: '.87rem' }}>
                          {c.title ? `${c.title} ` : ''}{c.full_name}
                        </div>
                        {c.email && <div className="text-muted" style={{ fontSize: '.75rem' }}>{c.email}</div>}
                      </td>
                      <td>
                        {c.category
                          ? <span className="db-badge">{c.category}</span>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        <div style={{ fontSize: '.84rem' }}>{c.contact_number_1}</div>
                        {c.contact_number_2 && <div className="text-muted" style={{ fontSize: '.75rem' }}>{c.contact_number_2}</div>}
                      </td>
                      <td style={{ fontSize: '.84rem' }}>
                        {c.company_name || <span className="text-muted">—</span>}
                        {c.department_name && <div className="text-muted" style={{ fontSize: '.75rem' }}>{c.department_name}</div>}
                      </td>
                      <td style={{ fontSize: '.84rem' }}>{c.designation || <span className="text-muted">—</span>}</td>
                      <td style={{ fontSize: '.78rem', color: '#888' }}>{fmtDate(c.created_at)}</td>
                      <td>
                        <button className="db-action text-primary" title="View" onClick={() => openView(c)}>
                          <i className="bi bi-eye"></i>
                        </button>
                        <button className="db-action text-success" title="Edit" onClick={() => openEdit(c)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="db-action text-danger" title="Delete" onClick={() => setDelTarget(c)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════════ */}
      {modal && modal.mode !== 'view' && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header border-0 px-4 pt-4 pb-2">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-light p-2">
                    <i className={`bi ${modal.mode === 'add' ? 'bi-person-plus' : 'bi-pencil'} text-primary fs-5`}></i>
                  </div>
                  <div>
                    <h5 className="mb-0">{modal.mode === 'add' ? 'Add Contact' : 'Edit Contact'}</h5>
                    <small className="text-muted">Fields marked * are required</small>
                  </div>
                </div>
                <button className="btn-close" onClick={closeModal} disabled={saving} />
              </div>

              <div className="modal-body px-4 pb-0">
                {formErr && <div className="alert alert-danger py-2">{formErr}</div>}
                <form id="contactForm" onSubmit={handleSubmit}>
                  <div className="row g-3">

                    {/* Category */}
                    <div className="col-md-6">
                      <label className="db-label">Category</label>
                      <select name="category" className="form-select db-input"
                        value={form.category} onChange={handleFormChange} disabled={saving}>
                        <option value="">— Select category —</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Title */}
                    <div className="col-md-6">
                      <label className="db-label">Title</label>
                      <select name="title" className="form-select db-input"
                        value={form.title} onChange={handleFormChange} disabled={saving}>
                        <option value="">— Select —</option>
                        {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    {/* Full name */}
                    <div className="col-12">
                      <label className="db-label">Full Name *</label>
                      <input type="text" name="full_name" className="db-input"
                        value={form.full_name} onChange={handleFormChange}
                        placeholder="Full name" disabled={saving} />
                    </div>

                    {/* Contact 1 */}
                    <div className="col-md-6">
                      <label className="db-label">Contact Number 1 *</label>
                      <input type="tel" name="contact_number_1" className="db-input"
                        value={form.contact_number_1} onChange={handleFormChange}
                        placeholder="+91 98765 43210" disabled={saving} />
                    </div>

                    {/* Contact 2 */}
                    <div className="col-md-6">
                      <label className="db-label">Contact Number 2</label>
                      <input type="tel" name="contact_number_2" className="db-input"
                        value={form.contact_number_2} onChange={handleFormChange}
                        placeholder="Alternate number" disabled={saving} />
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                      <label className="db-label">Email</label>
                      <input type="email" name="email" className="db-input"
                        value={form.email} onChange={handleFormChange}
                        placeholder="email@example.com" disabled={saving} />
                    </div>

                    {/* Company */}
                    <div className="col-md-6">
                      <label className="db-label">Company Name</label>
                      <input type="text" name="company_name" className="db-input"
                        value={form.company_name} onChange={handleFormChange}
                        placeholder="Company / Organisation" disabled={saving} />
                    </div>

                    {/* Department */}
                    <div className="col-md-6">
                      <label className="db-label">Department Name</label>
                      <input type="text" name="department_name" className="db-input"
                        value={form.department_name} onChange={handleFormChange}
                        placeholder="Department" disabled={saving} />
                    </div>

                    {/* Designation */}
                    <div className="col-md-6">
                      <label className="db-label">Designation</label>
                      <input type="text" name="designation" className="db-input"
                        value={form.designation} onChange={handleFormChange}
                        placeholder="Role / Title" disabled={saving} />
                    </div>

                    {/* Referred by */}
                    <div className="col-md-6">
                      <label className="db-label">Referred By</label>
                      <input type="text" name="referred_by" className="db-input"
                        value={form.referred_by} onChange={handleFormChange}
                        placeholder="Reference name / number" disabled={saving} />
                    </div>

                    {/* Address */}
                    <div className="col-12">
                      <label className="db-label">Address</label>
                      <textarea name="address" className="db-input" rows={2}
                        value={form.address} onChange={handleFormChange}
                        placeholder="Full address" disabled={saving}
                        style={{ resize: 'vertical' }} />
                    </div>

                  </div>
                </form>
              </div>

              <div className="modal-footer border-0 px-4 py-3">
                <button className="btn btn-light" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" form="contactForm" className="btn btn-primary px-5" disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</> : (
                    <><i className={`bi ${modal.mode === 'add' ? 'bi-person-plus' : 'bi-check-lg'} me-1`}></i>
                    {modal.mode === 'add' ? 'Add Contact' : 'Save Changes'}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          VIEW MODAL
      ══════════════════════════════════════════ */}
      {modal?.mode === 'view' && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header border-0 px-4 pt-4 pb-2">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                    style={{ width: 44, height: 44, fontSize: '1.1rem', fontWeight: 700 }}>
                    {(modal.contact.full_name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <h5 className="mb-0">
                      {modal.contact.title ? `${modal.contact.title} ` : ''}{modal.contact.full_name}
                    </h5>
                    {modal.contact.category && <span className="db-badge">{modal.contact.category}</span>}
                  </div>
                </div>
                <button className="btn-close" onClick={closeModal} />
              </div>
              <div className="modal-body px-4">
                {[
                  { label: 'Contact Number 1', value: modal.contact.contact_number_1 },
                  { label: 'Contact Number 2', value: modal.contact.contact_number_2 },
                  { label: 'Email',            value: modal.contact.email },
                  { label: 'Company',          value: modal.contact.company_name },
                  { label: 'Department',       value: modal.contact.department_name },
                  { label: 'Designation',      value: modal.contact.designation },
                  { label: 'Referred By',      value: modal.contact.referred_by },
                  { label: 'Address',          value: modal.contact.address },
                  { label: 'Added On',         value: fmtDate(modal.contact.created_at) },
                ].map(({ label, value }) => value ? (
                  <div key={label} className="mb-3">
                    <div className="db-label">{label}</div>
                    <div style={{ fontSize: '.9rem', whiteSpace: 'pre-wrap' }}>{value}</div>
                  </div>
                ) : null)}
              </div>
              <div className="modal-footer border-0 px-4 py-3">
                <button className="btn btn-light" onClick={closeModal}>Close</button>
                <button className="btn btn-outline-primary" onClick={() => { closeModal(); openEdit(modal.contact); }}>
                  <i className="bi bi-pencil me-1"></i>Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          DELETE CONFIRM
      ══════════════════════════════════════════ */}
      {delTarget && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 400 }}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-body text-center px-4 py-4">
                <div className="mb-3" style={{ fontSize: '2.5rem' }}>🗑️</div>
                <h5>Delete Contact?</h5>
                <p className="text-muted mb-0">
                  <strong>{delTarget.title ? `${delTarget.title} ` : ''}{delTarget.full_name}</strong> will be permanently removed.
                </p>
              </div>
              <div className="modal-footer border-0 px-4 pb-4 justify-content-center gap-2">
                <button className="btn btn-light px-4" onClick={() => setDelTarget(null)} disabled={deleting}>Cancel</button>
                <button className="btn btn-danger px-4" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <><span className="spinner-border spinner-border-sm me-2" />Deleting…</> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          CATEGORY MANAGER MODAL
      ══════════════════════════════════════════ */}
      {catModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)', zIndex: 1065 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 460 }}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header border-0 px-4 pt-4 pb-2">
                <h5 className="mb-0"><i className="bi bi-tags me-2 text-primary"></i>Manage Categories</h5>
                <button className="btn-close" onClick={() => setCatModal(false)} />
              </div>
              <div className="modal-body px-4">
                {/* Add new */}
                <form onSubmit={handleAddCategory} className="d-flex gap-2 mb-3">
                  <input type="text" className="form-control db-input"
                    placeholder="New category name (e.g. Fashion Designer)"
                    value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                    disabled={catSaving} />
                  <button type="submit" className="btn btn-primary" disabled={catSaving} style={{ whiteSpace: 'nowrap' }}>
                    {catSaving ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-plus-lg me-1"></i>Add</>}
                  </button>
                </form>
                {catErr && <div className="alert alert-danger py-2 mb-3">{catErr}</div>}

                {/* Existing categories */}
                {categories.length === 0 ? (
                  <p className="text-muted text-center py-3">No categories yet.</p>
                ) : (
                  <div>
                    {categories.map((cat) => (
                      <div key={cat.id} className="cat-chip">
                        <span>{cat.name}</span>
                        <button className="cat-del" title="Delete category"
                          onClick={() => handleDeleteCategory(cat)}
                          disabled={catDeleting === cat.id}>
                          {catDeleting === cat.id
                            ? <span className="spinner-border spinner-border-sm" style={{ width: '0.6rem', height: '0.6rem' }} />
                            : <i className="bi bi-x-lg"></i>}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-muted mt-3 mb-0" style={{ fontSize: '.78rem' }}>
                  Deleting a category does not delete the contacts under it — they will appear uncategorised.
                </p>
              </div>
              <div className="modal-footer border-0 px-4 pb-4">
                <button className="btn btn-primary w-100" onClick={() => setCatModal(false)}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
