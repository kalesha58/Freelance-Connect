export function Hero() {
  return (
    <section
      className="relative overflow-hidden border-b border-border"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--hero-mesh-1),transparent),radial-gradient(ellipse_60%_50%_at_100%_0%,var(--hero-mesh-2),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center rounded-full border border-border bg-surface/80 px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur">
            Hire skilled people · Earn as a freelancer
          </p>
          <h1
            id="hero-heading"
            className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl sm:leading-tight lg:text-6xl"
          >
            Your marketplace for{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              real work
            </span>
            , in real time
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Tasker connects Taskers and hiring partners with jobs, portfolios,
            messaging, and tools built for how freelancers and teams actually
            work.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#mobile"
              className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:opacity-90"
            >
              Get the app — Coming soon
            </a>
            <a
              href="#features"
              className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full border border-border bg-surface px-8 text-base font-semibold text-foreground transition hover:bg-muted"
            >
              Explore features
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
