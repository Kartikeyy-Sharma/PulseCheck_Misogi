import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useActivity } from "@/context/ActivityContext";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MemberCardProps {
  userId: string;
  userName: string;
}

export const MemberCard: React.FC<MemberCardProps> = ({ userId, userName }) => {
  const { getUserSummary } = useActivity();
  const userSummary = getUserSummary(userId);
  
  if (!userSummary) return null;
  
  const { activityCounts, participation, trend } = userSummary;
  
  // Format data for pie chart
  const chartData = [
    { name: 'Commits', value: activityCounts.code, color: '#9b87f5' },
    { name: 'Messages', value: activityCounts.chat, color: '#7e69ab' },
    { name: 'Reviews', value: activityCounts.review, color: '#b197fc' },
    { name: 'Blockers', value: activityCounts.blocker, color: '#ea384c' },
  ].filter(item => item.value > 0);
  
  // If no activities, add dummy data
  if (chartData.length === 0) {
    chartData.push({ name: 'No Data', value: 1, color: '#e5e7eb' });
  }

  // Get trend icon
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-pulse-100 flex items-center justify-center text-pulse-800 font-semibold">
          {getInitials(userName)}
        </div>
        <div>
          <h3 className="font-medium">{userName}</h3>
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="mr-1">Participation</span>
            {getTrendIcon()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Activity Score</span>
            <span className="text-2xl font-bold">{participation}%</span>
          </div>
          <div className="h-16 w-16">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={15}
                  outerRadius={30}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Legend for pie chart */}
        <div className="flex flex-wrap gap-2 mb-2">
          {chartData.map((entry, idx) => (
            <div key={entry.name} className="flex items-center text-xs mr-3">
              <span
                className="inline-block w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: entry.color }}
              ></span>
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
        <Progress value={participation} className="h-2 mb-3" />
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Commits: <span className="font-medium">{activityCounts.code}</span></div>
          <div>Messages: <span className="font-medium">{activityCounts.chat}</span></div>
          <div>Reviews: <span className="font-medium">{activityCounts.review}</span></div>
          <div>Blockers: <span className="font-medium">{activityCounts.blocker}</span></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberCard;
