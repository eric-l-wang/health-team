"use client";

import { useChat } from "ai/react";
import { AIInput } from "@/components/ai-input";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  AnimatedTooltipPreview,
  people,
} from "@/components/selectable-avatars";
import LoaderOne from "@/components/ui/loader-dots";
import ReactMarkdown from "react-markdown";

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
    // Insert any info messages recorded at this point.
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
  const [assistantAvatarMap, setAssistantAvatarMap] = useState<{
    [index: number]: number;
  }>({});

  // Refs for scrolling and for tracking the last selected avatar.
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSelectedRef = useRef<number | null>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [selectedId, setSelectedId] = useState<number>(1); // Initialize with John Doe's ID (1)
  const [enableOverlap, setEnableOverlap] = useState(false);

  // Scroll to bottom helper.
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  // Modify the scroll position check threshold (lower value)
  const checkScrollPosition = () => {
    const container = containerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - (container.scrollTop + container.clientHeight);
    // Lower threshold for earlier auto scrolling on mobile.
    const atBottom = distanceFromBottom < 20;
    setIsAtBottom(atBottom);
    if (!atBottom && !hasScrolled) setHasScrolled(true);
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

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [messages, isLoading, infoMessages]);

  useEffect(() => {
    if (containerRef.current) {
      checkScrollPosition(); // Initialize overlap on mount
    }
  }, []);

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
            content: `You are now speaking to ${
              avatar.name
            }, your ${avatar.designation.toLowerCase()}`,
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
      if (
        lastMessage.role === "assistant" &&
        !(lastIndex in assistantAvatarMap)
      ) {
        if (selectedId !== null) {
          setAssistantAvatarMap((prev) => ({
            ...prev,
            [lastIndex]: selectedId,
          }));
        }
      }
    }
  }, [messages, selectedId, assistantAvatarMap]);

  // Handle mobile viewport height.
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVH();
    window.addEventListener("resize", setVH);
    window.addEventListener("orientationchange", setVH);

    return () => {
      window.removeEventListener("resize", setVH);
      window.removeEventListener("orientationchange", setVH);
    };
  }, []);

  // Merge the chat and info messages for display.
  const displayMessages = mergeMessages(messages, infoMessages);

  return (
    <div className="flex flex-col h-[100vh] h-[calc(var(--vh,1vh)*100)] max-h-[100vh] max-h-[calc(var(--vh,1vh)*100)] bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Change header from sticky to fixed */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200/30 dark:border-slate-800/30">
        <div className="max-w-[800px] mx-auto w-full pt-20 md:pt-20">
          <div className="flex flex-row w-full">
            <AnimatedTooltipPreview
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>
      </div>

      {/* Main content behind header */}
      {/* Note: we use overflow-y-visible here so that chat messages may extend above the header */}
      <div
        className={`flex-1 flex flex-col overflow-y-visible pt-40 ${
          enableOverlap ? "-mt-16 pt-12" : ""
        }`}
      >
        {/* This wrapper is relatively positioned so we can add a bottom overlay mask */}
        <div className="max-w-[800px] w-full mx-auto flex-1 flex flex-col relative">
          {/* Chat messages container – change overflow-y-visible to overflow-y-auto */}
          <div
            ref={containerRef}
            className="absolute inset-x-0 top-0 bottom-[100px] overflow-y-auto" // modified here
          >
            <div className="p-4">
              {/* Show placeholder when no actual chat messages have been sent */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center pt-16 justify-center h-full my-8">
                  <h1 className="text-3xl font-bold text-wrap">
                    How can we help?
                  </h1>
                </div>
              )}
              {displayMessages.map((item) => {
                if (item.type === "info") {
                  return (
                    <div
                      key={`info-${item.message.id}`}
                      className="text-center text-sm text-gray-500 dark:text-gray-400 my-4 max-w-[350px] mx-auto break-words"
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
                          <div className="w-8 h-8 flex-shrink-0 mr-3">
                            <img
                              src={avatar.image}
                              alt={avatar.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          </div>
                        )}
                        <div className="py-1 max-w-[80%] text-gray-800 dark:text-gray-200">
                          <ReactMarkdown>{item.message.content}</ReactMarkdown>
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
                        <div className="px-4 py-3 rounded-3xl max-w-[80%] bg-blue-500 text-white">
                          <ReactMarkdown>{item.message.content}</ReactMarkdown>
                        </div>
                      </div>
                    );
                  }
                }
              })}

              {isLoading &&
                messages[messages.length - 1]?.role !== "assistant" && (
                  <div className="mb-4 flex justify-start">
                    <LoaderOne />
                  </div>
                )}
              {/* Scroll anchor */}
              <div ref={messagesEndRef} className="pb-8" />
            </div>
          </div>
          {/* Fixed scroll-to-bottom button */}
          {!isAtBottom && !isLoading && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-[145px] md:bottom-[130px] left-1/2 -translate-x-1/2 z-50 bg-white text-black border border-gray-200 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          )}

          {/* Input container – fixed at the bottom.
              Its z-index is higher than the overlay so it remains fully visible.
          */}
          <div className="fixed bottom-0 left-0 right-0 z-30 w-full flex-1 flex flex-col">
            <AIInput
              value={input}
              onChange={setInput}
              onSubmit={() => {
                append({ content: input, role: "user" });
                setInput("");
              }}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
