
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Settings = () => {
  const { currentUser, updateUser } = useAuth();
  
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });
  
  const [notifications, setNotifications] = useState({
    dailySummary: true,
    blockerAlerts: true,
    teamUpdates: true,
  });
  
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile.name || !profile.email) {
      toast.error("Name and email are required");
      return;
    }
    
    setUpdating(true);
    
    // Update user profile
    setTimeout(() => {
      if (currentUser) {
        updateUser({
          ...currentUser,
          name: profile.name,
          email: profile.email,
        });
      }
      
      toast.success("Profile updated successfully");
      setUpdating(false);
    }, 1000);
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    setChangingPassword(true);
    
    // Simulate password change
    setTimeout(() => {
      toast.success("Password changed successfully");
      setChangingPassword(false);
    }, 1000);
  };

  const handleNotificationChange = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    toast.success(`${setting} notifications ${notifications[setting] ? 'disabled' : 'enabled'}`);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              
              <Button
                type="submit"
                className="bg-pulse-500 hover:bg-pulse-600"
                disabled={updating}
              >
                {updating ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Security</CardTitle>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              
              <Button
                type="submit"
                className="bg-pulse-500 hover:bg-pulse-600"
                disabled={changingPassword}
              >
                {changingPassword ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
            <CardDescription>Manage how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Summary</p>
                  <p className="text-sm text-muted-foreground">Receive a daily summary of team activities</p>
                </div>
                <Switch
                  checked={notifications.dailySummary}
                  onCheckedChange={() => handleNotificationChange('dailySummary')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Blocker Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when team members report blockers</p>
                </div>
                <Switch
                  checked={notifications.blockerAlerts}
                  onCheckedChange={() => handleNotificationChange('blockerAlerts')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Team Updates</p>
                  <p className="text-sm text-muted-foreground">Receive notifications about team changes</p>
                </div>
                <Switch
                  checked={notifications.teamUpdates}
                  onCheckedChange={() => handleNotificationChange('teamUpdates')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
