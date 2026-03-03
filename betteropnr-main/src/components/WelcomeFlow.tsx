import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Zap, CheckCircle2 } from 'lucide-react';
import { Spark } from '@/components/ui/Spark';
import confetti from 'canvas-confetti';

interface WelcomeFlowProps {
  userName: string;
  onComplete: () => void;
}

const steps = [
  {
    icon: Sparkles,
    title: 'Welcome to BetterOpnr! 🎉',
    description: "We're thrilled to have you here. Let's get you started with creating amazing conversation openers.",
    buttonText: 'Show Me Around',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Openers',
    description: "Upload screenshots of dating profiles and we'll generate personalized conversation starters that get replies.",
    buttonText: 'Next',
  },
  {
    icon: Heart,
    title: 'Save Your Favorites',
    description: 'Found an opener you love? Save it to your collection and access it anytime.',
    buttonText: 'Next',
  },
  {
    icon: Zap,
    title: "You're All Set!",
    description: "Ready to start sparking amazing conversations? Let's create your first opener!",
    buttonText: 'Start Creating',
  },
];

export const WelcomeFlow = ({ userName, onComplete }: WelcomeFlowProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      // Confetti celebration on completion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B6B', '#FFD166', '#00B8A9'],
      });
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Decorative sparks */}
      <Spark 
        className="absolute top-20 right-20 pointer-events-none hidden md:block"
        animate="drift"
        duration={6}
        size={32}
      />
      <Spark 
        className="absolute bottom-32 left-24 pointer-events-none hidden md:block"
        animate="float"
        duration={7}
        size={28}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="max-w-lg w-full p-8 space-y-6 shadow-elegant relative overflow-hidden">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Content */}
            <div className="text-center space-y-6 pt-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>

              <div className="space-y-3">
                <h2 className="text-3xl font-heading font-bold text-foreground">
                  {currentStepData.title}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {currentStepData.description}
                </p>
              </div>

              {/* Step indicators */}
              <div className="flex justify-center gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'w-8 bg-primary'
                        : index < currentStep
                        ? 'w-2 bg-primary/50'
                        : 'w-2 bg-muted'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold text-lg py-6"
                size="lg"
              >
                {currentStepData.buttonText}
              </Button>

              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back
                </button>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
