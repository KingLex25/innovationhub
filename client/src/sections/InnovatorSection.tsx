import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface Innovator {
  id: number;
  name: string;
  class: string;
  profileImage: string;
  projectTitle: string;
  projectDescription: string;
  projectTags: string[];
  links: {
    linkedin?: string;
    github?: string;
    website?: string;
  };
  featured: boolean;
  month?: string;
  year?: number;
}

interface InnovatorSectionProps {
  innovators?: Innovator[];
}

export default function InnovatorSection({ innovators: propInnovators }: InnovatorSectionProps) {
  // If innovators are not provided via props, fetch them
  const { data: fetchedInnovators } = useQuery({
    queryKey: ["/api/innovators"],
    enabled: !propInnovators,
  });

  const innovators = propInnovators || fetchedInnovators || [];

  // Find the featured innovator (Innovator of the Month)
  const featuredInnovator = innovators.find((innovator) => innovator.featured);
  
  // Get previous innovators (excluding the featured one)
  const previousInnovators = innovators
    .filter((innovator) => !innovator.featured)
    .slice(0, 4);

  return (
    <section id="innovators" className="py-16 md:py-24 bg-darkGray">
      <div className="container mx-auto px-4">
        <h2 className="text-gold text-3xl md:text-4xl font-playfair font-bold mb-8 text-center">Innovator of the Month</h2>
        
        {featuredInnovator ? (
          <div className="bg-darkBg rounded-xl overflow-hidden border border-gold/20 shadow-lg max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="md:col-span-1 bg-gold/5 p-6 flex flex-col items-center justify-center">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gold/20 mb-4">
                  <img 
                    src={featuredInnovator.profileImage || "https://source.unsplash.com/random/400x400/?portrait"} 
                    alt={featuredInnovator.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h3 className="text-gold font-playfair text-xl font-bold mb-1">{featuredInnovator.name}</h3>
                <p className="text-lightText text-sm mb-4">{featuredInnovator.class}</p>
                
                <div className="flex space-x-3 text-gold">
                  {featuredInnovator.links.linkedin && (
                    <a href={featuredInnovator.links.linkedin} className="hover:text-gold/80 transition-colors duration-300" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-linkedin"></i>
                    </a>
                  )}
                  
                  {featuredInnovator.links.github && (
                    <a href={featuredInnovator.links.github} className="hover:text-gold/80 transition-colors duration-300" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-github"></i>
                    </a>
                  )}
                  
                  {featuredInnovator.links.website && (
                    <a href={featuredInnovator.links.website} className="hover:text-gold/80 transition-colors duration-300" target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-globe"></i>
                    </a>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-2 p-6 md:p-8">
                <div className="flex items-center mb-4">
                  <div className="bg-gold/10 rounded-lg p-2 mr-3">
                    <i className="fas fa-lightbulb text-gold"></i>
                  </div>
                  <h3 className="text-gold font-playfair text-2xl font-bold">{featuredInnovator.projectTitle}</h3>
                </div>
                
                <p className="text-lightText mb-4">
                  {featuredInnovator.projectDescription}
                </p>
                
                {featuredInnovator.projectTags && featuredInnovator.projectTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredInnovator.projectTags.map((tag, index) => (
                      <span key={index} className="bg-gold/10 text-gold text-xs px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-6">
                  <Button className="bg-gold text-darkBg hover:bg-gold/90">Read Full Article</Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-darkBg rounded-lg p-8 text-center border border-gold/20 max-w-2xl mx-auto">
            <p className="text-lightText">No featured innovator available at the moment.</p>
          </div>
        )}
        
        {/* Previous Innovators Gallery */}
        {previousInnovators.length > 0 && (
          <div className="mt-16">
            <h3 className="text-gold text-xl font-playfair font-bold mb-6 text-center">Previous Innovators</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {previousInnovators.map((innovator) => (
                <div 
                  key={innovator.id} 
                  className="bg-darkBg/80 rounded-lg overflow-hidden border border-gold/10 hover:border-gold/30 transition-all duration-300"
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={innovator.profileImage || "https://source.unsplash.com/random/400x400/?portrait"} 
                      alt={innovator.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-gold font-montserrat font-semibold text-sm">{innovator.name}</h4>
                    <p className="text-lightText/80 text-xs">{innovator.projectTitle}</p>
                    <p className="text-lightText/60 text-xs mt-1">{innovator.month} {innovator.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
