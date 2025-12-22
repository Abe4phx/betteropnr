interface AffiliateDisclosureInlineProps {
  variant?: 'short' | 'long' | 'optional';
  className?: string;
}

const AffiliateDisclosureInline = ({ 
  variant = 'short', 
  className = '' 
}: AffiliateDisclosureInlineProps) => {
  const getText = () => {
    switch (variant) {
      case 'long':
        return 'Optional recommendation. BetterOpnr may earn a commission at no extra cost to you.';
      case 'optional':
        return 'Optional recommendation (affiliate)';
      default:
        return 'Recommended tool (affiliate)';
    }
  };

  return (
    <span 
      className={`text-xs text-muted-foreground/70 select-none ${className}`}
      aria-label="Affiliate disclosure"
    >
      {getText()}
    </span>
  );
};

export default AffiliateDisclosureInline;
