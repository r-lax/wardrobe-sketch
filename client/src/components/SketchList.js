// client/src/components/SketchList.js
import React, { useEffect, useState, useCallback } from "react";

export default function SketchList({ lastSaved }) {
  const [sketches, setSketches] = useState([]);
  const [filters, setFilters] = useState({
    category_id: "",
    color_id: "",
    style_id: "",
  });

  // Values that appear in sketches (dynamic, for filtering)
  const [dynamicFilters, setDynamicFilters] = useState({
    categories: [],
    colors: [],
    styles: [],
  });

  // Full lookup lists (for editing dropdowns)
  const [lookups, setLookups] = useState({
    categories: [],
    colors: [],
    styles: [],
  });

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    category_id: "",
    color_id: "",
    style_id: "",
  });

  /* --------------------------------------------------------
     LOAD LOOKUPS (for edit dropdowns)
  -------------------------------------------------------- */
  const fetchLookups = useCallback(async () => {
    try {
      const res = await fetch("https://wardrobe-sketch.onrender.com/api/lookups");
      const data = await res.json();
      setLookups(data); // full Category/Color/Style objects
    } catch (err) {
      console.error("❌ Failed to load lookups:", err);
    }
  }, []);

  /* --------------------------------------------------------
     LOAD SKETCHES + BUILD DYNAMIC FILTER VALUES
  -------------------------------------------------------- */
  const fetchSketches = useCallback(async () => {
    try {
      const params = new URLSearchParams(filters);
      const res = await fetch(
        `https://wardrobe-sketch.onrender.com/api/sketches?${params.toString()}`
      );
      const data = await res.json();
      const arrayData = Array.isArray(data) ? data : [];
      setSketches(arrayData);

      // 🔥 Extract dynamic filter options based on sketches only
      const categories = [
        ...new Set(arrayData.map((s) => s.category_id?.name).filter(Boolean)),
      ];
      const colors = [
        ...new Set(arrayData.map((s) => s.color_id?.name).filter(Boolean)),
      ];
      const styles = [
        ...new Set(arrayData.map((s) => s.style_id?.name).filter(Boolean)),
      ];

      setDynamicFilters({ categories, colors, styles });
    } catch (err) {
      console.error("Failed to load sketches:", err);
      setSketches([]);
    }
  }, [filters]);

  /* --------------------------------------------------------
     INITIAL LOAD
  -------------------------------------------------------- */
  useEffect(() => {
    fetchLookups();
    fetchSketches();
  }, [fetchLookups, fetchSketches]);

  // Refresh after save
  useEffect(() => {
    if (lastSaved) fetchSketches();
  }, [lastSaved, fetchSketches]);

  /* --------------------------------------------------------
     DELETE SKETCH
  -------------------------------------------------------- */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sketch?")) return;
    try {
      await fetch(`https://wardrobe-sketch.onrender.com/api/sketches/${id}`, {
        method: "DELETE",
      });
      setSketches((prev) => prev.filter((s) => s._id !== id));
      fetchSketches(); // refresh filters dynamically
    } catch (err) {
      console.error("Failed to delete sketch:", err);
    }
  };

  /* --------------------------------------------------------
     EDIT SKETCH
  -------------------------------------------------------- */
  const startEdit = (sketch) => {
    setEditingId(sketch._id);
    setEditData({
      title: sketch.title,
      category_id: sketch.category_id?._id || "",
      color_id: sketch.color_id?._id || "",
      style_id: sketch.style_id?._id || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ title: "", category_id: "", color_id: "", style_id: "" });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`https://wardrobe-sketch.onrender.com/api/sketches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const updated = await res.json();

      setSketches((prev) => prev.map((s) => (s._id === id ? updated : s)));
      cancelEdit();
      fetchSketches(); // refresh dynamic filter values
    } catch (err) {
      console.error("Failed to update sketch:", err);
    }
  };

  /* --------------------------------------------------------
     FILTER HANDLERS
  -------------------------------------------------------- */
  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchSketches();
  };

  const handleResetFilters = () => {
    setFilters({ category_id: "", color_id: "", style_id: "" });
    fetchSketches();
  };

  /* --------------------------------------------------------
     RENDER
  -------------------------------------------------------- */
  return (
    <div style={{ marginTop: 40, padding: "0 40px" }}>
      <h2 style={{ marginBottom: 20 }}>🖼️ Saved Sketches</h2>

      {/* ---------------- FILTERS ---------------- */}
      <form
        onSubmit={handleFilterSubmit}
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        {/* Category filter */}
        <select
          name="category_id"
          value={filters.category_id}
          onChange={handleFilterChange}
          style={filterInputStyle}
        >
          <option value="">All Categories</option>
          {dynamicFilters.categories.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {/* Color filter */}
        <select
          name="color_id"
          value={filters.color_id}
          onChange={handleFilterChange}
          style={filterInputStyle}
        >
          <option value="">All Colors</option>
          {dynamicFilters.colors.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {/* Style filter */}
        <select
          name="style_id"
          value={filters.style_id}
          onChange={handleFilterChange}
          style={filterInputStyle}
        >
          <option value="">All Styles</option>
          {dynamicFilters.styles.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <button type="submit" style={filterButtonStyle}>
          Apply Filters
        </button>
        <button
          type="button"
          style={resetButtonStyle}
          onClick={handleResetFilters}
        >
          Reset
        </button>
      </form>

      {/* ---------------- SKETCH LIST ---------------- */}
      {sketches.length === 0 ? (
        <p>No sketches found.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            justifyContent: "center",
          }}
        >
          {sketches.map((sketch) => (
            <div
              key={sketch._id}
              style={{
                border: "1px solid #ccc",
                padding: 15,
                width: 280,
                borderRadius: 12,
                backgroundColor: "#fff",
              }}
            >
              {/* EDIT MODE */}
              {editingId === sketch._id ? (
                <>
                  <input
                    name="title"
                    value={editData.title}
                    onChange={handleEditChange}
                    style={editInputStyle}
                  />

                  <select
                    name="category_id"
                    value={editData.category_id}
                    onChange={handleEditChange}
                    style={editInputStyle}
                  >
                    <option value="">Select Category</option>
                    {lookups.categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    name="color_id"
                    value={editData.color_id}
                    onChange={handleEditChange}
                    style={editInputStyle}
                  >
                    <option value="">Select Color</option>
                    {lookups.colors.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    name="style_id"
                    value={editData.style_id}
                    onChange={handleEditChange}
                    style={editInputStyle}
                  >
                    <option value="">Select Style</option>
                    {lookups.styles.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 10,
                    }}
                  >
                    <button
                      style={saveButtonStyle}
                      onClick={() => saveEdit(sketch._id)}
                    >
                      💾 Save
                    </button>
                    <button style={cancelButtonStyle} onClick={cancelEdit}>
                      ✖ Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* VIEW MODE */}
                  <h3>{sketch.title}</h3>
                  <p>
                    <strong>Category:</strong> {sketch.category_id?.name}
                  </p>
                  <p>
                    <strong>Color:</strong> {sketch.color_id?.name}
                  </p>
                  <p>
                    <strong>Style:</strong> {sketch.style_id?.name}
                  </p>

                  {sketch.image && (
                    <img
                      src={sketch.image}
                      alt={sketch.title}
                      style={{
                        width: "100%",
                        borderRadius: 6,
                        marginTop: 10,
                      }}
                    />
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 10,
                    }}
                  >
                    <button
                      style={editButtonStyle}
                      onClick={() => startEdit(sketch)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      style={deleteButtonStyle}
                      onClick={() => handleDelete(sketch._id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Styles ---------- */

const filterInputStyle = {
  padding: "8px",
  borderRadius: 5,
  border: "1px solid #ccc",
};

const filterButtonStyle = {
  padding: "8px 15px",
  backgroundColor: "#1e90ff",
  color: "white",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
};

const resetButtonStyle = {
  padding: "8px 15px",
  backgroundColor: "#ccc",
  border: "none",
  borderRadius: 5,
  cursor: "pointer",
};

const editInputStyle = {
  width: "100%",
  marginBottom: 6,
  padding: 6,
  borderRadius: 5,
  border: "1px solid #ccc",
};

const editButtonStyle = {
  backgroundColor: "#6c63ff",
  color: "white",
  border: "none",
  borderRadius: 5,
  padding: "5px 10px",
  cursor: "pointer",
};

const saveButtonStyle = {
  backgroundColor: "#28a745",
  color: "white",
  border: "none",
  borderRadius: 5,
  padding: "5px 10px",
  cursor: "pointer",
};

const cancelButtonStyle = {
  backgroundColor: "#aaa",
  color: "black",
  border: "none",
  borderRadius: 5,
  padding: "5px 10px",
  cursor: "pointer",
};

const deleteButtonStyle = {
  backgroundColor: "#ff4d4d",
  color: "white",
  border: "none",
  borderRadius: 5,
  padding: "5px 10px",
  cursor: "pointer",
};
