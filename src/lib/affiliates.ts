export type AffiliateCategory = 
  | 'writing' 
  | 'photos' 
  | 'confidence' 
  | 'grooming' 
  | 'learning';

export interface Affiliate {
  id: string;
  name: string;
  description: string;
  url: string;
  category: AffiliateCategory;
  countries?: string[]; // If empty/undefined, available everywhere
}

// Configure affiliates here - add real affiliates as needed
const affiliates: Affiliate[] = [
  // Example structure (uncomment and add real affiliates):
  // {
  //   id: 'grammarly',
  //   name: 'Grammarly',
  //   description: 'Improve your writing clarity and grammar',
  //   url: 'https://grammarly.com/?ref=betteropnr',
  //   category: 'writing',
  // },
  // {
  //   id: 'photofeeler',
  //   name: 'Photofeeler',
  //   description: 'Get feedback on your profile photos',
  //   url: 'https://photofeeler.com/?ref=betteropnr',
  //   category: 'photos',
  // },
];

/**
 * Get a single affiliate for a category and optional country
 * Returns null if no affiliate is available (shows nothing, no fallback)
 */
export function getAffiliateForCategory(
  category: AffiliateCategory, 
  country?: string
): Affiliate | null {
  const categoryAffiliates = affiliates.filter(a => a.category === category);
  
  if (categoryAffiliates.length === 0) return null;
  
  // If country is specified, try to find a country-specific affiliate first
  if (country) {
    const countrySpecific = categoryAffiliates.find(
      a => a.countries?.includes(country)
    );
    if (countrySpecific) return countrySpecific;
  }
  
  // Return first affiliate without country restriction, or null
  const globalAffiliate = categoryAffiliates.find(
    a => !a.countries || a.countries.length === 0
  );
  
  return globalAffiliate || null;
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
