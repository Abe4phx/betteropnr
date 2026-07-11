---

document_id: knowledge_base_readme
title: BetterOpnr Knowledge Base Governance
version: 0.1
status: active
created: 2026-07-11
last_reviewed: 2026-07-11
owner: BetterOpnr
applies_to:

* knowledge_base_authoring
* evidence_management
* product_heuristics
* testing
* model_evaluation
* future_retrieval_systems
  dependencies:
* 01_core_principles
  review_cycle: quarterly

---

# BetterOpnr Knowledge Base

## Purpose

The BetterOpnr Knowledge Base is the structured intellectual foundation for BetterOpnr’s communication intelligence.

It is intended to improve:

* Opener generation
* Follow-up generation
* Re-engagement
* Profile analysis
* Conversation coaching
* Message evaluation
* Personalization
* Experiment design
* Future communication products

The knowledge base is not a collection of generic dating advice and should not become one oversized AI prompt.

It should function as a versioned system of principles, findings, heuristics, examples, failure patterns, and evaluation criteria that can be selectively used by BetterOpnr products.

## Source of Truth

The Markdown files inside the `knowledge-base` directory are the authoritative versions of the BetterOpnr Knowledge Base.

External documents, notes, chats, spreadsheets, and brainstorming tools may be used during development, but finalized knowledge must be transferred into the appropriate Markdown file.

Application prompts, model instructions, and generated outputs must not be treated as the authoritative source of BetterOpnr knowledge.

## Knowledge Base Structure

The initial planned structure is:

1. `01_core_principles.md`
2. `02_conversation_psychology.md`
3. `03_examples.md`
4. `04_common_failures.md`
5. `05_profile_patterns.md`
6. `06_humor.md`
7. `07_flirting.md`
8. `08_followups.md`
9. `09_red_flags.md`
10. `10_quality_checklist.md`

Additional files may be created when a topic becomes sufficiently distinct, substantial, and reusable.

New files should not be created merely to avoid organizing an existing file properly.

## File Responsibilities

### `01_core_principles.md`

Defines the stable governing doctrine for BetterOpnr communication intelligence.

It should contain:

* Product objectives
* Universal communication principles
* Data and privacy principles
* Universal requirements
* Universal failure conditions
* Measurement philosophy

It should not contain large example libraries, detailed humor tactics, or extensive profile-pattern catalogs.

### `02_conversation_psychology.md`

Defines relevant psychological and behavioral principles involved in starting and progressing conversations.

It may include:

* Cognitive effort
* Curiosity
* Reciprocity
* Self-disclosure
* Uncertainty
* Attention
* Similarity
* Novelty
* Emotional tone
* Social risk
* Trust development

It must distinguish research findings from speculation and product heuristics.

### `03_examples.md`

Contains curated examples and structured comparisons.

It may include:

* Strong versus weak messages
* Before-and-after rewrites
* Context-to-message transformations
* Style variations
* Profile-specific examples
* Stage-specific examples

Examples must be labeled by strategy and should not be treated as universal templates.

### `04_common_failures.md`

Documents recurring failure modes.

It may include:

* Generic output
* Fabricated context
* Excessive cleverness
* Interview-style questioning
* Premature escalation
* Overwriting
* Voice mismatch
* Repetition
* Weak reply paths
* Uncomfortable assumptions

Each failure pattern should include detection criteria and corrective guidance.

### `05_profile_patterns.md`

Defines recurring profile structures and how BetterOpnr should interpret them.

It may include:

* Sparse profiles
* Prompt-heavy profiles
* Travel-focused profiles
* Pet-focused profiles
* Humor-heavy profiles
* Highly polished profiles
* Contradictory profiles
* Profiles with weak conversational material

It must not make unsupported claims about personality, intent, or identity.

### `06_humor.md`

Defines humor strategies, limitations, risk levels, and contextual appropriateness.

It may include:

* Playful observations
* Exaggeration
* Benign teasing
* Callbacks
* Contrast
* Misinterpretation
* Absurdity
* Self-aware humor

It should document when humor should not be used.

### `07_flirting.md`

Defines appropriate flirtation levels and progression.

It may include:

* Warm interest
* Playful interest
* Compliments
* Suggestive language
* Escalation
* Reciprocity signals
* Boundaries
* Stage appropriateness

It must clearly distinguish flirting from pressure, entitlement, sexualization, and manipulation.

### `08_followups.md`

Defines strategies for continuing, progressing, or reviving conversations.

It may include:

