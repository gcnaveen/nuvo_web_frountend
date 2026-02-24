import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import events_data from "../data/events.json";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    // Find event by ID, or fallback to first item for preview
    const foundEvent =
      events_data.find((e) => e.bookingId === id) || events_data[0];
    setEventData(foundEvent);
  }, [id]);

  if (!eventData)
    return <div className="p-5 text-center">Loading event...</div>;

  // --- LOGIC: Deep Object Update Handler ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");

    if (keys.length === 2) {
      setEventData((prev) => ({
        ...prev,
        [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
      }));
    } else {
      setEventData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // --- LOGIC: Progress Bar Calculation based on workflowStage ---
  const getProgress = () => {
    const stageMap = {
      created: { percent: 25, color: "bg-primary", label: "Created" },
      planning: { percent: 50, color: "bg-info", label: "Planning Started" },
      staffs_assigned: {
        percent: 75,
        color: "bg-warning",
        label: "Staff Allocated",
      },
      event_completed: {
        percent: 100,
        color: "bg-success",
        label: "Completed",
      },
      cancelled: { percent: 100, color: "bg-danger", label: "Cancelled" },
    };
    return (
      stageMap[eventData.workflowStage] || {
        percent: 10,
        color: "bg-secondary",
        label: eventData.workflowStage,
      }
    );
  };

  const progress = getProgress();

  return (
    <>
      <style>
        {`
          .nuvo-input { background-color: #f8f9fa !important; border: 1px solid #f8f9fa !important; }
          .nuvo-input:focus { border-color: #8E24AA !important; box-shadow: 0 0 0 0.25rem rgba(142, 36, 170, 0.1) !important; background-color: #fff !important; }
        `}
      </style>

      {/* HEADER & ACTIONS */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button
            className="btn btn-light shadow-sm me-3"
            onClick={() => navigate("/events")}
          >
            <i className="bi bi-arrow-left"></i> Back to Events
          </button>
          <h3 className="d-inline-block fw-bold mb-0 align-middle">
            {eventData.eventTitle}{" "}
            <span className="text-muted fs-5 ms-2">#{eventData.bookingId}</span>
          </h3>
        </div>
        <div>
          {!isEditing ? (
            <button
              className="btn btn-primary px-4"
              onClick={() => setIsEditing(true)}
            >
              <i className="bi bi-pencil-square me-2"></i> Edit Event
            </button>
          ) : (
            <>
              <button
                className="btn btn-success me-2 px-4"
                onClick={() => setIsEditing(false)}
              >
                <i className="bi bi-check-lg me-2"></i> Save Changes
              </button>
              <button
                className="btn btn-light shadow-sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="fw-bold text-muted text-uppercase small">
              Workflow Stage
            </span>
            <span className={`badge ${progress.color} fw-bold px-3 py-2`}>
              {progress.label}
            </span>
          </div>
          <div
            className="progress"
            style={{ height: "12px", borderRadius: "10px" }}
          >
            <div
              className={`progress-bar progress-bar-striped progress-bar-animated ${progress.color}`}
              style={{ width: `${progress.percent}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* LEFT COLUMN */}
        <div className="col-lg-8">
          {/* EVENT INFO */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Event Information</h5>
            </div>
            <div className="card-body row g-4">
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">
                  Event Title
                </label>
                {isEditing ? (
                  <input
                    name="eventTitle"
                    className="form-control nuvo-input"
                    value={eventData.eventTitle}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="p-2 border-bottom fw-semibold">
                    {eventData.eventTitle}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">
                  Event Type
                </label>
                {isEditing ? (
                  <select
                    name="eventType"
                    className="form-select nuvo-input"
                    value={eventData.eventType}
                    onChange={handleChange}
                  >
                    <option>Wedding</option>
                    <option>Corporate</option>
                    <option>Birthday</option>
                    <option>Fashion Event</option>
                  </select>
                ) : (
                  <div className="p-2 border-bottom fw-semibold">
                    {eventData.eventType}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">
                  Start Date & Time
                </label>
                {isEditing ? (
                  <input
                    type="datetime-local"
                    name="start"
                    className="form-control nuvo-input"
                    value={eventData.start}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="p-2 border-bottom fw-semibold">
                    {new Date(eventData.start).toLocaleString()}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">
                  End Date & Time
                </label>
                {isEditing ? (
                  <input
                    type="datetime-local"
                    name="end"
                    className="form-control nuvo-input"
                    value={eventData.end}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="p-2 border-bottom fw-semibold">
                    {new Date(eventData.end).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* VENUE & LOCATION */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">Location & Venue</h5>
              {!isEditing && (
                <a
                  href={eventData.location.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-outline-danger"
                >
                  <i className="bi bi-geo-alt-fill me-1"></i> Open in Maps
                </a>
              )}
            </div>
            <div className="card-body row g-4">
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">
                  Venue Name
                </label>
                {isEditing ? (
                  <input
                    name="location.venueName"
                    className="form-control nuvo-input"
                    value={eventData.location.venueName}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="p-2 border-bottom fw-semibold">
                    {eventData.location.venueName}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label className="small fw-bold text-muted mb-1">
                  City & State
                </label>
                {isEditing ? (
                  <div className="input-group">
                    <input
                      name="city"
                      className="form-control nuvo-input"
                      value={eventData.city}
                      onChange={handleChange}
                      placeholder="City"
                    />
                    <input
                      name="state"
                      className="form-control nuvo-input"
                      value={eventData.state}
                      onChange={handleChange}
                      placeholder="State"
                    />
                  </div>
                ) : (
                  <div className="p-2 border-bottom fw-semibold">
                    {eventData.city}, {eventData.state}
                  </div>
                )}
              </div>
              <div className="col-12">
                <label className="small fw-bold text-muted mb-1">
                  Full Address
                </label>
                {isEditing ? (
                  <textarea
                    name="location.formattedAddress"
                    className="form-control nuvo-input"
                    rows="2"
                    value={eventData.location.formattedAddress}
                    onChange={handleChange}
                  ></textarea>
                ) : (
                  <div className="p-2 border-bottom fw-semibold">
                    {eventData.location.formattedAddress}
                  </div>
                )}
              </div>
              {isEditing && (
                <div className="col-12">
                  <label className="small fw-bold text-muted mb-1">
                    Google Maps URL
                  </label>
                  <input
                    name="location.googleMapsUrl"
                    className="form-control nuvo-input text-primary"
                    value={eventData.location.googleMapsUrl}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* FINANCIALS */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Financial Summary</h5>
            </div>
            <div className="card-body row g-4">
              <div className="col-md-4">
                <label className="small fw-bold text-muted mb-1">
                  Total Amount
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="payment.totalAmount"
                    className="form-control nuvo-input"
                    value={eventData.payment.totalAmount || 0}
                    onChange={handleChange}
                  />
                ) : (
                  <h4 className="fw-bold mb-0">
                    ₹{eventData.payment.totalAmount?.toLocaleString()}
                  </h4>
                )}
              </div>
              <div className="col-md-4">
                <label className="small fw-bold text-muted mb-1">
                  Amount Paid
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="payment.paidAmount"
                    className="form-control nuvo-input"
                    value={eventData.payment.paidAmount || 0}
                    onChange={handleChange}
                  />
                ) : (
                  <h4 className="fw-bold text-success mb-0">
                    ₹{eventData.payment.paidAmount?.toLocaleString()}
                  </h4>
                )}
              </div>
              <div className="col-md-4">
                <label className="small fw-bold text-muted mb-1">
                  Payment Status
                </label>
                {isEditing ? (
                  <select
                    name="payment.paymentStatus"
                    className="form-select nuvo-input"
                    value={eventData.payment.paymentStatus}
                    onChange={handleChange}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                  </select>
                ) : (
                  <span className="badge bg-light text-dark border px-3 py-2 mt-1 fs-6 text-uppercase">
                    {eventData.payment.paymentStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-lg-4">
          {/* CLIENT DETAILS */}
          <div className="card shadow-sm mb-4 text-center p-4">
            <img
              src={eventData.client.avatar}
              alt="Client"
              className="rounded-circle mx-auto mb-3 border shadow-sm"
              style={{ width: "100px", height: "100px", objectFit: "cover" }}
            />
            {isEditing ? (
              <input
                type="text"
                name="client.name"
                className="form-control nuvo-input text-center fw-bold mb-2"
                value={eventData.client.name}
                onChange={handleChange}
              />
            ) : (
              <h5 className="fw-bold mb-1">{eventData.client.name}</h5>
            )}
            {isEditing ? (
              <input
                type="email"
                name="client.email"
                className="form-control nuvo-input text-center mb-2"
                value={eventData.client.email}
                onChange={handleChange}
              />
            ) : (
              <p className="text-muted small mb-0">{eventData.client.email}</p>
            )}
            <hr className="my-3" />
            <button
              className="btn btn-light w-100"
              onClick={() => navigate(`/clients/${eventData.clientId}`)}
            >
              View Full Profile
            </button>
          </div>

          {/* STATUS CONTROLS */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <label className="small fw-bold text-muted mb-2">
                Workflow Stage
              </label>
              <select
                className={`form-select fw-bold text-white mb-3 ${progress.color}`}
                name="workflowStage"
                value={eventData.workflowStage}
                onChange={handleChange}
              >
                <option value="created" className="bg-white text-dark">
                  1. Created
                </option>
                <option value="planning" className="bg-white text-dark">
                  2. Planning Started
                </option>
                <option value="staffs_assigned" className="bg-white text-dark">
                  3. Staff Allocated
                </option>
                <option value="event_completed" className="bg-white text-dark">
                  4. Event Completed
                </option>
                <option value="cancelled" className="bg-white text-danger">
                  Cancelled
                </option>
              </select>

              <label className="small fw-bold text-muted mb-2">
                Event Status
              </label>
              <select
                className="form-select mb-3 bg-light"
                name="eventStatus"
                value={eventData.eventStatus}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <Link to="/events/track" className="btn btn-dark w-100">
                <i className="bi bi-geo-alt me-2"></i> Track Live Event
              </Link>
            </div>
          </div>

          {/* TEAM QUICK VIEW */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h6 className="mb-0 fw-bold">Team Allocation</h6>
            </div>
            <div className="card-body d-flex justify-content-around text-center">
              <div>
                <h3 className="fw-bold text-primary mb-0">
                  {isEditing ? (
                    <input
                      type="number"
                      name="team.staffCount"
                      className="form-control form-control-sm text-center w-75 mx-auto"
                      value={eventData.team.staffCount}
                      onChange={handleChange}
                    />
                  ) : (
                    eventData.team.staffCount
                  )}
                </h3>
                <small className="text-muted">Staff</small>
              </div>
              <div>
                <h3 className="fw-bold text-danger mb-0">
                  {isEditing ? (
                    <input
                      type="number"
                      name="team.muaCount"
                      className="form-control form-control-sm text-center w-75 mx-auto"
                      value={eventData.team.muaCount}
                      onChange={handleChange}
                    />
                  ) : (
                    eventData.team.muaCount
                  )}
                </h3>
                <small className="text-muted">MUAs</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
