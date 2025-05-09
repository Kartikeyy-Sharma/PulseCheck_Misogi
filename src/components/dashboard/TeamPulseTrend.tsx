
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useActivity } from "@/context/ActivityContext";

export const TeamPulseTrend = () => {
  const { getDailyActivities, getTeamMorale } = useActivity();
  const dailyActivities = getDailyActivities(14); // 2 weeks
  const teamMorale = getTeamMorale();
  
  // Format chart data
  const chartData = dailyActivities.map(day => ({
    name: day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    Activity: day.totalCount,
    // Generate slightly smoothed random morale data for visual demo
    Morale: 3 + Math.sin(day.date.getDate() / 3) * 0.8
  }));
  
  // Calculate activity average
  const activityAvg = chartData.reduce((sum, day) => sum + day.Activity, 0) / chartData.length;

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Team Pulse Trend</CardTitle>
        <CardDescription>Activity and morale over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value, index) => index % 2 === 0 ? value : ''}
              />
              <YAxis 
                yAxisId="activity"
                tick={{ fontSize: 12 }}
                domain={[0, 'dataMax + 10']}
              />
              <YAxis 
                yAxisId="morale"
                orientation="right"
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <ReferenceLine 
                y={activityAvg} 
                yAxisId="activity" 
                stroke="#666" 
                strokeDasharray="3 3" 
                label={{ 
                  value: 'Avg',
                  position: 'insideTopRight',
                  fontSize: 12,
                }}
              />
              <Line 
                type="monotone" 
                dataKey="Activity" 
                name="Team Activity" 
                stroke="#9b87f5" 
                strokeWidth={2}
                yAxisId="activity"
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Morale" 
                name="Team Morale" 
                stroke="#4ade80" 
                strokeWidth={2}
                yAxisId="morale"
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-between mt-2 text-sm">
          <div>Activity trend: <span className="font-medium text-pulse-600">Stable</span></div>
          <div>Team morale: <span className="font-medium text-green-500">Good</span></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamPulseTrend;
