import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect } from "react";
import { useLocation } from "wouter";
import { AuthContext } from "@/App";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(AuthContext);

  // Redirect if already authenticated - but only once on component mount
  useEffect(() => {
    // Only redirect on initial render if authenticated
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      console.log("Attempting login with:", values.username);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        credentials: 'include' // Important for cookies
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      console.log("Login successful, received data:", data);
      
      setIsAuthenticated(true);
      setUser({ username: data.username });
      
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      });
      
      console.log("Redirecting to dashboard...");
      
      // Set a small timeout to ensure all state is updated before navigating
      setTimeout(() => {
        window.location.href = '/admin/dashboard/events';
      }, 300);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-darkGray flex flex-col">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto mt-16 bg-darkBg rounded-xl border border-gold/20 shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-gold text-2xl md:text-3xl font-playfair font-bold mb-6 text-center">Admin Login</h2>
            <p className="text-lightText text-sm text-center mb-6">Sign in to access the admin dashboard</p>
            
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
                          placeholder="Enter your username" 
                          className="bg-darkGray border border-gold/20 text-lightText focus:border-gold"
                          {...field} 
                        />
                      </FormControl>
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
                          type="password" 
                          placeholder="Enter your password" 
                          className="bg-darkGray border border-gold/20 text-lightText focus:border-gold"
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
                  {form.formState.isSubmitting ? (
                    <span>Signing In...</span>
                  ) : (
                    <span>Sign In</span>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
