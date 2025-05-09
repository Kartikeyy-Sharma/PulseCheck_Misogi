
import React from 'react';
import { useTeam } from '@/context/TeamContext';
import { useActivity } from '@/context/ActivityContext';
import { Button } from '@/components/ui/button';

import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap';
import ActivityChart from '@/components/dashboard/ActivityChart';
import TeamPulseTrend from '@/components/dashboard/TeamPulseTrend';
import BlockerAlert from '@/components/dashboard/BlockerAlert';
import MemberCard from '@/components/dashboard/MemberCard';
import MoodLogger from '@/components/dashboard/MoodLogger';
import BlockerLogger from '@/components/dashboard/BlockerLogger';
import TeamSummary from '@/components/dashboard/TeamSummary';

const Dashboard = () => {
  const { currentTeam } = useTeam();
  const { getTeamSummary, generateMockData } = useActivity();
  
  const teamSummary = getTeamSummary();
  
  // If no team data, show empty state
  if (!currentTeam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">Welcome to PulseCheck</h1>
          <p className="text-muted-foreground mb-6">You need to join or create a team to get started.</p>
          <a href="/team" className="px-4 py-2 bg-pulse-500 hover:bg-pulse-600 text-white rounded-md inline-block">
            Join a Team
          </a>
        </div>
      </div>
    );
  }
  
  // If no activity data, show prompt to generate data
  if (!teamSummary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">No Activity Data</h1>
          <p className="text-muted-foreground mb-6">
            Generate mock activity data to see team insights.
          </p>
          <Button 
            onClick={() => generateMockData()}
            className="bg-pulse-500 hover:bg-pulse-600"
          >
            Generate Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2 sm:py-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold mb-1">Team Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Monitoring team collaboration health</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <ActivityHeatmap />
        </div>
        <div>
          <BlockerAlert />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <ActivityChart />
        <TeamPulseTrend />
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-3">Team Members</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {teamSummary.memberSummaries.slice(0, 4).map((member) => (
            <MemberCard 
              key={member.userId}
              userId={member.userId}
              userName={member.userName}
            />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <TeamSummary />
        <MoodLogger />
        <BlockerLogger />
      </div>
    </div>
  );
};

export default Dashboard;
