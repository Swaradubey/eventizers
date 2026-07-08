import { Wand2, Send, BarChart3, Layers } from "lucide-react";

const steps = [
  {
    icon: Wand2,
    accentColor: "#C9A84C",
    iconContainerClass: "hiw-icon-container-gold",
    badgeClass: "hiw-step-badge-gold",
    cardClass: "hiw-card-gold",
    dotColor: "#C9A84C",
    label: "Create",
    title: "Describe once, AI builds everything",
    body: "Describe your event and let AI build the page, invitation, RSVP questions, and reminder schedule in seconds.",
  },
  {
    icon: Send,
    accentColor: "#7A9E7E",
    iconContainerClass: "hiw-icon-container-emerald",
    badgeClass: "hiw-step-badge-emerald",
    cardClass: "hiw-card-emerald",
    dotColor: "#7A9E7E",
    label: "Invite",
    title: "Reach guests on every channel",
    body: "Send beautiful invitations over email, SMS, and WhatsApp with personalized greetings and one-click RSVP.",
  },
  {
    icon: BarChart3,
    accentColor: "#9070c0",
    iconContainerClass: "hiw-icon-container-purple",
    badgeClass: "hiw-step-badge-purple",
    cardClass: "hiw-card-purple",
    dotColor: "#9070c0",
    label: "Manage",
    title: "Everything from one view",
    body: "Track RSVPs, check guests in with QR codes, manage registries, and monitor everything from one dashboard.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="hiw-section">
      <div className="hiw-container">
        {/* Section Header */}
        <div className="text-center" style={{ marginBottom: "4rem" }}>
          {/* Badge */}
          <div className="hiw-badge">
            <Layers className="hiw-badge-icon" />
            <span>How Eventizers Works</span>
          </div>

          {/* Heading */}
          <h2 className="hiw-heading">Create, Invite, Manage</h2>

          {/* Subtitle */}
          <p className="hiw-subtitle">
            Three effortless steps to a perfect event.
          </p>
        </div>

        {/* Timeline grid */}
        <div className="hiw-timeline">
          {/* Desktop timeline connector line */}
          <div className="hiw-timeline-line" />

          {/* Desktop timeline dots */}
          <div className="hiw-timeline-dot hiw-timeline-dot-1" />
          <div className="hiw-timeline-dot hiw-timeline-dot-2" />
          <div className="hiw-timeline-dot hiw-timeline-dot-3" />

          {/* Mobile vertical line */}
          <div className="hiw-vertical-line" />

          {/* Step Cards */}
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const stepNum = String(idx + 1).padStart(2, "0");

            return (
              <div key={step.label} className="hiw-card-wrapper">
                {/* Mobile dot */}
                <div
                  className="hiw-mobile-dot"
                  style={{ backgroundColor: step.dotColor }}
                />

                {/* Card */}
                <div className={`hiw-card ${step.cardClass}`}>
                  {/* Icon container */}
                  <div
                    className={`hiw-icon-container ${step.iconContainerClass}`}
                  >
                    <Icon
                      className="hiw-icon"
                      style={{ color: step.accentColor }}
                    />
                  </div>

                  {/* Step badge */}
                  <div className={`hiw-step-badge ${step.badgeClass}`}>
                    Step {stepNum}
                  </div>

                  {/* Title */}
                  <h3 className="hiw-card-title">{step.title}</h3>

                  {/* Body */}
                  <p className="hiw-card-body">{step.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
