
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Key, Check, X } from "lucide-react";
import { supabase } from "@/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const Profile = () => {
  const [profile, setProfile] = useState({
    username: "",
    avatar_url: "",
    points: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState({
    current: "",
    new: "",
    confirm: ""
  });
  const [passwordError, setPasswordError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user metadata from auth
      const { data: { user: userData } } = await supabase.auth.getUser();
      if (userData && userData.user_metadata && userData.user_metadata.username) {
        setProfile(prev => ({
          ...prev,
          username: userData.user_metadata.username || userData.email?.split('@')[0] || "User",
          avatar_url: userData.user_metadata.avatar_url || ""
        }));
      } else {
        // Set default profile data from email
        setProfile(prev => ({
          ...prev,
          username: user.email?.split('@')[0] || "User"
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load your profile",
        variant: "destructive"
      });
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Check if avatars bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      let bucketExists = false;
      
      if (buckets) {
        bucketExists = buckets.some(bucket => bucket.name === 'avatars');
      }

      if (!bucketExists) {
        try {
          const { error } = await supabase.storage.createBucket('avatars', {
            public: true
          });
          if (error) console.error('Error creating bucket:', error);
        } catch (error) {
          console.error('Error creating bucket:', error);
        }
      }

      // Upload the file
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        });
        
      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
        }
      });
      
      if (updateError) throw updateError;
      
      setProfile(prev => ({
        ...prev,
        avatar_url: publicUrl
      }));
      
      toast({
        title: "Success",
        description: "Avatar updated successfully"
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error updating avatar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          username: profile.username,
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error updating profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Success",
        description: "Logged out successfully"
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error logging out",
        variant: "destructive"
      });
    }
  };

  const openChangePasswordDialog = () => {
    setPassword({
      current: "",
      new: "",
      confirm: ""
    });
    setPasswordError("");
    setIsPasswordDialogOpen(true);
  };

  const changePassword = async () => {
    try {
      setPasswordError("");
      if (password.new !== password.confirm) {
        setPasswordError("New passwords don't match");
        return;
      }
      if (password.new.length < 6) {
        setPasswordError("Password must be at least 6 characters");
        return;
      }
      setLoading(true);

      // Update password with Supabase
      const { error } = await supabase.auth.updateUser({
        password: password.new
      });
      
      if (error) throw error;
      
      setIsPasswordDialogOpen(false);
      toast({
        title: "Success",
        description: "Password changed successfully"
      });
    } catch (error) {
      console.error("Error changing password:", error);
      setPasswordError(error instanceof Error ? error.message : "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-semibold">Profile Settings</h2>
      
      <div className="glass-card p-6 rounded-xl backdrop-blur-sm bg-card/70 space-y-6 shadow-md">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative">
            <Avatar className="h-24 w-24 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/50 transition-all" onClick={handleAvatarClick}>
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-primary/10">
                <User className="h-12 w-12 text-primary/50" />
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 shadow-md cursor-pointer" onClick={handleAvatarClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                <line x1="12" y1="11" x2="12" y2="17"></line>
                <line x1="9" y1="14" x2="15" y2="14"></line>
              </svg>
            </div>
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-semibold text-2xl text-left">{profile.username || "User"}</h3>
            <p className="text-muted-foreground text-sm">Tap on the avatar to change your profile picture</p>
            <Input type="file" accept="image/*" onChange={uploadAvatar} disabled={loading} className="hidden" id="avatar-upload" ref={fileInputRef} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-base">Username</Label>
          <Input 
            id="username" 
            value={profile.username} 
            onChange={e => setProfile(prev => ({
              ...prev,
              username: e.target.value
            }))} 
            placeholder="Enter username" 
            className="h-11 rounded-lg" 
          />
        </div>

        <div className="space-y-4 pt-2">
          <Button variant="outline" className="w-full justify-start gap-2 h-11 text-base rounded-lg" onClick={openChangePasswordDialog}>
            <Key className="h-5 w-5" />
            Change Password
          </Button>
          
          <Button variant="outline" className="w-full justify-start gap-2 h-11 text-base rounded-lg" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={updateProfile} disabled={loading} className="h-11 px-6">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {passwordError && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                <X className="h-4 w-4" />
                {passwordError}
              </div>}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={password.new} 
                onChange={e => setPassword(prev => ({
                  ...prev,
                  new: e.target.value
                }))} 
                placeholder="Enter new password" 
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={password.confirm} 
                onChange={e => setPassword(prev => ({
                  ...prev,
                  confirm: e.target.value
                }))} 
                placeholder="Confirm new password" 
                className="rounded-lg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)} disabled={loading} className="rounded-full">
              Cancel
            </Button>
            <Button onClick={changePassword} disabled={loading || !password.new || !password.confirm} className="rounded-full">
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
