import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { 
  Affiliate,
  AffiliateCategory, 
  getAffiliateForCategory, 
  getCategoryForScreen,
  openAffiliateLink 
} from '@/lib/affiliates';
import AffiliateDisclosureInline from './AffiliateDisclosureInline';

interface AffiliateRecommendationProps {
  /** Explicit category to show */
  category?: AffiliateCategory;
  /** Screen name to auto-detect category */
  screen?: string;
  /** User's country code for geo-targeting */
  country?: string;
  /** Additional CSS classes */
  className?: string;
  /** Show long or short disclosure text */
  disclosureVariant?: 'short' | 'long';
}

/**
 * Contextual affiliate recommendation component
 * Shows ONE affiliate per screen based on category
 * Shows nothing if no affiliate is available (no fallback ads)
 */
const AffiliateRecommendation = ({
  category,
  screen,
  country,
  className = '',
  disclosureVariant = 'short',
}: AffiliateRecommendationProps) => {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);

  // Determine category from explicit prop or screen name
  const resolvedCategory = category || (screen ? getCategoryForScreen(screen) : null);
  
  useEffect(() => {
    const fetchAffiliate = async () => {
      if (!resolvedCategory) {
        setLoading(false);
        return;
      }
      
      const result = await getAffiliateForCategory(resolvedCategory, country);
      setAffiliate(result);
      setLoading(false);
    };
    
    fetchAffiliate();
  }, [resolvedCategory, country]);

  // Don't render anything while loading or if no category
  if (loading || !resolvedCategory || !affiliate) return null;
  
  const handleClick = () => {
    openAffiliateLink(affiliate.affiliate_url);
  };
  
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="underline underline-offset-2 decoration-muted-foreground/50 group-hover:decoration-foreground/50">
          {affiliate.brand}
        </span>
        <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
      </button>
      {affiliate.description && (
        <p className="text-xs text-muted-foreground/80 leading-relaxed">
          {affiliate.description}
        </p>
      )}
      <AffiliateDisclosureInline variant={disclosureVariant} className="mt-0.5" />
    </div>
  );
};

export default AffiliateRecommendation;
