import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-[80vh] flex items-center justify-center">
      <div className="bg-image absolute inset-0"></div>
      <div className="overlay absolute inset-0"></div>
      
      <div className="container mx-auto px-4 z-10 relative py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold mb-6">
            <span className="text-lightText">Welcome to the</span>
            <span className="text-gold block md:inline"> Innovation Club</span>
          </h1>
          
          <p className="text-lightText text-lg md:text-xl mb-8 leading-relaxed">
            Fostering creativity and innovation at La Martiniere College. Join us in shaping the future through technology and innovative thinking.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/#events">
              <Button className="bg-gold text-darkBg font-montserrat font-medium hover:bg-gold/90">
                View Events
              </Button>
            </Link>
            <Link href="/#about">
              <Button variant="outline" className="bg-transparent text-gold font-montserrat font-medium border border-gold hover:bg-gold/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
