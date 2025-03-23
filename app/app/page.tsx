import { getCurrentUser } from "@/lib/auth/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BarChart3, ListTodo, Calendar } from "lucide-react";
import { Timer } from "@/components/app/timer";
import { AnimatedTransition } from "@/components/ui/animated-transition";
import { AIFocusInsights } from "@/components/analytics/ai-focus-insights";
import { db } from "@/lib/server/db";
import { sessions, tasks, analytics } from "@/lib/server/db/schema";
import { eq, and, count, sum, avg, gte, desc, sql } from "drizzle-orm";

export default async function AppDashboardPage() {
  // Get the current user
  const user = await getCurrentUser();

  // Get user's focus metrics
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get today's focus time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStats = await db
    .select({
      totalFocusTime: sum(sessions.duration),
      completedSessions: count(sessions.id),
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, user.id),
        eq(sessions.type, "work"),
        gte(sessions.startedAt, today)
      )
    );

  // Get completed tasks count
  const completedTasks = await db
    .select({
      count: count(tasks.id),
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, user.id),
        eq(tasks.status, "completed"),
        gte(tasks.updatedAt, today)
      )
    );

  // Get focus score
  const userAnalytics = await db
    .select({
      focusScore: analytics.focusScore,
    })
    .from(analytics)
    .where(
      and(
        eq(analytics.userId, user.id),
        sql`DATE(${analytics.date}) = DATE(${today})`
      )
    );

  const todayFocusTime = todayStats[0]?.totalFocusTime || 0;
  const todayCompletedSessions = todayStats[0]?.completedSessions || 0;
  const todayCompletedTasks = completedTasks[0]?.count || 0;
  const focusScore = userAnalytics[0]?.focusScore || 0;

  return (
    <div className="container mx-auto p-6">
      <AnimatedTransition type="slide-down" duration={0.4}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {user.name || "Friend"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your productivity
          </p>
        </div>
      </AnimatedTransition>

      {/* Timer */}
      <div className="mb-8">
        <Timer />
      </div>

      {/* Quick Actions */}
      <AnimatedTransition type="slide-up" duration={0.5} delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Today's Focus</p>
                  <p className="text-2xl font-bold">{todayFocusTime} min</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Completed Tasks</p>
                  <p className="text-2xl font-bold">{todayCompletedTasks}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <ListTodo className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">Focus Score</p>
                  <p className="text-2xl font-bold">
                    {focusScore > 0 ? focusScore : "--"}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AnimatedTransition>

      {/* Main Content */}
      <AnimatedTransition type="slide-up" duration={0.5} delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Section */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Today's Tasks</CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </div>
              <CardDescription>Manage your tasks for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Empty state */}
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <ListTodo className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    No tasks for today
                  </h3>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    Start adding tasks to track your progress and boost your
                    productivity
                  </p>
                  <Button>Add Your First Task</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Focus Insights */}
          <AIFocusInsights
            completedSessions={todayCompletedSessions}
            totalFocusTime={todayFocusTime}
            focusScore={focusScore}
            streak={0} // Will be calculated by the service
          />
        </div>
      </AnimatedTransition>

      {/* Weekly Overview */}
      <AnimatedTransition type="slide-up" duration={0.5} delay={0.3}>
        <div className="mt-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Weekly Overview</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    This Week
                  </Button>
                </div>
              </div>
              <CardDescription>
                Your productivity trends for the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-muted-foreground">
                  Complete your first session to see your weekly stats
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AnimatedTransition>
    </div>
  );
}
