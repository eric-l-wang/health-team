import { useRef } from "react";  // Remove useEffect import

interface AutoResizeTextareaProps {
  minHeight?: number;
  maxHeight?: number;
}

export function useAutoResizeTextarea({ minHeight = 52, maxHeight = 200 }: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = (reset?: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (reset || !textarea.value) {
      textarea.style.height = '';  // Remove height to use CSS default
      return;
    }

    textarea.style.height = 'auto';  // Reset to auto before calculating
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
  };

  return { textareaRef, adjustHeight };
}
