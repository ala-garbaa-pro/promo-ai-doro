import { relations } from "drizzle-orm";
import {
  pgTable,
  serial,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  json,
  pgEnum,
  doublePrecision,
} from "drizzle-orm/pg-core";

// Use doublePrecision instead of float
const float = doublePrecision;

// Enums
export const sessionTypeEnum = pgEnum("session_type", [
  "work",
  "short_break",
  "long_break",
]);
export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);
export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);
export const soundTypeEnum = pgEnum("sound_type", [
  "white_noise",
  "nature",
  "ambient",
  "music",
  "custom",
]);
export const flowStateLevelEnum = pgEnum("flow_state_level", [
  "none",
  "entering",
  "light",
  "deep",
  "exiting",
]);
export const flowTriggerTypeEnum = pgEnum("flow_trigger_type", [
  "environment",
  "activity",
  "time",
  "ritual",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  password: varchar("password", { length: 255 }),
  avatar: varchar("avatar", { length: 255 }),
  preferences: json("preferences").$type<{
    theme: string;
    defaultWorkDuration: number;
    defaultShortBreakDuration: number;
    defaultLongBreakDuration: number;
    longBreakInterval: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    notifications: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  tasks: many(tasks),
  sessionTemplates: many(sessionTemplates),
  focusSounds: many(focusSounds),
}));

// Session templates table
export const sessionTemplates = pgTable("session_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  workDuration: integer("work_duration").notNull(), // in minutes
  shortBreakDuration: integer("short_break_duration").notNull(), // in minutes
  longBreakDuration: integer("long_break_duration").notNull(), // in minutes
  longBreakInterval: integer("long_break_interval").notNull(), // number of pomodoros before long break
  autoStartBreaks: boolean("auto_start_breaks").default(false),
  autoStartPomodoros: boolean("auto_start_pomodoros").default(false),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Session templates relations
export const sessionTemplatesRelations = relations(
  sessionTemplates,
  ({ one }) => ({
    user: one(users, {
      fields: [sessionTemplates.userId],
      references: [users.id],
    }),
  })
);

// Sessions table (individual pomodoro sessions)
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  templateId: uuid("template_id").references(() => sessionTemplates.id),
  type: sessionTypeEnum("type").notNull(),
  duration: integer("duration").notNull(), // in minutes
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  isCompleted: boolean("is_completed").default(false),
  wasInterrupted: boolean("was_interrupted").default(false),
  interruptionCount: integer("interruption_count").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sessions relations
export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
  template: one(sessionTemplates, {
    fields: [sessions.templateId],
    references: [sessionTemplates.id],
  }),
  tasks: many(sessionTasks),
}));

// Tasks table
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: taskPriorityEnum("priority").default("medium"),
  status: taskStatusEnum("status").default("pending"),
  estimatedPomodoros: integer("estimated_pomodoros"),
  actualPomodoros: integer("actual_pomodoros").default(0),
  dueDate: timestamp("due_date"),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  category: varchar("category", { length: 255 }),
  tags: json("tags").$type<string[]>(),
  isRecurring: boolean("is_recurring").default(false),
  recurringType: varchar("recurring_type", { length: 50 }),
  recurringInterval: integer("recurring_interval"),
  recurringEndDate: timestamp("recurring_end_date"),
  parentTaskId: uuid("parent_task_id").references(() => tasks.id, {
    onDelete: "set null",
  }),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Task dependencies table
export const taskDependencies = pgTable("task_dependencies", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  dependsOnTaskId: uuid("depends_on_task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tasks relations
export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id],
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
    relationName: "childTasks",
  }),
  childTasks: many(tasks, { relationName: "childTasks" }),
  sessions: many(sessionTasks),
  dependencies: many(taskDependencies, { relationName: "taskDependencies" }),
  dependents: many(taskDependencies, { relationName: "taskDependents" }),
}));

// Task dependencies relations
export const taskDependenciesRelations = relations(
  taskDependencies,
  ({ one }) => ({
    task: one(tasks, {
      fields: [taskDependencies.taskId],
      references: [tasks.id],
      relationName: "taskDependencies",
    }),
    dependsOnTask: one(tasks, {
      fields: [taskDependencies.dependsOnTaskId],
      references: [tasks.id],
      relationName: "taskDependents",
    }),
  })
);

// Session Tasks junction table
export const sessionTasks = pgTable("session_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Session Tasks relations
export const sessionTasksRelations = relations(sessionTasks, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionTasks.sessionId],
    references: [sessions.id],
  }),
  task: one(tasks, {
    fields: [sessionTasks.taskId],
    references: [tasks.id],
  }),
}));

