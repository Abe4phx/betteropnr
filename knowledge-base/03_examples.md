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

## Revision History

| Version | Date | Status | Summary |
|---|---|---|---|
| 0.1 | 2026-07-12 | Draft | Created Example Library and added Example 01 — Travel Photo. |
| 0.2 | 2026-07-13 | Draft | Refactored Example 01 into the BetterOpnr Decision Library format. |
| 0.3 | 2026-07-13 | Draft | Added Decision Constraints and finalized the Decision Library template. |
| 0.4 | 2026-07-13 | Draft | Added and normalized EX-002 Minimal Profile benchmark case. |
| 0.5 | 2026-07-13 | Draft | Added EX-003 Single Pet Photo benchmark case. |
| 0.6 | 2026-07-13 | Draft | Added EX-004 Hiking and Outdoors benchmark case. |
