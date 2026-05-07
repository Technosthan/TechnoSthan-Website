import { Cloud, Server, GitBranch, Lock, BarChart3, RefreshCw, Zap, Shield, Clock, Users, Globe, Settings } from 'lucide-react';
import ServiceDetail from './ServiceDetail';

const data = {
  color: '#0ea5e9',
  accentGradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
  meta: {
    title: 'Cloud & DevOps — TechnoSthan IT Services',
    description: 'Cloud migration, Kubernetes, CI/CD pipelines, infrastructure as code — TechnoSthan DevOps engineers deliver zero-downtime deployments on AWS, GCP, and Azure.',
  },
  hero: {
    eyebrow: 'Cloud & DevOps',
    title: 'Cloud Infrastructure',
    titleAccent: 'That Never Sleeps',
    subtitle: 'From multi-cloud architecture and Kubernetes orchestration to fully automated CI/CD pipelines — we design, deploy, and manage infrastructure that scales with your business and never lets you down.',
    icon: <Cloud size={28} />,
    highlights: [
      'AWS, GCP & Azure certified experts',
      'Zero-downtime deployments',
      'Infrastructure as Code (Terraform)',
      '24/7 monitoring & alerting',
      'Cost optimization — avg 35% savings',
    ],
  },
  offerings: {
    subtitle: 'Full spectrum DevOps and cloud engineering services for modern engineering teams.',
    items: [
      { icon: <Cloud size={20} />, title: 'Cloud Migration', desc: 'Lift-and-shift, re-platforming, and cloud-native refactoring across AWS, GCP, and Azure with zero data loss.' },
      { icon: <Server size={20} />, title: 'Kubernetes Orchestration', desc: 'EKS, GKE, AKS cluster setup, Helm chart management, auto-scaling, and service mesh integration.' },
      { icon: <GitBranch size={20} />, title: 'CI/CD Pipeline Automation', desc: 'GitHub Actions, Jenkins, GitLab CI — fully automated build, test, security scan, and deploy pipelines.' },
      { icon: <Settings size={20} />, title: 'Infrastructure as Code', desc: 'Terraform, Pulumi, AWS CDK — version-controlled, reproducible, auditable infrastructure provisioning.' },
      { icon: <Lock size={20} />, title: 'DevSecOps', desc: 'SAST, DAST, secrets management with Vault, container scanning, and compliance automation (SOC2, ISO).' },
      { icon: <BarChart3 size={20} />, title: 'Observability & Monitoring', desc: 'Prometheus, Grafana, Datadog, PagerDuty — full-stack observability with SLO/SLA dashboards.' },
    ],
  },
  process: [
    { title: 'Infrastructure Audit', desc: 'Assess current setup, identify bottlenecks, security gaps, cost inefficiencies, and modernization opportunities.' },
    { title: 'Architecture Design', desc: 'Design cloud-native architecture with HA, DR, auto-scaling, and cost optimization built in from day one.' },
    { title: 'Implementation', desc: 'Terraform-first provisioning, Kubernetes cluster setup, and CI/CD pipeline automation with full IaC coverage.' },
    { title: 'Handover & Support', desc: 'Documentation, team training, runbooks, and 24/7 monitoring with incident response SLAs.' },
  ],
  technologies: [
    { name: 'AWS' }, { name: 'Google Cloud' }, { name: 'Azure' }, { name: 'Kubernetes' },
    { name: 'Docker' }, { name: 'Terraform' }, { name: 'Helm' }, { name: 'Jenkins' },
    { name: 'GitHub Actions' }, { name: 'Prometheus' }, { name: 'Grafana' }, { name: 'Datadog' },
    { name: 'Vault' }, { name: 'Nginx' }, { name: 'Istio' }, { name: 'ArgoCD' },
  ],
  stats: [
    { value: 200, suffix: '+', label: 'Cloud Projects', desc: 'Across AWS, GCP & Azure' },
    { value: 35, suffix: '%', label: 'Cost Reduction', desc: 'Average client savings' },
    { value: 99, suffix: '.9%', label: 'Uptime SLA', desc: 'Guaranteed availability' },
    { value: 24, suffix: '/7', label: 'Monitoring', desc: 'Always-on ops coverage' },
  ],
  whyUs: [
    { icon: <Shield size={18} />, title: 'Multi-Cloud Certified', desc: 'AWS, GCP, and Azure certified architects who design for resilience and vendor independence.' },
    { icon: <Zap size={18} />, title: 'Deployment Velocity', desc: 'From weekly releases to 50+ deploys per day — we automate everything to accelerate your team.' },
    { icon: <Clock size={18} />, title: 'Rapid Response', desc: '15-minute incident response SLA. We monitor 24/7 so your team can sleep soundly.' },
    { icon: <Users size={18} />, title: 'Knowledge Transfer', desc: 'We train your internal team — our goal is to empower you, not create dependency on us.' },
    { icon: <Globe size={18} />, title: 'Global CDN & Edge', desc: 'CloudFront, Fastly, Cloudflare — we optimize for global performance and sub-50ms latency.' },
    { icon: <BarChart3 size={18} />, title: 'FinOps Optimization', desc: 'Continuous cost analysis, reserved instance planning, and rightsizing to maximize your cloud ROI.' },
  ],
};

export default function CloudPage() {
  return <ServiceDetail data={data} />;
}