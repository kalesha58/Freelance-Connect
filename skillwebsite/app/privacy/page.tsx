import Link from "next/link";
import { Footer } from "../../components/site/Footer";
import { Header } from "../../components/site/Header";

export const metadata = {
  title: "Privacy",
  description: "Tasker privacy policy — placeholder page.",
};

export default function PrivacyPage() {
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
            Privacy policy
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            This is a placeholder page. A full privacy policy will be published
            before the Tasker services go live. For questions, contact us at the
            address provided on the main site.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
