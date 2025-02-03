"use client";

import { CornerRightUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";

interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function AIInput({ value, onChange, onSubmit, isLoading }: AIInputProps) {
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 56,
        maxHeight: 200,
    });

    const handleSubmit = () => {
        if (value.trim()) {
            onSubmit();
            // Reset height after submission
            setTimeout(() => adjustHeight(true), 0);
        }
    };

    return (
        <div className="w-full px-4 py-3">
            <div className="relative w-full mx-auto flex items-start flex-col gap-2">
                <div className="relative w-full mx-auto">
                    <Textarea
                        id="ai-input-07"
                        placeholder="Ask me anything!"
                        className={cn(
                            "w-full bg-black/5 dark:bg-white/5 rounded-xl pl-6 pr-10 py-4 placeholder:text-black/70 dark:placeholder:text-white/70 border-none ring-black/30 dark:ring-white/30 text-black dark:text-white resize-none text-wrap leading-[1.2]",
                            "min-h-[56px]"
                        )}
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            adjustHeight();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey && value.trim()) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSubmit}
                        className={cn(
                            "absolute right-3 top-1/2 -translate-y-1/2 rounded-xl py-1 px-1",
                            isLoading ? "bg-none" : "bg-black/5 dark:bg-white/5"
                        )}
                        type="button"
                        disabled={isLoading || !value.trim()}
                    >
                        {isLoading ? (
                            <div
                                className="w-4 h-4 bg-black dark:bg-white rounded-sm animate-spin transition duration-700"
                                style={{ animationDuration: "3s" }}
                            />
                        ) : (
                            <CornerRightUp
                                className={cn(
                                    "w-4 h-4 transition-opacity dark:text-white",
                                    value ? "opacity-100" : "opacity-30"
                                )}
                            />
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
