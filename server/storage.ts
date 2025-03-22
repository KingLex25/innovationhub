import {
  users, events, teamMembers, innovators, notices, about, aboutFeatures, 
  contact, contactMessages, settings, contentArticles,
  type User, type InsertUser, type Event, type InsertEvent,
  type TeamMember, type InsertTeamMember, type Innovator, type InsertInnovator,
  type Notice, type InsertNotice, type AboutFeature, type InsertAboutFeature,
  type Contact, type InsertContact, type ContactMessage, type InsertContactMessage, 
  type Settings, type InsertSettings, type ContentArticle, type InsertContentArticle,
  type About, type AboutData
} from "@shared/schema";
import { hashPassword, comparePassword } from "@shared/util";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(username: string, password: string): Promise<User | null>;
  
  // Event operations
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Team operations
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: number, member: Partial<TeamMember>): Promise<TeamMember>;
  deleteTeamMember(id: number): Promise<boolean>;
  
  // Innovator operations
  getInnovators(): Promise<Innovator[]>;
  getInnovator(id: number): Promise<Innovator | undefined>;
  createInnovator(innovator: InsertInnovator): Promise<Innovator>;
  updateInnovator(id: number, innovator: Partial<Innovator>): Promise<Innovator>;
  deleteInnovator(id: number): Promise<boolean>;
  setFeaturedInnovator(id: number): Promise<Innovator>;
  
  // Notice operations
  getNotices(): Promise<Notice[]>;
  getNotice(id: number): Promise<Notice | undefined>;
  createNotice(notice: InsertNotice): Promise<Notice>;
  updateNotice(id: number, notice: Partial<Notice>): Promise<Notice>;
  deleteNotice(id: number): Promise<boolean>;
  
  // About operations
  getAbout(): Promise<AboutData | undefined>;
  updateAbout(data: { description?: string; vision?: string; mission?: string }): Promise<AboutData>;
  
  // About Features operations
  createAboutFeature(feature: InsertAboutFeature): Promise<AboutFeature>;
  updateAboutFeature(id: number, feature: Partial<AboutFeature>): Promise<AboutFeature>;
  deleteAboutFeature(id: number): Promise<boolean>;
  
  // Contact operations
  getContact(): Promise<Contact | undefined>;
  updateContact(contact: InsertContact): Promise<Contact>;
  
  // Contact Messages operations
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  deleteContactMessage(id: number): Promise<boolean>;
  markMessageAsRead(id: number): Promise<ContactMessage>;
  
  // Settings operations
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
  
  // Content operations
  getContentArticles(): Promise<ContentArticle[]>;
  getContentArticle(id: number): Promise<ContentArticle | undefined>;
  createContentArticle(article: InsertContentArticle): Promise<ContentArticle>;
  updateContentArticle(id: number, article: Partial<ContentArticle>): Promise<ContentArticle>;
  deleteContentArticle(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize database with default admin user and demo data
    this.initializeData();
  }
  
  private async initializeData() {
    try {
      // Check if admin user exists
      const adminUser = await this.getUserByUsername("admin");
      if (!adminUser) {
        await this.initializeAdminUser();
      }
      
      // Check if we need to add demo data
      const aboutData = await this.getAbout();
      if (!aboutData) {
        await this.initializeDemoData();
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }
  
  private async initializeAdminUser() {
    const hashedPassword = await hashPassword("admin123");
    await this.createUser({
      username: "admin",
      password: hashedPassword,
      isAdmin: true
    });
  }
  
  private async initializeDemoData() {
    // Initialize About section
    const aboutData = {
      description: "The Innovation Club at La Martiniere College was established with a vision to nurture creative thinking and innovative problem-solving skills among students. We believe that innovation is the key to addressing the challenges of tomorrow.",
      vision: "To foster a culture of innovation and creativity that empowers students to become future leaders and problem solvers.",
      mission: "Our club provides a platform for students to explore cutting-edge technologies, develop prototypes, and collaborate on projects that have real-world applications. Through various activities, workshops, and competitions, we aim to foster an ecosystem that encourages experimentation and learning."
    };
    
    await db.insert(about).values(aboutData);
    
    // Initialize About Features
    const features = [
      {
        title: "Ideation",
        description: "Brainstorming sessions and idea generation workshops to develop innovative solutions.",
        icon: "lightbulb"
      },
      {
        title: "Creation",
        description: "Hands-on development and prototyping of ideas using cutting-edge technology.",
        icon: "code"
      },
      {
        title: "Launch",
        description: "Showcase innovations at events, competitions and implement in real-world scenarios.",
        icon: "rocket"
      }
    ];
    
    for (const feature of features) {
      await db.insert(aboutFeatures).values(feature);
    }
    
    // Initialize Contact information
    const contactInfo = {
      email: "innovation.club@lamartiniere.edu",
      phone: "+91 522 2239078",
      address: "Innovation Club, La Martiniere College, 1 La Martiniere Road, Lucknow",
      hours: "Monday - Friday: 3:00 PM - 5:00 PM",
      weekend: "Weekend meetings by appointment",
      social: {
        instagram: "#",
        twitter: "#",
        linkedin: "#",
        youtube: "#"
      }
    };
    
    await db.insert(contact).values(contactInfo);
    
    // Initialize Settings
    const settingsData = {
      siteTitle: "La Martiniere College Innovation Club",
      bgImageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      footerText: "© 2025 Innovation Club, La Martiniere College. All rights reserved."
    };
    
    await db.insert(settings).values(settingsData);
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await comparePassword(password, user.password);
    return isValid ? user : null;
  }
  
  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }
  
  async updateEvent(id: number, event: Partial<Event>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
      
    if (!updatedEvent) {
      throw new Error(`Event with id ${id} not found`);
    }
    
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    await db.delete(events).where(eq(events.id, id));
    return true;
  }
  
  // Team operations
  async getTeamMembers(): Promise<TeamMember[]> {
    return await db.select().from(teamMembers);
  }
  
  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    const result = await db.select().from(teamMembers).where(eq(teamMembers.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const [newMember] = await db.insert(teamMembers).values(member).returning();
    return newMember;
  }
  
  async updateTeamMember(id: number, member: Partial<TeamMember>): Promise<TeamMember> {
    const [updatedMember] = await db
      .update(teamMembers)
      .set(member)
      .where(eq(teamMembers.id, id))
      .returning();
      
    if (!updatedMember) {
      throw new Error(`Team member with id ${id} not found`);
    }
    
    return updatedMember;
  }
  
  async deleteTeamMember(id: number): Promise<boolean> {
    await db.delete(teamMembers).where(eq(teamMembers.id, id));
    return true;
  }
  
  // Innovator operations
  async getInnovators(): Promise<Innovator[]> {
    return await db.select().from(innovators);
  }
  
  async getInnovator(id: number): Promise<Innovator | undefined> {
    const result = await db.select().from(innovators).where(eq(innovators.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createInnovator(innovator: InsertInnovator): Promise<Innovator> {
    // If this innovator is set as featured, unset any existing featured innovator
    if (innovator.featured) {
      await db
        .update(innovators)
        .set({ featured: false })
        .where(eq(innovators.featured, true));
    }
    
    const [newInnovator] = await db.insert(innovators).values(innovator).returning();
    return newInnovator;
  }
  
  async updateInnovator(id: number, innovator: Partial<Innovator>): Promise<Innovator> {
    // If setting this innovator as featured, unset any existing featured innovator
    if (innovator.featured) {
      await db
        .update(innovators)
        .set({ featured: false })
        .where(and(
          eq(innovators.featured, true),
          sql`${innovators.id} != ${id}`
        ));
    }
    
    const [updatedInnovator] = await db
      .update(innovators)
      .set(innovator)
      .where(eq(innovators.id, id))
      .returning();
      
    if (!updatedInnovator) {
      throw new Error(`Innovator with id ${id} not found`);
    }
    
    return updatedInnovator;
  }
  
  async deleteInnovator(id: number): Promise<boolean> {
    await db.delete(innovators).where(eq(innovators.id, id));
    return true;
  }
  
  async setFeaturedInnovator(id: number): Promise<Innovator> {
    // Unset any existing featured innovator
    await db
      .update(innovators)
      .set({ featured: false })
      .where(and(
        eq(innovators.featured, true),
        sql`${innovators.id} != ${id}`
      ));
    
    // Set the new featured innovator
    const [updatedInnovator] = await db
      .update(innovators)
      .set({ featured: true })
      .where(eq(innovators.id, id))
      .returning();
      
    if (!updatedInnovator) {
      throw new Error(`Innovator with id ${id} not found`);
    }
    
    return updatedInnovator;
  }
  
  // Notice operations
  async getNotices(): Promise<Notice[]> {
    return await db.select().from(notices).orderBy(desc(notices.createdAt));
  }
  
  async getNotice(id: number): Promise<Notice | undefined> {
    const result = await db.select().from(notices).where(eq(notices.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createNotice(notice: InsertNotice): Promise<Notice> {
    const [newNotice] = await db.insert(notices).values(notice).returning();
    return newNotice;
  }
  
  async updateNotice(id: number, notice: Partial<Notice>): Promise<Notice> {
    const [updatedNotice] = await db
      .update(notices)
      .set(notice)
      .where(eq(notices.id, id))
      .returning();
      
    if (!updatedNotice) {
      throw new Error(`Notice with id ${id} not found`);
    }
    
    return updatedNotice;
  }
  
  async deleteNotice(id: number): Promise<boolean> {
    await db.delete(notices).where(eq(notices.id, id));
    return true;
  }
  
  // About operations
  async getAbout(): Promise<AboutData | undefined> {
    const aboutResult = await db.select().from(about);
    if (aboutResult.length === 0) return undefined;
    
    const featuresResult = await db.select().from(aboutFeatures);
    
    return {
      ...aboutResult[0],
      features: featuresResult
    };
  }
  
  async updateAbout(data: { description?: string; vision?: string; mission?: string }): Promise<AboutData> {
    // Check if about entry exists
    const aboutData = await db.select().from(about);
    
    let updatedAbout;
    if (aboutData.length === 0) {
      // Create new about entry
      const defaultAbout = {
        description: data.description || "The Innovation Club at La Martiniere College promotes creative thinking and problem-solving.",
        vision: data.vision || "To foster innovation and creativity in students.",
        mission: data.mission || "To provide a platform for exploring technologies and developing innovative solutions."
      };
      
      [updatedAbout] = await db.insert(about).values(defaultAbout).returning();
    } else {
      // Update existing about entry
      const updateData: Partial<About> = {};
      if (data.description) updateData.description = data.description;
      if (data.vision) updateData.vision = data.vision;
      if (data.mission) updateData.mission = data.mission;
      
      [updatedAbout] = await db
        .update(about)
        .set(updateData)
        .where(eq(about.id, aboutData[0].id))
        .returning();
    }
    
    const features = await db.select().from(aboutFeatures);
    
    return {
      ...updatedAbout,
      features
    };
  }
  
  // About Features operations
  async createAboutFeature(feature: InsertAboutFeature): Promise<AboutFeature> {
    const [newFeature] = await db.insert(aboutFeatures).values(feature).returning();
    return newFeature;
  }
  
  async updateAboutFeature(id: number, feature: Partial<AboutFeature>): Promise<AboutFeature> {
    const [updatedFeature] = await db
      .update(aboutFeatures)
      .set(feature)
      .where(eq(aboutFeatures.id, id))
      .returning();
      
    if (!updatedFeature) {
      throw new Error(`About feature with id ${id} not found`);
    }
    
    return updatedFeature;
  }
  
  async deleteAboutFeature(id: number): Promise<boolean> {
    await db.delete(aboutFeatures).where(eq(aboutFeatures.id, id));
    return true;
  }
  
  // Contact operations
  async getContact(): Promise<Contact | undefined> {
    const result = await db.select().from(contact);
    return result.length > 0 ? result[0] : undefined;
  }
  
  async updateContact(contactData: InsertContact): Promise<Contact> {
    const currentContact = await this.getContact();
    
    let updatedContact;
    if (!currentContact) {
      [updatedContact] = await db.insert(contact).values(contactData).returning();
    } else {
      [updatedContact] = await db
        .update(contact)
        .set(contactData)
        .where(eq(contact.id, currentContact.id))
        .returning();
    }
    
    return updatedContact;
  }
  
  // Contact Messages operations
  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }
  
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }
  
  async deleteContactMessage(id: number): Promise<boolean> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return true;
  }
  
  async markMessageAsRead(id: number): Promise<ContactMessage> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set({ read: true })
      .where(eq(contactMessages.id, id))
      .returning();
      
    if (!updatedMessage) {
      throw new Error(`Contact message with id ${id} not found`);
    }
    
    return updatedMessage;
  }
  
  // Settings operations
  async getSettings(): Promise<Settings | undefined> {
    const result = await db.select().from(settings);
    return result.length > 0 ? result[0] : undefined;
  }
  
  async updateSettings(settingsData: InsertSettings): Promise<Settings> {
    const currentSettings = await this.getSettings();
    
    let updatedSettings;
    if (!currentSettings) {
      [updatedSettings] = await db.insert(settings).values(settingsData).returning();
    } else {
      [updatedSettings] = await db
        .update(settings)
        .set(settingsData)
        .where(eq(settings.id, currentSettings.id))
        .returning();
    }
    
    return updatedSettings;
  }
  
  // Content operations
  async getContentArticles(): Promise<ContentArticle[]> {
    return await db.select().from(contentArticles).orderBy(desc(contentArticles.createdAt));
  }
  
  async getContentArticle(id: number): Promise<ContentArticle | undefined> {
    const result = await db.select().from(contentArticles).where(eq(contentArticles.id, id));
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createContentArticle(article: InsertContentArticle): Promise<ContentArticle> {
    const [newArticle] = await db.insert(contentArticles).values(article).returning();
    return newArticle;
  }
  
  async updateContentArticle(id: number, article: Partial<ContentArticle>): Promise<ContentArticle> {
    const [updatedArticle] = await db
      .update(contentArticles)
      .set(article)
      .where(eq(contentArticles.id, id))
      .returning();
      
    if (!updatedArticle) {
      throw new Error(`Content article with id ${id} not found`);
    }
    
    return updatedArticle;
  }
  
  async deleteContentArticle(id: number): Promise<boolean> {
    await db.delete(contentArticles).where(eq(contentArticles.id, id));
    return true;
  }
}

export const storage = new DatabaseStorage();