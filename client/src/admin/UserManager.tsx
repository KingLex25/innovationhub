import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
  createdAt: string;
}

const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isAdmin: z.boolean().default(false),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function UserManager() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (newUser: UserFormValues) => apiRequest("POST", "/api/users", newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User created",
        description: "The user has been added successfully.",
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      if (error.message?.includes("409")) {
        toast({
          title: "Error",
          description: "Username already exists. Please choose a different username.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create user. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/users/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      isAdmin: false,
    },
  });

  const onSubmit = (values: UserFormValues) => {
    createUserMutation.mutate(values);
  };

  const handleDeleteUser = (id: number) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete);
    }
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gold">User Management</h1>
        <Button 
          className="bg-gold text-darkBg hover:bg-gold/90"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <i className="fas fa-user-plus mr-2"></i>
          Add User
        </Button>
      </div>

      <Card className="bg-darkBg border-gold/20 mb-6">
        <CardHeader>
          <CardTitle className="text-gold text-lg">Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lightText mb-4">
            This section allows you to manage administrative users who can access the admin dashboard.
            Users with admin privileges can manage all aspects of the Innovation Club website.
          </p>
          <div className="bg-gold/10 p-4 rounded-md border border-gold/20">
            <h4 className="text-gold font-medium mb-2 flex items-center">
              <i className="fas fa-info-circle mr-2"></i>
              Master Admin Account
            </h4>
            <p className="text-lightText text-sm">
              The master admin account (username: <span className="text-gold font-medium">admin</span>) has full privileges and cannot be deleted.
              This account should only be used for initial setup and emergency access.
            </p>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-lightText">Loading users...</p>
        </div>
      ) : users && users.length > 0 ? (
        <div className="bg-darkBg rounded-lg border border-gold/20 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gold">Username</TableHead>
                <TableHead className="text-gold">Role</TableHead>
                <TableHead className="text-gold">Created</TableHead>
                <TableHead className="text-gold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user: User) => (
                <TableRow key={user.id} className="border-gold/10">
                  <TableCell className="font-medium text-lightText">{user.username}</TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge className="bg-gold/10 text-gold border-gold/20">
                        Admin
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500/10 text-blue-400 border-blue-400/20">
                        User
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-lightText">{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {user.username !== 'admin' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 border-red-500/20 hover:bg-red-500/10"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-darkBg rounded-lg border border-gold/20 p-8 text-center">
          <p className="text-lightText mb-4">No users found</p>
          <Button 
            variant="outline" 
            className="border-gold text-gold hover:bg-gold/10"
            onClick={() => setIsAddDialogOpen(true)}
          >
            Add your first user
          </Button>
        </div>
      )}

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-darkBg border border-gold/20 text-lightText">
          <DialogHeader>
            <DialogTitle className="text-gold">Add New User</DialogTitle>
            <DialogDescription>Create a new user with admin panel access</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lightText">Username</FormLabel>
                    <FormControl>
                      <Input 
                        className="bg-darkGray border-gold/20 text-lightText"
                        placeholder="Enter username" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-lightText/70">
                      Username must be at least 3 characters long
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lightText">Password</FormLabel>
                    <FormControl>
                      <Input 
                        className="bg-darkGray border-gold/20 text-lightText"
                        type="password" 
                        placeholder="Enter password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription className="text-lightText/70">
                      Password must be at least 6 characters long
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 rounded-md border border-gold/10">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-lightText">
                        Admin Privileges
                      </FormLabel>
                      <FormDescription className="text-lightText/70">
                        Grant full admin access to this user
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button"
                  variant="outline" 
                  className="border-gold/20 text-lightText hover:bg-darkGray"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gold text-darkBg hover:bg-gold/90"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-darkBg border border-gold/20 text-lightText">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gold">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold/20 text-lightText hover:bg-darkGray">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDeleteUser}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
