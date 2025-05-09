
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Activity, ActivityType, Blocker, MoodEntry, TeamActivitySummary, UserActivitySummary, DailyActivitySummary } from '@/types';
import { useAuth } from './AuthContext';
import { useTeam } from './TeamContext';
import { toast } from "sonner";

interface ActivityContextType {
  activities: Activity[];
  blockers: Blocker[];
  moods: MoodEntry[];
  loading: boolean;
  generateMockData: () => void;
  getTeamSummary: () => TeamActivitySummary | null;
  getUserSummary: (userId: string) => UserActivitySummary | null;
  getDailyActivities: (days?: number) => DailyActivitySummary[];
  logBlocker: (description: string, tags: string[]) => void;
  resolveBlocker: (blockerId: string) => void;
  logMood: (mood: MoodEntry['mood'], note?: string) => void;
  getTeamMorale: () => number;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

// Mock user names for generating activities
const MOCK_USER_NAMES: Record<string, string> = {
  '1': 'Demo User',
};

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { currentTeam, getTeamMembers } = useTeam();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from local storage
  useEffect(() => {
    const loadData = () => {
      try {
        const storedActivities = localStorage.getItem('pulsecheck_activities');
        const storedBlockers = localStorage.getItem('pulsecheck_blockers');
        const storedMoods = localStorage.getItem('pulsecheck_moods');
  
        if (storedActivities) {
          const parsedActivities = JSON.parse(storedActivities).map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp)
          }));
          setActivities(parsedActivities);
        }
  
        if (storedBlockers) {
          const parsedBlockers = JSON.parse(storedBlockers).map((b: any) => ({
            ...b,
            createdAt: new Date(b.createdAt),
            resolvedAt: b.resolvedAt ? new Date(b.resolvedAt) : undefined
          }));
          setBlockers(parsedBlockers);
        }
  
