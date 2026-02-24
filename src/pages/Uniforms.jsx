import React, { useState, useMemo } from "react";

// --- DUMMY INVENTORY DATA ---
// Notice how it aggregates sizes and handles "Free Size" (OS - One Size)
const dummyInventory = [
  {
    id: "INV-001",
    name: "Classic Black Tuxedo",
    category: "Formal Uniforms",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=200&auto=format&fit=crop",
    hasSizes: true,
    stock: {
      S: { total: 10, inUse: 8 },
      M: { total: 25, inUse: 10 },
      L: { total: 15, inUse: 12 },
      XL: { total: 5, inUse: 1 },
    },
  },
  {
    id: "INV-002",
    name: "Royal Red Saree",
    category: "Royal / Traditional",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d61dc0?q=80&w=200&auto=format&fit=crop",
    hasSizes: false,
    stock: {
      OS: { total: 40, inUse: 38 }, // OS = One Size / Free Size
    },
  },
  {
    id: "INV-003",
    name: "White Banquet Shirt",
    category: "Formal Uniforms",
    image:
      "https://images.unsplash.com/photo-1620012253295-c1590e0483ea?q=80&w=200&auto=format&fit=crop",
    hasSizes: true,
    stock: {
      S: { total: 20, inUse: 5 },
      M: { total: 40, inUse: 30 },
      L: { total: 30, inUse: 25 },
      XL: { total: 10, inUse: 2 },
    },
  },
  {
    id: "INV-004",
    name: "Casino Dealer Vest",
    category: "Themed Uniforms",
    image:
      "https://images.unsplash.com/photo-1559582798-9d51d1026402?q=80&w=200&auto=format&fit=crop",
    hasSizes: true,
    stock: {
      S: { total: 5, inUse: 0 },
      M: { total: 10, inUse: 2 },
      L: { total: 10, inUse: 0 },
      XL: { total: 2, inUse: 0 },
    },
  },
];

