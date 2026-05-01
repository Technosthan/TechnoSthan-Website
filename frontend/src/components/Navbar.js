import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ notificationCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{ background:'#1e293b', borderBottom:'1px solid #334155', padding:'0 24px' }}>
      <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:60 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:34, height:34, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>📨</div>
          <span style={{ fontSize:17, fontWeight:700, color:'#fff' }}>MailBlast</span>
          <span style={{ fontSize:11, background: user?.role==='admin' ? 'rgba(139,92,246,.2)' : 'rgba(99,102,241,.2)', color: user?.role==='admin' ? '#c084fc' : '#a5b4fc', border:`1px solid ${user?.role==='admin'?'rgba(139,92,246,.3)':'rgba(99,102,241,.3)'}`, padding:'2px 8px', borderRadius:20, fontWeight:600, textTransform:'uppercase' }}>
            {user?.role}
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          {notificationCount > 0 && (
            <div style={{ position:'relative' }}>
              <span style={{ fontSize:18 }}>🔔</span>
              <span style={{ position:'absolute', top:-4, right:-4, background:'#ef4444', color:'#fff', fontSize:10, fontWeight:700, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{notificationCount}</span>
            </div>
          )}
          <span style={{ fontSize:13, color:'#94a3b8' }}>{user?.name}</span>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ padding:'6px 14px', fontSize:13 }}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
