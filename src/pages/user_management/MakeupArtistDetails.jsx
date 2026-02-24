import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import muaData from "../../data/makeup_artists.json";

const MakeupArtistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [mua, setMua] = useState(null);

  useEffect(() => {
    const artist = muaData.find((m) => m.id === id);
    if (artist) {
      setMua(artist);
    }
  }, [id]);

  if (!mua)
    return (
      <div className="p-5 text-center">
        <h4>Artist Not Found</h4>
      </div>
    );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMua({ ...mua, [name]: value });
  };

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMua({ ...mua, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log("Saving MUA Data:", mua);
    setIsEditing(false);
    // Add API logic here
  };

  return (
    <div className="page-content">
      {/* HEADER NAVIGATION */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          className="btn btn-light shadow-sm"
          onClick={() => navigate("/makeup-artitst")}
        >
          <i className="bi bi-arrow-left"></i> Back to Artists
        </button>
        <div>
          {!isEditing ? (
            <button
              className="btn btn-primary px-4"
              onClick={() => setIsEditing(true)}
            >
              <i className="bi bi-pencil-square me-2"></i> Edit Artist
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
        {/* LEFT COLUMN: ARTIST PROFILE CARD */}
        <div className="col-lg-4">
          <div className="card shadow-sm text-center p-4">
            <div
              className={`position-relative d-inline-block mx-auto mb-3 ${isEditing ? "cursor-pointer" : ""}`}
              onClick={handleAvatarClick}
            >
              <img
                src={mua.avatar}
                alt={mua.name}
                className="rounded-circle border border-4 border-white shadow"
                style={{ width: "160px", height: "160px", objectFit: "cover" }}
              />
              {isEditing && (
                <div className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 border border-3 border-white">
                  <i className="bi bi-camera-fill"></i>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="d-none"
                accept="image/*"
              />
            </div>

            <h4 className="fw-bold mb-1">{mua.name}</h4>
            <span className="badge bg-light-primary text-primary mb-3 px-3 py-2">
              {mua.speciality}
            </span>

            <div className="row g-2 mt-2">
              <div className="col-6">
                <div className="p-2 border rounded bg-light">
                  <small className="text-muted d-block text-uppercase">
                    Experience
                  </small>
                  <span className="fw-bold">{mua.experience} Years</span>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 border rounded bg-light">
                  <small className="text-muted d-block text-uppercase">
                    Status
                  </small>
                  <span
                    className={`fw-bold text-capitalize text-${mua.status === "active" ? "success" : "danger"}`}
                  >
                    {mua.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <hr className="my-4" />
            <div className="text-start">
              <label className="small text-muted fw-bold text-uppercase">
                Quick Contacts
              </label>
              <p className="mb-2">
                <i className="bi bi-telephone-fill text-primary me-2"></i>{" "}
                {mua.phone}
              </p>
              <p className="mb-0">
                <i className="bi bi-envelope-fill text-primary me-2"></i>{" "}
                {mua.email}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED INFO & PORTFOLIO */}
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Professional Profile</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                {[
                  { label: "Artist Full Name", name: "name", type: "text" },
                  {
                    label: "Makeup Speciality",
                    name: "speciality",
                    type: "text",
                  },
                  { label: "Phone Number", name: "phone", type: "text" },
                  { label: "Email Address", name: "email", type: "email" },
                  { label: "Base City", name: "city", type: "text" },
                  {
                    label: "Years of Experience",
                    name: "experience",
                    type: "number",
                  },
                ].map((field) => (
                  <div className="col-md-6" key={field.name}>
                    <label className="small fw-bold text-muted mb-1">
                      {field.label}
                    </label>
                    {isEditing ? (
                      <input
                        type={field.type}
                        name={field.name}
                        className="form-control bg-light"
                        value={mua[field.name]}
                        onChange={handleChange}
                      />
                    ) : (
                      <div className="p-2 border-bottom fw-semibold">
                        {mua[field.name]}
                      </div>
                    )}
                  </div>
                ))}

                <div className="col-md-6">
                  <label className="small fw-bold text-muted mb-1">
                    Status
                  </label>
                  {isEditing ? (
                    <select
                      className="form-select bg-light"
                      name="status"
                      value={mua.status}
                      onChange={handleChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on_event">On Event</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  ) : (
                    <div className="p-2 border-bottom fw-semibold text-capitalize">
                      {mua.status.replace("_", " ")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PORTFOLIO SECTION */}
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0 fw-bold">Work Portfolio</h5>
              {isEditing && (
                <button className="btn btn-sm btn-outline-primary">
                  <i className="bi bi-plus-lg"></i> Upload New Work
                </button>
              )}
            </div>
            <div className="card-body">
              <div className="row g-3 text-center">
                {/* Mockup for gallery images if the JSON doesn't have images_list yet */}
                {mua.images_list ? (
                  mua.images_list.map((img, idx) => (
                    <div className="col-md-4 position-relative" key={idx}>
                      <img
                        src={img}
                        className="img-fluid rounded shadow-sm"
                        style={{
                          height: "200px",
                          width: "100%",
                          objectFit: "cover",
                        }}
                        alt="Work"
                      />
                      {isEditing && (
                        <button className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow">
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-12 py-5 bg-light rounded border border-dashed">
                    <i className="bi bi-images fs-1 text-muted"></i>
                    <p className="text-muted mt-2">
                      No portfolio images uploaded yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeupArtistDetails;
