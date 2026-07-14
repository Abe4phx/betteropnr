---
document_id: 03_examples
title: BetterOpnr Example Library
version: 0.1
status: draft
created: 2026-07-12
last_reviewed: 2026-07-12
owner: BetterOpnr
applies_to:
  - opener_generation
  - message_evaluation
  - regression_testing
  - experimentation
dependencies:
  - 01_core_principles
  - 02_conversation_psychology
review_cycle: quarterly
---

# BetterOpnr Example Library

## Purpose

This document is the BetterOpnr Decision Library: a collection of high-quality reference examples used to demonstrate how BetterOpnr applies the principles defined in the Knowledge Base.

These are not templates.

They are case studies.

Each example explains:

- the profile context
- the communication objective
- why weaker approaches fail
- why the BetterOpnr approach succeeds
- which psychology principles were applied
- which internal strategies were selected

The goal is to teach reasoning rather than memorization.

Examples should remain realistic enough that a normal user could comfortably send them without significant editing.

Each case documents not only the selected generation, but also the evidence available, the constraints applied, the rejected strategies, and the reasoning behind the final decision. The objective is to make BetterOpnr's decision process transparent, testable, and reusable across future models.

---

# Example Structure

Every example in this document should follow the same format.

## Example ID

A unique identifier for the example, in the format EX-XXX.

## Profile Context

The information available to BetterOpnr.

## Available Evidence

Distinguish what is actually known from what must not be assumed.

- Recipient Profile Evidence
- Verified User Evidence
- Unsupported Assumptions

## Objective

What the generated opener is trying to accomplish.

## Generation Decision

The strategy and stage reasoning behind the recommended opener.

- Primary Strategy
- Secondary Strategy
- Conversation Stage
- Primary Optimization
- Reason for Selection

## Decision Constraints

Lists the non-negotiable boundaries the generator must respect when producing this message.

## Alternative Generation

A realistic but lower-quality message.

## Why It Wasn't Selected

Explain the weaknesses using BetterOpnr concepts.

## BetterOpnr Opener

The recommended message.

## Why It Works

Explain which communication principles were applied.

## Rejected Strategies

Reasonable alternative strategies that were considered and intentionally rejected, with the reason for each rejection.

## BetterOpnr Strategies Used

List the internal strategy labels.

## Psychology Principles Applied

Reference the relevant sections from:

knowledge-base/02_conversation_psychology.md

## Expected Evaluator Scores

Qualitative scores for the concepts an evaluator should check.

## Possible Variations

Optional alternatives that remain consistent with the same strategy.

---

# Example 01 — Travel Photo

**Example ID:** EX-001

## Profile Context

Bio:

"Usually planning my next trip."

Photos include:

- Iceland waterfall
- Coffee shop in Japan
- Hiking trail

Interests:

Travel
Photography
Coffee

## Available Evidence

Recipient Profile Evidence:

- Bio: "Usually planning my next trip."
- Photo: Iceland waterfall
- Photo: Coffee shop in Japan
- Photo: Hiking trail
- Stated interests: Travel, Photography, Coffee

Verified User Evidence:

- None supplied for this example.

Unsupported Assumptions:

- That the sender has also traveled to Iceland or elsewhere.
- That travel is a shared passion between the sender and the recipient.
- That the recipient personally enjoys hiking, since hiking appears only as a photo and not as a stated interest.
- That the photo represents the recipient's most meaningful or most recent trip.

## Objective

Create an opening message that demonstrates genuine attention, establishes an easy reply path, and avoids generic travel questions.

## Generation Decision

- Primary Strategy: Specific Observation
- Secondary Strategy: Productive Curiosity
- Conversation Stage: Stage 1 — Opening
- Primary Optimization: Low-Edit Acceptance Rate
- Reason for Selection: The Iceland waterfall photo is the most distinctive and visually specific detail available, giving it higher Distinctive Relevance than the bio text or the generic interest labels. Pairing a Specific Observation with a Productive Curiosity question keeps Reply Friction low while leaving the recipient something to elaborate on, without claiming any shared travel experience that isn't supported by Verified User Evidence.

## Decision Constraints

Generation must:

- Use only verified profile evidence.
- Remain within Stage 1 (Opening).
- Optimize for Low-Edit Acceptance Rate.
- Keep Reply Friction low.
- Preserve moderate warmth.
- Generate a natural, sendable message.
- Create a clear reply path.
- Stay profile-specific.

Generation must not:

- Invent user travel experience.
- Claim shared travel history.
- Infer unsupported interests.
- Escalate intimacy.
- Create compatibility claims.
- Use generic travel questions.
- Introduce unrelated humor.
- Require the recipient to carry the conversation alone.

## Alternative Generation

"What's your favorite place you've traveled?"

## Why It Wasn't Selected

Although relevant, this message could be sent to almost anyone with a travel photo.

It has:

- low Distinctive Relevance
- weak Connection Strength
- generic curiosity
- little conversational personality

The recipient carries nearly all of the conversational work.

## BetterOpnr Opener

"That Iceland waterfall photo looks like one of those places that makes every other vacation photo feel a little unfair. Was it as incredible in person as it looks?"

