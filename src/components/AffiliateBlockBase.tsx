import { ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AffiliateDisclosureInline from './AffiliateDisclosureInline';
import { getAffiliateForCategory, openAffiliateLink, Affiliate, AffiliateCategory } from '@/lib/affiliates';
import { useEffect, useState, useCallback } from 'react';

interface AffiliateBlockBaseProps {
  category: AffiliateCategory;
  headline: string;
  body: string;
  ctaText: string;
  disclosureVariant?: 'short' | 'long' | 'optional' | 'commission';
  className?: string;
  /** Unique key to prevent duplicate blocks on the same screen */
  blockKey?: string;
}

// Track which blocks have been rendered on current screen to prevent duplicates
const renderedBlocks = new Set<string>();

// Clear rendered blocks on navigation (called by components on mount)
export const clearRenderedBlocks = () => {
  renderedBlocks.clear();
};

/**
 * Base affiliate block component with guardrails:
 * - Never blocks core features (renders null if loading/unavailable)
 * - Links always open externally
 * - Dismissible by user
 * - Prevents duplicate rendering per screen via blockKey
 * - Only renders for active affiliates
 */
const AffiliateBlockBase = ({
  category,
  headline,
  body,
  ctaText,
  disclosureVariant = 'short',
  className = '',
  blockKey,
}: AffiliateBlockBaseProps) => {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    // Check for duplicate rendering
    const key = blockKey || category;
    if (renderedBlocks.has(key)) {
      setIsDuplicate(true);
      setLoading(false);
      return;
    }
    
    const fetchAffiliate = async () => {
      const result = await getAffiliateForCategory(category);
      setAffiliate(result);
      setLoading(false);
      
      // Register this block as rendered if affiliate exists
      if (result) {
        renderedBlocks.add(key);
      }
    };
    fetchAffiliate();
    
    // Cleanup: remove from rendered blocks when unmounted
    return () => {
      renderedBlocks.delete(key);
    };
  }, [category, blockKey]);

  const handleClick = useCallback(() => {
    if (affiliate) {
      // Always open externally with security attributes
      openAffiliateLink(affiliate.affiliate_url);
    }
  }, [affiliate]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    // Remove from rendered blocks so it won't block future renders
    const key = blockKey || category;
    renderedBlocks.delete(key);
  }, [blockKey, category]);

  // Guardrails: Don't render if:
  // - Still loading (never block core features)
  // - No active affiliate available
  // - User dismissed the block
  // - Duplicate on this screen
  if (loading || !affiliate || dismissed || isDuplicate) return null;

  return (
    <Card className={`p-6 bg-muted/50 border-border/30 relative ${className}`}>
      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss recommendation"
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="space-y-3 pr-8">
        <h4 className="text-base font-semibold text-foreground">
          {headline}
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {body}
        </p>
        <div className="flex flex-col gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClick}
            className="w-fit gap-2"
          >
            {ctaText}
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <AffiliateDisclosureInline variant={disclosureVariant} />
        </div>
      </div>
    </Card>
  );
};

export default AffiliateBlockBase;
