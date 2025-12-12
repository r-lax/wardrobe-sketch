// client/src/App.js
import React, { useState } from 'react';
import SketchForm from './components/sketchForm.js';
import SketchList from './components/SketchList.js';

function App() {
  const [lastSaved, setLastSaved] = useState(null);

  return (
    <div style={{ padding: 40 }}>
      <SketchForm onSave={setLastSaved} />
      <SketchList lastSaved={lastSaved} />
    </div>
  );
}

export default App;
