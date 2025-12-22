interface AffiliateDisclosureInlineProps {
  variant?: 'short' | 'long';
  className?: string;
}

const AffiliateDisclosureInline = ({ 
  variant = 'short', 
  className = '' 
}: AffiliateDisclosureInlineProps) => {
  const text = variant === 'long' 
    ? 'Optional recommendation. BetterOpnr may earn a commission at no extra cost to you.'
    : 'Optional recommendation (affiliate)';

  return (
    <span 
      className={`text-xs text-muted-foreground/70 select-none ${className}`}
      aria-label="Affiliate disclosure"
    >
      {text}
    </span>
  );
};

export default AffiliateDisclosureInline;
