import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import HeroSection from "@/sections/HeroSection";
import AboutSection from "@/sections/AboutSection";
import EventsSection from "@/sections/EventsSection";
import InnovatorSection from "@/sections/InnovatorSection";
import TeamSection from "@/sections/TeamSection";
import NoticeBoard from "@/sections/NoticeBoard";
import ContactSection from "@/sections/ContactSection";
import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
  // Fetch site data
  const { data: events } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: notices } = useQuery({
    queryKey: ["/api/notices"],
  });

  const { data: innovators } = useQuery({
    queryKey: ["/api/innovators"],
  });

  const { data: team } = useQuery({
    queryKey: ["/api/team"],
  });

  const { data: aboutData } = useQuery({
    queryKey: ["/api/about"],
  });

  const { data: contactData } = useQuery({
    queryKey: ["/api/contact"],
  });

  // Scroll to section if hash is present in URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <AboutSection about={aboutData} />
        <EventsSection events={events} />
        <InnovatorSection innovators={innovators} />
        <TeamSection team={team} />
        <NoticeBoard notices={notices} />
        <ContactSection contact={contactData} />
      </main>
      <Footer />
      <BackToTopButton />
    </>
  );
}
