import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const cmsAnnouncements = pgTable("cms_announcements", {
  id: serial("id").primaryKey(),
  title: text("title"),
  body: text("body").notNull(),
  linkUrl: text("link_url"),
  linkType: text("link_type"),
  linkLabel: text("link_label"),
  variant: text("variant").notNull().default("info"),
  isPinned: boolean("is_pinned").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cmsGallery = pgTable("cms_gallery", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull().default(""),
  tag: text("tag"),
  year: text("year"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cmsVideos = pgTable("cms_videos", {
  id: serial("id").primaryKey(),
  youtubeUrl: text("youtube_url").notNull(),
  youtubeId: text("youtube_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  category: text("category").notNull().default("שיעורים"),
  dateLabel: text("date_label").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cmsPdfs = pgTable("cms_pdfs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  dateLabel: text("date_label").notNull().default(""),
  description: text("description").notNull().default(""),
  fileUrl: text("file_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cmsEvents = pgTable("cms_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  dateLabel: text("date_label").notNull(),
  dateActual: timestamp("date_actual"),
  description: text("description").notNull().default(""),
  location: text("location"),
  linkUrl: text("link_url"),
  linkLabel: text("link_label"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cmsSpecialBanners = pgTable("cms_special_banners", {
  id: serial("id").primaryKey(),
  label: text("label").notNull().default("הודעה מיוחדת"),
  labelIcon: text("label_icon").notNull().default("flame"),
  dateLabel: text("date_label").notNull().default(""),
  headline: text("headline").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  bodyText: text("body_text").notNull().default(""),
  footerText: text("footer_text").notNull().default(""),
  youtubeId: text("youtube_id"),
  audioUrl: text("audio_url"),
  audioLabel: text("audio_label").notNull().default(""),
  audioSublabel: text("audio_sublabel").notNull().default(""),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
