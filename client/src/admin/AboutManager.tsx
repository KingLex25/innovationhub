import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface AboutFeature {
  id: number;
  title: string;
  description: string;
  icon: string;
}

interface AboutData {
  description: string;
  vision: string;
  mission: string;
  features: AboutFeature[];
}

export default function AboutManager() {
  const { toast } = useToast();
  const [isEditAboutDialogOpen, setIsEditAboutDialogOpen] = useState(false);
  const [isAddFeatureDialogOpen, setIsAddFeatureDialogOpen] = useState(false);
  const [isEditFeatureDialogOpen, setIsEditFeatureDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<AboutFeature | null>(null);
  const [isDeleteFeatureDialogOpen, setIsDeleteFeatureDialogOpen] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<number | null>(null);
  
  const [newFeature, setNewFeature] = useState<Omit<AboutFeature, "id">>({
    title: "",
    description: "",
    icon: "lightbulb"
  });

  // Fetch about data
  const { data: aboutData, isLoading } = useQuery({
    queryKey: ["/api/about"],
  });

  // Update about mutation
  const updateAboutMutation = useMutation({
    mutationFn: (data: Partial<AboutData>) => apiRequest("PATCH", "/api/about", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about"] });
      toast({
        title: "About section updated",
        description: "The about section has been updated successfully.",
      });
      setIsEditAboutDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update about section. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add feature mutation
  const addFeatureMutation = useMutation({
    mutationFn: (feature: Omit<AboutFeature, "id">) => apiRequest("POST", "/api/about/features", feature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about"] });
      toast({
        title: "Feature added",
        description: "The feature has been added successfully.",
      });
      setIsAddFeatureDialogOpen(false);
      resetNewFeature();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add feature. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update feature mutation
  const updateFeatureMutation = useMutation({
    mutationFn: (feature: AboutFeature) => apiRequest("PATCH", `/api/about/features/${feature.id}`, feature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about"] });
      toast({
        title: "Feature updated",
        description: "The feature has been updated successfully.",
      });
      setIsEditFeatureDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update feature. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete feature mutation
  const deleteFeatureMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/about/features/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/about"] });
      toast({
        title: "Feature deleted",
        description: "The feature has been deleted successfully.",
      });
      setIsDeleteFeatureDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete feature. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetNewFeature = () => {
    setNewFeature({
      title: "",
      description: "",
      icon: "lightbulb"
    });
  };

  const handleEditAbout = () => {
    if (aboutData) {
      updateAboutMutation.mutate({
        description: aboutData.description,
        vision: aboutData.vision,
        mission: aboutData.mission
      });
    }
  };

  const handleAddFeature = () => {
    addFeatureMutation.mutate(newFeature);
  };

  const handleEditFeature = (feature: AboutFeature) => {
    setSelectedFeature(feature);
    setIsEditFeatureDialogOpen(true);
  };

  const handleUpdateFeature = () => {
    if (selectedFeature) {
      updateFeatureMutation.mutate(selectedFeature);
    }
  };

  const handleDeleteFeature = (id: number) => {
    setFeatureToDelete(id);
    setIsDeleteFeatureDialogOpen(true);
  };

  const confirmDeleteFeature = () => {
    if (featureToDelete) {
      deleteFeatureMutation.mutate(featureToDelete);
    }
  };

  const iconOptions = [
    "lightbulb", "code", "rocket", "cog", "brain", "pencil-alt", 
    "desktop", "mobile", "tablet", "globe", "server", "shield-alt",
    "chart-line", "tools", "hammer", "wrench", "magic", "microscope"
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gold">About Club Management</h1>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-lightText">Loading about data...</p>
        </div>
      ) : aboutData ? (
        <div className="space-y-8">
          {/* Main About Section */}
          <Card className="bg-darkBg border-gold/20">
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle className="text-gold">Club Information</CardTitle>
                  <CardDescription className="text-lightText/70">Main information about the Innovation Club</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  className="border-gold/20 text-gold hover:bg-gold/10"
                  onClick={() => setIsEditAboutDialogOpen(true)}
                >
                  <i className="fas fa-edit mr-2"></i>Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-gold font-semibold mb-2">Description</h3>
                <p className="text-lightText text-sm">{aboutData.description}</p>
              </div>
              
              <div>
                <h3 className="text-gold font-semibold mb-2">Vision</h3>
                <p className="text-lightText text-sm">{aboutData.vision}</p>
              </div>
              
              <div>
                <h3 className="text-gold font-semibold mb-2">Mission</h3>
                <p className="text-lightText text-sm">{aboutData.mission}</p>
              </div>
            </CardContent>
          </Card>

          {/* Features Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gold">Club Features</h2>
              <Button 
                className="bg-gold text-darkBg hover:bg-gold/90"
                onClick={() => setIsAddFeatureDialogOpen(true)}
              >
                <i className="fas fa-plus mr-2"></i>Add Feature
              </Button>
            </div>

            {aboutData.features && aboutData.features.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aboutData.features.map((feature) => (
                  <Card key={feature.id} className="bg-darkGray/80 border-gold/10">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-gold text-3xl mb-4">
                          <i className={`fas fa-${feature.icon}`}></i>
                        </div>
                        <h3 className="text-gold font-montserrat font-semibold text-lg mb-3">{feature.title}</h3>
                        <p className="text-lightText text-sm">{feature.description}</p>
                        
                        <div className="mt-4 flex justify-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-gold border-gold/20 hover:bg-gold/10"
                            onClick={() => handleEditFeature(feature)}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                            onClick={() => handleDeleteFeature(feature.id)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-darkBg border-gold/20 p-6 text-center">
                <p className="text-lightText mb-4">No features found</p>
                <Button 
                  variant="outline" 
                  className="border-gold text-gold hover:bg-gold/10"
                  onClick={() => setIsAddFeatureDialogOpen(true)}
                >
                  Add your first feature
                </Button>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-darkBg rounded-lg border border-gold/20 p-8 text-center">
          <p className="text-lightText mb-4">No about data found</p>
          <Button 
            variant="outline" 
            className="border-gold text-gold hover:bg-gold/10"
            onClick={() => {
              // Initialize with empty data
              updateAboutMutation.mutate({
                description: "The Innovation Club at La Martiniere College was established with a vision to nurture creative thinking and innovative problem-solving skills among students.",
                vision: "We believe that innovation is the key to addressing the challenges of tomorrow.",
                mission: "Our club provides a platform for students to explore cutting-edge technologies, develop prototypes, and collaborate on projects that have real-world applications."
              });
            }}
          >
            Initialize About Section
          </Button>
        </div>
      )}

      {/* Edit About Dialog */}
      {aboutData && (
        <Dialog open={isEditAboutDialogOpen} onOpenChange={setIsEditAboutDialogOpen}>
          <DialogContent className="bg-darkBg border border-gold/20 text-lightText">
            <DialogHeader>
              <DialogTitle className="text-gold">Edit About Section</DialogTitle>
              <DialogDescription>Update the main information about the Innovation Club</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Description</label>
                <Textarea 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={aboutData.description}
                  onChange={(e) => {
                    aboutData.description = e.target.value;
                    queryClient.setQueryData(["/api/about"], aboutData);
                  }}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Vision</label>
                <Textarea 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={aboutData.vision}
                  onChange={(e) => {
                    aboutData.vision = e.target.value;
                    queryClient.setQueryData(["/api/about"], aboutData);
                  }}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Mission</label>
                <Textarea 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={aboutData.mission}
                  onChange={(e) => {
                    aboutData.mission = e.target.value;
                    queryClient.setQueryData(["/api/about"], aboutData);
                  }}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                className="border-gold/20 text-lightText hover:bg-darkGray"
                onClick={() => setIsEditAboutDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gold text-darkBg hover:bg-gold/90"
                onClick={handleEditAbout}
                disabled={updateAboutMutation.isPending}
              >
                {updateAboutMutation.isPending ? "Updating..." : "Update About"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Feature Dialog */}
      <Dialog open={isAddFeatureDialogOpen} onOpenChange={setIsAddFeatureDialogOpen}>
        <DialogContent className="bg-darkBg border border-gold/20 text-lightText">
          <DialogHeader>
            <DialogTitle className="text-gold">Add Feature</DialogTitle>
            <DialogDescription>Add a new feature to the club information</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Title</label>
              <Input 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newFeature.title}
                onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                placeholder="Feature Title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Description</label>
              <Textarea 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newFeature.description}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                placeholder="Feature Description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Icon</label>
              <div className="grid grid-cols-6 gap-2">
                {iconOptions.map((icon) => (
                  <Button
                    key={icon}
                    type="button"
                    variant={newFeature.icon === icon ? "default" : "outline"}
                    className={`p-2 h-auto ${
                      newFeature.icon === icon 
                        ? "bg-gold text-darkBg" 
                        : "border-gold/20 text-lightText hover:bg-gold/10"
                    }`}
                    onClick={() => setNewFeature({ ...newFeature, icon })}
                  >
                    <i className={`fas fa-${icon} text-lg`}></i>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-gold/20 text-lightText hover:bg-darkGray"
              onClick={() => {
                setIsAddFeatureDialogOpen(false);
                resetNewFeature();
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-gold text-darkBg hover:bg-gold/90"
              onClick={handleAddFeature}
              disabled={addFeatureMutation.isPending}
            >
              {addFeatureMutation.isPending ? "Adding..." : "Add Feature"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Feature Dialog */}
      {selectedFeature && (
        <Dialog open={isEditFeatureDialogOpen} onOpenChange={setIsEditFeatureDialogOpen}>
          <DialogContent className="bg-darkBg border border-gold/20 text-lightText">
            <DialogHeader>
              <DialogTitle className="text-gold">Edit Feature</DialogTitle>
              <DialogDescription>Update feature details</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Title</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedFeature.title}
                  onChange={(e) => setSelectedFeature({ ...selectedFeature, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Description</label>
                <Textarea 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedFeature.description}
                  onChange={(e) => setSelectedFeature({ ...selectedFeature, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((icon) => (
                    <Button
                      key={icon}
                      type="button"
                      variant={selectedFeature.icon === icon ? "default" : "outline"}
                      className={`p-2 h-auto ${
                        selectedFeature.icon === icon 
                          ? "bg-gold text-darkBg" 
                          : "border-gold/20 text-lightText hover:bg-gold/10"
                      }`}
                      onClick={() => setSelectedFeature({ ...selectedFeature, icon })}
                    >
                      <i className={`fas fa-${icon} text-lg`}></i>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                className="border-gold/20 text-lightText hover:bg-darkGray"
                onClick={() => setIsEditFeatureDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-gold text-darkBg hover:bg-gold/90"
                onClick={handleUpdateFeature}
                disabled={updateFeatureMutation.isPending}
              >
                {updateFeatureMutation.isPending ? "Updating..." : "Update Feature"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Feature Confirmation Dialog */}
      <AlertDialog open={isDeleteFeatureDialogOpen} onOpenChange={setIsDeleteFeatureDialogOpen}>
        <AlertDialogContent className="bg-darkBg border border-gold/20 text-lightText">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gold">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feature? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold/20 text-lightText hover:bg-darkGray">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDeleteFeature}
            >
              {deleteFeatureMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
