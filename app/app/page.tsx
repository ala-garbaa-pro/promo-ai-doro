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

export default async function AppDashboardPage() {
  // Get the current user
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user.name || "Friend"}!
        </h1>
        <p className="text-gray-400 mt-1">
          Here's an overview of your productivity
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 border-0 text-white shadow-lg shadow-indigo-600/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-200 mb-1">Start Focus Session</p>
                <p className="text-2xl font-bold">25:00</p>
              </div>
              <Button
                size="icon"
                variant="secondary"
                className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 text-white"
              >
                <Clock className="h-5 w-5" />
                <span className="sr-only">Start Timer</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-1">Today's Focus</p>
                <p className="text-2xl font-bold text-white">0 min</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-1">Completed Tasks</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                <ListTodo className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-1">Focus Score</p>
                <p className="text-2xl font-bold text-white">--</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Section */}
        <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-white">
                Today's Tasks
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-400 hover:text-indigo-300"
              >
                View All
              </Button>
            </div>
            <CardDescription className="text-gray-400">
              Manage your tasks for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Empty state */}
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-gray-700/50 flex items-center justify-center mb-4">
                  <ListTodo className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No tasks for today
                </h3>
                <p className="text-gray-400 max-w-sm mb-6">
                  Start adding tasks to track your progress and boost your
                  productivity
                </p>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Add Your First Task
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productivity Insights */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-white">AI Insights</CardTitle>
            <CardDescription className="text-gray-400">
              Personalized productivity recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <div className="rounded-lg bg-gray-700/30 p-4 border border-gray-700">
                <p className="text-sm">
                  Welcome to Pomo AI-doro! Complete your first focus session to
                  receive personalized productivity insights.
                </p>
              </div>
              <div className="rounded-lg bg-indigo-900/20 p-4 border border-indigo-800/30">
                <p className="text-sm text-indigo-200">
                  <span className="font-medium">Tip:</span> The ideal Pomodoro
                  session is 25 minutes of focused work followed by a 5-minute
                  break.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview */}
      <div className="mt-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-white">
                Weekly Overview
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 text-gray-400 hover:text-white"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  This Week
                </Button>
              </div>
            </div>
            <CardDescription className="text-gray-400">
              Your productivity trends for the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-gray-400">
                Complete your first session to see your weekly stats
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
