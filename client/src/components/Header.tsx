import { useState, useContext } from "react";
import { Link, useLocation } from "wouter";
import { AuthContext } from "@/App";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const [location] = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-darkBg/95 backdrop-blur-sm border-b border-gold/20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="https://i.ibb.co/TBF8q6p/logo-innovation-removebg.png" 
            alt="Innovation Club Logo" 
            className="h-10 w-auto mr-3"
          />
          <h1 className="text-gold font-playfair text-xl md:text-2xl font-semibold">Innovation Club</h1>
        </div>
        
        <nav className="hidden md:flex space-x-6 items-center">
          <a 
            href="/"
            className={`text-lightText hover:text-gold transition-colors duration-300 font-montserrat text-sm ${location === '/' ? 'text-gold' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}
          >
            Home
          </a>
          <a 
            href="#about"
            className="text-lightText hover:text-gold transition-colors duration-300 font-montserrat text-sm"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            About Club
          </a>
          <a 
            href="#events"
            className="text-lightText hover:text-gold transition-colors duration-300 font-montserrat text-sm"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Events
          </a>
          <a 
            href="#innovators"
            className="text-lightText hover:text-gold transition-colors duration-300 font-montserrat text-sm"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('innovators')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Innovators
          </a>
          <a 
            href="#team"
            className="text-lightText hover:text-gold transition-colors duration-300 font-montserrat text-sm"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Team
          </a>
          <a 
            href="#contact"
            className="text-lightText hover:text-gold transition-colors duration-300 font-montserrat text-sm"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Contact
          </a>
          <a 
            href={isAuthenticated ? "/admin/dashboard/events" : "/admin/login"}
            className="text-darkBg bg-gold hover:bg-gold/90 px-4 py-2 rounded-md font-montserrat text-sm font-medium transition-colors duration-300"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = isAuthenticated ? "/admin/dashboard/events" : "/admin/login";
            }}
          >
            Admin
          </a>
        </nav>
        
        <button 
          id="mobile-menu-button" 
          className="md:hidden text-gold"
          onClick={toggleMenu}
        >
          <i className="fas fa-bars text-2xl"></i>
        </button>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-darkGray border-b border-gold/20">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <a 
              href="/"
              className="text-lightText hover:text-gold transition-colors duration-300 py-2 px-4 font-montserrat"
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                window.location.href = '/';
              }}
            >
              Home
            </a>
            <a 
              href="#about"
              className="text-lightText hover:text-gold transition-colors duration-300 py-2 px-4 font-montserrat"
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              About Club
            </a>
            <a 
              href="#events"
              className="text-lightText hover:text-gold transition-colors duration-300 py-2 px-4 font-montserrat"
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Events
            </a>
            <a 
              href="#innovators"
              className="text-lightText hover:text-gold transition-colors duration-300 py-2 px-4 font-montserrat"
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                document.getElementById('innovators')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Innovators
            </a>
            <a 
              href="#team"
              className="text-lightText hover:text-gold transition-colors duration-300 py-2 px-4 font-montserrat"
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Team
            </a>
            <a 
              href="#contact"
              className="text-lightText hover:text-gold transition-colors duration-300 py-2 px-4 font-montserrat"
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Contact
            </a>
            <a 
              href={isAuthenticated ? "/admin/dashboard/events" : "/admin/login"}
              className="text-darkBg bg-gold hover:bg-gold/90 py-2 px-4 rounded-md font-montserrat text-center font-medium transition-colors duration-300"
              onClick={(e) => {
                e.preventDefault();
                closeMenu();
                window.location.href = isAuthenticated ? "/admin/dashboard/events" : "/admin/login";
              }}
            >
              Admin
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
