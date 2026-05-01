import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import StatsRow from '../components/StatsRow';
import ContactsTable from '../components/ContactsTable';
import { uploadFile, getMyStatus, deleteMyContacts } from '../services/api';

export default function UserDashboard() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ pending:0, sent:0, failed:0, waiting_approval:0 });
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyStatus();
      setContacts(res.data.data);
      setStats(res.data.stats);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  useEffect(() => {
    if (stats.pending > 0 || stats.waiting_approval > 0) {
      setPolling(true);
      const id = setInterval(fetchStatus, 4000);
      return () => clearInterval(id);
    } else { setPolling(false); }
  }, [stats.pending, stats.waiting_approval, fetchStatus]);

  const handleDelete = async () => {
    if (!window.confirm('Delete all your contacts? This cannot be undone.')) return;
    try {
      const res = await deleteMyContacts();
      toast.success(res.data.message);
      setContacts([]);
      setStats({ pending:0, sent:0, failed:0, waiting_approval:0 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleUpload = async () => {    if (!file) { toast.error('Select a file first'); return; }
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true); setProgress(0);
    try {
      const res = await uploadFile(fd, e => setProgress(Math.round((e.loaded*100)/e.total)));
      toast.success(res.data.message);
      setFile(null);
      fetchStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); setProgress(0); }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0f172a' }}>
      <Navbar />
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 24px', display:'flex', flexDirection:'column', gap:20 }}>

        {/* Upload Card */}
        <div className="card">
          <h2 style={{ fontSize:17, fontWeight:700, color:'#fff', marginBottom:4 }}>📤 Upload Contacts</h2>
          <p style={{ fontSize:13, color:'#64748b', marginBottom:18 }}>CSV or Excel file with email and phone columns</p>
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:12 }}>
            <label style={{ cursor:'pointer' }}>
              <input type="file" accept=".csv,.xlsx,.xls" style={{ display:'none' }}
                onChange={e=>{ if(e.target.files[0]) setFile(e.target.files[0]); }} />
              <span className="btn btn-ghost" style={{ display:'inline-flex' }}>
                {file ? `📄 ${file.name}` : 'Choose File'}
              </span>
            </label>
            <button onClick={handleUpload} disabled={!file||uploading} className="btn btn-primary">
              {uploading ? <><span className="spinner" />Uploading...</> : 'Upload & Send'}
            </button>
            {polling && (
              <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#34d399', background:'rgba(34,197,94,.1)', padding:'4px 12px', borderRadius:20, border:'1px solid rgba(34,197,94,.2)' }}>
                <span className="pulse-dot" />Live updating...
              </span>
            )}
          </div>
          {uploading && (
            <div style={{ marginTop:12, background:'#0f172a', borderRadius:6, height:6, overflow:'hidden', border:'1px solid #334155' }}>
              <div style={{ height:'100%', background:'linear-gradient(90deg,#6366f1,#8b5cf6)', width:`${progress}%`, transition:'width .3s', borderRadius:6 }} />
            </div>
          )}
        </div>

        {/* Stats */}
        <StatsRow stats={stats} />

        {/* Table */}
        <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:14, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid #334155' }}>
            <h2 style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Delivery Status</h2>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {loading && <span style={{ fontSize:12, color:'#818cf8' }}>Refreshing...</span>}
              <button onClick={fetchStatus} className="btn btn-ghost" style={{ padding:'6px 14px', fontSize:12 }}>🔃 Refresh</button>
              {contacts.length > 0 && (
                <button onClick={handleDelete} className="btn btn-danger" style={{ padding:'6px 14px', fontSize:12 }}>🗑 Clear All</button>
              )}
            </div>
          </div>
          <ContactsTable data={contacts} loading={loading} />
        </div>

      </div>
    </div>
  );
}
