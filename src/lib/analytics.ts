// Anonymous analytics tracking
// No personal data is collected

type AnalyticsEvent = 
  | 'generated_opener'
  | 'clicked_copy'
  | 'saved_opener'
  | 'generated_followup'
  | 'rated_item'
  | 'generated_variation';

interface EventData {
  [key: string]: string | number | boolean | undefined;
}

export const trackEvent = (event: AnalyticsEvent, data?: EventData) => {
  try {
    const eventData = {
      event,
      timestamp: new Date().toISOString(),
      ...data,
    };
    
    console.log('Analytics:', eventData);
    
    // Store in localStorage for local tracking
    const stored = localStorage.getItem('betterOpnr-analytics');
    const events = stored ? JSON.parse(stored) : [];
    events.push(eventData);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.shift();
    }
    
    localStorage.setItem('betterOpnr-analytics', JSON.stringify(events));
  } catch (e) {
    console.error('Failed to track event', e);
  }
};

export const getAnalytics = () => {
  try {
    const stored = localStorage.getItem('betterOpnr-analytics');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to get analytics', e);
    return [];
  }
};
