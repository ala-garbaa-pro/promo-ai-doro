"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Users, Clock, Calendar, ArrowRight } from "lucide-react";

interface SessionCardProps {
  session: any;
  onJoin: () => void;
}

export function SessionCard({ session, onJoin }: SessionCardProps) {
  const {
    name,
    description,
    status,
    createdAt,
    creator,
    participantCount = 0,
    maxParticipants,
    workDuration,
    isParticipating,
  } = session;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "scheduled":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "completed":
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
      default:
        return "bg-primary/10 text-primary hover:bg-primary/20";
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge className={`${getStatusColor(status)} capitalize`}>
            {status}
          </Badge>
          {isParticipating && (
            <Badge variant="outline" className="bg-primary/10">
              Joined
            </Badge>
          )}
        </div>
        <CardTitle className="line-clamp-1">{name}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={creator?.image || ""} alt={creator?.name || ""} />
            <AvatarFallback>{creator?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <span className="line-clamp-1">{creator?.name || "Unknown"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {participantCount}/{maxParticipants}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(workDuration)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={onJoin}
          className="w-full gap-2"
          variant={isParticipating ? "secondary" : "default"}
        >
          {isParticipating ? "Resume Session" : "Join Session"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
