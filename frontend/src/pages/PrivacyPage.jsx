import { Shield, Lock, Mail, Eye, Database } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const sections = [
  {
    icon: Shield,
    title: "Privacy first",
    body: "We protect account details, OTP data, and communication records used for authentication and support.",
  },
  {
    icon: Lock,
    title: "Secure access",
    body: "Your login methods, verification flows, and role checks continue to work exactly as they do today.",
  },
  {
    icon: Eye,
    title: "Clear usage",
    body: "We only use information to operate the platform, deliver services, and keep the experience reliable.",
  },
  {
    icon: Database,
    title: "Stored safely",
    body: "Account and content data remain in the existing backend and database systems already configured for the app.",
  },
];

const PrivacyPage = () => {
  const { theme } = useTheme();

  return (
    <section className="section-shell">
      <div className="site-container">
        <div className="max-w-4xl">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
            Legal
          </p>
          <h1 className="page-title mt-4">Privacy Policy</h1>
          <p className="page-subtitle mt-5">
            This page summarizes how TechnoSthan AgriTech handles user data
            without changing any backend auth, OTP, or account flows.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {sections.map(({ icon: Icon, title, body }) => (
            <article key={title} className={`ui-card p-6 ${theme.text}`}>
              <div className="icon-chip">
                <Icon size={18} />
              </div>
              <h2 className="mt-4 text-xl font-bold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {body}
              </p>
            </article>
          ))}
        </div>

        <div className={`ui-card mt-6 p-6 ${theme.text}`}>
          <h2 className="text-2xl font-bold">What stays unchanged</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-slate-600 dark:text-slate-300 md:grid-cols-2">
            <li>Authentication and OTP handling remain the same.</li>
            <li>Google, Telegram, WhatsApp, and QR login remain unchanged.</li>
            <li>Role-based access and public-access rules remain intact.</li>
            <li>Backend APIs and database models are not modified here.</li>
          </ul>
        </div>

        <div className={`mt-6 flex flex-col gap-3 rounded-[1.5rem] border p-6 md:flex-row md:items-center ${theme.card}`}>
          <Mail className="text-emerald-600 dark:text-emerald-300" size={20} />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Questions about privacy or account data can be sent through the
            existing contact channels.
          </p>
          <a href="/contact" className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Contact us
          </a>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPage;