* Building on replies
* Avoiding interviews
* Changing topics
* Introducing self-disclosure
* Deepening rapport
* Suggesting a date
* Re-engaging after silence
* Ending respectfully

### `09_red_flags.md`

Defines content and situations requiring caution, refusal, redirection, or stronger safety handling.

It may include:

* Harassment
* Coercion
* Repeated pursuit
* Manipulation
* Threats
* Sensitive information
* Degrading language
* Sexual content without contextual support
* Signs of scams or unsafe interactions

This file should not diagnose users or recipients.

### `10_quality_checklist.md`

Defines the operational evaluation rubric for generated messages.

It should convert BetterOpnr principles into testable checks, scores, or failure gates.

It may include:

* Context accuracy
* Specificity
* Reply-path clarity
* Voice fidelity
* Warmth
* Originality
* Risk
* Flirtation
* Safety
* Stage appropriateness
* Length
* Continuation potential

## Required Metadata

Every knowledge-base Markdown file must begin with YAML frontmatter.

At minimum, the metadata must include:

```yaml
---
document_id:
title:
version:
status:
created:
last_reviewed:
owner:
applies_to:
dependencies:
review_cycle:
---
```

### Metadata Definitions

#### `document_id`

A unique, stable identifier.

The identifier should not change when the title changes.

#### `title`

The human-readable document name.

#### `version`

The current document version.

Use the following convention:

* `0.x` for drafts and early development
* `1.0` for the first production-approved version
* Increment the minor version for meaningful additions or refinements
* Increment the major version for substantial changes to the document’s purpose or doctrine

#### `status`

Allowed initial values:

* `draft`
* `active`
* `under_review`
* `deprecated`

#### `created`

The date the document was first created, in `YYYY-MM-DD` format.

#### `last_reviewed`

The most recent date the document received substantive review.

A spelling correction alone does not require changing `last_reviewed`.

#### `owner`

The person, team, or organization responsible for the document.

#### `applies_to`

The BetterOpnr capabilities or workflows governed by the file.

#### `dependencies`

Other knowledge-base files that should be understood before applying the document.

#### `review_cycle`

The intended review frequency.

The default review cycle is quarterly unless the subject changes quickly or is directly affected by product experimentation.

## Evidence Classification

Every substantive behavioral claim should be classified as one of the following:

* Research-Backed Finding
* Industry Data
* BetterOpnr Product Heuristic

Statements that are merely definitions, file-management rules, or product decisions do not require an evidence label.

## Research-Backed Finding

A Research-Backed Finding is supported by one or more of the following:

* Peer-reviewed research
* Academic working paper
* Credible preprint with transparent methodology
* Documented behavioral experiment
* Large-scale dataset with sufficient methodological detail
* High-quality systematic review or meta-analysis

Each Research-Backed Finding should include:

* Claim
* Source
* Publication date
* Study population or dataset
* Method summary
* Relevant limitations
* Confidence level
* Product implication

Recommended format:

```markdown
### Finding: Descriptive title

**Evidence type:** Research-Backed Finding  
**Claim:**  
**Source:**  
**Publication date:**  
**Population or dataset:**  
**Method summary:**  
**Limitations:**  
**Confidence:** Low | Moderate | High  
**Product implication:**  
```

A research finding should not be generalized beyond the population, platform, culture, or context studied without clearly labeling the generalization as an inference.

## Industry Data

Industry Data is information supplied by:

* Dating platforms
* Dating-industry companies
* Communication platforms
* Market-research organizations
* Companies with relevant first-party behavioral data

Each Industry Data entry should include:

* Claim
* Publisher
* Publication date
* Data source, if disclosed
* Methodology, if disclosed
* Commercial incentives or conflicts
* Limitations
* Confidence level
* Product implication

Recommended format:

```markdown
### Finding: Descriptive title

**Evidence type:** Industry Data  
**Claim:**  
**Publisher:**  
**Publication date:**  
**Data source:**  
**Methodology disclosed:** Yes | Partial | No  
**Commercial considerations:**  
**Limitations:**  
**Confidence:** Low | Moderate | High  
**Product implication:**  
```

Platform recommendations should not automatically be treated as scientifically validated.

## BetterOpnr Product Heuristic

A BetterOpnr Product Heuristic is an internal working rule developed from:

* Founder judgment
* Expert review
* User feedback
* Internal message evaluation
* Behavioral analytics
* Controlled experiments
* Observed user edits
* Outcome data
* Repeated production patterns

Each product heuristic should include:

* Heuristic
* Rationale
* Evidence available
* Evidence missing
* Risks or exceptions
* Confidence level
* Measurement plan
* Status

