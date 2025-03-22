import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface EventLeaderboard {
  first: string;
  second: string;
  third: string;
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  description: string;
  image: string;
  status: "upcoming" | "ongoing" | "completed";
  leaderboard?: EventLeaderboard;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface EventsSectionProps {
  events?: Event[];
}

export default function EventsSection({ events: propEvents }: EventsSectionProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expandedLeaderboards, setExpandedLeaderboards] = useState<Record<number, boolean>>({});

  // If events are not provided via props, fetch them
  const { data: fetchedEvents } = useQuery({
    queryKey: ["/api/events"],
    enabled: !propEvents,
  });

  const events = propEvents || fetchedEvents || [];

  // Find the next upcoming event
  const nextEvent = events.find(event => event.status === "upcoming");

  // Calculate countdown for next event
  useEffect(() => {
    if (!nextEvent) return;

    const targetDate = new Date(nextEvent.date);
    
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setCountdown({ days, hours, minutes, seconds });
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [nextEvent]);

  // Toggle leaderboard display
  const toggleLeaderboard = (eventId: number) => {
    setExpandedLeaderboards(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  // Get list of categories from events
  const categories = ["all", ...Array.from(new Set(events.map(event => event.category)))];

  // Filter events by active category
  const filteredEvents = activeCategory === "all" 
    ? events 
    : events.filter(event => event.category === activeCategory);

  // Past events for timeline display
  const pastAndUpcomingEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <section id="events" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-gold text-3xl md:text-4xl font-playfair font-bold mb-8 text-center">Club Events</h2>
        
        {/* Events Categories Tabs */}
        <div className="tab-slider mb-12">
          <div className="flex flex-nowrap md:justify-center overflow-x-auto py-2">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-5 py-3 mx-1 rounded-md font-montserrat whitespace-nowrap border transition-all duration-300 ${
                  activeCategory === category
                    ? "text-gold bg-gold/10 border-gold/20"
                    : "text-lightText bg-darkGray/80 border-gold/10 hover:bg-gold/10 hover:text-gold"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Upcoming Event Highlight */}
        {nextEvent && (
          <div className="mb-12 bg-darkGray/80 rounded-xl overflow-hidden border border-gold/20 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-1 p-6 flex items-center justify-center bg-gold/5">
                <div className="text-center">
                  <h3 className="text-gold font-playfair text-2xl font-bold mb-4">Next Event</h3>
                  <div className="flex justify-center gap-4 mb-6">
                    {/* Days */}
                    <div className="flex flex-col items-center">
                      <div className="text-gold text-3xl font-montserrat font-bold">{countdown.days.toString().padStart(2, '0')}</div>
                      <div className="text-lightText text-xs uppercase">Days</div>
                    </div>
                    {/* Hours */}
                    <div className="flex flex-col items-center">
                      <div className="text-gold text-3xl font-montserrat font-bold">{countdown.hours.toString().padStart(2, '0')}</div>
                      <div className="text-lightText text-xs uppercase">Hours</div>
                    </div>
                    {/* Minutes */}
                    <div className="flex flex-col items-center">
                      <div className="text-gold text-3xl font-montserrat font-bold">{countdown.minutes.toString().padStart(2, '0')}</div>
                      <div className="text-lightText text-xs uppercase">Mins</div>
                    </div>
                    {/* Seconds */}
                    <div className="flex flex-col items-center">
                      <div className="text-gold text-3xl font-montserrat font-bold">{countdown.seconds.toString().padStart(2, '0')}</div>
                      <div className="text-lightText text-xs uppercase">Secs</div>
                    </div>
                  </div>
                  <Button className="bg-gold text-darkBg font-montserrat font-medium hover:bg-gold/90">Register Now</Button>
                </div>
              </div>
              
              <div className="lg:col-span-2 p-6 md:p-8">
                <div className="flex items-start">
                  <div className="bg-gold/10 rounded-lg p-3 mr-4">
                    <i className="fas fa-laptop-code text-gold text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-gold font-playfair text-2xl font-bold">{nextEvent.title}</h3>
                    <p className="text-lightText text-sm mb-1">{nextEvent.date} • {nextEvent.location}</p>
                    <div className="flex items-center text-gold/70 mb-4">
                      <i className="fas fa-user-group mr-1 text-xs"></i>
                      <span className="text-xs">Teams of 2-4 students</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-lightText mb-6">
                  {nextEvent.description}
                </p>
                
                <div className="text-sm text-lightText/80">
                  <div className="flex items-center mb-2">
                    <i className="fas fa-trophy text-gold mr-2"></i>
                    <span>Prizes worth ₹50,000 for winning teams</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <i className="fas fa-certificate text-gold mr-2"></i>
                    <span>Certificates for all participants</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fas fa-laptop text-gold mr-2"></i>
                    <span>Bring your own device; food and refreshments provided</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredEvents.map((event) => (
            <div 
              key={event.id}
              className="event-card bg-darkGray/80 rounded-lg overflow-hidden border border-gold/20 hover:border-gold/40 shadow-md transition-all duration-300"
              data-category={event.category}
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={event.image || `https://source.unsplash.com/random/800x600/?${event.category}`} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 right-0 bg-gold text-darkBg px-3 py-1 text-sm font-montserrat font-medium">
                  {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-gold font-playfair text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-lightText/80 text-sm mb-4">{event.date} • {event.time}</p>
                
                <p className="text-lightText text-sm mb-4">{event.description}</p>
                
                {event.status === "completed" && event.leaderboard && (
                  <div className="mb-4">
                    <button 
                      className="text-gold text-sm font-montserrat hover:underline flex items-center"
                      onClick={() => toggleLeaderboard(event.id)}
                    >
                      <span>View Leaderboard</span>
                      <i className={`fas fa-chevron-down ml-1 text-xs transition-transform duration-300 ${expandedLeaderboards[event.id] ? 'rotate-180' : ''}`}></i>
                    </button>
                    
                    {expandedLeaderboards[event.id] && (
                      <div className="mt-3 bg-darkBg p-3 rounded-md border border-gold/10">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 rounded-full bg-gold flex items-center justify-center text-darkBg text-xs font-bold mr-2">1</div>
                          <span className="text-lightText text-sm">{event.leaderboard.first}</span>
                        </div>
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold mr-2">2</div>
                          <span className="text-lightText text-sm">{event.leaderboard.second}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-amber-700 flex items-center justify-center text-white text-xs font-bold mr-2">3</div>
                          <span className="text-lightText text-sm">{event.leaderboard.third}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {event.status === "upcoming" && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-lightText/80 text-xs flex items-center">
                      <i className="fas fa-users mr-1"></i>
                      <span>20 spots available</span>
                    </div>
                    
                    <Button className="bg-gold text-darkBg hover:bg-gold/90 text-sm">Register</Button>
                  </div>
                )}
                
                {event.status === "completed" && (
                  <Link href={`/events/${event.id}`}>
                    <Button className="bg-gold text-darkBg hover:bg-gold/90 text-sm">View Details</Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Event Timeline */}
        <div className="mt-16">
          <h3 className="text-gold text-2xl font-playfair font-bold mb-8 text-center">Event Timeline</h3>
          
          <div className="relative max-w-3xl mx-auto">
            {/* Timeline items */}
            <div className="space-y-8">
              {pastAndUpcomingEvents.slice(0, 4).map((event, index) => (
                <div key={event.id} className="timeline-item pl-12 relative">
                  <div className={`absolute left-0 top-0 w-8 h-8 ${
                    event.status === "upcoming" 
                      ? "bg-darkGray rounded-full flex items-center justify-center border-2 border-gold"
                      : "bg-gold rounded-full flex items-center justify-center"
                  }`}>
                    <i className={`fas fa-${event.status === "upcoming" ? "calendar" : "calendar-check"} ${
                      event.status === "upcoming" ? "text-gold" : "text-darkBg"
                    }`}></i>
                  </div>
                  <div className="bg-darkGray/80 p-4 rounded-lg border border-gold/20">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-gold font-montserrat font-semibold">{event.title}</h4>
                      <span className="text-lightText/80 text-sm">{event.date.split(',')[0]}</span>
                    </div>
                    <p className="text-lightText text-sm">{event.description.substring(0, 80)}...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
