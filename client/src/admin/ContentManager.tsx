import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface ContentArticle {
  id: number;
  title: string;
  content: string;
  image: string;
  category: string;
  featured: boolean;
  publishDate: string;
  createdAt: string;
}

export default function ContentManager() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ContentArticle | null>(null);
  const [newArticle, setNewArticle] = useState<Omit<ContentArticle, "id" | "createdAt">>({
    title: "",
    content: "",
    image: "",
    category: "blog",
    featured: false,
    publishDate: new Date().toISOString().split('T')[0]
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);

  // Fetch content articles
  const { data: articles, isLoading } = useQuery({
    queryKey: ["/api/content"],
  });

  // Create article mutation
  const createMutation = useMutation({
    mutationFn: (article: Omit<ContentArticle, "id" | "createdAt">) => apiRequest("POST", "/api/content", article),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({
        title: "Article created",
        description: "The article has been added successfully.",
      });
      setIsAddDialogOpen(false);
      resetNewArticle();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create article. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update article mutation
  const updateMutation = useMutation({
    mutationFn: (article: ContentArticle) => apiRequest("PATCH", `/api/content/${article.id}`, article),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({
        title: "Article updated",
        description: "The article has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update article. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/content/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      toast({
        title: "Article deleted",
        description: "The article has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete article. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetNewArticle = () => {
    setNewArticle({
      title: "",
      content: "",
      image: "",
      category: "blog",
      featured: false,
      publishDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleCreateArticle = () => {
    createMutation.mutate(newArticle);
  };

  const handleEditArticle = (article: ContentArticle) => {
    setSelectedArticle(article);
    setIsEditDialogOpen(true);
  };

  const handlePreviewArticle = (article: ContentArticle) => {
    setSelectedArticle(article);
    setIsPreviewDialogOpen(true);
  };

  const handleUpdateArticle = () => {
    if (selectedArticle) {
      updateMutation.mutate(selectedArticle);
    }
  };

  const handleDeleteArticle = (id: number) => {
    setArticleToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteArticle = () => {
    if (articleToDelete) {
      deleteMutation.mutate(articleToDelete);
    }
  };

  // Format date string
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return dateString;
    }
  };

  // Get category display name
  const getCategoryName = (category: string) => {
    const categories = {
      blog: "Blog Post",
      news: "News",
      event: "Event Article",
      project: "Project Showcase",
      tutorial: "Tutorial",
    };
    
    return categories[category as keyof typeof categories] || category;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gold">Content Management</h1>
        <Button 
          className="bg-gold text-darkBg hover:bg-gold/90"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <i className="fas fa-plus mr-2"></i>
          Add Article
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-lightText">Loading articles...</p>
        </div>
      ) : articles && articles.length > 0 ? (
        <div className="bg-darkBg rounded-lg border border-gold/20 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gold">Title</TableHead>
                <TableHead className="text-gold">Category</TableHead>
                <TableHead className="text-gold">Publish Date</TableHead>
                <TableHead className="text-gold">Status</TableHead>
                <TableHead className="text-gold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article: ContentArticle) => (
                <TableRow key={article.id} className={`border-gold/10 ${article.featured ? 'bg-gold/5' : ''}`}>
                  <TableCell className="font-medium text-lightText">
                    <div className="flex items-center">
                      {article.image && (
                        <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0">
                          <img 
                            src={article.image} 
                            alt={article.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/100?text=No+Image";
                            }}
                          />
                        </div>
                      )}
                      {article.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-lightText">{getCategoryName(article.category)}</TableCell>
                  <TableCell className="text-lightText">{formatDate(article.publishDate)}</TableCell>
                  <TableCell>
                    {article.featured && (
                      <Badge className="bg-gold/10 text-gold border-gold/20">
                        Featured
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-blue-400 border-blue-400/20 hover:bg-blue-400/10"
                        onClick={() => handlePreviewArticle(article)}
                      >
                        <i className="fas fa-eye"></i>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-gold border-gold/20 hover:bg-gold/10"
                        onClick={() => handleEditArticle(article)}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                        onClick={() => handleDeleteArticle(article.id)}
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
          <p className="text-lightText mb-4">No articles found</p>
          <Button 
            variant="outline" 
            className="border-gold text-gold hover:bg-gold/10"
            onClick={() => setIsAddDialogOpen(true)}
          >
            Add your first article
          </Button>
        </div>
      )}

      {/* Add Article Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-darkBg border border-gold/20 text-lightText max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gold">Add New Article</DialogTitle>
            <DialogDescription>Create a new content article for the Innovation Club</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Title</label>
              <Input 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newArticle.title}
                onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                placeholder="Article Title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Category</label>
                <Select 
                  value={newArticle.category} 
                  onValueChange={(value) => setNewArticle({ ...newArticle, category: value })}
                >
                  <SelectTrigger className="bg-darkGray border-gold/20 text-lightText">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-darkGray border-gold/20">
                    <SelectItem value="blog">Blog Post</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="event">Event Article</SelectItem>
                    <SelectItem value="project">Project Showcase</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Publish Date</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  type="date"
                  value={newArticle.publishDate}
                  onChange={(e) => setNewArticle({ ...newArticle, publishDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Image URL</label>
              <Input 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newArticle.image}
                onChange={(e) => setNewArticle({ ...newArticle, image: e.target.value })}
                placeholder="Enter image URL"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Content</label>
              <Textarea 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newArticle.content}
                onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                placeholder="Article content"
                rows={10}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="featured" 
                checked={newArticle.featured}
                onCheckedChange={(checked) => {
                  setNewArticle({ ...newArticle, featured: checked as boolean });
                }}
              />
              <label
                htmlFor="featured"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-lightText"
              >
                Feature this article
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-gold/20 text-lightText hover:bg-darkGray"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetNewArticle();
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-gold text-darkBg hover:bg-gold/90"
              onClick={handleCreateArticle}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      {selectedArticle && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-darkBg border border-gold/20 text-lightText max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gold">Edit Article</DialogTitle>
              <DialogDescription>Update article details</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Title</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedArticle.title}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Category</label>
                  <Select 
                    value={selectedArticle.category} 
                    onValueChange={(value) => setSelectedArticle({ ...selectedArticle, category: value })}
                  >
                    <SelectTrigger className="bg-darkGray border-gold/20 text-lightText">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-darkGray border-gold/20">
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="event">Event Article</SelectItem>
                      <SelectItem value="project">Project Showcase</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Publish Date</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    type="date"
                    value={selectedArticle.publishDate.split('T')[0]}
                    onChange={(e) => setSelectedArticle({ ...selectedArticle, publishDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Image URL</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedArticle.image}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, image: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Content</label>
                <Textarea 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedArticle.content}
                  onChange={(e) => setSelectedArticle({ ...selectedArticle, content: e.target.value })}
                  rows={10}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="featured-edit" 
                  checked={selectedArticle.featured}
                  onCheckedChange={(checked) => {
                    setSelectedArticle({ ...selectedArticle, featured: checked as boolean });
                  }}
                />
                <label
                  htmlFor="featured-edit"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-lightText"
                >
                  Feature this article
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
                onClick={handleUpdateArticle}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Article"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Preview Article Dialog */}
      {selectedArticle && (
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="bg-darkBg border border-gold/20 text-lightText max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gold">Article Preview</DialogTitle>
              <DialogDescription>
                {getCategoryName(selectedArticle.category)} • {formatDate(selectedArticle.publishDate)}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {selectedArticle.image && (
                <div className="mb-6 rounded-lg overflow-hidden h-64 relative">
                  <img 
                    src={selectedArticle.image} 
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/800x400?text=No+Image";
                    }}
                  />
                  {selectedArticle.featured && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gold text-darkBg">
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-gold mb-4">{selectedArticle.title}</h2>
              
              <div className="text-lightText whitespace-pre-wrap">
                {selectedArticle.content.split('\n').map((paragraph, index) => (
                  paragraph ? <p key={index} className="mb-4">{paragraph}</p> : <br key={index} />
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                className="border-gold/20 text-lightText hover:bg-darkGray"
                onClick={() => setIsPreviewDialogOpen(false)}
              >
                Close
              </Button>
              <Button 
                className="bg-gold text-darkBg hover:bg-gold/90"
                onClick={() => {
                  setIsPreviewDialogOpen(false);
                  handleEditArticle(selectedArticle);
                }}
              >
                Edit Article
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
              Are you sure you want to delete this article? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold/20 text-lightText hover:bg-darkGray">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDeleteArticle}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
