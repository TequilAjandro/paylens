"use client";

import Image from "next/image";

interface BrandLockupProps {
  variant?: "full" | "icon";
  className?: string;
}

export default function BrandLockup({ variant = "full", className }: BrandLockupProps) {
  const isIcon = variant === "icon";

  return (
    <div
      className={`pl-logo-surface inline-flex items-center rounded-xl ${isIcon ? "p-2.5" : "px-3 py-2"} ${
        className ?? ""
      }`.trim()}
    >
      <Image
        src={isIcon ? "/brand/micoach-icon-transparent.png" : "/brand/micoach-logo-2023.png"}
        alt="miCoach powered by ITJ"
        width={isIcon ? 34 : 220}
        height={isIcon ? 34 : 73}
        className={isIcon ? "h-8 w-8 object-contain" : "h-auto w-[176px] object-contain sm:w-[204px]"}
        priority={false}
      />
    </div>
  );
}
