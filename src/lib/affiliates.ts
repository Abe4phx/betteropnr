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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

/**
 * Get a single affiliate for a category and optional country
 * Returns null if no affiliate is available
 */
export async function getAffiliateForCategory(
  category: AffiliateCategory, 
  country?: string
): Promise<Affiliate | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/affiliates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getForCategory',
        category,
        country,
      }),
    });

    if (!response.ok) {
      console.error('Failed to fetch affiliate:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.affiliate || null;
  } catch (error) {
    console.error('Error fetching affiliate:', error);
    return null;
  }
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
