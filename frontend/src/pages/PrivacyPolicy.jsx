import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import {
  ChevronDown,
  Shield,
  Lock,
  Eye,
  Mail,
  Phone,
  Zap,
  AlertCircle,
  FileText,
  Users,
  Database,
} from "lucide-react";

export default function PrivacyPolicy() {
  const { theme } = useContext(ThemeContext);
  const [expandedSections, setExpandedSections] = useState({});

  // Auto-expand on first load
  useEffect(() => {
    setExpandedSections({ intro: true });
  }, []);

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sections = [
    {
      id: "intro",
      title: "1. Introduction & Overview",
      icon: <Shield className="w-5 h-5" />,
      content: `Technosthan AgriTech ("we," "us," "our," or "Company") operates the Technosthan AgriTech platform, including our website, mobile applications, AI chatbot services, and related services (collectively, the "Platform").

We are committed to protecting your privacy and ensuring you have a positive, transparent experience with our Platform. This Privacy Policy explains how we collect, use, disclose, store, and otherwise process personal information in connection with our Platform, services, and features.

By accessing or using Technosthan AgriTech, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree to our practices, please do not use our Platform.

**Last Updated:** May 26, 2026
**Effective Date:** May 26, 2026

We may update this Privacy Policy from time to time. We will notify you of changes by posting the revised policy on the Platform and updating the "Last Updated" date. Your continued use constitutes acceptance of the revised Privacy Policy.`,
    },
    {
      id: "collect",
      title: "2. Information We Collect",
      icon: <Eye className="w-5 h-5" />,
      content: `We collect information in several ways:

**2.1 Account Registration Information**
When you create an account, we collect:
- Full name
- Email address
- Phone number
- Password (encrypted)
- Profile picture (optional)
- Location/region information
- Agricultural interests and farming type

**2.2 Authentication & Verification Data**
During authentication, we collect and process:
- OTP (One-Time Password) records for email and SMS verification
- OAuth tokens from Google, Telegram, and WhatsApp
- Device information and IP address
- Authentication timestamps

**2.3 AI Chat & Assistance Data**
When you use our AI agricultural assistant, we collect:
- Chat messages and queries
- Conversation history
- AI-generated responses
- Interaction metadata (timestamps, duration)
- Agricultural queries and farmer-specific data

**2.4 Content Interaction Data**
- Content viewed and engagement metrics
- Quiz attempts, answers, and scores
- Course progress and completion status
- Time spent on educational materials

**2.5 Platform Usage Analytics**
- Device type and operating system
- Browser type and version
- Pages visited and features used
- Click patterns and user navigation
- Session duration and frequency
- Error logs and troubleshooting data

**2.6 Communication Data**
- Email communications and support tickets
- WhatsApp conversation history (if linked)
- Telegram bot interactions
- Support chat transcripts

**2.7 Payment Information (if applicable)
- Transaction records
- Billing addresses
- Payment method type (not full card details)

**2.8 Voluntarily Provided Information**
- Feedback and survey responses
- Comments and reviews
- Agricultural data and farming practices you share
- Images and documents uploaded for AI analysis`,
    },
    {
      id: "otp",
      title: "3. OTP & Phone Number Verification",
      icon: <Phone className="w-5 h-5" />,
      content: `**3.1 OTP Generation & Storage**
When you request OTP verification via email or SMS:
- A 6-digit OTP is generated and hashed for security
- OTP records include: phone/email, verification status, attempt count, and timestamp
- Failed attempts are tracked to prevent abuse (maximum 5 attempts)
- OTP expires after 5 minutes for security

**3.2 SMS & Phone Services**
- SMS OTPs are sent via Twilio and Vonage platforms
- Your phone number is stored in our database for future authentication
- Phone verification status is maintained to enable certain platform features
- SMS delivery logs are retained for 30 days

**3.3 Your Phone Number**
- Used for login, account recovery, and emergency notifications
- Shared with SMS providers (Twilio, Vonage) only for OTP delivery
- Never sold to third parties
- Can be updated anytime in your account settings

**3.4 Data Retention for OTP**
- Unverified OTP records: deleted after 5 minutes
- Verified OTP records: kept for 90 days
- Phone verification status: retained for account security
- You can request deletion of phone number anytime`,
    },
    {
      id: "email",
      title: "4. Email & Communication Data",
      icon: <Mail className="w-5 h-5" />,
      content: `**4.1 Email Collection & Use**
We collect your email address for:
- Account creation and login
- Email OTP verification
- Password reset functionality
- Educational content delivery
- Important platform notifications
- Agricultural updates and newsletters
- Support communication

**4.2 Email Service Providers**
Your email may be processed through:
- AWS SES (Amazon Simple Email Service)
- Resend Email Service
- Nodemailer integration
- Google Gmail API (for authenticated users)

**4.3 Email Communications**
We may send you:
- Transactional emails (account confirmations, OTP codes)
- Product updates and feature announcements
- Educational content and agriculture tips
- AI assistant insights and recommendations
- Survey invitations and feedback requests
- Account security alerts

**4.4 Unsubscribe**
You can unsubscribe from non-essential emails anytime through:
- Email footer unsubscribe links
- Account notification preferences
- Settings panel on the Platform

**4.5 Email Data Retention**
- Verified email addresses: retained for account management
- Email communication logs: kept for 1 year
- Failed email records: deleted after 30 days
- Marketing opt-out preferences: maintained indefinitely`,
    },
    {
      id: "ai",
      title: "5. AI Chat & Agricultural Intelligence",
      icon: <Zap className="w-5 h-5" />,
      content: `**5.1 AI-Powered Features**
Technosthan AgriTech uses advanced AI models for:
- Agricultural advisory and recommendations
- Crop disease identification and treatment
- Smart farming guidance
- Weather impact analysis
- Pest management suggestions
- Soil health recommendations

**5.2 AI Providers & Data Processing**
Your chat data may be processed by:
- Google Gemini AI
- Google Cloud Vertex AI
- Third-party AI providers as configured by administrators

**5.3 Chat Data Collection**
When you interact with our AI assistant:
- Complete chat history is stored in our database
- Queries and responses are retained for model improvement
- Metadata (timestamps, user ID, session ID) is collected
- Agricultural context and recommendations are logged

**5.4 Important Disclaimer**
- AI-generated responses are suggestions only
- Not professional veterinary or agronomic advice
- Always consult with qualified agricultural experts
- Recommendations should be verified independently
- Technosthan AgriTech is not liable for farming decisions based on AI responses
- Weather, soil, and pest data may be approximations

**5.5 AI Data Usage**
Your chat data may be used to:
- Improve AI model accuracy and performance
- Provide better agricultural recommendations
- Analyze agriculture trends
- Conduct agricultural research
- Train machine learning models (anonymized)

**5.6 AI Data Retention & Deletion**
- Chat history: retained for 2 years or until account deletion
- Personal identifiers: can be removed for anonymous analysis
- You can delete specific conversations anytime
- Full account deletion removes all associated AI data within 30 days

**5.7 AI Opt-Out**
You can disable AI features anytime in settings. This will:
- Stop new AI data collection
- Not affect historical data
- Limit access to AI-powered recommendations`,
    },
    {
      id: "oauth",
      title: "6. Third-Party Authentication (OAuth)",
      icon: <Lock className="w-5 h-5" />,
      content: `**6.1 Supported OAuth Providers**
We support authentication via:
- Google (Google OAuth 2.0)
- Telegram Bot API
- WhatsApp Business API

**6.2 Google Authentication**
When you login with Google:
- We receive: email, name, profile picture, Google ID
- Google does not share your password with us
- You can revoke access anytime in your Google Account settings
- We maintain a link between your account and Google ID for future login

**6.3 Telegram Authentication**
When you link Telegram:
- We receive: Telegram user ID, username, profile information
- OTP codes may be sent via Telegram bot
- Your Telegram linking can be revoked from account settings
- Chat data with our Telegram bot is retained for reference

**6.4 WhatsApp Authentication**
When you authenticate via WhatsApp:
- We receive: phone number and WhatsApp profile information
- OTP codes and messages are sent via WhatsApp Business API
- Conversation history is retained on our servers
- You can unlink WhatsApp anytime from settings

**6.5 Data from OAuth Providers**
We do NOT:
- Access your social media posts or private messages
- Access your contacts or friend lists
- Store OAuth provider passwords
- Share your data with OAuth providers

**6.6 Disconnecting OAuth**
You can disconnect any OAuth provider anytime. This will:
- Disable login via that provider
- Not affect existing account data
- Not delete historical authentication records`,
    },
    {
      id: "how-we-use",
      title: "7. How We Use Your Information",
      icon: <Zap className="w-5 h-5" />,
      content: `We use the information we collect for:

**7.1 Service Delivery**
- Creating and maintaining your account
- Providing platform features and functionality
- Processing transactions and payments
- Delivering educational content and resources
- Providing AI agricultural assistance

**7.2 Communication**
- Sending service updates and announcements
- Responding to support inquiries
- Providing account security notifications
- Sending verification codes and alerts

**7.3 Improvement & Analytics**
- Analyzing platform usage patterns
- Identifying bugs and technical issues
- Developing new features
- Improving AI recommendations
- Understanding user behavior

**7.4 Legal & Security**
- Detecting and preventing fraud
- Enforcing terms of service
- Complying with legal obligations
- Protecting user safety and security
- Investigating suspicious activity

**7.5 Marketing & Research**
- Creating anonymized agricultural research reports
- Understanding farming trends
- Conducting user surveys (with consent)
- Improving content recommendations

**7.6 Personalization**
- Tailoring content based on your interests
- Customizing AI recommendations
- Remembering user preferences
- Providing relevant notifications`,
    },
    {
      id: "sharing",
      title: "8. How We Share Your Information",
      icon: <Shield className="w-5 h-5" />,
      content: `**8.1 We DO NOT Sell Your Data**
Your personal information is never sold to third parties for marketing purposes.

**8.2 Service Providers**
We share information with trusted service providers:
- Email services (AWS SES, Resend, Nodemailer)
- SMS providers (Twilio, Vonage)
- AI services (Google Gemini, Vertex AI)
- Cloud hosting providers
- Payment processors
- Analytics services

All service providers:
- Must comply with data protection standards
- Are contractually bound to maintain confidentiality
- Can only use data for specified purposes

**8.3 Legal Requirements**
We may disclose information when required by:
- Court orders or legal process
- Government agencies and law enforcement
- Regulatory compliance obligations
- Protecting rights, privacy, and safety

**8.4 Platform Administration**
Admin staff may access:
- User management and support purposes
- System monitoring and security
- Content moderation
- Only on need-to-know basis

**8.5 Aggregated & Anonymized Data**
We may share:
- Anonymized agricultural statistics
- Farming trend reports
- Platform usage analytics
- No personal identifiable information included

**8.6 Business Transfers**
In case of merger, acquisition, or assets sale:
- Your information may be transferred
- You will be notified in advance
- Privacy policy will remain in effect

**8.7 Your Consent**
We will never share personal information without your consent, except where:
- Required by law
- Necessary for service delivery
- Protecting security and safety`,
    },
    {
      id: "security",
      title: "9. Data Security & Protection",
      icon: <Lock className="w-5 h-5" />,
      content: `**9.1 Security Measures**
We implement comprehensive security including:
- HTTPS/TLS encryption for all data transmission
- Password hashing using bcryptjs
- Database encryption at rest
- Regular security audits and penetration testing
- Role-based access control
- API rate limiting and DDoS protection

**9.2 Password Security**
- Passwords are hashed and salted
- Never stored in plain text
- Never transmitted unencrypted
- You are responsible for maintaining password confidentiality

**9.3 OTP Security**
- OTP codes are hashed and never stored in plain text
- Automatic expiration after 5 minutes
- Attempt limiting to prevent brute force attacks
- Transmission via secure channels only

**9.4 What We Cannot Guarantee**
- 100% security against all cyber attacks
- Protection against user negligence (sharing passwords, phishing)
- Unauthorized access via compromised user devices

**9.5 Security Incident Response**
If we discover a security breach:
- We will investigate immediately
- Affected users will be notified without unreasonable delay
- We will take corrective action
- We will comply with legal notification requirements

**9.6 Data Backup & Recovery**
- We maintain regular backups
- Backups are encrypted and securely stored
- Recovery protocols are tested regularly
- Data redundancy ensures service continuity`,
    },
    {
      id: "retention",
      title: "10. Data Retention & Deletion",
      icon: <Eye className="w-5 h-5" />,
      content: `**10.1 Retention Periods**

User Account Data:
- Active accounts: maintained indefinitely
- Email verification records: 90 days after verification
- Phone verification records: 90 days after verification
- Password reset tokens: 24 hours

AI Chat Data:
- Chat history: 2 years
- Session data: 1 year
- Anonymized data: indefinitely for research

OTP Records:
- Verified OTP: 90 days
- Failed OTP attempts: 30 days
- OTP logs: 30 days

Email Communications:
- Transactional emails: 1 year
- Marketing emails: until unsubscribe
- Support tickets: 2 years

Quiz & Content Data:
- Quiz scores and answers: 2 years
- Content progress: 2 years
- User interactions: 1 year

Analytics Data:
- Session logs: 90 days
- Aggregated analytics: 2 years
- Error logs: 30 days

**10.2 Account Deletion**
When you delete your account:
- All personal information is marked for deletion
- Chat history is anonymized within 30 days
- Account data is purged within 90 days
- Some data may be retained for legal compliance
- Aggregated, non-identifiable data may be retained

**10.3 Requesting Data Deletion**
You can request deletion of specific data:
- Submit request via account settings
- Or contact privacy@technosthan.com
- We will respond within 30 days
- Legal or security data may be retained

**10.4 Right to Be Forgotten**
You have the right to request complete deletion of your data, subject to:
- Legal retention requirements
- Active disputes or investigations
- Technical feasibility
- Contractual obligations

**10.5 Data Export**
You can request download of all your data:
- JSON or CSV format
- Includes all personal information
- Available through account settings
- Or contact support for assistance`,
    },
    {
      id: "rights",
      title: "11. Your Privacy Rights",
      icon: <Shield className="w-5 h-5" />,
      content: `**11.1 Access Your Data**
You have the right to:
- View all personal data we hold about you
- Know how your data is being used
- Access this information free of charge
- Request data in a portable format

**11.2 Correction & Updates**
You can:
- Update incorrect information anytime
- Modify profile details in account settings
- Request correction of verified information
- Contact support for assistance

**11.3 Data Deletion**
You can request deletion of:
- Specific data categories
- Entire account and associated data
- Historical communications
- Subject to legal requirements

**11.4 Opt-Out Options**
You can opt out of:
- Marketing emails (unsubscribe link in emails)
- Push notifications (disable in settings)
- Analytics tracking (privacy settings)
- AI data usage (disable AI features)
- Promotional communications

**11.5 Restrict Processing**
You can request we:
- Limit data collection to essentials only
- Restrict data sharing with third parties
- Disable analytics and tracking
- Stop AI model training on your data

**11.6 Data Portability**
You can:
- Download all your data in structured format
- Export to other platforms
- Request transfer of data
- No charge for data portability

**11.7 Withdraw Consent**
You can withdraw consent for:
- Optional data collection anytime
- Does not affect past data usage
- May affect feature functionality
- Unsubscribe from marketing communications

**11.8 Lodging Complaints**
If you believe your privacy rights are violated:
- Contact us at privacy@technosthan.com
- File complaint with relevant data protection authority
- We will investigate and respond

**11.9 Exercising Your Rights**
To exercise any rights:
- Use account settings for self-service options
- Email privacy@technosthan.com with request
- Include verification details (email, user ID)
- We will respond within 30 days`,
    },
    {
      id: "children",
      title: "12. Children's Privacy",
      icon: <Shield className="w-5 h-5" />,
      content: `**12.1 Age Restrictions**
- Technosthan AgriTech is not intended for children under 13
- We do not knowingly collect data from children under 13
- Children under 18 may use platform with parental/guardian consent
- Users must be 18+ for certain features (payments, advanced analytics)

**12.2 Parental Consent**
If your child uses our platform:
- You are responsible for providing permission
- You agree to this Privacy Policy on their behalf
- You can contact us to manage their data
- You can request deletion of their information

**12.3 Children's Data Protection**
We take extra care with data from young users:
- Limited data collection compared to adults
- No marketing communications sent to children
- No AI-generated farming recommendations without context
- Educational content prioritized

**12.4 Reporting**
If you believe a child under 13 has provided information:
- Contact us immediately at privacy@technosthan.com
- We will delete such information promptly
- We may take additional protective measures

**12.5 Parental Controls**
Parents/guardians can:
- Monitor their child's account activity
- Restrict certain features
- Control notification settings
- Request account suspension or deletion`,
    },
    {
      id: "international",
      title: "13. International Data Transfers",
      icon: <Eye className="w-5 h-5" />,
      content: `**13.1 Cross-Border Processing**
Your information may be:
- Transferred to countries outside your residence
- Processed on cloud servers in multiple locations
- Shared with international service providers
- Subject to different laws and regulations

**13.2 Data Transfer Mechanisms**
We ensure protection through:
- Standard contractual clauses
- Privacy Shield certification (where applicable)
- Binding Corporate Rules
- Your explicit consent for cross-border transfers

**13.3 Third-Country Data Protection**
Your data transferred to countries with:
- Different privacy standards
- May have different legal protections
- May be subject to government access requests
- You consent to these transfers by using our platform

**13.4 GDPR Compliance (EU/UK)
If you're in EU or UK:
- We comply with GDPR requirements
- You have additional rights under GDPR
- We have lawful basis for data processing
- We maintain data processing agreements with vendors

**13.5 Your Rights**
By accepting this policy, you consent to:
- Processing of personal data
- Transfers to other countries
- Storage on international servers
- Can withdraw consent anytime`,
    },
    {
      id: "cookies",
      title: "14. Cookies & Tracking Technology",
      icon: <Zap className="w-5 h-5" />,
      content: `**14.1 What We Track**
We use cookies and tracking for:
- Session management and login persistence
- Preference and theme saving
- Analytics and usage patterns
- Security and fraud prevention
- User experience improvement

**14.2 Types of Cookies**

Essential Cookies:
- Required for platform functionality
- Cannot be disabled
- Include: authentication, security, session

Functional Cookies:
- Enhance user experience
- Remember user preferences
- Store theme and language settings

Analytics Cookies:
- Track usage patterns and behavior
- Measure platform performance
- Can be disabled in privacy settings

Marketing Cookies:
- Used for targeted recommendations
- Track conversion and engagement
- Can be disabled anytime

**14.3 Cookie Management**
You can:
- Disable cookies in browser settings
- Clear cookies anytime
- Use private/incognito browsing
- Opt-out of analytics tracking
- Note: Some features may not work without cookies

**14.4 Local Storage**
We may store data locally:
- User preferences and settings
- Draft messages and content
- Theme and UI settings
- Offline functionality support

**14.5 Do Not Track Signals**
- We respect Do Not Track browser signals
- We disable analytics when DNT is enabled
- Essential cookies still required for functionality

**14.6 Third-Party Cookies**
Third-party services may set cookies:
- Analytics providers (Google Analytics)
- Payment processors
- Social media integrations
- You can manage these in privacy settings`,
    },
    {
      id: "agriculture",
      title: "15. Agricultural Data & Recommendations",
      icon: <Shield className="w-5 h-5" />,
      content: `**15.1 Agricultural Information Collection**
We may collect:
- Crop type and farming method
- Farm location and size
- Weather patterns and seasonal data
- Soil and irrigation information
- Pest and disease history
- Yield and productivity data

**15.2 Data Usage for Recommendations**
Your agricultural data is used to:
- Generate personalized farming recommendations
- Identify disease and pest patterns
- Optimize crop yield suggestions
- Predict weather impacts
- Improve AI model accuracy
- Conduct agricultural research

**15.3 Disclaimer: Not Professional Advice**
- AI recommendations are suggestions only
- Not professional agricultural, veterinary, or legal advice
- Always consult qualified experts for critical decisions
- Technosthan AgriTech assumes no liability for farming outcomes
- Weather data may be inaccurate or delayed
- Pest identification is AI-based approximation only

**15.4 Accuracy Limitations**
Our AI-generated recommendations:
- Are based on available historical data
- May not account for local variations
- Should be verified with local experts
- May not predict extreme weather events
- Should not replace professional guidance

**15.5 Research & Analytics**
We may use agricultural data for:
- Publishing anonymized research findings
- Creating farming trend reports
- Improving AI models
- Sharing agricultural insights
- Data is fully anonymized and aggregated

**15.6 Sharing Agricultural Data**
Your farming data may be shared with:
- Agricultural research organizations
- Government agencies (anonymized)
- Academic institutions (aggregated only)
- Only when anonymized and with consent
- Never with commercial farming entities for direct marketing

**15.7 Your Agricultural Privacy**
- Your specific farm data is confidential
- Not shared with other farmers
- Not used for competitive analysis
- Not sold to fertilizer/pesticide companies
- Only shared when anonymized and aggregated`,
    },
    {
      id: "changes",
      title: "16. Changes to Privacy Policy",
      icon: <Eye className="w-5 h-5" />,
      content: `**16.1 Policy Updates**
We may update this Privacy Policy:
- To reflect service changes
- To comply with new regulations
- To improve clarity and accuracy
- To enhance user privacy protection

**16.2 Notification of Changes**
When we make material changes:
- We will notify you via email
- Display prominent notice on Platform
- Update "Last Updated" date
- Obtain your consent if required

**16.3 User Acceptance**
By continuing to use Technosthan AgriTech:
- You accept the updated Privacy Policy
- You agree to new terms (if any)
- Your objection may require account deletion

**16.4 Right to Reject**
If you disagree with changes:
- You may delete your account
- Stop using the Platform
- No penalty for discontinuing service

**16.5 Effective Date**
Changes become effective:
- Upon posting to the Platform
- Unless otherwise specified in notification
- Older versions available upon request

**16.6 Archive of Policies**
We maintain:
- Historical versions of this policy
- Archive of previous policies
- Can provide upon request
- Shows evolution of privacy protections`,
    },
    {
      id: "contact",
      title: "17. Contact & Support",
      icon: <Mail className="w-5 h-5" />,
      content: `**17.1 Privacy Questions or Concerns**
Contact us at:
- Email: privacy@technosthan.com
- Support Portal: support.technosthan.com
- In-app Support: Help section of Platform

**17.2 Data Requests**
To request data access, deletion, or portability:
- Email: data-requests@technosthan.com
- Include: Full name, email, request type
- Response within 30 days

**17.3 Complaints & Escalations**
For privacy complaints:
- Email: complaints@technosthan.com
- Include: Details of concern, supporting information
- We will investigate and respond within 15 days

**17.4 Legal & Compliance**
For legal matters:
- Email: legal@technosthan.com
- Formal inquiry requests
- Government inquiries
- Data protection authority requests

**17.5 Mailing Address**
Technosthan AgriTech
Privacy & Compliance Department
[Your Physical Address]
India

**17.6 Response Times**
- General inquiries: 7-10 business days
- Privacy requests: 30 days maximum
- Complaints: 15 days
- Emergency issues: 24 hours

**17.7 Additional Resources**
- Privacy Policy FAQs: learn.technosthan.com/privacy-faq
- Data Protection Guide: technosthan.com/data-guide
- Security Updates: technosthan.com/security
- Community Forums: community.technosthan.com`,
    },
    {
      id: "jurisdiction",
      title: "18. Jurisdiction & Governing Law",
      icon: <Shield className="w-5 h-5" />,
      content: `**18.1 Governing Law**
This Privacy Policy is governed by:
- Laws of India
- Applicable state/local regulations
- International data protection standards

**18.2 Dispute Resolution**
Disputes are resolved through:
- Good faith negotiation (30 days)
- Mediation (if needed)
- Arbitration or court proceedings
- Indian courts have exclusive jurisdiction

**18.3 Regulatory Compliance**
We comply with:
- India's Digital Personal Data Protection Act
- RBI regulations for payment data
- Telecom Regulatory Authority guidelines
- GDPR (for EU residents)
- CCPA (for California residents)

**18.4 Legal Obligations**
We cooperate with:
- Law enforcement agencies
- Government regulatory bodies
- Court-ordered data requests
- Emergency situations affecting safety

**18.5 Conflict of Laws**
If there's conflict between:
- This policy and local laws: local laws apply
- Terms of Service and Privacy Policy: Privacy Policy applies for data handling
- Multiple jurisdictions: most protective standard applies`,
    },
  ];

  const tableOfContents = sections.map((section) => ({
    id: section.id,
    title: section.title,
  }));

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className={`${theme.layout} ${theme.text} transition-colors duration-300 min-h-screen`}
    >
      {/* Header */}
      <div className={`${theme.card} border-b sticky top-0 z-10`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className={`w-8 h-8 ${theme.accent}`} />
            <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className={theme.textSecondary}>
            Effective Date: May 2026 | Technosthan AgriTech
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div
              className={`${theme.card} sticky top-24 p-4 sm:p-6 rounded-xl`}
            >
              <h3 className="font-bold text-lg mb-4">Table of Contents</h3>
              <nav className="space-y-2">
                {tableOfContents.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`block text-sm ${theme.link} hover:text-opacity-80 transition-all text-left truncate`}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {sections.map((section) => (
              <div
                key={section.id}
                id={section.id}
                className={`${theme.card} rounded-xl overflow-hidden`}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full px-6 py-4 flex items-center justify-between hover:opacity-90 transition-opacity ${
                    expandedSections[section.id]
                      ? `bg-green-600/10 dark:bg-green-600/5`
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-green-600 dark:text-green-400">
                      {section.icon}
                    </span>
                    <h2 className="font-bold text-lg">{section.title}</h2>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      expandedSections[section.id] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {expandedSections[section.id] && (
                  <div className={`px-6 py-4 border-t ${theme.border}`}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {section.content.split("\n").map((paragraph, idx) => {
                        if (
                          paragraph.startsWith("**") &&
                          paragraph.endsWith("**")
                        ) {
                          return (
                            <h3 key={idx} className="font-bold mt-4 mb-2">
                              {paragraph.replace(/\*\*/g, "")}
                            </h3>
                          );
                        }
                        if (paragraph.startsWith("- ")) {
                          return (
                            <li key={idx} className="ml-4">
                              {paragraph.substring(2)}
                            </li>
                          );
                        }
                        if (paragraph.trim()) {
                          return (
                            <p
                              key={idx}
                              className={`${theme.textSecondary} mb-3`}
                            >
                              {paragraph}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Final Section */}
            <div
              className={`${theme.card} rounded-xl p-6 bg-gradient-to-r from-green-600/5 to-yellow-600/5 border-2 border-green-600/20`}
            >
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Your Privacy Matters
              </h3>
              <p className={theme.textSecondary}>
                Technosthan AgriTech is committed to protecting your privacy and
                ensuring transparency in how we handle your personal data. If
                you have any questions or concerns about our Privacy Policy,
                please contact us at{" "}
                <a href="mailto:privacy@technosthan.com" className={theme.link}>
                  privacy@technosthan.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`${theme.footer} mt-12 border-t`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center sm:text-left">
            <div>
              <p className={theme.textSecondary}>
                © 2026 Technosthan AgriTech. All rights reserved.
              </p>
            </div>
            <div className="flex justify-center sm:justify-end gap-4">
              <a href="/terms" className={theme.link}>
                Terms of Service
              </a>
              <a href="/contact" className={theme.link}>
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
