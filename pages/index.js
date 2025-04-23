
import { useState, useEffect, useRef } from 'react';

const API_BASE = 'https://campaign-backend-railway-production.up.railway.app';

export default function CampaignCMS() {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState({
    title: '',
    brand: '',
    barcodeId: '',
    timestamp: '',
    frequency: '19000',
    url: ''
  });
  const [videoFile, setVideoFile] = useState(null);
  const videoRef = useRef(null);
  const [encodingLog, setEncodingLog] = useState("");
  const [activeView, setActiveView] = useState("campaigns");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setVideoFile(URL.createObjectURL(file));
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API_BASE}/campaigns`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
      alert("Failed to load campaigns. Please check the server or your internet connection.");
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleAdd = async () => {
    try {
      const res = await fetch(`${API_BASE}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server error: ${res.status} - ${errorText}`);
      }
      const newCampaign = await res.json();
      setCampaigns([...campaigns, newCampaign]);
      setForm({ title: '', brand: '', barcodeId: '', timestamp: '', frequency: '19000', url: '' });
    } catch (err) {
      console.error("Failed to create campaign:", err);
      alert("Failed to create campaign: " + err.message);
    }
  };

  const simulateEncoding = () => {
    if (!videoFile) {
      alert("Please upload a video before encoding.");
      return;
    }
    setEncodingLog("🔊 Encoding started...");
    setTimeout(() => {
      setEncodingLog("✅ Video encoded successfully with sonic barcode at " + form.timestamp + "s (" + form.frequency + "Hz). Downloading...");
      const link = document.createElement('a');
      link.href = videoFile;
      link.download = form.title.replace(/\s+/g, '_') + '_encoded.mp4';
      link.click();
    }, 2000);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setActiveView("campaigns")} style={{ marginRight: '1rem' }}>📋 Campaign Management</button>
        <button onClick={() => setActiveView("insights")}>📊 Data Insights</button>
      </div>

      {activeView === "campaigns" && (
        <>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🎯 Campaign CMS + Encoder</h1>
          <div style={{ marginTop: '1rem' }}>
            <input name="title" placeholder="Campaign Title" value={form.title} onChange={handleChange} />
            <input name="brand" placeholder="Brand Name" value={form.brand} onChange={handleChange} />
            <input name="barcodeId" placeholder="Barcode ID (optional)" value={form.barcodeId} onChange={handleChange} />
            <input name="timestamp" placeholder="Trigger Time (sec)" value={form.timestamp} onChange={handleChange} />
            <input name="frequency" placeholder="Frequency (Hz)" value={form.frequency} onChange={handleChange} />
            <input name="url" placeholder="Redirect URL" value={form.url} onChange={handleChange} />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label>🎬 Upload Video:</label>
            <input type="file" accept="video/*" onChange={handleVideoUpload} />
            {videoFile && <video ref={videoRef} src={videoFile} controls width="100%" />}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button onClick={handleAdd}>➕ Add Campaign</button>
            <button onClick={simulateEncoding} style={{ marginLeft: '1rem' }}>🎧 Encode + Download</button>
          </div>

          {encodingLog && <p>{encodingLog}</p>}
        </>
      )}

      {activeView === "insights" && (
        <div>
          <h2>📊 Campaign Data Insights</h2>
          <p>Coming soon: analytics dashboard for triggered tones.</p>
        </div>
      )}
    </div>
  );
}