Recommended format:

```markdown
### Heuristic: Descriptive title

**Evidence type:** BetterOpnr Product Heuristic  
**Heuristic:**  
**Rationale:**  
**Evidence available:**  
**Evidence missing:**  
**Exceptions or risks:**  
**Confidence:** Low | Moderate | High  
**Measurement plan:**  
**Status:** Hypothesis | Testing | Supported | Rejected | Retired  
```

Founder judgment alone is valid for creating an initial heuristic, but it must remain labeled as a hypothesis until BetterOpnr collects supporting evidence.

## Confidence Levels

### Low Confidence

Use when:

* Evidence is limited
* Methodology is unclear
* The finding comes from a single weak source
* The claim requires substantial inference
* BetterOpnr has little internal data
* Results may depend heavily on context

Low-confidence findings may guide exploration but should not create strict generation rules.

### Moderate Confidence

Use when:

* Multiple relevant sources point in the same direction
* A credible study supports the claim but has meaningful limitations
* BetterOpnr has repeated internal observations
* The finding appears reliable within a defined context

Moderate-confidence findings may influence generation and scoring but should allow exceptions.

### High Confidence

Use when:

* Strong evidence is replicated or broadly supported
* The principle is consistent across multiple credible sources
* BetterOpnr has substantial internal validation
* The claim has clear boundaries and limited contradictory evidence
* The principle concerns an established safety or ethical requirement

High-confidence findings may support stronger generation rules or quality gates.

Confidence should reflect the strength of evidence, not how strongly the author personally believes the claim.

## Source Standards

Prefer sources in this order when available:

1. Peer-reviewed research
2. Systematic reviews and meta-analyses
3. Transparent large-scale datasets
4. Credible academic preprints
5. First-party platform data with disclosed methodology
6. Reputable market research
7. Expert analysis with clear reasoning
8. BetterOpnr internal evidence
9. Founder judgment
10. Anecdotal observations

Lower-ranked sources are not automatically unusable.

They must be labeled accurately and should not support stronger conclusions than the evidence permits.

## Citation Requirements

Each external source should include enough information to locate and verify it.

At minimum, record:

* Author or organization
* Title
* Publication or release date
* Publication, platform, or journal
* URL or persistent identifier when available
* Date accessed when the content may change

Do not rely on an AI-generated summary as the source.

Do not cite search-result snippets as evidence.

Do not cite a source that has not been reviewed directly.

Direct quotations should be used sparingly. Prefer accurate paraphrasing accompanied by a citation.

## Contradictory Evidence

Contradictory evidence must not be removed merely because it conflicts with a preferred product rule.

When credible evidence conflicts, document:

* The competing findings
* Differences in population
* Differences in methodology
* Differences in platform or context
* Possible explanations
* Current BetterOpnr interpretation
* Remaining uncertainty

Recommended format:

```markdown
### Evidence Conflict: Descriptive title

**Position A:**  
**Supporting evidence:**  

**Position B:**  
**Supporting evidence:**  

**Likely sources of disagreement:**  
**BetterOpnr interpretation:**  
**Current confidence:**  
**Testing opportunity:**  
```

## Product Decisions Versus Behavioral Claims

A product decision and a behavioral claim are not the same.

Example product decision:

> BetterOpnr will not generate insulting or coercive messages.

This does not require research evidence because it is a product, safety, and brand standard.

Example behavioral claim:

> Light teasing increases response rates.

This requires evidence classification, limitations, and contextual qualification.

Product decisions should not be disguised as scientific findings.

Scientific findings should not automatically become product requirements without considering safety, brand, user trust, and product strategy.

## Universal Rules Versus Conditional Rules

Avoid presenting conditional findings as universal truths.

A rule should specify relevant conditions when performance may vary by:

* User communication style
* Recipient profile
* Platform
* Age range
* Gender or orientation context
* Cultural context
* Dating intention
* Conversation stage
* Existing rapport
* Flirtation preference
* Humor preference
* Risk tolerance

Use language such as:

* “may be more effective when”
* “appears useful in”
* “should be considered when”
* “avoid when”
* “requires stronger contextual support”

Do not use words such as “always,” “never,” “guaranteed,” or “proven” unless the statement concerns a deliberate BetterOpnr safety rule or an exceptionally well-supported principle with clearly defined boundaries.

## Examples Are Not Evidence

A strong example demonstrates how a principle might be applied.

It does not prove that the principle works.

Examples should be labeled by:

