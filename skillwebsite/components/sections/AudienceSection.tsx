import { SectionHeading } from "../ui/SectionHeading";

const PROFESSIONAL_POINTS = [
  "Find and apply to jobs that fit your skills",
  "Build a standout portfolio with media and tags",
  "Message clients, send proposals, and track wins",
  "Grow with insights, boosts, and subscription tools",
] as const;

const HIRING_POINTS = [
  "Post structured jobs with budget and deadlines",
  "Discover professionals with portfolios and reviews",
  "Manage applicants and chat in one workflow",
  "Hire with confidence using ratings and trust signals",
] as const;

export function AudienceSection() {
  return (
    <section
      className="border-b border-border bg-muted/30 py-20 sm:py-28"
      aria-labelledby="audience-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          headingId="audience-heading"
          eyebrow="Built for both sides"
          title="Whether you hire or hustle"
          description="Skill Link gives freelancers and hiring partners the same polished experience — with role-specific superpowers."
        />
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <article
            id="freelancers"
            className="scroll-mt-20 rounded-2xl border border-border bg-surface p-8 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary"
                aria-hidden
              >
                SL
              </span>
              <h3 className="text-xl font-semibold text-foreground">
                For Pros
              </h3>
            </div>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Skilled professionals who want to showcase work, land jobs, and
              earn on their terms.
            </p>
            <ul className="mt-6 space-y-3">
              {PROFESSIONAL_POINTS.map((item) => (
                <li key={item} className="flex gap-3 text-foreground">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    aria-hidden
                  />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </article>
          <article
            id="businesses"
            className="scroll-mt-20 rounded-2xl border border-border bg-surface p-8 shadow-sm ring-1 ring-accent/10"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-sm font-bold text-accent"
                aria-hidden
              >
                HP
              </span>
              <h3 className="text-xl font-semibold text-foreground">
                For hiring partners
              </h3>
            </div>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Teams and individuals who need talent fast — without sacrificing
              quality or visibility.
            </p>
            <ul className="mt-6 space-y-3">
              {HIRING_POINTS.map((item) => (
                <li key={item} className="flex gap-3 text-foreground">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
