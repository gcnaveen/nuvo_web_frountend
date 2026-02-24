import React from "react";
import { Link } from "react-router-dom";

const Events = () => {
  return (
    <>
      <div className="page-heading">
        <h3>Events</h3>
        <p className="text-muted mb-0">
          View and manage all client bookings and event statuses.
        </p>
      </div>

      <div className="page-content">
  
        <section className="row">
          {/* ======= MAIN EVENTS TABLE AREA ======= */}
          <div className="col-12 ">
            {/* Filters */}
            <div className="card">
              <div className="card-header">
                <h4>Filters</h4>
              </div>
              <div className="card-body">
                <div className="row g-2">
                  <div className="col-md-3">
                    <label className="form-label mb-1">Event  </label>
                    <select className="form-select">
                      <option value="">All</option>
                      <option>Wedding</option>
                      <option>Corporate</option>
                      <option>Birthday</option>
                      <option>Fashion Event</option>
                      <option>Party</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label mb-1">Status</label>
                    <select className="form-select">
                      <option value="">All</option>
                      <option>Order Received</option>
                      <option>Staffs Allocated</option>
                      <option>Planning Started</option>
                      <option>Event Completed</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label mb-1">Date</label>
                    <input type="date" className="form-control" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label mb-1">Search</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Client / Event / City"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Events Table */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4>All Events</h4>
                <button className="btn btn-sm btn-primary">
                  <i className="bi bi-plus-circle me-1"></i> New Event (Admin)
                </button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover table-lg align-middle">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Client</th>
                        <th>Event Type</th>
                        <th>Date &amp; Time</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Team</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>#BK-1023</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm">
                              <img
                                src="assets/images/faces/5.jpg"
                                alt="Client"
                              />
                            </div>
                            <div className="ms-3">
                              <p className="mb-0 fw-bold">Riya Sharma</p>
                              <small className="text-muted">
                                riya@example.com
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>Wedding</td>
                        <td>
                          12 Feb 2025
                          <br />
                          <small className="text-muted">
                            6:00 PM – 11:00 PM
                          </small>
                        </td>
                        <td>Bangalore, Karnataka</td>
                        <td>
                          <span className="badge bg-warning text-dark">
                            Staffs Allocated
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            20% Advance
                          </span>
                          <br />
                          <small className="text-muted">
                            ₹25,000 / ₹1,25,000
                          </small>
                        </td>
                        <td>
                          <small>5 Staff, 2 MUAs</small>
                        </td>
                        <td>
                          <Link
                            to="/events/details"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                        </td>
                      </tr>

                      <tr>
                        <td>#BK-1018</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm">
                              <img
                                src="assets/images/faces/3.jpg"
                                alt="Client"
                              />
                            </div>
                            <div className="ms-3">
                              <p className="mb-0 fw-bold">John Mathew</p>
                              <small className="text-muted">
                                john@example.com
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>Corporate</td>
                        <td>
                          15 Feb 2025
                          <br />
                          <small className="text-muted">
                            10:00 AM – 4:00 PM
                          </small>
                        </td>
                        <td>Hyderabad, Telangana</td>
                        <td>
                          <span className="badge bg-info text-dark">
                            Planning Started
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success">Paid in Full</span>
                          <br />
                          <small className="text-muted">₹80,000</small>
                        </td>
                        <td>
                          <small>3 Staff, 1 MUA</small>
                        </td>
                        <td>
                          <Link
                            to="/events/details"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                        </td>
                      </tr>

                      <tr>
                        <td>#BK-1009</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm">
                              <img
                                src="assets/images/faces/2.jpg"
                                alt="Client"
                              />
                            </div>
                            <div className="ms-3">
                              <p className="mb-0 fw-bold">Aditi Rao</p>
                              <small className="text-muted">
                                aditi@example.com
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>Birthday</td>
                        <td>
                          19 Feb 2025
                          <br />
                          <small className="text-muted">
                            7:00 PM – 10:00 PM
                          </small>
                        </td>
                        <td>Chennai, Tamil Nadu</td>
                        <td>
                          <span className="badge bg-primary">
                            Order Received
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-danger">
                            Payment Pending
                          </span>
                          <br />
                          <small className="text-muted">Advance not paid</small>
                        </td>
                        <td>
                          <small>Not Assigned</small>
                        </td>
                        <td>
                          <Link
                            to="/events/details"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                        </td>
                      </tr>

                      <tr>
                        <td>#BK-0998</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm">
                              <img
                                src="assets/images/faces/1.jpg"
                                alt="Client"
                              />
                            </div>
                            <div className="ms-3">
                              <p className="mb-0 fw-bold">Sanjay Verma</p>
                              <small className="text-muted">
                                sanjay@example.com
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>Fashion Event</td>
                        <td>
                          05 Feb 2025
                          <br />
                          <small className="text-muted">Full Day</small>
                        </td>
                        <td>Mumbai, Maharashtra</td>
                        <td>
                          <span className="badge bg-success">
                            Event Completed
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-success">Paid in Full</span>
                          <br />
                          <small className="text-muted">₹2,10,000</small>
                        </td>
                        <td>
                          <small>10 Staff, 3 MUAs</small>
                        </td>
                        <td>
                          <Link
                            to="/events/details"
                            className="btn btn-sm btn-outline-primary"
                          >
                            <i className="bi bi-eye"></i>
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ======= RIGHT SIDE SUMMARY / QUICK VIEW ======= */}
          {/* <div className="col-12 col-lg-3"> */}
          {/* Today / Upcoming Events */}
          {/* <div className="card">
              <div className="card-header">
                <h4>Upcoming (Next 7 Days)</h4>
              </div>
              <div className="card-body pb-3">
                <div className="mb-3">
                  <h6 className="mb-1">Wedding – Riya Sharma</h6>
                  <small className="text-muted d-block">
                    12 Feb • Bangalore
                  </small>
                  <span className="badge bg-warning text-dark mt-1">
                    Staffs Allocated
                  </span>
                </div>
                <div className="mb-3">
                  <h6 className="mb-1">Corporate – John Mathew</h6>
                  <small className="text-muted d-block">
                    15 Feb • Hyderabad
                  </small>
                  <span className="badge bg-info text-dark mt-1">
                    Planning Started
                  </span>
                </div>
                <div className="mb-2">
                  <h6 className="mb-1">Birthday – Aditi Rao</h6>
                  <small className="text-muted d-block">19 Feb • Chennai</small>
                  <span className="badge bg-primary mt-1">
                    {" "}
                    Order Received{" "}
                  </span>
                </div>
                <button className="btn btn-sm btn-light-primary w-100 mt-2">
                  View Calendar
                </button>
              </div>
            </div> */}

          {/* Status Legend */}
          {/* <div className="card">
              <div className="card-header">
                <h4>Status Legend</h4>
              </div>
              <div className="card-body">
                <p className="mb-2">
                  <span className="badge bg-primary me-1"></span>
                  <small>Order Received</small>
                </p>
                <p className="mb-2">
                  <span className="badge bg-warning text-dark me-1"></span>
                  <small>Staffs Allocated</small>
                </p>
                <p className="mb-2">
                  <span className="badge bg-info text-dark me-1"></span>
                  <small>Planning Started</small>
                </p>
                <p className="mb-0">
                  <span className="badge bg-success me-1"></span>
                  <small>Event Completed</small>
                </p>
              </div>
            </div>
          </div> */}
        </section>
      </div>
    </>
  );
};

export default Events;
