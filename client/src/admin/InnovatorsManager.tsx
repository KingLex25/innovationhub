import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

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

export default function InnovatorsManager() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInnovator, setSelectedInnovator] = useState<Innovator | null>(null);
  const [newInnovator, setNewInnovator] = useState<Omit<Innovator, "id">>({
    name: "",
    class: "",
    profileImage: "",
    projectTitle: "",
    projectDescription: "",
    projectTags: [],
    links: {},
    featured: false,
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear()
  });
  const [newTag, setNewTag] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [innovatorToDelete, setInnovatorToDelete] = useState<number | null>(null);

  // Fetch innovators
  const { data: innovators, isLoading } = useQuery({
    queryKey: ["/api/innovators"],
  });

  // Create innovator mutation
  const createMutation = useMutation({
    mutationFn: (newInnovator: Omit<Innovator, "id">) => apiRequest("POST", "/api/innovators", newInnovator),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/innovators"] });
      toast({
        title: "Innovator added",
        description: "The innovator has been added successfully.",
      });
      setIsAddDialogOpen(false);
      resetNewInnovator();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add innovator. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update innovator mutation
  const updateMutation = useMutation({
    mutationFn: (innovator: Innovator) => apiRequest("PATCH", `/api/innovators/${innovator.id}`, innovator),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/innovators"] });
      toast({
        title: "Innovator updated",
        description: "The innovator has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update innovator. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete innovator mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/innovators/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/innovators"] });
      toast({
        title: "Innovator deleted",
        description: "The innovator has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete innovator. Please try again.",
        variant: "destructive",
      });
    },
  });

  // When setting an innovator as featured, unfeature all others
  const setFeaturedMutation = useMutation({
    mutationFn: (id: number) => apiRequest("POST", `/api/innovators/feature/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/innovators"] });
      toast({
        title: "Innovator featured",
        description: "The innovator of the month has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to set featured innovator. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetNewInnovator = () => {
    setNewInnovator({
      name: "",
      class: "",
      profileImage: "",
      projectTitle: "",
      projectDescription: "",
      projectTags: [],
      links: {},
      featured: false,
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear()
    });
    setNewTag("");
  };

  const handleCreateInnovator = () => {
    createMutation.mutate(newInnovator);
  };

  const handleEditInnovator = (innovator: Innovator) => {
    setSelectedInnovator(innovator);
    setIsEditDialogOpen(true);
  };

  const handleUpdateInnovator = () => {
    if (selectedInnovator) {
      updateMutation.mutate(selectedInnovator);
    }
  };

  const handleDeleteInnovator = (id: number) => {
    setInnovatorToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteInnovator = () => {
    if (innovatorToDelete) {
      deleteMutation.mutate(innovatorToDelete);
    }
  };

  const handleSetFeatured = (id: number) => {
    setFeaturedMutation.mutate(id);
  };

  const addTag = (state: Omit<Innovator, "id"> | Innovator, setter: React.Dispatch<React.SetStateAction<any>>, tag: string) => {
    if (tag.trim() && !state.projectTags.includes(tag.trim())) {
      setter({
        ...state,
        projectTags: [...state.projectTags, tag.trim()]
      });
      setNewTag("");
    }
  };

  const removeTag = (state: Omit<Innovator, "id"> | Innovator, setter: React.Dispatch<React.SetStateAction<any>>, tag: string) => {
    setter({
      ...state,
      projectTags: state.projectTags.filter(t => t !== tag)
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gold">Innovators Management</h1>
        <Button 
          className="bg-gold text-darkBg hover:bg-gold/90"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <i className="fas fa-plus mr-2"></i>
          Add Innovator
        </Button>
      </div>

      {/* Featured Innovator */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gold mb-4">Innovator of the Month</h2>
        
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-lightText">Loading featured innovator...</p>
          </div>
        ) : innovators && innovators.find((i: Innovator) => i.featured) ? (
          <div className="bg-darkBg rounded-lg border border-gold/20 p-6">
            {(() => {
              const featuredInnovator = innovators.find((i: Innovator) => i.featured);
              return (
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gold/20 mx-auto md:mx-0">
                      <img 
                        src={featuredInnovator.profileImage || "https://source.unsplash.com/random/200x200/?portrait"} 
                        alt={featuredInnovator.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex flex-wrap justify-between items-start">
                      <div>
                        <h3 className="text-gold font-bold text-xl">{featuredInnovator.name}</h3>
                        <p className="text-lightText text-sm">{featuredInnovator.class}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-gold border-gold/20 hover:bg-gold/10"
                          onClick={() => handleEditInnovator(featuredInnovator)}
                        >
                          <i className="fas fa-edit mr-1"></i> Edit
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-gold font-semibold">Project: {featuredInnovator.projectTitle}</h4>
                      <p className="text-lightText text-sm mt-1">{featuredInnovator.projectDescription.substring(0, 200)}...</p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {featuredInnovator.projectTags.map((tag, index) => (
                          <span key={index} className="bg-gold/10 text-gold text-xs px-3 py-1 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="bg-darkBg rounded-lg border border-gold/20 p-6 text-center">
            <p className="text-lightText mb-4">No featured innovator selected</p>
            <p className="text-lightText/70 text-sm mb-4">Set an innovator as featured from the list below</p>
          </div>
        )}
      </div>

      {/* All Innovators */}
      <div>
        <h2 className="text-xl font-semibold text-gold mb-4">All Innovators</h2>
        
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-lightText">Loading innovators...</p>
          </div>
        ) : innovators && innovators.length > 0 ? (
          <div className="bg-darkBg rounded-lg border border-gold/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gold">Name</TableHead>
                  <TableHead className="text-gold">Project</TableHead>
                  <TableHead className="text-gold">Class</TableHead>
                  <TableHead className="text-gold">Month/Year</TableHead>
                  <TableHead className="text-gold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {innovators.map((innovator: Innovator) => (
                  <TableRow key={innovator.id} className={`border-gold/10 ${innovator.featured ? 'bg-gold/5' : ''}`}>
                    <TableCell className="font-medium text-lightText">
                      <div className="flex items-center">
                        {innovator.profileImage && (
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                            <img src={innovator.profileImage} alt={innovator.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          {innovator.name}
                          {innovator.featured && (
                            <span className="ml-2 bg-gold/20 text-gold text-xs px-2 py-0.5 rounded-sm">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-lightText">{innovator.projectTitle}</TableCell>
                    <TableCell className="text-lightText">{innovator.class}</TableCell>
                    <TableCell className="text-lightText">{innovator.month} {innovator.year}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {!innovator.featured && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/10"
                            onClick={() => handleSetFeatured(innovator.id)}
                            title="Set as Innovator of the Month"
                          >
                            <i className="fas fa-star"></i>
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-gold border-gold/20 hover:bg-gold/10"
                          onClick={() => handleEditInnovator(innovator)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                          onClick={() => handleDeleteInnovator(innovator.id)}
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
            <p className="text-lightText mb-4">No innovators found</p>
            <Button 
              variant="outline" 
              className="border-gold text-gold hover:bg-gold/10"
              onClick={() => setIsAddDialogOpen(true)}
            >
              Add your first innovator
            </Button>
          </div>
        )}
      </div>

      {/* Add Innovator Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-darkBg border border-gold/20 text-lightText max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-gold">Add Innovator</DialogTitle>
            <DialogDescription>Add a new innovator to the club</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Name</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={newInnovator.name}
                  onChange={(e) => setNewInnovator({ ...newInnovator, name: e.target.value })}
                  placeholder="Full Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Class</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={newInnovator.class}
                  onChange={(e) => setNewInnovator({ ...newInnovator, class: e.target.value })}
                  placeholder="e.g. Class XII Science"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Profile Image URL</label>
              <Input 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newInnovator.profileImage}
                onChange={(e) => setNewInnovator({ ...newInnovator, profileImage: e.target.value })}
                placeholder="Profile Image URL"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Project Title</label>
              <Input 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newInnovator.projectTitle}
                onChange={(e) => setNewInnovator({ ...newInnovator, projectTitle: e.target.value })}
                placeholder="Project Title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Project Description</label>
              <Textarea 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newInnovator.projectDescription}
                onChange={(e) => setNewInnovator({ ...newInnovator, projectDescription: e.target.value })}
                placeholder="Project Description"
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-lightText">Project Tags</label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {newInnovator.projectTags.map((tag, index) => (
                  <div key={index} className="bg-gold/10 text-gold text-xs px-3 py-1 rounded-full flex items-center">
                    {tag}
                    <button 
                      className="ml-2 text-gold/70 hover:text-gold"
                      onClick={() => removeTag(newInnovator, setNewInnovator, tag)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex">
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText rounded-r-none"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(newInnovator, setNewInnovator, newTag);
                    }
                  }}
                />
                <Button 
                  className="bg-gold text-darkBg hover:bg-gold/90 rounded-l-none"
                  onClick={() => addTag(newInnovator, setNewInnovator, newTag)}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Month</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={newInnovator.month}
                  onChange={(e) => setNewInnovator({ ...newInnovator, month: e.target.value })}
                  placeholder="Month (e.g. January)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Year</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  type="number"
                  value={newInnovator.year?.toString() || new Date().getFullYear().toString()}
                  onChange={(e) => setNewInnovator({ ...newInnovator, year: parseInt(e.target.value) })}
                  placeholder="Year (e.g. 2025)"
                />
              </div>
            </div>

            <div className="space-y-4 border border-gold/10 p-4 rounded-md">
              <label className="text-sm font-medium text-gold">Social Links</label>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <i className="fab fa-linkedin text-gold mr-2 w-5"></i>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={newInnovator.links.linkedin || ""}
                    onChange={(e) => setNewInnovator({ 
                      ...newInnovator, 
                      links: { 
                        ...newInnovator.links, 
                        linkedin: e.target.value 
                      } 
                    })}
                    placeholder="LinkedIn URL"
                  />
                </div>
                
                <div className="flex items-center">
                  <i className="fab fa-github text-gold mr-2 w-5"></i>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={newInnovator.links.github || ""}
                    onChange={(e) => setNewInnovator({ 
                      ...newInnovator, 
                      links: { 
                        ...newInnovator.links, 
                        github: e.target.value 
                      } 
                    })}
                    placeholder="GitHub URL"
                  />
                </div>
                
                <div className="flex items-center">
                  <i className="fas fa-globe text-gold mr-2 w-5"></i>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={newInnovator.links.website || ""}
                    onChange={(e) => setNewInnovator({ 
                      ...newInnovator, 
                      links: { 
                        ...newInnovator.links, 
                        website: e.target.value 
                      } 
                    })}
                    placeholder="Personal Website URL"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="featured" 
                checked={newInnovator.featured}
                onCheckedChange={(checked) => {
                  setNewInnovator({ ...newInnovator, featured: checked as boolean });
                }}
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-lightText"
              >
                Set as Innovator of the Month
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-gold/20 text-lightText hover:bg-darkGray"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetNewInnovator();
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-gold text-darkBg hover:bg-gold/90"
              onClick={handleCreateInnovator}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Adding..." : "Add Innovator"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Innovator Dialog */}
      {selectedInnovator && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-darkBg border border-gold/20 text-lightText max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-gold">Edit Innovator</DialogTitle>
              <DialogDescription>Update innovator details</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Name</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={selectedInnovator.name}
                    onChange={(e) => setSelectedInnovator({ ...selectedInnovator, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Class</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={selectedInnovator.class}
                    onChange={(e) => setSelectedInnovator({ ...selectedInnovator, class: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Profile Image URL</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedInnovator.profileImage}
                  onChange={(e) => setSelectedInnovator({ ...selectedInnovator, profileImage: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Project Title</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedInnovator.projectTitle}
                  onChange={(e) => setSelectedInnovator({ ...selectedInnovator, projectTitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Project Description</label>
                <Textarea 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedInnovator.projectDescription}
                  onChange={(e) => setSelectedInnovator({ ...selectedInnovator, projectDescription: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-lightText">Project Tags</label>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedInnovator.projectTags.map((tag, index) => (
                    <div key={index} className="bg-gold/10 text-gold text-xs px-3 py-1 rounded-full flex items-center">
                      {tag}
                      <button 
                        className="ml-2 text-gold/70 hover:text-gold"
                        onClick={() => removeTag(selectedInnovator, setSelectedInnovator, tag)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex">
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText rounded-r-none"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(selectedInnovator, setSelectedInnovator, newTag);
                      }
                    }}
                  />
                  <Button 
                    className="bg-gold text-darkBg hover:bg-gold/90 rounded-l-none"
                    onClick={() => addTag(selectedInnovator, setSelectedInnovator, newTag)}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Month</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={selectedInnovator.month || ""}
                    onChange={(e) => setSelectedInnovator({ ...selectedInnovator, month: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Year</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    type="number"
                    value={selectedInnovator.year?.toString() || ""}
                    onChange={(e) => setSelectedInnovator({ ...selectedInnovator, year: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-4 border border-gold/10 p-4 rounded-md">
                <label className="text-sm font-medium text-gold">Social Links</label>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <i className="fab fa-linkedin text-gold mr-2 w-5"></i>
                    <Input 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={selectedInnovator.links.linkedin || ""}
                      onChange={(e) => setSelectedInnovator({ 
                        ...selectedInnovator, 
                        links: { 
                          ...selectedInnovator.links, 
                          linkedin: e.target.value 
                        } 
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <i className="fab fa-github text-gold mr-2 w-5"></i>
                    <Input 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={selectedInnovator.links.github || ""}
                      onChange={(e) => setSelectedInnovator({ 
                        ...selectedInnovator, 
                        links: { 
                          ...selectedInnovator.links, 
                          github: e.target.value 
                        } 
                      })}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <i className="fas fa-globe text-gold mr-2 w-5"></i>
                    <Input 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={selectedInnovator.links.website || ""}
                      onChange={(e) => setSelectedInnovator({ 
                        ...selectedInnovator, 
                        links: { 
                          ...selectedInnovator.links, 
                          website: e.target.value 
                        } 
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="featured-edit" 
                  checked={selectedInnovator.featured}
                  onCheckedChange={(checked) => {
                    setSelectedInnovator({ ...selectedInnovator, featured: checked as boolean });
                  }}
                />
                <label
                  htmlFor="featured-edit"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-lightText"
                >
                  Set as Innovator of the Month
                </label>
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
                onClick={handleUpdateInnovator}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Innovator"}
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
              Are you sure you want to delete this innovator? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold/20 text-lightText hover:bg-darkGray">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDeleteInnovator}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
