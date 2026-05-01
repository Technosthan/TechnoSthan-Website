import React from 'react';

const Stat = ({ label, value, color }) => (
  <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:'16px 20px', textAlign:'center', flex:1, minWidth:100 }}>
    <div style={{ fontSize:28, fontWeight:800, color }}>{value}</div>
    <div style={{ fontSize:11, color:'#64748b', textTransform:'uppercase', letterSpacing:'.05em', marginTop:4 }}>{label}</div>
  </div>
);

export default function StatsRow({ stats }) {
  const total = (stats.pending||0)+(stats.sent||0)+(stats.failed||0)+(stats.waiting_approval||0);
  return (
    <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
      <Stat label="Total"   value={total}                       color="#fff" />
      <Stat label="Pending" value={stats.pending||0}            color="#fbbf24" />
      <Stat label="Sent"    value={stats.sent||0}               color="#34d399" />
      <Stat label="Failed"  value={stats.failed||0}             color="#f87171" />
      <Stat label="Waiting" value={stats.waiting_approval||0}   color="#60a5fa" />
    </div>
  );
}
