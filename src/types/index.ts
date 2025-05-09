
export type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  teamId?: string;
};

export type Team = {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  members: string[];
  createdAt: Date;
};

export type ActivityType = 'CODE' | 'CHAT' | 'REVIEW' | 'BLOCKER';

export type Activity = {
  id: string;
  userId: string;
  teamId: string;
  type: ActivityType;
  value: number;
  timestamp: Date;
  details?: string;
};

export type Blocker = {
  id: string;
  userId: string;
  teamId: string;
  description: string;
  tags: string[];
  resolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
};

export type MoodEntry = {
  id: string;
  userId: string;
  teamId: string;
  mood: 'GREAT' | 'GOOD' | 'NEUTRAL' | 'BAD' | 'AWFUL';
  note?: string;
  timestamp: Date;
};

export type DailyActivitySummary = {
  date: Date;
  codeCount: number;
  chatCount: number;
  reviewCount: number;
  blockerCount: number;
  totalCount: number;
};

export type UserActivitySummary = {
  userId: string;
  userName: string;
  avatar?: string;
  activityCounts: {
    code: number;
    chat: number;
    review: number;
    blocker: number;
    total: number;
  };
  participation: number;
  trend: 'up' | 'down' | 'stable';
};

export type TeamActivitySummary = {
  teamId: string;
  teamName: string;
  totalActivities: number;
  memberSummaries: UserActivitySummary[];
  dailyActivities: DailyActivitySummary[];
  blockers: Blocker[];
  peakDay: string;
  mostActiveUser: string;
};
