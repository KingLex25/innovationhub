import { useEffect, useState } from "react";

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top coordinate to 0
  // Make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 bg-gold text-darkBg w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
        isVisible ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
      aria-label="Back to top"
    >
      <i className="fas fa-arrow-up"></i>
    </button>
  );
}
