import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TeamMember {
  id: number;
  name: string;
  position: string;
  bio: string;
  image: string;
  type: "faculty" | "student";
  links: {
    email?: string;
    linkedin?: string;
    github?: string;
  };
}

export default function TeamManager() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState<Omit<TeamMember, "id">>({
    name: "",
    position: "",
    bio: "",
    image: "",
    type: "faculty",
    links: {}
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);

  // Fetch team members
  const { data: team, isLoading } = useQuery({
    queryKey: ["/api/team"],
  });

  // Create team member mutation
  const createMutation = useMutation({
    mutationFn: (newMember: Omit<TeamMember, "id">) => apiRequest("POST", "/api/team", newMember),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Team member added",
        description: "The team member has been added successfully.",
      });
      setIsAddDialogOpen(false);
      resetNewMember();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add team member. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update team member mutation
  const updateMutation = useMutation({
    mutationFn: (member: TeamMember) => apiRequest("PATCH", `/api/team/${member.id}`, member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Team member updated",
        description: "The team member has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update team member. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete team member mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/team/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({
        title: "Team member deleted",
        description: "The team member has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete team member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetNewMember = () => {
    setNewMember({
      name: "",
      position: "",
      bio: "",
      image: "",
      type: "faculty",
      links: {}
    });
  };

  const handleCreateMember = () => {
    createMutation.mutate(newMember);
  };

  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditDialogOpen(true);
  };

  const handleUpdateMember = () => {
    if (selectedMember) {
      updateMutation.mutate(selectedMember);
    }
  };

  const handleDeleteMember = (id: number) => {
    setMemberToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteMember = () => {
    if (memberToDelete) {
      deleteMutation.mutate(memberToDelete);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gold">Team Management</h1>
        <Button 
          className="bg-gold text-darkBg hover:bg-gold/90"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <i className="fas fa-plus mr-2"></i>
          Add Team Member
        </Button>
      </div>

      {/* Faculty Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gold mb-4">Faculty Advisors</h2>
        
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-lightText">Loading faculty members...</p>
          </div>
        ) : team && team.filter((m: TeamMember) => m.type === "faculty").length > 0 ? (
          <div className="bg-darkBg rounded-lg border border-gold/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gold">Name</TableHead>
                  <TableHead className="text-gold">Position</TableHead>
                  <TableHead className="text-gold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team
                  .filter((member: TeamMember) => member.type === "faculty")
                  .map((member: TeamMember) => (
                    <TableRow key={member.id} className="border-gold/10">
                      <TableCell className="font-medium text-lightText">
                        <div className="flex items-center">
                          {member.image && (
                            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                              <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          {member.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-lightText">{member.position}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-gold border-gold/20 hover:bg-gold/10"
                            onClick={() => handleEditMember(member)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                            onClick={() => handleDeleteMember(member.id)}
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
          <div className="bg-darkBg rounded-lg border border-gold/20 p-6 text-center">
            <p className="text-lightText mb-4">No faculty advisors found</p>
            <Button 
              variant="outline" 
              className="border-gold text-gold hover:bg-gold/10"
              onClick={() => {
                resetNewMember();
                setNewMember(prev => ({...prev, type: "faculty"}));
                setIsAddDialogOpen(true);
              }}
            >
              Add Faculty Advisor
            </Button>
          </div>
        )}
      </div>

      {/* Student Leadership Section */}
      <div>
        <h2 className="text-xl font-semibold text-gold mb-4">Student Leadership</h2>
        
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-lightText">Loading student leaders...</p>
          </div>
        ) : team && team.filter((m: TeamMember) => m.type === "student").length > 0 ? (
          <div className="bg-darkBg rounded-lg border border-gold/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gold">Name</TableHead>
                  <TableHead className="text-gold">Position</TableHead>
                  <TableHead className="text-gold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team
                  .filter((member: TeamMember) => member.type === "student")
                  .map((member: TeamMember) => (
                    <TableRow key={member.id} className="border-gold/10">
                      <TableCell className="font-medium text-lightText">
                        <div className="flex items-center">
                          {member.image && (
                            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                              <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          {member.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-lightText">{member.position}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-gold border-gold/20 hover:bg-gold/10"
                            onClick={() => handleEditMember(member)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                            onClick={() => handleDeleteMember(member.id)}
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
          <div className="bg-darkBg rounded-lg border border-gold/20 p-6 text-center">
            <p className="text-lightText mb-4">No student leaders found</p>
            <Button 
              variant="outline" 
              className="border-gold text-gold hover:bg-gold/10"
              onClick={() => {
                resetNewMember();
                setNewMember(prev => ({...prev, type: "student"}));
                setIsAddDialogOpen(true);
              }}
            >
              Add Student Leader
            </Button>
          </div>
        )}
      </div>

      {/* Add Member Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-darkBg border border-gold/20 text-lightText">
          <DialogHeader>
            <DialogTitle className="text-gold">Add Team Member</DialogTitle>
            <DialogDescription>Add a new team member to the Innovation Club</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Member Type</label>
              <Select 
                value={newMember.type} 
                onValueChange={(value: "faculty" | "student") => setNewMember({ ...newMember, type: value })}
              >
                <SelectTrigger className="bg-darkGray border-gold/20 text-lightText">
                  <SelectValue placeholder="Select member type" />
                </SelectTrigger>
                <SelectContent className="bg-darkGray border-gold/20">
                  <SelectItem value="faculty">Faculty Advisor</SelectItem>
                  <SelectItem value="student">Student Leader</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Name</label>
              <Input 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Full Name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Position</label>
              <Input 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newMember.position}
                onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                placeholder="Position/Title"
              />
            </div>

            {newMember.type === "faculty" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Bio</label>
                <Textarea 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={newMember.bio}
                  onChange={(e) => setNewMember({ ...newMember, bio: e.target.value })}
                  placeholder="Short biography"
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Image URL</label>
              <Input 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newMember.image}
                onChange={(e) => setNewMember({ ...newMember, image: e.target.value })}
                placeholder="Profile Image URL"
              />
            </div>

            <div className="space-y-4 border border-gold/10 p-4 rounded-md">
              <label className="text-sm font-medium text-gold">Contact Links</label>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <i className="fas fa-envelope text-gold mr-2 w-5"></i>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={newMember.links.email || ""}
                    onChange={(e) => setNewMember({ 
                      ...newMember, 
                      links: { 
                        ...newMember.links, 
                        email: e.target.value 
                      } 
                    })}
                    placeholder="Email Address"
                  />
                </div>
                
                <div className="flex items-center">
                  <i className="fab fa-linkedin text-gold mr-2 w-5"></i>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={newMember.links.linkedin || ""}
                    onChange={(e) => setNewMember({ 
                      ...newMember, 
                      links: { 
                        ...newMember.links, 
                        linkedin: e.target.value 
                      } 
                    })}
                    placeholder="LinkedIn URL"
                  />
                </div>
                
                {newMember.type === "student" && (
                  <div className="flex items-center">
                    <i className="fab fa-github text-gold mr-2 w-5"></i>
                    <Input 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={newMember.links.github || ""}
                      onChange={(e) => setNewMember({ 
                        ...newMember, 
                        links: { 
                          ...newMember.links, 
                          github: e.target.value 
                        } 
                      })}
                      placeholder="GitHub URL"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-gold/20 text-lightText hover:bg-darkGray"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetNewMember();
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-gold text-darkBg hover:bg-gold/90"
              onClick={handleCreateMember}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      {selectedMember && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-darkBg border border-gold/20 text-lightText">
            <DialogHeader>
              <DialogTitle className="text-gold">Edit Team Member</DialogTitle>
              <DialogDescription>Update team member details</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Member Type</label>
                <Select 
                  value={selectedMember.type} 
                  onValueChange={(value: "faculty" | "student") => setSelectedMember({ ...selectedMember, type: value })}
                >
                  <SelectTrigger className="bg-darkGray border-gold/20 text-lightText">
                    <SelectValue placeholder="Select member type" />
                  </SelectTrigger>
                  <SelectContent className="bg-darkGray border-gold/20">
                    <SelectItem value="faculty">Faculty Advisor</SelectItem>
                    <SelectItem value="student">Student Leader</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Name</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedMember.name}
                  onChange={(e) => setSelectedMember({ ...selectedMember, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Position</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedMember.position}
                  onChange={(e) => setSelectedMember({ ...selectedMember, position: e.target.value })}
                />
              </div>

              {selectedMember.type === "faculty" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Bio</label>
                  <Textarea 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={selectedMember.bio}
                    onChange={(e) => setSelectedMember({ ...selectedMember, bio: e.target.value })}
                    rows={3}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Image URL</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedMember.image}
                  onChange={(e) => setSelectedMember({ ...selectedMember, image: e.target.value })}
                />
              </div>

              <div className="space-y-4 border border-gold/10 p-4 rounded-md">
                <label className="text-sm font-medium text-gold">Contact Links</label>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <i className="fas fa-envelope text-gold mr-2 w-5"></i>
                    <Input 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={selectedMember.links.email || ""}
                      onChange={(e) => setSelectedMember({ 
                        ...selectedMember, 
                        links: { 
                          ...selectedMember.links, 
                          email: e.target.value 
                        } 
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <i className="fab fa-linkedin text-gold mr-2 w-5"></i>
                    <Input 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={selectedMember.links.linkedin || ""}
                      onChange={(e) => setSelectedMember({ 
                        ...selectedMember, 
                        links: { 
                          ...selectedMember.links, 
                          linkedin: e.target.value 
                        } 
                      })}
                    />
                  </div>
                  
                  {selectedMember.type === "student" && (
                    <div className="flex items-center">
                      <i className="fab fa-github text-gold mr-2 w-5"></i>
                      <Input 
                        className="bg-darkGray border-gold/20 text-lightText"
                        value={selectedMember.links.github || ""}
                        onChange={(e) => setSelectedMember({ 
                          ...selectedMember, 
                          links: { 
                            ...selectedMember.links, 
                            github: e.target.value 
                          } 
                        })}
                      />
                    </div>
                  )}
                </div>
              </div>
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
                onClick={handleUpdateMember}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Member"}
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
              Are you sure you want to delete this team member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold/20 text-lightText hover:bg-darkGray">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDeleteMember}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
