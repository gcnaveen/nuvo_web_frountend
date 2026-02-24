import React, { useState, useMemo } from "react";
import events_data from "../data/events.json";
import { Link } from "react-router-dom";

// Calendar Imports
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Navigation Imports
import addMonths from "date-fns/addMonths";
import subMonths from "date-fns/subMonths";
import isSameDay from "date-fns/isSameDay";

// Setup Calendar Localizer
const locales = {
  "en-US": import("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Events() {
  // --- STATE ---
  const [viewMode, setViewMode] = useState("calendar");
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State (For Table View)
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Modal State (Calendar Day Click)
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalEvents, setModalEvents] = useState([]);

  // --- DATA EXTRACTION & FILTERING ---
  const uniqueCities = [...new Set(events_data.map((e) => e.city))];
  const uniqueStatuses = [...new Set(events_data.map((e) => e.workflowStage))];

  const filteredEvents = useMemo(() => {
    return events_data.filter((event) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        event.client.name.toLowerCase().includes(searchLower) ||
        event.eventTitle.toLowerCase().includes(searchLower);

      const matchesCity = cityFilter ? event.city === cityFilter : true;
      const matchesStatus = statusFilter
        ? event.workflowStage === statusFilter
        : true;

      // Date Range Logic
      const eventDate = new Date(event.start).toISOString().split("T")[0];
      let matchesDate = true;
      if (startDate && endDate) {
        matchesDate = eventDate >= startDate && eventDate <= endDate;
      } else if (startDate) {
        matchesDate = eventDate >= startDate;
      }

      return matchesSearch && matchesCity && matchesStatus && matchesDate;
    });
  }, [searchTerm, cityFilter, statusFilter, startDate, endDate]);

  // --- PAGINATION (Table View Only) ---
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredEvents.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredEvents.length / rowsPerPage);

  // --- CALENDAR DATA (Uses Filtered Data) ---
  const calendarEvents = filteredEvents.map((event) => ({
    title: event.eventTitle,
    start: new Date(event.start),
    end: new Date(event.end),
    allDay: event.allDay || false,
    resource: event,
  }));

  // --- HANDLERS ---
  const onNavigate = (action) => {
    let newDate = new Date(date);
    switch (action) {
      case "TODAY":
        newDate = new Date();
        break;
      case "PREV":
        newDate = subMonths(date, 1);
        break;
      case "NEXT":
        newDate = addMonths(date, 1);
        break;
      default:
        break;
    }
    setDate(newDate);
  };

  const handleSelectSlotOrEvent = (slotInfo) => {
    const clickedDate = slotInfo.start;
    // Filter against the already filtered list so the modal respects current filters
    const eventsOnDay = filteredEvents.filter((e) =>
      isSameDay(new Date(e.start), clickedDate),
    );
    setSelectedDate(clickedDate);
    setModalEvents(eventsOnDay);
    setShowModal(true);
  };

  // Helper for badging in Table & Calendar
  const getBadgeColor = (stage) => {
    const map = {
      created: "primary",
      planning: "info",
      staffs_assigned: "warning",
      event_completed: "success",
      cancelled: "danger",
    };
    return map[stage] || "secondary";
  };

  // Helper for translating map colors to valid hex codes
  const getHexColor = (stage) => {
    const map = {
      created: "#435ebe",
      planning: "#0dcaf0",
      staffs_assigned: "#ffc107",
      event_completed: "#198754",
      cancelled: "#dc3545",
    };
    return map[stage] || "#6c757d";
  };

  // --- RENDER ---
  return (
    <>
      <style>
        {`
          .nuvo-input { background-color: #f8f9fa !important; border: 1px solid #f8f9fa !important; }
          .nuvo-input:focus { border-color: #8E24AA !important; box-shadow: 0 0 0 0.25rem rgba(142, 36, 170, 0.1) !important; background-color: #fff !important; }
          .section-title { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; color: #888; display: flex; align-items: center; margin-bottom: 15px; }
          .section-title::after { content: ""; flex: 1; height: 1px; background: #eee; margin-left: 10px; }
          .rbc-calendar { font-family: inherit; }
        `}
      </style>

      <div className="page-heading">
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div>
            <h3>Event Management</h3>
            <p className="text-muted mb-0">
              Manage bookings, schedules, and team allocations.
            </p>
          </div>

          <div className="d-flex gap-2 align-items-center">
            {/* View Mode Toggle Buttons */}
            <div className="btn-group me-2">
              <button
                className={`btn ${viewMode === "table" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setViewMode("table")}
                title="Table View"
              >
                <i className="bi bi-table"></i>
              </button>
              <button
                className={`btn ${viewMode === "calendar" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setViewMode("calendar")}
                title="Calendar View"
              >
                <i className="bi bi-calendar3"></i>
              </button>
            </div>

            <button className="btn btn-outline-success">
              <i className="bi bi-file-earmark-excel"></i> Export
            </button>
            <button
              className="btn btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#addEventModal"
            >
              <i className="bi bi-calendar-plus"></i> Add Event
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* ================= FILTERS ================= */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="small fw-bold">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Client or Event Title..."
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
                <label className="small fw-bold">Workflow Stage</label>
                <select
                  className="form-select text-capitalize"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Stages</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
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

        <section className="section">
          {viewMode === "table" ? (
            // ================= TABLE VIEW =================
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Booking ID</th>
                        <th>Client</th>
                        <th>Event Title</th>
                        <th>Date & Time</th>
                        <th>Location</th>
                        <th>Workflow Stage</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRows.map((event) => (
                        <tr key={event.bookingId}>
                          <td className="fw-bold">{event.bookingId}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={event.client.avatar}
                                alt=""
                                className="rounded-circle me-2"
                                width="35"
                                height="35"
                                style={{ objectFit: "cover" }}
                              />
                              <div>
                                <div className="fw-bold text-dark">
                                  {event.client.name}
                                </div>
                                <small className="text-muted">
                                  {event.eventType}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>{event.eventTitle}</td>
                          <td>
                            <div>
                              {format(new Date(event.start), "d MMM yyyy")}
                            </div>
                            <small className="text-muted">
                              {format(new Date(event.start), "h:mm a")}
                            </small>
                          </td>
                          <td>
                            <div
                              className="text-truncate"
                              style={{ maxWidth: "200px" }}
                              title={event.location.venueName}
                            >
                              {event.location.venueName}
                            </div>
                            <small className="text-muted">{event.city}</small>
                          </td>
                          <td>
                            <span
                              className={`badge bg-${getBadgeColor(event.workflowStage)} text-uppercase`}
                            >
                              {event.workflowStage.replace("_", " ")}
                            </span>
                          </td>
                          <td className="text-end">
                            {/* Make sure your App.jsx has a route for /events/:id or change this to /events/details */}
                            <Link
                              to={`/events/details`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              <i className="bi bi-eye"></i> View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <nav className="d-flex justify-content-between align-items-center mt-3">
                  <small className="text-muted">
                    Showing {indexOfFirstRow + 1} to{" "}
                    {Math.min(indexOfLastRow, filteredEvents.length)} of{" "}
                    {filteredEvents.length}
                  </small>
                  <ul className="pagination pagination-primary mb-0">
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                      >
                        Prev
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
                      className={`page-item ${currentPage === totalPages || totalPages === 0 ? "disabled" : ""}`}
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
          ) : (
            // ================= CALENDAR VIEW =================
            <div className="card shadow-sm">
              <div className="card-body">
                {/* Custom Calendar Navigation */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0 fw-bold">{format(date, "MMMM yyyy")}</h4>
                  <div className="btn-group">
                    <button
                      className="btn btn-light border"
                      onClick={() => onNavigate("PREV")}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <button
                      className="btn btn-light border fw-bold"
                      onClick={() => onNavigate("TODAY")}
                    >
                      Today
                    </button>
                    <button
                      className="btn btn-light border"
                      onClick={() => onNavigate("NEXT")}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </div>

                <div style={{ height: "650px" }}>
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "100%" }}
                    date={date}
                    onNavigate={setDate}
                    view={view}
                    onView={setView}
                    toolbar={false}
                    popup={true}
                    selectable={true}
                    onSelectEvent={handleSelectSlotOrEvent}
                    onSelectSlot={handleSelectSlotOrEvent}
                    eventPropGetter={(event) => {
                      const bgColor = getHexColor(event.resource.workflowStage);
                      return {
                        style: {
                          backgroundColor: bgColor,
                          border: "none",
                          color:
                            bgColor === "#ffc107" || bgColor === "#0dcaf0"
                              ? "#000"
                              : "#fff",
                        },
                      };
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= CALENDAR DAY/EVENT MODAL ================= */}
          {showModal && (
            <div
              className="modal fade show d-block"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              tabIndex="-1"
            >
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content shadow-lg border-0 rounded-4">
                  <div className="modal-header bg-light border-bottom-0">
                    <h5 className="modal-title fw-bold">
                      Events on{" "}
                      {selectedDate && format(selectedDate, "d MMMM yyyy")}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowModal(false)}
                    ></button>
                  </div>

                  <div className="modal-body p-0">
                    {modalEvents.length > 0 ? (
                      <div className="list-group list-group-flush">
                        {modalEvents.map((event) => (
                          <div
                            key={event.bookingId}
                            className="list-group-item p-4 border-bottom"
                          >
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                              <div className="d-flex align-items-center gap-3">
                                <div
                                  className="text-center bg-light rounded p-2"
                                  style={{ minWidth: "90px" }}
                                >
                                  <div className="fw-bold text-dark">
                                    {event.allDay
                                      ? "All Day"
                                      : format(new Date(event.start), "h:mm a")}
                                  </div>
                                  {!event.allDay && (
                                    <div className="small text-muted">
                                      {format(new Date(event.end), "h:mm a")}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h6 className="mb-1 fw-bold">
                                    {event.eventTitle}{" "}
                                    <span className="text-muted fw-normal ms-2">
                                      #{event.bookingId}
                                    </span>
                                  </h6>
                                  <p className="mb-0 text-muted small">
                                    <i className="bi bi-person-circle me-1"></i>{" "}
                                    {event.client.name} &nbsp;|&nbsp;
                                    <i className="bi bi-geo-alt-fill ms-1 me-1"></i>{" "}
                                    {event.location.venueName}
                                  </p>
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-3">
                                <span
                                  className={`badge bg-${getBadgeColor(event.workflowStage)} px-3 py-2 rounded-pill text-uppercase`}
                                >
                                  {event.workflowStage.replace("_", " ")}
                                </span>
                                <Link
                                  to={`/events/details`}
                                  className="btn btn-outline-primary btn-sm px-3"
                                  onClick={() => setShowModal(false)}
                                >
                                  Details{" "}
                                  <i className="bi bi-arrow-right ms-1"></i>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <i
                          className="bi bi-calendar-x text-muted"
                          style={{ fontSize: "3rem" }}
                        ></i>
                        <h6 className="text-muted mt-3">
                          No events scheduled for this day.
                        </h6>
                        <button
                          className="btn btn-primary mt-3"
                          data-bs-toggle="modal"
                          data-bs-target="#addEventModal"
                          onClick={() => setShowModal(false)}
                        >
                          <i className="bi bi-plus me-1"></i> Add Event on this
                          Date
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= ADD EVENT MODAL ================= */}
          <div
            className="modal fade modal-nuvo"
            id="addEventModal"
            tabIndex="-1"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div
                className="modal-content shadow-lg"
                style={{ borderRadius: "15px" }}
              >
                <div className="modal-header border-0 p-4 pb-0">
                  <div className="d-flex align-items-center">
                    <div className="bg-light rounded-circle p-2 me-3">
                      <i className="bi bi-calendar-event text-primary fs-4"></i>
                    </div>
                    <div>
                      <h5 className="modal-title mb-0 fw-bold">
                        Create New Event Booking
                      </h5>
                      <small className="text-muted">
                        Fill out the details to schedule a new event.
                      </small>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                  ></button>
                </div>

                <div className="modal-body p-4">
                  <form className="row g-4">
                    {/* Section 1: Client & Basic Info */}
                    <div className="col-12 col-lg-4 border-end pe-lg-4">
                      <div className="section-title fw-bold">
                        1. Client & Event Info
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">
                          Select Client
                        </label>
                        <select className="form-select nuvo-input">
                          <option value="">Choose an existing client...</option>
                          <option>Riya Sharma</option>
                          <option>John Mathew</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">
                          Event Title
                        </label>
                        <input
                          type="text"
                          className="form-control nuvo-input"
                          placeholder="e.g. Sharma Wedding"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">
                          Event Type
                        </label>
                        <select className="form-select nuvo-input">
                          <option>Wedding</option>
                          <option>Corporate</option>
                          <option>Birthday</option>
                          <option>Fashion Event</option>
                        </select>
                      </div>
                    </div>

                    {/* Section 2: Location & Schedule */}
                    <div className="col-12 col-lg-4 border-end pe-lg-4">
                      <div className="section-title fw-bold">
                        2. Location & Time
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">
                          Venue Name
                        </label>
                        <input
                          type="text"
                          className="form-control nuvo-input"
                          placeholder="e.g. Royal Orchid Palace"
                        />
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label small fw-bold">
                            City
                          </label>
                          <input
                            type="text"
                            className="form-control nuvo-input"
                            placeholder="Bangalore"
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-bold">
                            State
                          </label>
                          <input
                            type="text"
                            className="form-control nuvo-input"
                            placeholder="Karnataka"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">
                          Event Date
                        </label>
                        <input
                          type="date"
                          className="form-control nuvo-input"
                          defaultValue={
                            selectedDate
                              ? format(selectedDate, "yyyy-MM-dd")
                              : ""
                          }
                        />
                      </div>
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label small fw-bold">
                            Start Time
                          </label>
                          <input
                            type="time"
                            className="form-control nuvo-input"
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-bold">
                            End Time
                          </label>
                          <input
                            type="time"
                            className="form-control nuvo-input"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Financials & Workflow */}
                    <div className="col-12 col-lg-4">
                      <div className="section-title fw-bold">
                        3. Logistics & Billing
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">
                          Workflow Stage
                        </label>
                        <select className="form-select nuvo-input">
                          <option value="created">Created</option>
                          <option value="planning">Planning Started</option>
                          <option value="staffs_assigned">
                            Staffs Assigned
                          </option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold">
                          Total Amount (₹)
                        </label>
                        <input
                          type="number"
                          className="form-control nuvo-input"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label className="form-label small fw-bold">
                            Payment Status
                          </label>
                          <select className="form-select nuvo-input">
                            <option value="unpaid">Unpaid</option>
                            <option value="partial">Partial / Advance</option>
                            <option value="paid">Paid Full</option>
                          </select>
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-bold">
                            Amount Paid
                          </label>
                          <input
                            type="number"
                            className="form-control nuvo-input"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label small fw-bold">
                            Staff Needed
                          </label>
                          <input
                            type="number"
                            className="form-control nuvo-input"
                            placeholder="e.g. 5"
                            defaultValue="0"
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-bold">
                            MUAs Needed
                          </label>
                          <input
                            type="number"
                            className="form-control nuvo-input"
                            placeholder="e.g. 2"
                            defaultValue="0"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="modal-footer border-0 p-4 pt-0 bg-white rounded-bottom-4">
                  <button
                    type="button"
                    className="btn btn-light px-4"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="button" className="btn btn-dark px-5">
                    Save Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
