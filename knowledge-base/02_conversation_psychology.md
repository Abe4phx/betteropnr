---

document_id: 02_conversation_psychology
title: BetterOpnr Conversation Psychology
version: 0.1
status: draft
created: 2026-07-11
last_reviewed: 2026-07-11
owner: BetterOpnr
applies_to:

* opener_generation
* message_evaluation
* conversation_coaching
  dependencies:
* 01_core_principles
  review_cycle: quarterly

---

# 1. Cognitive Effort & Reply Friction

## Purpose

This section defines how BetterOpnr should think about the mental effort required for someone to read, understand, and respond to an opening message.

The objective is not simply to generate shorter messages. The objective is to reduce unnecessary friction while preserving personality, specificity, and authenticity.

---

# Research-Backed Finding

### Finding: People tend to favor information that is easy to mentally process.

**Evidence type:** Research-Backed Finding

**Claim**

Information that is easier to process is generally perceived more positively and judged more favorably than information that requires unnecessary cognitive effort.

**Confidence:** High

**Known limitations**

* Most processing-fluency research is not specific to online dating.
* Ease of processing alone does not determine attraction or response behavior.
* Novelty, humor, context, and relevance can justify additional complexity.

---

### BetterOpnr Interpretation

Reducing unnecessary mental effort should make an opener feel easier to engage with.

BetterOpnr should optimize for:

* immediate comprehension
* one clear conversational direction
* one recognizable emotional tone

BetterOpnr should not optimize for:

* minimum word count
* oversimplification
* removing personality

---

# BetterOpnr Product Concept

## Reply Friction

**Classification:** BetterOpnr Product Heuristic

### Definition

Reply Friction is the amount of mental effort required for a recipient to produce a natural response.

Reply Friction is not determined by message length alone.

Instead, it reflects how much work the recipient must do to understand the message, determine the sender's intent, and decide how to respond.

---

## Sources of High Reply Friction

A message may have high Reply Friction when it contains:

* multiple unrelated ideas
* multiple competing questions
* unclear intent
* unnecessary complexity
* references requiring excessive interpretation
* jokes that obscure the actual conversation
* abrupt topic changes
* excessive emotional intensity for the conversation stage

---

## Sources of Low Reply Friction

A message may have low Reply Friction when it contains:

* one primary conversational idea
* one obvious reply path
* clear emotional tone
* recognizable context
* natural language
* appropriate specificity
* conversational pacing consistent with the stage of the interaction

---

# BetterOpnr Product Heuristic

### Heuristic: One Conversation at a Time

**Evidence type:** BetterOpnr Product Heuristic

**Heuristic**

Messages built around one conversational objective are likely to require less cognitive effort than messages attempting to accomplish multiple objectives simultaneously.

**Example**

Weak:

> Your travel photos are amazing. I also like dogs. What's your favorite country? You seem really adventurous by the way.

Stronger:

> Your Iceland photo caught my attention. Was that trip as cold as it looks?

The stronger example asks the recipient to respond to one clear idea instead of deciding which of four ideas deserves attention.

**Evidence available**

* General cognitive-processing research
* Internal product reasoning

**Evidence missing**

* BetterOpnr production data
* Controlled A/B testing

**Confidence**

Low

**Status**

Hypothesis

---

# Generation Rules

When generating an opening message, BetterOpnr should:

* Prefer one primary conversational objective.
* Prefer one clear reply path.
* Remove sentences that do not support the main conversational direction.
* Preserve specificity even when simplifying.
* Avoid combining compliments, jokes, questions, and assumptions unless they reinforce the same topic.

BetterOpnr should not automatically shorten messages if doing so removes warmth, personality, or context.

---

# Evaluation Rules

When evaluating a generated opener, check the following:

### Primary Question

Can the recipient immediately understand:

1. what the sender is referring to?
2. why the sender brought it up?
3. how they could naturally respond?

If any answer is "no," the message likely has unnecessary Reply Friction.

### Indicators of Excessive Reply Friction

* More than one unrelated conversational topic.
* Multiple unrelated questions.
* Ambiguous emotional tone.
* References that require explanation.
* Excessive cleverness that obscures meaning.
* Sudden changes in direction.

---

# Future Experiment

## Hypothesis 02-001

Messages centered on one conversational objective and one clear reply path will produce a higher BetterOpnr Low-Edit Acceptance Rate than messages containing multiple competing conversational ideas.

### Primary Metric

Low-Edit Acceptance Rate

### Secondary Metrics

* Acceptance Rate
* Regeneration Rate
* Average edit distance

### Success Criteria

A statistically meaningful improvement in Low-Edit Acceptance Rate without increasing Regeneration Rate.

---

# Open Questions

* Does Reply Friction vary by user communication style?
* Does preferred Reply Friction differ by age or dating intention?
* Does humor increase or decrease Reply Friction depending on context?
* Should BetterOpnr intentionally increase Reply Friction in rare situations to create curiosity?
* Can Reply Friction be reliably scored before a message is shown to the user?

---

## Revision History

| Version | Date       | Status | Summary                                          |
| ------- | ---------- | ------ | ------------------------------------------------ |
| 0.1     | 2026-07-11 | Draft  | Added Cognitive Effort & Reply Friction section. |
