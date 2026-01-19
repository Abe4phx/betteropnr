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
            className="text-center md:text-left space-y-8 relative z-10 flex flex-col justify-center h-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
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

      {/* Features Section */}
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
