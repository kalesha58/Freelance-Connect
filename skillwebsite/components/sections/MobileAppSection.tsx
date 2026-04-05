import { SectionHeading } from "../ui/SectionHeading";

export function MobileAppSection() {
  return (
    <section
      id="mobile"
      className="scroll-mt-20 border-b border-border py-20 sm:py-28"
      aria-labelledby="mobile-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 mx-auto w-full max-w-xl lg:order-1 lg:mx-0">
            <SectionHeading
              align="left"
              headingId="mobile-heading"
              eyebrow="On the go"
              title="The Tasker mobile app"
              description="Everything you love about Tasker — optimized for your phone. Post jobs on your commute, reply to clients in seconds, and keep your portfolio in your pocket."
            />
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-accent/15 px-4 py-1.5 text-sm font-semibold text-accent">
                Coming soon
              </span>
              <span className="text-sm text-muted-foreground">
                iOS & Android
              </span>
            </div>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              We&apos;re putting the finishing touches on native apps so you get
              the same secure, real-time experience you expect from Tasker —
              notifications, chat, and job flows included.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                disabled
                className="inline-flex h-12 cursor-not-allowed items-center justify-center rounded-full border border-dashed border-border bg-muted/50 px-8 text-sm font-semibold text-muted-foreground"
                aria-disabled="true"
              >
                App Store — soon
              </button>
              <button
                type="button"
                disabled
                className="inline-flex h-12 cursor-not-allowed items-center justify-center rounded-full border border-dashed border-border bg-muted/50 px-8 text-sm font-semibold text-muted-foreground"
                aria-disabled="true"
              >
                Google Play — soon
              </button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Want updates?{" "}
              <a
                href="mailto:hello@tasker.app"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Email us
              </a>{" "}
              — we&apos;ll share launch news.
            </p>
          </div>
          <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <div
              className="relative w-full max-w-[280px] sm:max-w-[320px]"
              aria-hidden
            >
              <div className="aspect-[9/19] w-full rounded-[2.5rem] border-4 border-foreground/10 bg-gradient-to-b from-muted to-surface p-3 shadow-2xl shadow-primary/10 ring-1 ring-border">
                <div className="flex h-full flex-col rounded-[2rem] bg-background">
                  <div className="mx-auto mt-3 h-6 w-24 rounded-full bg-muted" />
                  <div className="mt-6 space-y-3 px-4">
                    <div className="h-3 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="mt-6 h-24 rounded-xl bg-primary/10" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-5/6 rounded bg-muted" />
                  </div>
                  <div className="mt-auto border-t border-border p-4">
                    <div className="flex gap-2">
                      <div className="h-10 flex-1 rounded-lg bg-primary/20" />
                      <div className="h-10 flex-1 rounded-lg bg-accent/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
