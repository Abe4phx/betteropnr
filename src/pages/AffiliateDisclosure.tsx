import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motionConfig";
import { Link } from "react-router-dom";
import { ArrowLeft, Handshake } from "lucide-react";

const AffiliateDisclosure = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div {...pageTransition}>
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Handshake className="w-12 h-12 text-ts-coral" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Affiliate Disclosure</h1>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6 text-foreground leading-relaxed">
              <p>
                BetterOpnr may recommend third-party tools, services, or products that help improve messaging, profiles, or confidence. Some of these recommendations may include affiliate links, which means BetterOpnr may earn a commission if you choose to sign up or make a purchase — at no additional cost to you.
              </p>
              <p>
                All recommendations are optional, external to the app, and are not required to use BetterOpnr's core features.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AffiliateDisclosure;
