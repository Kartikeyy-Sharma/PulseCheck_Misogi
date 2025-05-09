
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useActivity } from "@/context/ActivityContext";

export const ActivityHeatmap = () => {
  const { getDailyActivities } = useActivity();
  const dailyActivities = getDailyActivities(7);

  // Get day names for last 7 days
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString(undefined, { weekday: 'short' });
  });

  // Member mock data (for visual layout)
  const members = ['You', 'Alex', 'Sam', 'Jordan', 'Taylor'];

  // Calculate intensity color based on activity count (0-1 scale)
  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    
    // Normalize to 0-1 range (assuming max of 30 activities)
    const intensity = Math.min(count / 30, 1);
    
    if (intensity < 0.2) return 'bg-purple-100';
    if (intensity < 0.4) return 'bg-purple-200';
    if (intensity < 0.6) return 'bg-purple-300';
    if (intensity < 0.8) return 'bg-purple-400';
    return 'bg-pulse-500';
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Team Activity Heatmap</CardTitle>
        <CardDescription>Activity levels across team members</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          {/* Day headers */}
          <div className="grid grid-cols-8 gap-1 px-2">
            <div className="text-xs text-muted-foreground"></div>
            {days.map((day, i) => (
              <div key={`day-${i}`} className="text-xs text-center text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          {/* Member rows */}
          {members.map((member, memberIndex) => (
            <div key={`member-${memberIndex}`} className="grid grid-cols-8 gap-1">
              <div className="text-xs flex items-center">{member}</div>
              {days.map((_, dayIndex) => {
                // Generate random activity count for visual demo
                let activityCount = 0;
                
                if (dailyActivities[dayIndex]) {
                  // For the first row ("You"), use actual data
                  if (memberIndex === 0) {
                    activityCount = dailyActivities[dayIndex].totalCount;
                  } else {
                    // Random data for other members
                    activityCount = Math.floor(Math.random() * 20);
                  }
                }
                
                return (
                  <div
                    key={`cell-${memberIndex}-${dayIndex}`}
                    className={`aspect-square rounded-sm ${getHeatmapColor(activityCount)}`}
                    title={`${activityCount} activities`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-4 items-center">
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <span>Low</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-purple-100 rounded-sm"></div>
              <div className="w-3 h-3 bg-purple-200 rounded-sm"></div>
              <div className="w-3 h-3 bg-purple-300 rounded-sm"></div>
              <div className="w-3 h-3 bg-purple-400 rounded-sm"></div>
              <div className="w-3 h-3 bg-pulse-500 rounded-sm"></div>
            </div>
            <span>High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
