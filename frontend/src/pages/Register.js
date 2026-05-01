import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';

const S = {
  page:   { minHeight:'100vh', display:'flex', background:'#0f172a' },
  left:   { width:'50%', background:'linear-gradient(135deg,#1a1040,#2d1b69,#1a1040)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:48, position:'relative', overflow:'hidden' },
  right:  { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px', overflowY:'auto' },
  blob1:  { position:'absolute', top:'20%', right:'20%', width:280, height:280, background:'rgba(139,92,246,.2)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' },
  blob2:  { position:'absolute', bottom:'20%', left:'20%', width:220, height:220, background:'rgba(99,102,241,.2)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' },
  grid:   { position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(139,92,246,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.05) 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' },
  logo:   { display:'flex', alignItems:'center', gap:10, position:'relative' },
  logoBox:{ width:42, height:42, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 },
  logoTxt:{ fontSize:22, fontWeight:800, color:'#fff' },
  tagline:{ position:'relative' },
  h2:     { fontSize:'clamp(28px,3vw,40px)', fontWeight:900, color:'#fff', lineHeight:1.2, marginBottom:12 },
  grad:   { background:'linear-gradient(135deg,#c084fc,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  sub:    { fontSize:15, color:'#94a3b8', lineHeight:1.7, marginBottom:24 },
  checklist:{ listStyle:'none' },
  checkItem:{ display:'flex', alignItems:'center', gap:12, fontSize:13, color:'#cbd5e1', marginBottom:12 },
  checkIcon:{ width:22, height:22, background:'rgba(52,211,153,.15)', border:'1px solid rgba(52,211,153,.3)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#34d399', fontSize:11, flexShrink:0 },
  note:   { fontSize:11, color:'#475569', position:'relative' },
  form:   { width:'100%', maxWidth:420 },
  formHead:{ marginBottom:24 },
  formH1: { fontSize:30, fontWeight:800, color:'#fff', marginBottom:6 },
  formSub:{ fontSize:14, color:'#64748b' },
  field:  { marginBottom:16 },
  label:  { fontSize:13, fontWeight:500, color:'#94a3b8', display:'block', marginBottom:6 },
  passWrap:{ position:'relative' },
  eyeBtn: { position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#64748b' },
  strengthBar:{ display:'flex', gap:4, marginTop:6 },
  strengthSeg:(active,color)=>({ flex:1, height:3, borderRadius:2, background: active ? color : '#1e293b', transition:'background .2s' }),
  strengthLbl:(c)=>({ fontSize:11, fontWeight:600, color:c, marginLeft:8 }),
  errTxt: { fontSize:11, color:'#f87171', marginTop:4 },
  divider:{ textAlign:'center', marginTop:18 },
  divTxt: { fontSize:13, color:'#64748b' },
  divLink:{ color:'#818cf8', fontWeight:500, textDecoration:'none' },
  back:   { display:'block', textAlign:'center', marginTop:14, fontSize:12, color:'#475569', textDecoration:'none' },
};

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthColors = ['','#ef4444','#f59e0b','#22c55e'];
  const strengthLabels = ['','Weak','Good','Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await register({ name:form.name, email:form.email, password:form.password });
      saveAuth(res.data.token, res.data.user);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/user-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={S.page}>
      {/* Left panel */}
      <div style={S.left} className="hide-mobile">
        <div style={S.grid} /><div style={S.blob1} /><div style={S.blob2} />
        <div style={S.logo}>
          <div style={S.logoBox}>📨</div>
          <span style={S.logoTxt}>MailBlast</span>
        </div>
        <div style={S.tagline}>
          <h2 style={S.h2}>Start sending<br /><span style={S.grad}>in minutes.</span></h2>
          <p style={S.sub}>No credit card required. Free plan includes 500 emails/month.</p>
          <ul style={S.checklist}>
            {['Upload CSV or Excel files instantly','Real-time delivery tracking','Admin approval workflow','Dynamic email templates','Full activity audit log'].map(f=>(
              <li key={f} style={S.checkItem}>
                <span style={S.checkIcon}>✓</span>{f}
              </li>
            ))}
          </ul>
        </div>
        <p style={S.note}>By creating an account you agree to our Terms of Service and Privacy Policy.</p>
      </div>

      {/* Right panel */}
      <div style={S.right}>
        <div style={S.form}>
          <div style={S.formHead}>
            <h1 style={S.formH1}>Create your account</h1>
            <p style={S.formSub}>Free forever. No credit card needed.</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={S.field}>
              <label style={S.label}>Full Name</label>
              <input className="form-input" type="text" placeholder="John Doe" required
                value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com" required
                value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Password</label>
              <div style={S.passWrap}>
                <input className="form-input" type={showPass?'text':'password'} placeholder="Min 6 characters" required
                  style={{ paddingRight:44 }}
                  value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
                <button type="button" style={S.eyeBtn} onClick={()=>setShowPass(!showPass)}>{showPass?'🙈':'👁️'}</button>
              </div>
              {form.password && (
                <div style={{ display:'flex', alignItems:'center', marginTop:6 }}>
                  <div style={S.strengthBar}>
                    {[1,2,3].map(i=><div key={i} style={S.strengthSeg(i<=strength, strengthColors[strength])} />)}
                  </div>
                  <span style={S.strengthLbl(strengthColors[strength])}>{strengthLabels[strength]}</span>
                </div>
              )}
            </div>
            <div style={S.field}>
              <label style={S.label}>Confirm Password</label>
              <input className={`form-input${form.confirm && form.confirm!==form.password?' error':''}`}
                type="password" placeholder="Repeat password" required
                value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} />
              {form.confirm && form.confirm!==form.password && <p style={S.errTxt}>Passwords don't match</p>}
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full"
              style={{ padding:'13px', fontSize:15, marginTop:4 }}>
              {loading ? <><span className="spinner" />Creating account...</> : 'Create Account →'}
            </button>
          </form>
          <div style={S.divider}>
            <p style={S.divTxt}>Already have an account? <Link to="/login" style={S.divLink}>Sign in</Link></p>
          </div>
          <Link to="/" style={S.back}>← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
