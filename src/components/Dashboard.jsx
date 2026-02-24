import React from "react";

export default function Dashboard() {
  return (
    <>
      <div id="main">
        <header className="mb-3">
          <a id="sidebarToggle" className="burger-btn">
            <i className="bi bi-list fs-3"></i>
          </a>
        </header>

        <div className="page-heading">
          <h3>Admin Dashboard</h3>
        </div>

        <div className="page-content">
          <section className="row">
            {/* ================= Top Summary Cards ================= */}
            <div className="col-12 col-lg-9">
              <div className="row">
                <div className="col-6 col-lg-3 col-md-6">
                  <div className="card">
                    <div className="card-body px-3 py-4-5">
                      <div className="row">
                        <div className="col-md-4">
                          <div className="stats-icon blue">
                            <i className="bi bi-calendar-check"></i>
                          </div>
                        </div>
                        <div className="col-md-8">
                          <h6 className="text-muted font-semibold">
                            Total Bookings
                          </h6>
                          <h6 className="font-extrabold mb-0">128</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-lg-3 col-md-6">
                  <div className="card">
                    <div className="card-body px-3 py-4-5">
                      <div className="row">
                        <div className="col-md-4">
                          <div className="stats-icon green">
                            <i className="bi bi-hourglass-split"></i>
                          </div>
                        </div>
                        <div className="col-md-8">
                          <h6 className="text-muted font-semibold">
                            Upcoming Events
                          </h6>
                          <h6 className="font-extrabold mb-0">32</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-lg-3 col-md-6">
                  <div className="card">
                    <div className="card-body px-3 py-4-5">
                      <div className="row">
                        <div className="col-md-4">
                          <div className="stats-icon orange">
                            <i className="bi bi-cash-coin"></i>
                          </div>
                        </div>
                        <div className="col-md-8">
                          <h6 className="text-muted font-semibold">
                            Pending Payments
                          </h6>
                          <h6 className="font-extrabold mb-0">14</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-6 col-lg-3 col-md-6">
                  <div className="card">
                    <div className="card-body px-3 py-4-5">
                      <div className="row">
                        <div className="col-md-4">
                          <div className="stats-icon red">
                            <i className="bi bi-exclamation-triangle"></i>
                          </div>
                        </div>
                        <div className="col-md-8">
                          <h6 className="text-muted font-semibold">
                            Low Uniform Stock
                          </h6>
                          <h6 className="font-extrabold mb-0">3 Types</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= Booking Analytics Chart ================= */}
              <div className="row mt-3">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h4>Monthly Booking Statistics</h4>
                    </div>
                    <div className="card-body">
                      <div id="booking-stats-chart"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= Latest Bookings Table ================= */}
              <div className="row mt-3">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h4>Latest Bookings</h4>
                    </div>
                    <div className="card-body">
                      <table className="table table-hover table-lg">
                        <thead>
                          <tr>
                            <th>Client</th>
                            <th>Event</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Payment</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Riya Sharma</td>
                            <td>Wedding</td>
                            <td>12 Feb</td>
                            <td>Staff Allocated</td>
                            <td>Pending</td>
                          </tr>
                          <tr>
                            <td>John Mathew</td>
                            <td>Corporate</td>
                            <td>15 Feb</td>
                            <td>Order Received</td>
                            <td>Paid</td>
                          </tr>
                          <tr>
                            <td>Aditi Rao</td>
                            <td>Birthday</td>
                            <td>19 Feb</td>
                            <td>Planning</td>
                            <td>Pending</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= Right Sidebar Widgets ================= */}
            <div className="col-12 col-lg-3">
              <div className="card">
                <div className="card-header">
                  <h4>Live Event Tracking</h4>
                </div>
                <div className="card-body" style={{ height: "200px" }}>
                  <div id="live-map">Map Preview Here</div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h4>Low Stock Uniforms</h4>
                </div>
                <div className="card-body">
                  <ul className="list-group">
                    <li className="list-group-item d-flex justify-content-between">
                      <span>White Blazer</span>
                      <span className="text-danger fw-bold">Only 4 left</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Black Tuxedo</span>
                      <span className="text-danger fw-bold">Out of Stock</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Traditional Sherwani</span>
                      <span className="text-warning fw-bold">Low Stock</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer>
          <div className="footer clearfix mb-0 text-muted">
            <div className="float-start">
              <p>2021 &copy; Mazer</p>
            </div>
            <div className="float-end">
              <p>
                Crafted with
                <span className="text-danger">
                  <i className="bi bi-heart"></i>
                </span>{" "}
                by <a href="http://ahmadsaugi.com">A. Saugi</a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
