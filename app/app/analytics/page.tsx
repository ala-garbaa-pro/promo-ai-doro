import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronDown } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400 mt-1">
            Track your productivity metrics and insights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-400 hover:text-white"
          >
            <Calendar className="h-4 w-4 mr-1" />
            This Month
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full bg-gray-800 mb-6">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="focus" className="flex-1">
            Focus Time
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex-1">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex-1">
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Focus Time"
              value="0h 0m"
              description="This month"
              color="bg-indigo-500/10 text-indigo-400"
            />
            <MetricCard
              title="Completed Sessions"
              value="0"
              description="This month"
              color="bg-green-500/10 text-green-400"
            />
            <MetricCard
              title="Completed Tasks"
              value="0"
              description="This month"
              color="bg-purple-500/10 text-purple-400"
            />
            <MetricCard
              title="Average Focus Score"
              value="--"
              description="This month"
              color="bg-blue-500/10 text-blue-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Daily Focus Time</CardTitle>
                <CardDescription className="text-gray-400">
                  Hours spent focusing each day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-400">No data available yet</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Task Completion</CardTitle>
                <CardDescription className="text-gray-400">
                  Tasks completed over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-400">No data available yet</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                AI Productivity Insights
              </CardTitle>
              <CardDescription className="text-gray-400">
                Personalized recommendations based on your work patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-300">
                <div className="rounded-lg bg-gray-700/30 p-4 border border-gray-700">
                  <p className="text-sm">
                    Complete more focus sessions to receive personalized AI
                    insights about your productivity patterns.
                  </p>
                </div>
                <div className="rounded-lg bg-indigo-900/20 p-4 border border-indigo-800/30">
                  <p className="text-sm text-indigo-200">
                    <span className="font-medium">Did you know?</span> Research
                    shows that most people are most productive in the morning,
                    with peak focus occurring between 9am and 11am.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="focus">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">
                Focus time analytics will be available after you complete your
                first focus session
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">
                Task analytics will be available after you complete your first
                task
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">
                Trend analytics will be available after you use the app for a
                while
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  color: string;
}

function MetricCard({ title, value, description, color }: MetricCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div
            className={`h-10 w-10 rounded-full ${color} flex items-center justify-center`}
          >
            <div className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
