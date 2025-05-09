
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useActivity } from "@/context/ActivityContext";

export const ActivityChart = () => {
  const { getDailyActivities } = useActivity();
  const dailyActivities = getDailyActivities(7);
  
  // Format chart data
  const chartData = dailyActivities.map(day => ({
    name: day.date.toLocaleDateString(undefined, { weekday: 'short' }),
    Code: day.codeCount,
    Chat: day.chatCount,
    Review: day.reviewCount,
    Blocker: day.blockerCount,
  }));

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Daily Activity Distribution</CardTitle>
        <CardDescription>Activities by type over the past week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barSize={24}
            >
              <XAxis 
                dataKey="name" 
                scale="point" 
                padding={{ left: 10, right: 10 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value === 0 ? '0' : value.toString()}
              />
              <Tooltip
                formatter={(value, name) => [`${value} activities`, name]}
                labelFormatter={(label) => `${label}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Code" name="Code" fill="#9b87f5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Chat" name="Chat" fill="#7e69ab" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Review" name="Reviews" fill="#b197fc" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Blocker" name="Blockers" fill="#ea384c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;
