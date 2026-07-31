import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useGSAP } from "@gsap/react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiGlobe,
  FiLayers,
  FiLoader,
  FiSend,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import { createContact } from "../../../api/contact.api";
import { getServices } from "../../../api/services.api";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const MAX_MESSAGE_LENGTH = 1200;

const normalizeText = (value, fallback = "") =>
  String(value ?? fallback)
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const sortServices = (items = []) =>
  [...items].sort(
    (a, b) =>
      Number(a?.displayOrder || 0) - Number(b?.displayOrder || 0) ||
      normalizeText(a?.title).localeCompare(normalizeText(b?.title))
  );

const ContactForm = () => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    subject: "",
    message: "",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const scopeRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices();
        const items = Array.isArray(response.data?.data)
          ? response.data.data.filter((service) => service?.isActive !== false)
          : [];

        setServices(sortServices(items));
      } catch (error) {
        console.error(error);
        setServices([]);
      }
    };

    fetchServices();
  }, []);

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !scopeRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        gsap.fromTo(
          scopeRef.current.querySelectorAll("[data-contact-form]"),
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.06,
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 78%",
              once: true,
            },
          }
        );
      }, scopeRef);

      return () => context.revert();
    },
    {
      scope: scopeRef,
      dependencies: [reducedMotion, services.length, status],
    }
  );

  const validate = (data) => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizeText(data.name)) {
      nextErrors.name = "Name is required.";
    }

    if (!normalizeText(data.email)) {
      nextErrors.email = "Email is required.";
    } else if (!emailRegex.test(data.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!normalizeText(data.message)) {
      nextErrors.message = "Please tell us what you need.";
    } else if (data.message.length > MAX_MESSAGE_LENGTH) {
      nextErrors.message = "Message is too long.";
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (touched[name]) {
        setErrors(validate(next));
      } else if (status !== "idle") {
        setStatus("idle");
        setStatusMessage("");
      }

      return next;
    });
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate(formData));
  };

  const enterpriseSummary = useMemo(() => {
    const parts = [
      formData.company && `Company: ${formData.company}`,
      formData.service && `Service: ${formData.service}`,
      formData.subject && `Subject: ${formData.subject}`,
    ].filter(Boolean);

    return parts.join(" | ");
  }, [formData.company, formData.service, formData.subject]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validate(formData);
    setTouched({
      name: true,
      email: true,
      message: true,
      phone: true,
      company: true,
      service: true,
      subject: true,
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      setStatusMessage("Please review the highlighted fields and try again.");
      toast.error("Please review the highlighted fields and try again.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setStatusMessage("");

    try {
      await createContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        service: formData.service,
        subject: formData.subject || enterpriseSummary,
        message: `${enterpriseSummary ? `${enterpriseSummary}\n\n` : ""}${formData.message}`.trim(),
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        service: "",
        subject: "",
        message: "",
      });
      setTouched({});
      setErrors({});
      setStatus("success");
      setStatusMessage("Your message was sent successfully. We’ll follow up shortly.");
      toast.success("Message sent successfully. Our team will respond shortly.");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setStatusMessage("Failed to send message. Please try again.");
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeServiceOptions = services.slice(0, 20);
  const messageCount = formData.message.length;
  const messageErrorId = errors.message ? "contact-message-error" : undefined;

  return (
    <section className="contact-form-section" id="contact-form" ref={scopeRef} data-motion-zone="cta">
      <div className="contact-enterprise__shell contact-form-shell">
        <div className="section-header" data-contact-form>
          <span className="section-badge">
            <span className="badge-dot" />
            Business inquiry
          </span>
          <h2>Tell us about the engagement</h2>
          <p>
            Share the project shape, constraints, and urgency. We&apos;ll use the details to route the request and respond with context.
          </p>
        </div>

        <div className="contact-form-layout">
          <form
            className="contact-form contact-form-panel"
            onSubmit={handleSubmit}
            data-contact-form
            aria-busy={loading}
            noValidate
          >
            <div className="contact-form__field">
              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder=" "
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
                autoComplete="name"
              />
              <label htmlFor="contact-name">Full name</label>
              {errors.name ? (
                <span className="contact-form__error" id="contact-name-error">
                  {errors.name}
                </span>
              ) : null}
            </div>

            <div className="contact-form__field">
              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
                autoComplete="email"
              />
              <label htmlFor="contact-email">Email address</label>
              {errors.email ? (
                <span className="contact-form__error" id="contact-email-error">
                  {errors.email}
                </span>
              ) : null}
            </div>

            <div className="contact-form__field">
              <input
                id="contact-phone"
                type="tel"
                name="phone"
                placeholder=" "
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="tel"
              />
              <label htmlFor="contact-phone">Phone number</label>
            </div>

            <div className="contact-form__field">
              <input
                id="contact-company"
                type="text"
                name="company"
                placeholder=" "
                value={formData.company}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="organization"
              />
              <label htmlFor="contact-company">Company</label>
            </div>

            <div className="contact-form__field">
              <select
                id="contact-service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                onBlur={handleBlur}
                data-has-value={Boolean(formData.service)}
              >
                <option value=""> </option>
                {activeServiceOptions.map((service) => (
                  <option key={service.id} value={service.title}>
                    {service.title}
                  </option>
                ))}
              </select>
              <label htmlFor="contact-service">Service</label>
            </div>

            <div className="contact-form__field">
              <input
                id="contact-subject"
                type="text"
                name="subject"
                placeholder=" "
                value={formData.subject}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <label htmlFor="contact-subject">Project title</label>
            </div>

            <div className="contact-form__field contact-form__field--full">
              <textarea
                id="contact-message"
                rows="7"
                name="message"
                placeholder=" "
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={`contact-message-help contact-message-counter ${messageErrorId || ""}`.trim()}
                maxLength={MAX_MESSAGE_LENGTH}
              />
              <label htmlFor="contact-message">Message</label>
              {errors.message ? (
                <span className="contact-form__error" id={messageErrorId}>
                  {errors.message}
                </span>
              ) : null}
            </div>

            <div className="contact-form__helper">
              <span id="contact-message-help">
                Attachments are not accepted through this form. If you need to share files, reply to the follow-up email.
              </span>
              <span className="contact-form__counter" id="contact-message-counter">
                <strong>{messageCount}</strong> / {MAX_MESSAGE_LENGTH} characters
              </span>
            </div>

            {statusMessage ? (
              <div
                className={`contact-form__status contact-form__status--${status}`.trim()}
                role={status === "error" ? "alert" : "status"}
                aria-live="polite"
              >
                {status === "success" ? <FiCheckCircle size={18} /> : null}
                {status === "error" ? <FiAlertCircle size={18} /> : null}
                <span>{statusMessage}</span>
              </div>
            ) : null}

            <button
              type="submit"
              className="btn-primary contact-form__submit"
              disabled={loading}
            >
              {loading ? <FiLoader className="spin" aria-hidden="true" /> : <FiSend aria-hidden="true" />}
              {loading ? "Sending..." : "Request proposal"}
            </button>
          </form>

          <aside className="contact-form__aside" data-contact-form>
            <span className="section-badge">
              <span className="badge-dot" />
              What happens next
            </span>
            <h3>We review the brief, then route it to the right people.</h3>
            <p>
              This keeps the first response focused on scope, urgency, and delivery fit instead of forcing you to repeat yourself.
            </p>

            <div className="contact-form__aside-list">
              <div className="contact-form__aside-item">
                <span className="contact-form__aside-icon" aria-hidden="true">
                  <FiLayers size={15} />
                </span>
                <div className="contact-form__aside-copy">
                  <span>Intake</span>
                  <strong>Your message is captured with the details you provide.</strong>
                </div>
              </div>

              <div className="contact-form__aside-item">
                <span className="contact-form__aside-icon" aria-hidden="true">
                  <FiShield size={15} />
                </span>
                <div className="contact-form__aside-copy">
                  <span>Handling</span>
                  <strong>The submission goes through the existing secured contact flow.</strong>
                </div>
              </div>

              <div className="contact-form__aside-item">
                <span className="contact-form__aside-icon" aria-hidden="true">
                  <FiUsers size={15} />
                </span>
                <div className="contact-form__aside-copy">
                  <span>Routing</span>
                  <strong>Relevant team members can review the service and project context.</strong>
                </div>
              </div>

              <div className="contact-form__aside-item">
                <span className="contact-form__aside-icon" aria-hidden="true">
                  <FiClock size={15} />
                </span>
                <div className="contact-form__aside-copy">
                  <span>Follow-up</span>
                  <strong>You&apos;ll receive a response through the established contact channel.</strong>
                </div>
              </div>

              <div className="contact-form__aside-item">
                <span className="contact-form__aside-icon" aria-hidden="true">
                  <FiGlobe size={15} />
                </span>
                <div className="contact-form__aside-copy">
                  <span>Context</span>
                  <strong>{enterpriseSummary || "Add the project details that matter most to you."}</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
