import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  hours: string;
  weekend: string;
  social: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };
}

interface ContactSectionProps {
  contact?: ContactInfo;
}

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(100),
  message: z.string().min(10, "Message must be at least 10 characters").max(500),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactSection({ contact: propContact }: ContactSectionProps) {
  const { toast } = useToast();

  // If contact info is not provided via props, fetch it
  const { data: fetchedContact } = useQuery({
    queryKey: ["/api/contact"],
    enabled: !propContact,
  });

  const contact = propContact || fetchedContact || {
    email: "innovation.club@lamartiniere.edu",
    phone: "+91 522 2239078",
    address: "Innovation Club, La Martiniere College, 1 La Martiniere Road, Lucknow",
    hours: "Monday - Friday: 3:00 PM - 5:00 PM",
    weekend: "Weekend meetings by appointment",
    social: {
      instagram: "#",
      twitter: "#",
      linkedin: "#",
      youtube: "#"
    }
  };

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await apiRequest("POST", "/api/contact/message", values);
      
      form.reset();
      
      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We'll get back to you soon!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-gold text-3xl md:text-4xl font-playfair font-bold mb-8 text-center">Contact Us</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Information */}
          <div className="bg-darkGray/80 rounded-lg border border-gold/20 p-6 md:p-8">
            <h3 className="text-gold font-playfair text-2xl font-bold mb-6">Get in Touch</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mr-4">
                  <i className="fas fa-envelope text-gold"></i>
                </div>
                <div>
                  <p className="text-lightText text-sm font-medium mb-1">Email</p>
                  <p className="text-gold">{contact.email}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mr-4">
                  <i className="fas fa-phone text-gold"></i>
                </div>
                <div>
                  <p className="text-lightText text-sm font-medium mb-1">Phone</p>
                  <p className="text-gold">{contact.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mr-4">
                  <i className="fas fa-map-marker-alt text-gold"></i>
                </div>
                <div>
                  <p className="text-lightText text-sm font-medium mb-1">Address</p>
                  <p className="text-gold">Innovation Club, La Martiniere College</p>
                  <p className="text-lightText">1 La Martiniere Road, Lucknow</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mr-4">
                  <i className="fas fa-clock text-gold"></i>
                </div>
                <div>
                  <p className="text-lightText text-sm font-medium mb-1">Club Hours</p>
                  <p className="text-gold">{contact.hours}</p>
                  <p className="text-lightText">{contact.weekend}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-gold font-montserrat font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                {contact.social.instagram && (
                  <a 
                    href={contact.social.instagram} 
                    className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-instagram"></i>
                  </a>
                )}
                
                {contact.social.twitter && (
                  <a 
                    href={contact.social.twitter} 
                    className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-twitter"></i>
                  </a>
                )}
                
                {contact.social.linkedin && (
                  <a 
                    href={contact.social.linkedin} 
                    className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-linkedin-in"></i>
                  </a>
                )}
                
                {contact.social.youtube && (
                  <a 
                    href={contact.social.youtube} 
                    className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fab fa-youtube"></i>
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-darkGray/80 rounded-lg border border-gold/20 p-6 md:p-8">
            <h3 className="text-gold font-playfair text-2xl font-bold mb-6">Send a Message</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lightText">Name</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-darkBg border border-gold/20 text-lightText focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lightText">Email</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-darkBg border border-gold/20 text-lightText focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lightText">Subject</FormLabel>
                      <FormControl>
                        <Input 
                          className="bg-darkBg border border-gold/20 text-lightText focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lightText">Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="bg-darkBg border border-gold/20 text-lightText focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold" 
                          rows={5} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-gold text-darkBg font-montserrat font-medium hover:bg-gold/90"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
