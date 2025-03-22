import { getCurrentUser } from "@/lib/auth/session";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  // This will redirect to login if not authenticated
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-white">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              Welcome, {user.name || "User"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your productivity dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Start your Pomodoro session to boost your productivity.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Today's Focus</CardTitle>
            <CardDescription className="text-gray-400">
              Your focus metrics for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400">Completed Sessions</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
              <div>
                <p className="text-gray-400">Focus Time</p>
                <p className="text-2xl font-bold text-white">0 min</p>
              </div>
              <div>
                <p className="text-gray-400">Tasks Done</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Quick Start</CardTitle>
            <CardDescription className="text-gray-400">
              Start a new Pomodoro session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
              Start Session
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Tasks</CardTitle>
            <CardDescription className="text-gray-400">
              Your most recent tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-gray-400">
              <p>No tasks yet. Create your first task to get started.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Productivity Insights</CardTitle>
            <CardDescription className="text-gray-400">
              AI-powered productivity recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300 space-y-4">
              <p>
                Welcome to Pomo AI-doro! As you use the app, our AI will analyze
                your work patterns and provide personalized recommendations to
                help you improve your productivity.
              </p>
              <p>
                Start by creating tasks and completing Pomodoro sessions to
                generate insights.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
