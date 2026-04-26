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
  galleryImageUrl: text("gallery_image_url"),
  displayImageUrl: text("display_image_url"),
  dimensions: jsonb("dimensions").default(sql`'{"preset":"custom","width":800,"height":1100,"unit":"px"}'::jsonb`),
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

export const hadarFonts = pgTable("hadar_fonts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  fileUrl: text("file_url").notNull(),
  mimeType: text("mime_type").notNull().default("font/ttf"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Support Tickets ────────────────────────────────────────────────────────────
export const hadarTickets = pgTable("hadar_tickets", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),
  userEmail: text("user_email").notNull().default(""),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("open"), // open | in_progress | closed
  unreadAdmin: integer("unread_admin").notNull().default(0),   // messages unseen by admin
  unreadUser: integer("unread_user").notNull().default(0),     // messages unseen by user
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const hadarTicketMessages = pgTable("hadar_ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => hadarTickets.id),
  senderType: text("sender_type").notNull().default("user"), // user | admin
  senderLabel: text("sender_label").notNull().default(""),
  message: text("message").notNull(),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Saved Payment Methods ──────────────────────────────────────────────────────
export const hadarPaymentMethods = pgTable("hadar_payment_methods", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripePaymentMethodId: text("stripe_payment_method_id").notNull(),
  brand: text("brand").notNull().default(""),
  last4: text("last4").notNull().default(""),
  expMonth: integer("exp_month"),
  expYear: integer("exp_year"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Video Templates ──────────────────────────────────────────────────────────
export const hadarVideoTemplates = pgTable("hadar_video_templates", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default(""),
  // "standard" | "premium"
  tier: text("tier").notNull().default("standard"),
  price: integer("price").notNull().default(4900), // agorot
  baseVideoUrl: text("base_video_url"),            // source MP4
  previewVideoUrl: text("preview_video_url"),       // short loop for gallery
  previewImageUrl: text("preview_image_url"),       // thumbnail
  // [{id,label,type:'text'|'textarea',defaultValue,placeholder,maxLength,required}]
  fields: jsonb("fields").notNull().default(sql`'[]'::jsonb`),
  // [{fieldId,x,y,fontSize,fontColor,fontFamily,align,shadowColor,startTime,endTime}]
  overlays: jsonb("overlays").notNull().default(sql`'[]'::jsonb`),
  videoDuration: integer("video_duration").default(15), // seconds
  videoWidth: integer("video_width").default(1920),
  videoHeight: integer("video_height").default(1080),
  // Render quality settings
  maxRenderSeconds: integer("max_render_seconds").default(300), // kill ffmpeg after this
  renderPreset: text("render_preset").notNull().default("fast"), // ultrafast|fast|medium|slow
  renderCrf: integer("render_crf").default(22),                  // 0-51, lower=better quality
  // After Effects / pre-rendered assets support
  aeCompositionName: text("ae_composition_name"),                // for documentation only
  // [{id,label,url,type:'intro'|'outro'|'overlay',durationSecs}]
  preRenderedAssets: jsonb("pre_rendered_assets").notNull().default(sql`'[]'::jsonb`),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Video Jobs ─────────────────────────────────────────────────────────────────
export const hadarVideoJobs = pgTable("hadar_video_jobs", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),
  templateId: integer("template_id").notNull().references(() => hadarVideoTemplates.id),
  fieldValues: jsonb("field_values").notNull().default(sql`'{}'::jsonb`),
  // pending_payment | queued | rendering | ready | failed
  status: text("status").notNull().default("pending_payment"),
  // "standard" | "premium" — premium jobs jump the queue
  priority: text("priority").notNull().default("standard"),
  stripeSessionId: text("stripe_session_id"),
  outputUrl: text("output_url"),
  errorMessage: text("error_message"),
  pricePaid: integer("price_paid"),
  // Notification fields
  userEmail: text("user_email"),
  userName: text("user_name"),
  notifiedAt: timestamp("notified_at"),
  // Render tracking
  renderStartedAt: timestamp("render_started_at"),
  renderCompletedAt: timestamp("render_completed_at"),
  progressPct: integer("progress_pct").notNull().default(0),       // 0-100
  estimatedCompletionAt: timestamp("estimated_completion_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Types ──────────────────────────────────────────────────────────────────────
export type HadarVideoTemplate = typeof hadarVideoTemplates.$inferSelect;
export type HadarVideoJob = typeof hadarVideoJobs.$inferSelect;

export type HadarElement = typeof hadarElements.$inferSelect;
export type HadarFont = typeof hadarFonts.$inferSelect;
export type HadarTicket = typeof hadarTickets.$inferSelect;
export type HadarTicketMessage = typeof hadarTicketMessages.$inferSelect;
export type HadarPaymentMethod = typeof hadarPaymentMethods.$inferSelect;

export const insertHadarDesignSchema = createInsertSchema(hadarDesigns).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertHadarDesign = z.infer<typeof insertHadarDesignSchema>;
export type HadarDesign = typeof hadarDesigns.$inferSelect;

export const insertHadarOrderSchema = createInsertSchema(hadarOrders).omit({ id: true, createdAt: true });
export type InsertHadarOrder = z.infer<typeof insertHadarOrderSchema>;
export type HadarOrder = typeof hadarOrders.$inferSelect;

export type HadarTemplate = typeof hadarTemplates.$inferSelect;
