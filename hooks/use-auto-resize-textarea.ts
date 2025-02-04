import { useRef } from "react";

interface AutoResizeTextareaProps {
  minHeight?: number;
  maxHeight?: number;
}

export function useAutoResizeTextarea({ minHeight = 30, maxHeight = 200 }: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = (reset?: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (reset || !textarea.value) {
      textarea.style.height = '';
      return;
    }

    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
  };

  return { textareaRef, adjustHeight };
}
