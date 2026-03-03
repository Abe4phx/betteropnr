import AffiliateBlockBase from './AffiliateBlockBase';

interface LearningAffiliateBlockProps {
  className?: string;
}

/**
 * Learning affiliate recommendation block for insights/improvement screens
 * Shows nothing if no affiliate is available
 */
const LearningAffiliateBlock = ({ className = '' }: LearningAffiliateBlockProps) => {
  return (
    <AffiliateBlockBase
      category="learning"
      headline="Want to improve long-term results?"
      body="Learning communication and social skills can help across dating, work, and life."
      ctaText="Browse learning tools"
      disclosureVariant="commission"
      className={className}
      blockKey="learning-affiliate"
    />
  );
};

export default LearningAffiliateBlock;
