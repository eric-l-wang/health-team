"use client";

import { ArrowUp } from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function AIInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: AIInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Retain focus state for animation
  const [isFocused, setIsFocused] = useState(false);
  const defaultRows = 1;
  const MAX_HEIGHT = 200; // Maximum height for the textarea

  // Mobile fix: on blur, scroll to top after a short delay
  const handleBlur = () => {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  };

  // Auto-resize the textarea with a height limit
  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, MAX_HEIGHT);
    textarea.style.height = `${newHeight}px`;
    onChange(e.target.value);
  };

  // When submitting, call onSubmit if there is text, then reset focus state and blur the textarea.
  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit();
      setIsFocused(false);
      if (textareaRef.current) {
        textareaRef.current.blur();
        textareaRef.current.style.height = "auto";
      }
    }
  };

  return (
    <div className="w-full px-4 py-4 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.8))",
          backdropFilter: "blur(24px)",
        }}
      />
      <div className="relative">
        {/* Animate the container width based on focus */}
        <motion.div
          className="relative mx-auto pb-3"
          animate={{ width: isFocused ? "100%" : "350px" }}
          transition={
            isFocused
              ? { type: "spring", stiffness: 90, damping: 14 }
              : { type: "spring", stiffness: 120, damping: 14 }
          }
          style={{ maxWidth: "800px" }}
        >
          <div className="relative">
            <Textarea
              ref={textareaRef}
              rows={defaultRows}
              id="ai-input-07"
              placeholder="Need advice? Ask your care team!"
              className={cn(
                "w-full bg-slate-100 dark:bg-slate-800 rounded-2xl pl-6 pr-12",
                "placeholder:text-slate-500/70 dark:placeholder:text-slate-400/70",
                "border-none",
                "text-slate-700 dark:text-slate-200 resize-none",
                "max-h-[200px] overflow-hidden",
                "text-base md:text-sm py-3.5",
                "leading-relaxed"
              )}
              style={{ fontSize: "16px" }} // Prevent iOS zoom on focus
              value={value}
              onChange={handleInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false);
                handleBlur();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              enterKeyHint="send"
              disabled={isLoading}
            />
            <button
              // Use onMouseDown to fire handleSubmit before the textarea's onBlur kicks in
              onMouseDown={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 rounded-3xl p-2.5",
                isLoading
                  ? "bg-none"
                  : "bg-blue-500 hover:bg-blue-600 transition-colors"
              )}
              style={{ transform: "translate(0, -50%)" }} // Ensure button stays centered
              type="button"
              disabled={isLoading || !value.trim()}
            >
              {isLoading ? (
                <svg
                  className="w-5 h-5 text-blue-500 animate-pulse"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.499 5.499 0 0112 5.09 5.499 5.499 0 0122 8.5c0 3.78-3.4 6.86-8.55 11.53L12 21.35z" />
                </svg>
              ) : (
                <ArrowUp className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </motion.div>
        <p className="text-xs text-center w-full text-slate-500/80 dark:text-slate-400/80">
          AI can make mistakes. This should not substitute for professional
          medical advice.
        </p>
      </div>
    </div>
  );
}
