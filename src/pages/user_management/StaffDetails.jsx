import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import data from "../../data/staff.json";

const packageConfig = {
  platinum: { label: "Platinum", color: "#8E24AA", textColor: "#FFFFFF" },
  diamond: { label: "Diamond", color: "#1E88E5", textColor: "#FFFFFF" },
  gold: { label: "Gold", color: "#D4AF37", textColor: "#000000" },
  silver: { label: "Silver", color: "#B0BEC5", textColor: "#000000" },
  bronze: { label: "Bronze", color: "#CD7F32", textColor: "#FFFFFF" },
};

const StaffDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    const member = data.find((s) => s.id === id);
    if (member) {
      setStaff(member);
    }
  }, [id]);

  if (!staff)
    return (
      <div className="p-5 text-center">
        <h4>Staff Member Not Found</h4>
      </div>
    );

  // Dynamic style based on current state (updates as you change the dropdown)
  const pkg = packageConfig[staff.package] || {
    color: "#eee",
    textColor: "#000",
    label: staff.package,
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaff({ ...staff, [name]: value });
  };

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStaff({ ...staff, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log("Saving to Backend:", staff);
    setIsEditing(false);
    // Add your API logic here
  };

  return (
    <div className="page-content">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-light" onClick={() => navigate("/staff")}>
          <i className="bi bi-arrow-left"></i> Back to List
        </button>
        <div>
          {!isEditing ? (
            <button
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <i className="bi bi-pencil-square"></i> Edit Profile
            </button>
          ) : (
            <>
              <button className="btn btn-success me-2" onClick={handleSave}>
                <i className="bi bi-check-lg"></i> Save Changes
              </button>
              <button
                className="btn btn-light"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="row">
        {/* LEFT COLUMN: AVATAR & PACKAGE */}
        <div className="col-lg-4">
          <div className="card shadow-sm text-center p-4 position-relative">
            <div
              className={`avatar-wrapper mb-3 mx-auto ${isEditing ? "cursor-pointer" : ""}`}
              onClick={handleAvatarClick}
              style={{ position: "relative", width: "160px" }}
            >
              <img
                src={staff.avatar || "/public/assets/images/avatars/avatar1.png"}
                alt={staff.name}
                className="rounded-circle border border-4"
                style={{
                  width: "150px",
                  height: "150px",
                  objectFit: "cover",
                  borderColor: pkg.color,
                  transition: "all 0.3s ease",
                }}
              />
              {isEditing && (
                <div className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow">
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

            <h4 className="mb-1">{staff.name}</h4>
            <p className="text-muted mb-3">
              @{staff.stage_name || "no_stage_name"}
            </p>

            {/* PACKAGE EDIT SECTION */}
            <div className="mt-2">
              <label className="small fw-bold text-muted d-block mb-1">
                Membership Tier
              </label>
              {isEditing ? (
                <select
                  className="form-select text-center"
                  name="package"
                  value={staff.package}
                  onChange={handleChange}
                  style={{ borderLeft: `5px solid ${pkg.color}` }}
                >
                  {Object.keys(packageConfig).map((key) => (
                    <option key={key} value={key}>
                      {packageConfig[key].label}
                    </option>
                  ))}
                </select>
              ) : (
                <span
                  className="badge"
                  style={{
                    backgroundColor: pkg.color,
                    color: pkg.textColor,
                    padding: "10px 20px",
                    fontSize: "0.9rem",
                  }}
                >
                  {pkg.label}
                </span>
              )}
            </div>

            <hr className="my-4" />
            <div className="text-start">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Staff ID</span>
                <span className="fw-bold">{staff.id}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Status</span>
                <span
                  className={`badge bg-${staff.status === "active" ? "success" : "secondary"}`}
                >
                  {staff.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILS */}
        <div className="col-lg-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">Details</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {[
                  { label: "Full Name", name: "name", type: "text" },
                  { label: "Stage Name", name: "stage_name", type: "text" },
                  { label: "Phone", name: "phone", type: "text" },
                  { label: "Email", name: "email", type: "email" },
                  { label: "City", name: "city", type: "text" },
                  {
                    label: "Experience (Years)",
                    name: "experience",
                    type: "number",
                  },
                  { label: "Uniform Size", name: "uniformSize", type: "text" },
                ].map((field) => (
                  <div className="col-md-6" key={field.name}>
                    <label className="small fw-bold text-muted mb-1">
                      {field.label}
                    </label>
                    {isEditing ? (
                      <input
                        type={field.type}
                        name={field.name}
                        className="form-control"
                        value={staff[field.name] || ""}
                        onChange={handleChange}
                      />
                    ) : (
                      <div className="p-2 bg-light rounded text-dark">
                        {staff[field.name] || "-"}
                      </div>
                    )}
                  </div>
                ))}
                <div className="col-md-6">
                  <label className="small fw-bold text-muted mb-1">
                    Gender
                  </label>
                  {isEditing ? (
                    <select
                      className="form-select"
                      name="gender"
                      value={staff.gender}
                      onChange={handleChange}
                    >
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  ) : (
                    <div className="p-2 bg-light rounded text-dark">
                      {staff.gender}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* GALLERY */}
          <div className="card shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Portfolio Gallery</h5>
              {isEditing && (
                <button className="btn btn-sm btn-primary">Add Image</button>
              )}
            </div>
            <div className="card-body">
              <div className="row g-2">
                {staff.images_list?.map((img, idx) => (
                  <div className="col-md-4 position-relative" key={idx}>
                    <img
                      src={img}
                      className="img-fluid rounded"
                      style={{
                        height: "180px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {isEditing && (
                      <button className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2">
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetails;