// Focus Sounds table
export const focusSounds = pgTable("focus_sounds", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: soundTypeEnum("type").notNull(),
  url: varchar("url", { length: 255 }).notNull(),
  isDefault: boolean("is_default").default(false),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Focus Sounds relations
export const focusSoundsRelations = relations(focusSounds, ({ one }) => ({
  user: one(users, {
    fields: [focusSounds.userId],
    references: [users.id],
  }),
}));

// Categories table
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  color: varchar("color", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
}));

// Analytics table
export const analytics = pgTable("analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  totalWorkSessions: integer("total_work_sessions").default(0),
  completedWorkSessions: integer("completed_work_sessions").default(0),
  totalWorkMinutes: integer("total_work_minutes").default(0),
  totalBreakMinutes: integer("total_break_minutes").default(0),
  focusScore: integer("focus_score"),
  mostProductiveTimeStart: timestamp("most_productive_time_start"),
  mostProductiveTimeEnd: timestamp("most_productive_time_end"),
  completedTasks: integer("completed_tasks").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics relations
export const analyticsRelations = relations(analytics, ({ one }) => ({
  user: one(users, {
    fields: [analytics.userId],
    references: [users.id],
  }),
}));

// Teams table for social features
export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  avatar: varchar("avatar", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Team Members junction table
export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  isAdmin: boolean("is_admin").default(false),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Team Members relations
export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
}));

// Team Sessions table for synchronized pomodoro sessions
export const teamSessions = pgTable("team_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  workDuration: integer("work_duration").notNull(), // in minutes
  shortBreakDuration: integer("short_break_duration").notNull(), // in minutes
  longBreakDuration: integer("long_break_duration").notNull(), // in minutes
  longBreakInterval: integer("long_break_interval").notNull(), // number of pomodoros before long break
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Team Sessions relations
export const teamSessionsRelations = relations(
  teamSessions,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [teamSessions.teamId],
      references: [teams.id],
    }),
    creator: one(users, {
      fields: [teamSessions.creatorId],
      references: [users.id],
    }),
    participants: many(teamSessionParticipants),
  })
);

// Team Session Participants junction table
export const teamSessionParticipants = pgTable("team_session_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  teamSessionId: uuid("team_session_id")
    .notNull()
    .references(() => teamSessions.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  leftAt: timestamp("left_at"),
});

// Team Session Participants relations
export const teamSessionParticipantsRelations = relations(
  teamSessionParticipants,
  ({ one }) => ({
    teamSession: one(teamSessions, {
      fields: [teamSessionParticipants.teamSessionId],
      references: [teamSessions.id],
    }),
    user: one(users, {
      fields: [teamSessionParticipants.userId],
      references: [users.id],
    }),
  })
);

