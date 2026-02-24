import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import clientsData from "../../data/clients.json";

// Shared Package Colors for Subscription Plans
const packageConfig = {
  platinum: { label: "Platinum", color: "#8E24AA", textColor: "#FFFFFF" },
  diamond: { label: "Diamond", color: "#1E88E5", textColor: "#FFFFFF" },
  gold: { label: "Gold", color: "#D4AF37", textColor: "#000000" },
  silver: { label: "Silver", color: "#B0BEC5", textColor: "#000000" },
  bronze: { label: "Bronze", color: "#CD7F32", textColor: "#FFFFFF" },
  none: { label: "No Plan", color: "#eeeeee", textColor: "#333333" },
};

export default function Clients() {
  const navigate = useNavigate();

  // States for Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Extract unique cities
  const uniqueCities = [...new Set(clientsData.map((item) => item.city))];

  // Logic: Filtering
  const filteredClients = useMemo(() => {
    return clientsData.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = cityFilter ? item.city === cityFilter : true;
      const matchesStatus = statusFilter ? item.status === statusFilter : true;
      const matchesPlan = planFilter
        ? item.subscription.plan === planFilter
        : true;

      // Date Range Logic
      let matchesDate = true;
      if (startDate && endDate) {
        matchesDate =
          item.registeredOn >= startDate && item.registeredOn <= endDate;
      } else if (startDate) {
        matchesDate = item.registeredOn >= startDate;
      }

      return (
        matchesSearch &&
        matchesCity &&
        matchesStatus &&
        matchesPlan &&
        matchesDate
      );
    });
  }, [searchTerm, cityFilter, statusFilter, planFilter, startDate, endDate]);

  // Logic: Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredClients.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

  const getStatusBadge = (status) => {
    const maps = {
      active: "success",
      inactive: "secondary",
      blocked: "danger",
    };
    return maps[status] || "primary";
  };

  return (
    <>
      <style>
        {`
          .nuvo-input { background-color: #f8f9fa !important; border: 1px solid #f8f9fa !important; }
          .nuvo-input:focus { border-color: #8E24AA !important; box-shadow: 0 0 0 0.25rem rgba(142, 36, 170, 0.1) !important; background-color: #fff !important; }
          .section-title { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #888; display: flex; align-items: center; margin-bottom: 15px; }
          .section-title::after { content: ""; flex: 1; height: 1px; background: #eee; margin-left: 10px; }
        `}
      </style>

      <div className="page-heading">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <div>
            <h3>Client Management</h3>
            <p className="text-muted mb-0">
              Manage client accounts, bookings, and subscriptions.
            </p>
          </div>
          <div className="d-flex gap-2">
            {/* UI Placeholder for Export - logic to be added later */}
            <button
              className="btn btn-outline-success"
              onClick={() => console.log("Excel Export Triggered")}
            >
              <i className="bi bi-file-earmark-excel"></i> Export Excel
            </button>
            <button
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#addClientModal"
            >
              <i className="bi bi-person-plus"></i> Add Client
            </button>
          </div>
        </div>
      </div>
      <div className="page-content">
        {/* FILTERS */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="small fw-bold">Search Client</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name or Email..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                <label className="small fw-bold">Plan Type</label>
                <select
                  className="form-select"
                  onChange={(e) => setPlanFilter(e.target.value)}
                >
                  <option value="">All Plans</option>
                  <option value="diamond">Diamond</option>
                  <option value="platinum">Platinum</option>
                  <option value="gold">Gold</option>
                  <option value="none">No Plan</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="small fw-bold">Status</label>
                <select
                  className="form-select"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="small fw-bold">Joined Date Range</label>
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
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Client</th>
                    <th>City</th>
                    <th>Joined Date</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((client) => {
                    const plan =
                      packageConfig[client.subscription.plan] ||
                      packageConfig.none;
                    return (
                      <tr key={client.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={client.avatar}
                              alt=""
                              className="rounded-circle me-3"
                              width="40"
                              height="40"
                              style={{ objectFit: "cover" }}
                            />
                            <div>
                              <div className="fw-bold text-primary">
                                {client.name}
                              </div>
                              <small className="text-muted">
                                {client.email}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>{client.city}</td>
                        <td>{client.registeredOn}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: plan.color,
                              color: plan.textColor,
                            }}
                          >
                            {plan.label}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge bg-${getStatusBadge(client.status)}`}
                          >
                            {client.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/clients/${client.id}`)}
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

            {/* PAGINATION */}
            <nav className="d-flex justify-content-between align-items-center mt-4">
              <small className="text-muted">
                Showing {indexOfFirstRow + 1} to{" "}
                {Math.min(indexOfLastRow, filteredClients.length)} of{" "}
                {filteredClients.length}
              </small>
              <ul className="pagination pagination-primary mb-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* ================= ADD CLIENT MODAL ================= */}
      <div
        className="modal fade modal-nuvo"
        id="addClientModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div
            className="modal-content shadow-lg"
            style={{ borderRadius: "15px" }}
          >
            <div className="modal-header border-0 p-4 pb-0">
              <h5 className="fw-bold">Register New Client</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body p-4">
              <form className="row g-3">
                <div className="col-12">
                  <div className="section-title">Account Details</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Full Name</label>
                  <input
                    type="text"
                    className="form-control nuvo-input"
                    placeholder="Enter name"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control nuvo-input"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Phone</label>
                  <input
                    type="text"
                    className="form-control nuvo-input"
                    placeholder="+91..."
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">City</label>
                  <input
                    type="text"
                    className="form-control nuvo-input"
                    placeholder="City"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Status</label>
                  <select className="form-select nuvo-input">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="col-12 mt-4">
                  <div className="section-title">Subscription Plan</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">
                    Select Plan
                  </label>
                  <select className="form-select nuvo-input">
                    <option value="none">No Plan</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">
                    Profile Picture
                  </label>
                  <input type="file" className="form-control nuvo-input" />
                </div>
              </form>
            </div>
            <div className="modal-footer border-0 p-4 pt-0">
              <button className="btn btn-light" data-bs-dismiss="modal">
                Cancel
              </button>
              <button className="btn btn-dark px-4">Register Client</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
