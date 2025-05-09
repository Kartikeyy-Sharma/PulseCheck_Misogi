
import React from 'react';
import { useTeam } from '@/context/TeamContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import TeamInvite from '@/components/team/TeamInvite';
import TeamSettings from '@/components/team/TeamSettings';
import TeamSetup from '@/components/team/TeamSetup';

const Team = () => {
  const { currentTeam, isTeamCreator } = useTeam();
  
  // If no team, show team setup
  if (!currentTeam) {
    return <TeamSetup />;
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Mock team members (in a real app, these would come from an API)
  const mockMembers = [
    { id: '1', name: 'Demo User', email: 'demo@example.com', joinedAt: new Date('2023-04-10') },
    { id: '2', name: 'Alex Johnson', email: 'alex@example.com', joinedAt: new Date('2023-04-12') },
    { id: '3', name: 'Sam Taylor', email: 'sam@example.com', joinedAt: new Date('2023-04-15') },
    { id: '4', name: 'Jordan Chen', email: 'jordan@example.com', joinedAt: new Date('2023-04-18') },
    { id: '5', name: 'Taylor Smith', email: 'taylor@example.com', joinedAt: new Date('2023-04-20') },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Team Management</h1>
        <p className="text-muted-foreground">Manage your team and members</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Team Members</CardTitle>
              <CardDescription>
                {mockMembers.length} members in {currentTeam.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-md border"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-pulse-100 text-pulse-800">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground mr-3">
                        Joined {member.joinedAt.toLocaleDateString()}
                      </span>
                      {isTeamCreator() && member.id !== '1' && (
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      )}
                      {member.id === '1' && (
                        <span className="text-xs font-medium text-pulse-800 bg-pulse-100 px-2 py-1 rounded">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <TeamInvite />
          <TeamSettings />
        </div>
      </div>
    </div>
  );
};

export default Team;
