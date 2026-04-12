import Link from "next/link";
import { Footer } from "../../components/site/Footer";
import { Header } from "../../components/site/Header";

export const metadata = {
  title: "Account Deletion Information",
  description: "Information on how to request the deletion of your Tasker account and associated data.",
};

const DELETION_EMAIL = "kaleshabox8@gmail.com";

export default function AccountDeletionInfoPage() {
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

            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Account & data deletion
              </h1>
            </div>

            <div className="mt-8 space-y-6 text-foreground/90">
              <p className="text-lg leading-relaxed">
                At Tasker, we value your privacy and provide you with full control over your personal data. 
                Whether you use the platform as a <strong>Freelancer</strong> or <strong>Hiring Partner</strong>, 
                you can request the deletion of your account and all associated data at any time.
              </p>

              <section className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-foreground">How to request deletion</h2>
                <div className="mt-4 space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">In-App Deletion</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Open the Tasker app, go to <strong>Settings</strong> &gt; <strong>Help & Support</strong>, and select the option to delete your account.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium">Manual Email Request</h3>
                      <p className="mt-1 text-sm text-foreground">
                        If you cannot access the app, send an email to <a href={`mailto:${DELETION_EMAIL}`} className="font-semibold text-primary hover:underline">{DELETION_EMAIL}</a> with the subject line <strong>&quot;Data Deletion Request&quot;</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">What happens next?</h2>
                <p className="leading-relaxed">
                  Upon receiving a valid deletion request, we will verify your identity and remove your personal information from our active databases within <strong>30 days</strong>.
                </p>
                <div className="flex gap-3 rounded-xl bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>
                    Please note: Some information may be retained where we are required by law to do so (e.g., for financial records, tax purposes, or to comply with legal obligations).
                  </p>
                </div>
              </section>

              <div className="pt-8 text-sm text-muted-foreground">
                <p>Last updated: April 12, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
