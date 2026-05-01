import React from 'react';
import StatusBadge from './StatusBadge';

const msgColor = { sent:'#34d399', failed:'#f87171', waiting_approval:'#60a5fa', pending:'#fbbf24' };

export default function ContactsTable({ data, loading, showUploader=false, onApprove, onReject }) {
  if (loading && !data.length) return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'#475569' }}>
      <div className="spinner" style={{ margin:'0 auto 12px', width:32, height:32, borderWidth:3 }} />
      <p>Loading...</p>
    </div>
  );
  if (!data.length) return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'#475569', fontSize:15 }}>📭 No records yet.</div>
  );

  return (
    <div style={{ overflowX:'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Email</th>
            <th>Phone</th>
            {showUploader && <th>Uploaded By</th>}
            <th>Status</th>
            <th>Message</th>
            <th>Sent At</th>
            {showUploader && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((c,i)=>(
            <tr key={c._id}>
              <td style={{ color:'#475569', fontSize:12 }}>{i+1}</td>
              <td style={{ fontWeight:600, color:'#f1f5f9' }}>{c.email}</td>
              <td style={{ color:'#64748b' }}>{c.phone||'—'}</td>
              {showUploader && (
                <td>
                  <div style={{ fontSize:13, color:'#f1f5f9' }}>{c.uploadedBy?.name||'—'}</div>
                  <div style={{ fontSize:11, color:'#64748b' }}>{c.uploadedBy?.email||''}</div>
                </td>
              )}
              <td><StatusBadge status={c.status} /></td>
              <td style={{ fontSize:12, color: msgColor[c.status]||'#94a3b8' }}>{c.message||'—'}</td>
              <td style={{ fontSize:11, color:'#475569' }}>{c.sentAt ? new Date(c.sentAt).toLocaleString() : '—'}</td>
              {showUploader && (
                <td>
                  {c.status==='waiting_approval' ? (
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={()=>onApprove(c.uploadedBy?._id||c.uploadedBy)} className="btn btn-success" style={{ padding:'5px 12px', fontSize:12 }}>Approve</button>
                      <button onClick={()=>onReject(c.uploadedBy?._id||c.uploadedBy)} className="btn btn-danger" style={{ padding:'5px 12px', fontSize:12 }}>Reject</button>
                    </div>
                  ) : '—'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
