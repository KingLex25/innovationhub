import { useQuery } from "@tanstack/react-query";

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image: string;
  links: {
    email?: string;
    linkedin?: string;
    github?: string;
  };
  type: 'faculty' | 'student';
}

interface TeamSectionProps {
  team?: TeamMember[];
}

export default function TeamSection({ team: propTeam }: TeamSectionProps) {
  // If team is not provided via props, fetch it
  const { data: fetchedTeam } = useQuery({
    queryKey: ["/api/team"],
    enabled: !propTeam,
  });

  const team = propTeam || fetchedTeam || [];

  // Split team members by type
  const facultyMembers = team.filter((member) => member.type === 'faculty');
  const studentMembers = team.filter((member) => member.type === 'student');

  return (
    <section id="team" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-gold text-3xl md:text-4xl font-playfair font-bold mb-8 text-center">Our Team</h2>
        
        {/* Faculty Advisors */}
        <h3 className="text-gold text-xl font-playfair font-bold mb-6 text-center">Faculty Advisors</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {facultyMembers.length > 0 ? (
            facultyMembers.map((member) => (
              <div 
                key={member.id} 
                className="bg-darkGray/80 rounded-lg overflow-hidden border border-gold/20 p-6 flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gold/20 mb-4">
                  <img 
                    src={member.image || "https://source.unsplash.com/random/200x200/?portrait"} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h4 className="text-gold font-playfair text-lg font-bold mb-1">{member.name}</h4>
                <p className="text-lightText text-sm font-medium mb-3">{member.position}</p>
                <p className="text-lightText/80 text-sm mb-4">{member.bio}</p>
                
                <div className="mt-auto flex space-x-3 text-gold/80">
                  {member.links.email && (
                    <a href={`mailto:${member.links.email}`} className="hover:text-gold transition-colors duration-300">
                      <i className="fas fa-envelope"></i>
                    </a>
                  )}
                  
                  {member.links.linkedin && (
                    <a href={member.links.linkedin} className="hover:text-gold transition-colors duration-300" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-linkedin"></i>
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-6">
              <p className="text-lightText">No faculty advisors information available.</p>
            </div>
          )}
        </div>
        
        {/* Student Leadership */}
        <h3 className="text-gold text-xl font-playfair font-bold mb-6 text-center">Student Leadership</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {studentMembers.length > 0 ? (
            studentMembers.map((member) => (
              <div 
                key={member.id} 
                className="bg-darkGray/80 rounded-lg overflow-hidden border border-gold/10 p-4 flex items-center"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gold/20 mr-3 flex-shrink-0">
                  <img 
                    src={member.image || "https://source.unsplash.com/random/100x100/?portrait"} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div>
                  <h4 className="text-gold font-montserrat font-semibold text-sm mb-1">{member.name}</h4>
                  <p className="text-lightText text-xs">{member.position}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-6">
              <p className="text-lightText">No student leadership information available.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
