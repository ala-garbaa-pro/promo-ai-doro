import { relations } from "drizzle-orm";
import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { tasks, categories } from "./schema";

// Task Categories junction table
export const taskCategories = pgTable("task_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Task Categories relations
export const taskCategoriesRelations = relations(taskCategories, ({ one }) => ({
  task: one(tasks, {
    fields: [taskCategories.taskId],
    references: [tasks.id],
  }),
  category: one(categories, {
    fields: [taskCategories.categoryId],
    references: [categories.id],
  }),
}));

// Update Tasks relations to include many categories
export const tasksRelationsUpdate = relations(tasks, ({ one, many }) => ({
  categories: many(taskCategories),
}));

// Update Categories relations to include many tasks
export const categoriesRelationsUpdate = relations(
  categories,
  ({ one, many }) => ({
    tasks: many(taskCategories),
  })
);
