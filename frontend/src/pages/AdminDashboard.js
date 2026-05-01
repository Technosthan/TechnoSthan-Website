import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import StatsRow from '../components/StatsRow';
import ContactsTable from '../components/ContactsTable';
import { getAdminUploads, approveUploads, rejectUploads, getEmailConfig, updateEmailConfig, getSystemSettings, updateSystemSettings, getActivity, getNotifications } from '../services/api';

const TABS = ['Uploads','Email Config','Settings','Activity'];

export default function AdminDashboard() {
  const [tab, setTab] = useState('Uploads');
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ pending:0, sent:0, failed:0, waiting_approval:0 });
  const [loading, setLoading] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [config, setConfig] = useState({ emailUser:'', emailPass:'', subject:'', bodyTemplate:'' });
  const [savingConfig, setSavingConfig] = useState(false);
  const [requireApproval, setRequireApproval] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [activity, setActivity] = useState([]);

  const fetchUploads = useCallback(async () => {
    setLoading(true);
    try { const res = await getAdminUploads(); setContacts(res.data.data); setStats(res.data.stats); } catch {}
    finally { setLoading(false); }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try { const res = await getNotifications(); setNotifCount(res.data.pendingApproval); } catch {}
  }, []);

  useEffect(() => {
    fetchUploads(); fetchNotifications();
    const id = setInterval(() => { fetchUploads(); fetchNotifications(); }, 6000);
    return () => clearInterval(id);
  }, [fetchUploads, fetchNotifications]);

  useEffect(() => {
    if (tab === 'Email Config') getEmailConfig().then(r => { if(r.data.data) setConfig({...r.data.data, emailPass:''}); }).catch(()=>{});
    if (tab === 'Settings') getSystemSettings().then(r => setRequireApproval(r.data.data?.requireApproval||false)).catch(()=>{});
    if (tab === 'Activity') getActivity().then(r => setActivity(r.data.data)).catch(()=>{});
  }, [tab]);

  const handleApprove = async (uploadedBy) => {
    try { const r = await approveUploads(uploadedBy); toast.success(r.data.message); fetchUploads(); }
    catch (err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const handleReject = async (uploadedBy) => {
    const reason = window.prompt('Rejection reason:') || 'Rejected by admin';
    try { const r = await rejectUploads(uploadedBy, reason); toast.success(r.data.message); fetchUploads(); }
    catch (err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault(); setSavingConfig(true);
    try { await updateEmailConfig(config); toast.success('Email config saved'); }
    catch (err) { toast.error(err.response?.data?.message||'Save failed'); }
    finally { setSavingConfig(false); }
  };

  const handleToggleApproval = async (val) => {
    setSavingSettings(true);
    try { await updateSystemSettings({ requireApproval: val }); setRequireApproval(val); toast.success(`Approval ${val?'enabled':'disabled'}`); }
    catch { toast.error('Failed to update'); }
    finally { setSavingSettings(false); }
  };

  const tabStyle = (t) => ({
    padding:'8px 18px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', border:'none', fontFamily:'inherit', transition:'all .15s',
    background: tab===t ? '#6366f1' : 'transparent',
    color: tab===t ? '#fff' : '#94a3b8',
  });

  return (
    <div style={{ minHeight:'100vh', background:'#0f172a' }}>
      <Navbar notificationCount={notifCount} />
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 24px', display:'flex', flexDirection:'column', gap:20 }}>

        <StatsRow stats={stats} />

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, background:'#1e293b', padding:6, borderRadius:12, width:'fit-content', border:'1px solid #334155' }}>
          {TABS.map(t=>(
            <button key={t} style={tabStyle(t)} onClick={()=>setTab(t)}>
              {t==='Uploads' && notifCount>0 ? `${t} 🔴` : t}
            </button>
          ))}
        </div>

        {/* Uploads Tab */}
        {tab==='Uploads' && (
          <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:14, overflow:'hidden' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid #334155' }}>
              <h2 style={{ fontSize:15, fontWeight:700, color:'#fff' }}>All Uploads</h2>
              <button onClick={fetchUploads} className="btn btn-ghost" style={{ padding:'6px 14px', fontSize:12 }}>🔃 Refresh</button>
            </div>
            <ContactsTable data={contacts} loading={loading} showUploader={true} onApprove={handleApprove} onReject={handleReject} />
          </div>
        )}

        {/* Email Config Tab */}
        {tab==='Email Config' && (
          <div className="card" style={{ maxWidth:640 }}>
            <h2 style={{ fontSize:17, fontWeight:700, color:'#fff', marginBottom:20 }}>📧 SMTP Configuration</h2>
            <form onSubmit={handleSaveConfig}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label className="form-label">Gmail Address</label>
                  <input className="form-input" type="email" placeholder="you@gmail.com" required
                    value={config.emailUser} onChange={e=>setConfig({...config,emailUser:e.target.value})} />
                </div>
                <div>
                  <label className="form-label">App Password</label>
                  <input className="form-input" type="password" placeholder="16-char app password"
                    value={config.emailPass} onChange={e=>setConfig({...config,emailPass:e.target.value})} />
                  <p className="form-hint">Leave blank to keep existing</p>
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <label className="form-label">Email Subject</label>
                <input className="form-input" type="text" placeholder="Greeting from Our Team"
                  value={config.subject} onChange={e=>setConfig({...config,subject:e.target.value})} />
              </div>
              <div style={{ marginBottom:20 }}>
                <label className="form-label">Body Template</label>
                <textarea className="form-input" rows={5} placeholder="Hi {{email}}, welcome..."
                  style={{ resize:'vertical' }}
                  value={config.bodyTemplate} onChange={e=>setConfig({...config,bodyTemplate:e.target.value})} />
                <p className="form-hint">Use <code style={{ color:'#818cf8' }}>{'{{email}}'}</code> and <code style={{ color:'#818cf8' }}>{'{{phone}}'}</code> as placeholders</p>
              </div>
              <button type="submit" disabled={savingConfig} className="btn btn-primary">
                {savingConfig ? <><span className="spinner" />Saving...</> : 'Save Configuration'}
              </button>
            </form>
          </div>
        )}

        {/* Settings Tab */}
        {tab==='Settings' && (
          <div className="card" style={{ maxWidth:500 }}>
            <h2 style={{ fontSize:17, fontWeight:700, color:'#fff', marginBottom:20 }}>⚙️ System Settings</h2>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#0f172a', border:'1px solid #334155', borderRadius:12, padding:'16px 20px' }}>
              <div>
                <div style={{ fontWeight:600, color:'#fff', marginBottom:4 }}>Require Admin Approval</div>
                <div style={{ fontSize:13, color:'#64748b' }}>When enabled, uploads wait for approval before emails are sent</div>
              </div>
              <button onClick={()=>handleToggleApproval(!requireApproval)} disabled={savingSettings}
                style={{ width:52, height:28, borderRadius:14, border:'none', cursor:'pointer', position:'relative', transition:'background .2s', background: requireApproval ? '#6366f1' : '#334155' }}>
                <span style={{ position:'absolute', top:3, left: requireApproval ? 26 : 3, width:22, height:22, background:'#fff', borderRadius:'50%', transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,.3)' }} />
              </button>
            </div>
            <p style={{ fontSize:12, color:'#475569', marginTop:12 }}>
              Current: <span style={{ color: requireApproval ? '#818cf8' : '#34d399', fontWeight:600 }}>
                {requireApproval ? 'Approval Required' : 'Auto-Send Enabled'}
              </span>
            </p>
          </div>
        )}

        {/* Activity Tab */}
        {tab==='Activity' && (
          <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:14, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #334155' }}>
              <h2 style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Activity Log</h2>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>User</th><th>Action</th><th>Detail</th><th>Time</th></tr>
                </thead>
                <tbody>
                  {activity.map(a=>(
                    <tr key={a._id}>
                      <td>
                        <div style={{ fontSize:13, color:'#f1f5f9' }}>{a.userId?.name||'—'}</div>
                        <div style={{ fontSize:11, color:'#64748b' }}>{a.userId?.email||''}</div>
                      </td>
                      <td><span style={{ fontSize:12, background:'#0f172a', border:'1px solid #334155', padding:'2px 8px', borderRadius:6, fontFamily:'monospace', color:'#a5b4fc' }}>{a.action}</span></td>
                      <td style={{ fontSize:12, color:'#64748b' }}>{a.detail}</td>
                      <td style={{ fontSize:11, color:'#475569' }}>{new Date(a.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                  {!activity.length && <tr><td colSpan={4} style={{ textAlign:'center', padding:'40px', color:'#475569' }}>No activity yet</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
