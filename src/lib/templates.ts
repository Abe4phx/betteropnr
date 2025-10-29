// Quirky either/or questions
export const quirkyEitherOr = [
  "Coffee or tea?",
  "Mountains or beaches?",
  "Dogs or cats?",
  "Morning person or night owl?",
  "Books or movies?",
  "Summer or winter?",
  "Pizza or tacos?",
  "City life or countryside?",
  "Sweet or savory?",
  "Adventure or relaxation?",
  "Plan everything or go with the flow?",
  "Text or call?",
  "Indie music or mainstream hits?",
  "Cook at home or eat out?",
  "Early bird or fashionably late?",
];

// Playful hooks
export const playfulHook = [
  "Now I'm curious",
  "Honest question",
  "Not to start drama, but",
  "I have to know",
  "Quick poll",
  "Settle a debate for me",
  "Real talk",
  "No wrong answers, but",
  "Controversial opinion incoming",
  "Here's a thought",
  "Between you and me",
  "Random question",
  "This might sound weird, but",
  "Plot twist",
  "Fun fact check",
];

// Tone adverbs mapped by tone
export const toneAdverbsByTone: Record<string, string[]> = {
  playful: [
    "playfully",
    "cheekily",
    "lightheartedly",
    "jokingly",
    "teasingly",
    "mischievously",
    "spiritedly",
    "whimsically",
  ],
  sincere: [
    "genuinely",
    "honestly",
    "truly",
    "sincerely",
    "authentically",
    "earnestly",
    "thoughtfully",
    "openly",
  ],
  confident: [
    "confidently",
    "boldly",
    "assertively",
    "directly",
    "decisively",
    "firmly",
    "clearly",
    "straightforwardly",
  ],
  funny: [
    "hilariously",
    "amusingly",
    "comically",
    "wittily",
    "jokingly",
    "sarcastically",
    "humorously",
    "cleverly",
  ],
};

// Reusable conversation patterns (20+ templates)
export const conversationTemplates = [
  "You mentioned {interest}. {playfulHook} — {question}?",
  "As a fellow {interest} enthusiast, I need to know: {question}?",
  "Quick question: {quirkyEitherOr}. What's your pick and why?",
  "I noticed {interest} in your profile. What got you into that?",
  "So... {interest}. Tell me: {question}?",
  "{interest}? That's awesome! {question}?",
  "Real talk about {interest}: {question}?",
  "Okay, {interest} lover here with a burning question: {question}?",
  "Between {quirkyEitherOr}, which one and why?",
  "Your {interest} background is intriguing. {question}?",
  "{playfulHook}: if you could only {interest} one way for the rest of your life, how would you do it?",
  "I see you're into {interest}. What's something most people get wrong about it?",
  "Challenge: describe {interest} in three words. Go!",
  "{interest} fan! What's your hot take on it?",
  "If {interest} was a superpower, what would yours be?",
  "Confession: I'm curious about {interest}. What should I know first?",
  "{playfulHook} about {interest}: what's the best part nobody talks about?",
  "Plot twist: you can only enjoy {interest} with one other person. Who and why?",
  "{quirkyEitherOr} — and please explain your reasoning!",
  "Settle this for me: when it comes to {interest}, {question}?",
  "You seem passionate about {interest}. What's your origin story?",
  "Random but important: {interest} — overrated or underrated?",
  "If you could teach someone one thing about {interest}, what would it be?",
  "Real question about {interest}: {question}?",
  "{playfulHook} — what's the most unexpected thing about {interest}?",
  "Between you and me: what's your unpopular opinion on {interest}?",
  "Quick poll about {interest}: {question}?",
  "Challenge accepted? Convince me why {interest} is worth trying.",
  "So {interest} brought you here. What keeps you going?",
  "Not to be dramatic, but {interest} — life-changing or just fun?",
];

// Interest-based questions by tone
const interestQuestions: Record<string, string[]> = {
  playful: [
    "what's the weirdest thing about it?",
    "what would your superhero name be?",
    "if it had a theme song, what would it be?",
    "what's the most random fact about it?",
    "what's your guilty pleasure version?",
  ],
  sincere: [
    "what drew you to it?",
    "how has it changed you?",
    "what do you find most meaningful?",
    "what's your favorite memory related to it?",
    "what would you tell your past self about it?",
  ],
  confident: [
    "what's your take on it?",
    "what sets you apart in this area?",
    "what's your signature move?",
    "what's your strategy?",
    "what's your expert opinion?",
  ],
  funny: [
    "what's the funniest disaster you've had?",
    "what would aliens think of it?",
    "if it was a reality show, what would happen?",
    "what's the weirdest misconception about it?",
    "what's your hot mess story?",
  ],
};

/**
 * Helper function to build custom prompts based on interest and tone
 */
export function interestToQuestion(interest: string, tone: string): string {
  // Get random elements from each array
  const randomHook = playfulHook[Math.floor(Math.random() * playfulHook.length)];
  const randomEitherOr = quirkyEitherOr[Math.floor(Math.random() * quirkyEitherOr.length)];
  const randomTemplate = conversationTemplates[Math.floor(Math.random() * conversationTemplates.length)];
  
  // Get tone-specific question
  const toneQuestions = interestQuestions[tone] || interestQuestions.playful;
  const randomQuestion = toneQuestions[Math.floor(Math.random() * toneQuestions.length)];
  
  // Replace placeholders
  let result = randomTemplate
    .replace(/{interest}/g, interest)
    .replace(/{playfulHook}/g, randomHook)
    .replace(/{quirkyEitherOr}/g, randomEitherOr)
    .replace(/{question}/g, randomQuestion);
  
  return result;
}

/**
 * Generate multiple questions from a profile text
 */
export function generateQuestionsFromProfile(
  profileText: string,
  tones: string[],
  count: number = 4
): string[] {
  const results: string[] = [];
  
  // Extract interests (simple keyword extraction)
  const interests = extractInterests(profileText);
  const primaryInterest = interests[0] || "that";
  
  for (let i = 0; i < count; i++) {
    const tone = tones[i % tones.length];
    const question = interestToQuestion(primaryInterest, tone);
    results.push(question);
  }
  
  return results;
}

/**
 * Simple interest extraction from profile text
 */
function extractInterests(profileText: string): string[] {
  // Split by common separators and clean up
  const words = profileText
    .toLowerCase()
    .split(/[,;.\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 3 && s.length < 30);
  
  // Return unique interests
  return [...new Set(words)].slice(0, 5);
}

/**
 * Get a tone-specific adverb
 */
export function getToneAdverb(tone: string): string {
  const adverbs = toneAdverbsByTone[tone] || toneAdverbsByTone.playful;
  return adverbs[Math.floor(Math.random() * adverbs.length)];
}

/**
 * Build a follow-up question based on a previous message
 */
export function buildFollowUp(priorMessage: string, tone: string): string {
  const followUpTemplates = [
    `That's interesting! What else can you tell me about that?`,
    `${getToneAdverb(tone)}, what got you into that?`,
    `I'm curious — how did you discover that?`,
    `What do you love most about it?`,
    `That sounds amazing! What's next for you?`,
    `${getToneAdverb(tone)}, what would you recommend to a beginner?`,
    `How long have you been into that?`,
    `What's been your biggest surprise so far?`,
    `That's cool! What's your favorite part?`,
    `${getToneAdverb(tone)}, any fun stories about that?`,
  ];
  
  return followUpTemplates[Math.floor(Math.random() * followUpTemplates.length)];
}
