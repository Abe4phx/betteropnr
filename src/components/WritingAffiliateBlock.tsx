import AffiliateBlockBase from './AffiliateBlockBase';

interface WritingAffiliateBlockProps {
  className?: string;
}

/**
 * Writing affiliate recommendation block for result screens
 * Shows nothing if no affiliate is available
 */
const WritingAffiliateBlock = ({ className = '' }: WritingAffiliateBlockProps) => {
  return (
    <AffiliateBlockBase
      category="writing"
      headline="Want your message to sound smoother?"
      body="Some users use writing tools to improve clarity, tone, and flow before sending important messages."
      ctaText="Try a writing assistant"
      disclosureVariant="short"
      className={className}
      blockKey="writing-affiliate"
    />
  );
};

export default WritingAffiliateBlock;
