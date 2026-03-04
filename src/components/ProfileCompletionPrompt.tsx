import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileCompletionPromptProps {
  onDismiss: () => void;
}

export const ProfileCompletionPrompt = ({ onDismiss }: ProfileCompletionPromptProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleSetupProfile = () => {
    navigate('/');
    onDismiss();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-3 flex-1">
            <div>
              <h3 className="text-lg font-heading font-semibold text-foreground">
                Complete Your Profile
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your profile information to get better, more personalized conversation starters
              </p>
            </div>
            <Button onClick={handleSetupProfile} size="sm" className="bg-primary hover:bg-primary/90">
              Set Up Profile
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
