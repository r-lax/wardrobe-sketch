// client/src/components/SketchForm.js
import React, { useState, useRef, useEffect } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';

export default function SketchForm({ onSave }) {
  const canvasRef = useRef();

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    color_id: '',
    style_id: '',
  });

  const [lookups, setLookups] = useState({ categories: [], colors: [], styles: [] });

  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const [isErasing, setIsErasing] = useState(false);

  // Fetch dropdown options
  const fetchLookups = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/lookups');
      const data = await res.json();
      setLookups(data);
    } catch (err) {
      console.error('Failed to load lookups:', err);
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Add new lookup entry
  const handleAddNew = async (type) => {
    const name = prompt(`Enter a new ${type} name:`)?.trim();
    if (!name) return;

    try {
      let endpoint = '';
      let body = { name };

      if (type === 'category') endpoint = 'categories';
      else if (type === 'color') endpoint = 'colors';
      else if (type === 'style') endpoint = 'styles';
      else return;

      await fetch(`http://localhost:5000/api/lookups/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      await fetchLookups();
    } catch (err) {
      console.error(`❌ Error adding ${type}:`, err);
      alert(`Failed to add ${type}. See console for details.`);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const image = await canvasRef.current.exportImage('png');
      const payload = {
        title: formData.title,
        category_id: formData.category_id,
        color_id: formData.color_id,
        style_id: formData.style_id,
        image,
      };

      const res = await fetch('http://localhost:5000/api/sketches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      onSave(data);
      setFormData({ title: '', category_id: '', color_id: '', style_id: '' });
      canvasRef.current.clearCanvas();
    } catch (err) {
      console.error('Error saving sketch:', err);
      alert('Error saving sketch. See console for details.');
    }
  };


  const toggleEraser = async () => {
    if (!isErasing) {
      await canvasRef.current.eraseMode(true);
      setIsErasing(true);
    } else {
      await canvasRef.current.eraseMode(false);
      setIsErasing(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      style={{
        maxWidth: 800,
        padding: 20,
        border: '1px solid #ccc',
        borderRadius: 10,
        backgroundColor: '#fefefe',
        margin: 'auto',
        boxShadow: '0 0 10px rgba(0,0,0,0.05)',
      }}
    >
      <h2 style={{ marginBottom: 20 }}> Create a New Sketch</h2>

      {/* Text & Dropdown Inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          style={inputStyle}
          required
        />

        <div style={dropdownContainer}>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            style={{ ...inputStyle, flexGrow: 1 }}
            required
          >
            <option value="">Select Category</option>
            {lookups.categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => handleAddNew('category')} style={addButtonStyle}>➕</button>
        </div>

        <div style={dropdownContainer}>
          <select
            name="color_id"
            value={formData.color_id}
            onChange={handleChange}
            style={{ ...inputStyle, flexGrow: 1 }}
          >
            <option value="">Select Color</option>
            {lookups.colors.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => handleAddNew('color')} style={addButtonStyle}>➕</button>
        </div>

        <div style={dropdownContainer}>
          <select
            name="style_id"
            value={formData.style_id}
            onChange={handleChange}
            style={{ ...inputStyle, flexGrow: 1 }}
          >
            <option value="">Select Style</option>
            {lookups.styles.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => handleAddNew('style')} style={addButtonStyle}>➕</button>
        </div>
      </div>

      {/* Drawing Controls */}
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 15,
          flexWrap: 'wrap',
        }}
      >
        <label>
          🖌️ Brush Color:
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            style={{ marginLeft: 10 }}
          />
        </label>

        <label>
          ⚙️ Brush Size:
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            style={{ marginLeft: 10 }}
          />
          <span style={{ marginLeft: 5 }}>{brushSize}px</span>
        </label>

        <button
          type="button"
          onClick={toggleEraser}
          style={{
            ...buttonStyle,
            backgroundColor: isErasing ? '#ff4d4d' : '#ccc',
          }}
        >
          {isErasing ? '🧽 Eraser On' : '✏️ Draw Mode'}
        </button>

        <button
          type="button"
          onClick={() => canvasRef.current.clearCanvas()}
          style={{ ...buttonStyle, backgroundColor: '#1e90ff', color: 'white' }}
        >
          🗑️ Clear
        </button>
      </div>

      {/* Drawing Canvas */}
      <div style={{ marginTop: 20, border: '1px solid #ccc', borderRadius: 10 }}>
        <ReactSketchCanvas
          ref={canvasRef}
          width="100%"
          height="400px"
          strokeWidth={brushSize}
          strokeColor={brushColor}
          style={{ borderRadius: 10 }}
        />
      </div>

      <button
        type="submit"
        style={{
          marginTop: 20,
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer',
        }}
      >
        💾 Save Sketch
      </button>
    </form>
  );
}

// Styles
const inputStyle = {
  padding: 10,
  borderRadius: 5,
  border: '1px solid #ccc',
};

const buttonStyle = {
  padding: '8px 12px',
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer',
};

const dropdownContainer = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
};

const addButtonStyle = {
  padding: '5px 8px',
  border: 'none',
  backgroundColor: '#6c63ff',
  color: 'white',
  borderRadius: 5,
  cursor: 'pointer',
};
