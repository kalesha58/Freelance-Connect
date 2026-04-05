interface ISectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  headingId?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  headingId,
}: ISectionHeadingProps) {
  const alignClass = align === "left" ? "text-left" : "text-center";
  const containerClass =
    align === "left" ? "mx-0 max-w-2xl" : "mx-auto max-w-2xl";

  return (
    <div className={`${containerClass} ${alignClass}`}>
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">
        {eyebrow}
      </p>
      <h2
        id={headingId}
        className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
