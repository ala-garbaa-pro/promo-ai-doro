"use client";

import { useState, useRef, useEffect } from "react";
import {
  parseNaturalLanguageTask,
  generateTaskDescription,
  ParsedTaskData,
} from "@/lib/utils/natural-language-parser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Send, Calendar, Tag, Clock, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface NaturalLanguageTaskInputProps {
  onTaskCreate: (taskData: ParsedTaskData) => void;
  placeholder?: string;
  className?: string;
}

export function NaturalLanguageTaskInput({
  onTaskCreate,
  placeholder = "Add a task... (e.g., 'Finish report by tomorrow at 5pm #important')",
  className = "",
}: NaturalLanguageTaskInputProps) {
  const [input, setInput] = useState("");
  const [parsedTask, setParsedTask] = useState<ParsedTaskData | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Speech recognition setup
  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      parseInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Voice input error",
        description:
          "There was an error with voice recognition. Please try again or type your task.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }

  // Parse input as user types
  useEffect(() => {
    if (input.trim()) {
      parseInput(input);
    } else {
      setParsedTask(null);
      setShowPreview(false);
    }
  }, [input]);

  // Listen for template selection events
  useEffect(() => {
    const handleTemplateSelection = (event: CustomEvent) => {
      if (event.detail && event.detail.text) {
        setInput(event.detail.text);
        parseInput(event.detail.text);
      }
    };

    // Add event listener
    document.addEventListener(
      "set-task-input",
      handleTemplateSelection as EventListener
    );

    // Clean up
    return () => {
      document.removeEventListener(
        "set-task-input",
        handleTemplateSelection as EventListener
      );
    };
  }, []);

  const parseInput = (text: string) => {
    const parsed = parseNaturalLanguageTask(text);
    setParsedTask(parsed);
    setShowPreview(!!text.trim());
  };

  const handleSubmit = () => {
    if (parsedTask && parsedTask.title.trim()) {
      onTaskCreate(parsedTask);
      setInput("");
      setParsedTask(null);
      setShowPreview(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const startListening = () => {
    if (recognition) {
      try {
        setIsListening(true);
        recognition.start();
      } catch (error) {
        console.error("Speech recognition error:", error);
        setIsListening(false);
      }
    } else {
      toast({
        title: "Voice input not supported",
        description:
          "Your browser doesn't support voice input. Please type your task instead.",
        variant: "destructive",
      });
    }
  };

  const resetInput = () => {
    setInput("");
    setParsedTask(null);
    setShowPreview(false);
    inputRef.current?.focus();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
          disabled={isListening}
        />
        {input.trim() && (
          <Button
            variant="ghost"
            size="icon"
            onClick={resetInput}
            title="Clear input"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={startListening}
          disabled={isListening}
          className={isListening ? "animate-pulse bg-red-100" : ""}
          title="Voice input"
        >
          <Mic className={`h-4 w-4 ${isListening ? "text-red-500" : ""}`} />
        </Button>
        <Button onClick={handleSubmit} disabled={!parsedTask?.title.trim()}>
          <Send className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {showPreview && parsedTask && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="text-sm font-medium mb-2">Task Preview:</div>
            <div className="font-medium">{parsedTask.title}</div>

            <div className="flex flex-wrap gap-2 mt-2">
              {parsedTask.dueDate && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {parsedTask.dueDate.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Badge>
              )}

              {parsedTask.priority && (
                <Badge
                  variant={
                    parsedTask.priority === "high"
                      ? "destructive"
                      : parsedTask.priority === "medium"
                      ? "default"
                      : "outline"
                  }
                >
                  {parsedTask.priority} priority
                </Badge>
              )}

              {parsedTask.estimatedPomodoros && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {parsedTask.estimatedPomodoros} pomodoros
                </Badge>
              )}

              {parsedTask.category && (
                <Badge variant="secondary">@{parsedTask.category}</Badge>
              )}

              {parsedTask.tags &&
                parsedTask.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}

              {parsedTask.isRecurring && (
                <Badge variant="outline">
                  Recurring: {parsedTask.recurringPattern}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
