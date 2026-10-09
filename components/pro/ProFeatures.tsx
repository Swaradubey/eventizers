import React from "react";
import {
  Send,
  CalendarDays,
  Link2,
  Share2,
  Ticket,
  QrCode,
  BarChart3,
  Wallet,
  Inbox,
  Contact,
  Users,
  Sparkles,
} from "lucide-react";
import { FEATURES_DATA } from "./proData";

export default function ProFeatures() {
  const getIcon = (iconName: string) => {
    const props = { className: "size-5", "aria-hidden": true };
    switch (iconName) {
      case "send":
        return <Send {...props} />;
      case "calendar":
        return <CalendarDays {...props} />;
      case "link":
        return <Link2 {...props} />;
      case "share":
        return <Share2 {...props} />;
      case "ticket":
        return <Ticket {...props} />;
      case "qr":
        return <QrCode {...props} />;
      case "chart":
        return <BarChart3 {...props} />;
      case "wallet":
        return <Wallet {...props} />;
      case "inbox":
        return <Inbox {...props} />;
      case "contact":
        return <Contact {...props} />;
      case "users":
        return <Users {...props} />;
      case "sparkles":
        return <Sparkles {...props} />;
      default:
        return <Sparkles {...props} />;
    }
  };

  return (
    <section
      id="features"
      className="relative isolate scroll-mt-16 overflow-hidden py-16 lg:py-28"
    >
      {/* Background with dark overlay & grain */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <img
          alt=""
          loading="lazy"
          src="/images/pro-crowd.png"
          className="kb-slow absolute inset-0 size-full object-cover opacity-25 grayscale-[35%] dark:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--background)_85%)]" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Everything in Pro
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-5xl">
            The whole promotion desk, in one workspace.
          </h2>
        </div>

        <div className="mt-12 flex flex-col gap-14 lg:gap-18">
          {FEATURES_DATA.map((section) => (
            <div key={section.category}>
              <div>
                <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
                  <h3 className="tone-text font-display text-4xl font-extrabold sm:text-5xl">
                    {section.category}
                  </h3>
                  <p className="pb-1 text-foreground/65 text-base sm:text-lg">
                    {section.subtitle}
                  </p>
                </div>
                <div className="tone-bg mt-3 h-0.5 w-16 rounded-full" />
              </div>

              <ul className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory scroll-pl-4 gap-3.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
                {section.features.map((item) => (
                  <li
                    key={item.title}
                    className="flex w-[78%] shrink-0 snap-start sm:w-auto"
                  >
                    <article className="tone-card flex h-full w-full flex-col rounded-2xl p-5 shadow-lg border border-border/60 hover:border-primary/50 transition">
                      <span className="tone-chip tone-icon grid size-12 place-items-center rounded-2xl shadow-sm">
                        {getIcon(item.icon)}
                      </span>
                      <h4 className="mt-4 text-lg font-semibold text-foreground">
                        {item.title}
                      </h4>
                      <p className="mt-2 text-[15px] leading-relaxed text-foreground/70">
                        {item.desc}
                      </p>
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
