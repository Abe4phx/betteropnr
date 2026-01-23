import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Heart, Zap, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { Spark } from '@/components/ui/Spark';
import { motion } from 'framer-motion';

const Landing = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useUser();

  // Redirect authenticated users to generator
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/generator');
    }
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <div className="min-h-screen bg-muted">
      {/* Header Banner - Headline */}
      <motion.div 
        className="relative bg-gradient-subtle border-b overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Decorative Sparks */}
        <div className="absolute top-10 left-[10%] opacity-60 hidden md:block">
          <Spark size={32} animate="float" duration={7} />
        </div>
        <div className="absolute top-16 right-[15%] opacity-70 hidden md:block">
          <Spark size={28} animate="pulse" duration={5} />
        </div>

        <div className="container mx-auto px-4 py-10 sm:py-12 md:py-16">
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight text-center max-w-4xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            BetterOpnr: AI Dating Openers That Actually Sound Human
          </motion.h1>
        </div>
      </motion.div>

      {/* Content Section - Text + Video side by side */}
      <div className="container mx-auto px-4 py-10 sm:py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center">
          
          {/* Left Column - Text Content */}
          <motion.div 
            className="text-center space-y-8 relative z-10 flex flex-col items-center justify-center h-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl">
              BetterOpnr helps you create confident conversation starters and better first messages using AI designed for real dating conversations — not generic pickup lines.
            </p>
            
            {/* CTA - Desktop only */}
            <motion.div 
              className="hidden md:block"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button 
                onClick={() => navigate('/sign-up')}
                size="lg"
                className="bg-bo-gradient shadow-elegant hover:shadow-lg text-lg px-8 py-6 rounded-2xl"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Try BetterOpnr Free
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Right Column - Video */}
          <motion.div 
            className="space-y-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Caption */}
            <p className="text-sm text-muted-foreground text-center">
              See how BetterOpnr works in 40 seconds
            </p>
            
            {/* Video Container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-border/50 bg-muted">
              <iframe
                src="https://www.youtube.com/embed/I8td-YqJSd4?autoplay=1&mute=1&loop=1&playlist=I8td-YqJSd4&controls=0&modestbranding=1&rel=0"
                loading="lazy"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="BetterOpnr Demo Video"
                className="absolute inset-0 w-full h-full"
              />
            </div>
            
            {/* Audio hint */}
            <p className="text-xs text-muted-foreground text-center">
              🔊 Tap to hear audio
            </p>
          </motion.div>
          
          {/* CTA - Mobile only (after video) */}
          <motion.div 
            className="md:hidden text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Button 
              onClick={() => navigate('/sign-up')}
              size="lg"
              className="w-full sm:w-auto bg-bo-gradient shadow-elegant hover:shadow-lg text-lg px-8 py-6 rounded-2xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Try BetterOpnr Free
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Features Section - Why BetterOpnr */}
      <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24 max-w-6xl">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-center text-foreground mb-4">
            Why BetterOpnr?
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            Stop spending hours crafting the perfect opener. Let AI do the heavy lifting while you focus on building real connections.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">Personalized Openers</h3>
              <p className="text-muted-foreground">
                Upload a profile screenshot and get conversation starters tailored to their interests — no generic pickup lines.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">Higher Response Rates</h3>
              <p className="text-muted-foreground">
                Our AI crafts openers that feel natural and authentic, leading to more meaningful conversations and fewer ghosted messages.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">Save Your Favorites</h3>
              <p className="text-muted-foreground">
                Build your library of winning openers and access them anytime. Never run out of conversation starters again.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">Multiple Tones</h3>
              <p className="text-muted-foreground">
                Choose from playful, direct, thoughtful, or flirty tones to match your conversation style and their vibe.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">Works Everywhere</h3>
              <p className="text-muted-foreground">
                Perfect for Hinge, Bumble, Tinder, or any dating app. Upload profiles from anywhere and start better conversations.
              </p>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] border-primary/20">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground">AI-Powered</h3>
              <p className="text-muted-foreground">
                Powered by advanced AI that understands context, humor, and what makes a great first impression online.
              </p>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Detailed Explanation Section */}
      <motion.section 
        className="container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-3xl"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-8">
          AI Dating Openers Built for Real Conversations
        </h2>
        <div className="space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed text-center">
          <p>
            Starting a conversation on dating apps is harder than it should be. A strong photo or profile doesn't always translate into replies if the first message falls flat.
          </p>
          <p>
            BetterOpnr is an AI-powered dating tool designed to help users write better openers, start conversations naturally, and improve how their dating messages are received. It focuses on real profiles, real context, and real language — not scripted pickup lines.
          </p>
          <p>
            Whether you're unsure what to say first or how to keep a conversation going, BetterOpnr gives you practical suggestions you can edit, personalize, and send.
          </p>
        </div>
      </motion.section>

      {/* What Is BetterOpnr Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-3xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-8">
          What Is BetterOpnr?
        </h2>
        <div className="space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed text-center">
          <p>
            BetterOpnr is an AI-powered tool built specifically for dating conversations. It helps users create better first messages, respond naturally, and improve their overall dating profile communication.
          </p>
          <p>
            Unlike generic AI chat tools, BetterOpnr focuses on dating-specific scenarios — from first messages to follow-up replies. The goal is not to replace your voice, but to help you express it clearly and confidently.
          </p>
          <p>
            Whether you need AI dating openers, thoughtful conversation starters, or help improving how your messages come across, BetterOpnr gives you practical suggestions you can actually use.
          </p>
        </div>
      </section>

      {/* Feature List Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-3xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-4">
          How BetterOpnr Helps You Get More Replies
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground text-center mb-8">
          BetterOpnr focuses on the most common dating communication challenges.
        </p>
        <ul className="space-y-3 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          <li className="flex items-start gap-3">
            <span className="text-primary mt-1">•</span>
            <span>AI dating openers tailored to real dating profiles</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary mt-1">•</span>
            <span>Conversation starters that sound natural, not scripted</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary mt-1">•</span>
            <span>Suggestions to improve how your messages are received</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary mt-1">•</span>
            <span>Support for different dating styles and comfort levels</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary mt-1">•</span>
            <span>Fast, simple suggestions you can edit and send</span>
          </li>
        </ul>
      </section>

      {/* Problem Section - Why Starting Conversations Is Hard */}
      <motion.section 
        className="container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-3xl"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-8">
          Why Starting Conversations on Dating Apps Is So Hard
        </h2>
        <div className="space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed text-center">
          <p>
            Most dating apps give you unlimited profiles but no guidance on what to say. A great photo or bio doesn't matter if your first message never gets a reply. Many people struggle with what to say, how to stand out, or how to sound confident without trying too hard.
          </p>
          <p>
            BetterOpnr exists to remove that friction. Instead of guessing, you get AI-powered dating openers and conversation starters that fit your personality, the other person's profile, and the situation.
          </p>
        </div>
      </motion.section>

      {/* Trust Section - Designed to Help */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-3xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-8">
          Designed to Help, Not Pretend for You
        </h2>
        <div className="space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed text-center">
          <p>
            BetterOpnr is not about fake personalities or automated flirting. It's a tool to help you communicate more clearly, confidently, and authentically.
          </p>
          <p>
            You stay in control of what you send. BetterOpnr simply gives you better starting points so conversations feel easier and more natural.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <motion.div 
        className="bg-gradient-subtle border-t py-16 sm:py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="container mx-auto px-4 text-center space-y-6 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground">
            Ready to spark better conversations?
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Join thousands of users who've upgraded their dating game with BetterOpnr.
          </p>
          <Button 
            onClick={() => navigate('/sign-up')}
            size="lg"
            className="bg-bo-gradient shadow-elegant hover:shadow-lg text-lg px-10 py-6 rounded-2xl"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Free Today
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
