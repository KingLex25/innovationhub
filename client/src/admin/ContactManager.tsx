import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContactInfo {
  id: number;
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

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function ContactManager() {
  const { toast } = useToast();
  const [isEditContactDialogOpen, setIsEditContactDialogOpen] = useState(false);
  const [isViewMessageDialogOpen, setIsViewMessageDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDeleteMessageDialogOpen, setIsDeleteMessageDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("info");

  // Fetch contact info
  const { data: contactInfo, isLoading: isContactLoading } = useQuery({
    queryKey: ["/api/contact"],
  });

  // Fetch contact messages
  const { data: messages, isLoading: isMessagesLoading } = useQuery({
    queryKey: ["/api/contact/messages"],
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: (data: Partial<ContactInfo>) => apiRequest("PATCH", "/api/contact", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
      toast({
        title: "Contact information updated",
        description: "The contact information has been updated successfully.",
      });
      setIsEditContactDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update contact information. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest("PATCH", `/api/contact/messages/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact/messages"] });
      toast({
        title: "Message marked as read",
        description: "The message has been marked as read.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark message as read. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/contact/messages/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contact/messages"] });
      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully.",
      });
      setIsDeleteMessageDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewMessageDialogOpen(true);
    
    // If the message is unread, mark it as read
    if (!message.read) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleDeleteMessage = (id: number) => {
    setMessageToDelete(id);
    setIsDeleteMessageDialogOpen(true);
  };

  const confirmDeleteMessage = () => {
    if (messageToDelete) {
      deleteMessageMutation.mutate(messageToDelete);
    }
  };

  const handleUpdateContact = () => {
    if (contactInfo) {
      updateContactMutation.mutate(contactInfo);
    }
  };

  const unreadCount = messages?.filter(m => !m.read).length || 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gold">Contact Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="bg-darkGray border border-gold/20">
          <TabsTrigger value="info" className="data-[state=active]:bg-gold data-[state=active]:text-darkBg">
            Contact Information
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-gold data-[state=active]:text-darkBg">
            Messages
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white" variant="outline">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          {isContactLoading ? (
            <div className="text-center py-8">
              <p className="text-lightText">Loading contact information...</p>
            </div>
          ) : contactInfo ? (
            <Card className="bg-darkBg border-gold/20">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-gold">Contact Information</CardTitle>
                    <CardDescription className="text-lightText/70">Public contact details for the Innovation Club</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-gold/20 text-gold hover:bg-gold/10"
                    onClick={() => setIsEditContactDialogOpen(true)}
                  >
                    <i className="fas fa-edit mr-2"></i>Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-gold font-semibold">Email Address</h3>
                    <p className="text-lightText flex items-center">
                      <i className="fas fa-envelope text-gold/70 mr-2"></i>
                      {contactInfo.email}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-gold font-semibold">Phone Number</h3>
                    <p className="text-lightText flex items-center">
                      <i className="fas fa-phone text-gold/70 mr-2"></i>
                      {contactInfo.phone}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-gold font-semibold">Address</h3>
                  <p className="text-lightText flex items-start">
                    <i className="fas fa-map-marker-alt text-gold/70 mr-2 mt-1"></i>
                    <span>{contactInfo.address}</span>
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-gold font-semibold">Club Hours</h3>
                    <p className="text-lightText flex items-center">
                      <i className="fas fa-clock text-gold/70 mr-2"></i>
                      {contactInfo.hours}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-gold font-semibold">Weekend Availability</h3>
                    <p className="text-lightText flex items-center">
                      <i className="fas fa-calendar-alt text-gold/70 mr-2"></i>
                      {contactInfo.weekend}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-gold font-semibold">Social Media</h3>
                  <div className="flex flex-wrap gap-4">
                    {contactInfo.social.instagram && (
                      <div className="flex items-center text-lightText">
                        <i className="fab fa-instagram text-gold/70 mr-2"></i>
                        <span>Instagram</span>
                      </div>
                    )}
                    
                    {contactInfo.social.twitter && (
                      <div className="flex items-center text-lightText">
                        <i className="fab fa-twitter text-gold/70 mr-2"></i>
                        <span>Twitter</span>
                      </div>
                    )}
                    
                    {contactInfo.social.linkedin && (
                      <div className="flex items-center text-lightText">
                        <i className="fab fa-linkedin text-gold/70 mr-2"></i>
                        <span>LinkedIn</span>
                      </div>
                    )}
                    
                    {contactInfo.social.youtube && (
                      <div className="flex items-center text-lightText">
                        <i className="fab fa-youtube text-gold/70 mr-2"></i>
                        <span>YouTube</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-darkBg rounded-lg border border-gold/20 p-8 text-center">
              <p className="text-lightText mb-4">No contact information found</p>
              <Button 
                variant="outline" 
                className="border-gold text-gold hover:bg-gold/10"
                onClick={() => {
                  // Initialize with empty data
                  updateContactMutation.mutate({
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
                  });
                }}
              >
                Initialize Contact Information
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          {isMessagesLoading ? (
            <div className="text-center py-8">
              <p className="text-lightText">Loading messages...</p>
            </div>
          ) : messages && messages.length > 0 ? (
            <div className="bg-darkBg rounded-lg border border-gold/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gold">Sender</TableHead>
                    <TableHead className="text-gold">Subject</TableHead>
                    <TableHead className="text-gold">Received</TableHead>
                    <TableHead className="text-gold">Status</TableHead>
                    <TableHead className="text-gold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow 
                      key={message.id} 
                      className={`border-gold/10 ${!message.read ? 'bg-gold/5' : ''}`}
                    >
                      <TableCell className="font-medium text-lightText">
                        <div>
                          <div>{message.name}</div>
                          <div className="text-xs text-lightText/60">{message.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-lightText">{message.subject}</TableCell>
                      <TableCell className="text-lightText">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {message.read ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-400/20">
                            Read
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-400/20">
                            New
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-gold border-gold/20 hover:bg-gold/10"
                            onClick={() => handleViewMessage(message)}
                          >
                            <i className="fas fa-eye"></i>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="bg-darkBg rounded-lg border border-gold/20 p-8 text-center">
              <p className="text-lightText mb-4">No messages received yet</p>
              <p className="text-lightText/70 text-sm">
                Messages from the contact form will appear here
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Contact Dialog */}
      {contactInfo && (
        <Dialog open={isEditContactDialogOpen} onOpenChange={setIsEditContactDialogOpen}>
          <DialogContent className="bg-darkBg border border-gold/20 text-lightText">
            <DialogHeader>
              <DialogTitle className="text-gold">Edit Contact Information</DialogTitle>
              <DialogDescription>Update the contact details for the Innovation Club</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Email Address</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={contactInfo.email}
                    onChange={(e) => {
                      contactInfo.email = e.target.value;
                      queryClient.setQueryData(["/api/contact"], contactInfo);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Phone Number</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={contactInfo.phone}
                    onChange={(e) => {
                      contactInfo.phone = e.target.value;
                      queryClient.setQueryData(["/api/contact"], contactInfo);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Address</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={contactInfo.address}
                  onChange={(e) => {
                    contactInfo.address = e.target.value;
                    queryClient.setQueryData(["/api/contact"], contactInfo);
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Club Hours</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={contactInfo.hours}
                    onChange={(e) => {
                      contactInfo.hours = e.target.value;
                      queryClient.setQueryData(["/api/contact"], contactInfo);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Weekend Availability</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={contactInfo.weekend}
                    onChange={(e) => {
                      contactInfo.weekend = e.target.value;
                      queryClient.setQueryData(["/api/contact"], contactInfo);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4 border border-gold/10 p-4 rounded-md">
                <label className="text-sm font-medium text-gold">Social Media Links</label>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <i className="fab fa-instagram text-gold mr-2 w-6"></i>
                    <Input 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={contactInfo.social.instagram || ""}
                      onChange={(e) => {
                        contactInfo.social.instagram = e.target.value;
                        queryClient.setQueryData(["/api/contact"], contactInfo);
                      }}
                      placeholder="Instagram URL"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <i className="fab fa-twitter text-gold mr-2 w-6"></i>
                    <Input 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={contactInfo.social.twitter || ""}
                      onChange={(e) => {
                        contactInfo.social.twitter = e.target.value;
                        queryClient.setQueryData(["/api/contact"], contactInfo);
                      }}
                      placeholder="Twitter URL"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <i className="fab fa-linkedin-in text-gold mr-2 w-6"></i>
                    <Input 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={contactInfo.social.linkedin || ""}
                      onChange={(e) => {
                        contactInfo.social.linkedin = e.target.value;
                        queryClient.setQueryData(["/api/contact"], contactInfo);
                      }}
                      placeholder="LinkedIn URL"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <i className="fab fa-youtube text-gold mr-2 w-6"></i>
                    <Input 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={contactInfo.social.youtube || ""}
                      onChange={(e) => {
                        contactInfo.social.youtube = e.target.value;
                        queryClient.setQueryData(["/api/contact"], contactInfo);
                      }}
                      placeholder="YouTube URL"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                className="border-gold/20 text-lightText hover:bg-darkGray"
                onClick={() => setIsEditContactDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gold text-darkBg hover:bg-gold/90"
                onClick={handleUpdateContact}
                disabled={updateContactMutation.isPending}
              >
                {updateContactMutation.isPending ? "Updating..." : "Update Contact"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Message Dialog */}
      {selectedMessage && (
        <Dialog open={isViewMessageDialogOpen} onOpenChange={setIsViewMessageDialogOpen}>
          <DialogContent className="bg-darkBg border border-gold/20 text-lightText">
            <DialogHeader>
              <DialogTitle className="text-gold">{selectedMessage.subject}</DialogTitle>
              <DialogDescription>
                From {selectedMessage.name} ({selectedMessage.email})
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="bg-darkGray/50 p-4 rounded-md border border-gold/10 text-lightText whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
              
              <div className="mt-4 text-right text-sm text-lightText/60">
                Received {formatDistanceToNow(new Date(selectedMessage.createdAt), { addSuffix: true })}
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                className="border-gold/20 text-lightText hover:bg-darkGray"
                onClick={() => setIsViewMessageDialogOpen(false)}
              >
                Close
              </Button>
              <Button 
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  setIsViewMessageDialogOpen(false);
                  handleDeleteMessage(selectedMessage.id);
                }}
              >
                Delete Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Message Confirmation Dialog */}
      <AlertDialog open={isDeleteMessageDialogOpen} onOpenChange={setIsDeleteMessageDialogOpen}>
        <AlertDialogContent className="bg-darkBg border border-gold/20 text-lightText">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gold">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold/20 text-lightText hover:bg-darkGray">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDeleteMessage}
            >
              {deleteMessageMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
