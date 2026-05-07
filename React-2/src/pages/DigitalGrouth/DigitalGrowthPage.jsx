import { TrendingUp, Search, Target, BarChart3, Share2, Mail, Zap, Users, Clock, Globe, Star, Shield } from 'lucide-react';
import ServiceDetail from './ServiceDetail';

const data = {
  color: '#10b981',
  accentGradient: 'linear-gradient(135deg, #10b981, #0ea5e9)',
  meta: {
    title: 'Digital Growth — TechnoSthan IT Services',
    description: 'SEO, PPC, CRO, social media, and analytics that drive measurable revenue growth for your business. TechnoSthan Digital Growth vertical.',
  },
  hero: {
    eyebrow: 'Digital Growth',
    title: 'Growth Marketing',
    titleAccent: 'That Compounds',
    subtitle: 'We combine data science, creative strategy, and performance marketing to build sustainable acquisition engines. From zero to market leader — our growth team has done it across 80+ industries.',
    icon: <TrendingUp size={28} />,
    highlights: [
      'Data-first growth strategy',
      'Average 3.2x ROAS achieved',
      'Full-funnel attribution tracking',
      'Weekly performance reporting',
      'Zero-waste ad spend approach',
    ],
  },
  offerings: {
    subtitle: 'Comprehensive digital growth services that drive measurable, compounding results.',
    items: [
      { icon: <Search size={20} />, title: 'SEO & Content Strategy', desc: 'Technical SEO, content clusters, link building, and AI-driven keyword strategies that dominate search rankings.' },
      { icon: <Target size={20} />, title: 'PPC & Paid Media', desc: 'Google Ads, Meta, LinkedIn — precision targeting with constant A/B testing to maximize ROAS across every channel.' },
      { icon: <BarChart3 size={20} />, title: 'Conversion Rate Optimization', desc: 'Heatmaps, session recordings, A/B tests, and UX audits that turn more visitors into paying customers.' },
      { icon: <Share2 size={20} />, title: 'Social Media Growth', desc: 'Organic and paid social strategies that build authentic audiences and drive community-led growth.' },
      { icon: <Mail size={20} />, title: 'Email & Marketing Automation', desc: 'Lifecycle campaigns, drip sequences, and behavioral triggers that nurture leads to conversion on autopilot.' },
      { icon: <TrendingUp size={20} />, title: 'Analytics & Attribution', desc: 'GA4, custom dashboards, multi-touch attribution - crystal-clear visibility into what is and isn\'t working.' },
    ],
  },
  process: [
    { title: 'Growth Audit', desc: 'Audit your current funnel, identify highest-leverage opportunities, and benchmark against top competitors.' },
    { title: 'Strategy Blueprint', desc: 'Build a 90-day growth roadmap with channel mix, budget allocation, and projected ROI milestones.' },
    { title: 'Execute & Optimize', desc: 'Launch campaigns, build content, run A/B tests, and iterate weekly based on live performance data.' },
    { title: 'Scale & Report', desc: 'Double down on what works, kill what doesn\'t, and report transparently with full attribution every week.' },
  ],
  technologies: [
    { name: 'Google Analytics 4' }, { name: 'Google Ads' }, { name: 'Meta Ads' }, { name: 'SEMrush' },
    { name: 'Ahrefs' }, { name: 'HubSpot' }, { name: 'Klaviyo' }, { name: 'Hotjar' },
    { name: 'Optimizely' }, { name: 'Mixpanel' }, { name: 'Looker Studio' }, { name: 'LinkedIn Ads' },
    { name: 'Screaming Frog' }, { name: 'Segment' }, { name: 'Zapier' }, { name: 'Mailchimp' },
  ],
  stats: [
    { value: 3, suffix: '.2x', label: 'Average ROAS', desc: 'Across paid campaigns' },
    { value: 180, suffix: '%', label: 'Avg Organic Growth', desc: 'In first 12 months' },
    { value: 80, suffix: '+', label: 'Industries Served', desc: 'B2B, B2C, SaaS & more' },
    { value: 98, suffix: '%', label: 'Client Retention', desc: 'Because results matter' },
  ],
  whyUs: [
    { icon: <BarChart3 size={18} />, title: 'Data-Driven Decisions', desc: 'Every recommendation is backed by real data, A/B test results, and statistical significance, not gut feelings.' },
    { icon: <Zap size={18} />, title: 'Fast Experimentation', desc: 'Launch 10+ experiments per month across channels to find winners fast and scale them before competitors.' },
    { icon: <Globe size={18} />, title: 'Full-Funnel Thinking', desc: 'We optimize the entire customer journey — not just top of funnel — to maximize LTV and reduce CAC.' },
    { icon: <Users size={18} />, title: 'Embedded Team Model', desc: 'We work as an extension of your marketing team with full transparency, not as a black-box agency.' },
    { icon: <Star size={18} />, title: 'Creative + Performance', desc: 'We blend creative storytelling with performance math — the combination that produces outsized growth.' },
    { icon: <Shield size={18} />, title: 'Brand Safety First', desc: 'Every campaign is brand-safe, compliant with platform policies, and aligned with your brand voice.' },
  ],
};

export default function DigitalGrowthPage() {
  return <ServiceDetail data={data} />;
}