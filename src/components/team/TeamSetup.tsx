
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeam } from "@/context/TeamContext";
import { toast } from "sonner";

export const TeamSetup = () => {
  const { createTeam, joinTeam, loading } = useTeam();
  const [activeTab, setActiveTab] = useState<string>("join");
  
  const [joinCode, setJoinCode] = useState('');
  const [teamName, setTeamName] = useState('');

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!joinCode) {
      toast.error("Please enter an invite code");
      return;
    }
    
    try {
      await joinTeam(joinCode);
    } catch (error) {
      console.error('Join team error:', error);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName) {
      toast.error("Please enter a team name");
      return;
    }
    
    try {
      await createTeam(teamName);
    } catch (error) {
      console.error('Create team error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Join a Team</CardTitle>
          <CardDescription className="text-center">
            Join an existing team or create your own
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="join"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="join">Join Team</TabsTrigger>
              <TabsTrigger value="create">Create Team</TabsTrigger>
            </TabsList>
            
            <TabsContent value="join">
              <form onSubmit={handleJoinTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="join-code">Team Invite Code</Label>
                  <Input
                    id="join-code"
                    placeholder="Enter invite code (e.g. ABC123)"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    required
                    className="uppercase"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter the invite code provided by your team admin.
                  </p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-pulse-500 hover:bg-pulse-600"
                  disabled={loading}
                >
                  {loading ? "Joining..." : "Join Team"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="create">
              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    placeholder="Enter team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Create a new team that you'll administer.
                  </p>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-pulse-500 hover:bg-pulse-600"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Team"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>For demo purposes, try using the invite code "ENG123"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamSetup;
