"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MorphingTextProps {
  texts: string[];
  className?: string;
}

const Texts: React.FC<{ texts: string[] }> = ({ texts }) => (
  <div>
    {texts.map((text, index) => (
      <span key={index}>{text}</span>
    ))}
  </div>
);

const SvgFilters: React.FC = () => (
  <svg>
    <defs>
      <filter id="threshold">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
);

const MorphingText: React.FC<MorphingTextProps> = ({ texts, className }) => (
  <div
    className={cn(
      "relative mx-auto w-full text-center font-sans text-base font-medium leading-none [filter:url(#threshold)_blur(0.6px)]",
      className,
    )}
  >
    <Texts texts={texts} />
    <SvgFilters />
  </div>
);

export { MorphingText };
