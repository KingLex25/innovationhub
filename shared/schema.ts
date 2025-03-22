import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  status: text("status").notNull(), // 'upcoming', 'ongoing', 'completed'
  leaderboard: jsonb("leaderboard"), // { first: string, second: string, third: string }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Team Members table
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  bio: text("bio"),
  image: text("image"),
  type: text("type").notNull(), // 'faculty' or 'student'
  links: jsonb("links"), // { email?: string, linkedin?: string, github?: string }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Innovators table
export const innovators = pgTable("innovators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  class: text("class").notNull(),
  profileImage: text("profile_image"),
  projectTitle: text("project_title").notNull(),
  projectDescription: text("project_description").notNull(),
  projectTags: jsonb("project_tags").notNull().$type<string[]>(),
  links: jsonb("links"), // { linkedin?: string, github?: string, website?: string }
  featured: boolean("featured").default(false).notNull(),
  month: text("month"),
  year: integer("year"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInnovatorSchema = createInsertSchema(innovators).omit({
  id: true,
  createdAt: true,
});

export type InsertInnovator = z.infer<typeof insertInnovatorSchema>;
export type Innovator = typeof innovators.$inferSelect;

// Notices table
export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  date: text("date").notNull(),
  link: jsonb("link"), // { url: string, text: string }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNoticeSchema = createInsertSchema(notices).omit({
  id: true,
  createdAt: true,
});

export type InsertNotice = z.infer<typeof insertNoticeSchema>;
export type Notice = typeof notices.$inferSelect;

// About section
export const about = pgTable("about", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  vision: text("vision").notNull(),
  mission: text("mission").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAboutSchema = createInsertSchema(about).omit({
  id: true,
  createdAt: true,
});

export type InsertAbout = z.infer<typeof insertAboutSchema>;
export type About = typeof about.$inferSelect;

// About Features
export const aboutFeatures = pgTable("about_features", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAboutFeatureSchema = createInsertSchema(aboutFeatures).omit({
  id: true,
  createdAt: true,
});

export type InsertAboutFeature = z.infer<typeof insertAboutFeatureSchema>;
export type AboutFeature = typeof aboutFeatures.$inferSelect;

// Contact information
export const contact = pgTable("contact", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  hours: text("hours").notNull(),
  weekend: text("weekend").notNull(),
  social: jsonb("social").notNull(), // { instagram?: string, twitter?: string, linkedin?: string, youtube?: string }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contact).omit({
  id: true,
  createdAt: true,
});

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contact.$inferSelect;

// Contact messages
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  read: true,
  createdAt: true,
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Settings
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  siteTitle: text("site_title").notNull(),
  bgImageUrl: text("bg_image_url"),
  footerText: text("footer_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true,
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// Content articles
export const contentArticles = pgTable("content_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  image: text("image"),
  category: text("category").notNull(),
  featured: boolean("featured").default(false).notNull(),
  publishDate: text("publish_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContentArticleSchema = createInsertSchema(contentArticles).omit({
  id: true,
  createdAt: true,
});

export type InsertContentArticle = z.infer<typeof insertContentArticleSchema>;
export type ContentArticle = typeof contentArticles.$inferSelect;

// Types for API responses
export type AboutData = About & { features: AboutFeature[] };
