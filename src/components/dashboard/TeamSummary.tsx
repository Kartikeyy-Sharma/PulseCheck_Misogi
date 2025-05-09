
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useActivity } from "@/context/ActivityContext";
import { useTeam } from "@/context/TeamContext";
import { Calendar, Users, TrendingUp, Award, Activity } from 'lucide-react';

export const TeamSummary = () => {
  const { currentTeam } = useTeam();
  const { getTeamSummary } = useActivity();
  
  if (!currentTeam) return null;
  
  const teamSummary = getTeamSummary();
  
  // If no summary data, show empty state
  if (!teamSummary) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Team Summary</CardTitle>
          <CardDescription>{currentTeam.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">No activity data yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate active days (days with at least one activity)
  const activeDays = teamSummary.dailyActivities.filter(day => day.totalCount > 0).length;
  
  // Format date for peak day
  const peakDay = teamSummary.peakDay 
    ? new Date(teamSummary.peakDay).toLocaleDateString(undefined, { weekday: 'long' })
    : 'N/A';
  
  // Get most active user
  const mostActiveUser = teamSummary.memberSummaries.find(
    member => member.userId === teamSummary.mostActiveUser
  )?.userName || 'N/A';

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Team Summary</CardTitle>
        <CardDescription>{currentTeam.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pulse-100 rounded-md">
              <Users className="h-5 w-5 text-pulse-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="font-medium">{teamSummary.memberSummaries.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pulse-100 rounded-md">
              <Calendar className="h-5 w-5 text-pulse-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Days</p>
              <p className="font-medium">{activeDays} of 7</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pulse-100 rounded-md">
              <TrendingUp className="h-5 w-5 text-pulse-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Peak Activity</p>
              <p className="font-medium">{peakDay}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pulse-100 rounded-md">
              <Award className="h-5 w-5 text-pulse-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Most Active</p>
              <p className="font-medium">{mostActiveUser}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-pulse-600" />
              <p className="text-sm font-medium">Activity Breakdown</p>
            </div>
            <p className="text-sm font-medium">{teamSummary.totalActivities} total</p>
          </div>
          
          <div className="space-y-2">
            {[
              { type: 'Code', count: teamSummary.dailyActivities.reduce((sum, day) => sum + day.codeCount, 0) },
              { type: 'Chat', count: teamSummary.dailyActivities.reduce((sum, day) => sum + day.chatCount, 0) },
              { type: 'Review', count: teamSummary.dailyActivities.reduce((sum, day) => sum + day.reviewCount, 0) },
            ].map(item => {
              const percentage = Math.round((item.count / teamSummary.totalActivities) * 100) || 0;
              
              return (
                <div key={item.type} className="flex items-center gap-2">
                  <div className="w-24 text-sm">{item.type}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-pulse-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm w-10 text-right">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSummary;
