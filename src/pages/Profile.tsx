
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserProfile, saveUserProfile, type UserProfile } from "@/lib/storage";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [username, setUsername] = useState(profile.username);

  const handleSave = () => {
    const updatedProfile = { ...profile, username };
    saveUserProfile(updatedProfile);
    setProfile(updatedProfile);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-semibold">Profile Settings</h2>
      
      <div className="glass-card p-6 rounded-lg space-y-6">
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatarUrl} />
            <AvatarFallback>
              <User className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          <Button variant="outline">Change Avatar</Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-secondary rounded-lg">
            <div className="text-2xl font-bold">{profile.points}</div>
            <div className="text-muted-foreground">Total Points</div>
          </div>
          <div className="p-4 bg-secondary rounded-lg">
            <div className="text-2xl font-bold">{profile.streak}</div>
            <div className="text-muted-foreground">Current Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
