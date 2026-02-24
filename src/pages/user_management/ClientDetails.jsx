import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import clientsData from "../../data/clients.json";

const packageConfig = {
  platinum: { label: "Platinum", color: "#8E24AA", textColor: "#FFFFFF" },
  diamond: { label: "Diamond", color: "#1E88E5", textColor: "#FFFFFF" },
  gold: { label: "Gold", color: "#D4AF37", textColor: "#000000" },
  silver: { label: "Silver", color: "#B0BEC5", textColor: "#000000" },
  bronze: { label: "Bronze", color: "#CD7F32", textColor: "#FFFFFF" },
  none: { label: "No Plan", color: "#eeeeee", textColor: "#333333" },
};

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [client, setClient] = useState(null);

  useEffect(() => {
    const foundClient = clientsData.find((c) => c.id === id);
    if (foundClient) {
      setClient(foundClient);
    }
  }, [id]);

  if (!client)
    return (
      <div className="p-5 text-center">
        <h4>Client Not Found</h4>
      </div>
    );

  const currentPlan =
    packageConfig[client.subscription.plan] || packageConfig.none;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("subscription.")) {
      const subField = name.split(".")[1];
      setClient({
        ...client,
        subscription: { ...client.subscription, [subField]: value },
      });
    } else {
      setClient({ ...client, [name]: value });
    }
  };

  const handleSave = () => {
    console.log("Saving Client Data:", client);
    setIsEditing(false);
  };

  return (
    <div className="page-content">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          className="btn btn-light shadow-sm"
          onClick={() => navigate("/clients")}
        >
          <i className="bi bi-arrow-left"></i> Back to Clients
        </button>
        <div>
          {!isEditing ? (
            <button
              className="btn btn-primary px-4"
              onClick={() => setIsEditing(true)}
            >
              <i className="bi bi-pencil-square me-2"></i> Edit Client
            </button>
          ) : (
            <>
              <button
                className="btn btn-success me-2 px-4"
                onClick={handleSave}
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

      <div className="row">
        {/* LEFT: CLIENT CARD & SUBSCRIPTION SUMMARY */}
        <div className="col-lg-4">
          <div className="card shadow-sm text-center p-4 mb-4">
            <img
              src={client.avatar}
              className="rounded-circle mx-auto mb-3 border border-4 shadow-sm"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderColor: currentPlan.color,
              }}
              alt={client.name}
            />
            <h4 className="fw-bold mb-1">{client.name}</h4>
            <p className="text-muted small mb-3">
              {client.id} | Joined {client.registeredOn}
            </p>

            <div
              className="p-3 rounded-3 mb-3"
              style={{
                backgroundColor: currentPlan.color + "15",
                border: `1px solid ${currentPlan.color}40`,
              }}
            >
              <small
                className="text-uppercase fw-bold d-block mb-1"
                style={{ color: currentPlan.color }}
              >
                Current Plan
              </small>
              <h5 className="mb-0 fw-bold" style={{ color: currentPlan.color }}>
                {currentPlan.label}
              </h5>
            </div>

            <div className="text-start mt-4">
              <label className="small text-muted fw-bold text-uppercase">
                Subscription Status
              </label>
              <div className="d-flex justify-content-between align-items-center mt-1">
                <span
                  className={`badge bg-light-${client.subscription.status === "active" ? "success" : "danger"} text-${client.subscription.status === "active" ? "success" : "danger"} px-3`}
                >
                  {client.subscription.status.toUpperCase()}
                </span>
                <small className="text-muted">
                  Total Bookings: <strong>{client.totalBookings}</strong>
                </small>
              </div>
            </div>
          </div>

          <div className="card shadow-sm p-4">
            <h6 className="fw-bold border-bottom pb-2 mb-3">
              Allowed Packages
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {client.subscription.allowedPackages.length > 0 ? (
                client.subscription.allowedPackages.map((pkg) => (
                  <span
                    key={pkg}
                    className="badge rounded-pill border text-dark text-capitalize px-3 py-2 bg-light"
                  >
                    <i className="bi bi-check-circle-fill text-success me-1"></i>{" "}
                    {pkg}
                  </span>
                ))
              ) : (
                <span className="text-muted small italic">
                  No packages allowed for this account.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: DETAILED FORM */}
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">General Information</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="small fw-bold text-muted mb-1">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      name="name"
                      className="form-control bg-light"
                      value={client.name}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="p-2 border-bottom fw-semibold">
                      {client.name}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold text-muted mb-1">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      name="email"
                      className="form-control bg-light"
                      value={client.email}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="p-2 border-bottom fw-semibold">
                      {client.email}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold text-muted mb-1">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      name="phone"
                      className="form-control bg-light"
                      value={client.phone}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="p-2 border-bottom fw-semibold">
                      {client.phone}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold text-muted mb-1">City</label>
                  {isEditing ? (
                    <input
                      name="city"
                      className="form-control bg-light"
                      value={client.city}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="p-2 border-bottom fw-semibold">
                      {client.city}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Subscription Settings</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="small fw-bold text-muted mb-1">
                    Plan Tier
                  </label>
                  {isEditing ? (
                    <select
                      name="subscription.plan"
                      className="form-select bg-light"
                      value={client.subscription.plan}
                      onChange={handleChange}
                    >
                      <option value="none">None</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                      <option value="diamond">Diamond</option>
                    </select>
                  ) : (
                    <div className="p-2 border-bottom fw-semibold text-capitalize">
                      {client.subscription.plan}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold text-muted mb-1">
                    Plan Status
                  </label>
                  {isEditing ? (
                    <select
                      name="subscription.status"
                      className="form-select bg-light"
                      value={client.subscription.status}
                      onChange={handleChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  ) : (
                    <div className="p-2 border-bottom fw-semibold text-capitalize">
                      {client.subscription.status}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold text-muted mb-1">
                    Start Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="subscription.startDate"
                      className="form-control bg-light"
                      value={client.subscription.startDate || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="p-2 border-bottom fw-semibold">
                      {client.subscription.startDate || "N/A"}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="small fw-bold text-muted mb-1">
                    Renewal Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="subscription.endDate"
                      className="form-control bg-light"
                      value={client.subscription.endDate || ""}
                      onChange={handleChange}
                    />
                  ) : (
                    <div className="p-2 border-bottom fw-semibold">
                      {client.subscription.endDate || "N/A"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
