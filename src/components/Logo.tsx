import * as React from "react";
import betterOpnrLogo from "@/assets/betteropnr-logo.png";

type Props = {
  size?: number;
  wordmark?: boolean;
  className?: string;
};

export default function Logo({ size = 28, wordmark = true, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={betterOpnrLogo} 
        alt="BetterOpnr - Start better conversations" 
        className="h-8 md:h-10 w-auto"
        style={{ height: size }}
      />
    </div>
  );
}
