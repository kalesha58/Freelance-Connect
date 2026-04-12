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
              Privacy Policy for Tasker
            </h1>
            <p className="mt-2 text-sm text-muted-foreground"><strong>Effective Date:</strong> April 12, 2026</p>

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
                <h2 className="text-2xl font-bold text-foreground">1. Information Collection and Use</h2>
                <p className="mt-4">
                  For a better experience while using our Service, we may require you to provide us with certain personally identifiable information. The information that we request will be retained by us and used as described in this privacy policy.
                </p>
                
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Personal Information</h3>
                    <p className="mt-2">We collect personal information that you provide to us directly when you create an account or use our services, including but not limited to:</p>
                    <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                      <li><strong>Account Data</strong>: Name, email address, phone number, and password.</li>
                      <li><strong>Profile Data</strong>: Education, work experience, skills, and portfolio media (images/videos).</li>
                      <li><strong>Communication Data</strong>: Messages and attachments sent through the in-app chat system.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Financial Information</h3>
                    <p className="mt-2">
                      Our App integrates with <strong>Razorpay</strong> to facilitate payments (subscriptions, boosts, and earnings).
                    </p>
                    <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                      <li>We do not store your full credit card or bank details on our servers.</li>
                      <li>Payment information is processed directly by Razorpay, governed by their own <a href="https://razorpay.com/privacy/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Media and Files</h3>
                    <p className="mt-2">
                      The App allows you to upload images and videos for your portfolio. We access your device&apos;s media library only when you explicitly choose to upload content using the system photo picker.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground">Usage and Device Data</h3>
                    <p className="mt-2">We may automatically collect certain information when you access the App:</p>
                    <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                      <li>IP address, device type, operating system version.</li>
                      <li>App usage statistics and crash reports (via Firebase).</li>
                    </ul>
                  </div>
                </div>
              </section>

              <hr className="border-border" />

              <section>
                <h2 className="text-2xl font-bold text-foreground">2. Service Providers</h2>
                <p className="mt-4">
                  We may employ third-party companies and individuals due to the following reasons:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1 text-sm">
                  <li>To facilitate our Service;</li>
                  <li>To provide the Service on our behalf;</li>
                  <li>To perform Service-related services; or</li>
                  <li>To assist us in analyzing how our Service is used.</li>
                </ul>
                <p className="mt-4">
                  We want to inform users of this Service that these third parties have access to your personal information to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.
                </p>
                <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Third-Party Services Used:</h3>
                  <ul className="mt-2 space-y-1">
                    <li className="flex items-center gap-2 text-sm font-medium">Google Play Services</li>
                    <li className="flex items-center gap-2 text-sm font-medium">Firebase (Analytics, Cloud Messaging, Firestore, Real-time Database)</li>
                    <li className="flex items-center gap-2 text-sm font-medium">Razorpay (Payment Gateway)</li>
                  </ul>
                </div>
              </section>

              <hr className="border-border" />

              <section>
                <h2 className="text-2xl font-bold text-foreground">3. Data Retention and Deletion</h2>
                <p className="mt-4">
                  We retain your personal information for as long as your account is active or as needed to provide you with the App&apos;s services.
                </p>
                
                <h3 className="mt-6 text-xl font-semibold text-foreground">Right to Delete Data</h3>
                <p className="mt-2">
                  You have the right to request the deletion of your account and associated personal data at any time. This applies whether you use the App as a <strong>freelancer</strong> or as a <strong>hiring manager</strong> (or equivalent client role): you may request deletion of <strong>your own</strong> account using the same methods below.
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex gap-4 rounded-xl border border-border p-4">
                    <div className="h-2 w-2 mt-2 shrink-0 rounded-full bg-primary" />
                    <p className="text-sm"><strong>In-App Deletion</strong>: You can request account deletion through the &quot;Settings&quot; or &quot;Help & Support&quot; section of the App.</p>
                  </div>
                  <div className="flex gap-4 rounded-xl border border-border p-4">
                    <div className="h-2 w-2 mt-2 shrink-0 rounded-full bg-primary" />
                    <p className="text-sm"><strong>Web (Account Deletion Information)</strong>: Comprehensive instructions available at: <a href="https://freelance-connect-wcgx.vercel.app/account-deletion-info" className="text-primary hover:underline font-medium">https://freelance-connect-wcgx.vercel.app/account-deletion-info</a>.</p>
                  </div>
                  <div className="flex gap-4 rounded-xl border border-border p-4">
                    <div className="h-2 w-2 mt-2 shrink-0 rounded-full bg-primary" />
                    <p className="text-sm"><strong>Manual Request</strong>: Email us directly at <a href="mailto:kaleshabox8@gmail.com" className="text-primary hover:underline font-medium">kaleshabox8@gmail.com</a> with the subject <strong>&quot;Data Deletion Request&quot;</strong>.</p>
                  </div>
                </div>

                <p className="mt-6">
                  Upon receiving a valid deletion request, we will delete your account and remove your personal information from our active databases within <strong>30 days</strong>, except where we are required by law to retain certain data (e.g., for tax or accounting purposes).
                </p>
              </section>

              <hr className="border-border" />

              <section>
                <h2 className="text-2xl font-bold text-foreground">4. Security</h2>
                <p className="mt-4">
                  We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
                </p>
              </section>

              <hr className="border-border" />

              <section>
                <h2 className="text-2xl font-bold text-foreground">5. Links to Other Sites</h2>
                <p className="mt-4">
                  This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy of these websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
                </p>
              </section>

              <hr className="border-border" />

              <section>
                <h2 className="text-2xl font-bold text-foreground">6. Children&apos;s Privacy</h2>
                <p className="mt-4">
                  These Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. In the case we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions.
                </p>
              </section>

              <hr className="border-border" />

              <section>
                <h2 className="text-2xl font-bold text-foreground">7. Changes to This Privacy Policy</h2>
                <p className="mt-4">
                  We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately after they are posted on this page.
                </p>
              </section>

              <hr className="border-border" />

              <section className="pb-12">
                <h2 className="text-2xl font-bold text-foreground">8. Contact Us</h2>
                <p className="mt-4">
                  If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at:
                </p>
                <div className="mt-6 space-y-2 text-sm">
                  <p><strong>Account deletion (web):</strong> <a href="https://freelance-connect-wcgx.vercel.app/account-deletion-info" className="text-primary hover:underline">https://freelance-connect-wcgx.vercel.app/account-deletion-info</a></p>
                  <p><strong>Email:</strong> <a href="mailto:kaleshabox8@gmail.com" className="text-primary hover:underline">kaleshabox8@gmail.com</a></p>
                  <p><strong>Developer:</strong> Tasker</p>
                  <p><strong>Address:</strong> 171 Mahindra Luxuria, Pocharam, Sagareddy, Telangana, India - 502293</p>
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
