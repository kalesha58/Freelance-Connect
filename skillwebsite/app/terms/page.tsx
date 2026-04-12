import Link from "next/link";
import { Footer } from "../../components/site/Footer";
import { Header } from "../../components/site/Header";

export const metadata = {
  title: "Terms of Service | Tasker",
  description: "Tasker terms and conditions — information on how to use our platform and services.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Link
              href="/"
              className="group inline-flex items-center text-sm font-medium text-primary transition hover:underline"
            >
              <svg
                className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to home
            </Link>

            <h1 className="mt-8 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: April 12, 2026</p>

            <div className="mt-12 prose prose-slate dark:prose-invert max-w-none space-y-8 text-foreground/90">
              <section>
                <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
                <p className="mt-4">
                  By accessing or using the Tasker mobile application and associated services (the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">2. Description of Service</h2>
                <p className="mt-4">
                  Tasker is a freelance marketplace platform that connects skilled professionals (&quot;Taskers&quot;) with clients (&quot;Requesters&quot; or &quot;Hiring Partners&quot;). We provide tools for job posting, talent discovery, real-time messaging, and payment facilitation.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">3. User Roles & Accounts</h2>
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl border border-border p-4">
                    <h3 className="font-semibold">Freelancer / Tasker</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Users who showcase their portfolio, apply for jobs, and provide services to Requesters.</p>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <h3 className="font-semibold">Requester / Hiring Partner</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Users who post jobs, discover talent, and hire professionals for specific tasks.</p>
                  </div>
                </div>
                <p className="mt-4">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">4. Payments & Subscriptions</h2>
                <p className="mt-4">
                  Tasker uses **Razorpay** for payment processing. By making a payment through the Service, you agree to Razorpay&apos;s terms and conditions.
                </p>
                <ul className="mt-4 list-disc pl-5 space-y-2 text-sm">
                  <li><strong>Subscription Model</strong>: Certain advanced features, such as unlimited chat and premium visibility, may require a paid subscription.</li>
                  <li><strong>Post Boosting</strong>: Users may pay to increase the visibility of their posts or profiles.</li>
                  <li><strong>Refunds</strong>: Refund policies are handled on a case-by-case basis unless otherwise required by law.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">5. Content & Conduct</h2>
                <p className="mt-4">
                  You retain ownership of the content you upload to Tasker (e.g., portfolio media, job descriptions). However, by posting content, you grant Tasker a non-exclusive, worldwide license to display and distribute that content to facilitate the Service.
                </p>
                <p className="mt-4">
                  You agree not to use the Service for any illegal activities or to post content that is harmful, offensive, or violates the rights of others.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">6. Termination</h2>
                <p className="mt-4">
                  We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">7. Limitation of Liability</h2>
                <p className="mt-4">
                  Tasker is a platform that facilitates connections. We are not responsible for the quality of work performed by Taskers or the conduct of Requesters. Use the Service at your own risk.
                </p>
              </section>

              <section className="pt-8 border-t border-border">
                <h2 className="text-2xl font-semibold text-foreground">8. Contact Details</h2>
                <p className="mt-4">
                  For any questions regarding these Terms, please contact us:
                </p>
                <div className="mt-6 text-sm">
                  <p><strong>Email:</strong> <a href="mailto:kaleshabox8@gmail.com" className="text-primary hover:underline">kaleshabox8@gmail.com</a></p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
