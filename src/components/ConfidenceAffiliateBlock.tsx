import AffiliateBlockBase from './AffiliateBlockBase';

interface ConfidenceAffiliateBlockProps {
  className?: string;
}

/**
 * Confidence affiliate recommendation block for conversation/analysis screens
 * Shows nothing if no affiliate is available
 */
const ConfidenceAffiliateBlock = ({ className = '' }: ConfidenceAffiliateBlockProps) => {
  return (
    <AffiliateBlockBase
      category="confidence"
      headline="Confidence shows in your messages"
      body="Some users build confidence with short audiobooks or courses on communication and dating psychology."
      ctaText="Explore confidence resources"
      disclosureVariant="short"
      className={className}
      blockKey="confidence-affiliate"
    />
  );
};

export default ConfidenceAffiliateBlock;