## Why It Works

The opener:

- references a specific profile detail
- creates a natural reply path
- contributes an observation before asking a question
- expresses moderate warmth
- preserves curiosity
- avoids claiming compatibility
- avoids exaggerated praise

The message feels personal without becoming overly familiar.

## Rejected Strategies

- Strategy: Playful Assumption (for example, "You seem like the kind of person who has a passport more stamped than mine.")
  Reason for rejection: Relies on an unsupported personality inference rather than the specific, confirmed photo detail, and is less distinctive than referencing the waterfall directly.

- Strategy: Shared Experience Prompt / Similarity Exploration (for example, referencing the sender's own travel history)
  Reason for rejection: No Verified User Evidence confirms the sender has comparable travel experience; using this strategy would introduce an Unsupported Similarity rather than a Confirmed or carefully qualified Possible connection.

- Strategy: High-Warmth Opener / Generic Praise (for example, "Wow, you seem so adventurous and amazing!")
  Reason for rejection: Disproportionate warmth for a Stage 1 — Opening interaction, low Interest Specificity, and risks reading as Unsupported Admiration rather than acknowledgment of a specific detail.

## BetterOpnr Strategies Used

- Specific Observation
- Observation Before Question
- Moderate Warmth
- Contextual Question
- Productive Curiosity
- Low Reply Friction

## Psychology Principles Applied

- Cognitive Effort & Reply Friction
- Question Asking & Responsiveness
- Reciprocity
- Novelty & Attention
- Warmth, Validation & Perceived Interest

## Expected Evaluator Scores

- Reply Friction: Low
- Conversation Balance: High
- Distinctive Relevance: High
- Warmth Calibration: Moderate
- Interest Specificity: High
- Disclosure Depth: None
- Connection Strength: Not applicable — no shared interest or common ground is claimed
- Stage Match: Correct for Stage 1 — Opening
- Risk Level: Low

No unsupported assumptions are made.

No fabricated common ground is introduced.

No premature intimacy is implied.

## Possible Variations

- "I can't decide whether I'd spend more time taking pictures there or just standing there staring. How long were you in Iceland?"

- "That waterfall deserves its own passport. Was that the highlight of the trip or did something else beat it?"

---

# Example 02 — Minimal Profile

**Example ID:** EX-002

## Profile Context

Bio:

"Just ask 🙂"

Photos:

- Mirror selfie
- Group photo with friends
- Coffee shop

Interests:

None listed

## Available Evidence

Recipient Profile Evidence:

- Mirror selfie
- Group photo
- Coffee shop photo
- Bio: "Just ask 🙂"

Verified User Evidence:

- None supplied for this example.

Unsupported Assumptions:

- Recipient enjoys coffee.
- Recipient is outgoing.
- Recipient is extroverted.
- Recipient enjoys nightlife.
- Recipient is sarcastic.
- Recipient wants playful banter.
- Recipient is looking for a serious relationship.
- Recipient enjoys travel.
- Recipient is confident.

## Objective

Generate an opening message that feels personal despite extremely limited information, while avoiding fabricated assumptions. This case measures BetterOpnr's ability to produce a useful, natural, and easy-to-send message when almost no profile information is available, optimizing for Low-Edit Acceptance Rate while resisting the primary failure mode of hallucinating unsupported details about the recipient.

## Generation Decision

- Primary Strategy: Recipient-Only Context
- Secondary Strategy: Low Reply Friction
- Conversation Stage: Stage 1 — Opening
- Primary Optimization: Low-Edit Acceptance Rate
- Reason for Selection: The available evidence is intentionally sparse. The strongest decision is to acknowledge the profile's minimal information without inventing personality traits, interests, or compatibility.

## Decision Constraints

Generation must:

- Use only available profile evidence.
- Remain Stage 1 appropriate.
- Keep Reply Friction low.
- Avoid assumptions.
- Create an easy reply path.
- Feel natural enough to send immediately.

Generation must not:

- Invent interests.
- Assume personality.
- Assume relationship goals.
- Claim common ground.
- Force humor.
- Create artificial novelty.
- Escalate intimacy.

## Alternative Generation

"So... what should I ask first?"

## Why It Wasn't Selected

Although playful, this message depends entirely on the bio and provides no conversational contribution from the sender.

It creates a weaker Conversation Balance and places most of the effort on the recipient.

## BetterOpnr Opener

"I feel like 'Just ask 🙂' is both an invitation and a little bit of a challenge. So I'll start simple—what's something you wish more people asked you about?"

## Why It Works

The opener:

- acknowledges the profile honestly
- avoids inventing information
- contributes an observation before asking a question
- creates a clear reply path
- demonstrates curiosity without interrogation
- preserves moderate warmth
- treats limited profile information as context rather than a limitation

Most importantly, it succeeds by resisting unsupported assumptions.

## Rejected Strategies

- Strategy: Confirmed Common Ground
  Reason for rejection: No verified overlap exists.

- Strategy: Specific Observation
  Reason for rejection: The available photos are too generic to support a distinctive observation confidently.

- Strategy: Humor First
  Reason for rejection: The profile provides insufficient evidence that humor is the safest opening strategy.

## BetterOpnr Strategies Used

- Recipient-Only Context
- Observation Before Question
- Conversation Balance
- Low Reply Friction
- Moderate Warmth

## Psychology Principles Applied

- Cognitive Effort & Reply Friction
- Reciprocity
- Uncertainty in Early Interaction
- Warmth, Validation & Perceived Interest
- Progressive Intimacy & Stage Matching

## Expected Evaluator Scores

- Reply Friction: Very Low
- Conversation Balance: High
- Distinctive Relevance: Moderate
- Warmth Calibration: Moderate
- Interest Specificity: Moderate
- Disclosure Depth: Level 0
- Connection Strength: Recipient Only
- Stage Match: Excellent
- Risk Level: Very Low

## Possible Variations

- "I respect the confidence of a bio that just says 'Just ask 🙂'. What's something that's way more interesting about you than people usually guess?"

---

**Example ID:** EX-003

# Example 03 — Single Pet Photo

## Profile Context

Bio:

"Fluent in sarcasm and dog hair."

Photos include:

- One photo with a golden retriever
- Two individual portraits
- One restaurant photo

Interests:

Dogs
Brunch
Comedy

## Available Evidence

Recipient Profile Evidence:

- The recipient has a golden retriever photo.
- The recipient explicitly lists dogs as an interest.
- The bio references dog hair.
- The recipient lists brunch and comedy as interests.

Verified User Evidence:

- None supplied for this example.

Unsupported Assumptions:

- The dog belongs to the recipient.
- The dog's name, age, temperament, or breed beyond visible appearance.
- The recipient prefers dogs over people.
- The recipient wants humor-first messaging.
- The recipient regularly takes the dog to brunch.
- The user owns or likes dogs.
- The recipient is highly sarcastic in conversation.

## Objective

Generate an opener that uses the pet-related profile context without relying on a generic compliment, inventing details about the dog, or forcing an exaggerated joke. The message should create an easy reply path and feel natural enough to send with minimal editing.

## Generation Decision

- Primary Strategy: Specific Observation
- Secondary Strategy: Playful Choice Question
- Conversation Stage: Stage 1 — Opening
- Primary Optimization: Low-Edit Acceptance Rate
- Reason for Selection: The dog photo and dog-hair reference provide the strongest verified conversational context. A light choice question creates a clear reply path while avoiding unsupported assumptions about ownership, personality, or shared experience.

## Decision Constraints

Generation must:

- Use only verified profile evidence.
- Remain appropriate for Stage 1.
- Keep Reply Friction low.
- Use moderate warmth.
- Create one clear reply path.
- Keep the pet reference conversational rather than overly complimentary.
- Avoid claiming that the user owns or loves dogs.
- Remain natural and immediately sendable.

Generation must not:

- Invent the dog's name or personality.
- Assume the dog belongs to the recipient.
- Claim shared pet ownership.
- Use "dog mom" or similar identity labels without evidence.
- Make the dog the recipient's entire personality.
- Use sexualized or appearance-based praise.
- Force sarcasm merely because the bio mentions it.
- Ask multiple unrelated questions.

## Alternative Generation

"Your dog is adorable. What's their name?"

## Why It Wasn't Selected

The message is relevant and easy to answer, but it relies on a generic pet compliment and assumes the dog belongs to the recipient.

It also creates limited Distinctive Relevance because similar wording could be sent to almost any profile containing a pet photo.

## BetterOpnr Opener

"The dog hair warning feels responsibly transparent. Be honest—does the golden retriever run the house, or just the photo selection?"

## Why It Works

The opener:

- uses two verified profile details
- transforms the bio into a playful observation
- creates one clear and low-effort reply path
- allows the recipient to confirm or correct the assumption
- uses light humor without becoming random
- demonstrates attention without claiming shared experience
- avoids generic praise
- maintains moderate warmth and Stage 1 rapport

The message treats the pet as a conversational hook without reducing the recipient to a pet-owner stereotype.

## Rejected Strategies

- Strategy: Confirmed Common Ground
  Reason for rejection: No verified user information confirms that the user owns or likes dogs.

- Strategy: Generic Pet Compliment
  Reason for rejection: "Your dog is cute" is relevant but interchangeable and offers limited conversational substance.

- Strategy: Sarcasm-Heavy Opener
  Reason for rejection: The bio mentions sarcasm, but aggressively matching that tone could feel forced before the recipient's actual communication style is known.

- Strategy: Brunch Question
  Reason for rejection: Brunch is listed as an interest, but the dog-hair bio and pet photo provide a more distinctive and connected conversational signal.

## BetterOpnr Strategies Used

- Specific Observation
- Contextual Surprise
- Playful Choice Question
- Observation Before Question
- Productive Curiosity
- Moderate Warmth
- Recipient-Only Context
- Low Reply Friction

## Psychology Principles Applied

- Cognitive Effort & Reply Friction
- Question Asking & Responsiveness
- Reciprocity
- Uncertainty in Early Interaction
- Novelty & Attention
- Warmth, Validation & Perceived Interest
- Progressive Intimacy & Stage Matching

## Expected Evaluator Scores

- Reply Friction: Very Low
- Conversation Balance: High
- Distinctive Relevance: High
- Warmth Calibration: Moderate
- Interest Specificity: High
- Disclosure Depth: Level 0
- Connection Strength: Recipient Only
- Stage Match: Excellent
- Risk Level: Low

## Possible Variations

- "I appreciate the advance notice about the dog hair. Is the golden retriever actually in charge, or just very convincing in photos?"

- "The dog hair disclaimer raises an important question: does the golden retriever approve the brunch locations too?"

---

**Example ID:** EX-004

# Example 04 — Hiking and Outdoors

## Profile Context

Bio:

"Weekends are for getting outside."

Photos include:

- Mountain summit photo
- Tent beside a lake
- Casual portrait

Interests:

Hiking
Camping
National parks

## Available Evidence

Recipient Profile Evidence:

- The recipient explicitly mentions spending weekends outside.
- The recipient has a mountain summit photo.
- The recipient has a camping photo beside a lake.
- The recipient lists hiking, camping, and national parks as interests.

Verified User Evidence:

- None supplied for this example.

Unsupported Assumptions:

- The user enjoys hiking or camping.
- The recipient hikes every weekend.
- The mountain photo was taken locally.
- The recipient completed a difficult climb.
- The recipient prefers mountains over other outdoor activities.
- The recipient is highly athletic.
- The recipient wants an adventure-focused partner.
- The recipient is experienced enough to recommend difficult trails.

## Objective

Generate a profile-specific outdoor opener that avoids the generic "Where was this taken?" question, does not invent shared interests, and gives the recipient an easy opportunity to discuss a meaningful preference or experience.

## Generation Decision

- Primary Strategy: Specific Observation
- Secondary Strategy: Preference Question
- Conversation Stage: Stage 1 — Opening
- Primary Optimization: Low-Edit Acceptance Rate
- Reason for Selection: The profile contains several verified outdoor signals, making the strongest strategy a recipient-only observation that explores how the person experiences the outdoors rather than merely identifying a photo location.

## Decision Constraints

Generation must:

- Use only verified recipient evidence.
- Remain appropriate for Stage 1.
- Keep Reply Friction low.
- Create one clear reply path.
- Avoid claiming shared outdoor experience.
- Use moderate warmth.
- Make the question more conversational than a location request.
- Stay natural and immediately sendable.

Generation must not:

- Claim the user hikes, camps, or visits national parks.
- Assume the summit was difficult.
- Assume the recipient is highly athletic.
- Ask several outdoor questions at once.
- Treat outdoor activity as the recipient's entire identity.
- Make a compatibility claim.
- Use exaggerated adventure language.
- Infer the location of any photo.

## Alternative Generation

"Where was that hiking photo taken?"

## Why It Wasn't Selected

The question is relevant and easy to answer, but it focuses on identifying a location rather than learning something meaningful about the recipient.

It has low Distinctive Relevance because it could be used on nearly any outdoor profile and gives the sender no conversational contribution.

## BetterOpnr Opener

"Your profile makes a strong case for spending weekends outside. Which wins for you: reaching the summit or finding the perfect place to set up camp?"

## Why It Works

The opener:

- combines multiple verified profile signals
- creates a clear preference-based reply path
- transforms profile evidence instead of merely restating it
- avoids assuming that the user shares the same interests
- encourages the recipient to reveal personality through a low-stakes choice
- uses moderate warmth without exaggerated praise
- remains specific while allowing several natural responses
- avoids the generic location-question pattern

The message uses outdoor context to explore preference rather than treating the profile as a geography quiz.

## Rejected Strategies

- Strategy: Confirmed Common Ground
  Reason for rejection: No verified user evidence confirms an outdoor interest or shared experience.

- Strategy: Location Question
  Reason for rejection: Asking where the photo was taken is relevant but generic and offers limited conversational depth.

- Strategy: Achievement Compliment
  Reason for rejection: Praising the summit as an impressive accomplishment would assume the difficulty of the hike and the recipient's role in completing it.

- Strategy: Adventure Compatibility Claim
  Reason for rejection: The profile supports an outdoor interest but does not establish compatibility with the user.

## BetterOpnr Strategies Used

- Specific Observation
- Preference Question
- Recipient-Only Context
- Observation Before Question
- Productive Curiosity
- Moderate Warmth
- Low Reply Friction
- Distinctive Relevance

## Psychology Principles Applied

- Cognitive Effort & Reply Friction
- Question Asking & Responsiveness
- Reciprocity
- Uncertainty in Early Interaction
- Similarity and Points of Connection
- Novelty and Attention
- Warmth, Validation & Perceived Interest
- Progressive Intimacy & Stage Matching

## Expected Evaluator Scores

- Reply Friction: Very Low
- Conversation Balance: High
- Distinctive Relevance: High
- Warmth Calibration: Moderate
- Interest Specificity: High
- Disclosure Depth: Level 0
- Connection Strength: Recipient Only
- Stage Match: Excellent
- Risk Level: Low

## Possible Variations

- "Your profile is making a convincing argument for getting outside more. Are you more interested in the hike itself or the view at the end?"

- "Summit photo and lakeside camping is a strong weekend lineup. Which one do you look forward to more?"

---

**Example ID:** EX-005

# Example 05 — Food and Cooking

## Profile Context

Bio:

"Trying to perfect homemade pasta and accepting volunteers for quality control."

Photos include:

- Homemade pasta dish
- Dinner at a small restaurant
- Casual portrait
- Farmers market

Interests:

Cooking
Italian food
Farmers markets

## Available Evidence

Recipient Profile Evidence:

- The recipient explicitly mentions making homemade pasta.
- The recipient jokingly asks for quality-control volunteers.
- The recipient has a photo of a homemade pasta dish.
- The recipient lists cooking, Italian food, and farmers markets as interests.
- The profile supports a light, playful tone.

Verified User Evidence:

- The user enjoys Italian food.
- The user does not cook often.

Unsupported Assumptions:

- The pasta in the photo was made entirely from scratch.
- The recipient is an expert cook.
- The recipient wants the user to invite themselves over.
- The recipient regularly hosts dinner guests.
- The recipient is looking for a partner who cooks.
- The user knows how to make pasta.
- The recipient's favorite food is pasta.
- The quality-control invitation is a literal invitation to meet.

## Objective

Generate an opener that builds reciprocity by contributing one verified user preference before asking a relevant question. The message should engage with the recipient's playful profile tone without turning the opener into a request for food, an invitation to their home, or an interview about cooking.

## Generation Decision

- Primary Strategy: Preference Disclosure
- Secondary Strategy: Opinion Before Question
- Conversation Stage: Stage 1 — Opening
- Primary Optimization: Low-Edit Acceptance Rate
- Reason for Selection: Verified user information supports a small contribution about enjoying Italian food while remaining honest about limited cooking experience. Pairing that contribution with a focused question creates stronger Conversation Balance than asking the recipient to explain their cooking process without offering anything in return.

## Decision Constraints

Generation must:

- Use only verified recipient and user evidence.
- Remain appropriate for Stage 1.
- Include one brief Level 1 disclosure.
- Keep Reply Friction low.
- Create one clear reply path.
- Match the profile's light playfulness without exaggerating it.
- Keep the focus on the recipient's pasta interest.
- Remain natural and immediately sendable.

Generation must not:

- Pretend the user knows how to make pasta.
- Ask to be invited over.
- Treat the quality-control line as consent to arrange a date.
- Make sexual or suggestive food jokes.
- Ask several cooking questions.
- Overstate the recipient's skill.
- Claim compatibility based on liking Italian food.
- Make the disclosure longer than the recipient-focused content.

## Alternative Generation

"That pasta looks amazing. What's your favorite thing to cook?"

## Why It Wasn't Selected

The message is relevant and easy to understand, but it relies on generic praise and asks the recipient to carry the interaction.

It also ignores the verified user preference that could make the exchange more reciprocal and personal without introducing unsupported common ground.

## BetterOpnr Opener

"I'm much better at appreciating Italian food than making it, so homemade pasta already has my respect. What part took the longest to get right?"

## Why It Works

The opener:

- uses verified information about both people
- contributes a brief, low-stakes user preference
- keeps the disclosure relevant to the recipient's profile
- creates one focused and answerable question
- invites the recipient to share effort or experience
- avoids pretending the user has cooking expertise
- communicates moderate warmth without exaggerated praise
- matches the profile's playful tone without forcing a joke
- creates balanced participation rather than an interview dynamic

The message uses reciprocity to make the question feel earned while preserving the recipient as the primary focus.

## Rejected Strategies

- Strategy: Generic Food Compliment
  Reason for rejection: Saying the pasta looks amazing is relevant but interchangeable and creates little conversational substance.

- Strategy: Quality-Control Volunteer Joke
  Reason for rejection: Volunteering to taste the food could sound like an immediate invitation request or premature meeting escalation.

- Strategy: Confirmed Common Ground
  Reason for rejection: Both people have relevant food interests, but enjoying Italian food and making homemade pasta are not equivalent experiences and should not be framed as strong compatibility.

- Strategy: Technical Cooking Question
  Reason for rejection: Asking about flour type, hydration, or equipment could sound performative because the user has no verified cooking expertise.

## BetterOpnr Strategies Used

- Preference Disclosure
- Light Self-Disclosure
- Opinion Before Question
- Disclosure Before Question
- Conversation Balance
- Specific Acknowledgment
- Moderate Warmth
- Low Reply Friction

## Psychology Principles Applied

- Cognitive Effort & Reply Friction
- Question Asking & Responsiveness
- Reciprocity
- Self-Disclosure
- Similarity and Points of Connection
- Novelty and Attention
- Warmth, Validation & Perceived Interest
- Progressive Intimacy & Stage Matching

## Expected Evaluator Scores

- Reply Friction: Very Low
- Conversation Balance: Very High
- Distinctive Relevance: High
- Warmth Calibration: Moderate
- Interest Specificity: High
- Disclosure Depth: Level 1
- Connection Strength: Broad Confirmed Connection
- Stage Match: Excellent
- Risk Level: Low

## Possible Variations

- "Italian food is one of my strongest interests and one of my weakest cooking skills. What was the hardest part of learning homemade pasta?"

- "I can confidently support the pasta quality-control process, but I'd be useless in production. Which part took the most practice?"

---

**Example ID:** EX-006

# Example 06 — Humor and Tone Matching

## Profile Context

Bio:

"Professionally keeping my plants alive. Emotionally attached to tacos."

Photos include:

- Smiling selfie
- Holding a taco
- Houseplants by a window
- Casual group photo

Interests:

Plants
Tacos
Comedy

## Available Evidence

Recipient Profile Evidence:

- The bio uses playful humor.
- The recipient references tacos.
- The recipient references houseplants.
- The recipient lists comedy as an interest.
- The overall profile tone is lighthearted.

Verified User Evidence:

- None supplied for this example.

Unsupported Assumptions:

- The recipient is highly sarcastic.
- The recipient wants constant jokes.
- The recipient enjoys absurd humor.
- The recipient is extroverted.
- The recipient is looking for someone funny.
- The recipient owns many plants.
- The tacos shown are the recipient's favorite food.

## Objective

Generate an opener that matches the recipient's playful tone without trying to outperform it. Primary communication objective: match tone without exceeding it.

## Generation Decision

- Primary Strategy: Tone Matching
- Secondary Strategy: Playful Observation
- Conversation Stage: Stage 1 — Opening
- Primary Optimization: Low-Edit Acceptance Rate
- Reason for Selection: The recipient has already established a playful tone. The strongest decision is to lightly continue that tone rather than introducing unrelated humor or trying to be significantly funnier than the profile itself.

## Decision Constraints

Generation must:

- Match the recipient's tone.
- Use only verified profile evidence.
- Keep Reply Friction low.
- Remain Stage 1 appropriate.
- Create one easy reply path.
- Preserve moderate warmth.
- Feel naturally conversational.

Generation must not:

- Try to "win" the joke.
- Use edgy humor.
- Use sarcasm unsupported by the profile.
- Force a punchline.
- Become overly clever.
- Introduce random humor.
- Escalate familiarity.

## Alternative Generation

"So... how many tacos does it take before a plant starts judging you?"

## Why It Wasn't Selected

Although playful, the joke is disconnected from the recipient's profile and asks the recipient to understand the joke before engaging with the conversation.

It optimizes for cleverness rather than connection.

## BetterOpnr Opener

"I appreciate that your bio somehow made tacos and houseplants sound equally important life priorities. Which one has been easier to keep alive?"

## Why It Works

The opener:

- builds directly from the recipient's existing humor
- contributes an observation before asking a question
- extends the profile's joke instead of replacing it
- creates an easy reply path
- preserves moderate warmth
- feels conversational rather than performative
- keeps the recipient as the center of attention

The humor exists to support conversation rather than become the conversation.

## Rejected Strategies

- Strategy: Humor First
  Reason for rejection: Trying to be funnier than the profile increases the risk of sounding artificial.

- Strategy: Generic Taco Joke
  Reason for rejection: The joke could apply to many profiles and creates low Distinctive Relevance.

- Strategy: Serious Plant Question
  Reason for rejection: Ignoring the recipient's playful tone misses an opportunity to build rapport naturally.

- Strategy: Confirmed Common Ground
  Reason for rejection: No verified user evidence supports shared interests.

## BetterOpnr Strategies Used

- Tone Matching
- Playful Observation
- Observation Before Question
- Moderate Warmth
- Low Reply Friction
- Recipient-Only Context

## Psychology Principles Applied

- Cognitive Effort & Reply Friction
- Reciprocity
- Novelty and Attention
- Warmth, Validation & Perceived Interest
- Progressive Intimacy & Stage Matching

## Expected Evaluator Scores

- Reply Friction: Very Low
- Conversation Balance: High
- Distinctive Relevance: High
- Warmth Calibration: Moderate
- Interest Specificity: High
- Disclosure Depth: Level 0
- Connection Strength: Recipient Only
- Stage Match: Excellent
- Risk Level: Low

## Possible Variations

- "I respect anyone willing to publicly rank tacos alongside houseplants. Which one gets more attention on an average weekend?"

- "Your bio feels like someone had to make a very difficult choice between gardening and tacos and wisely refused."

---

**Example ID:** EX-007

# Example 07 — Fitness Without Identity Assumptions

## Profile Context

Bio:

"Training for my first half marathon and trying not to complain about it too much."

Photos include:

- Running on a trail
- Race-day photo
- Casual portrait
- Coffee shop

Interests:

Running
Fitness
Podcasts

## Available Evidence

Recipient Profile Evidence:

- The recipient is training for a first half marathon.
- The recipient has a running photo.
- The recipient has a race-day photo.
- The recipient lists running, fitness, and podcasts as interests.
- The bio uses light self-aware humor.

Verified User Evidence:

- The user goes to the gym regularly.
- The user does not run long distances.

Unsupported Assumptions:

- The recipient is highly disciplined.
- The recipient is competitive.
- The recipient is trying to lose weight.
- The recipient is training for health reasons.
- The recipient enjoys every part of training.
- The recipient wants a fitness-focused partner.
- The recipient is an expert runner.
- The user understands half-marathon training.
- The recipient wants advice.
- The recipient follows a strict diet.

## Objective

Generate an opener that acknowledges the recipient's visible effort and stated goal without turning fitness into a personality judgment, body comment, achievement speech, or compatibility claim. The message should use the user's verified lack of long-distance running experience to create honest reciprocity and an easy reply path.

## Generation Decision

- Primary Strategy: Light Self-Disclosure
- Secondary Strategy: Effort Acknowledgment
- Conversation Stage: Stage 1 — Opening
- Primary Optimization: Low-Edit Acceptance Rate
- Reason for Selection: The profile provides a clear fitness goal and a lightly humorous tone. The user has relevant but non-equivalent fitness experience, so the strongest strategy is to acknowledge the training effort while honestly positioning the user as curious rather than knowledgeable.

## Decision Constraints

Generation must:

- Use only verified recipient and user evidence.
- Remain appropriate for Stage 1.
- Acknowledge effort without inferring personality.
- Keep Reply Friction low.
- Create one clear reply path.
- Use moderate warmth.
- Preserve the recipient's self-aware tone.
- Keep the user disclosure brief and truthful.
- Remain natural and immediately sendable.

Generation must not:

- Comment on the recipient's body.
- Infer discipline, ambition, competitiveness, or lifestyle identity.
- Give unsolicited training advice.
- Pretend the user is a runner.
- Claim shared fitness goals.
- Assume the recipient enjoys training.
- Ask several technical questions.
- Make a compatibility claim.
- Use motivational clichés.
- Turn the opener into praise without conversation.

## Alternative Generation

"Training for a half marathon takes serious discipline. What made you decide to do it?"

## Why It Wasn't Selected

The question is relevant, but the phrase "takes serious discipline" assigns a personality trait based on a single goal.

It also sounds more like an interview question and misses the opportunity to use the user's verified lack of long-distance running experience to create balanced participation.

## BetterOpnr Opener

"I'm consistent at the gym, but long-distance running still feels like a completely different species of exercise. What part of half-marathon training has surprised you most?"

## Why It Works

The opener:

- acknowledges the recipient's training without overpraising it
- uses a brief and verified user disclosure
- avoids pretending the user understands endurance running
- creates one focused and easy reply path
- invites a story or opinion rather than a factual training report
- preserves moderate warmth
- avoids body commentary
- avoids inferring discipline, competitiveness, or lifestyle identity
- matches the profile's self-aware tone without forcing humor

The message recognizes effort while leaving the recipient free to define what the experience means to them.

## Rejected Strategies

- Strategy: Achievement Compliment
  Reason for rejection: Praising discipline or dedication would infer stable personality traits from limited evidence.

- Strategy: Technical Training Question
  Reason for rejection: Asking about mileage, pacing, or training plans could sound performative because the user has no verified endurance-running expertise.

- Strategy: Confirmed Common Ground
  Reason for rejection: Regular gym attendance and half-marathon training are related but not equivalent experiences and should not be framed as strong commonality.

- Strategy: Body or Appearance Compliment
  Reason for rejection: The profile supports conversation about a stated goal, not commentary on the recipient's body.

- Strategy: Motivational Encouragement
  Reason for rejection: Generic encouragement may sound patronizing or create less conversational substance than curiosity about the recipient's experience.

## BetterOpnr Strategies Used

- Light Self-Disclosure
- Preference Disclosure
- Effort Acknowledgment
- Disclosure Before Question
- Conversation Balance
- Specific Acknowledgment
- Moderate Warmth
- Low Reply Friction

## Psychology Principles Applied

- Cognitive Effort & Reply Friction
- Question Asking & Responsiveness
- Reciprocity
- Self-Disclosure
- Similarity and Points of Connection
- Warmth, Validation & Perceived Interest
- Progressive Intimacy & Stage Matching

## Expected Evaluator Scores

- Reply Friction: Very Low
- Conversation Balance: Very High
- Distinctive Relevance: High
- Warmth Calibration: Moderate
- Interest Specificity: High
- Disclosure Depth: Level 1
- Connection Strength: Broad Possible Connection
- Stage Match: Excellent
- Risk Level: Low

## Possible Variations

- "I can handle a regular gym routine, but half-marathon training sounds like its own universe. What part has been easier or harder than you expected?"

- "Long-distance running is outside my expertise, so I'm curious: what's been the most unexpectedly enjoyable part of training?"

---

**Example ID:** EX-008

# Example 08 — Music and Taste Without Identity Assumptions

## Profile Context

Bio:

"Always looking for my next concert."

Photos include:

- Outdoor concert
- Casual portrait
- Friends at a music festival

Interests:

Live music
Indie music
Coffee

## Available Evidence

Recipient Profile Evidence:

- The recipient enjoys live music.
- The recipient attends concerts.
- The recipient attended a music festival.
- The recipient lists indie music as an interest.
- Coffee is listed as an interest.

Verified User Evidence:

- The user enjoys live music.
- The user listens to a wide variety of music.

Unsupported Assumptions:

- The recipient's favorite artist is indie.
- The recipient attends concerts frequently.
- Music is central to the recipient's identity.
- The recipient plays an instrument.
- The recipient prefers festivals over smaller venues.
- The recipient wants a music-focused relationship.
- The user likes the same artists.
- Shared interest automatically implies compatibility.

## Objective

Generate an opener that explores the recipient's taste without assuming identity, compatibility, or shared musical preferences. Build reciprocity through a small verified user disclosure while creating a natural opportunity for the recipient to express personal preference.

## Generation Decision

- Primary Strategy: Preference Exploration
- Secondary Strategy: Light Self-Disclosure
- Conversation Stage: Stage 1 — Opening
- Primary Optimization: Low-Edit Acceptance Rate
- Reason for Selection: The profile contains clear music-related interests and the user has verified interest in live music. The strongest strategy is to explore preference rather than factual knowledge, artist trivia, or compatibility.

## Decision Constraints

Generation must:

- Use only verified evidence.
- Remain appropriate for Stage 1.
- Keep Reply Friction low.
- Include one brief user disclosure.
- Explore preference rather than expertise.
- Create one easy reply path.
- Preserve moderate warmth.
- Remain natural and immediately sendable.

Generation must not:

- Assume favorite artists.
- Assume personality from music taste.
- Turn the opener into trivia.
- Pretend shared musical knowledge.
- Make compatibility claims.
- Suggest attending a concert together.
- Ask multiple music questions.
- Use generic "favorite band" wording.

## Alternative Generation

"Who's your favorite band?"

## Why It Wasn't Selected

Although relevant, the question is generic, interview-like, and provides no conversational contribution from the sender.

It creates little Distinctive Relevance and could appear on thousands of profiles.

## BetterOpnr Opener

"I'll listen to almost anything live if the atmosphere is good, so I'm always curious about what makes a concert memorable for someone else. What's been your favorite live show so far?"

## Why It Works

The opener:

- uses verified interests from both people
- contributes a brief user disclosure
- explores experience rather than trivia
- encourages storytelling
- avoids assuming musical identity
- avoids compatibility claims
- creates one clear reply path
- preserves moderate warmth
- keeps the recipient as the primary focus

The conversation becomes about memorable experiences rather than testing music knowledge.

## Rejected Strategies

- Strategy: Favorite Artist Question
  Reason for rejection: Generic and low in Distinctive Relevance.

- Strategy: Shared Taste Claim
  Reason for rejection: No verified evidence supports overlapping musical preferences.

- Strategy: Music Trivia
  Reason for rejection: Trivia creates evaluation instead of conversation.

- Strategy: Concert Invitation
  Reason for rejection: Suggesting future plans exceeds Stage 1 rapport.

## BetterOpnr Strategies Used

- Preference Exploration
- Light Self-Disclosure
- Conversation Balance
- Productive Curiosity
- Moderate Warmth
- Recipient-Only Context
- Low Reply Friction

## Psychology Principles Applied

- Cognitive Effort & Reply Friction
- Question Asking & Responsiveness
- Reciprocity
- Self-Disclosure
- Similarity and Points of Connection
- Warmth, Validation & Perceived Interest
- Progressive Intimacy & Stage Matching

## Expected Evaluator Scores

- Reply Friction: Very Low
- Conversation Balance: Very High
- Distinctive Relevance: High
- Warmth Calibration: Moderate
- Interest Specificity: High
- Disclosure Depth: Level 1
- Connection Strength: Broad Confirmed Connection
- Stage Match: Excellent
- Risk Level: Low

## Possible Variations

- "Live music is one of those things that's almost impossible to judge from a playlist alone. What's the concert you still think about?"

- "I like that your profile talks about concerts instead of favorite artists. Which live show surprised you the most?"

---

## Revision History

| Version | Date | Status | Summary |
|---|---|---|---|
| 0.1 | 2026-07-12 | Draft | Created Example Library and added Example 01 — Travel Photo. |
| 0.2 | 2026-07-13 | Draft | Refactored Example 01 into the BetterOpnr Decision Library format. |
| 0.3 | 2026-07-13 | Draft | Added Decision Constraints and finalized the Decision Library template. |
| 0.4 | 2026-07-13 | Draft | Added and normalized EX-002 Minimal Profile benchmark case. |
| 0.5 | 2026-07-13 | Draft | Added EX-003 Single Pet Photo benchmark case. |
| 0.6 | 2026-07-13 | Draft | Added EX-004 Hiking and Outdoors benchmark case. |
| 0.7 | 2026-07-14 | Draft | Added EX-005 Food and Cooking benchmark case. |
| 0.8 | 2026-07-14 | Draft | Added EX-006 Humor and Tone Matching benchmark case. |
| 0.9 | 2026-07-14 | Draft | Added EX-007 Fitness Without Identity Assumptions benchmark case. |
| 1.0 | 2026-07-14 | Draft | Added EX-008 Music and Taste Without Identity Assumptions benchmark case. |
