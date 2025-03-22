import { useQuery } from "@tanstack/react-query";

interface AboutSectionProps {
  about?: {
    description?: string;
    vision?: string;
    mission?: string;
    features?: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  };
}

export default function AboutSection({ about }: AboutSectionProps) {
  // If about is not provided via props, fetch it
  const { data: aboutData } = useQuery({
    queryKey: ["/api/about"],
    enabled: !about,
  });

  const aboutInfo = about || aboutData || {
    description: "The Innovation Club at La Martiniere College was established with a vision to nurture creative thinking and innovative problem-solving skills among students. We believe that innovation is the key to addressing the challenges of tomorrow.",
    mission: "Our club provides a platform for students to explore cutting-edge technologies, develop prototypes, and collaborate on projects that have real-world applications. Through various activities, workshops, and competitions, we aim to foster an ecosystem that encourages experimentation and learning.",
    features: [
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
    ]
  };

  return (
    <section id="about" className="py-16 md:py-24 bg-darkGray">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-gold text-3xl md:text-4xl font-playfair font-bold mb-8 text-center">About Our Innovation Club</h2>
          
          <div className="bg-darkBg p-6 md:p-8 rounded-lg border border-gold/20 shadow-lg">
            {aboutInfo.description && (
              <p className="text-lightText mb-6 leading-relaxed">
                {aboutInfo.description}
              </p>
            )}
            
            {aboutInfo.mission && (
              <p className="text-lightText mb-6 leading-relaxed">
                {aboutInfo.mission}
              </p>
            )}
            
            {aboutInfo.features && aboutInfo.features.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                {aboutInfo.features.map((feature, index) => (
                  <div key={index} className="bg-darkGray/80 p-6 rounded-lg border border-gold/10 text-center">
                    <div className="text-gold text-3xl mb-4">
                      <i className={`fas fa-${feature.icon}`}></i>
                    </div>
                    <h3 className="text-gold font-montserrat font-semibold text-lg mb-3">{feature.title}</h3>
                    <p className="text-lightText text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
