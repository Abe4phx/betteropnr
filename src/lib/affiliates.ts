import { supabase } from "@/integrations/supabase/client";

export type AffiliateCategory = 
  | 'writing' 
  | 'photos' 
  | 'confidence' 
  | 'grooming' 
  | 'learning';

export interface Affiliate {
  id: string;
  affiliate_id: string;
  category: string;
  brand: string;
  countries_supported: string[];
  priority: number;
  is_active: boolean;
  affiliate_url: string;
  description: string | null;
}

/**
 * Get a single affiliate for a category and optional country
 * Returns null if no affiliate is available
 * 
 * Logic:
 * - Filter by category
 * - Filter by country (if provided, check if country is in countries_supported or if countries_supported is empty)
 * - Filter is_active = true
 * - Sort by priority descending
 * - Return the first result only
 */
export async function getAffiliateForCategory(
  category: AffiliateCategory, 
  country?: string
): Promise<Affiliate | null> {
  let query = supabase
    .from('affiliates')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('priority', { ascending: false })
    .limit(1);

  const { data, error } = await query;
  
  if (error || !data || data.length === 0) {
    return null;
  }

  // Filter by country if specified
  const affiliate = data[0];
  
  if (country) {
    const countriesSupported = affiliate.countries_supported || [];
    // If countries_supported is empty, it's available everywhere
    // Otherwise, check if the country is in the list
    if (countriesSupported.length > 0 && !countriesSupported.includes(country)) {
      // This affiliate doesn't support the user's country, try to find another
      const { data: allAffiliates } = await supabase
        .from('affiliates')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('priority', { ascending: false });
      
      if (!allAffiliates) return null;
      
      // Find first affiliate that supports the country or is globally available
      const matchingAffiliate = allAffiliates.find(a => {
        const countries = a.countries_supported || [];
        return countries.length === 0 || countries.includes(country);
      });
      
      return matchingAffiliate as Affiliate || null;
    }
  }

  return affiliate as Affiliate;
}

/**
 * Map screen context to affiliate category
 */
export function getCategoryForScreen(screen: string): AffiliateCategory | null {
  const screenMappings: Record<string, AffiliateCategory> = {
    // Message rewrite screens → Writing & clarity
    'generator': 'writing',
    'opener': 'writing',
    'rewrite': 'writing',
    'message': 'writing',
    'follow-up': 'writing',
    
    // Profile photo analysis screens → Profile photos
    'photo': 'photos',
    'photo-analysis': 'photos',
    'image': 'photos',
    
    // Confidence or conversation analysis screens → Confidence & mindset
    'confidence': 'confidence',
    'conversation': 'confidence',
    'analysis': 'confidence',
    'profile-review': 'confidence',
    
    // Pre-date or profile improvement screens → Grooming & appearance
    'date': 'grooming',
    'appearance': 'grooming',
    'style': 'grooming',
    
    // Long-term improvement screens → Learning & self-improvement
    'learning': 'learning',
    'improvement': 'learning',
    'course': 'learning',
    'tips': 'learning',
  };
  
  const lowerScreen = screen.toLowerCase();
  
  for (const [key, category] of Object.entries(screenMappings)) {
    if (lowerScreen.includes(key)) {
      return category;
    }
  }
  
  return null;
}

/**
 * Open affiliate link in external browser
 */
export function openAffiliateLink(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
