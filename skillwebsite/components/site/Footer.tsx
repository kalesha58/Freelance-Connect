import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="font-semibold text-foreground">Skill Link</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The freelance marketplace for skilled work.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm" aria-label="Footer">
            <Link
              href="/privacy"
              className="text-muted-foreground transition hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground transition hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/account-deletion-info"
              className="text-muted-foreground transition hover:text-foreground"
            >
              Deletion
            </Link>
            <Link
              href="/#about"
              className="text-muted-foreground transition hover:text-foreground"
            >
              About
            </Link>
          </nav>
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground sm:text-left">
          © {year} Skill Link. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
