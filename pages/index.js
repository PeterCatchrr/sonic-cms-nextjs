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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveView("campaigns")} className={\`px-4 py-2 rounded \${activeView === "campaigns" ? 'bg-black text-white' : 'bg-gray-200'}\`}>📋 Campaign Management</button>
        <button onClick={() => setActiveView("insights")} className={\`px-4 py-2 rounded \${activeView === "insights" ? 'bg-black text-white' : 'bg-gray-200'}\`}>📊 Data Insights</button>
      </div>

      {activeView === "campaigns" && (
        <>
          <h1 className="text-2xl font-bold mb-6">🎯 Campaign CMS + Encoder</h1>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mb-6">
            <input className="border p-2 rounded" name="title" placeholder="Campaign Title" value={form.title} onChange={handleChange} />
            <input className="border p-2 rounded" name="brand" placeholder="Brand Name" value={form.brand} onChange={handleChange} />
            <input className="border p-2 rounded" name="barcodeId" placeholder="Barcode ID (leave blank to auto-generate)" value={form.barcodeId} onChange={handleChange} />
            <input className="border p-2 rounded" name="timestamp" placeholder="Trigger Time (sec)" value={form.timestamp} onChange={handleChange} />
            <input className="border p-2 rounded" name="frequency" placeholder="Frequency (Hz)" value={form.frequency} onChange={handleChange} />
            <input className="border p-2 rounded" name="url" placeholder="Redirect URL" value={form.url} onChange={handleChange} />
          </div>

          <div className="mb-4">
            <label className="block font-semibold mb-2">🎬 Upload Video for Encoding</label>
            <input type="file" accept="video/*" onChange={handleVideoUpload} />
            {videoFile && (
              <video ref={videoRef} src={videoFile} controls width="100%" className="mt-4 rounded shadow" />
            )}
          </div>

          <div className="flex gap-4">
            <button onClick={handleAdd} className="bg-black text-white px-4 py-2 rounded">➕ Add Campaign</button>
            <button onClick={simulateEncoding} className="bg-blue-600 text-white px-4 py-2 rounded">🎧 Encode + Download</button>
          </div>

          {encodingLog && <p className="mt-4 text-sm bg-gray-100 p-2 border rounded">{encodingLog}</p>}

          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">📋 Campaign List</h2>
            <div className="grid gap-4">
              {campaigns.map(c => (
                <div key={c._id || c.id} className="border rounded shadow p-4">
                  <p><strong>Campaign:</strong> {c.title}</p>
                  <p><strong>Brand:</strong> {c.brand}</p>
                  <p><strong>Barcode ID:</strong> {c.barcodeId}</p>
                  <p><strong>Timestamp:</strong> {c.timestamp}s</p>
                  <p><strong>Frequency:</strong> {c.frequency} Hz</p>
                  <p><strong>URL:</strong> <a href={c.url} target="_blank" className="underline text-blue-600">{c.url}</a></p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeView === "insights" && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">📊 Campaign Data Insights</h2>
          <p className="text-gray-600">Coming soon: analytics dashboard for triggered tones, conversion tracking, and performance by campaign.</p>
        </div>
      )}
    </div>
  );
}