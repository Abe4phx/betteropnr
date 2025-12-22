import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AffiliateDisclosureInline from './AffiliateDisclosureInline';
import { getAffiliateForCategory, openAffiliateLink, Affiliate } from '@/lib/affiliates';
import { useEffect, useState } from 'react';

interface GroomingAffiliateBlockProps {
  className?: string;
}

/**
 * Grooming affiliate recommendation block for profile improvement screens
 * Shows nothing if no affiliate is available
 */
const GroomingAffiliateBlock = ({ className = '' }: GroomingAffiliateBlockProps) => {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAffiliate = async () => {
      const result = await getAffiliateForCategory('grooming');
      setAffiliate(result);
      setLoading(false);
    };
    fetchAffiliate();
  }, []);

  // Don't render if loading or no affiliate available
  if (loading || !affiliate) return null;

  const handleClick = () => {
    openAffiliateLink(affiliate.affiliate_url);
  };

  return (
    <Card className={`p-6 bg-muted/50 border-border/30 ${className}`}>
      <div className="space-y-3">
        <h4 className="text-base font-semibold text-foreground">
          First impressions go beyond texting
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Skincare, grooming, and presentation can affect how your profile is perceived.
        </p>
        <div className="flex flex-col gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            className="w-fit gap-2"
          >
            View grooming recommendations
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <AffiliateDisclosureInline variant="optional" />
        </div>
      </div>
    </Card>
  );
};

export default GroomingAffiliateBlock;
