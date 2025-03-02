import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Heart, 
  MessageSquare, 
  Share, 
  Search, 
  Globe, 
  UserCheck, 
  UserPlus 
} from "lucide-react";
import { getPublishedNotes, followUser, unfollowUser, getFriendActivity } from "@/lib/storage";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const World = () => {
  const [publishedNotes, setPublishedNotes] = useState<any[]>([]);
  const [friendActivity, setFriendActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPublishedNotes = async () => {
      try {
        const notes = await getPublishedNotes();
        setPublishedNotes(notes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching published notes:", error);
        setLoading(false);
      }
    };

    const fetchFriendActivity = async () => {
      if (user) {
        try {
          const activity = await getFriendActivity();
          setFriendActivity(activity);
        } catch (error) {
          console.error("Error fetching friend activity:", error);
        }
      }
    };

    fetchPublishedNotes();
    fetchFriendActivity();
  }, [user]);

  const filteredNotes = searchQuery.trim() === ""
    ? publishedNotes
    : publishedNotes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const handleFollow = async (userId: string, username: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to follow users",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await followUser(userId);
      if (success) {
        toast({
          title: "Success",
          description: `You are now following ${username}`,
        });
      }
    } catch (error) {
      console.error("Error following user:", error);
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      });
    }
  };

  const handleUnfollow = async (userId: string, username: string) => {
    if (!user) return;

    try {
      const success = await unfollowUser(userId);
      if (success) {
        toast({
          title: "Success",
          description: `You have unfollowed ${username}`,
        });
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      toast({
        title: "Error",
        description: "Failed to unfollow user",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const searchUsers = (query: string) => {
    setIsSearchingUsers(true);
    setTimeout(() => {
      const mockUsers = [
        { id: '1', username: 'johndoe', fullName: 'John Doe', avatar: '' },
        { id: '2', username: 'janedoe', fullName: 'Jane Doe', avatar: '' },
        { id: '3', username: 'alice', fullName: 'Alice Smith', avatar: '' },
        { id: '4', username: 'bob', fullName: 'Bob Johnson', avatar: '' },
      ].filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) || 
        user.fullName.toLowerCase().includes(query.toLowerCase())
      );
      
      setUsers(mockUsers);
      setIsSearchingUsers(false);
    }, 500);
  };

  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setUserSearchQuery(query);
    
    if (query.length >= 2) {
      searchUsers(query);
    } else {
      setUsers([]);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">World</h2>
          <p className="text-muted-foreground">
            Discover and read notes shared by the community
          </p>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="activity">Friend Activity</TabsTrigger>
          <TabsTrigger value="users">Find Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <div className="flex gap-2 w-full max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search notes..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse-subtle">
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No notes found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery ? "Try a different search query" : "Be the first to publish a note!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <Card key={note.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={note.authorAvatar} alt={note.author} />
                        <AvatarFallback>{note.author[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <CardDescription className="flex-1 leading-none">
                        {note.author}
                      </CardDescription>
                      <CardDescription className="text-xs">
                        {formatDate(note.date)}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="line-clamp-3 text-sm">
                      {truncateContent(note.content.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1'))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{note.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <Link to={`/shared/${note.shareId}`} className="text-sm text-muted-foreground hover:underline">
                        Read
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="activity">
          {!user ? (
            <Card>
              <CardHeader>
                <CardTitle>Authentication Required</CardTitle>
                <CardDescription>Log in to see your friends' activity</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link to="/login">
                  <Button>Log In</Button>
                </Link>
              </CardFooter>
            </Card>
          ) : friendActivity.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Activity Yet</CardTitle>
                <CardDescription>
                  Follow other users to see their activity in your feed
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="space-y-4">
              {friendActivity.map((activity, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src={activity.avatarUrl} alt={activity.username} />
                        <AvatarFallback>{activity.username[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{activity.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.action} a note • {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {activity.noteTitle && (
                    <CardContent className="pb-2">
                      <div className="border-l-2 border-primary/20 pl-4 py-1">
                        <p className="text-sm font-medium">{activity.noteTitle}</p>
                      </div>
                    </CardContent>
                  )}
                  
                  {activity.noteId && activity.action === 'published' && (
                    <CardFooter>
                      <Link to={`/shared/${activity.noteId}`}>
                        <Button variant="ghost" size="sm">Read Note</Button>
                      </Link>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <div className="flex gap-2 w-full max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for users..."
                className="pl-8"
                value={userSearchQuery}
                onChange={handleUserSearch}
              />
            </div>
          </div>
          
          {userSearchQuery.length > 0 && (
            <div className="mt-4">
              {isSearchingUsers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-pulse-subtle h-8 w-8 rounded-full bg-muted"></div>
                </div>
              ) : users.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No users found matching "{userSearchQuery}"</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map((user) => (
                    <Card key={user.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} alt={user.username} />
                            <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{user.fullName}</CardTitle>
                            <CardDescription>@{user.username}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardFooter className="pt-2 pb-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="ml-auto"
                          onClick={() => handleFollow(user.id, user.username)}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default World;
