import * as React from "react";

type Props = {
  size?: number;
  wordmark?: boolean;
  color?: string; // defaults to coral
};

export default function Logo({ size = 28, wordmark = true, color = "#FF6B6B" }: Props) {
  return (
    <div className="flex items-center gap-2">
      {/* Speech bubble + spark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-label="BetterOpnr icon"
      >
        {/* Bubble */}
        <path
          d="M10 16c0-3.314 2.686-6 6-6h32c3.314 0 6 2.686 6 6v16c0 3.314-2.686 6-6 6H28l-8 8v-8h-4c-3.314 0-6-2.686-6-6V16z"
          fill={color}
          opacity="0.95"
        />
        {/* Spark */}
        <path
          d="M46 10l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z"
          fill="#FFD166"
        />
      </svg>

      {wordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-heading text-lg md:text-xl text-foreground font-bold">BetterOpnr</span>
          <span className="text-[10px] text-muted-foreground -mt-0.5">Start better conversations</span>
        </div>
      )}
    </div>
  );
}
