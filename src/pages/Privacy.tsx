import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motionConfig";
import { Shield, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  const sections = [
    { id: "intro", title: "Introduction" },
    { id: "collect", title: "Information We Collect" },
    { id: "ai-processing", title: "AI Processing & Generated Content" },
    { id: "use", title: "How We Use Your Information" },
    { id: "sharing", title: "Data Sharing & Third Parties" },
    { id: "security", title: "Data Storage & Security" },
    { id: "rights", title: "Your Rights" },
    { id: "retention", title: "Data Retention" },
    { id: "children", title: "Children's Privacy" },
    { id: "changes", title: "Changes to This Policy" },
    { id: "contact", title: "Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div {...pageTransition}>
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-ts-coral" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">Last Updated: January 2026</p>
          </div>

          {/* Table of Contents */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
            <nav className="space-y-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block text-ts-teal hover:underline"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </Card>

          {/* Content */}
          <div className="space-y-8 text-foreground">
            {/* Introduction */}
            <section id="intro">
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to BetterOpnr. We are committed to protecting your privacy and being transparent about how we collect, use, and protect your personal information. This Privacy Policy explains our practices regarding data collection and usage when you use our AI-powered conversation starter service.
              </p>
            </section>

            {/* Information We Collect */}
            <section id="collect">
              <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground">
                  BetterOpnr collects only the content you choose to submit. We do not collect data beyond what is necessary for the app to function.
                </p>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Account Information</h3>
                  <p>When you create an account, we collect your email address, username, and user ID through our authentication provider (Clerk).</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">User-Submitted Content</h3>
                  <p>We collect the text you enter and any images you optionally upload (such as dating profile screenshots). This content is used solely to generate AI-powered message suggestions. Images are processed temporarily and are not permanently stored.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Usage Data</h3>
                  <p>We track the number of conversation openers you generate, your saved favorites, and your subscription status to provide and improve our service.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Payment Information</h3>
                  <p>Payment details are processed securely by Stripe. We do not store your credit card information on our servers. We only receive transaction confirmations and subscription status from Stripe.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Technical Data</h3>
                  <p>We use browser localStorage for session management and analytics events. No personal device identifiers or location tracking is performed.</p>
                </div>
              </div>
            </section>

            {/* AI Processing */}
            <section id="ai-processing">
              <h2 className="text-2xl font-bold mb-4">AI Processing & Generated Content</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">How AI Suggestions Are Created</h3>
                  <p>BetterOpnr uses artificial intelligence to generate message suggestions based on the text and images you provide. Your input is processed by our AI service to create personalized conversation starters.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">User Control</h3>
                  <p className="font-medium text-foreground">BetterOpnr does not send messages on your behalf. BetterOpnr does not impersonate you or interact with any third-party platforms or individuals.</p>
                  <p className="mt-2">All AI-generated suggestions are presented to you for review. You decide whether to copy, edit, or use any suggestion. You are solely responsible for any content you choose to send to others.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">AI Limitations</h3>
                  <p>AI-generated suggestions may be inaccurate, inappropriate, or unsuitable for your intended use. We recommend reviewing and editing all suggestions before using them.</p>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section id="use">
              <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>To provide and maintain our AI conversation starter service</li>
                <li>To process your subscription and manage billing</li>
                <li>To personalize your experience and save your preferences</li>
                <li>To improve service quality using aggregate, non-identifying usage patterns. User-submitted content is not used to train AI models.</li>
                <li>To provide customer support and respond to your inquiries</li>
                <li>To send important service updates and security notifications</li>
                <li>To comply with legal obligations and prevent fraud</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section id="sharing">
              <h2 className="text-2xl font-bold mb-4">Data Sharing & Third Parties</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground">We DO NOT sell your personal data to third parties.</p>
                <p>We work with the following trusted service providers:</p>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Clerk (Authentication)</h3>
                  <p>Manages user accounts, authentication, and security. Learn more at <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="text-ts-teal hover:underline">clerk.com/privacy</a></p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Stripe (Payment Processing)</h3>
                  <p>Processes subscription payments securely. Learn more at <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-ts-teal hover:underline">stripe.com/privacy</a></p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Lovable AI</h3>
                  <p>Lovable AI powers our conversation generation using Google Gemini models. Profile text and images are sent only at the moment of generation and are not retained, reused, or used to train AI models by BetterOpnr or the AI provider.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Affiliate Links & External Recommendations</h3>
                  <p>BetterOpnr may include optional recommendations to third-party tools, services, or products that help improve messaging, profile presentation, or confidence.</p>
                  <p className="mt-2">Some recommendations may include affiliate links, which means BetterOpnr may earn a commission if you choose to sign up or make a purchase — at no additional cost to you.</p>
                  <p className="mt-2">Affiliate recommendations are optional, do not unlock or block any core features, and open in your device's external browser.</p>
                  <p className="mt-2">When you leave BetterOpnr to visit a third-party website, that website's privacy policy and terms apply.</p>
                  <p className="mt-2">Learn more in our <a href="/affiliate-disclosure" className="text-ts-teal hover:underline">Affiliate Disclosure</a>.</p>
                </div>
                <p>We do not use advertising networks or third-party tracking for marketing purposes at this time. If we introduce advertising or additional tracking in the future, we will update this Privacy Policy before those changes take effect.</p>
              </div>
            </section>

            {/* Security */}
            <section id="security">
              <h2 className="text-2xl font-bold mb-4">Data Storage & Security</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Your data is stored securely on cloud infrastructure with industry-standard encryption. We implement:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encrypted data transmission (HTTPS/TLS)</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security audits and updates</li>
                  <li>Row-level security policies on database tables</li>
                  <li>Limited employee access to personal data</li>
                </ul>
                <p>While we take reasonable measures to protect your information, no internet transmission is 100% secure. Please use a strong, unique password for your account.</p>
              </div>
            </section>

            {/* Your Rights */}
            <section id="rights">
              <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>You have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                  <li><strong>Export:</strong> Download your saved conversation openers and profile data</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails (service emails are required)</li>
                  <li><strong>Withdraw Consent:</strong> Revoke permissions for data processing where applicable</li>
                </ul>
                
                <div className="bg-muted/50 rounded-lg p-4 mt-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">How to Request Data Deletion</h3>
                  <p>To delete your account and all associated data, email <a href="mailto:privacy@betteropnr.com" className="text-ts-teal hover:underline">privacy@betteropnr.com</a> with the subject line "Data Deletion Request" and include the email address associated with your account. We will process your request within 30 days and confirm deletion by email.</p>
                </div>

                <p className="mt-4">
                  <strong>GDPR Compliance:</strong> If you are located in the European Union, you have additional rights under the General Data Protection Regulation (GDPR).
                </p>
                <p>
                  <strong>CCPA Compliance:</strong> California residents have rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected and the right to opt-out of data sales (we do not sell personal data).
                </p>
                <p>To exercise any of these rights, please contact us using the information in the Contact Us section.</p>
              </div>
            </section>

            {/* Data Retention */}
            <section id="retention">
              <h2 className="text-2xl font-bold mb-4">Data Retention</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground">We retain user content only as long as necessary to provide the service.</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account data is retained until you delete your account</li>
                  <li>Uploaded images (such as profile screenshots) are processed temporarily to generate suggestions and are not permanently stored</li>
                  <li>Text you submit for AI processing is not stored after your session ends, unless you choose to save specific suggestions</li>
                  <li>Saved conversation openers are retained until you delete them or close your account</li>
                  <li>Payment records are retained for 7 years for tax and legal compliance</li>
                  <li>Usage analytics data is anonymized after 12 months</li>
                </ul>
                <p>Upon account deletion, your personal data is permanently removed within 30 days, except where we are legally required to retain certain information.</p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section id="children">
              <h2 className="text-2xl font-bold mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                BetterOpnr is intended for users aged 18 and older. We do not knowingly collect personal information from individuals under 18 years of age. If we become aware that a user under 18 has provided personal information, we will take steps to delete such information. If you believe a minor has provided information to us, please contact us immediately.
              </p>
            </section>

            {/* Changes to Policy */}
            <section id="changes">
              <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. When we make significant changes, we will notify you by email or through a prominent notice in the app. The "Last Updated" date at the top of this policy indicates when it was last revised. Your continued use of BetterOpnr after changes are posted constitutes your acceptance of the updated policy.
              </p>
            </section>

            {/* Contact */}
            <section id="contact">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:</p>
                <Card className="p-6 bg-muted/50">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-ts-coral flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-foreground mb-1">Email:</p>
                      <a href="mailto:privacy@betteropnr.com" className="text-ts-teal hover:underline">
                        privacy@betteropnr.com
                      </a>
                      <p className="text-sm mt-2">We aim to respond to all privacy-related inquiries within 30 days.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
