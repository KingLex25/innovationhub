import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-darkBg border-t border-gold/20 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src="https://i.ibb.co/TBF8q6p/logo-innovation-removebg.png" 
                alt="Innovation Club Logo" 
                className="h-10 w-auto mr-3"
              />
              <h3 className="text-gold font-playfair text-lg font-semibold">Innovation Club</h3>
            </div>
            <p className="text-lightText/80 text-sm mb-4">
              Fostering creativity and innovation at La Martiniere College since 2020.
            </p>
            <p className="text-lightText/60 text-xs italic">
              "Labore et Constantia" - By Labor and Constancy
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-gold font-montserrat font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-lightText/80 hover:text-gold text-sm transition-colors duration-300">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/#about">
                  <a className="text-lightText/80 hover:text-gold text-sm transition-colors duration-300">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/#events">
                  <a className="text-lightText/80 hover:text-gold text-sm transition-colors duration-300">Events</a>
                </Link>
              </li>
              <li>
                <Link href="/#innovators">
                  <a className="text-lightText/80 hover:text-gold text-sm transition-colors duration-300">Innovators</a>
                </Link>
              </li>
              <li>
                <Link href="/#team">
                  <a className="text-lightText/80 hover:text-gold text-sm transition-colors duration-300">Our Team</a>
                </Link>
              </li>
              <li>
                <Link href="/#contact">
                  <a className="text-lightText/80 hover:text-gold text-sm transition-colors duration-300">Contact</a>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="md:col-span-1">
            <h3 className="text-gold font-montserrat font-semibold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-lightText/80 text-sm">
                <i className="fas fa-envelope text-gold mr-2 w-5"></i>
                <span>innovation.club@lamartiniere.edu</span>
              </li>
              <li className="flex items-center text-lightText/80 text-sm">
                <i className="fas fa-phone text-gold mr-2 w-5"></i>
                <span>+91 522 2239078</span>
              </li>
              <li className="flex items-start text-lightText/80 text-sm">
                <i className="fas fa-map-marker-alt text-gold mr-2 w-5 mt-1"></i>
                <span>Innovation Club, La Martiniere College<br />1 La Martiniere Road, Lucknow</span>
              </li>
            </ul>
          </div>
          
          {/* Social Media and Newsletter */}
          <div className="md:col-span-1">
            <h3 className="text-gold font-montserrat font-semibold text-lg mb-4">Connect With Us</h3>
            <div className="flex space-x-3 mb-6">
              <a href="#" className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors duration-300">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors duration-300">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors duration-300">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors duration-300">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
            
            <h3 className="text-gold font-montserrat font-semibold text-lg mb-3">Subscribe</h3>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="flex-grow bg-darkGray border border-gold/20 rounded-l-md p-2 text-lightText text-sm focus:border-gold focus:outline-none"
              />
              <button className="bg-gold text-darkBg px-3 py-2 rounded-r-md hover:bg-gold/90 transition-colors duration-300">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gold/10 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-lightText/60 text-xs mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Innovation Club, La Martiniere College. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-lightText/60 hover:text-gold text-xs transition-colors duration-300">Privacy Policy</a>
            <a href="#" className="text-lightText/60 hover:text-gold text-xs transition-colors duration-300">Terms of Service</a>
            <a href="#" className="text-lightText/60 hover:text-gold text-xs transition-colors duration-300">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
