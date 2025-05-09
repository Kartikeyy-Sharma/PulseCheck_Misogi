
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTeam } from "@/context/TeamContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export const TeamSettings = () => {
  const { currentTeam, updateTeam, leaveTeam, isTeamCreator } = useTeam();
  const { currentUser } = useAuth();
  const [teamName, setTeamName] = useState(currentTeam?.name || '');
  const [updating, setUpdating] = useState(false);
  
  if (!currentTeam || !currentUser) return null;
  
  const isCreator = isTeamCreator();

  const handleUpdateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName || teamName === currentTeam.name) {
      return;
    }
    
    setUpdating(true);
    
    // Update team name
    try {
      updateTeam({ name: teamName });
      toast.success("Team name updated successfully");
    } catch (error) {
      console.error('Update team error:', error);
      toast.error("Failed to update team name");
    } finally {
      setUpdating(false);
    }
  };

  const handleLeaveTeam = () => {
    if (confirm("Are you sure you want to leave this team?")) {
      leaveTeam();
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Team Settings</CardTitle>
        <CardDescription>
          Manage your team's settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleUpdateTeam} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={!isCreator || updating}
            />
            {!isCreator && (
              <p className="text-sm text-muted-foreground">
                Only team creators can update the team name.
              </p>
            )}
          </div>
          
          {isCreator && (
            <Button
              type="submit"
              disabled={updating || !teamName || teamName === currentTeam.name}
              className="bg-pulse-500 hover:bg-pulse-600"
            >
              {updating ? "Updating..." : "Update Team"}
            </Button>
          )}
        </form>
        
        <div className="pt-4 mt-4 border-t">
          <Label>Team Actions</Label>
          <div className="mt-2">
            <Button
              variant="destructive"
              onClick={handleLeaveTeam}
            >
              Leave Team
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Leaving the team will remove you from all team activities.
            {isCreator && " As the team creator, you should transfer ownership before leaving."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSettings;
