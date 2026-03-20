"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";

interface InfoTooltipProps {
  text: string;
}

export default function InfoTooltip({ text }: InfoTooltipProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, align: "right" as "right" | "left" });

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 10;
    const tooltipWidth = Math.min(260, window.innerWidth - viewportPadding * 2);
    const rightPlacement = rect.right + 8;
    const leftPlacement = rect.left - tooltipWidth - 8;

    const canUseRight = rightPlacement + tooltipWidth <= window.innerWidth - viewportPadding;
    const canUseLeft = leftPlacement >= viewportPadding;
    const align: "right" | "left" = canUseRight || !canUseLeft ? "right" : "left";
    const desiredLeft = align === "right" ? rightPlacement : leftPlacement;
    const left = Math.max(
      viewportPadding,
      Math.min(desiredLeft, window.innerWidth - tooltipWidth - viewportPadding),
    );
    const top = rect.top + rect.height / 2;

    setCoords({ top, left, align });
  };

  const openTooltip = () => {
    updatePosition();
    setIsOpen(true);
  };

  const closeTooltip = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && triggerRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleViewportChange = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen]);

  return (
    <span className="relative inline-flex align-middle">
      <button
        ref={triggerRef}
        type="button"
        aria-describedby={isOpen ? id : undefined}
        aria-label={text}
        onMouseEnter={openTooltip}
        onFocus={openTooltip}
        onMouseLeave={closeTooltip}
        onBlur={closeTooltip}
        onClick={() => {
          if (!isOpen) updatePosition();
          setIsOpen((value) => !value);
        }}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-300/90 outline-none transition-colors hover:text-cyan-200 focus-visible:ring-2 focus-visible:ring-cyan-400/50"
      >
        <CircleHelp className="h-3.5 w-3.5" />
      </button>
      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <span
              id={id}
              role="tooltip"
              className={`pointer-events-none fixed z-[10000] w-[min(260px,calc(100vw-20px))] rounded-md border border-slate-600/80 bg-slate-950/95 px-2.5 py-2 text-left text-xs font-normal leading-relaxed text-slate-100 shadow-xl ${
                coords.align === "right" ? "origin-left" : "origin-right"
              }`}
              style={{
                left: `${coords.left}px`,
                top: `${coords.top}px`,
                transform: "translateY(-50%)",
              }}
            >
              {text}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
