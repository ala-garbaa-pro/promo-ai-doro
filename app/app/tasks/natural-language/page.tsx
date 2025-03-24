import { TaskInputDemo } from "@/components/tasks/task-input-demo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Natural Language Task Input - Pomo AI-doro",
  description: "Create tasks using natural language input",
};

export default function NaturalLanguageTaskPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Natural Language Task Input</h1>
        <p className="text-muted-foreground">
          Create tasks quickly using natural language - just type what you need
          to do in plain English
        </p>
      </div>

      <div className="grid gap-6">
        <TaskInputDemo />

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Our AI-powered natural language processing understands your intent
              and extracts task details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">Supported Features</h3>
                <ul className="space-y-1 ml-6 list-disc text-sm">
                  <li>
                    <strong>Due dates:</strong> "tomorrow", "Friday", "next
                    week", "May 15"
                  </li>
                  <li>
                    <strong>Times:</strong> "at 3pm", "at 15:30"
                  </li>
                  <li>
                    <strong>Priority:</strong> "#important", "#high", "#medium",
                    "#low"
                  </li>
                  <li>
                    <strong>Pomodoros:</strong> "~3 pomodoros"
                  </li>
                  <li>
                    <strong>Categories:</strong> "@work", "@personal"
                  </li>
                  <li>
                    <strong>Tags:</strong> "#project", "#meeting", "#health"
                  </li>
                  <li>
                    <strong>Recurring:</strong> "every day", "every Monday",
                    "every month"
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Examples</h3>
                <ul className="space-y-1 ml-6 list-disc text-sm">
                  <li>"Call mom tomorrow at 6pm #family"</li>
                  <li>"Finish project proposal by Friday #important @work"</li>
                  <li>"Gym workout ~2 pomodoros #health"</li>
                  <li>"Team meeting every Monday at 10am @work #recurring"</li>
                  <li>"Pay rent on the 1st every month #finance"</li>
                  <li>"Review documents by tomorrow #medium"</li>
                  <li>"Weekly review every Friday at 4pm ~3 pomodoros"</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-md text-sm">
              <p className="font-medium mb-2">Pro Tips:</p>
              <ul className="space-y-1 ml-6 list-disc">
                <li>Use voice input by clicking the microphone icon</li>
                <li>Combine multiple features in a single task</li>
                <li>
                  The task preview shows how your input is being interpreted
                </li>
                <li>Press Enter to quickly add a task</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
