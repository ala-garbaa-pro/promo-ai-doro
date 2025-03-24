import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  json,
} from "drizzle-orm/pg-core";
import { users, categories, taskPriorityEnum } from "./schema";

// Task Templates table
export const taskTemplates = pgTable("task_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  priority: taskPriorityEnum("priority").default("medium"),
  estimatedPomodoros: integer("estimated_pomodoros"),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  tags: json("tags").$type<string[]>(),
  isRecurring: boolean("is_recurring").default(false),
  recurringType: varchar("recurring_type", { length: 50 }),
  recurringInterval: integer("recurring_interval"),
  taskText: text("task_text"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Task Template relations
export const taskTemplatesRelations = relations(taskTemplates, ({ one }) => ({
  user: one(users, {
    fields: [taskTemplates.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [taskTemplates.categoryId],
    references: [categories.id],
  }),
}));

// Task Template Items table (for template tasks with dependencies)
export const templateItems = pgTable("template_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id")
    .notNull()
    .references(() => taskTemplates.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: taskPriorityEnum("priority").default("medium"),
  estimatedPomodoros: integer("estimated_pomodoros"),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  tags: json("tags").$type<string[]>(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Template Items relations
export const templateItemsRelations = relations(
  templateItems,
  ({ one, many }) => ({
    template: one(taskTemplates, {
      fields: [templateItems.templateId],
      references: [taskTemplates.id],
    }),
    category: one(categories, {
      fields: [templateItems.categoryId],
      references: [categories.id],
    }),
    dependencies: many(templateItemDependencies, {
      relationName: "itemDependencies",
    }),
    dependents: many(templateItemDependencies, {
      relationName: "itemDependents",
    }),
  })
);

// Template Item Dependencies table
export const templateItemDependencies = pgTable("template_item_dependencies", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => templateItems.id, { onDelete: "cascade" }),
  dependsOnItemId: uuid("depends_on_item_id")
    .notNull()
    .references(() => templateItems.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Template Item Dependencies relations
export const templateItemDependenciesRelations = relations(
  templateItemDependencies,
  ({ one }) => ({
    item: one(templateItems, {
      fields: [templateItemDependencies.itemId],
      references: [templateItems.id],
      relationName: "itemDependencies",
    }),
    dependsOnItem: one(templateItems, {
      fields: [templateItemDependencies.dependsOnItemId],
      references: [templateItems.id],
      relationName: "itemDependents",
    }),
  })
);
