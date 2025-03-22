import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  link?: {
    url: string;
    text: string;
  };
}

export default function NoticesManager() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [newNotice, setNewNotice] = useState<Omit<Notice, "id">>({
    title: "",
    content: "",
    date: new Date().toISOString(),
    link: {
      url: "",
      text: ""
    }
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<number | null>(null);

  // Fetch notices
  const { data: notices, isLoading } = useQuery({
    queryKey: ["/api/notices"],
  });

  // Create notice mutation
  const createMutation = useMutation({
    mutationFn: (newNotice: Omit<Notice, "id">) => apiRequest("POST", "/api/notices", newNotice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      toast({
        title: "Notice created",
        description: "The notice has been added successfully.",
      });
      setIsAddDialogOpen(false);
      resetNewNotice();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create notice. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update notice mutation
  const updateMutation = useMutation({
    mutationFn: (notice: Notice) => apiRequest("PATCH", `/api/notices/${notice.id}`, notice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      toast({
        title: "Notice updated",
        description: "The notice has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update notice. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete notice mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/notices/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      toast({
        title: "Notice deleted",
        description: "The notice has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete notice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetNewNotice = () => {
    setNewNotice({
      title: "",
      content: "",
      date: new Date().toISOString(),
      link: {
        url: "",
        text: ""
      }
    });
  };

  const handleCreateNotice = () => {
    // If the link is empty, remove it from the object
    const noticeToCreate = { ...newNotice };
    if (!noticeToCreate.link?.url || !noticeToCreate.link?.text) {
      delete noticeToCreate.link;
    }
    createMutation.mutate(noticeToCreate);
  };

  const handleEditNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsEditDialogOpen(true);
  };

  const handleUpdateNotice = () => {
    if (selectedNotice) {
      // If the link is empty, remove it from the object
      const noticeToUpdate = { ...selectedNotice };
      if (!noticeToUpdate.link?.url || !noticeToUpdate.link?.text) {
        delete noticeToUpdate.link;
      }
      updateMutation.mutate(noticeToUpdate);
    }
  };

  const handleDeleteNotice = (id: number) => {
    setNoticeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteNotice = () => {
    if (noticeToDelete) {
      deleteMutation.mutate(noticeToDelete);
    }
  };

  const formatNoticeDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gold">Notice Board Management</h1>
        <Button 
          className="bg-gold text-darkBg hover:bg-gold/90"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <i className="fas fa-plus mr-2"></i>
          Add Notice
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-lightText">Loading notices...</p>
        </div>
      ) : notices && notices.length > 0 ? (
        <div className="bg-darkBg rounded-lg border border-gold/20 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gold">Title</TableHead>
                <TableHead className="text-gold">Content</TableHead>
                <TableHead className="text-gold">Date</TableHead>
                <TableHead className="text-gold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices.map((notice: Notice) => (
                <TableRow key={notice.id} className="border-gold/10">
                  <TableCell className="font-medium text-lightText">{notice.title}</TableCell>
                  <TableCell className="text-lightText">
                    {notice.content.length > 100 
                      ? `${notice.content.substring(0, 100)}...` 
                      : notice.content}
                  </TableCell>
                  <TableCell className="text-lightText">{formatNoticeDate(notice.date)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-gold border-gold/20 hover:bg-gold/10"
                        onClick={() => handleEditNotice(notice)}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                        onClick={() => handleDeleteNotice(notice.id)}
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
          <p className="text-lightText mb-4">No notices found</p>
          <Button 
            variant="outline" 
            className="border-gold text-gold hover:bg-gold/10"
            onClick={() => setIsAddDialogOpen(true)}
          >
            Add your first notice
          </Button>
        </div>
      )}

      {/* Add Notice Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-darkBg border border-gold/20 text-lightText">
          <DialogHeader>
            <DialogTitle className="text-gold">Add Notice</DialogTitle>
            <DialogDescription>Create a new notice for the notice board</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Title</label>
              <Input 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newNotice.title}
                onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                placeholder="Notice Title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Content</label>
              <Textarea 
                className="bg-darkGray border-gold/20 text-lightText"
                value={newNotice.content}
                onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                placeholder="Notice Content"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-lightText">Date</label>
              <Input 
                className="bg-darkGray border-gold/20 text-lightText"
                type="date"
                value={new Date(newNotice.date).toISOString().split('T')[0]}
                onChange={(e) => setNewNotice({ 
                  ...newNotice, 
                  date: new Date(e.target.value).toISOString() 
                })}
              />
            </div>

            <div className="space-y-4 border border-gold/10 p-4 rounded-md">
              <label className="text-sm font-medium text-gold">Optional Link</label>
              
              <div className="space-y-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Link Text</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={newNotice.link?.text || ""}
                    onChange={(e) => setNewNotice({ 
                      ...newNotice, 
                      link: { 
                        ...newNotice.link || {}, 
                        text: e.target.value 
                      } 
                    })}
                    placeholder="e.g. View Details"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Link URL</label>
                  <Input 
                    className="bg-darkGray border-gold/20 text-lightText"
                    value={newNotice.link?.url || ""}
                    onChange={(e) => setNewNotice({ 
                      ...newNotice, 
                      link: { 
                        ...newNotice.link || {}, 
                        url: e.target.value 
                      } 
                    })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              className="border-gold/20 text-lightText hover:bg-darkGray"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetNewNotice();
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-gold text-darkBg hover:bg-gold/90"
              onClick={handleCreateNotice}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Notice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Notice Dialog */}
      {selectedNotice && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-darkBg border border-gold/20 text-lightText">
            <DialogHeader>
              <DialogTitle className="text-gold">Edit Notice</DialogTitle>
              <DialogDescription>Update notice details</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Title</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedNotice.title}
                  onChange={(e) => setSelectedNotice({ ...selectedNotice, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Content</label>
                <Textarea 
                  className="bg-darkGray border-gold/20 text-lightText"
                  value={selectedNotice.content}
                  onChange={(e) => setSelectedNotice({ ...selectedNotice, content: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-lightText">Date</label>
                <Input 
                  className="bg-darkGray border-gold/20 text-lightText"
                  type="date"
                  value={new Date(selectedNotice.date).toISOString().split('T')[0]}
                  onChange={(e) => setSelectedNotice({ 
                    ...selectedNotice, 
                    date: new Date(e.target.value).toISOString() 
                  })}
                />
              </div>

              <div className="space-y-4 border border-gold/10 p-4 rounded-md">
                <label className="text-sm font-medium text-gold">Optional Link</label>
                
                <div className="space-y-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-lightText">Link Text</label>
                    <Input 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={selectedNotice.link?.text || ""}
                      onChange={(e) => setSelectedNotice({ 
                        ...selectedNotice, 
                        link: { 
                          ...selectedNotice.link || {}, 
                          text: e.target.value 
                        } 
                      })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-lightText">Link URL</label>
                    <Input 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={selectedNotice.link?.url || ""}
                      onChange={(e) => setSelectedNotice({ 
                        ...selectedNotice, 
                        link: { 
                          ...selectedNotice.link || {}, 
                          url: e.target.value 
                        } 
                      })}
                    />
                  </div>
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
                onClick={handleUpdateNotice}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Notice"}
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
              Are you sure you want to delete this notice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold/20 text-lightText hover:bg-darkGray">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDeleteNotice}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
