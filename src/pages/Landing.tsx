import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, Heart, Zap, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { Spark } from '@/components/ui/Spark';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { enterGuest } from '@/lib/guest';

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
            BetterOpnr — AI Dating Openers That Start Real Conversations
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
              BetterOpnr is an AI-powered dating opener tool designed to help people start natural, confident conversations on dating apps. Instead of awkward first messages, BetterOpnr analyzes your match and suggests thoughtful openers that feel human, not scripted. Built for modern dating, privacy-first, and easy to use.
            </p>
            
            {/* CTA - Desktop only */}
            <motion.div 
              className="hidden md:block"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button 
                onClick={() => { enterGuest(); navigate('/generator'); }}
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
              onClick={() => { enterGuest(); navigate('/generator'); }}
              size="lg"
              className="w-full sm:w-auto bg-bo-gradient shadow-elegant hover:shadow-lg text-lg px-8 py-6 rounded-2xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Try BetterOpnr Free
            </Button>
          </motion.div>
        </div>
      </div>

      {/* What is BetterOpnr Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-3xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-8">
          What is BetterOpnr?
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-center">
          BetterOpnr is a dating assistant built to remove the hardest part of online dating — starting the conversation. By using AI to generate personalized, respectful openers, BetterOpnr helps users get more replies and more meaningful connections across popular dating apps.
        </p>
      </section>

      {/* Bridge Section - AI Dating Openers */}
      <motion.section 
        className="container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-3xl"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
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

      {/* Why BetterOpnr Exists Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 max-w-3xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-8">
          Why BetterOpnr Exists
        </h2>
        <div className="space-y-6 text-base sm:text-lg text-muted-foreground leading-relaxed text-center">
          <p>
            Most dating apps give you unlimited profiles but no guidance on what to say. A great photo or bio doesn't matter if your first message never gets a reply. Many people struggle with what to say, how to stand out, or how to sound confident without trying too hard.
          </p>
          <p>
            BetterOpnr exists to remove that friction. Instead of guessing, you get AI-powered dating openers and conversation starters that fit your personality, the other person's profile, and the situation.
          </p>
          <p>
            Unlike generic AI chat tools, BetterOpnr focuses on dating-specific scenarios — from first messages to follow-up replies. The goal is not to replace your voice, but to help you express it clearly and confidently.
          </p>
        </div>
      </section>

      {/* How BetterOpnr Helps Section */}
      <div className="container mx-auto px-4 py-16 sm:py-20 md:py-24 max-w-6xl">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-center text-foreground mb-4">
            How BetterOpnr Helps You Get More Replies
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            BetterOpnr focuses on the most common dating communication challenges.
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

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20 md:py-24 max-w-3xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground text-center mb-4">
          Frequently Asked Questions About BetterOpnr
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground text-center mb-10">
          Common questions about how BetterOpnr works and who it's for.
        </p>
        
        <div className="space-y-4">
          <div className="border rounded-xl px-6 bg-background">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1" className="border-0">
                <h3>
                  <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-foreground hover:no-underline py-5">
                    What are AI dating openers?
                  </AccordionTrigger>
                </h3>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5">
                  AI dating openers are suggested first messages generated using artificial intelligence. BetterOpnr creates dating openers based on real dating profiles and conversation context, helping users start chats naturally instead of relying on generic pickup lines.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="border rounded-xl px-6 bg-background">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-2" className="border-0">
                <h3>
                  <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-foreground hover:no-underline py-5">
                    How is BetterOpnr different from other AI chat tools?
                  </AccordionTrigger>
                </h3>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5">
                  BetterOpnr is built specifically for dating conversations. Instead of general-purpose responses, it focuses on dating profiles, first messages, and realistic conversation starters designed to sound human and personal.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="border rounded-xl px-6 bg-background">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-3" className="border-0">
                <h3>
                  <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-foreground hover:no-underline py-5">
                    Does BetterOpnr send messages for me?
                  </AccordionTrigger>
                </h3>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5">
                  No. BetterOpnr does not automatically send messages. It provides suggested conversation starters and replies that you can edit, personalize, and send yourself so you stay in control of your voice.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="border rounded-xl px-6 bg-background">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-4" className="border-0">
                <h3>
                  <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-foreground hover:no-underline py-5">
                    Who should use BetterOpnr?
                  </AccordionTrigger>
                </h3>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5">
                  BetterOpnr is for anyone who wants help starting or continuing dating conversations. It's useful for people who feel stuck on first messages, want to improve their dating communication, or prefer guidance instead of guessing what to say.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="border rounded-xl px-6 bg-background">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-5" className="border-0">
                <h3>
                  <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-foreground hover:no-underline py-5">
                    Can BetterOpnr be used on different dating apps?
                  </AccordionTrigger>
                </h3>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-5">
                  Yes. BetterOpnr can be used with most dating apps. The conversation starters and suggestions are designed to work across platforms because they focus on profiles and context rather than app-specific templates.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* AI-Assisted Compliance Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
        <h2 className="text-lg sm:text-xl font-heading font-semibold text-foreground text-center mb-4">
          AI-Assisted, User-Controlled
        </h2>
        <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed text-center">
          <p>
            BetterOpnr provides AI-generated message suggestions that you can review and edit.
          </p>
          <p>
            The app does not send messages for you — you decide what to copy and share.
          </p>
          <p>
            AI suggestions may be inaccurate or inappropriate, so please review before using.
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
          <p className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground">
            Ready to spark better conversations?
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Join thousands of users who've upgraded their dating game with BetterOpnr.
          </p>
          <Button 
            onClick={() => { enterGuest(); navigate('/generator'); }}
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
