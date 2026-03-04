import AffiliateBlockBase from './AffiliateBlockBase';

interface GroomingAffiliateBlockProps {
  className?: string;
}

/**
 * Grooming affiliate recommendation block for profile improvement screens
 * Shows nothing if no affiliate is available
 */
const GroomingAffiliateBlock = ({ className = '' }: GroomingAffiliateBlockProps) => {
  return (
    <AffiliateBlockBase
      category="grooming"
      headline="First impressions go beyond texting"
      body="Skincare, grooming, and presentation can affect how your profile is perceived."
      ctaText="View grooming recommendations"
      disclosureVariant="optional"
      className={className}
      blockKey="grooming-affiliate"
    />
  );
};

export default GroomingAffiliateBlock;
