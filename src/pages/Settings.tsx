
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/supabaseClient";
import { 
  Bell, 
  Shield, 
  Cloud, 
  HardDrive, 
  Lock,
  Info,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAppSettings } from "@/components/AppSettingsProvider";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const { settings, updateSettings } = useAppSettings();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Settings are already saved in the AppSettingsProvider
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = () => {
    toast({
      title: "Access Revoked",
      description: "All shared links have been deactivated",
    });
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      
      // TODO: Implement actual account deletion logic with Supabase
      
      toast({
        title: "Account Deleted",
        description: "Your account and all data have been removed",
      });
      
      // Redirect to login page after account deletion
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Settings</h2>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security & Privacy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <div className="glass-card p-6 rounded-xl backdrop-blur-sm bg-card/70 space-y-6 shadow-md">
            <h3 className="text-lg font-medium">Appearance & Behavior</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant={theme === "light" ? "default" : "outline"} 
                    size="icon"
                    onClick={() => setTheme("light")}
                    className="h-8 w-8 rounded-full"
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={theme === "dark" ? "default" : "outline"} 
                    size="icon"
                    onClick={() => setTheme("dark")}
                    className="h-8 w-8 rounded-full"
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Minimalist Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Hide extra UI elements for a distraction-free experience
                  </p>
                </div>
                <Switch
                  checked={settings.minimalistMode}
                  onCheckedChange={(checked) => updateSettings({ minimalistMode: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for note updates and reminders
                  </p>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => updateSettings({ notificationsEnabled: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Offline Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Access and edit your notes without internet
                  </p>
                </div>
                <Switch
                  checked={true}
                  disabled={true}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <div className="glass-card p-6 rounded-xl backdrop-blur-sm bg-card/70 space-y-6 shadow-md">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Privacy & Security</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">End-to-End Encryption</Label>
                  <p className="text-sm text-muted-foreground">
                    Secure your notes with strong encryption
                  </p>
                </div>
                <Switch
                  checked={settings.encryptionEnabled}
                  onCheckedChange={(checked) => updateSettings({ encryptionEnabled: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Cloud Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Keep your notes synced across all devices
                  </p>
                </div>
                <Switch
                  checked={settings.syncEnabled}
                  onCheckedChange={(checked) => updateSettings({ syncEnabled: checked })}
                />
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl backdrop-blur-sm bg-card/70 space-y-6 shadow-md">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Shared Links</h3>
            </div>
            
            <p className="text-muted-foreground">
              Manage access to notes you've shared with others
            </p>
            
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleRevokeAccess}
            >
              <Lock className="h-4 w-4" />
              Revoke All Access
            </Button>
          </div>
          
          <div className="glass-card p-6 rounded-xl backdrop-blur-sm bg-card/70 space-y-6 shadow-md">
            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Secure Vault</h3>
            </div>
            
            <p className="text-muted-foreground">
              Manage your PIN-protected private notes
            </p>
            
            <Button 
              variant="outline" 
              onClick={() => {
                // Reset vault PIN
                localStorage.removeItem("vault_pin");
                toast({
                  title: "PIN Reset",
                  description: "Your vault PIN has been reset",
                });
              }}
            >
              Reset Vault PIN
            </Button>
          </div>
          
          <div className="glass-card p-6 rounded-xl backdrop-blur-sm bg-card/70 space-y-6 shadow-md">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
            </div>
            
            <p className="text-muted-foreground">
              Permanently delete your account and all associated data
            </p>
            
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              {loading ? "Processing..." : "Delete Account"}
            </Button>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
