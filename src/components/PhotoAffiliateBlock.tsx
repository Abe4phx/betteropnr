import AffiliateBlockBase from './AffiliateBlockBase';

interface PhotoAffiliateBlockProps {
  className?: string;
}

/**
 * Photo affiliate recommendation block for profile analysis result screens
 * Shows nothing if no affiliate is available
 */
const PhotoAffiliateBlock = ({ className = '' }: PhotoAffiliateBlockProps) => {
  return (
    <AffiliateBlockBase
      category="photos"
      headline="Your photos matter more than your opener"
      body="A few small photo improvements can significantly improve first impressions."
      ctaText="Improve profile photos"
      disclosureVariant="optional"
      className={className}
      blockKey="photos-affiliate"
    />
  );
};

export default PhotoAffiliateBlock;
