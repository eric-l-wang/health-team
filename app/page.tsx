"use client";

import { useChat } from "ai/react";
import { AIInput } from "@/components/ai-input";
import { MessageLoading } from "@/components/message-loading";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatedTooltipPreview, people } from "@/components/selectable-avatars";

//
// Types for our info messages and for the merged display items.
//
interface InfoMessage {
  id: number;
  content: string;
  // This tells us that at the time the info message was created,
  // chatMessages.length had a certain value. In the merged view, this
  // info message will be inserted after that many chat messages.
  afterChatIndex: number;
}

type DisplayItem =
  | { type: "chat"; message: { role: string; content: string } }
  | { type: "info"; message: InfoMessage };

//
// Helper function to merge chat messages with info messages
//
function mergeMessages(
  chatMessages: Array<{ role: string; content: string }>,
  infoMessages: InfoMessage[]
): DisplayItem[] {
  // Make a copy and sort info messages by afterChatIndex and then by id
  const sortedInfo = [...infoMessages].sort((a, b) => {
    if (a.afterChatIndex === b.afterChatIndex) {
      return a.id - b.id;
    }
    return a.afterChatIndex - b.afterChatIndex;
  });

  const merged: DisplayItem[] = [];
  let infoIndex = 0;

  // For each chat message (by index), first push any info messages that
  // were recorded when chatMessages.length was equal to the current index.
  for (let i = 0; i < chatMessages.length; i++) {
    while (
      infoIndex < sortedInfo.length &&
      sortedInfo[infoIndex].afterChatIndex === i
    ) {
      merged.push({ type: "info", message: sortedInfo[infoIndex] });
      infoIndex++;
    }
    merged.push({ type: "chat", message: chatMessages[i] });
  }
  // Append any remaining info messages (they were recorded when i === chatMessages.length)
  while (infoIndex < sortedInfo.length) {
    merged.push({ type: "info", message: sortedInfo[infoIndex] });
    infoIndex++;
  }
  return merged;
}

export default function Page() {
  // The official conversation state (messages sent to the AI)
  const { messages, input, setInput, append, isLoading } = useChat();
  // infoMessages holds our UI-only avatar–change messages.
  const [infoMessages, setInfoMessages] = useState<InfoMessage[]>([]);

  // Refs for scrolling and for tracking the last selected avatar.
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSelectedRef = useRef<number | null>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  // Check scroll position on the container
  const checkScrollPosition = () => {
    const container = containerRef.current;
    if (!container) return;
    const atBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 30;
    setIsAtBottom(atBottom);
    if (!atBottom) setHasScrolled(true);
  };

  useEffect(() => {
    if (isLoading) setHasScrolled(false);
  }, [isLoading]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      return () => container.removeEventListener("scroll", checkScrollPosition);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages change or loading status updates.
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading, infoMessages]);

  // When the selected avatar changes, record an info message.
  useEffect(() => {
    if (selectedId !== lastSelectedRef.current) {
      const avatar = people.find((p) => p.id === selectedId);
      if (avatar) {
        // Capture the current number of chat messages.
        const currentChatCount = messages.length;
        setInfoMessages((prev) => [
          ...prev,
          {
            id: Date.now(), // unique identifier
            content: `You are now speaking to ${avatar.name}`,
            afterChatIndex: currentChatCount,
          },
        ]);
      }
      lastSelectedRef.current = selectedId;
    }
    // We intentionally do not include "messages" as a dependency here,
    // so that we capture the chat count only at the time the avatar changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Compute the merged display messages.
  const displayMessages = mergeMessages(messages, infoMessages);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[800px] mx-auto w-full pt-24">
          <div className="flex flex-row items-center justify-center mb-10 w-full">
            <AnimatedTooltipPreview
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>
      </div>

      <div className="max-w-[800px] w-full mx-auto flex flex-col flex-1 relative">
        {/* Messages container */}
        <div
          ref={containerRef}
          className="absolute inset-x-0 top-0 bottom-[140px] overflow-y-auto"
        >
          <div className="p-4">
            {/* If no messages exist, you may show a placeholder */}
            {displayMessages.length === 0 && selectedId && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 my-4">
                You are now speaking to{" "}
                {people.find((p) => p.id === selectedId)?.name}
              </div>
            )}

            {displayMessages.map((item, index) => {
              if (item.type === "info") {
                return (
                  <div
                    key={`info-${item.message.id}`}
                    className="text-center text-sm text-gray-500 dark:text-gray-400 my-4"
                  >
                    {item.message.content}
                  </div>
                );
              } else {
                // Render chat messages with different styling based on role.
                return (
                  <div
                    key={`chat-${index}`}
                    className={`mb-4 flex ${
                      item.message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-4 rounded-3xl max-w-[80%] ${
                        item.message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.message.content}
                    </div>
                  </div>
                );
              }
            })}

            {isLoading &&
              messages[messages.length - 1]?.role !== "assistant" && (
                <div className="mb-4 flex justify-start">
                  <MessageLoading />
                </div>
              )}
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Scroll button: shows only when not at bottom and user has scrolled */}
        {!isAtBottom && !isLoading && hasScrolled && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-[140px] left-1/2 -translate-x-1/2 z-10 bg-gray-900/90 dark:bg-gray-100/90 text-white dark:text-gray-900 rounded-full p-2 shadow-lg hover:bg-gray-700 dark:hover:bg-gray-300 transition-all"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}

        {/* Input container */}
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-black">
          <AIInput
            value={input}
            onChange={setInput}
            onSubmit={() => {
              // Append a user message to the conversation (which triggers an AI response).
              append({ content: input, role: "user" });
              setInput("");
            }}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
