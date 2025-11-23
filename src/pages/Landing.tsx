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
      {/* Hero Section */}
      <motion.div 
        className="relative bg-gradient-subtle border-b overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Decorative Sparks */}
        <div className="absolute top-20 left-[10%] opacity-60">
          <Spark size={32} animate="float" duration={7} />
        </div>
        <div className="absolute top-40 right-[15%] opacity-70">
          <Spark size={28} animate="pulse" duration={5} />
        </div>
        <div className="absolute bottom-20 left-[20%] opacity-50">
          <Spark size={24} animate="drift" duration={8} />
        </div>

        <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24 lg:py-28">
          <motion.div 
            className="text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto relative z-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-foreground leading-tight px-4">
              Start better conversations — get more replies
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto px-4">
              AI-powered conversation starters that feel authentic and get responses. No more ghosting.
            </p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 px-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button 
                onClick={() => navigate('/sign-up')}
                size="lg"
                className="w-full sm:w-auto bg-bo-gradient shadow-elegant hover:shadow-lg text-lg px-8 py-6 rounded-2xl"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Get Started Free
              </Button>
              <Button 
                onClick={() => navigate('/sign-in')}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-6 rounded-2xl"
              >
                Sign In
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

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
