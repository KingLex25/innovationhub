import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { comparePassword, hashPassword } from "@shared/util";
import session from "express-session";
import MemoryStore from "memorystore";
import { z } from "zod";

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Admin authorization middleware
const isAdmin = (req: Request, res: Response, next: Function) => {
  if (req.session && req.session.user && req.session.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden - Admin access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "innovation-club-secret",
      resave: true,
      saveUninitialized: true,
      cookie: { 
        secure: false, 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        path: '/'
      },
      store: new SessionStore({
        checkPeriod: 86400000, // 24 hours
      }),
    })
  );

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(`Login attempt for user: ${username}`);
      
      if (!username || !password) {
        console.log("Login failed: Missing username or password");
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.validateUser(username, password);
      if (!user) {
        console.log(`Login failed: Invalid credentials for user: ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set user in session and save it
      req.session.user = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      };
      
      // Force session save
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "Session error" });
        }
        
        console.log(`Login successful for user: ${username} with session ID: ${req.session.id}`);
        return res.status(200).json({
          id: user.id,
          username: user.username,
          isAdmin: user.isAdmin,
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    console.log(`Session check: ${req.session.id}`, req.session);
    if (req.session && req.session.user) {
      console.log(`User authenticated: ${req.session.user.username}`);
      return res.status(200).json({
        id: req.session.user.id,
        username: req.session.user.username,
        isAdmin: req.session.user.isAdmin,
      });
    }
    console.log('No user in session');
    return res.status(401).json({ message: "Not authenticated" });
  });

  // User management routes
  app.post("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { username, password, isAdmin } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const newUser = await storage.createUser({ username, password, isAdmin: !!isAdmin });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = Array.from((await storage.getUsers) || []);
      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      return res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get users error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      return res.status(200).json(events);
    } catch (error) {
      console.error("Get events error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      return res.status(200).json(event);
    } catch (error) {
      console.error("Get event error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const eventSchema = z.object({
        title: z.string().min(1, "Title is required"),
        date: z.string().min(1, "Date is required"),
        time: z.string().min(1, "Time is required"),
        location: z.string().min(1, "Location is required"),
        category: z.string().min(1, "Category is required"),
        description: z.string().min(1, "Description is required"),
        image: z.string().optional(),
        status: z.enum(["upcoming", "ongoing", "completed"]),
        leaderboard: z.object({
          first: z.string().optional(),
          second: z.string().optional(),
          third: z.string().optional(),
        }).optional(),
      });

      const validatedData = eventSchema.parse(req.body);
      const newEvent = await storage.createEvent(validatedData);
      return res.status(201).json(newEvent);
    } catch (error) {
      console.error("Create event error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const updateSchema = z.object({
        title: z.string().optional(),
        date: z.string().optional(),
        time: z.string().optional(),
        location: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
        status: z.enum(["upcoming", "ongoing", "completed"]).optional(),
        leaderboard: z.object({
          first: z.string().optional(),
          second: z.string().optional(),
          third: z.string().optional(),
        }).optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedEvent = await storage.updateEvent(eventId, validatedData);
      return res.status(200).json(updatedEvent);
    } catch (error) {
      console.error("Update event error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/events/:id", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      await storage.deleteEvent(eventId);
      return res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Delete event error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Team routes
  app.get("/api/team", async (req, res) => {
    try {
      const team = await storage.getTeamMembers();
      return res.status(200).json(team);
    } catch (error) {
      console.error("Get team error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/team", isAuthenticated, async (req, res) => {
    try {
      const teamMemberSchema = z.object({
        name: z.string().min(1, "Name is required"),
        position: z.string().min(1, "Position is required"),
        bio: z.string().optional(),
        image: z.string().optional(),
        type: z.enum(["faculty", "student"]),
        links: z.object({
          email: z.string().optional(),
          linkedin: z.string().optional(),
          github: z.string().optional(),
        }).optional(),
      });

      const validatedData = teamMemberSchema.parse(req.body);
      const newTeamMember = await storage.createTeamMember(validatedData);
      return res.status(201).json(newTeamMember);
    } catch (error) {
      console.error("Create team member error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/team/:id", isAuthenticated, async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      const member = await storage.getTeamMember(memberId);
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }

      const updateSchema = z.object({
        name: z.string().optional(),
        position: z.string().optional(),
        bio: z.string().optional(),
        image: z.string().optional(),
        type: z.enum(["faculty", "student"]).optional(),
        links: z.object({
          email: z.string().optional(),
          linkedin: z.string().optional(),
          github: z.string().optional(),
        }).optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedMember = await storage.updateTeamMember(memberId, validatedData);
      return res.status(200).json(updatedMember);
    } catch (error) {
      console.error("Update team member error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/team/:id", isAuthenticated, async (req, res) => {
    try {
      const memberId = parseInt(req.params.id);
      const member = await storage.getTeamMember(memberId);
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }

      await storage.deleteTeamMember(memberId);
      return res.status(200).json({ message: "Team member deleted successfully" });
    } catch (error) {
      console.error("Delete team member error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Innovator routes
  app.get("/api/innovators", async (req, res) => {
    try {
      const innovators = await storage.getInnovators();
      return res.status(200).json(innovators);
    } catch (error) {
      console.error("Get innovators error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/innovators", isAuthenticated, async (req, res) => {
    try {
      const innovatorSchema = z.object({
        name: z.string().min(1, "Name is required"),
        class: z.string().min(1, "Class is required"),
        profileImage: z.string().optional(),
        projectTitle: z.string().min(1, "Project title is required"),
        projectDescription: z.string().min(1, "Project description is required"),
        projectTags: z.array(z.string()),
        links: z.object({
          linkedin: z.string().optional(),
          github: z.string().optional(),
          website: z.string().optional(),
        }).optional(),
        featured: z.boolean().optional(),
        month: z.string().optional(),
        year: z.number().optional(),
      });

      const validatedData = innovatorSchema.parse(req.body);
      const newInnovator = await storage.createInnovator(validatedData);
      return res.status(201).json(newInnovator);
    } catch (error) {
      console.error("Create innovator error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/innovators/:id", isAuthenticated, async (req, res) => {
    try {
      const innovatorId = parseInt(req.params.id);
      const innovator = await storage.getInnovator(innovatorId);
      if (!innovator) {
        return res.status(404).json({ message: "Innovator not found" });
      }

      const updateSchema = z.object({
        name: z.string().optional(),
        class: z.string().optional(),
        profileImage: z.string().optional(),
        projectTitle: z.string().optional(),
        projectDescription: z.string().optional(),
        projectTags: z.array(z.string()).optional(),
        links: z.object({
          linkedin: z.string().optional(),
          github: z.string().optional(),
          website: z.string().optional(),
        }).optional(),
        featured: z.boolean().optional(),
        month: z.string().optional(),
        year: z.number().optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedInnovator = await storage.updateInnovator(innovatorId, validatedData);
      return res.status(200).json(updatedInnovator);
    } catch (error) {
      console.error("Update innovator error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/innovators/:id", isAuthenticated, async (req, res) => {
    try {
      const innovatorId = parseInt(req.params.id);
      const innovator = await storage.getInnovator(innovatorId);
      if (!innovator) {
        return res.status(404).json({ message: "Innovator not found" });
      }

      await storage.deleteInnovator(innovatorId);
      return res.status(200).json({ message: "Innovator deleted successfully" });
    } catch (error) {
      console.error("Delete innovator error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/innovators/feature/:id", isAuthenticated, async (req, res) => {
    try {
      const innovatorId = parseInt(req.params.id);
      const innovator = await storage.getInnovator(innovatorId);
      if (!innovator) {
        return res.status(404).json({ message: "Innovator not found" });
      }

      const featuredInnovator = await storage.setFeaturedInnovator(innovatorId);
      return res.status(200).json(featuredInnovator);
    } catch (error) {
      console.error("Set featured innovator error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notice routes
  app.get("/api/notices", async (req, res) => {
    try {
      const notices = await storage.getNotices();
      return res.status(200).json(notices);
    } catch (error) {
      console.error("Get notices error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/notices", isAuthenticated, async (req, res) => {
    try {
      const noticeSchema = z.object({
        title: z.string().min(1, "Title is required"),
        content: z.string().min(1, "Content is required"),
        date: z.string().min(1, "Date is required"),
        link: z.object({
          url: z.string().url("Invalid URL format"),
          text: z.string().min(1, "Link text is required"),
        }).optional(),
      });

      const validatedData = noticeSchema.parse(req.body);
      const newNotice = await storage.createNotice(validatedData);
      return res.status(201).json(newNotice);
    } catch (error) {
      console.error("Create notice error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/notices/:id", isAuthenticated, async (req, res) => {
    try {
      const noticeId = parseInt(req.params.id);
      const notice = await storage.getNotice(noticeId);
      if (!notice) {
        return res.status(404).json({ message: "Notice not found" });
      }

      const updateSchema = z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        date: z.string().optional(),
        link: z.object({
          url: z.string().url("Invalid URL format"),
          text: z.string().min(1, "Link text is required"),
        }).optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedNotice = await storage.updateNotice(noticeId, validatedData);
      return res.status(200).json(updatedNotice);
    } catch (error) {
      console.error("Update notice error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/notices/:id", isAuthenticated, async (req, res) => {
    try {
      const noticeId = parseInt(req.params.id);
      const notice = await storage.getNotice(noticeId);
      if (!notice) {
        return res.status(404).json({ message: "Notice not found" });
      }

      await storage.deleteNotice(noticeId);
      return res.status(200).json({ message: "Notice deleted successfully" });
    } catch (error) {
      console.error("Delete notice error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // About routes
  app.get("/api/about", async (req, res) => {
    try {
      const about = await storage.getAbout();
      if (!about) {
        return res.status(404).json({ message: "About information not found" });
      }
      return res.status(200).json(about);
    } catch (error) {
      console.error("Get about error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/about", isAuthenticated, async (req, res) => {
    try {
      const updateSchema = z.object({
        description: z.string().optional(),
        vision: z.string().optional(),
        mission: z.string().optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedAbout = await storage.updateAbout(validatedData);
      return res.status(200).json(updatedAbout);
    } catch (error) {
      console.error("Update about error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // About Features routes
  app.post("/api/about/features", isAuthenticated, async (req, res) => {
    try {
      const featureSchema = z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        icon: z.string().min(1, "Icon is required"),
      });

      const validatedData = featureSchema.parse(req.body);
      const newFeature = await storage.createAboutFeature(validatedData);
      return res.status(201).json(newFeature);
    } catch (error) {
      console.error("Create feature error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/about/features/:id", isAuthenticated, async (req, res) => {
    try {
      const featureId = parseInt(req.params.id);
      const feature = await storage.getAboutFeature?.(featureId);
      if (!feature) {
        return res.status(404).json({ message: "Feature not found" });
      }

      const updateSchema = z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedFeature = await storage.updateAboutFeature(featureId, validatedData);
      return res.status(200).json(updatedFeature);
    } catch (error) {
      console.error("Update feature error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/about/features/:id", isAuthenticated, async (req, res) => {
    try {
      const featureId = parseInt(req.params.id);
      const about = await storage.getAbout();
      const feature = about?.features.find(f => f.id === featureId);
      
      if (!feature) {
        return res.status(404).json({ message: "Feature not found" });
      }

      await storage.deleteAboutFeature(featureId);
      return res.status(200).json({ message: "Feature deleted successfully" });
    } catch (error) {
      console.error("Delete feature error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Contact routes
  app.get("/api/contact", async (req, res) => {
    try {
      const contact = await storage.getContact();
      if (!contact) {
        return res.status(404).json({ message: "Contact information not found" });
      }
      return res.status(200).json(contact);
    } catch (error) {
      console.error("Get contact error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/contact", isAuthenticated, async (req, res) => {
    try {
      const updateSchema = z.object({
        email: z.string().email("Invalid email format"),
        phone: z.string().min(1, "Phone is required"),
        address: z.string().min(1, "Address is required"),
        hours: z.string().min(1, "Hours are required"),
        weekend: z.string().min(1, "Weekend information is required"),
        social: z.object({
          instagram: z.string().optional(),
          twitter: z.string().optional(),
          linkedin: z.string().optional(),
          youtube: z.string().optional(),
        }),
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedContact = await storage.updateContact(validatedData);
      return res.status(200).json(updatedContact);
    } catch (error) {
      console.error("Update contact error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Contact Messages routes
  app.post("/api/contact/message", async (req, res) => {
    try {
      const messageSchema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email format"),
        subject: z.string().min(1, "Subject is required"),
        message: z.string().min(1, "Message is required"),
      });

      const validatedData = messageSchema.parse(req.body);
      const newMessage = await storage.createContactMessage(validatedData);
      return res.status(201).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Create message error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/contact/messages", isAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      return res.status(200).json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/contact/messages/:id/read", isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const updatedMessage = await storage.markMessageAsRead(messageId);
      return res.status(200).json(updatedMessage);
    } catch (error) {
      console.error("Mark message as read error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/contact/messages/:id", isAuthenticated, async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      await storage.deleteContactMessage(messageId);
      return res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Delete message error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      return res.status(200).json(settings);
    } catch (error) {
      console.error("Get settings error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const updateSchema = z.object({
        siteTitle: z.string().optional(),
        bgImageUrl: z.string().optional(),
        footerText: z.string().optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedSettings = await storage.updateSettings(validatedData);
      return res.status(200).json(updatedSettings);
    } catch (error) {
      console.error("Update settings error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Content routes
  app.get("/api/content", async (req, res) => {
    try {
      const content = await storage.getContentArticles();
      return res.status(200).json(content);
    } catch (error) {
      console.error("Get content error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/content/:id", async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const article = await storage.getContentArticle(articleId);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      return res.status(200).json(article);
    } catch (error) {
      console.error("Get article error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/content", isAuthenticated, async (req, res) => {
    try {
      const articleSchema = z.object({
        title: z.string().min(1, "Title is required"),
        content: z.string().min(1, "Content is required"),
        image: z.string().optional(),
        category: z.string().min(1, "Category is required"),
        featured: z.boolean().optional(),
        publishDate: z.string().min(1, "Publish date is required"),
      });

      const validatedData = articleSchema.parse(req.body);
      const newArticle = await storage.createContentArticle(validatedData);
      return res.status(201).json(newArticle);
    } catch (error) {
      console.error("Create article error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/content/:id", isAuthenticated, async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const article = await storage.getContentArticle(articleId);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      const updateSchema = z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        image: z.string().optional(),
        category: z.string().optional(),
        featured: z.boolean().optional(),
        publishDate: z.string().optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedArticle = await storage.updateContentArticle(articleId, validatedData);
      return res.status(200).json(updatedArticle);
    } catch (error) {
      console.error("Update article error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/content/:id", isAuthenticated, async (req, res) => {
    try {
      const articleId = parseInt(req.params.id);
      const article = await storage.getContentArticle(articleId);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      await storage.deleteContentArticle(articleId);
      return res.status(200).json({ message: "Article deleted successfully" });
    } catch (error) {
      console.error("Delete article error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
