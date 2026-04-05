import Link from "next/link";
import { Footer } from "../../components/site/Footer";
import { Header } from "../../components/site/Header";

export const metadata = {
  title: "Terms",
  description: "Tasker terms of service — placeholder page.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to home
          </Link>
          <h1 className="mt-8 text-3xl font-semibold tracking-tight text-foreground">
            Terms of service
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            This is a placeholder page. Official terms will be available before
            public launch. Until then, use of this marketing site is subject to
            applicable law and any agreements you enter into with Tasker
            separately.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