// Achievements table for gamification
export const achievements = pgTable("achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 255 }),
  requirement: json("requirement").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Achievements junction table
export const userAchievements = pgTable("user_achievements", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  achievementId: uuid("achievement_id")
    .notNull()
    .references(() => achievements.id, { onDelete: "cascade" }),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

// User Achievements relations
export const userAchievementsRelations = relations(
  userAchievements,
  ({ one }) => ({
    user: one(users, {
      fields: [userAchievements.userId],
      references: [users.id],
    }),
    achievement: one(achievements, {
      fields: [userAchievements.achievementId],
      references: [achievements.id],
    }),
  })
);

// Integrations table
export const integrations = pgTable("integrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // e.g., "google_calendar", "todoist", etc.
  name: varchar("name", { length: 255 }).notNull(),
  config: json("config").notNull(),
  isActive: boolean("is_active").default(true),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Integrations relations
export const integrationsRelations = relations(integrations, ({ one }) => ({
  user: one(users, {
    fields: [integrations.userId],
    references: [users.id],
  }),
}));

// Task Templates table
export const taskTemplates = pgTable("task_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 255 }),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Task Template Items table
export const taskTemplateItems = pgTable("task_template_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => taskTemplates.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: taskPriorityEnum("priority").default("medium"),
  estimatedPomodoros: integer("estimated_pomodoros"),
  relativeDueDate: varchar("relative_due_date", { length: 50 }),
  category: varchar("category", { length: 255 }),
  tags: json("tags").$type<string[]>(),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Task Templates relations
export const taskTemplatesRelations = relations(
  taskTemplates,
  ({ one, many }) => ({
    user: one(users, {
      fields: [taskTemplates.userId],
      references: [users.id],
    }),
    items: many(taskTemplateItems),
  })
);

// Task Template Items relations
export const taskTemplateItemsRelations = relations(
  taskTemplateItems,
  ({ one }) => ({
    template: one(taskTemplates, {
      fields: [taskTemplateItems.templateId],
      references: [taskTemplates.id],
    }),
  })
);

// Flow State Sessions table
export const flowStateSessions = pgTable("flow_state_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").references(() => sessions.id, {
    onDelete: "set null",
  }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  maxFocusScore: integer("max_focus_score").notNull(),
  avgFocusScore: integer("avg_focus_score").notNull(),
  flowStateLevel: flowStateLevelEnum("flow_state_level").notNull(),
  interruptionCount: integer("interruption_count").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Flow State Metrics table
export const flowStateMetrics = pgTable("flow_state_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  flowSessionId: uuid("flow_session_id")
    .notNull()
    .references(() => flowStateSessions.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").notNull(),
  focusScore: integer("focus_score").notNull(),
  flowStateLevel: flowStateLevelEnum("flow_state_level").notNull(),
  interactionRate: float("interaction_rate").notNull(),
  distractionCount: integer("distraction_count").default(0),
  confidenceScore: integer("confidence_score").notNull(),
});

// Flow State Triggers table
export const flowStateTriggers = pgTable("flow_state_triggers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: flowTriggerTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  effectiveness: integer("effectiveness").notNull(), // 0-100 score
  frequency: integer("frequency").notNull(), // count of how often this trigger is used
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Flow Session Triggers junction table
export const flowSessionTriggers = pgTable("flow_session_triggers", {
  id: uuid("id").defaultRandom().primaryKey(),
  flowSessionId: uuid("flow_session_id")
    .notNull()
    .references(() => flowStateSessions.id, { onDelete: "cascade" }),
  triggerId: uuid("trigger_id")
    .notNull()
    .references(() => flowStateTriggers.id, { onDelete: "cascade" }),
  effectiveness: integer("effectiveness"), // 0-100 score for this specific session
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Flow State Sessions relations
export const flowStateSessionsRelations = relations(
  flowStateSessions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [flowStateSessions.userId],
      references: [users.id],
    }),
    session: one(sessions, {
      fields: [flowStateSessions.sessionId],
      references: [sessions.id],
    }),
    metrics: many(flowStateMetrics),
    sessionTriggers: many(flowSessionTriggers),
  })
);

// Flow State Metrics relations
export const flowStateMetricsRelations = relations(
  flowStateMetrics,
  ({ one }) => ({
    flowSession: one(flowStateSessions, {
      fields: [flowStateMetrics.flowSessionId],
      references: [flowStateSessions.id],
    }),
  })
);

// Flow State Triggers relations
export const flowStateTriggersRelations = relations(
  flowStateTriggers,
  ({ one, many }) => ({
    user: one(users, {
      fields: [flowStateTriggers.userId],
      references: [users.id],
    }),
    sessionTriggers: many(flowSessionTriggers),
  })
);

// Flow Session Triggers relations
export const flowSessionTriggersRelations = relations(
  flowSessionTriggers,
  ({ one }) => ({
    flowSession: one(flowStateSessions, {
      fields: [flowSessionTriggers.flowSessionId],
      references: [flowStateSessions.id],
    }),
    trigger: one(flowStateTriggers, {
      fields: [flowSessionTriggers.triggerId],
      references: [flowStateTriggers.id],
    }),
  })
);

// Collaborative Sessions table
export const collaborativeSessions = pgTable("collaborative_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  maxParticipants: integer("max_participants").default(10),
  workDuration: integer("work_duration").default(25 * 60), // in seconds
  breakDuration: integer("break_duration").default(5 * 60), // in seconds
  longBreakDuration: integer("long_break_duration").default(15 * 60), // in seconds
  sessionsBeforeLongBreak: integer("sessions_before_long_break").default(4),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  status: varchar("status", { length: 50 }).default("scheduled"), // scheduled, active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Session Participants table
export const sessionParticipants = pgTable("session_participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => collaborativeSessions.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  leftAt: timestamp("left_at"),
  status: varchar("status", { length: 50 }).default("joined"), // joined, active, on_break, away, left
  focusScore: integer("focus_score"),
  completedIntervals: integer("completed_intervals").default(0),
  tasksCompleted: integer("tasks_completed").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Session Messages table
export const sessionMessages = pgTable("session_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => collaborativeSessions.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).default("chat"), // chat, system, goal, progress
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Collaborative Sessions relations
export const collaborativeSessionsRelations = relations(
  collaborativeSessions,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [collaborativeSessions.creatorId],
      references: [users.id],
    }),
    participants: many(sessionParticipants),
    messages: many(sessionMessages),
  })
);

// Session Participants relations
export const sessionParticipantsRelations = relations(
  sessionParticipants,
  ({ one }) => ({
    session: one(collaborativeSessions, {
      fields: [sessionParticipants.sessionId],
      references: [collaborativeSessions.id],
    }),
    user: one(users, {
      fields: [sessionParticipants.userId],
      references: [users.id],
    }),
  })
);

// Session Messages relations
export const sessionMessagesRelations = relations(
  sessionMessages,
  ({ one }) => ({
    session: one(collaborativeSessions, {
      fields: [sessionMessages.sessionId],
      references: [collaborativeSessions.id],
    }),
    user: one(users, {
      fields: [sessionMessages.userId],
      references: [users.id],
    }),
  })
);
