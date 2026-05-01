import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const S = {
  // Layout
  page:    { minHeight:'100vh', background:'#0f172a', overflowX:'hidden' },
  // Navbar
  nav:     { position:'fixed', top:0, left:0, right:0, zIndex:50, transition:'all .3s', padding:'0 24px' },
  navInner:{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', height:68 },
  logo:    { display:'flex', alignItems:'center', gap:10 },
  logoBox: { width:38, height:38, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 },
  logoText:{ fontSize:20, fontWeight:800, color:'#fff' },
  logoBadge:{ fontSize:11, background:'rgba(99,102,241,.2)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,.3)', padding:'2px 8px', borderRadius:20, fontWeight:600 },
  navLinks:{ display:'flex', alignItems:'center', gap:32 },
  navLink: { color:'#94a3b8', fontSize:14, fontWeight:500, cursor:'pointer', transition:'color .15s', textDecoration:'none' },
  navCtas: { display:'flex', alignItems:'center', gap:12 },
  // Hero
  hero:    { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', padding:'100px 24px 60px' },
  heroInner:{ maxWidth:900, margin:'0 auto', textAlign:'center', position:'relative', zIndex:2 },
  heroBadge:{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(99,102,241,.1)', border:'1px solid rgba(99,102,241,.2)', color:'#a5b4fc', fontSize:12, fontWeight:600, padding:'6px 16px', borderRadius:20, marginBottom:28 },
  h1:      { fontSize:'clamp(36px,6vw,72px)', fontWeight:900, color:'#fff', lineHeight:1.1, marginBottom:20 },
  grad:    { background:'linear-gradient(135deg,#818cf8,#c084fc,#f472b6)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' },
  heroSub: { fontSize:'clamp(15px,2vw,20px)', color:'#94a3b8', maxWidth:600, margin:'0 auto 36px', lineHeight:1.7 },
  heroCtas:{ display:'flex', flexWrap:'wrap', gap:14, justifyContent:'center', marginBottom:56 },
  statsRow:{ display:'flex', justifyContent:'center', gap:48, flexWrap:'wrap' },
  statItem:{ textAlign:'center' },
  statVal: { fontSize:26, fontWeight:800, color:'#fff' },
  statLbl: { fontSize:12, color:'#64748b', marginTop:2 },
  // Mockup
  mockup:  { marginTop:56, background:'rgba(30,41,59,.8)', border:'1px solid #334155', borderRadius:20, padding:20, maxWidth:700, margin:'56px auto 0', backdropFilter:'blur(10px)' },
  mockBar: { display:'flex', alignItems:'center', gap:6, marginBottom:14 },
  mockDot: (c) => ({ width:12, height:12, borderRadius:'50%', background:c }),
  mockUrl: { flex:1, background:'#0f172a', borderRadius:6, height:20, marginLeft:8 },
  mockStats:{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14 },
  mockStat:(c)=>({ background:'rgba(15,23,42,.8)', borderRadius:12, padding:'10px 8px', textAlign:'center' }),
  mockStatVal:(c)=>({ fontSize:20, fontWeight:700, color:c }),
  mockStatLbl:{ fontSize:11, color:'#64748b', marginTop:2 },
  mockRow: { display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(15,23,42,.5)', borderRadius:8, padding:'8px 12px', marginBottom:6 },
  mockEmail:{ fontSize:12, color:'#94a3b8' },
  // Sections
  section: { padding:'80px 24px' },
  sectionAlt:{ padding:'80px 24px', background:'rgba(30,41,59,.3)' },
  sectionInner:{ maxWidth:1200, margin:'0 auto' },
  sectionHead:{ textAlign:'center', marginBottom:56 },
  sectionBadge:(c)=>({ display:'inline-block', fontSize:11, fontWeight:700, color:c.text, background:c.bg, border:`1px solid ${c.border}`, padding:'4px 14px', borderRadius:20, marginBottom:14, letterSpacing:'.06em' }),
  h2:      { fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:'#fff', marginBottom:14, lineHeight:1.2 },
  sectionSub:{ fontSize:17, color:'#64748b', maxWidth:500, margin:'0 auto' },
  // Features grid
  featGrid:{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:18 },
  featCard:{ background:'rgba(30,41,59,.5)', border:'1px solid rgba(51,65,85,.5)', borderRadius:18, padding:24, transition:'all .3s', cursor:'default' },
  featIcon:{ fontSize:32, marginBottom:14 },
  featTitle:{ fontSize:16, fontWeight:700, color:'#fff', marginBottom:8 },
  featDesc:{ fontSize:13, color:'#64748b', lineHeight:1.7 },
  // Steps
  stepsGrid:{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:18 },
  stepCard:{ display:'flex', gap:18, background:'rgba(30,41,59,.6)', border:'1px solid rgba(51,65,85,.5)', borderRadius:18, padding:22 },
  stepNum: { flexShrink:0, width:48, height:48, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14 },
  stepTitle:{ fontSize:15, fontWeight:700, color:'#fff', marginBottom:6 },
  stepDesc:{ fontSize:13, color:'#64748b', lineHeight:1.7 },
  // Pricing
  pricingGrid:{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20, maxWidth:960, margin:'0 auto' },
  pricingCard:(hl)=>({ position:'relative', background: hl ? 'linear-gradient(160deg,rgba(99,102,241,.15),rgba(139,92,246,.08))' : 'rgba(30,41,59,.5)', border: hl ? '1px solid rgba(99,102,241,.4)' : '1px solid rgba(51,65,85,.5)', borderRadius:20, padding:28 }),
  pricingBadge:{ position:'absolute', top:-14, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', fontSize:11, fontWeight:700, padding:'4px 14px', borderRadius:20, whiteSpace:'nowrap' },
  planName:{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:4 },
  planDesc:{ fontSize:13, color:'#64748b', marginBottom:18 },
  planPrice:{ display:'flex', alignItems:'baseline', gap:4, marginBottom:20 },
  planPriceVal:{ fontSize:40, fontWeight:900, color:'#fff' },
  planPricePer:{ fontSize:14, color:'#64748b' },
  planFeatures:{ listStyle:'none', marginBottom:24 },
  planFeature:{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'#cbd5e1', marginBottom:10 },
  planCheck:{ color:'#34d399', flexShrink:0 },
  // CTA Banner
  ctaBanner:{ padding:'80px 24px' },
  ctaInner:{ maxWidth:900, margin:'0 auto', background:'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius:28, padding:'64px 40px', textAlign:'center', position:'relative', overflow:'hidden' },
  ctaGrid: { position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)', backgroundSize:'32px 32px' },
  ctaH2:   { fontSize:'clamp(24px,4vw,40px)', fontWeight:900, color:'#fff', marginBottom:14, position:'relative' },
  ctaSub:  { fontSize:17, color:'rgba(255,255,255,.75)', marginBottom:32, position:'relative' },
  ctaBtns: { display:'flex', flexWrap:'wrap', gap:14, justifyContent:'center', position:'relative' },
  // Footer
  footer:  { borderTop:'1px solid #1e293b', padding:'56px 24px 32px' },
  footerInner:{ maxWidth:1200, margin:'0 auto' },
  footerGrid:{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:40, marginBottom:40 },
  footerBrand:{ fontSize:13, color:'#64748b', lineHeight:1.8, marginTop:12, maxWidth:280 },
  footerTitle:{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:16, textTransform:'uppercase', letterSpacing:'.06em' },
  footerLink:{ display:'block', fontSize:13, color:'#64748b', marginBottom:10, cursor:'pointer', transition:'color .15s', textDecoration:'none' },
  footerBottom:{ borderTop:'1px solid #1e293b', paddingTop:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 },
  footerCopy:{ fontSize:12, color:'#475569' },
  footerLinks:{ display:'flex', gap:24 },
};

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  const navStyle = { ...S.nav, background: scrolled ? 'rgba(15,23,42,.95)' : 'transparent', backdropFilter: scrolled ? 'blur(12px)' : 'none', borderBottom: scrolled ? '1px solid #1e293b' : 'none' };
  return (
    <nav style={navStyle}>
      <div style={S.navInner}>
        <Link to="/" style={S.logo}>
          <div style={S.logoBox}>📨</div>
          <span style={S.logoText}>MailBlast</span>
          <span style={S.logoBadge}>SaaS</span>
        </Link>
        <div style={{ display:'flex', gap:32, alignItems:'center' }} className="hide-mobile">
          {['Features','How it works','Pricing'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} style={S.navLink}
              onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#94a3b8'}>{l}</a>
          ))}
        </div>
        <div style={S.navCtas} className="hide-mobile">
          <Link to="/login" style={{ ...S.navLink, color:'#cbd5e1' }}>Sign In</Link>
          <Link to="/register" className="btn btn-primary" style={{ padding:'10px 20px', fontSize:14 }}>Get Started Free</Link>
        </div>
        <button onClick={()=>setOpen(!open)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:22, display:'none' }} className="show-mobile">☰</button>
      </div>
      {open && (
        <div style={{ background:'#0f172a', borderTop:'1px solid #1e293b', padding:'16px 24px' }}>
          {['Features','How it works','Pricing'].map(l=>(
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} style={{ display:'block', color:'#94a3b8', padding:'10px 0', fontSize:14 }}>{l}</a>
          ))}
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:12 }}>
            <Link to="/login" style={{ textAlign:'center', padding:'10px', border:'1px solid #334155', borderRadius:10, color:'#cbd5e1', fontSize:14 }}>Sign In</Link>
            <Link to="/register" style={{ textAlign:'center', padding:'10px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius:10, color:'#fff', fontSize:14, fontWeight:600 }}>Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section style={S.hero}>
      {/* Blobs */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div className="blob" style={{ position:'absolute', top:'20%', left:'15%', width:400, height:400, background:'rgba(99,102,241,.15)', borderRadius:'50%', filter:'blur(80px)' }} />
        <div className="blob blob-delay" style={{ position:'absolute', bottom:'20%', right:'15%', width:320, height:320, background:'rgba(139,92,246,.15)', borderRadius:'50%', filter:'blur(80px)' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(99,102,241,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.03) 1px,transparent 1px)', backgroundSize:'64px 64px' }} />
      </div>
      <div style={S.heroInner} className="fade-in">
        <div style={S.heroBadge}>
          <span style={{ width:6, height:6, background:'#818cf8', borderRadius:'50%', animation:'pulse 1.5s infinite' }} />
          Trusted by 500+ businesses worldwide
        </div>
        <h1 style={S.h1}>
          Send Bulk Emails<br />
          <span style={S.grad}>That Actually Land</span>
        </h1>
        <p style={S.heroSub}>
          Upload a CSV, hit send. MailBlast handles delivery, tracking, and approval workflows — so your team stays in control without the complexity.
        </p>
        <div style={S.heroCtas}>
          <Link to="/register" className="btn btn-primary btn-lg">Start for Free →</Link>
          <Link to="/login" className="btn btn-ghost btn-lg">Sign In to Dashboard</Link>
        </div>
        <div style={S.statsRow}>
          {[['10M+','Emails Sent'],['99.9%','Uptime'],['< 2s','Avg Delivery']].map(([v,l])=>(
            <div key={l} style={S.statItem}>
              <div style={S.statVal}>{v}</div>
              <div style={S.statLbl}>{l}</div>
            </div>
          ))}
        </div>
        {/* Dashboard mockup */}
        <div style={S.mockup}>
          <div style={S.mockBar}>
            <div style={S.mockDot('#ef4444')} /><div style={S.mockDot('#f59e0b')} /><div style={S.mockDot('#22c55e')} />
            <div style={S.mockUrl} />
          </div>
          <div style={S.mockStats}>
            {[['2,847','Total','#fff'],['2,601','Sent','#34d399'],['198','Pending','#fbbf24'],['48','Failed','#f87171']].map(([v,l,c])=>(
              <div key={l} style={S.mockStat(c)}>
                <div style={S.mockStatVal(c)}>{v}</div>
                <div style={S.mockStatLbl}>{l}</div>
              </div>
            ))}
          </div>
          {[['john@company.com','Sent','#34d399'],['sarah@startup.io','Sent','#34d399'],['mike@enterprise.com','Pending','#fbbf24']].map(([e,s,c])=>(
            <div key={e} style={S.mockRow}>
              <span style={S.mockEmail}>{e}</span>
              <span style={{ fontSize:11, fontWeight:600, color:c, background:`${c}22`, padding:'2px 8px', borderRadius:20 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon:'📤', title:'CSV / Excel Upload', desc:'Drop any file. We auto-detect email and phone columns regardless of format or column order.' },
    { icon:'⚡', title:'Instant Bulk Sending', desc:'Emails go out in smart batches to maximize deliverability and avoid spam filters.' },
    { icon:'✅', title:'Approval Workflow', desc:'Enable admin approval mode. No email goes out without your sign-off.' },
    { icon:'📊', title:'Real-time Tracking', desc:'Watch delivery status update live — Sent, Pending, Failed — all in one dashboard.' },
    { icon:'🔧', title:'Dynamic Templates', desc:'Personalize every email with {{email}} and {{phone}} variables. Change content anytime.' },
    { icon:'🔐', title:'Role-based Access', desc:'Admins control everything. Users upload and track. Clean separation of concerns.' },
    { icon:'🔄', title:'Retry Failed Emails', desc:'One click to retry all failed deliveries. No manual work needed.' },
    { icon:'📋', title:'Activity Logs', desc:'Full audit trail of every upload, send, approval, and config change.' },
  ];
  return (
    <section id="features" style={S.sectionAlt}>
      <div style={S.sectionInner}>
        <div style={S.sectionHead}>
          <div style={S.sectionBadge({ text:'#818cf8', bg:'rgba(99,102,241,.1)', border:'rgba(99,102,241,.2)' })}>FEATURES</div>
          <h2 style={S.h2}>Everything you need to <span style={S.grad}>run campaigns</span></h2>
          <p style={S.sectionSub}>Built for teams that need reliability, control, and speed — without the enterprise price tag.</p>
        </div>
        <div style={S.featGrid}>
          {features.map(f=>(
            <div key={f.title} style={S.featCard}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor='rgba(99,102,241,.4)'; e.currentTarget.style.transform='translateY(-4px)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(51,65,85,.5)'; e.currentTarget.style.transform='none'; }}>
              <div style={S.featIcon}>{f.icon}</div>
              <div style={S.featTitle}>{f.title}</div>
              <div style={S.featDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num:'01', title:'Register & Login', desc:'Create your account in seconds. Admins get full control, users get a clean upload dashboard.' },
    { num:'02', title:'Upload Your File', desc:'Upload a CSV or Excel file with email and phone columns. We handle the rest automatically.' },
    { num:'03', title:'Emails Go Out', desc:'Emails are sent automatically (or after admin approval). Track every delivery in real time.' },
    { num:'04', title:'Monitor & Retry', desc:"See who got the email, who didn't, and retry failures with one click." },
  ];
  return (
    <section id="how-it-works" style={S.section}>
      <div style={S.sectionInner}>
        <div style={S.sectionHead}>
          <div style={S.sectionBadge({ text:'#c084fc', bg:'rgba(139,92,246,.1)', border:'rgba(139,92,246,.2)' })}>HOW IT WORKS</div>
          <h2 style={S.h2}>Up and running <span style={S.grad}>in minutes</span></h2>
          <p style={S.sectionSub}>No complex setup. No coding required.</p>
        </div>
        <div style={S.stepsGrid}>
          {steps.map(s=>(
            <div key={s.num} style={S.stepCard}>
              <div style={S.stepNum}>{s.num}</div>
              <div>
                <div style={S.stepTitle}>{s.title}</div>
                <div style={S.stepDesc}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    { name:'Starter', price:'Free', period:'forever', desc:'Perfect for small teams getting started', highlight:false,
      features:['Up to 500 emails/month','CSV & Excel upload','Basic tracking','1 user'], cta:'Get Started', to:'/register' },
    { name:'Pro', price:'$29', period:'/month', desc:'For growing teams with higher volume', highlight:true,
      features:['Unlimited emails','Approval workflow','Dynamic templates','Activity logs','Priority support','Up to 10 users'], cta:'Start Free Trial', to:'/register' },
    { name:'Enterprise', price:'Custom', period:'', desc:'For large organizations', highlight:false,
      features:['Everything in Pro','Custom SMTP','Dedicated support','SLA guarantee','Unlimited users'], cta:'Contact Sales', to:'/register' },
  ];
  return (
    <section id="pricing" style={S.sectionAlt}>
      <div style={S.sectionInner}>
        <div style={S.sectionHead}>
          <div style={S.sectionBadge({ text:'#34d399', bg:'rgba(52,211,153,.1)', border:'rgba(52,211,153,.2)' })}>PRICING</div>
          <h2 style={S.h2}>Simple, <span style={S.grad}>transparent pricing</span></h2>
          <p style={S.sectionSub}>No hidden fees. Cancel anytime.</p>
        </div>
        <div style={S.pricingGrid}>
          {plans.map(p=>(
            <div key={p.name} style={S.pricingCard(p.highlight)}>
              {p.highlight && <div style={S.pricingBadge}>MOST POPULAR</div>}
              <div style={S.planName}>{p.name}</div>
              <div style={S.planDesc}>{p.desc}</div>
              <div style={S.planPrice}>
                <span style={S.planPriceVal}>{p.price}</span>
                <span style={S.planPricePer}>{p.period}</span>
              </div>
              <ul style={S.planFeatures}>
                {p.features.map(f=>(
                  <li key={f} style={S.planFeature}><span style={S.planCheck}>✓</span>{f}</li>
                ))}
              </ul>
              <Link to={p.to} className={`btn btn-full ${p.highlight ? 'btn-primary' : 'btn-ghost'}`}
                style={{ display:'block', textAlign:'center', padding:'12px' }}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section style={S.ctaBanner}>
      <div style={S.ctaInner}>
        <div style={S.ctaGrid} />
        <h2 style={S.ctaH2}>Ready to send your first campaign?</h2>
        <p style={S.ctaSub}>Join thousands of teams using MailBlast to reach their audience reliably.</p>
        <div style={S.ctaBtns}>
          <Link to="/register" className="btn btn-white btn-lg">Create Free Account</Link>
          <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={S.footer}>
      <div style={S.footerInner}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:40, marginBottom:40, flexWrap:'wrap' }}>
          <div>
            <div style={S.logo}>
              <div style={{ ...S.logoBox, width:32, height:32, fontSize:16 }}>📨</div>
              <span style={{ ...S.logoText, fontSize:18 }}>MailBlast</span>
            </div>
            <p style={S.footerBrand}>The simplest way to send bulk emails with tracking, approval workflows, and real-time delivery status.</p>
          </div>
          <div>
            <div style={S.footerTitle}>Product</div>
            {['Features','How it works','Pricing','Changelog'].map(l=>(
              <a key={l} href="#" style={S.footerLink}
                onMouseEnter={e=>e.target.style.color='#e2e8f0'} onMouseLeave={e=>e.target.style.color='#64748b'}>{l}</a>
            ))}
          </div>
          <div>
            <div style={S.footerTitle}>Account</div>
            <Link to="/login"    style={S.footerLink}>Sign In</Link>
            <Link to="/register" style={S.footerLink}>Register</Link>
            <Link to="/user-dashboard" style={S.footerLink}>Dashboard</Link>
          </div>
        </div>
        <div style={S.footerBottom}>
          <span style={S.footerCopy}>© 2025 MailBlast. All rights reserved.</span>
          <div style={S.footerLinks}>
            {['Privacy','Terms','Support'].map(l=>(
              <a key={l} href="#" style={{ fontSize:12, color:'#475569', textDecoration:'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div style={S.page}>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTABanner />
      <Footer />
    </div>
  );
}
