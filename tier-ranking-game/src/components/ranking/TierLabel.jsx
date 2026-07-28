export function TierLabel({ tier, className = '' }) {
  return (
    <div className={`flex h-full min-h-[92px] items-center justify-center px-2 text-center text-sm font-black leading-tight sm:min-h-[118px] sm:px-3 sm:text-lg ${className}`} style={{ background: tier.backgroundColour, color: tier.textColour }}>
      {tier.label}
    </div>
  );
}
