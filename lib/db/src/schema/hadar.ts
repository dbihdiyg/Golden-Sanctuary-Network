import { pgTable, serial, text, jsonb, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sql } from "drizzle-orm";

export const hadarDesigns = pgTable("hadar_designs", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),
  templateId: text("template_id").notNull(),
  designName: text("design_name").default("עיצוב ללא שם"),
  fieldValues: jsonb("field_values").notNull().default(sql`'{}'::jsonb`),
  status: text("status").notNull().default("draft"),
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const hadarOrders = pgTable("hadar_orders", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),
  designId: integer("design_id").references(() => hadarDesigns.id),
  templateId: text("template_id").notNull(),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntent: text("stripe_payment_intent"),
  amount: integer("amount"),
  currency: text("currency").default("ils"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const hadarTemplates = pgTable("hadar_templates", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle").default(""),
  category: text("category").notNull().default(""),
  style: text("style").notNull().default(""),
  price: integer("price").notNull().default(4900),
  imageUrl: text("image_url"),
  slots: jsonb("slots").notNull().default(sql`'[]'::jsonb`),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const hadarElements = pgTable("hadar_elements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("general"),
  fileContent: text("file_content").notNull(),
  mimeType: text("mime_type").notNull().default("image/svg+xml"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type HadarElement = typeof hadarElements.$inferSelect;

export const insertHadarDesignSchema = createInsertSchema(hadarDesigns).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHadarDesign = z.infer<typeof insertHadarDesignSchema>;
export type HadarDesign = typeof hadarDesigns.$inferSelect;

export const insertHadarOrderSchema = createInsertSchema(hadarOrders).omit({ id: true, createdAt: true });
export type InsertHadarOrder = z.infer<typeof insertHadarOrderSchema>;
export type HadarOrder = typeof hadarOrders.$inferSelect;

export type HadarTemplate = typeof hadarTemplates.$inferSelect;
