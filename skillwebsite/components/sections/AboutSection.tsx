import { SectionHeading } from "../ui/SectionHeading";

export function AboutSection() {
  return (
    <section
      id="about"
      className="scroll-mt-20 py-20 sm:py-28"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            headingId="about-heading"
            eyebrow="About Tasker"
            title="Marketplace DNA, product discipline"
            description="We believe hiring should feel as natural as messaging a colleague — and that freelancers deserve tools that respect their craft."
          />
          <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
            Tasker exists to shorten the distance between great work and the
            people who need it. Our roadmap blends real-time collaboration,
            transparent earnings, and thoughtful growth features so Taskers and
            hiring partners can focus on outcomes — not overhead.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Whether you&apos;re staffing a sprint or building a freelance career,
            we&apos;re building the platform to match.
          </p>
        </div>
      </div>
    </section>
  );
}
