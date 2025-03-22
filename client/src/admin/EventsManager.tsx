import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function EventsManager() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    category: "hackathon",
    description: "",
    image: "",
    status: "upcoming",
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch events
  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: (newEvent: any) => apiRequest("POST", "/api/events", newEvent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event created",
        description: "The event has been added successfully.",
      });
      setIsAddDialogOpen(false);
      resetNewEvent();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update event mutation
  const updateMutation = useMutation({
    mutationFn: (event: any) => apiRequest("PATCH", `/api/events/${event.id}`, event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event updated",
        description: "The event has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/events/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetNewEvent = () => {
    setNewEvent({
      title: "",
      date: "",
      time: "",
      location: "",
      category: "hackathon",
      description: "",
      image: "",
      status: "upcoming",
    });
    setSelectedDate(null);
  };

  const handleCreateEvent = () => {
    createMutation.mutate(newEvent);
  };

  const handleEditEvent = (event: any) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleUpdateEvent = () => {
    updateMutation.mutate(selectedEvent);
  };

  const handleDeleteEvent = (id: number) => {
    setEventToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEvent = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete);
    }
  };

  // Update date in new event when date is selected
  useEffect(() => {
    if (selectedDate) {
      setNewEvent({
        ...newEvent,
        date: format(selectedDate, "yyyy-MM-dd"),
      });
    }
  }, [selectedDate]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gold">Events Management</h1>
        <Button 
          className="bg-gold text-darkBg hover:bg-gold/90"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <i className="fas fa-plus mr-2"></i>
          Add New Event
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-lightText">Loading events...</p>
        </div>
      ) : events && events.length > 0 ? (
        <div className="bg-darkBg rounded-lg border border-gold/20 overflow-hidden">
          <Table>
            <TableCaption>List of all events</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gold">Title</TableHead>
                <TableHead className="text-gold">Category</TableHead>
                <TableHead className="text-gold">Date</TableHead>
                <TableHead className="text-gold">Status</TableHead>
                <TableHead className="text-gold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event: any) => (
                <TableRow key={event.id} className="border-gold/10">
                  <TableCell className="font-medium text-lightText">{event.title}</TableCell>
                  <TableCell className="text-lightText">{event.category}</TableCell>
                  <TableCell className="text-lightText">{event.date}</TableCell>
                  <TableCell>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'upcoming' 
                          ? 'bg-blue-500/10 text-blue-400' 
                          : event.status === 'ongoing' 
                            ? 'bg-green-500/10 text-green-400' 
                            : 'bg-gray-500/10 text-gray-400'
                      }`}
                    >
                      {event.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-gold border-gold/20 hover:bg-gold/10"
                        onClick={() => handleEditEvent(event)}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                        onClick={() => handleDeleteEvent(event.id)}
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
          <p className="text-lightText mb-4">No events found</p>
          <Button 
            variant="outline" 
            className="border-gold text-gold hover:bg-gold/10"
            onClick={() => setIsAddDialogOpen(true)}
          >
            Add your first event
          </Button>
        </div>
      )}

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-darkBg border border-gold/20 text-lightText">
          <DialogHeader>
            <DialogTitle className="text-gold">Add New Event</DialogTitle>
            <DialogDescription>Create a new event for the Innovation Club</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Title</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Event Title"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Category</label>
                <Select 
                  value={newEvent.category} 
                  onValueChange={(value) => setNewEvent({ ...newEvent, category: value })}
                >
                  <SelectTrigger className="bg-darkGray border-gold/20 text-lightText">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-darkGray border-gold/20">
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="sciencefair">Science Fair</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full bg-darkGray border-gold/20 text-lightText justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-darkGray border-gold/20">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="bg-darkGray text-lightText"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Time</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  placeholder="e.g. 10:00 AM - 4:00 PM"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Location</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Event Location"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Status</label>
                <Select 
                  value={newEvent.status} 
                  onValueChange={(value) => setNewEvent({ ...newEvent, status: value as "upcoming" | "ongoing" | "completed" })}
                >
                  <SelectTrigger className="bg-darkGray border-gold/20 text-lightText">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-darkGray border-gold/20">
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Image URL</label>
              <Input 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newEvent.image}
                onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
                placeholder="Image URL (optional)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Description</label>
              <Textarea 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Event Description"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-gold/20 text-lightText hover:bg-darkGray"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetNewEvent();
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-gold text-darkBg hover:bg-gold/90"
              onClick={handleCreateEvent}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      {selectedEvent && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-darkBg border border-gold/20 text-lightText">
            <DialogHeader>
              <DialogTitle className="text-gold">Edit Event</DialogTitle>
              <DialogDescription>Update event details</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Title</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={selectedEvent.title}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Category</label>
                  <Select 
                    value={selectedEvent.category} 
                    onValueChange={(value) => setSelectedEvent({ ...selectedEvent, category: value })}
                  >
                    <SelectTrigger className="bg-darkGray border-gold/20 text-lightText">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-darkGray border-gold/20">
                      <SelectItem value="hackathon">Hackathon</SelectItem>
                      <SelectItem value="sciencefair">Science Fair</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="competition">Competition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Date</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={selectedEvent.date}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Time</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={selectedEvent.time}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Location</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={selectedEvent.location}
                    onChange={(e) => setSelectedEvent({ ...selectedEvent, location: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Status</label>
                  <Select 
                    value={selectedEvent.status} 
                    onValueChange={(value) => setSelectedEvent({ ...selectedEvent, status: value })}
                  >
                    <SelectTrigger className="bg-darkGray border-gold/20 text-lightText">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-darkGray border-gold/20">
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Image URL</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedEvent.image}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, image: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Description</label>
                <Textarea 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedEvent.description}
                  onChange={(e) => setSelectedEvent({ ...selectedEvent, description: e.target.value })}
                  rows={4}
                />
              </div>

              {selectedEvent.status === "completed" && (
                <div className="space-y-2 border border-gold/10 p-4 rounded-md">
                  <label className="text-sm font-medium text-gold">Leaderboard</label>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center text-darkBg mr-2">1</div>
                      <Input 
                        className="bg-darkGray border-gold/20 text-lightText"
                        value={selectedEvent.leaderboard?.first || ""}
                        onChange={(e) => setSelectedEvent({ 
                          ...selectedEvent, 
                          leaderboard: { 
                            ...selectedEvent.leaderboard || {}, 
                            first: e.target.value 
                          } 
                        })}
                        placeholder="First place (e.g. Team Alpha - Project X)"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white mr-2">2</div>
                      <Input 
                        className="bg-darkGray border-gold/20 text-lightText"
                        value={selectedEvent.leaderboard?.second || ""}
                        onChange={(e) => setSelectedEvent({ 
                          ...selectedEvent, 
                          leaderboard: { 
                            ...selectedEvent.leaderboard || {}, 
                            second: e.target.value 
                          } 
                        })}
                        placeholder="Second place (e.g. Team Beta - Project Y)"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-amber-700 rounded-full flex items-center justify-center text-white mr-2">3</div>
                      <Input 
                        className="bg-darkGray border-gold/20 text-lightText"
                        value={selectedEvent.leaderboard?.third || ""}
                        onChange={(e) => setSelectedEvent({ 
                          ...selectedEvent, 
                          leaderboard: { 
                            ...selectedEvent.leaderboard || {}, 
                            third: e.target.value 
                          } 
                        })}
                        placeholder="Third place (e.g. Team Gamma - Project Z)"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                className="border-gold/20 text-lightText hover:bg-darkGray"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gold text-darkBg hover:bg-gold/90"
                onClick={handleUpdateEvent}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Event"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-darkBg border border-gold/20 text-lightText">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gold">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold/20 text-lightText hover:bg-darkGray">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDeleteEvent}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
