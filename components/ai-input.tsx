"use client";

import { ArrowUp } from "lucide-react";
import { ChangeEvent, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function AIInput({ value, onChange, onSubmit, isLoading }: AIInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const defaultRows = 1;
    const MAX_HEIGHT = 200; // Add max height constant

    const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        textarea.style.height = "auto";
        
        // Limit the height
        const newHeight = Math.min(textarea.scrollHeight, MAX_HEIGHT);
        textarea.style.height = `${newHeight}px`;
        
        onChange(e.target.value);
    };

    const handleSubmit = () => {
        if (value.trim()) {
            onSubmit();
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    };

    return (
        <div className="w-full px-4 py-3 bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(0,0,0,0.5)] backdrop-blur-sm">
            <div className="relative w-full mx-auto flex items-start flex-col gap-2">
                <div className="relative w-full mx-auto">
                    <Textarea
                        ref={textareaRef}
                        rows={defaultRows}
                        id="ai-input-07"
                        placeholder="Need advice? Ask your care team!"
                        className={cn(
                            "w-full bg-black/5 dark:bg-white/5 rounded-xl pl-6 pr-12",
                            "placeholder:text-black/70 dark:placeholder:text-white/70",
                            "border-none focus:ring-0 focus:outline-none",
                            "text-black dark:text-white resize-none",
                            "max-h-[200px] overflow-y-auto",
                            "text-base md:text-sm py-3", // Increase font size on mobile
                            "leading-5" // Tighter line height
                        )}
                        style={{ fontSize: '16px' }} // Prevent zoom on iOS
                        value={value}
                        onChange={handleInput}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey && value.trim()) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        enterKeyHint="send"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSubmit}
                        className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2",
                            isLoading 
                              ? "bg-none" 
                              : "bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/80 transition-colors"
                        )}
                        style={{ transform: 'translate(0, -50%)' }} // Ensure button stays centered
                        type="button"
                        disabled={isLoading || !value.trim()}
                    >
                        {isLoading ? (
                            <svg
                                className="w-5 h-5 text-blue-500 animate-pulse" // Increased from w-4 h-4
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5A5.499 5.499 0 0112 5.09 5.499 5.499 0 0122 8.5c0 3.78-3.4 6.86-8.55 11.53L12 21.35z" />
                            </svg>
                        ) : (
                            <ArrowUp className="w-4 h-4 text-white dark:text-black" />
                        )}
                    </button>
                </div>
                <p className="text-xs text-center w-full text-black/70 dark:text-white/70">
                    AI can make mistakes. This should not substitute for professional medical advice.
                </p>
            </div>
        </div>
    );
}
