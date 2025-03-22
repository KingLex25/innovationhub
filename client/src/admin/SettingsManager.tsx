import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface Settings {
  id: number;
  siteTitle: string;
  bgImageUrl: string;
  footerText: string;
  createdAt: string;
}

export default function SettingsManager() {
  const { toast } = useToast();
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<Settings>) => apiRequest("PATCH", "/api/settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "The site settings have been updated successfully.",
      });
      setIsEditingGeneral(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateSettings = () => {
    if (settings) {
      updateSettingsMutation.mutate({
        siteTitle: settings.siteTitle,
        bgImageUrl: settings.bgImageUrl,
        footerText: settings.footerText
      });
    }
  };

  const initializeSettings = () => {
    updateSettingsMutation.mutate({
      siteTitle: "La Martiniere College Innovation Club",
      bgImageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      footerText: "© " + new Date().getFullYear() + " Innovation Club, La Martiniere College. All rights reserved."
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gold">Site Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-darkGray border border-gold/20">
          <TabsTrigger value="general" className="data-[state=active]:bg-gold data-[state=active]:text-darkBg">
            General Settings
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-gold data-[state=active]:text-darkBg">
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-lightText">Loading settings...</p>
            </div>
          ) : settings ? (
            <Card className="bg-darkBg border-gold/20">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-gold">General Settings</CardTitle>
                    <CardDescription className="text-lightText/70">Basic site configuration</CardDescription>
                  </div>
                  {!isEditingGeneral ? (
                    <Button 
                      variant="outline" 
                      className="border-gold/20 text-gold hover:bg-gold/10"
                      onClick={() => setIsEditingGeneral(true)}
                    >
                      <i className="fas fa-edit mr-2"></i>Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="border-gold/20 text-lightText hover:bg-darkGray"
                        onClick={() => {
                          // Revert changes
                          queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
                          setIsEditingGeneral(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="bg-gold text-darkBg hover:bg-gold/90"
                        onClick={handleUpdateSettings}
                        disabled={updateSettingsMutation.isPending}
                      >
                        {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Site Title</label>
                  {isEditingGeneral ? (
                    <Input 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={settings.siteTitle}
                      onChange={(e) => {
                        settings.siteTitle = e.target.value;
                        queryClient.setQueryData(["/api/settings"], settings);
                      }}
                    />
                  ) : (
                    <p className="text-lightText bg-darkGray/50 p-2 rounded-md border border-gold/10">
                      {settings.siteTitle}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Footer Text</label>
                  {isEditingGeneral ? (
                    <Textarea 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={settings.footerText}
                      onChange={(e) => {
                        settings.footerText = e.target.value;
                        queryClient.setQueryData(["/api/settings"], settings);
                      }}
                      rows={2}
                    />
                  ) : (
                    <p className="text-lightText bg-darkGray/50 p-2 rounded-md border border-gold/10">
                      {settings.footerText}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-darkBg rounded-lg border border-gold/20 p-8 text-center">
              <p className="text-lightText mb-4">No settings found</p>
              <Button 
                variant="outline" 
                className="border-gold text-gold hover:bg-gold/10"
                onClick={initializeSettings}
              >
                Initialize Settings
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="appearance">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-lightText">Loading settings...</p>
            </div>
          ) : settings ? (
            <Card className="bg-darkBg border-gold/20">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle className="text-gold">Appearance Settings</CardTitle>
                    <CardDescription className="text-lightText/70">Visual configuration of the site</CardDescription>
                  </div>
                  {!isEditingGeneral ? (
                    <Button 
                      variant="outline" 
                      className="border-gold/20 text-gold hover:bg-gold/10"
                      onClick={() => setIsEditingGeneral(true)}
                    >
                      <i className="fas fa-edit mr-2"></i>Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="border-gold/20 text-lightText hover:bg-darkGray"
                        onClick={() => {
                          // Revert changes
                          queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
                          setIsEditingGeneral(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="bg-gold text-darkBg hover:bg-gold/90"
                        onClick={handleUpdateSettings}
                        disabled={updateSettingsMutation.isPending}
                      >
                        {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-lightText">Background Image URL</label>
                  {isEditingGeneral ? (
                    <Input 
                      className="bg-darkGray border-gold/20 text-lightText"
                      value={settings.bgImageUrl}
                      onChange={(e) => {
                        settings.bgImageUrl = e.target.value;
                        queryClient.setQueryData(["/api/settings"], settings);
                      }}
                    />
                  ) : (
                    <p className="text-lightText bg-darkGray/50 p-2 rounded-md border border-gold/10">
                      {settings.bgImageUrl}
                    </p>
                  )}
                </div>
                
                {settings.bgImageUrl && (
                  <div className="space-y-2 pt-2">
                    <label className="text-sm font-medium text-lightText">Background Image Preview</label>
                    <div className="w-full h-48 overflow-hidden rounded-md border border-gold/10">
                      <img 
                        src={settings.bgImageUrl} 
                        alt="Background Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://placehold.co/800x400?text=Image+Not+Found";
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="mt-4 p-4 bg-darkGray/50 rounded-md border border-gold/10">
                  <h4 className="text-gold font-medium mb-2">Theme Customization</h4>
                  <p className="text-lightText text-sm">
                    The theme colors are set to La Martiniere College's brand colors, featuring a black background with gold (#e5c300) accents.
                    These colors are defined in the theme configuration and are used throughout the website.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-darkBg rounded-lg border border-gold/20 p-8 text-center">
              <p className="text-lightText mb-4">No settings found</p>
              <Button 
                variant="outline" 
                className="border-gold text-gold hover:bg-gold/10"
                onClick={initializeSettings}
              >
                Initialize Settings
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
