import { ShieldCheck, FileText, Users, Bot, Scale } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const sections = [
  {
    icon: FileText,
    title: "Use the platform responsibly",
    body: "Users should continue using the platform for agriculture learning, support, and account access as intended.",
  },
  {
    icon: Users,
    title: "Respect community standards",
    body: "Admin controls, public access behavior, and role checks remain active and unchanged.",
  },
  {
    icon: Bot,
    title: "AI features stay supported",
    body: "Chat, content, and learning tools continue to function with the same backend logic already in place.",
  },
  {
    icon: ShieldCheck,
    title: "Account safety",
    body: "Auth and verification flows continue to protect user accounts without any policy changes in this phase.",
  },
];

const TermsPage = () => {
  const { theme } = useTheme();

  return (
    <section className="section-shell">
      <div className="site-container">
        <div className="max-w-4xl">
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
            Legal
          </p>
          <h1 className="page-title mt-4">Terms of Service</h1>
          <p className="page-subtitle mt-5">
            This page provides a clean public-facing summary of platform terms
            while preserving every existing system flow.
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
          <h2 className="text-2xl font-bold">Unchanged core behavior</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-7 text-slate-600 dark:text-slate-300 md:grid-cols-2">
            <li>Current backend APIs are preserved.</li>
            <li>OTP, Google, Telegram, WhatsApp, and QR login remain unchanged.</li>
            <li>SendGrid and messaging integrations are not altered.</li>
            <li>Admin CRUD and public-access behavior continue as before.</li>
          </ul>
        </div>

        <div className={`mt-6 flex flex-col gap-3 rounded-[1.5rem] border p-6 md:flex-row md:items-center ${theme.card}`}>
          <Scale className="text-emerald-600 dark:text-emerald-300" size={20} />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            If you need the detailed legal policy text, use the existing
            support and contact channels already available on the platform.
          </p>
          <a href="/contact" className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Get help
          </a>
        </div>
      </div>
    </section>
  );
};

export default TermsPage;
