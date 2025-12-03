import { ArrowLeft, FileText, Scale, AlertTriangle, UserCheck, Ban, RefreshCw, Shield, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Terms = () => {
  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms', icon: FileText },
    { id: 'services', title: 'Description of Services', icon: Scale },
    { id: 'accounts', title: 'User Accounts', icon: UserCheck },
    { id: 'conduct', title: 'Acceptable Use', icon: AlertTriangle },
    { id: 'prohibited', title: 'Prohibited Activities', icon: Ban },
    { id: 'subscriptions', title: 'Subscriptions & Payments', icon: RefreshCw },
    { id: 'liability', title: 'Limitation of Liability', icon: Shield },
    { id: 'contact', title: 'Contact Us', icon: Mail },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-muted"
    >
      {/* Header */}
      <div className="bg-gradient-subtle border-b">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
            Terms of Service
          </h1>
          <p className="text-muted-foreground mt-2">
            Last updated: December 3, 2024
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        {/* Table of Contents */}
        <div className="bg-card rounded-2xl p-6 mb-8 shadow-soft">
          <h2 className="text-lg font-semibold text-foreground mb-4">Table of Contents</h2>
          <nav className="grid sm:grid-cols-2 gap-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors py-1"
              >
                <section.icon className="w-4 h-4" />
                {section.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          <section id="acceptance" className="bg-card rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            </div>
            <div className="text-muted-foreground space-y-3">
              <p>
                By accessing or using BetterOpnr ("the Service"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our Service.
              </p>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the Service after 
                changes constitutes acceptance of the modified terms.
              </p>
            </div>
          </section>

          <section id="services" className="bg-card rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">2. Description of Services</h2>
            </div>
            <div className="text-muted-foreground space-y-3">
              <p>
                BetterOpnr provides AI-powered conversation starter generation for dating apps. Our Service:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Generates personalized conversation openers based on profile information you provide</li>
                <li>Allows you to save and manage your favorite openers</li>
                <li>Offers various tone options for customization</li>
                <li>Provides optional premium features through subscription plans</li>
              </ul>
              <p>
                The Service is provided "as is" and we make no guarantees about conversation outcomes or 
                dating success.
              </p>
            </div>
          </section>

          <section id="accounts" className="bg-card rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
            </div>
            <div className="text-muted-foreground space-y-3">
              <p>To use certain features, you must create an account. You agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
              <p>
                You must be at least 18 years old to use this Service.
              </p>
            </div>
          </section>

          <section id="conduct" className="bg-card rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">4. Acceptable Use</h2>
            </div>
            <div className="text-muted-foreground space-y-3">
              <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use generated content responsibly and ethically</li>
                <li>Respect the privacy and rights of others</li>
                <li>Not misrepresent yourself or your intentions</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </div>
          </section>

          <section id="prohibited" className="bg-card rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Ban className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">5. Prohibited Activities</h2>
            </div>
            <div className="text-muted-foreground space-y-3">
              <p>You may NOT use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Harass, abuse, or harm another person</li>
                <li>Generate content that is illegal, harmful, or offensive</li>
                <li>Attempt to deceive or manipulate others</li>
                <li>Violate any third-party rights or dating app terms of service</li>
                <li>Reverse engineer or attempt to extract our algorithms</li>
                <li>Use automated systems to access the Service</li>
                <li>Resell or redistribute generated content commercially</li>
              </ul>
            </div>
          </section>

          <section id="subscriptions" className="bg-card rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">6. Subscriptions & Payments</h2>
            </div>
            <div className="text-muted-foreground space-y-3">
              <p><strong>Free Tier:</strong> Basic features are available at no cost with usage limits.</p>
              <p><strong>Paid Subscriptions:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Subscription fees are billed in advance on a recurring basis</li>
                <li>You may cancel your subscription at any time</li>
                <li>Refunds are provided in accordance with applicable law</li>
                <li>We reserve the right to change pricing with reasonable notice</li>
              </ul>
              <p>
                <strong>In-App Purchases:</strong> On iOS devices, subscriptions are processed through Apple's 
                App Store and are subject to Apple's terms and conditions.
              </p>
            </div>
          </section>

          <section id="liability" className="bg-card rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
            </div>
            <div className="text-muted-foreground space-y-3">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, BETTEROPNR SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Loss of profits, data, or goodwill</li>
                <li>Service interruption or inability to use the Service</li>
                <li>Any conduct or content of third parties</li>
                <li>Outcomes of conversations initiated using our Service</li>
              </ul>
              <p>
                Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </div>
          </section>

          <section id="contact" className="bg-card rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">8. Contact Us</h2>
            </div>
            <div className="text-muted-foreground space-y-3">
              <p>If you have questions about these Terms of Service, please contact us:</p>
              <div className="bg-muted rounded-xl p-4">
                <p><strong>Email:</strong> support@betteropnr.com</p>
                <p><strong>Website:</strong> betteropnr.com</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default Terms;
