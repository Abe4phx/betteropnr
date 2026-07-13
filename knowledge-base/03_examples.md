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

## Revision History

| Version | Date | Status | Summary |
|---|---|---|---|
| 0.1 | 2026-07-12 | Draft | Created Example Library and added Example 01 — Travel Photo. |
| 0.2 | 2026-07-13 | Draft | Refactored Example 01 into the BetterOpnr Decision Library format. |
| 0.3 | 2026-07-13 | Draft | Added Decision Constraints and finalized the Decision Library template. |
