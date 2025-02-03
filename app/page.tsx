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
  // at the time the info message was created, the chat had a certain length.
  afterChatIndex: number;
  // Store the avatar id active when the info message was created (optional)
  selectedAvatarId?: number;
}

type ChatMessage = { role: string; content: string };

//
// We add an `index` field for chat messages so we know their position
// in the official messages array.
//
type DisplayItem =
  | { type: "chat"; message: ChatMessage; index: number }
  | { type: "info"; message: InfoMessage };

//
// Merge chat messages with info messages, preserving the chat message index.
//
function mergeMessages(
  chatMessages: ChatMessage[],
  infoMessages: InfoMessage[]
): DisplayItem[] {
  const sortedInfo = [...infoMessages].sort((a, b) => {
    if (a.afterChatIndex === b.afterChatIndex) {
      return a.id - b.id;
    }
    return a.afterChatIndex - b.afterChatIndex;
  });

  const merged: DisplayItem[] = [];
  let infoIndex = 0;

  for (let i = 0; i < chatMessages.length; i++) {
    // Before each chat message, insert any info messages recorded at that point.
    while (
      infoIndex < sortedInfo.length &&
      sortedInfo[infoIndex].afterChatIndex === i
    ) {
      merged.push({ type: "info", message: sortedInfo[infoIndex] });
      infoIndex++;
    }
    merged.push({ type: "chat", message: chatMessages[i], index: i });
  }
  // Append any remaining info messages.
  while (infoIndex < sortedInfo.length) {
    merged.push({ type: "info", message: sortedInfo[infoIndex] });
    infoIndex++;
  }
  return merged;
}

export default function Page() {
  // The official conversation state (only user/assistant messages).
  const { messages, input, setInput, append, isLoading } = useChat();
  // infoMessages holds our UI-only avatar–change notifications.
  const [infoMessages, setInfoMessages] = useState<InfoMessage[]>([]);
  // assistantAvatarMap maps a chat message's index (in messages[]) to the avatar id that was active when it was received.
  const [assistantAvatarMap, setAssistantAvatarMap] = useState<{ [index: number]: number }>({});

  // Refs for scrolling and for tracking the last selected avatar.
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSelectedRef = useRef<number | null>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Scroll to bottom helper.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  // Simple scroll position check.
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
    // Scroll to bottom whenever messages, loading, or infoMessages change.
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading, infoMessages]);

  // When the selected avatar changes, record an info message.
  useEffect(() => {
    if (selectedId !== lastSelectedRef.current) {
      const avatar = people.find((p) => p.id === selectedId);
      if (avatar) {
        const currentChatCount = messages.length;
        setInfoMessages((prev) => [
          ...prev,
          {
            id: Date.now(), // unique id
            content: `You are now speaking to ${avatar.name}`,
            afterChatIndex: currentChatCount,
            selectedAvatarId: avatar.id,
          },
        ]);
      }
      lastSelectedRef.current = selectedId;
    }
    // We intentionally do not include messages as a dependency here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // When a new assistant (AI) message is appended, record the active avatar.
  useEffect(() => {
    if (messages.length > 0) {
      const lastIndex = messages.length - 1;
      const lastMessage = messages[lastIndex];
      // Only tag new assistant messages.
      if (lastMessage.role === "assistant" && !(lastIndex in assistantAvatarMap)) {
        if (selectedId !== null) {
          setAssistantAvatarMap(prev => ({ ...prev, [lastIndex]: selectedId }));
        }
      }
    }
  }, [messages, selectedId, assistantAvatarMap]);

  // Merge the chat and info messages for display.
  const displayMessages = mergeMessages(messages, infoMessages);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[800px] mx-auto w-full pt-24 md:pt-24"> {/* Adjusted padding */}
          <div className="flex flex-row items-center justify-center w-full">
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
            {displayMessages.length === 0 && selectedId && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 my-4">
                You are now speaking to{" "}
                {people.find((p) => p.id === selectedId)?.name}
              </div>
            )}

            {displayMessages.map((item) => {
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
                // For chat messages, include the avatar image for assistant messages.
                if (item.message.role === "assistant") {
                  const avatarId = assistantAvatarMap[item.index];
                  const avatar = people.find((p) => p.id === avatarId);
                  return (
                    <div
                      key={`chat-${item.index}`}
                      className="mb-4 flex items-start justify-start"
                    >
                      {avatar && (
                        <div className="w-12 h-12 flex-shrink-0 mr-4">
                          <img
                            src={avatar.image}
                            alt={avatar.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4 rounded-3xl max-w-[80%] bg-gray-100 text-gray-800">
                        {item.message.content}
                      </div>
                    </div>
                  );
                } else {
                  // For user messages, render normally (right-aligned).
                  return (
                    <div
                      key={`chat-${item.index}`}
                      className="mb-4 flex justify-end"
                    >
                      <div className="p-4 rounded-3xl max-w-[80%] bg-blue-500 text-white">
                        {item.message.content}
                      </div>
                    </div>
                  );
                }
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

        {/* Scroll button */}
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
              // Append a user message (which triggers an AI response).
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