export default function Uniforms() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [inventory, setInventory] = useState(dummyInventory);

  // Modal State
  const [selectedItem, setSelectedItem] = useState(null);
  const [editStock, setEditStock] = useState({});

  // Helper: Extract unique categories
  const categories = [...new Set(inventory.map((item) => item.category))];

  // Helper: Calculate aggregates for a single item
  const calculateTotals = (stockObj) => {
    let total = 0;
    let inUse = 0;
    Object.values(stockObj).forEach((size) => {
      total += size.total;
      inUse += size.inUse;
    });
    return { total, inUse, available: total - inUse };
  };

  // Filter Logic
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter
        ? item.category === categoryFilter
        : true;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, categoryFilter, inventory]);

  // Open Manage Stock Modal
  const handleOpenManage = (item) => {
    setSelectedItem(item);
    // Create a copy of the stock for editing so we don't mutate state directly yet
    setEditStock(JSON.parse(JSON.stringify(item.stock)));
  };

  // Save Stock Updates
  const handleSaveStock = () => {
    const updatedInventory = inventory.map((item) => {
      if (item.id === selectedItem.id) {
        return { ...item, stock: editStock };
      }
      return item;
    });
    setInventory(updatedInventory);
    // Reset and close
    setSelectedItem(null);
    console.log("Stock Updated:", updatedInventory);
  };

  return (
    <>
      <style>
        {`
          .nuvo-input { background-color: #f8f9fa !important; border: 1px solid #f8f9fa !important; }
          .nuvo-input:focus { border-color: #8E24AA !important; box-shadow: 0 0 0 0.25rem rgba(142, 36, 170, 0.1) !important; background-color: #fff !important; }
          .size-badge { min-width: 35px; text-align: center; display: inline-block; }
        `}
      </style>

      {/* PAGE HEADER */}
      <div className="page-heading d-flex justify-content-between align-items-center flex-wrap">
        <div>
          <h3>Inventory Management</h3>
          <p className="text-muted mb-0">
            Track and manage uniform stock, sizes, and availability.
          </p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button className="btn btn-outline-success">
            <i className="bi bi-file-earmark-excel"></i> Export Report
          </button>
          <button className="btn btn-primary">
            <i className="bi bi-plus-lg"></i> Add New Uniform
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* FILTERS */}
        <div className="card shadow-sm mb-4">
          <div className="card-body row g-3">
            <div className="col-md-4">
              <label className="small fw-bold text-muted">
                Search Inventory
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control nuvo-input border-start-0 ps-0"
                  placeholder="Uniform name..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="small fw-bold text-muted">Category</label>
              <select
                className="form-select nuvo-input"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* INVENTORY TABLE */}
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Item Details</th>
                    <th>Category</th>
                    <th>Size Breakdown</th>
                    <th className="text-center">Total Stock</th>
                    <th className="text-center">Available</th>
                    <th className="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const stats = calculateTotals(item.stock);
                    const stockRatio = stats.available / stats.total;
                    let stockStatus = "success";
                    if (stockRatio < 0.2)
                      stockStatus = "danger"; // Less than 20% available
                    else if (stockRatio < 0.5) stockStatus = "warning"; // Less than 50% available

                    return (
                      <tr key={item.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="rounded me-3 border"
                              width="50"
                              height="50"
                              style={{ objectFit: "cover" }}
                            />
                            <div>
                              <div className="fw-bold">{item.name}</div>
                              <small className="text-muted">{item.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border">
                            {item.category}
                          </span>
                        </td>

                        {/* SIZE BREAKDOWN COLUMN */}
                        <td>
                          {item.hasSizes ? (
                            <div className="d-flex flex-wrap gap-1">
                              {Object.entries(item.stock).map(
                                ([size, data]) => (
                                  <span
                                    key={size}
                                    className="badge bg-light text-dark border size-badge"
                                    title={`Available: ${data.total - data.inUse}`}
                                  >
                                    <strong>{size}</strong>:{" "}
                                    {data.total - data.inUse}
                                  </span>
                                ),
                              )}
                            </div>
                          ) : (
                            <span className="badge bg-secondary text-white">
                              Free Size (OS)
                            </span>
                          )}
                        </td>

                        <td className="text-center fw-bold">{stats.total}</td>
                        <td className="text-center">
                          <span
                            className={`badge bg-light-${stockStatus} text-${stockStatus} fs-6 px-3 py-2`}
                          >
                            {stats.available}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            data-bs-toggle="modal"
                            data-bs-target="#manageStockModal"
                            onClick={() => handleOpenManage(item)}
                          >
                            <i className="bi bi-box-seam me-1"></i> Manage Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredInventory.length === 0 && (
                <div className="text-center py-5 text-muted">
                  No inventory items found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MANAGE STOCK MODAL ================= */}
      <div
        className="modal fade modal-nuvo"
        id="manageStockModal"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div
            className="modal-content shadow-lg border-0"
            style={{ borderRadius: "15px" }}
          >
            <div className="modal-header border-0 p-4 pb-0">
              <div>
                <h5 className="modal-title fw-bold mb-1">Update Inventory</h5>
                <p className="text-muted small mb-0">
                  {selectedItem?.name} ({selectedItem?.id})
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body p-4">
              <div className="alert alert-light border d-flex align-items-center mb-4">
                <i className="bi bi-info-circle-fill text-primary fs-4 me-3"></i>
                <small className="text-muted">
                  Update the <strong>Total Owned</strong> quantities when you
                  purchase new stock or retire damaged items. The "In Use" count
                  is automatically managed by active events.
                </small>
              </div>

              {selectedItem && (
                <div className="table-responsive border rounded">
                  <table className="table table-borderless mb-0 align-middle">
                    <thead className="bg-light text-muted small">
                      <tr>
                        <th className="ps-3">Size</th>
                        <th className="text-center">Currently In Use</th>
                        <th className="text-center" style={{ width: "140px" }}>
                          Total Owned
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(editStock).map(([size, data]) => (
                        <tr key={size} className="border-top">
                          <td className="ps-3 fw-bold">
                            {size === "OS" ? "Free Size" : `Size ${size}`}
                          </td>
                          <td className="text-center text-muted">
                            <span className="badge bg-secondary">
                              {data.inUse}
                            </span>
                          </td>
                          <td className="text-center pe-3">
                            <input
                              type="number"
                              className="form-control form-control-sm text-center fw-bold"
                              value={data.total}
                              min={data.inUse} // Cannot have less total than currently assigned
                              onChange={(e) =>
                                setEditStock({
                                  ...editStock,
                                  [size]: {
                                    ...data,
                                    total: parseInt(e.target.value) || 0,
                                  },
                                })
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer border-0 p-4 pt-0">
              <button className="btn btn-light px-4" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                className="btn btn-dark px-4"
                data-bs-dismiss="modal"
                onClick={handleSaveStock}
              >
                Save Inventory
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
