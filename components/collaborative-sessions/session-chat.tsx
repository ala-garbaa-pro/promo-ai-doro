"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Send, MessageSquare, Info, Target, CheckCircle } from "lucide-react";

interface Message {
  id: string;
  message: string;
  type: string;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface SessionChatProps {
  messages: Message[];
  onSendMessage: (message: string, type: string) => Promise<void>;
  currentUserId: string;
}

export function SessionChat({
  messages,
  onSendMessage,
  currentUserId,
}: SessionChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport=""]'
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      await onSendMessage(newMessage, "chat");
      setNewMessage("");
      inputRef.current?.focus();
    } finally {
      setIsSending(false);
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "system":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "goal":
        return <Target className="h-4 w-4 text-purple-500" />;
      case "progress":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-primary" />;
    }
  };

  const getMessageTypeClass = (type: string) => {
    switch (type) {
      case "system":
        return "bg-blue-500/10 text-blue-500";
      case "goal":
        return "bg-purple-500/10 text-purple-500";
      case "progress":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea
          ref={scrollAreaRef}
          className="h-[400px] px-4"
          type="always"
        >
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.user?.id === currentUserId
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  {message.type === "system" ? (
                    <div className="w-full">
                      <div
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs ${getMessageTypeClass(
                          message.type
                        )} mx-auto`}
                      >
                        <span className="font-medium">
                          {message.user?.name || "Unknown"}
                        </span>{" "}
                        {message.message}
                      </div>
                    </div>
                  ) : message.type === "goal" || message.type === "progress" ? (
                    <div className="w-full">
                      <div
                        className={`flex flex-col gap-1 p-3 rounded-lg ${
                          message.user?.id === currentUserId
                            ? "ml-auto mr-0 max-w-[80%]"
                            : "mr-auto ml-0 max-w-[80%]"
                        } ${getMessageTypeClass(message.type)}`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={message.user?.image || ""}
                              alt={message.user?.name || ""}
                            />
                            <AvatarFallback>
                              {message.user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">
                            {message.user?.name || "Unknown"}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getMessageTypeClass(
                              message.type
                            )}`}
                          >
                            {message.type === "goal" ? "Goal" : "Progress"}
                          </Badge>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                        <AvatarImage
                          src={message.user?.image || ""}
                          alt={message.user?.name || ""}
                        />
                        <AvatarFallback>
                          {message.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`flex flex-col gap-1 ${
                          message.user?.id === currentUserId
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <div
                          className={`p-3 rounded-lg ${
                            message.user?.id === currentUserId
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {message.user?.name || "Unknown"} •{" "}
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || isSending}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </>
  );
}
