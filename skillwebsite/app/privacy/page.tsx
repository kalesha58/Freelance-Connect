import Link from "next/link";
import { Footer } from "../../components/site/Footer";
import { Header } from "../../components/site/Header";

export const metadata = {
  title: "Privacy Policy | Tasker",
  description: "Tasker privacy policy — details on how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Effective Date: April 12, 2026</p>

            <div className="mt-12 prose prose-slate dark:prose-invert max-w-none space-y-8 text-foreground/90">
              <section>
                <p className="text-lg leading-relaxed">
                  This Privacy Policy describes how <strong>Tasker</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and shares information about you when you use the <strong>Tasker</strong> mobile application (the &quot;App&quot;).
                </p>
                <p className="mt-4">
                  Please read this policy carefully to understand our practices regarding your data. By using the App, you agree to the collection and use of information in accordance with this policy.
                </p>
              </section>

              <hr className="border-border" />

              <section>
                <h2 className="text-2xl font-semibold text-foreground">1. Information Collection and Use</h2>
                <p className="mt-4">
                  For a better experience while using our Service, we may require you to provide us with certain personally identifiable information. The information that we request will be retained by us and used as described in this privacy policy.
                </p>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">Personal Information</h3>
                    <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                      <li><strong>Account Data</strong>: Name, email address, phone number, and password.</li>
                      <li><strong>Profile Data</strong>: Education, work experience, skills, and portfolio media (images/videos).</li>
                      <li><strong>Communication Data</strong>: Messages and attachments sent through the in-app chat system.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground">Financial Information</h3>
                    <p className="mt-2 text-sm">
                      Our App integrates with <strong>Razorpay</strong> to facilitate payments (subscriptions, boosts, and earnings).
                    </p>
                    <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      <li>We do not store your full credit card or bank details on our servers.</li>
                      <li>Payment information is processed directly by Razorpay, governed by their own privacy policy.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-foreground">Media and Files</h3>
                    <p className="mt-2 text-sm">
                      The App allows you to upload images and videos for your portfolio. We access your device&apos;s media library only when you explicitly choose to upload content using the system photo picker.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">2. Service Providers</h2>
                <p className="mt-4">
                  We may employ third-party companies and individuals to facilitate our Service, provide the Service on our behalf, or assist us in analyzing how our Service is used.
                </p>
                <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Third-Party Services Used:</h3>
                  <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Google Play Services
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Firebase (Analytics, Database)
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Razorpay (Payment Gateway)
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">3. Data Retention and Deletion</h2>
                <p className="mt-4">
                  We retain your personal information for as long as your account is active or as needed to provide you with the App&apos;s services.
                </p>
                <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-6">
                  <h3 className="text-lg font-semibold text-primary">Right to Delete Data</h3>
                  <p className="mt-2 text-sm leading-relaxed">
                    You have the right to request the deletion of your account and associated personal data at any time. This applies whether you use the App as a freelancer or as a hiring manager.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <Link 
                      href="/account-deletion-info"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      View Deletion Instructions →
                    </Link>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">4. Security</h2>
                <p className="mt-4">
                  We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground">5. Children&apos;s Privacy</h2>
                <p className="mt-4">
                  These Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
                </p>
              </section>

              <section className="pt-8 border-t border-border">
                <h2 className="text-2xl font-semibold text-foreground">6. Contact Us</h2>
                <p className="mt-4">
                  If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at:
                </p>
                <div className="mt-6 flex flex-col gap-2 text-sm">
                  <p><strong>Email:</strong> <a href="mailto:kaleshabox8@gmail.com" className="text-primary hover:underline">kaleshabox8@gmail.com</a></p>
                  <p><strong>Developer:</strong> Tasker</p>
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
