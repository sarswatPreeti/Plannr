import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Camera, Mail, User as UserIcon, Briefcase, MapPin } from "lucide-react";
import { userService } from "@/services/user.service";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        // For now, just show a placeholder message
        toast({
          title: "Coming Soon",
          description: "Avatar upload feature will be available soon",
        });
      }
    };
    input.click();
  };

  const handleRemoveAvatar = () => {
    toast({
      title: "Coming Soon",
      description: "Avatar removal feature will be available soon",
    });
  };

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      setUserData(response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await userService.getUserStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await userService.updateProfile(userData);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto ml-64">
          <div className="max-w-4xl mx-auto p-8">
            <div className="text-center py-8">Loading profile...</div>
          </div>
        </main>
      </div>
    );
  }
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto ml-64">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your personal information and preferences</p>
          </div>

          {/* Profile Picture Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Update your profile picture and personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={userData?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"} />
                    <AvatarFallback>{userData?.name?.substring(0, 2).toUpperCase() || "UN"}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                    onClick={handleAvatarUpload}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{userData?.name || 'User Name'}</h3>
                  <p className="text-sm text-muted-foreground mb-3">Member since {new Date(userData?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleAvatarUpload}>
                      <Camera className="h-4 w-4 mr-2" />
                      Upload new photo
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleRemoveAvatar}>Remove</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      className="pl-9" 
                      value={userData?.name?.split(' ')[0] || ''}
                      onChange={(e) => {
                        const lastName = userData?.name?.split(' ').slice(1).join(' ') || '';
                        setUserData({ ...userData, name: `${e.target.value} ${lastName}`.trim() });
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      className="pl-9" 
                      value={userData?.name?.split(' ').slice(1).join(' ') || ''}
                      onChange={(e) => {
                        const firstName = userData?.name?.split(' ')[0] || '';
                        setUserData({ ...userData, name: `${firstName} ${e.target.value}`.trim() });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john.doe@example.com" 
                    className="pl-9" 
                    value={userData?.email || ''}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="jobTitle" 
                    placeholder="Product Designer" 
                    className="pl-9" 
                    value={userData?.jobTitle || ''}
                    onChange={(e) => setUserData({ ...userData, jobTitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="location" 
                    placeholder="San Francisco, CA" 
                    className="pl-9" 
                    value={userData?.location || ''}
                    onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  className="min-h-24"
                  value={userData?.bio || ''}
                  onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
              <CardDescription>Overview of your activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">{stats?.totalTodos || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Tasks</div>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">{stats?.completedTodos || 0}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-4 bg-secondary/50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{stats?.totalProjects || 0}</div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={loadProfile}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
