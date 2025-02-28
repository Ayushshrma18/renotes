
import { useState } from "react";
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
  Link2, 
  Cloud, 
  HardDrive, 
  Lock,
  Info 
} from "lucide-react";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [offlineEnabled, setOfflineEnabled] = useState(true);
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Save settings to local storage
      localStorage.setItem("settings", JSON.stringify({
        notifications: notificationsEnabled,
        darkMode: darkModeEnabled,
        encryption: encryptionEnabled,
        sync: syncEnabled,
        offline: offlineEnabled,
      }));
      
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
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security & Privacy</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <div className="glass-card p-6 rounded-xl backdrop-blur-sm bg-card/70 space-y-6 shadow-md">
            <h3 className="text-lg font-medium">Appearance & Behavior</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
                <Switch
                  checked={darkModeEnabled}
                  onCheckedChange={setDarkModeEnabled}
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
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
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
                  checked={offlineEnabled}
                  onCheckedChange={setOfflineEnabled}
                />
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl backdrop-blur-sm bg-card/70 space-y-6 shadow-md">
            <h3 className="text-lg font-medium">Integrations</h3>
            <p className="text-muted-foreground">
              Connect BFound with other services to enhance your workflow
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start gap-2 h-11">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google Calendar
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-11">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.843 16.287L7.627 14.85l-.986 1.381h1.306l.896.058-.896-.058h2.808l2.424-1.262a6.573 6.573 0 0 0 2.064 1.368l-3.84 1.873a.982.982 0 0 1-.825.04l-1.735-.772zm.164-7.967l-.562 1.022H10.2a4.309 4.309 0 0 1 2.529.813l-.95-1.835H8.45zM21.83 13.164l-2.13-.942a.188.188 0 0 0-.252.1l-.295.687a3.876 3.876 0 0 1-2.86 2.14v.001c-.878.188-1.74.055-2.454-.306a4.84 4.84 0 0 1-1.11-.77 2.97 2.97 0 0 0-.358-.277 4.38 4.38 0 0 0-3.969-.281l3.298-7.024 5.09 5.203a.584.584 0 0 0 .417.159h.03a.586.586 0 0 0 .439-.22l3.95-5.185a.188.188 0 0 0-.139-.307h-7.78a.586.586 0 0 0-.525.325L10.684 11.29a.962.962 0 0 0-.127.538c.02.243.014.424-.082.587a1.203 1.203 0 0 1-.683.53c-.12.043-.229.053-.404.053-.671 0-.903-.217-1.11-.643l-.062-.128H5.592a.586.586 0 0 0-.476.924l3.452 4.913c.148.212.39.336.648.336h5.439a.59.59 0 0 0 .262-.065l6.872-3.427a.187.187 0 0 0 .042-.326v-.418z" />
                </svg>
                Notion
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-11">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.4 7.8l-3.2-3.2c-.8-.8-2-.8-2.8 0l-11 11c-.4.4-.4 1 0 1.4.2.2.4.3.7.3s.5-.1.7-.3l11-11c.4-.4 1-.4 1.4 0l3.2 3.2c.2.2.3.4.3.7s-.1.5-.3.7l-5.4 5.4c-.4.4-.4 1 0 1.4.2.2.4.3.7.3s.5-.1.7-.3l5.4-5.4c.8-.8.8-2 0-2.8z M2 22h20v-2H2v2zM3.4 14.6c.8.8 2 .8 2.8 0l7.8-7.8c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0l-7.8 7.8c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4l7.8-7.8c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0l-7.8 7.8c-.8.8-.8 2 0 2.8l1.4 1.4z" />
                </svg>
                Trello
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-11">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.82 4H4.17C2.97 4 2 4.97 2 6.17v11.65C2 19.03 2.97 20 4.17 20h15.65c1.2 0 2.17-.97 2.17-2.17V6.17C22 4.97 21.03 4 19.82 4z M8.42 16.23c0 1.19-.96 2.16-2.16 2.16s-2.16-.96-2.16-2.16V11.3c0-1.19.96-2.16 2.16-2.16s2.16.96 2.16 2.16v4.93z M14.11 16.23c0 1.19-.96 2.16-2.16 2.16-1.19 0-2.16-.96-2.16-2.16V7.95c0-1.19.96-2.16 2.16-2.16 1.19 0 2.16.96 2.16 2.16v8.28z M19.79 16.23c0 1.19-.96 2.16-2.16 2.16-1.19 0-2.16-.96-2.16-2.16V9.6c0-1.19.96-2.16 2.16-2.16 1.19 0 2.16.96 2.16 2.16v6.63z" />
                </svg>
                Slack
              </Button>
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
                  checked={encryptionEnabled}
                  onCheckedChange={setEncryptionEnabled}
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
                  checked={syncEnabled}
                  onCheckedChange={setSyncEnabled}
                />
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-xl backdrop-blur-sm bg-card/70 space-y-6 shadow-md">
            <div className="flex items-center gap-3">
              <Link2 className="h-5 w-5 text-primary" />
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
          
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6">
          <div className="glass-card p-6 rounded-xl backdrop-blur-sm bg-card/70 space-y-6 shadow-md">
            <h3 className="text-lg font-medium">Account Information</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Contact support to change your email address
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Your username"
                />
              </div>
            </div>
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
