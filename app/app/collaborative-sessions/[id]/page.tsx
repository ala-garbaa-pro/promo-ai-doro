"use client";

import { useState, useEffect, useRef } from "react";
import { useCollaborativeSession } from "@/hooks/use-collaborative-sessions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedList } from "@/components/ui/animated-list";
import { AnimatedTransition } from "@/components/ui/animated-transition";
import { CollaborativeTimer } from "@/components/collaborative-sessions/collaborative-timer";
import { SessionChat } from "@/components/collaborative-sessions/session-chat";
import { ParticipantList } from "@/components/collaborative-sessions/participant-list";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/auth/auth-provider";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  ArrowLeft,
  Clock,
  Calendar,
  Play,
  Pause,
  SkipForward,
  Settings,
  MessageSquare,
  LogOut,
} from "lucide-react";

interface SessionPageProps {
  params: {
    id: string;
  };
}

export default function SessionPage({ params }: SessionPageProps) {
  const { id } = params;
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"timer" | "chat">("timer");
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const {
    session,
    participants,
    messages,
    isLoading,
    error,
    joinSession,
    leaveSession,
    updateStatus,
    sendMessage,
  } = useCollaborativeSession(id);

  const isParticipant = participants.some((p) => p.userId === user?.id);
  const isCreator = session?.creatorId === user?.id;

  const handleJoinSession = async () => {
    setIsJoining(true);
    try {
      const success = await joinSession();
      if (success) {
        toast({
          title: "Joined session",
          description: `You've joined "${session?.name}"`,
        });
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveSession = async () => {
    setIsLeaving(true);
    try {
      const success = await leaveSession();
      if (success) {
        toast({
          title: "Left session",
          description: `You've left "${session?.name}"`,
        });
        router.push("/app/collaborative-sessions");
      }
    } finally {
      setIsLeaving(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    await updateStatus(status);
  };

  const handleSendMessage = async (message: string, type: string = "chat") => {
    await sendMessage(message, type);
  };

  const handleSendGoal = async (goal: string) => {
    await sendMessage(goal, "goal");
  };

  const handleSendProgress = async (progress: string) => {
    await sendMessage(progress, "progress");
  };

  const handleBack = () => {
    router.push("/app/collaborative-sessions");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || "Failed to load collaborative session"}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={handleBack}>Go Back</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <AnimatedTransition>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {session.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Created by{" "}
                <span className="font-medium">{session.creator?.name}</span>
              </span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(session.createdAt), {
                  addSuffix: true,
                })}
              </span>
              <span>•</span>
              <Badge variant="outline" className="capitalize">
                {session.status}
              </Badge>
            </div>
          </div>
          {isParticipant ? (
            <Button
              variant="destructive"
              onClick={handleLeaveSession}
              disabled={isLeaving}
              className="gap-2"
            >
              {isLeaving ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                  Leaving...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Leave Session
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleJoinSession}
              disabled={isJoining}
              className="gap-2"
            >
              {isJoining ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                  Joining...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  Join Session
                </>
              )}
            </Button>
          )}
        </div>

        {session.description && (
          <Card>
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">
                {session.description}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="sm:hidden">
                <div className="flex border-b">
                  <Button
                    variant={activeTab === "timer" ? "default" : "ghost"}
                    className="flex-1 rounded-none"
                    onClick={() => setActiveTab("timer")}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Timer
                  </Button>
                  <Button
                    variant={activeTab === "chat" ? "default" : "ghost"}
                    className="flex-1 rounded-none"
                    onClick={() => setActiveTab("chat")}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </div>
              </div>

              <div className="hidden sm:block">
                {isParticipant ? (
                  <CollaborativeTimer
                    session={session}
                    onStatusChange={handleStatusChange}
                    onSendGoal={handleSendGoal}
                    onSendProgress={handleSendProgress}
                  />
                ) : (
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Join to participate</h3>
                    <p className="text-muted-foreground text-center mt-2">
                      You need to join this session to use the collaborative
                      timer.
                    </p>
                    <Button onClick={handleJoinSession} className="mt-4">
                      Join Session
                    </Button>
                  </CardContent>
                )}
              </div>

              <div className="sm:hidden">
                {activeTab === "timer" && (
                  <div>
                    {isParticipant ? (
                      <CollaborativeTimer
                        session={session}
                        onStatusChange={handleStatusChange}
                        onSendGoal={handleSendGoal}
                        onSendProgress={handleSendProgress}
                      />
                    ) : (
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">
                          Join to participate
                        </h3>
                        <p className="text-muted-foreground text-center mt-2">
                          You need to join this session to use the collaborative
                          timer.
                        </p>
                        <Button onClick={handleJoinSession} className="mt-4">
                          Join Session
                        </Button>
                      </CardContent>
                    )}
                  </div>
                )}

                {activeTab === "chat" && (
                  <div>
                    {isParticipant ? (
                      <SessionChat
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        currentUserId={user?.id || ""}
                      />
                    ) : (
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">Join to chat</h3>
                        <p className="text-muted-foreground text-center mt-2">
                          You need to join this session to participate in the
                          chat.
                        </p>
                        <Button onClick={handleJoinSession} className="mt-4">
                          Join Session
                        </Button>
                      </CardContent>
                    )}
                  </div>
                )}
              </div>
            </Card>

            <Card className="hidden sm:block">
              {isParticipant ? (
                <SessionChat
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  currentUserId={user?.id || ""}
                />
              ) : (
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Join to chat</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    You need to join this session to participate in the chat.
                  </p>
                  <Button onClick={handleJoinSession} className="mt-4">
                    Join Session
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants ({participants.length}/{session.maxParticipants})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ParticipantList
                  participants={participants}
                  currentUserId={user?.id || ""}
                  creatorId={session.creatorId}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AnimatedTransition>
  );
}