        if (storedMoods) {
          const parsedMoods = JSON.parse(storedMoods).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
          setMoods(parsedMoods);
        }
      } catch (e) {
        console.error('Failed to load activity data', e);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save data to local storage when it changes
  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem('pulsecheck_activities', JSON.stringify(activities));
    }
  }, [activities]);

  useEffect(() => {
    if (blockers.length > 0) {
      localStorage.setItem('pulsecheck_blockers', JSON.stringify(blockers));
    }
  }, [blockers]);

  useEffect(() => {
    if (moods.length > 0) {
      localStorage.setItem('pulsecheck_moods', JSON.stringify(moods));
    }
  }, [moods]);

  // Filter data based on current team
  const teamActivities = currentTeam 
    ? activities.filter(a => a.teamId === currentTeam.id)
    : [];
  
  const teamBlockers = currentTeam 
    ? blockers.filter(b => b.teamId === currentTeam.id)
    : [];
  
  const teamMoods = currentTeam 
    ? moods.filter(m => m.teamId === currentTeam.id)
    : [];

  // Generate mock data for the current team and its members
  const generateMockData = () => {
    if (!currentUser || !currentTeam) {
      toast.error("You must be in a team to generate data");
      return;
    }
    
    const teamMembers = getTeamMembers();
    if (teamMembers.length === 0) return;
    
    setLoading(true);
    
    // For each team member, generate some activities
    const newActivities: Activity[] = [];
    const newMoods: MoodEntry[] = [];
    const newBlockers: Blocker[] = [];
    
    // Generate data for the last 14 days
    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);
    
    // Store all member IDs and dynamically add to name mapping
    teamMembers.forEach(memberId => {
      if (!MOCK_USER_NAMES[memberId] && memberId === currentUser.id) {
        MOCK_USER_NAMES[memberId] = currentUser.name;
      } else if (!MOCK_USER_NAMES[memberId]) {
        MOCK_USER_NAMES[memberId] = `Team Member ${memberId.slice(0, 4)}`;
      }
      
      // Generate data for each day
      for (let d = new Date(twoWeeksAgo); d <= today; d.setDate(d.getDate() + 1)) {
        const dayDate = new Date(d);
        const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
        
        // Skip weekends with higher probability
        if (isWeekend && Math.random() < 0.7) continue;
        
        // Generate between 0-10 activities per day
        const dailyActivityCount = Math.floor(Math.random() * (isWeekend ? 5 : 10));
        
        for (let i = 0; i < dailyActivityCount; i++) {
          const activityTypes: ActivityType[] = ['CODE', 'CHAT', 'REVIEW', 'BLOCKER'];
          const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
          const hours = Math.floor(Math.random() * 8) + 9; // 9am to 5pm
          const minutes = Math.floor(Math.random() * 60);
          
          const timestamp = new Date(dayDate);
          timestamp.setHours(hours, minutes);
          
          // Value represents intensity/size of activity
          let value = 1;
          let details = '';
          
          switch(type) {
            case 'CODE':
              value = Math.floor(Math.random() * 5) + 1; // 1-5 commits
              details = `Added ${value} commit${value > 1 ? 's' : ''}`;
              break;
            case 'CHAT':
              value = Math.floor(Math.random() * 10) + 1; // 1-10 messages
              details = `Sent ${value} message${value > 1 ? 's' : ''}`;
              break;
            case 'REVIEW':
              value = Math.floor(Math.random() * 3) + 1; // 1-3 reviews
              details = `Reviewed ${value} PR${value > 1 ? 's' : ''}`;
              break;
            case 'BLOCKER':
              value = 1;
              details = 'Reported a blocker';
              
              // Also create a blocker entry
              if (Math.random() > 0.7) {
                const blockerTags = ['API', 'Frontend', 'Backend', 'DevOps', 'Design', 'Documentation'];
                const selectedTags = Array.from({ length: Math.floor(Math.random() * 3) + 1 })
                  .map(() => blockerTags[Math.floor(Math.random() * blockerTags.length)]);
                
                // Some blockers get resolved
                const resolved = Math.random() > 0.4;
                const resolvedDate = new Date(timestamp);
                if (resolved) {
                  resolvedDate.setHours(resolvedDate.getHours() + Math.floor(Math.random() * 48));
                }
                
                newBlockers.push({
                  id: `b_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`,
                  userId: memberId,
                  teamId: currentTeam.id,
                  description: `Mock blocker: ${['Unable to access API', 'Build fails', 'Test not passing', 'Deployment issue'][Math.floor(Math.random() * 4)]}`,
                  tags: selectedTags,
                  resolved,
                  createdAt: new Date(timestamp),
                  resolvedAt: resolved ? resolvedDate : undefined
                });
              }
              break;
          }
          
          newActivities.push({
            id: `a_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`,
            userId: memberId,
            teamId: currentTeam.id,
            type,
            value,
            timestamp: new Date(timestamp),
            details
          });
        }
        
        // Generate mood (once per day with 60% probability)
        if (Math.random() < 0.6) {
          const moodOptions: MoodEntry['mood'][] = ['GREAT', 'GOOD', 'NEUTRAL', 'BAD', 'AWFUL'];
          const weightedOptions = [
            ...Array(5).fill('GREAT'),
            ...Array(10).fill('GOOD'),
            ...Array(8).fill('NEUTRAL'),
            ...Array(3).fill('BAD'),
            ...Array(1).fill('AWFUL')
          ];
          
          const mood = weightedOptions[Math.floor(Math.random() * weightedOptions.length)] as MoodEntry['mood'];
          
          const moodTime = new Date(dayDate);
          moodTime.setHours(17, Math.floor(Math.random() * 60)); // Around 5pm
          
          newMoods.push({
            id: `m_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`,
            userId: memberId,
            teamId: currentTeam.id,
            mood,
            note: Math.random() > 0.7 ? `Mock mood entry for ${mood}` : undefined,
            timestamp: moodTime
          });
        }
      }
    });
    
    setActivities(prev => [...prev, ...newActivities]);
    setBlockers(prev => [...prev, ...newBlockers]);
    setMoods(prev => [...prev, ...newMoods]);
    
    setLoading(false);
    toast.success("Generated new activity data!");
  };

  // Get a summary of activities for the current team
  const getTeamSummary = (): TeamActivitySummary | null => {
    if (!currentTeam || teamActivities.length === 0) return null;
    
    // Get unique days in the last week
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentActivities = teamActivities.filter(a => a.timestamp > lastWeek);
    if (recentActivities.length === 0) return null;
    
    // Get activities by day
    const activitiesByDay: Record<string, DailyActivitySummary> = {};
    recentActivities.forEach(activity => {
      const dayKey = activity.timestamp.toISOString().split('T')[0];
      if (!activitiesByDay[dayKey]) {
        activitiesByDay[dayKey] = {
          date: new Date(activity.timestamp),
          codeCount: 0,
          chatCount: 0,
          reviewCount: 0,
          blockerCount: 0,
          totalCount: 0
        };
      }
      
      const summary = activitiesByDay[dayKey];
      switch (activity.type) {
        case 'CODE':
          summary.codeCount += activity.value;
          break;
        case 'CHAT':
          summary.chatCount += activity.value;
          break;
        case 'REVIEW':
          summary.reviewCount += activity.value;
          break;
        case 'BLOCKER':
          summary.blockerCount += activity.value;
          break;
      }
      summary.totalCount += activity.value;
    });
    
    // Get activities by user
    const userSummaries: Record<string, UserActivitySummary> = {};
    const teamMemberIds = getTeamMembers();
    
    // Initialize summaries for all team members
    teamMemberIds.forEach(userId => {
      userSummaries[userId] = {
        userId,
        userName: MOCK_USER_NAMES[userId] || `User ${userId.slice(0, 4)}`,
        activityCounts: {
          code: 0,
          chat: 0,
          review: 0,
          blocker: 0,
          total: 0
        },
        participation: 0,
        trend: 'stable'
      };
    });
    
    // Add activity counts
    recentActivities.forEach(activity => {
      if (!userSummaries[activity.userId]) return;
      
      const summary = userSummaries[activity.userId].activityCounts;
      switch (activity.type) {
        case 'CODE':
          summary.code += activity.value;
          break;
        case 'CHAT':
          summary.chat += activity.value;
          break;
        case 'REVIEW':
          summary.review += activity.value;
          break;
        case 'BLOCKER':
          summary.blocker += activity.value;
          break;
      }
      summary.total += activity.value;
    });
    
    // Calculate participation scores and trends
    Object.values(userSummaries).forEach(summary => {
      // Simple participation score based on activity counts
      const total = summary.activityCounts.total;
      const maxPossible = 100; // Arbitrary max score
      summary.participation = Math.min(Math.round((total / maxPossible) * 100), 100);
      
      // Random trend for demo purposes
      const trends: ('up' | 'down' | 'stable')[] = ['up', 'stable', 'down'];
      summary.trend = trends[Math.floor(Math.random() * trends.length)];
    });
    
    // Find peak day and most active user
    let peakDay = '';
    let maxDayActivity = 0;
    Object.entries(activitiesByDay).forEach(([day, summary]) => {
      if (summary.totalCount > maxDayActivity) {
        maxDayActivity = summary.totalCount;
        peakDay = day;
      }
    });
    
    let mostActiveUser = '';
    let maxUserActivity = 0;
    Object.entries(userSummaries).forEach(([userId, summary]) => {
      if (summary.activityCounts.total > maxUserActivity) {
        maxUserActivity = summary.activityCounts.total;
        mostActiveUser = userId;
      }
    });
    
    return {
      teamId: currentTeam.id,
      teamName: currentTeam.name,
      totalActivities: recentActivities.reduce((sum, a) => sum + a.value, 0),
      memberSummaries: Object.values(userSummaries),
      dailyActivities: Object.values(activitiesByDay).sort((a, b) => a.date.getTime() - b.date.getTime()),
      blockers: teamBlockers.filter(b => !b.resolved || new Date(b.createdAt) > lastWeek),
      peakDay,
      mostActiveUser
    };
  };

  // Get activity summary for a specific user
  const getUserSummary = (userId: string): UserActivitySummary | null => {
    if (!currentTeam) return null;
    
    const userName = MOCK_USER_NAMES[userId] || `User ${userId.slice(0, 4)}`;
    
    // Get activities in the last week
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const userActivities = teamActivities.filter(
      a => a.userId === userId && a.timestamp > lastWeek
    );
    
    if (userActivities.length === 0) {
      // Return empty summary if no activities
      return {
        userId,
        userName,
        activityCounts: {
          code: 0,
          chat: 0,
          review: 0,
          blocker: 0,
          total: 0
        },
        participation: 0,
        trend: 'stable'
      };
    }
    
    // Count activities by type
    const activityCounts = {
      code: 0,
      chat: 0,
      review: 0,
      blocker: 0,
      total: 0
    };
    
    userActivities.forEach(activity => {
      switch (activity.type) {
        case 'CODE':
          activityCounts.code += activity.value;
          break;
        case 'CHAT':
          activityCounts.chat += activity.value;
          break;
        case 'REVIEW':
          activityCounts.review += activity.value;
          break;
        case 'BLOCKER':
          activityCounts.blocker += activity.value;
          break;
      }
      activityCounts.total += activity.value;
    });
    
    // Calculate participation score
    const maxPossible = 100; // Arbitrary max score
    const participation = Math.min(Math.round((activityCounts.total / maxPossible) * 100), 100);
    
    // Random trend for demo purposes
    const trends: ('up' | 'down' | 'stable')[] = ['up', 'stable', 'down'];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    
    return {
      userId,
      userName,
      activityCounts,
      participation,
      trend
    };
  };

  // Get daily activity summaries for the team
  const getDailyActivities = (days = 7): DailyActivitySummary[] => {
    if (!currentTeam) return [];
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);
    
    // Initialize an array with empty summaries for each day
    const dailySummaries: DailyActivitySummary[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      dailySummaries.push({
        date: new Date(date),
        codeCount: 0,
        chatCount: 0,
        reviewCount: 0,
        blockerCount: 0,
        totalCount: 0
      });
    }
    
    // Fill in actual activity data
    teamActivities.forEach(activity => {
      if (activity.timestamp < startDate) return;
      
      const activityDate = new Date(activity.timestamp);
      activityDate.setHours(0, 0, 0, 0);
      
      const dayIndex = Math.floor((activityDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < days) {
        const summary = dailySummaries[dayIndex];
        
        switch (activity.type) {
          case 'CODE':
            summary.codeCount += activity.value;
            break;
          case 'CHAT':
            summary.chatCount += activity.value;
            break;
          case 'REVIEW':
            summary.reviewCount += activity.value;
            break;
          case 'BLOCKER':
            summary.blockerCount += activity.value;
            break;
        }
        
        summary.totalCount += activity.value;
      }
    });
    
    return dailySummaries;
  };

  // Log a new blocker
  const logBlocker = (description: string, tags: string[]) => {
    if (!currentUser || !currentTeam) {
      toast.error("You must be in a team to log a blocker");
      return;
    }
    
    const newBlocker: Blocker = {
      id: `b_${Date.now().toString(36)}`,
      userId: currentUser.id,
      teamId: currentTeam.id,
      description,
      tags,
      resolved: false,
      createdAt: new Date()
    };
    
    setBlockers(prev => [...prev, newBlocker]);
    
    // Also add a BLOCKER activity
    const newActivity: Activity = {
      id: `a_${Date.now().toString(36)}`,
      userId: currentUser.id,
      teamId: currentTeam.id,
      type: 'BLOCKER',
      value: 1,
      timestamp: new Date(),
      details: `Reported blocker: ${description.substring(0, 30)}${description.length > 30 ? '...' : ''}`
    };
    
    setActivities(prev => [...prev, newActivity]);
    toast.success("Blocker logged successfully");
  };

  // Resolve a blocker
  const resolveBlocker = (blockerId: string) => {
    setBlockers(prev => prev.map(blocker =>
      blocker.id === blockerId
        ? { ...blocker, resolved: true, resolvedAt: new Date() }
        : blocker
    ));
    toast.success("Blocker marked as resolved");
  };

  // Log a new mood entry
  const logMood = (mood: MoodEntry['mood'], note?: string) => {
    if (!currentUser || !currentTeam) {
      toast.error("You must be in a team to log your mood");
      return;
    }
    
    const newMood: MoodEntry = {
      id: `m_${Date.now().toString(36)}`,
      userId: currentUser.id,
      teamId: currentTeam.id,
      mood,
      note,
      timestamp: new Date()
    };
    
    setMoods(prev => [...prev, newMood]);
    toast.success("Mood logged successfully");
  };

  // Calculate team morale (average of recent mood entries)
  const getTeamMorale = (): number => {
    if (!currentTeam || teamMoods.length === 0) return 3; // Neutral by default
    
    // Get mood entries from the last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentMoods = teamMoods.filter(m => m.timestamp > lastWeek);
    if (recentMoods.length === 0) return 3;
    
    // Convert mood to number score
    const moodScores: Record<MoodEntry['mood'], number> = {
      GREAT: 5,
      GOOD: 4,
      NEUTRAL: 3,
      BAD: 2,
      AWFUL: 1
    };
    
    // Calculate average mood score
    const totalScore = recentMoods.reduce((sum, mood) => sum + moodScores[mood.mood], 0);
    return totalScore / recentMoods.length;
  };

  const value = {
    activities,
    blockers,
    moods,
    loading,
    generateMockData,
    getTeamSummary,
    getUserSummary,
    getDailyActivities,
    logBlocker,
    resolveBlocker,
    logMood,
    getTeamMorale
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};
