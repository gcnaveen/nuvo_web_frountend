import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import staffLocations from "../data/maps.json";

// FIX 1: Define the map container style strictly
const containerStyle = {
  width: "100%",
  height: "500px", // You must give it an explicit height
  borderRadius: "12px",
};

const defaultCenter = {
  lat: 12.977439,
  lng: 77.570839,
};

const TrackEvent = () => {
  const [map, setMap] = useState(null);
  const mapContainerRef = useRef(null);

  const handleStaffClick = (staff) => {
    if (!map) return;

    // Only zoom if they have valid coordinates
    if (staff.lat && staff.lng) {
      map.panTo({ lat: staff.lat, lng: staff.lng });
      map.setZoom(16);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && mapContainerRef.current) {
      mapContainerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // FIX 2: Helper function to handle the 3 status states
  const getStaffStatus = (status) => {
    switch (status) {
      case "on_event":
        return {
          label: "🔵 At Event Location",
          badgeClass: "badge bg-info text-dark",
          isOnline: true,
        };
      case "away":
        return {
          label: "🟡 Away (On Duty)",
          badgeClass: "badge bg-warning text-dark",
          isOnline: true,
        };
      case "offline":
      default:
        return {
          label: "⚪ Not on Duty",
          badgeClass: "badge bg-secondary",
          isOnline: false,
        };
    }
  };

  return (
    <>
      {/* WRAPPER 1: Page Heading */}
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 mb-3">
              <Link to="/events/details" className="btn btn-light mb-3">
                <i className="bi bi-arrow-left"></i> Back to Event Details
              </Link>
              <h3 className="fw-bold mb-1">Live Event Tracking</h3>
              <p className="text-muted">
                Real-time staff locations & event execution progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* WRAPPER 2: Page Content */}
      <div className="page-content">
        <section className="row g-4">
          {/* ================= LEFT SECTION – MAP ================= */}
          <div className="col-lg-8 col-12">
            <div className="card h-100" ref={mapContainerRef}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4>Live Location</h4>
                <button
                  className="btn btn-sm btn-dark"
                  onClick={toggleFullscreen}
                >
                  <i className="bi bi-arrows-fullscreen"></i> Fullscreen
                </button>
              </div>

              <div className="card-body p-0">
                {" "}
                {/* p-0 allows map to fill card */}
                <LoadScript
                  googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
                >
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={defaultCenter}
                    zoom={13}
                    onLoad={(mapInstance) => setMap(mapInstance)}
                  >
                    {staffLocations.map((staff) => (
                      <Marker
                        key={staff.id}
                        position={{ lat: staff.lat, lng: staff.lng }}
                        title={staff.name}
                      />
                    ))}
                  </GoogleMap>
                </LoadScript>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SECTION – STAFF LIST ================= */}
          <div className="col-lg-4 col-12 staff-list">
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4>Assigned Staff</h4>
                <span className="badge bg-success">Tracking Active</span>
              </div>

              <div className="card-body">
                {staffLocations.map((staff) => {
                  const statusInfo = getStaffStatus(staff.status);

                  return (
                    <button
                      key={staff.id}
                      className="btn w-100 d-flex align-items-center p-2 mb-2 border hover-shadow"
                      style={{ background: "#fff", transition: "0.2s" }}
                      onClick={() => handleStaffClick(staff)}
                    >
                      <img
                        src={staff.image_url}
                        className="rounded-circle"
                        width="48"
                        height="48"
                        style={{ objectFit: "cover" }}
                        alt={staff.name}
                      />
                      <div className="ms-3 text-start flex-grow-1">
                        <h6 className="mb-0 fw-bold">{staff.name}</h6>
                        <small className="text-muted">{staff.role}</small>
                        <br />
                        <span className={`${statusInfo.badgeClass} mt-1`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <i className="bi bi-crosshair fs-5 text-primary"></i>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h4>Event Summary</h4>
              </div>
              <div className="card-body">
                <p>
                  <strong>Event:</strong> Wedding – Luxury Gold
                </p>
                <p>
                  <strong>Date:</strong> 12 Feb 2025
                </p>
                <p>
                  <strong>Client:</strong> Riya Sharma
                </p>
                <hr />
                <p className="text-success fw-bold mb-0">
                  Live Tracking Enabled
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default TrackEvent;
