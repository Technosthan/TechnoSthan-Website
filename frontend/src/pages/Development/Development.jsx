import { Code2, Globe, Smartphone, Database, Layers, Cpu, GitBranch, Shield, Zap, Clock, Users, Star } from 'lucide-react';
import ServiceDetail from './ServiceDetail';

const data = {
  color: '#6366f1',
  accentGradient: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
  meta: {
    title: 'Engineering & Development — TechnoSthan IT Services',
    description: 'Custom software development, web apps, mobile apps, APIs, and enterprise solutions built by senior engineers at TechnoSthan.',
  },
  hero: {
    eyebrow: 'Engineering & Development',
    title: 'Engineering',
    titleAccent: 'Built to Scale',
    subtitle: 'From full-stack web applications to mobile platforms and enterprise software — our engineers deliver production-grade solutions with clean architecture, rigorous testing, and long-term maintainability.',
    icon: <Code2 size={28} />,
    highlights: [
      'Senior Full-Stack Engineers',
      'Agile 2-week sprint cycles',
      'Code reviews on every PR',
      'Post-launch support included',
      '99.9% uptime SLA guarantee',
    ],
  },
  offerings: {
    subtitle: 'End-to-end engineering services from ideation to production and beyond.',
    items: [
      { icon: <Globe size={20} />, title: 'Web Application Development', desc: 'React, Next.js, Vue — performant, SEO-optimized web apps with stunning UX and enterprise-grade architecture.' },
      { icon: <Smartphone size={20} />, title: 'Mobile Development', desc: 'Native iOS & Android, and cross-platform React Native apps that users love and businesses rely on.' },
      { icon: <Database size={20} />, title: 'API & Backend Systems', desc: 'RESTful APIs, GraphQL, Node.js and Python microservices built for high concurrency and security.' },
      { icon: <Layers size={20} />, title: 'SaaS Product Engineering', desc: 'Multi-tenant SaaS platforms with subscription management, billing, and analytics built in from day one.' },
      { icon: <Cpu size={20} />, title: 'AI & ML Integration', desc: 'LLM-powered features, computer vision, NLP, and recommendation engines integrated into your product.' },
      { icon: <GitBranch size={20} />, title: 'Legacy Modernization', desc: 'Safely migrate and re-architect legacy monoliths to modern microservices without business disruption.' },
    ],
  },
  process: [
    { title: 'Technical Discovery', desc: 'Deep-dive into requirements, constraints, existing tech stack, and architecture patterns that fit your scale.' },
    { title: 'Architecture Planning', desc: 'System design, API contracts, database schema, and technology selection with full stakeholder buy-in.' },
    { title: 'Iterative Development', desc: 'Two-week agile sprints with weekly demos, continuous integration, and transparent progress tracking.' },
    { title: 'QA & Launch', desc: 'Unit, integration, and end-to-end testing followed by staged rollouts with monitoring and alerting.' },
  ],
  technologies: [
    { name: 'React' }, { name: 'Next.js' }, { name: 'Vue.js' }, { name: 'TypeScript' },
    { name: 'Node.js' }, { name: 'Python' }, { name: 'FastAPI' }, { name: 'GraphQL' },
    { name: 'PostgreSQL' }, { name: 'MongoDB' }, { name: 'Redis' }, { name: 'Elasticsearch' },
    { name: 'React Native' }, { name: 'Flutter' }, { name: 'AWS Lambda' }, { name: 'Stripe' },
  ],
  stats: [
    { value: 300, suffix: '+', label: 'Apps Delivered', desc: 'Web, mobile & enterprise' },
    { value: 50, suffix: '+', label: 'Senior Engineers', desc: 'Full-stack expertise' },
    { value: 99, suffix: '%', label: 'On-Time Delivery', desc: 'Sprint completion rate' },
    { value: 6, suffix: ' mo', label: 'Post-Launch Support', desc: 'Included on all projects' },
  ],
  whyUs: [
    { icon: <Shield size={18} />, title: 'Security-First Code', desc: 'OWASP top-10 hardened code, penetration testing, and SOC2-ready architecture on every build.' },
    { icon: <Zap size={18} />, title: 'Performance Optimized', desc: 'Core Web Vitals in the green, sub-200ms API responses, and lighthouse scores above 95.' },
    { icon: <Clock size={18} />, title: 'Rapid Iteration', desc: 'Bi-weekly sprints with live demos ensure you always see progress and can course-correct fast.' },
    { icon: <Users size={18} />, title: 'Dedicated Pod Model', desc: 'Your project gets a dedicated team — PM, lead engineer, QA — not shared across 10 projects.' },
    { icon: <GitBranch size={18} />, title: 'Clean Codebase', desc: 'ESLint, Prettier, 80%+ test coverage, and thorough documentation so your team can take over seamlessly.' },
    { icon: <Star size={18} />, title: 'Post-Launch Ownership', desc: '6 months of free bug fixes and support so you can launch confidently without worrying.' },
  ],
};

export default function EngineeringPage() {
  return <ServiceDetail data={data} />;
}