* Context
* Strategy
* Tone
* Risk level
* Conversation stage
* Intended reply path
* Relevant principles
* Known limitations

Example libraries should contain variation and counterexamples rather than implying one correct sentence structure.

## Knowledge Base Versus Runtime Prompt

The complete knowledge base should not automatically be inserted into every production prompt.

Future runtime integration may use:

* Selected principles
* Structured retrieval
* Rule-based filters
* Quality scoring
* Context-specific modules
* Few-shot examples
* User-specific preferences
* Model-specific instructions
* Pre-generation planning
* Post-generation evaluation

The knowledge base is the full intellectual system.

A runtime prompt is only one implementation surface for selected parts of that system.

## Testing and Validation

BetterOpnr should connect knowledge-base rules to measurable product behavior when feasible.

Potential behavioral signals include:

* Message selected
* Message copied
* Message saved
* Message shared
* Message edited
* Edit distance
* Regeneration requested
* Tone changed
* Length changed
* User rating
* “Sounds like me” rating
* Reported reply
* Reported positive reply
* Reported conversation continuation
* Reported date progression

Testing should identify:

* The rule being tested
* The relevant user or context segment
* The generated variants
* The primary metric
* Guardrail metrics
* Sample size
* Test duration
* Result
* Limitations
* Decision

A result should not be labeled conclusive when the sample is too small, highly self-selected, or dependent on voluntary reporting.

## Updating a Heuristic

When evidence supports or challenges a heuristic:

1. Update the relevant knowledge-base file.
2. Change the heuristic’s confidence or status.
3. Document the supporting evidence.
4. Record important exceptions.
5. Update the document version.
6. Update `last_reviewed`.
7. Record the change in the document’s revision history.
8. Evaluate whether runtime behavior or scoring must change.

Rejected heuristics should not be silently deleted.

They should be retained or summarized when preserving them prevents the same unsupported idea from being reintroduced later.

## Revision History

Every knowledge-base file should end with a revision-history section.

Recommended format:

```markdown
## Revision History

| Version | Date | Status | Summary |
|---|---|---|---|
| 0.1 | YYYY-MM-DD | Draft | Initial document created. |
```

Revision summaries should describe substantive changes rather than minor formatting corrections.

## Authoring Workflow

Use this workflow for each knowledge-base file:

1. Define the file’s purpose.
2. Identify which questions it must answer.
3. Separate product decisions from behavioral claims.
4. Research relevant evidence.
5. Record limitations and contradictions.
6. Draft BetterOpnr heuristics.
7. Add structured examples only where useful.
8. Challenge assumptions.
9. Review against `01_core_principles.md`.
10. Add metadata and revision history.
11. Save the authoritative Markdown file.
12. Review the scoped git diff.
13. Commit only the intended file or files.
14. Do not connect the file to production until the knowledge system and integration method are ready.

## Quality Standard for New Content

New content should be rejected or revised when it:

* States unsupported opinion as fact
* Omits material limitations
* Uses platform marketing as scientific proof
* Generalizes from one demographic to all users
* Confuses correlation with causation
* Treats examples as evidence
* Duplicates content without adding value
* Conflicts with the core principles without explanation
* Encourages manipulation, pressure, or misrepresentation
* Cannot be translated into a product decision, testable hypothesis, evaluation criterion, or reusable insight
* Exists only to make the knowledge base appear larger

## Data and Privacy Standard

BetterOpnr will not sell personal dating data.

The knowledge base may be improved using aggregated, de-identified, consented, and appropriately governed product signals.

Personal conversations, profile information, user edits, and outcomes should be handled according to:

* Clear user expectations
* Informed consent
* Data minimization
* Access controls
* Retention limits
* Security requirements
* Product privacy commitments
* Applicable law

BetterOpnr should monetize product capabilities, improved decisions, proprietary evaluation systems, and communication intelligence rather than identifiable personal histories.

## Governance Principle

The value of the BetterOpnr Knowledge Base does not come from its size.

Its value comes from:

* Evidence quality
* Clear distinctions between facts and hypotheses
* Structured product application
* Measurable outcomes
* Version control
* Consistent evaluation
* User-specific personalization
* Continuous learning
* Responsible data use

The knowledge base should become more accurate, more structured, and more useful over time—not merely longer.

## Revision History

| Version | Date       | Status | Summary                                                                                        |
| ------- | ---------- | ------ | ---------------------------------------------------------------------------------------------- |
| 0.1     | 2026-07-11 | Active | Initial governance, evidence, citation, testing, privacy, and authoring standards established. |
