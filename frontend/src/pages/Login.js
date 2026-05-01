import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const S = {
  page:   { minHeight:'100vh', display:'flex', background:'#0f172a' },
  left:   { width:'50%', background:'linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:48, position:'relative', overflow:'hidden' },
  right:  { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px' },
  blob1:  { position:'absolute', top:'25%', left:'25%', width:300, height:300, background:'rgba(99,102,241,.2)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' },
  blob2:  { position:'absolute', bottom:'25%', right:'25%', width:240, height:240, background:'rgba(139,92,246,.2)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' },
  grid:   { position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(99,102,241,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.05) 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' },
  logo:   { display:'flex', alignItems:'center', gap:10, position:'relative' },
  logoBox:{ width:42, height:42, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 },
  logoTxt:{ fontSize:22, fontWeight:800, color:'#fff' },
  tagline:{ position:'relative' },
  h2:     { fontSize:'clamp(28px,3vw,40px)', fontWeight:900, color:'#fff', lineHeight:1.2, marginBottom:12 },
  grad:   { background:'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  sub:    { fontSize:15, color:'#94a3b8', lineHeight:1.7, marginBottom:28 },
  testimonial:{ background:'rgba(15,23,42,.5)', border:'1px solid rgba(51,65,85,.5)', borderRadius:16, padding:20, position:'relative' },
  testText:{ fontSize:14, color:'#cbd5e1', fontStyle:'italic', marginBottom:14, lineHeight:1.7 },
  testAuthor:{ display:'flex', alignItems:'center', gap:10 },
  avatar: { width:36, height:36, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:700 },
  authorName:{ fontSize:13, fontWeight:600, color:'#fff' },
  authorRole:{ fontSize:11, color:'#64748b' },
  statsRow:{ display:'flex', gap:32, position:'relative' },
  statVal:{ fontSize:22, fontWeight:800, color:'#fff' },
  statLbl:{ fontSize:11, color:'#64748b' },
  form:   { width:'100%', maxWidth:420 },
  formHead:{ marginBottom:28 },
  formH1: { fontSize:30, fontWeight:800, color:'#fff', marginBottom:6 },
  formSub:{ fontSize:14, color:'#64748b' },
  field:  { marginBottom:18 },
  labelRow:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 },
  label:  { fontSize:13, fontWeight:500, color:'#94a3b8' },
  forgot: { fontSize:12, color:'#818cf8', textDecoration:'none' },
  passWrap:{ position:'relative' },
  eyeBtn: { position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#64748b' },
  divider:{ textAlign:'center', marginTop:20 },
  divTxt: { fontSize:13, color:'#64748b' },
  divLink:{ color:'#818cf8', fontWeight:500, textDecoration:'none' },
  back:   { display:'block', textAlign:'center', marginTop:16, fontSize:12, color:'#475569', textDecoration:'none' },
};

export default function Login() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      saveAuth(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(res.data.user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
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
          <h2 style={S.h2}>Send smarter.<br /><span style={S.grad}>Track everything.</span></h2>
          <p style={S.sub}>Bulk email campaigns with real-time delivery tracking, approval workflows, and dynamic templates.</p>
          <div style={S.testimonial}>
            <p style={S.testText}>"MailBlast cut our campaign setup time by 80%. The approval workflow is exactly what our compliance team needed."</p>
            <div style={S.testAuthor}>
              <div style={S.avatar}>AK</div>
              <div>
                <div style={S.authorName}>Arjun Kumar</div>
                <div style={S.authorRole}>Marketing Lead, TechCorp</div>
              </div>
            </div>
          </div>
        </div>
        <div style={S.statsRow}>
          {[['10M+','Emails sent'],['500+','Teams'],['99.9%','Uptime']].map(([v,l])=>(
            <div key={l}><div style={S.statVal}>{v}</div><div style={S.statLbl}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={S.right}>
        <div style={S.form}>
          <div style={S.formHead}>
            <h1 style={S.formH1}>Welcome back</h1>
            <p style={S.formSub}>Sign in to your account to continue</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={S.field}>
              <label style={S.label}>Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com" required
                value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            </div>
            <div style={S.field}>
              <div style={S.labelRow}>
                <label style={S.label}>Password</label>
                <a href="#" style={S.forgot}>Forgot password?</a>
              </div>
              <div style={S.passWrap}>
                <input className="form-input" type={showPass?'text':'password'} placeholder="••••••••" required
                  style={{ paddingRight:44 }}
                  value={form.password} onChange={e=>setForm({...form,password:e.target.value})} />
                <button type="button" style={S.eyeBtn} onClick={()=>setShowPass(!showPass)}>{showPass?'🙈':'👁️'}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full"
              style={{ padding:'13px', fontSize:15, marginTop:4 }}>
              {loading ? <><span className="spinner" />Signing in...</> : 'Sign In →'}
            </button>
          </form>
          <div style={S.divider}>
            <p style={S.divTxt}>Don't have an account? <Link to="/register" style={S.divLink}>Create one free</Link></p>
          </div>
          <Link to="/" style={S.back}>← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
