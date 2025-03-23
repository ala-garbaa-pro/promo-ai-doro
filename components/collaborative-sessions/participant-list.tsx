"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Crown, Circle } from "lucide-react";

interface Participant {
  id: string;
  userId: string;
  status: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ParticipantListProps {
  participants: Participant[];
  currentUserId: string;
  creatorId: string;
}

export function ParticipantList({
  participants,
  currentUserId,
  creatorId,
}: ParticipantListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500";
      case "on_break":
        return "bg-blue-500/10 text-blue-500";
      case "away":
        return "bg-yellow-500/10 text-yellow-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Focusing";
      case "on_break":
        return "On Break";
      case "away":
        return "Away";
      default:
        return "Joined";
    }
  };

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {participants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No participants yet
          </div>
        ) : (
          participants.map((participant) => (
            <div key={participant.id} className="flex items-center gap-3 group">
              <div className="relative">
                <Avatar>
                  <AvatarImage
                    src={participant.user?.image || ""}
                    alt={participant.user?.name || ""}
                  />
                  <AvatarFallback>
                    {participant.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                    participant.status === "active"
                      ? "bg-green-500"
                      : participant.status === "on_break"
                      ? "bg-blue-500"
                      : participant.status === "away"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">
                    {participant.user?.name || "Unknown User"}
                    {participant.userId === currentUserId && " (You)"}
                  </p>
                  {participant.userId === creatorId && (
                    <Crown className="h-3.5 w-3.5 text-yellow-500" />
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${getStatusColor(participant.status)}`}
                >
                  {getStatusLabel(participant.status)}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
