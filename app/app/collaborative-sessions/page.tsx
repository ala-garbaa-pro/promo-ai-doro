"use client";

import { useState } from "react";
import { useCollaborativeSessions } from "@/hooks/use-collaborative-sessions";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatedList } from "@/components/ui/animated-list";
import { AnimatedTransition } from "@/components/ui/animated-transition";
import { CreateSessionDialog } from "@/components/collaborative-sessions/create-session-dialog";
import { SessionCard } from "@/components/collaborative-sessions/session-card";
import { useRouter } from "next/navigation";
import { Users, Plus, RefreshCw, Loader2, Clock, Calendar } from "lucide-react";

export default function CollaborativeSessionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { sessions, isLoading, fetchSessions, createSession } =
    useCollaborativeSessions({
      status:
        activeTab === "active"
          ? "active"
          : activeTab === "scheduled"
          ? "scheduled"
          : "active,scheduled",
    });

  const filteredSessions = sessions.filter((session) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      session.name.toLowerCase().includes(query) ||
      session.description?.toLowerCase().includes(query) ||
      false ||
      session.creator?.name?.toLowerCase().includes(query) ||
      false
    );
  });

  const handleCreateSession = async (sessionData: any) => {
    const newSession = await createSession(sessionData);
    if (newSession) {
      setIsCreateDialogOpen(false);
      router.push(`/app/collaborative-sessions/${newSession.id}`);
    }
  };

  const handleRefresh = () => {
    fetchSessions();
  };

  const handleJoinSession = (sessionId: string) => {
    router.push(`/app/collaborative-sessions/${sessionId}`);
  };

  return (
    <AnimatedTransition>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Collaborative Sessions
          </h1>
          <p className="text-muted-foreground">
            Join virtual co-working sessions with others to boost your
            productivity
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Session
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="relative w-full max-w-sm">
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              All
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <SessionList
              sessions={filteredSessions.filter((s) => s.status === "active")}
              isLoading={isLoading}
              onJoinSession={handleJoinSession}
            />
          </TabsContent>

          <TabsContent value="scheduled" className="mt-4">
            <SessionList
              sessions={filteredSessions.filter(
                (s) => s.status === "scheduled"
              )}
              isLoading={isLoading}
              onJoinSession={handleJoinSession}
            />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <SessionList
              sessions={filteredSessions}
              isLoading={isLoading}
              onJoinSession={handleJoinSession}
            />
          </TabsContent>
        </Tabs>

        <CreateSessionDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateSession={handleCreateSession}
        />
      </div>
    </AnimatedTransition>
  );
}

interface SessionListProps {
  sessions: any[];
  isLoading: boolean;
  onJoinSession: (sessionId: string) => void;
}

function SessionList({ sessions, isLoading, onJoinSession }: SessionListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No sessions found</h3>
          <p className="text-muted-foreground text-center mt-2">
            There are no collaborative sessions available at the moment.
            <br />
            Create a new session to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <AnimatedList
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      animation="fade"
      staggerDelay={0.05}
    >
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onJoin={() => onJoinSession(session.id)}
        />
      ))}
    </AnimatedList>
  );
}
