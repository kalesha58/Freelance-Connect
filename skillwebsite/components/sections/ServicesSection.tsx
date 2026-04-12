import {
  IconBell,
  IconBriefcase,
  IconChat,
  IconPhoto,
  IconSparkles,
  IconWallet,
} from "../icons/FeatureIcons";
import { SectionHeading } from "../ui/SectionHeading";

const FEATURES = [
  {
    title: "Jobs & discovery",
    description:
      "Browse a live job feed with filters for category, budget, and location.",
    Icon: IconBriefcase,
  },
  {
    title: "Portfolio & profiles",
    description:
      "Showcase work with rich media, tags, and profiles clients can trust.",
    Icon: IconPhoto,
  },
  {
    title: "Messaging & proposals",
    description:
      "Chat directly, send proposals, and keep hiring conversations in one place.",
    Icon: IconChat,
  },
  {
    title: "Wallet & gig packages",
    description:
      "Transparent earnings and tiered packages that scale with your business.",
    Icon: IconWallet,
  },
  {
    title: "AI matching",
    description:
      "Smarter suggestions that align freelancers with the right opportunities.",
    Icon: IconSparkles,
  },
  {
    title: "Notifications & trust",
    description:
      "Stay on top of activity with alerts and a full ratings and reviews system.",
    Icon: IconBell,
  },
] as const;

export function ServicesSection() {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-b border-border py-20 sm:py-28"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          headingId="features-heading"
          eyebrow="Platform"
          title="Everything you need to hire and get hired"
          description="From first impression to final payment, Skill Link is built for speed, clarity, and professional growth."
        />
        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, description, Icon }) => (
            <li
              key={title}
              className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary/15">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
