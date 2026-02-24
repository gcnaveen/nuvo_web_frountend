import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import data from "../../data/staff.json";

// Package Configuration for Badges
const packageConfig = {
  platinum: { label: "Platinum", color: "#8E24AA", textColor: "#FFFFFF" },
  diamond: { label: "Diamond", color: "#1E88E5", textColor: "#FFFFFF" },
  gold: { label: "Gold", color: "#D4AF37", textColor: "#000000" },
  silver: { label: "Silver", color: "#B0BEC5", textColor: "#000000" },
  bronze: { label: "Bronze", color: "#CD7F32", textColor: "#FFFFFF" },
};

const Staff = () => {
  const navigate = useNavigate();

  // States for Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  // Helper for Status Badge Colors
  const getStatusBadge = (status) => {
    const maps = {
      active: "success",
      onevent: "warning",
      inactive: "secondary",
      blocked: "danger",
    };
    return maps[status] || "primary";
  };

  const uniqueCities = [...new Set(data.map((item) => item.city))];

  const filteredStaff = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.stage_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter
        ? item.package === categoryFilter
        : true;
      const matchesCity = cityFilter ? item.city === cityFilter : true;

      let matchesStatus = true;
      if (statusFilter === "assigned")
        matchesStatus = item.status === "onevent";
      if (statusFilter === "unassigned")
        matchesStatus = item.status !== "onevent";

      return matchesSearch && matchesCategory && matchesCity && matchesStatus;
    });
  }, [
    searchTerm,
    categoryFilter,
    cityFilter,
    statusFilter,
    startDate,
    endDate,
  ]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredStaff.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);

  const handleExportExcel = () => {
    console.log("Exporting to Excel...");
  };

  return (
    <>
      {/* INJECTED CSS */}
      <style>
        {`
          .modal-nuvo .modal-content {
            border-radius: 15px;
            border: none;
          }
          .modal-nuvo .modal-header {
            border-bottom: 1px solid #f0f0f0;
            padding: 1.5rem;
          }
          .modal-nuvo .section-title {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #888;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
          }
          .modal-nuvo .section-title::after {
            content: "";
            flex: 1;
            height: 1px;
            background: #eee;
            margin-left: 10px;
          }
          .nuvo-input {
            background-color: #f8f9fa !important;
            border: 1px solid #f8f9fa !important;
            transition: all 0.2s ease;
          }
          .nuvo-input:focus {
            background-color: #fff !important;
            border-color: #8E24AA !important;
            box-shadow: 0 0 0 0.25rem rgba(142, 36, 170, 0.1) !important;
          }
          .cursor-pointer { cursor: pointer; }
        `}
      </style>

      <div className="page-heading">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h3>Staff Management</h3>
            <p className="text-muted">
              Total Found: {filteredStaff.length} Members
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-success"
              onClick={handleExportExcel}
            >
              <i className="bi bi-file-earmark-excel"></i> Export Excel
            </button>
            <button
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#addStaffModal"
            >
              <i className="bi bi-person-plus"></i> Add Staff
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* FILTERS */}
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="small fw-bold">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name or Stage Name..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="small fw-bold">Category</label>
                <select
                  className="form-select"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {Object.keys(packageConfig).map((key) => (
                    <option key={key} value={key}>
                      {packageConfig[key].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="small fw-bold">City</label>
                <select
                  className="form-select"
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="">All Cities</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="small fw-bold">Status</label>
                <select
                  className="form-select"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="unassigned">Unassigned (Available)</option>
                  <option value="assigned">Assigned (On Event)</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="small fw-bold">Date Range</label>
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control"
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <input
                    type="date"
                    className="form-control"
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card mt-4 shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Staff Member</th>
                    <th>Stage Name</th>
                    <th>Category</th>
                    <th>City</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((staff) => {
                    const pkg = packageConfig[staff.package] || {
                      color: "#eee",
                      textColor: "#000",
                      label: staff.package,
                    };
                    return (
                      <tr key={staff.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={staff.avatar}
                              alt=""
                              className="rounded-circle me-3"
                              width="40"
                              height="40"
                              style={{ objectFit: "cover" }}
                            />
                            <div>
                              <div className="fw-bold text-primary">
                                {staff.name}
                              </div>
                              <small className="text-muted">{staff.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-muted">
                            {staff.stage_name || "-"}
                          </span>
                        </td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: pkg.color,
                              color: pkg.textColor,
                              fontWeight: "600",
                              padding: "0.5em 0.8em",
                            }}
                          >
                            {pkg.label}
                          </span>
                        </td>
                        <td>{staff.city}</td>
                        <td>
                          <span
                            className={`badge bg-${getStatusBadge(staff.status)}`}
                          >
                            {staff.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/staff/${staff.id}`)}
                          >
                            <i className="bi bi-eye"></i> View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* PAGINATION ... (Keep as is) */}
          </div>
        </div>
      </div>

      {/* ================= REDESIGNED ADD STAFF MODAL ================= */}
      <div
        className="modal fade modal-nuvo"
        id="addStaffModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content shadow-lg">
            <div className="modal-header d-flex align-items-center">
              <div className="bg-light rounded-circle p-2 me-3">
                <i className="bi bi-person-plus text-primary fs-4"></i>
              </div>
              <div>
                <h5 className="modal-title mb-0 fw-bold">Add New Staff</h5>
                <small className="text-muted">
                  Create a new profile in the hosting directory
                </small>
              </div>
              <button
                type="button"
                className="btn-close ms-auto"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body p-4">
              <form className="row g-4">
                {/* Section 1: Identity */}
                <div className="col-12">
                  <div className="section-title fw-bold">
                    Identity & Branding
                  </div>
                  <div className="row g-3">
                    <div className="col-md-2 text-center">
                      <div className="position-relative d-inline-block">
                        <div
                          className="rounded-circle bg-light d-flex align-items-center justify-content-center border border-2 border-dashed"
                          style={{ width: "80px", height: "80px" }}
                        >
                          <i className="bi bi-camera text-muted fs-3"></i>
                        </div>
                        <input
                          type="file"
                          className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer"
                        />
                      </div>
                      <small className="text-muted d-block mt-1">Photo</small>
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small fw-bold">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control nuvo-input"
                        placeholder="Legal Name"
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small fw-bold">
                        Stage Name
                      </label>
                      <input
                        type="text"
                        className="form-control nuvo-input"
                        placeholder="Public Display Name"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Configuration */}
                <div className="col-12">
                  <div className="section-title fw-bold">Classification</div>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">
                        Membership Tier
                      </label>
                      <select className="form-select nuvo-input">
                        {Object.keys(packageConfig).map((key) => (
                          <option key={key} value={key}>
                            {packageConfig[key].label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Status</label>
                      <select className="form-select nuvo-input">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">City</label>
                      <input
                        type="text"
                        className="form-control nuvo-input"
                        placeholder="e.g. Chennai"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Professional */}
                <div className="col-12">
                  <div className="section-title fw-bold">
                    Professional Details
                  </div>
                  <div className="row g-3">
                    <div className="col-md-3">
                      <label className="form-label small fw-bold">Gender</label>
                      <select className="form-select nuvo-input">
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-bold">
                        Exp (Years)
                      </label>
                      <input
                        type="number"
                        className="form-control nuvo-input"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-bold">
                        Uniform Size
                      </label>
                      <select className="form-select nuvo-input">
                        <option>S</option>
                        <option>M</option>
                        <option>L</option>
                        <option>XL</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-bold">Phone</label>
                      <input
                        type="text"
                        className="form-control nuvo-input"
                        placeholder="+91..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Media */}
                <div className="col-12">
                  <div className="section-title fw-bold">Portfolio & Media</div>
                  <div className="p-3 border border-2 border-dashed rounded text-center bg-light">
                    <i className="bi bi-images text-muted fs-2"></i>
                    <p className="small text-muted mb-2">
                      Drag and drop portfolio images or click to browse
                    </p>
                    <input
                      type="file"
                      className="form-control form-control-sm w-50 mx-auto"
                      multiple
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer border-0 p-4">
              <button
                type="button"
                className="btn btn-link text-muted text-decoration-none"
                data-bs-dismiss="modal"
              >
                Discard
              </button>
              <button
                type="button"
                className="btn btn-dark px-5 py-2 shadow-sm"
                style={{ borderRadius: "8px" }}
              >
                Create Member
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Staff;
