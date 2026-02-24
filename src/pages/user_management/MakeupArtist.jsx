import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import muaData from "../../data/makeup_artists.json";

const MakeupArtist = () => {
  const navigate = useNavigate();

  // States for Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [expFilter, setExpFilter] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Helper for Status Badge Colors
  const getStatusBadge = (status) => {
    const maps = {
      active: "success",
      on_event: "warning",
      inactive: "secondary",
      blocked: "danger",
    };
    return maps[status] || "primary";
  };

  // Extract unique cities
  const uniqueCities = [...new Set(muaData.map((item) => item.city))];

  // Logic: Filtering
  const filteredMUA = useMemo(() => {
    return muaData.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCity = cityFilter ? item.city === cityFilter : true;
      const matchesStatus = statusFilter ? item.status === statusFilter : true;

      let matchesExp = true;
      if (expFilter === "0-2") matchesExp = item.experience <= 2;
      else if (expFilter === "3-5")
        matchesExp = item.experience > 2 && item.experience <= 5;
      else if (expFilter === "5+") matchesExp = item.experience > 5;

      return matchesSearch && matchesCity && matchesStatus && matchesExp;
    });
  }, [searchTerm, cityFilter, statusFilter, expFilter]);

  // Logic: Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredMUA.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredMUA.length / rowsPerPage);

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
            <h3>Makeup Artist Management</h3>
            <p className="text-muted mb-0">
              Manage portfolios and event assignments for MUAs.
            </p>
          </div>
          <div className="d-flex gap-2">
            {/* UI Placeholder for Export - logic to be added later */}
            <button
              className="btn btn-outline-success"
              onClick={() => console.log("MUA Export Triggered")}
            >
              <i className="bi bi-file-earmark-excel"></i> Export Excel
            </button>
            <button
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#addMuaModal"
            >
              <i className="bi bi-person-plus"></i> Add MUA
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* FILTERS */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="small fw-bold">Search Artist</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name..."
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
              <div className="col-md-3">
                <label className="small fw-bold">Experience</label>
                <select
                  className="form-select"
                  onChange={(e) => setExpFilter(e.target.value)}
                >
                  <option value="">Any Experience</option>
                  <option value="0-2">Junior (0-2 Yrs)</option>
                  <option value="3-5">Intermediate (3-5 Yrs)</option>
                  <option value="5+">Senior (5+ Yrs)</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="small fw-bold">Status</label>
                <select
                  className="form-select"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="on_event">On Event</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                    <th>Artist</th>
                    <th>Speciality</th>
                    <th>City</th>
                    <th>Experience</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((mua) => (
                    <tr key={mua.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={mua.avatar}
                            alt=""
                            className="rounded-circle me-3"
                            width="45"
                            height="45"
                            style={{ objectFit: "cover" }}
                          />
                          <div>
                            <div className="fw-bold text-primary">
                              {mua.name}
                            </div>
                            <small className="text-muted">{mua.id}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted small">
                          {mua.speciality}
                        </span>
                      </td>
                      <td>{mua.city}</td>
                      <td>{mua.experience} Years</td>
                      <td>
                        <span
                          className={`badge bg-${getStatusBadge(mua.status)}`}
                        >
                          {mua.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/makeup-artist/${mua.id}`)}
                        >
                          <i className="bi bi-eye"></i> View Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <nav className="d-flex justify-content-between align-items-center mt-4">
              <small className="text-muted">
                Showing {indexOfFirstRow + 1} to{" "}
                {Math.min(indexOfLastRow, filteredMUA.length)} of{" "}
                {filteredMUA.length}
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

      {/* ================= ADD MUA MODAL ================= */}
      <div
        className="modal fade"
        id="addMuaModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div
            className="modal-content border-0 shadow-lg"
            style={{ borderRadius: "15px" }}
          >
            <div className="modal-header border-0 p-4 pb-0">
              <h5 className="fw-bold">Register New Makeup Artist</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body p-4">
              <form className="row g-3">
                <div className="col-12">
                  <div className="section-title">Personal Details</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Full Name</label>
                  <input
                    type="text"
                    className="form-control nuvo-input"
                    placeholder="Name"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Speciality</label>
                  <input
                    type="text"
                    className="form-control nuvo-input"
                    placeholder="e.g. Bridal / HD Makeup"
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
                    placeholder="Bangalore"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">
                    Experience (Yrs)
                  </label>
                  <input type="number" className="form-control nuvo-input" />
                </div>

                <div className="col-12 mt-4">
                  <div className="section-title">Media & Credentials</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">
                    Profile Photo
                  </label>
                  <input type="file" className="form-control nuvo-input" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Status</label>
                  <select className="form-select nuvo-input">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer border-0 p-4 pt-0">
              <button className="btn btn-light" data-bs-dismiss="modal">
                Cancel
              </button>
              <button className="btn btn-dark px-4">
                Create Artist Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MakeupArtist;
