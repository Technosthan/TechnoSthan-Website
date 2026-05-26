import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import {
  ChevronDown,
  AlertTriangle,
  FileText,
  Users,
  Lock,
  Zap,
  AlertCircle,
  Scale,
  Shield,
} from "lucide-react";

export default function TermsOfService() {
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
      title: "1. Terms & Conditions - Effective Agreement",
      icon: <FileText className="w-5 h-5" />,
      content: `Welcome to Technosthan AgriTech ("Platform," "we," "us," "our," or "Company").

These Terms of Service (these "Terms") constitute a legally binding agreement between you ("User," "you," or "your") and Technosthan AgriTech regarding your access to and use of the Technosthan AgriTech platform, including our website, mobile applications, AI agricultural assistant, educational content, quiz system, chat functionality, and all related services (collectively, the "Services").

By accessing, browsing, or using Technosthan AgriTech in any way, you:
- Acknowledge that you have read and understood these Terms
- Agree to be legally bound by all provisions
- Represent that you have the authority to enter this agreement
- Accept all terms, conditions, and disclaimers
- Agree to comply with all applicable laws

If you do not agree to these Terms, do NOT access or use the Platform.

**Last Updated:** May 26, 2026
**Effective Date:** May 26, 2026

We reserve the right to modify these Terms at any time. Material changes will be notified via email. Continued use after modifications constitutes acceptance.

**Age Requirement:** You must be 18 years or older (or age of majority in your jurisdiction) to use this Platform. Users under 18 require parental consent.`,
    },
    {
      id: "use",
      title: "2. Acceptable Use & User Responsibilities",
      icon: <Users className="w-5 h-5" />,
      content: `**2.1 Permitted Use**

You may use Technosthan AgriTech only for:
- Accessing agricultural educational content
- Learning about smart farming and agricultural practices
- Interacting with AI agricultural assistant for guidance
- Taking agricultural quizzes and assessments
- Participating in community features (if enabled)
- Managing your account and personal information
- Providing feedback and improving your skills
- Lawful purposes consistent with these Terms

**2.2 Prohibited Conduct**

You agree NOT to:

*Illegal Activities:*
- Use the Platform for any illegal purpose or activity
- Violate any local, state, national, or international law
- Engage in fraud, harassment, or deception
- Promote or facilitate any illegal conduct
- Infringe on intellectual property rights
- Commit or facilitate cybercrime

*Platform Abuse:*
- Attempt to hack, crack, or breach Platform security
- Transmit viruses, malware, or harmful code
- Engage in distributed denial-of-service (DDoS) attacks
- Attempt unauthorized access to Platform systems
- Reverse engineer or decompile Platform code
- Scrape or harvest data from the Platform
- Bypass rate limiting or authentication mechanisms
- Engage in account takeover or credential stuffing

*Content Violations:*
- Upload or transmit obscene, offensive, or hateful content
- Share child exploitation material or CSAM
- Post content containing threats or violence
- Share explicit sexual content
- Harass, bully, or abuse other users
- Defame or spread false information about individuals
- Post spam or unsolicited commercial material
- Impersonate other users or organizations

*Intellectual Property Abuse:*
- Copy and republish Platform content without permission
- Use Platform content for commercial purposes
- Sell or redistribute Platform materials
- Plagiarize agricultural content or solutions
- Use quiz answers commercially
- Share copyrighted agricultural materials
- Violate third-party intellectual property rights

*Account Misuse:*
- Create multiple accounts to circumvent restrictions
- Share account credentials with others
- Sell or transfer account access
- Use another person's account
- Create bot accounts or automated access
- Use accounts to manipulate Platform features
- Attempt account takeover of other users

**2.3 Your Personal Responsibility**

You are responsible for:
- Maintaining account security and password confidentiality
- All activities occurring under your account
- Monitoring account activity for unauthorized access
- Immediately reporting unauthorized access or security breaches
- Complying with all applicable laws and regulations
- Ensuring your use is lawful and ethical
- Respecting other users' rights and privacy
- Verifying agricultural information independently

**2.4 Monitoring & Enforcement**

We reserve the right to:
- Monitor user activity for Terms violations
- Remove content that violates these Terms
- Suspend or terminate accounts engaging in abuse
- Report illegal activities to law enforcement
- Cooperate with legal investigations
- Take preventive security measures
- Modify or restrict features to prevent abuse

**2.5 Suspension & Account Termination**

We may suspend or terminate your account immediately if you:
- Violate these Terms of Service
- Engage in illegal activity
- Abuse Platform resources or other users
- Pose security or safety risks
- Violate our Acceptable Use Policy
- Attempt to circumvent security measures
- Exceed usage limitations repeatedly
- Fail to maintain valid contact information

Account termination results in:
- Immediate loss of Platform access
- Deletion of account data (within 90 days)
- Forfeiture of any credits or payments
- Potential legal action if applicable
- Permanent ban if severe violations`,
    },
    {
      id: "ai",
      title: "3. AI-Generated Responses & Disclaimers",
      icon: <Zap className="w-5 h-5" />,
      content: `**3.1 Nature of AI Assistance**

Technosthan AgriTech provides AI-powered agricultural guidance through:
- AI-generated recommendations and suggestions
- Automated agricultural analysis and insights
- Pattern recognition for farming challenges
- Predictive modeling for crop outcomes
- Personalized farming guidance

These responses are generated by artificial intelligence, NOT human experts.

**3.2 CRITICAL: AI Limitations & Accuracy Disclaimer**

⚠️ **IMPORTANT - READ CAREFULLY** ⚠️

**AI-Generated Responses Are NOT Professional Advice:**

The AI agricultural assistant provides informational content for educational purposes only. AI responses are NOT:
- Professional agricultural or agronomic advice
- Veterinary or animal health guidance
- Legal or compliance guidance
- Official government agricultural recommendations
- Certified or verified information

**Accuracy & Reliability:**
- AI predictions are probabilistic estimates, NOT definitive
- Weather forecasting is approximate, NOT guaranteed accurate
- Pest/disease identification is probabilistic, NOT diagnostic
- Yield predictions may vary significantly from actual results
- Market price forecasts are speculative, NOT binding
- Soil analysis is general, NOT based on soil testing
- Plant identifications require confirmation by experts

**AI Limitations:**
- Cannot account for all regional and local variations
- Cannot consider all farm-specific variables
- May contain outdated or inaccurate information
- May provide contradictory advice on edge cases
- Cannot replace professional expertise
- May have training data limitations
- Cannot access real-time farm conditions
- Cannot perform laboratory testing or analysis

**What You Must Do:**
ALWAYS:
- Verify AI recommendations independently
- Consult qualified agricultural experts for critical decisions
- Perform your own due diligence before implementing advice
- Test recommendations on small areas before full-scale application
- Maintain professional agricultural consultations
- Use proper diagnostic tools and soil testing
- Consider local climate and regional factors
- Document your decisions and results

**3.3 Agricultural Guidance Disclaimer**

⚠️ **CRITICAL RESPONSIBILITY NOTICE** ⚠️

**You Assume All Risk:**

Any farming decisions made based on AI recommendations are entirely your responsibility. You:
- Assume full responsibility for implementing recommendations
- Accept all financial risks from farming decisions
- Acknowledge that crops may fail or yield less than expected
- Understand pest or disease outbreaks may occur
- Accept market price fluctuations
- Acknowledge weather unpredictability
- Understand farm-specific variables we cannot account for

**Technosthan AgriTech Is NOT Liable For:**
- Crop failures or yield reductions
- Plant diseases or pest infestations
- Market price changes or financial losses
- Soil degradation or fertility issues
- Water quality or irrigation problems
- Livestock health issues (if applicable)
- Environmental or climate-related damage
- Any damages from implementing AI recommendations
- Incorrect plant/pest identification
- Inaccurate weather predictions
- Failed fertilizer applications
- Incorrect pesticide applications
- Regulatory violations based on AI advice

**Professional Consultation Required For:**
- Major farming practice changes
- High-value crop decisions
- Livestock health concerns
- Soil amendment decisions
- Pesticide or herbicide applications
- Irrigation system changes
- Crop variety selection
- Certification or compliance matters

**3.4 When to Consult Professionals**

MUST consult qualified professionals for:
- Crop diseases or pest infestations (agricultural extension)
- Livestock health concerns (veterinarian)
- Soil health (soil scientist or lab testing)
- Irrigation design (irrigation engineer)
- Significant financial investments (agricultural advisor)
- Regulatory compliance (agricultural authority)
- Organic/certification requirements (certifying body)
- Insurance or financial matters (insurance agent)

**3.5 AI Model Information**

Our AI uses:
- Google Gemini/Vertex AI for agricultural queries
- Machine learning models trained on agricultural data
- Regional agriculture knowledge bases
- General agricultural best practices

The AI:
- Is NOT specialized in your specific region
- May not have access to current crop prices
- May not reflect new agricultural technologies
- May have limitations in certain crop types
- May be less accurate for niche farming practices

**3.6 Limitation of Liability for AI Services**

To the maximum extent permitted by law:
- Technosthan AgriTech's total liability for AI-related issues is limited to refund of fees paid
- We are NOT liable for consequential, indirect, or punitive damages
- We are NOT liable for lost profits or business interruption
- We are NOT liable for crop failures or losses
- We are NOT liable for incorrect AI recommendations
- These limitations apply regardless of cause (negligence, contract, etc.)

**3.7 AI Data Usage & Training**

Your chat data is used to:
- Improve AI accuracy and performance
- Train agricultural models (with anonymization)
- Develop better recommendations
- Conduct agricultural research
- Improve platform features

You can opt-out through privacy settings, but this may reduce AI accuracy for your account.`,
    },
    {
      id: "content",
      title: "4. Educational Content & User Responsibilities",
      icon: <AlertCircle className="w-5 h-5" />,
      content: `**4.1 Educational Content Disclaimer**

All educational materials on Technosthan AgriTech are provided for informational purposes:

*Content is:*
- Based on general agricultural knowledge
- Not specific to your region or conditions
- Subject to change and updates
- Compiled from various sources
- For self-education only

*Content is NOT:*
- Professional advice or guidance
- Certified or verified by authorities
- Guaranteed accurate or complete
- Suitable for all farming situations
- Replacement for professional consultation
- Official government guidance

**4.2 Content Accuracy & Updates**

We strive to maintain accurate content, but:
- Agricultural science is constantly evolving
- Content may become outdated
- New research may contradict older content
- Regional variations may apply
- Content is continuously updated

You should:
- Verify content with current sources
- Check for content update dates
- Consult professionals for critical decisions
- Adapt content to your specific situation
- Review multiple sources

**4.3 Quiz & Assessment Disclaimers**

Quizzes on the Platform:
- Are self-assessment tools only
- Do not certify agricultural knowledge
- Are not recognized credentials
- Do not qualify you as an expert
- Results are for personal learning only
- Scores should not be used professionally
- Are subject to copyright by creators

Quiz scores:
- Are stored for your learning progress
- May be visible to other users (unless private)
- Do not represent official certification
- Should not be claimed as credentials
- Are for your personal knowledge assessment

**4.4 Content Ownership & Attribution**

Technosthan AgriTech owns:
- Platform design and functionality
- Original educational content created by us
- Quiz questions and answers
- AI models and algorithms
- Branding and trademarks

You:
- Cannot claim ownership of Platform content
- Cannot republish Platform content commercially
- Cannot modify and resell content
- Can use content for personal, non-commercial learning
- Must attribute content to Technosthan AgriTech if sharing
- Cannot use content for professional services without permission

**4.5 Content Corrections & Removal**

We may:
- Update or correct inaccurate content
- Remove content that violates intellectual property rights
- Delete content from non-verified sources
- Update content as agricultural science evolves
- Remove content reported by users as problematic

We will notify of significant changes when possible.

**4.6 User-Generated Content (if applicable)**

If the Platform allows you to post content:

*You grant us:*
- License to use, display, and distribute your content
- Right to modify content for formatting
- Right to remove content violating Terms
- Right to use content for Platform improvement

*You warrant:*
- You own or have permission for content
- Content does not violate intellectual property rights
- Content is accurate and truthful
- Content does not violate any laws
- Content is appropriate and not offensive

**4.7 No Endorsement**

Content shared by users:
- Does not represent our endorsement
- Is the user's own opinion and responsibility
- We are not liable for user-generated content
- May be removed if it violates Terms
- Should not be considered professional advice

**4.8 Copyright & Attribution**

All Platform content is copyrighted by:
- Technosthan AgriTech (original content)
- Content creators (if using third-party content)
- Content providers (images, research, data)

Using content without permission:
- Violates copyright law
- May result in account termination
- May result in legal action
- May result in DMCA takedown notices
- Is subject to damages under law

**4.9 Content Accessibility**

We work to make content accessible:
- Mobile responsive design
- Readable text formatting
- Clear navigation
- Multiple content formats (text, images, video)
- However, accessibility is not guaranteed

If you encounter accessibility issues, contact us at:
accessibility@technosthan.com`,
    },
    {
      id: "community",
      title: "5. Community Standards & User Interactions",
      icon: <Users className="w-5 h-5" />,
      content: `**5.1 Community Conduct Standards**

To maintain a positive community, users must:

*Treat Others with Respect:*
- Be civil and courteous in all interactions
- Respect differing opinions and backgrounds
- Do not harass, bully, or abuse other users
- Do not discriminate based on protected characteristics
- Do not make threats or violent statements
- Report problematic behavior to administrators

*Keep Content Appropriate:*
- Do not post explicit sexual content
- Do not post hate speech or bigoted content
- Do not post graphic violence or gore
- Do not post content promoting harm
- Do not share misinformation deliberately
- Do not post spam or commercial promotions

*Protect Platform Integrity:*
- Do not create fake accounts or impersonate others
- Do not manipulate voting or rating systems
- Do not spam with repeated messages
- Do not coordinate mass reporting to silence users
- Do not attempt to overwhelm Platform services
- Do not exploit technical vulnerabilities

**5.2 Moderation & Content Removal**

We reserve the right to:
- Remove content violating community standards
- Suspend users for repeated violations
- Delete posts containing spam or abuse
- Hide or label misinformation
- Restrict user posting privileges
- Moderate comments and discussions
- Enforce community guidelines

Reasons for removal include:
- Harassment or bullying
- Hate speech or discrimination
- Misinformation or disinformation
- Commercial or promotional content
- Technical violations or spam
- Copyright infringement
- Child safety violations

**5.3 Reporting & Dispute Resolution**

To report problematic content or users:
- Use in-app reporting tools
- Email: support@technosthan.com
- Provide specific details and evidence
- We will investigate within 5 business days
- Action will be taken if terms violated

If you believe content was removed incorrectly:
- Submit an appeal with explanation
- We will review the decision
- Reinstated if determination was wrong
- Appeals reviewed within 10 business days

**5.4 Forum & Discussion Guidelines**

For discussion forums or comments (if available):

Users should:
- Stay on topic for discussions
- Provide constructive feedback
- Back up claims with sources
- Respect diverse viewpoints
- Not spam or flood discussions
- Follow community guidelines
- Report violations to moderators

We will:
- Monitor discussions for violations
- Remove off-topic or spam content
- Enforce community standards
- Protect user safety
- Ban repeat violators

**5.5 User Interactions & No Liability**

Technosthan AgriTech:
- Is not liable for user interactions
- Does not guarantee user behavior
- Does not vet user credentials
- Does not monitor all user-to-user interactions
- Is not responsible for personal disputes
- Recommends users exercise caution online

Use the same judgment you would with strangers.

**5.6 Contact & Information Sharing**

Users should:
- NOT share personal contact information
- NOT share phone numbers or addresses
- NOT meet other users in person based on Platform interactions
- NOT engage in financial transactions
- Use secure communication channels only
- Report suspicious users to moderators
- Block users making you uncomfortable

Technosthan AgriTech:
- Cannot mediate personal disputes
- Cannot help recover personal information shared
- Cannot reverse transactions between users
- Cannot guarantee user authenticity

**5.7 Admin Rights & Actions**

Administrators and moderators:
- Have authority to enforce community standards
- Can remove content without notice in extreme cases
- Can ban users for serious violations
- Can monitor user activity
- Can collect evidence of violations
- Are not liable for moderation decisions

Moderator actions may be appealed through official channels.`,
    },
    {
      id: "intellectual",
      title: "6. Intellectual Property Rights",
      icon: <Shield className="w-5 h-5" />,
      content: `**6.1 Platform Intellectual Property**

Technosthan AgriTech owns all intellectual property of:
- Platform design and user interface
- Source code and algorithms (proprietary)
- Original educational content
- Quiz questions and answers
- AI models and training data
- Graphics, images, and media
- Branding, logos, and trademarks
- Database content and organization
- Trading names and service marks

All rights are reserved except as explicitly granted.

**6.2 License Grant to Users**

We grant you a limited, non-exclusive license to:
- Access and view Platform content
- Use content for personal, non-commercial learning
- Download content for offline personal use (if enabled)
- Use Platform features as intended
- Create personal study notes from content

This license does NOT permit you to:
- Copy content for redistribution
- Modify or adapt Platform content
- Create derivative works
- Sell or commercialize content
- Republish content online
- Use content for professional services
- Remove copyright or attribution notices
- Reverse engineer Platform code

**6.3 Your Content Ownership**

Content you create:
- Remains your property (your quiz responses, comments, profile info)
- Is licensed to us for Platform operation
- May be used by us to improve services
- May be anonymized and used for research
- Should not include third-party copyrighted material
- May be visible to other users
- May be deleted if it violates Terms

You grant us the right to:
- Display your content on the Platform
- Modify formatting and presentation
- Analyze content for improvement
- Use anonymized content for research
- Archive your content
- Remove content at our discretion

**6.4 Copyright Infringement & DMCA**

If you believe your copyright is infringed:
1. Prepare a DMCA takedown notice with:
   - Your contact information
   - Specific content URL or description
   - Assertion that content is infringing
   - Assertion that assertion is made in good faith
   - Your physical signature (or electronic signature)
2. Email to: copyright@technosthan.com
3. Include statement that you consent to jurisdiction
4. We will investigate and respond within 10 business days

For false DMCA claims:
- Legal action may be taken against you
- You may be liable for damages
- Your account may be terminated
- Criminal liability may apply

**6.5 Third-Party Content & Attribution**

The Platform may include:
- Content from third-party sources
- Third-party images and graphics
- Research and data from publications
- Third-party educational materials

Proper attribution is provided where applicable.

**6.6 Trademark Usage**

You may NOT:
- Use our trademarks without permission
- Use similar trademarks that cause confusion
- Claim to be endorsed or affiliated without permission
- Use trademarks in domain names
- Use trademarks in business names
- Register trademarks confusingly similar to ours
- Use trademarks in a way that dilutes them

**6.7 Open Source Compliance**

If Platform uses open-source software:
- Open-source licenses are respected
- Attribution is provided where required
- Software is used in compliance with licenses
- Third-party license terms apply to that software
- No representations are made for third-party software

Open-source license information available upon request.

**6.8 No License for Commercial Use**

Except as explicitly granted:
- No license for commercial use
- No right to build commercial products
- No right to use Platform for business services
- No right to incorporate content into products
- No right to use for competing services
- Commercial licensing available separately`,
    },
    {
      id: "liability",
      title: "7. Limitation of Liability",
      icon: <AlertTriangle className="w-5 h-5" />,
      content: `**7.1 Disclaimer of Warranties**

THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE":

We make NO warranties that:
- Platform is error-free or uninterrupted
- Platform is secure or malware-free
- Platform is fit for your specific purpose
- Content is accurate or up-to-date
- AI recommendations are correct
- Services will meet your expectations
- Features will always be available

We disclaim:
- All implied warranties of merchantability
- All implied warranties of fitness for purpose
- All implied warranties of title or ownership
- All warranties of non-infringement
- All implied warranties whatsoever
- Any warranty not explicitly stated

**7.2 Limitation of Damages**

To the maximum extent permitted by law:

Our total liability is limited to:
- Refund of fees paid in the last 30 days
- OR $100, whichever is greater
- We are NOT liable for any amount above this

We are NOT liable for:
- Consequential damages (damage resulting from use)
- Indirect damages (lost profits, lost revenue)
- Incidental damages (temporary losses)
- Punitive damages (punishment)
- Special damages (specific to your situation)
- Lost profits or lost revenue
- Lost business opportunity
- Lost reputation or goodwill
- Lost data or information
- Business interruption
- Any damages regardless of cause

This applies even if:
- We were advised of damages possibility
- Damages were foreseeable
- You gave us prior notice
- Damages resulted from negligence
- Damages resulted from breach of contract

These limitations apply to maximum extent permitted by law.

**7.3 Assumption of Risk**

You assume all risk of:
- Data loss from Platform use
- Incorrect information
- Harmful third-party content
- AI recommendation errors
- System downtime or failures
- Security breaches (not from our gross negligence)
- Your device damage or data loss
- Any outcomes from Platform use

**7.4 Third-Party Services & Content**

We are NOT liable for:
- Third-party service providers (email, SMS, cloud)
- Third-party content (images, data, research)
- Third-party links or external websites
- Third-party applications or integrations
- Third-party payment processors
- Third-party AI services
- Actions of third-party organizations

Third-party terms and privacy policies apply to their services.

**7.5 No Liability for User Content**

Technosthan AgriTech is NOT liable for:
- User-generated content
- Comments or posts by users
- Information from other users
- Disputes between users
- User interactions or communications
- User conduct or behavior
- Actions of other users

**7.6 Service Availability & Interruptions**

We are NOT liable for:
- Service interruptions or downtime
- Scheduled maintenance windows
- Planned outages
- Unplanned outages
- Data loss during service disruptions
- Feature unavailability
- Partial service degradation
- Connection failures

We provide services on best-effort basis.

**7.7 No Liability for Hacking (With Exceptions)**

We are NOT liable for:
- Unauthorized access to your account (if password was yours)
- Data breaches due to user negligence
- Credentials shared or compromised by user
- Phishing attacks targeting you
- Malware on your device

We ARE liable for:
- Breaches due to our security negligence
- Our failure to implement reasonable security
- Our failure to disclose known vulnerabilities
- Negligent security practices
- Failure to encrypt sensitive data

**7.8 Fitness for AI Recommendations**

Technosthan AgriTech is NOT liable for:
- AI recommendation errors or inaccuracy
- Agricultural outcomes based on recommendations
- Crop failures related to AI advice
- Financial losses from recommendations
- Implementation of AI suggestions
- Reliance on AI guidance
- Any damages from AI-generated content

AI is provided for educational information only.

**7.9 Force Majeure**

We are NOT liable for failures due to:
- Natural disasters
- Acts of war or terrorism
- Government actions or sanctions
- Pandemics or epidemics
- Internet infrastructure failures
- Power outages
- Third-party attacks (DDoS)
- Any event beyond our reasonable control

**7.10 Governing Limitations**

These limitations apply:
- In all circumstances
- Regardless of cause of action
- Regardless of legal theory
- Whether in contract or tort
- Whether due to negligence or breach
- To the extent permitted by law

Some jurisdictions do not allow limitation of liability, so some limitations may not apply to you.

**7.11 Survival**

These limitations survive:
- Account termination
- Platform closure
- Bankruptcy
- Liquidation
- Reorganization
- End of these Terms`,
    },
    {
      id: "payment",
      title: "8. Payments & Billing",
      icon: <Zap className="w-5 h-5" />,
      content: `**8.1 Paid Features & Services**

Some Platform features may require payment:
- Premium educational content (if offered)
- Certifications or badges
- Advanced AI features
- Commercial use licenses
- API access

Free features remain available to all users.

**8.2 Payment Processing**

When you purchase:
- You authorize payment from your chosen method
- Payment is processed by third-party providers
- Your financial information is securely transmitted
- You receive confirmation email
- Payment policy applies to transactions

You acknowledge:
- You have authority to make payment
- All payment information is accurate
- You accept charges to your payment method
- You understand refund policy

**8.3 Billing & Charges**

*Recurring Subscriptions (if applicable):*
- Initial charge occurs on purchase date
- Subsequent charges occur on renewal date
- Charges continue until cancellation
- You will be notified before charges
- No charge without your authorization

*One-Time Purchases:*
- Single charge occurs upon purchase
- No recurring charges
- Payment is non-refundable unless otherwise stated

**8.4 Refund Policy**

*Refunds are available for:*
- Requests within 14 days of purchase
- Non-use of services or features
- Technical failures preventing use
- Our failure to provide service

*Refunds are NOT available for:*
- Services fully used or accessed
- Partial service use
- Subscription periods more than 14 days old
- Purchased discounted items (final sale)
- User-initiated cancellations after significant use

*Refund Process:*
1. Submit refund request to: billing@technosthan.com
2. Include order number and reason
3. We respond within 10 business days
4. Approved refunds process within 5-7 business days
5. Refund returns to original payment method

**8.5 Subscription Management**

For recurring subscriptions:
- Cancel anytime through account settings
- Or email: billing@technosthan.com
- Cancellation effective at period end
- No prorated refunds for partial months
- Access continues until period end
- Auto-renewal is disabled upon cancellation

**8.6 Payment Method Updates**

You can:
- Update payment method in account settings
- Change billing address
- Modify recurring payment details
- Provide alternative payment method
- Stop using saved payment method

Failed payment:
- We attempt payment multiple times
- Access may be suspended if payment fails
- We notify you of payment failure
- You have 15 days to update payment method

**8.7 Taxes & Fees**

You are responsible for:
- Sales tax based on your location
- VAT or GST where applicable
- Any payment processor fees
- Government fees or duties

Taxes are:
- Calculated at checkout
- Added to your total charge
- Separated on your invoice
- Our responsibility to collect where required

**8.8 Pricing Changes**

We reserve right to:
- Change prices for new users
- Change prices for renewals (with notice)
- Discontinue features or services
- Modify service offerings
- Create new pricing tiers

*For existing subscriptions:*
- Price changes take effect at renewal
- We notify you 30 days in advance
- You can cancel before new price applies
- Continued use means acceptance of new price

**8.9 No Refund for Account Termination**

If your account is terminated for:
- Terms violation
- Abusive conduct
- Illegal activity
- Policy breach

Then:
- No refund is provided
- All payments are forfeited
- Services are immediately discontinued
- This is non-negotiable

**8.10 Billing Disputes**

To dispute a charge:
1. Email: billing@technosthan.com
2. Include order number and reason
3. Provide any supporting documentation
4. Include your preferred resolution
5. We respond within 15 business days

If unresolved, you can:
- File dispute with your payment provider
- Contact consumer protection agency
- Pursue legal action if applicable

**8.11 Aggregate Spending Limits**

We may:
- Implement spending limits for security
- Require additional verification for large purchases
- Restrict frequency of transactions
- Apply fraud detection measures
- Decline suspicious transactions

This is for your protection.

**8.12 Financial Responsibility**

You are financially responsible for:
- All charges to your account
- All unauthorized access you failed to prevent
- All transactions made from your account
- All fees and taxes incurred

Unauthorized charges:
- Report immediately to billing@technosthan.com
- Provide evidence of unauthorized access
- We investigate within 10 business days
- Reversed if unauthorized`,
    },
    {
      id: "termination",
      title: "9. Account Termination & Service Discontinuation",
      icon: <AlertCircle className="w-5 h-5" />,
      content: `**9.1 Account Termination by You**

You can terminate your account:
- Login and select "Delete Account"
- Email support@technosthan.com
- Complete any required verification
- Confirm deletion (irreversible)

Account deletion results in:
- Immediate loss of Platform access
- Data anonymization within 30 days
- Complete purge within 90 days
- Loss of any credits or unused features
- Profile and content removed

Before deletion:
- Download your data if needed
- Backup any important information
- Cancel any active subscriptions
- Resolve any outstanding issues

**9.2 Account Termination by Us**

We may terminate your account for:

*Policy Violations:*
- Violating these Terms
- Violating Acceptable Use Policy
- Engaging in prohibited conduct
- Repeated violations after warning
- Single severe violation

*Abusive Behavior:*
- Harassing or threatening users
- Posting illegal or harmful content
- Engaging in discrimination or hate speech
- Cyberbullying or defamation
- Engaging in fraud or scams

*Illegal Activity:*
- Using Platform for illegal purposes
- Violating applicable laws
- Providing false identification
- Money laundering or financing
- Child exploitation or abuse
- Terrorist activity or financing

*Security Threats:*
- Attempting unauthorized access
- Transmitting malware
- Launching cyberattacks
- Compromising Platform security
- Circumventing security measures
- Engaging in hacking

*Financial Issues:*
- Repeated payment failures
- Fraudulent charges
- Chargeback disputes
- Non-payment of services
- Exceeding spending limits

Termination by us:
- May be immediate without notice
- May be with notice for minor violations
- Results in complete access loss
- Is typically permanent
- May result in legal action
- May result in law enforcement referral

**9.3 Suspension vs. Termination**

*Suspension:*
- Temporary loss of access (usually 24 hours - 30 days)
- Account data is preserved
- May be lifted if issue is resolved
- Used for warnings or minor violations
- Email sent explaining reason

*Termination:*
- Permanent loss of access
- Account deletion within 90 days
- Cannot be reversed
- Used for serious violations
- Legal action may follow

**9.4 Effect of Termination**

Upon account termination:
- You cannot access Platform
- Your account is deleted
- Your data is anonymized/purged
- Your content is removed
- Your profile is deleted
- No refunds are provided
- Any credits are forfeited
- Any paid subscriptions are cancelled

**9.5 Data After Termination**

Your data after termination:
- Personal information: anonymized within 30 days
- Account data: completely purged within 90 days
- Chat history: anonymized for AI improvement
- Aggregated data: retained indefinitely (anonymized)
- Backup copies: deleted per retention schedule
- Third-party copies: may persist beyond our control

You cannot recover data after deletion.

**9.6 Termination Appeals**

If you believe termination was wrong:
1. Email: support@technosthan.com
2. Explain why termination was unjust
3. Provide supporting evidence
4. Include your account details
5. Response within 10 business days

Appeals are limited to clear policy violations.

**9.7 Reactivation After Suspension**

If your account is suspended:
- You may request reactivation
- Email: support@technosthan.com
- Explain steps taken to comply
- Provide commitment to follow Terms
- We may require password reset
- Reactivation reviewed within 5 business days

Reactivation is discretionary and not guaranteed.

**9.8 Permanent Bans**

Permanent bans result from:
- Multiple severe violations
- Criminal activity
- Ongoing abuse pattern
- Repeated terminations
- Threats or violence
- Child safety violations

Permanently banned users:
- Cannot create new accounts
- Cannot regain access
- Are reported to authorities if needed
- Cannot appeal decision (typically)
- May face legal consequences

**9.9 Service Discontinuation**

We may discontinue the Platform or services:
- By providing 90 days notice
- By continuing to provide notice
- By providing alternative services
- By refunding prepaid fees (pro-rata)
- At our sole discretion

During discontinuation period:
- Platform remains accessible
- Services continue normally
- You can export your data
- You can request refund
- New signups may be disabled

After discontinuation:
- Platform becomes inaccessible
- Data is deleted per retention schedule
- No refunds after grace period
- All services end

**9.10 Survival After Termination**

These provisions survive account termination:
- Limitation of liability
- Indemnification
- Intellectual property rights
- Confidentiality
- Payment obligations
- Dispute resolution
- Governing law`,
    },
    {
      id: "dispute",
      title: "10. Dispute Resolution & Binding Arbitration",
      icon: <Scale className="w-5 h-5" />,
      content: `**10.1 Informal Resolution**

If you have a dispute:
1. Contact us first at: support@technosthan.com
2. Describe the issue in detail
3. Propose a resolution
4. Provide supporting documentation
5. We respond within 15 business days
6. Good faith discussion occurs
7. We attempt to reach mutual resolution

Most disputes are resolved informally.

**10.2 Escalation Process**

If not resolved informally:
1. Request escalation to management
2. Email: disputes@technosthan.com
3. Provide previous correspondence
4. Explain why informal resolution failed
5. Management reviews within 10 business days
6. Further discussion or mediation offered

**10.3 Binding Arbitration**

For disputes not resolved through above:

*ARBITRATION CLAUSE:*
"You and Technosthan AgriTech agree to resolve any dispute arising out of or relating to these Terms through final and binding arbitration, except as provided below.

You agree that any claim or dispute:
- Arises out of these Terms or Platform
- Is a legal action or proceeding
- Includes contract, tort, statute, or other basis
- Must be resolved through arbitration
- Cannot be resolved in court
- Cannot be resolved by jury
- Cannot be part of class action

Arbitration is:
- Final and binding
- Conducted before neutral arbitrator
- Held in English language
- Based on applicable law
- Quicker than court
- Less expensive than litigation
- Private proceedings"

**10.4 Arbitration Process**

Arbitration will:
- Be conducted by neutral arbitrator
- Follow rules of American Arbitration Association (AAA)
- Be held in [Your Jurisdiction] or mutually agreed location
- Be conducted via phone, video, or in-person
- Result in written decision within 30 days of hearing
- Be final and enforceable by courts

*Arbitration costs:*
- Each party bears own costs
- Arbitration fees split equally
- If award is in your favor, we pay fees
- If award is against you, you pay fees
- No frivolous claims

**10.5 Exceptions to Arbitration**

These disputes are NOT subject to arbitration:
- Claims in small claims court
- Claims under $25,000 (may choose court)
- Intellectual property infringement
- Urgent injunctive relief needed
- Equitable relief
- Claims by us for non-payment (may use court)

**10.6 Statute of Limitations**

All claims must be:
- Filed within 2 years of when dispute arose
- Subject to applicable statutes of limitation
- Not revived after expiration
- Time-barred after statute expires

**10.7 Class Action Waiver**

You and we agree:
- NO class actions or consolidated claims
- Disputes are individual only
- Cannot be arbitrated as class action
- Each person arbitrates separately
- Arbitrator cannot combine claims

**10.8 Injunctive Relief**

We may seek immediate injunctive relief:
- For intellectual property violation
- For breach of confidentiality
- For security threat
- For irreparable harm
- This does not waive arbitration for damages

**10.9 Confidentiality of Arbitration**

Arbitration proceedings:
- Are confidential
- Results are not public
- Communications are private
- Award details remain confidential
- Parties may disclose award to limited parties

**10.10 Governing Law**

These Terms are governed by:
- Laws of [Your Jurisdiction]
- Without regard to conflict of laws
- Applicable federal law
- Local laws of your jurisdiction may apply
- International laws apply for international users

For international users:
- Your local consumer protection laws apply
- Mandatory local laws are respected
- Additional protections may apply
- Most favorable law applies

**10.11 Waiver of Jury Trial**

You and we waive:
- Right to jury trial
- Right to trial by jury
- Right to appeal jury verdict
- Right to judicial review in most cases
- Disputes resolved by arbitration only

**10.12 Right to Opt-Out**

You can opt-out of arbitration:
- Within 30 days of accepting Terms
- Email: optout@technosthan.com
- Include "Arbitration Opt-Out" in subject
- Provide your name and email
- After opt-out, normal courts apply
- This is your only opt-out right`,
    },
    {
      id: "general",
      title: "11. General Provisions",
      icon: <FileText className="w-5 h-5" />,
      content: `**11.1 Entire Agreement**

These Terms:
- Constitute the entire agreement
- Replace all prior agreements
- Include all modifications
- Cannot be altered orally
- Supersede all previous understandings
- Are the complete agreement

**11.2 Severability**

If any provision is invalid:
- That provision is severed
- Remaining Terms continue
- Terms modified minimally to make valid
- Intent of parties is preserved
- Invalid provision is reformed if possible

**11.3 Waiver**

If we don't enforce a provision:
- This is not a waiver of the provision
- Future enforcement is not waived
- Must be in writing to be valid
- Applies only to specific instance
- Does not excuse future violations

**11.4 Amendments & Modifications**

We may modify Terms:
- By posting revised Terms
- By email notification
- By notification via Platform
- Effective date is specified
- Continued use means acceptance

Material changes:
- At least 30 days notice
- Your opportunity to reject
- Can cancel without penalty

**11.5 Relationship Between Parties**

You and Technosthan AgriTech:
- Are independent parties
- Do not form partnership
- Do not form agency
- Do not form joint venture
- Do not authorize each other
- Have no authority to bind each other

**11.6 No Third-Party Beneficiaries**

These Terms:
- Are between you and us
- Create no third-party rights
- Cannot be enforced by third parties
- Do not benefit any third party
- Are solely between the parties

**11.7 Notices**

We notify you via:
- Email to registered address
- In-app notifications
- Platform announcements
- Posted notices
- SMS (for critical issues)

You notify us via:
- Email: support@technosthan.com
- Address: [Your Company Address]
- In-app support form

Notices are effective when sent.

**11.8 Assignment**

You cannot:
- Assign these Terms
- Transfer your account
- Delegate your obligations
- Assign your rights

We can:
- Assign to successors
- Assign to acquirers
- Assign in merger/acquisition
- Assign with notice

**11.9 Force Majeure**

We are not liable for:
- Events beyond our control
- Natural disasters
- War or terrorism
- Pandemic or epidemic
- Strikes or labor issues
- Government actions
- Internet infrastructure failure
- Third-party attacks

**11.10 Construction**

These Terms:
- Are not interpreted against drafter
- Are interpreted fairly
- Are interpreted by applicable law
- Headings are not restrictive
- Use of "or" is inclusive
- "Including" does not limit

**11.11 Export Compliance**

You agree to comply with:
- US export control laws
- International trade restrictions
- Sanctions and embargoes
- Local export regulations
- Technology transfer restrictions

We reserve right to refuse service based on export laws.

**11.12 Survival**

These provisions survive termination:
- Limitation of liability
- Indemnification
- Intellectual property
- Confidentiality
- Dispute resolution
- Governing law
- Acceptable use restrictions
- Any provision intended to survive`,
    },
    {
      id: "contact",
      title: "12. Contact & Legal Information",
      icon: <AlertCircle className="w-5 h-5" />,
      content: `**12.1 Contact Information**

For general inquiries:
**Email:** support@technosthan.com
**Response Time:** 24-48 hours

For legal notices:
**Email:** legal@technosthan.com
**Response Time:** Within 10 business days

For disputes or escalations:
**Email:** disputes@technosthan.com
**Response Time:** Within 15 business days

For urgent issues:
**Email:** support@technosthan.com
**Subject:** [URGENT]

**12.2 Legal Contact**

Registered Business Name:
**Technosthan AgriTech**

Business Address:
[Your Company Address]

Jurisdiction:
[Your Legal Jurisdiction]

Registered Agent:
[Your Registered Agent Name]

**12.3 Support Resources**

**Help Center:** https://www.technosthan.com/help
**FAQ:** https://www.technosthan.com/faq
**Documentation:** https://www.technosthan.com/docs
**Community Forum:** https://community.technosthan.com

**12.4 Feedback & Suggestions**

We welcome feedback:
**Email:** feedback@technosthan.com
- Include specific suggestions
- Provide context
- Explain your use case
- Suggest improvements
- Help us improve Platform

**12.5 Press & Media**

For media inquiries:
**Email:** media@technosthan.com
**Response Time:** Within 2 business days

**12.6 Security Issues**

For security vulnerabilities:
**Email:** security@technosthan.com
- Responsible disclosure
- Do not publicly disclose
- Allow 90 days to respond
- Legal protection for good faith reporters

**12.7 Copyright Claims**

For DMCA claims:
**Email:** copyright@technosthan.com
- Include detailed information
- Include copyrighted work details
- Include assertion of infringement
- Include counter-notification if applicable

**12.8 Accessibility Issues**

For accessibility concerns:
**Email:** accessibility@technosthan.com
- Describe accessibility issue
- Include how we can help
- Suggest accommodations
- We respond within 5 business days

**12.9 Updates & Communication**

By using Platform, you agree to:
- Receive service updates
- Receive security notifications
- Receive mandatory notices
- Receive policy changes
- You may opt-out of non-mandatory communications

**12.10 Agreement Acceptance**

By using Technosthan AgriTech, you:
- Accept these Terms of Service
- Accept our Privacy Policy
- Accept our Acceptable Use Policy
- Agree to comply with all policies
- Acknowledge you've read Terms
- Agree to be bound by Terms

**12.11 Final Provision**

These Terms of Service, along with our Privacy Policy and Acceptable Use Policy, constitute the complete legal agreement between you and Technosthan AgriTech.

By accessing or using Technosthan AgriTech, you acknowledge that you have read these Terms, understand them, and agree to be fully bound by their terms and conditions.

If you have any questions, please contact us immediately.

**Effective Date:** May 26, 2026
**Last Updated:** May 26, 2026
© 2026 Technosthan AgriTech. All rights reserved.`,
    },
  ];

  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  const cardBgClass = isDark
    ? "bg-gray-800 hover:bg-gray-750"
    : "bg-gray-50 hover:bg-gray-100";
  const borderClass = isDark ? "border-gray-700" : "border-gray-200";
  const accentClass = isDark ? "text-red-400" : "text-red-600";

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      {/* Header */}
      <div
        className={`sticky top-0 z-40 ${isDark ? "bg-gray-800 border-gray-700" : "bg-red-50 border-gray-200"} border-b`}
      >
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Scale className={`w-8 h-8 ${accentClass}`} />
            <h1 className={`text-3xl font-bold ${accentClass}`}>
              Terms of Service
            </h1>
          </div>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Technosthan AgriTech — Last Updated: May 26, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`border rounded-lg overflow-hidden ${borderClass} transition-all duration-300`}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full px-6 py-4 flex items-center gap-4 ${cardBgClass} transition-colors duration-300`}
              >
                <div className={accentClass}>{section.icon}</div>
                <span className="flex-1 text-left font-semibold text-lg">
                  {section.title}
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    expandedSections[section.id] ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedSections[section.id] && (
                <div className={`px-6 py-6 border-t ${borderClass}`}>
                  <div
                    className={`prose prose-sm max-w-none ${isDark ? "prose-invert" : ""}`}
                  >
                    {section.content.split("\n").map((line, idx) => {
                      if (!line.trim()) return <br key={idx} />;
                      if (line.startsWith("**") && line.endsWith("**")) {
                        return (
                          <p
                            key={idx}
                            className="font-semibold mt-4 mb-2 text-base"
                          >
                            {line.replace(/\*\*/g, "")}
                          </p>
                        );
                      }
                      if (line.startsWith("- ")) {
                        return (
                          <li
                            key={idx}
                            className={`ml-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                          >
                            {line.substring(2)}
                          </li>
                        );
                      }
                      if (line.startsWith("*") && line.includes(":")) {
                        const [label, ...rest] = line.split(":");
                        return (
                          <li
                            key={idx}
                            className={`ml-4 mb-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
                          >
                            <strong>{label.replace(/\*/g, "")}:</strong>{" "}
                            {rest.join(":")}
                          </li>
                        );
                      }
                      if (line.startsWith("⚠️") || line.includes("CRITICAL")) {
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg mt-4 mb-4 border-l-4 ${
                              isDark
                                ? "bg-red-900 bg-opacity-30 border-red-600 text-red-100"
                                : "bg-red-50 border-red-400 text-red-900"
                            }`}
                          >
                            {line.includes("ARBITRATION CLAUSE:") ? (
                              <div className="italic">
                                "{line.split(":")[1]?.trim()}
                              </div>
                            ) : (
                              line
                            )}
                          </div>
                        );
                      }
                      return (
                        <p
                          key={idx}
                          className={`mb-3 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {line}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className={`mt-12 p-6 rounded-lg border ${borderClass} ${isDark ? "bg-gray-800" : "bg-gray-50"}`}
        >
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${accentClass}`} />
            Important Notice
          </h3>
          <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            These Terms of Service are legally binding. By using Technosthan
            AgriTech, you agree to all terms, conditions, and disclaimers. If
            you have questions, contact us immediately.
          </p>
          <div
            className={`space-y-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}
          >
            <p>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:support@technosthan.com"
                className={`${accentClass} hover:underline`}
              >
                support@technosthan.com
              </a>
            </p>
            <p>
              <strong>Legal Contact:</strong>{" "}
              <a
                href="mailto:legal@technosthan.com"
                className={`${accentClass} hover:underline`}
              >
                legal@technosthan.com
              </a>
            </p>
          </div>
        </div>

        {/* Last Updated */}
        <div
          className={`mt-8 p-4 text-center text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}
        >
          <p>© 2026 Technosthan AgriTech. All rights reserved.</p>
          <p>Last updated: May 26, 2026</p>
        </div>
      </div>
    </div>
  );
}
