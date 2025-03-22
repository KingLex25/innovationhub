import { useContext, useEffect, useState } from "react";
import { useLocation, useParams, useRoute, Link } from "wouter";
import { AuthContext } from "@/App";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EventsManager from "@/admin/EventsManager";
import TeamManager from "@/admin/TeamManager";
import InnovatorsManager from "@/admin/InnovatorsManager";
import NoticesManager from "@/admin/NoticesManager";
import AboutManager from "@/admin/AboutManager";
import ContactManager from "@/admin/ContactManager";
import ContentManager from "@/admin/ContentManager";
import SettingsManager from "@/admin/SettingsManager";
import UserManager from "@/admin/UserManager";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "@/icons/CalendarIcon";
import { UserIcon } from "@/icons/UserIcon";
import { InnovatorIcon } from "@/icons/InnovatorIcon";
import { BulletinIcon } from "@/icons/BulletinIcon";

export default function AdminDashboardPage() {
  const { isAuthenticated, setIsAuthenticated, setUser, isLoading } = useContext(AuthContext);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const params = useParams();
  const [activeSection, setActiveSection] = useState<string>("events");
  const [match, matchParams] = useRoute("/admin/dashboard/:section");
  const [localLoading, setLocalLoading] = useState(true);
  
  // Redirect if not authenticated
  useEffect(() => {
    console.log("Checking auth status on dashboard:", isAuthenticated);
    // Use direct fetch to check auth status
    const checkAuth = async () => {
      try {
        setLocalLoading(true);
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.log("Not authenticated, redirecting to login");
          navigate('/admin/login');
        } else {
          console.log("Auth confirmed, staying on dashboard");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate('/admin/login');
      } finally {
        setLocalLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Only update activeSection when route params change
  useEffect(() => {
    if (match && matchParams.section) {
      setActiveSection(matchParams.section);
    } else if (!params.section) {
      // Default to events if no section specified
      setActiveSection("events");
    }
  }, [match, matchParams, params.section]);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setIsAuthenticated(false);
      setUser(null);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  // Always render dashboard if we reach this point - the auth check is handled in useEffect

  const section = params.section || "events";

  // Render appropriate component based on section
  const renderSection = () => {
    switch (section) {
      case "events":
        return <EventsManager />;
      case "team":
        return <TeamManager />;
      case "innovators":
        return <InnovatorsManager />;
      case "notices":
        return <NoticesManager />;
      case "about":
        return <AboutManager />;
      case "contact":
        return <ContactManager />;
      case "content":
        return <ContentManager />;
      case "settings":
        return <SettingsManager />;
      case "users":
        return <UserManager />;
      default:
        return <EventsManager />;
    }
  };

  return (
    <div className="min-h-screen bg-darkGray flex flex-col">
      {/* Header */}
      <header className="bg-darkBg border-b border-gold/20 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="https://i.ibb.co/TBF8q6p/logo-innovation-removebg.png" 
              alt="Innovation Club Logo" 
              className="h-8 w-auto mr-3"
            />
            <h2 className="text-gold text-xl font-playfair font-bold">Admin Dashboard</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-lightText hover:text-gold text-sm transition-colors duration-300" onClick={() => navigate("/")}>
              <i className="fas fa-home mr-2"></i>View Site
            </div>
            
            <Button 
              variant="outline" 
              className="text-lightText border-gold/20 hover:bg-gold/10 hover:text-gold"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt mr-2"></i>Log Out
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-grow">
        {/* Sidebar */}
        <aside className="w-64 bg-darkBg border-r border-gold/20 p-4 hidden md:block">
          <nav className="space-y-2">
            <div 
              className={`flex items-center p-3 rounded-md transition-colors duration-300 cursor-pointer ${section === 'events' ? 'bg-gold/10 text-gold' : 'text-lightText hover:bg-gold/5 hover:text-gold'}`}
              onClick={() => navigate('/admin/dashboard/events')}
            >
              <CalendarIcon className="w-5 h-5 mr-3" />
              <span>Events</span>
            </div>
            
            <div 
              className={`flex items-center p-3 rounded-md transition-colors duration-300 cursor-pointer ${section === 'team' ? 'bg-gold/10 text-gold' : 'text-lightText hover:bg-gold/5 hover:text-gold'}`}
              onClick={() => navigate('/admin/dashboard/team')}
            >
              <UserIcon className="w-5 h-5 mr-3" />
              <span>Team</span>
            </div>
            
            <div 
              className={`flex items-center p-3 rounded-md transition-colors duration-300 cursor-pointer ${section === 'innovators' ? 'bg-gold/10 text-gold' : 'text-lightText hover:bg-gold/5 hover:text-gold'}`}
              onClick={() => navigate('/admin/dashboard/innovators')}
            >
              <InnovatorIcon className="w-5 h-5 mr-3" />
              <span>Innovators</span>
            </div>
            
            <div 
              className={`flex items-center p-3 rounded-md transition-colors duration-300 cursor-pointer ${section === 'notices' ? 'bg-gold/10 text-gold' : 'text-lightText hover:bg-gold/5 hover:text-gold'}`}
              onClick={() => navigate('/admin/dashboard/notices')}
            >
              <BulletinIcon className="w-5 h-5 mr-3" />
              <span>Notices</span>
            </div>
            
            <div 
              className={`flex items-center p-3 rounded-md transition-colors duration-300 cursor-pointer ${section === 'about' ? 'bg-gold/10 text-gold' : 'text-lightText hover:bg-gold/5 hover:text-gold'}`}
              onClick={() => navigate('/admin/dashboard/about')}
            >
              <i className={`fas fa-info-circle mr-3 ${section === 'about' ? 'text-gold' : 'text-lightText'}`}></i>
              <span>About Club</span>
            </div>
            
            <div 
              className={`flex items-center p-3 rounded-md transition-colors duration-300 cursor-pointer ${section === 'contact' ? 'bg-gold/10 text-gold' : 'text-lightText hover:bg-gold/5 hover:text-gold'}`}
              onClick={() => navigate('/admin/dashboard/contact')}
            >
              <i className={`fas fa-envelope mr-3 ${section === 'contact' ? 'text-gold' : 'text-lightText'}`}></i>
              <span>Contact</span>
            </div>
            
            <div 
              className={`flex items-center p-3 rounded-md transition-colors duration-300 cursor-pointer ${section === 'content' ? 'bg-gold/10 text-gold' : 'text-lightText hover:bg-gold/5 hover:text-gold'}`}
              onClick={() => navigate('/admin/dashboard/content')}
            >
              <i className={`fas fa-file-alt mr-3 ${section === 'content' ? 'text-gold' : 'text-lightText'}`}></i>
              <span>Content</span>
            </div>
            
            <div 
              className={`flex items-center p-3 rounded-md transition-colors duration-300 cursor-pointer ${section === 'users' ? 'bg-gold/10 text-gold' : 'text-lightText hover:bg-gold/5 hover:text-gold'}`}
              onClick={() => navigate('/admin/dashboard/users')}
            >
              <i className={`fas fa-users-cog mr-3 ${section === 'users' ? 'text-gold' : 'text-lightText'}`}></i>
              <span>Users</span>
            </div>
            
            <div 
              className={`flex items-center p-3 rounded-md transition-colors duration-300 cursor-pointer ${section === 'settings' ? 'bg-gold/10 text-gold' : 'text-lightText hover:bg-gold/5 hover:text-gold'}`}
              onClick={() => navigate('/admin/dashboard/settings')}
            >
              <i className={`fas fa-cog mr-3 ${section === 'settings' ? 'text-gold' : 'text-lightText'}`}></i>
              <span>Settings</span>
            </div>
          </nav>
        </aside>
        
        {/* Mobile Navigation */}
        <div className="md:hidden bg-darkBg border-b border-gold/20 p-2 overflow-x-auto whitespace-nowrap">
          <span 
            className={`inline-block px-3 py-2 mx-1 rounded-md text-sm cursor-pointer ${section === 'events' ? 'bg-gold/10 text-gold' : 'text-lightText'}`}
            onClick={() => navigate('/admin/dashboard/events')}
          >
            Events
          </span>
          <span 
            className={`inline-block px-3 py-2 mx-1 rounded-md text-sm cursor-pointer ${section === 'team' ? 'bg-gold/10 text-gold' : 'text-lightText'}`}
            onClick={() => navigate('/admin/dashboard/team')}
          >
            Team
          </span>
          <span 
            className={`inline-block px-3 py-2 mx-1 rounded-md text-sm cursor-pointer ${section === 'innovators' ? 'bg-gold/10 text-gold' : 'text-lightText'}`}
            onClick={() => navigate('/admin/dashboard/innovators')}
          >
            Innovators
          </span>
          <span 
            className={`inline-block px-3 py-2 mx-1 rounded-md text-sm cursor-pointer ${section === 'notices' ? 'bg-gold/10 text-gold' : 'text-lightText'}`}
            onClick={() => navigate('/admin/dashboard/notices')}
          >
            Notices
          </span>
          <span 
            className={`inline-block px-3 py-2 mx-1 rounded-md text-sm cursor-pointer ${section === 'about' ? 'bg-gold/10 text-gold' : 'text-lightText'}`}
            onClick={() => navigate('/admin/dashboard/about')}
          >
            About
          </span>
          <span 
            className={`inline-block px-3 py-2 mx-1 rounded-md text-sm cursor-pointer ${section === 'contact' ? 'bg-gold/10 text-gold' : 'text-lightText'}`}
            onClick={() => navigate('/admin/dashboard/contact')}
          >
            Contact
          </span>
          <span 
            className={`inline-block px-3 py-2 mx-1 rounded-md text-sm cursor-pointer ${section === 'content' ? 'bg-gold/10 text-gold' : 'text-lightText'}`}
            onClick={() => navigate('/admin/dashboard/content')}
          >
            Content
          </span>
          <span 
            className={`inline-block px-3 py-2 mx-1 rounded-md text-sm cursor-pointer ${section === 'settings' ? 'bg-gold/10 text-gold' : 'text-lightText'}`}
            onClick={() => navigate('/admin/dashboard/settings')}
          >
            Settings
          </span>
        </div>
        
        {/* Main Content */}
        <main className="flex-grow p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
