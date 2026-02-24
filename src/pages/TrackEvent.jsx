import React, { useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { GoogleMap, LoadScript, OverlayView } from "@react-google-maps/api";
import staffLocations from "../data/maps.json";

// 1. Map Styles
const mapContainerStyle = {
  width: "100%",
  height: "80vh",
  borderRadius: "12px",
  background: "#e5e5e5",
};

const TrackEvent = () => {
  const [map, setMap] = useState(null);
  const mapContainerRef = useRef(null);

  // 2. Helper for Status Badges
  const getStaffStatus = (status) => {
    switch (status) {
      case "on_event":
        return {
          label: "🔵 At Event Location",
          badgeClass: "badge bg-info text-dark",
        };
      case "away":
        return {
          label: "🟡 Awaty (On Duty)",
          badgeClass: "badge bg-warning text-dark",
        };
      case "offline":
      default:
        return {
          label: "⚪ Logged In — Not on Duty",
          badgeClass: "badge bg-secondary",
        };
    }
  };

  // 3. FIT BOUNDS: Show all staff on initial load
  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);

    // Create a bounding box that includes every staff member
    const bounds = new window.google.maps.LatLngBounds();
    staffLocations.forEach((staff) => {
      bounds.extend({ lat: staff.lat, lng: staff.lng });
    });

    // Apply bounds (zoom out to fit everyone)
    mapInstance.fitBounds(bounds);
  }, []);

  // 4. SMOOTH FLY-TO ANIMATION
  const handleStaffClick = (staff) => {
    if (!map || !staff.lat || !staff.lng) return;

    // Step A: Zoom Out slightly to see the context of movement
    const currentZoom = map.getZoom();
    const targetZoom = 16; // Close up view
    const flightZoom = 13; // Higher up view for traveling

    // If we are zoomed in deep, zoom out first
    if (currentZoom > flightZoom) {
      map.setZoom(flightZoom);
    }

    // Step B: Wait for zoom-out, then Pan (Move) to location
    setTimeout(() => {
      map.panTo({ lat: staff.lat, lng: staff.lng });

      // Step C: After panning finishes (approx 800ms), Zoom In
      setTimeout(() => {
        map.setZoom(targetZoom);
      }, 800);
    }, 400);
  };

  return (
    <>
      <style>
        {`
          .staff-btn {
            border: 1px solid #e7e7e7;
            border-radius: 10px;
            background: #ffffff;
            transition: 0.2s;
            cursor: pointer;
          }
          .staff-btn:hover {
            background: #f4f9ff;
            border-color: #0d6efd;
            transform: scale(1.02);
          }
          .map-container-wrapper {
             border-radius: 12px;
             overflow: hidden; 
          }
          /* --- NEW CUSTOM MARKER STYLES --- */
          .custom-marker {
            position: absolute;
            transform: translate(-50%, -100%); /* Centers pin tip on location */
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
          }
          .marker-bubble {
            background: white;
            padding: 4px;
            border-radius: 50%;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            border: 2px solid white;
            position: relative;
            transition: transform 0.2s;
          }
          .marker-bubble:hover {
            transform: scale(1.1);
            z-index: 999;
          }
          .marker-bubble img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
          }
          /* Triangle arrow at bottom of bubble */
          .marker-bubble::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            border-width: 6px 6px 0;
            border-style: solid;
            border-color: white transparent transparent transparent;
          }
          .marker-label {
            background: rgba(0,0,0,0.7);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 11px;
            margin-top: 4px;
            font-weight: 600;
            white-space: nowrap;
          }
        `}
      </style>

      {/* Page Heading */}
      <div className="page-heading">
        <div className="page-title">
          <div className="row">
            <div className="col-12 col-md-12 order-md-1 order-last">
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

      {/* Page Content */}
      <div className="page-content">
        <section className="row g-4">
          {/* LEFT SECTION – MAP */}
          <div className="col-lg-8 col-12">
            <div className="card h-100" ref={mapContainerRef}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4>Live Location</h4>
              </div>

              <div className="card-body p-0 map-container-wrapper">
                <LoadScript
                  googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
                >
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    // We remove defaultCenter because onLoad handles the bounds
                    zoom={10}
                    onLoad={onLoad}
                    options={{ disableDefaultUI: false, zoomControl: true }}
                  >
                    {/* CUSTOM MARKERS USING OVERLAY VIEW */}
                    {staffLocations.map((staff) => (
                      <OverlayView
                        key={staff.id}
                        position={{ lat: staff.lat, lng: staff.lng }}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                      >
                        <div
                          className="custom-marker"
                          onClick={() => handleStaffClick(staff)}
                        >
                          <div
                            className={`marker-bubble ${
                              staff.status === "on_event"
                                ? "border-primary"
                                : ""
                            }`}
                          >
                            <img src={staff.image_url} alt={staff.name} />
                          </div>
                          <div className="marker-label">{staff.name}</div>
                        </div>
                      </OverlayView>
                    ))}
                  </GoogleMap>
                </LoadScript>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION – STAFF LIST */}
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
                      className="staff-btn w-100 d-flex align-items-center p-2 mb-2"
                      onClick={() => handleStaffClick(staff)}
                    >
                      <img
                        src={staff.image_url}
                        className="rounded-circle"
                        width="48"
                        height="48"
                        style={{ objectFit: "cover" }}
                        alt="face"
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
