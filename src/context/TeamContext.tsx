
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Team } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from '@supabase/supabase-js';

interface TeamContextType {
  currentTeam: Team | null;
  teams: Team[];
  loading: boolean;
  createTeam: (name: string) => Promise<Team | null>;
  joinTeam: (inviteCode: string) => Promise<boolean>;
  leaveTeam: () => Promise<void>;
  updateTeam: (team: Partial<Team>) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  getTeamMembers: () => string[];
  isTeamCreator: () => boolean;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

export const TeamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, updateUser } = useAuth();
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Load user's teams when currentUser changes
  useEffect(() => {
    const loadUserTeams = async () => {
      if (!currentUser) {
        setTeams([]);
        setCurrentTeam(null);
        return;
      }
      
      setLoading(true);
      
      try {
        // Get all teams where the user is a member
        const { data, error } = await supabase
          .from('team_members')
          .select(`
            team:team_id (
              id, 
              name, 
              invite_code, 
              created_by, 
              created_at
            )
          `)
          .eq('user_id', currentUser.id);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform the data into Team objects
          const userTeams: Team[] = data.map((item: any) => ({
            id: item.team.id,
            name: item.team.name,
            inviteCode: item.team.invite_code,
            createdBy: item.team.created_by,
            members: [], // Will be fetched separately
            createdAt: new Date(item.team.created_at),
          }));
          
          setTeams(userTeams);
          
          // Set the first team as current team if none is selected
          if (!currentTeam && userTeams.length > 0) {
            setCurrentTeam(userTeams[0]);
            // Load team members for the current team
            await loadTeamMembers(userTeams[0].id);
          }
        } else {
          setTeams([]);
        }
      } catch (error) {
        console.error('Error loading teams:', error);
        toast.error('Failed to load your teams');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserTeams();
  }, [currentUser]);
  
  // Load team members for a specific team
  const loadTeamMembers = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId);
      
      if (error) throw error;
      
      if (data) {
        const memberIds = data.map(member => member.user_id);
        
        // Update the current team with member IDs
        setCurrentTeam(prev => {
          if (prev && prev.id === teamId) {
            return { ...prev, members: memberIds };
          }
          return prev;
        });
        
        // Also update in the teams array
        setTeams(prev => 
          prev.map(team => {
            if (team.id === teamId) {
              return { ...team, members: memberIds };
            }
            return team;
          })
        );
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };
  
  const createTeam = async (name: string): Promise<Team | null> => {
    if (!currentUser) {
      toast.error('You must be logged in to create a team');
      return null;
    }
    
    setLoading(true);
    
    try {
      // Generate a random invite code
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Insert the new team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name,
          invite_code: inviteCode,
          created_by: currentUser.id
        })
        .select('*')
        .single();
      
      if (teamError) throw teamError;
      
      if (!teamData) {
        throw new Error('Failed to create team');
      }
      
      // Add the creator as a team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamData.id,
          user_id: currentUser.id
        });
      
      if (memberError) throw memberError;
      
      // Create the new team object
      const newTeam: Team = {
        id: teamData.id,
        name: teamData.name,
        inviteCode: teamData.invite_code,
        createdBy: teamData.created_by,
        members: [currentUser.id],
        createdAt: new Date(teamData.created_at),
      };
      
      // Update state
      setTeams(prev => [...prev, newTeam]);
      setCurrentTeam(newTeam);
      
      toast.success(`Team "${name}" created successfully!`);
      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      let errorMessage = 'Failed to create team';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if ((error as PostgrestError).code === '23505') {
        errorMessage = 'A team with that invite code already exists. Please try again.';
      }
      
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const joinTeam = async (inviteCode: string): Promise<boolean> => {
    if (!currentUser) {
      toast.error('You must be logged in to join a team');
      return false;
    }
    
    setLoading(true);
    
    try {
      // Find the team by invite code
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();
      
      if (teamError) {
        if (teamError.code === 'PGRST116') {
          toast.error("Invalid invite code. Please check and try again.");
        } else {
          throw teamError;
        }
        return false;
      }
      
      // Check if user is already a member
      const { data: existingMember, error: memberCheckError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamData.id)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      
      if (memberCheckError) throw memberCheckError;
      
      if (existingMember) {
        toast.info("You are already a member of this team.");
        
        // Set this as current team
        const team: Team = {
          id: teamData.id,
          name: teamData.name,
          inviteCode: teamData.invite_code,
          createdBy: teamData.created_by,
          members: [], // Will be loaded later
          createdAt: new Date(teamData.created_at)
        };
        
        setCurrentTeam(team);
        await loadTeamMembers(team.id);
        
        // Add to teams list if not already there
        setTeams(prev => {
          if (!prev.some(t => t.id === team.id)) {
            return [...prev, team];
          }
          return prev;
        });
        
        return true;
      }
      
      // Add user to team
      const { error: joinError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamData.id,
          user_id: currentUser.id
        });
      
      if (joinError) throw joinError;
      
      // Create team object
      const team: Team = {
        id: teamData.id,
        name: teamData.name,
        inviteCode: teamData.invite_code,
        createdBy: teamData.created_by,
        members: [currentUser.id], // Will be fully loaded later
        createdAt: new Date(teamData.created_at)
      };
      
      // Update state
      setTeams(prev => [...prev, team]);
      setCurrentTeam(team);
      await loadTeamMembers(team.id);
      
      toast.success(`Successfully joined team "${team.name}"`);
      return true;
    } catch (error) {
      console.error('Error joining team:', error);
      toast.error('Failed to join team');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const leaveTeam = async () => {
    if (!currentUser || !currentTeam) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', currentTeam.id)
        .eq('user_id', currentUser.id);
      
      if (error) throw error;
      
      // Update state
      setTeams(prev => prev.filter(t => t.id !== currentTeam.id));
      setCurrentTeam(teams.length > 1 ? teams.find(t => t.id !== currentTeam.id) || null : null);
      
      toast.success(`Left team "${currentTeam.name}"`);
    } catch (error) {
      console.error('Error leaving team:', error);
      toast.error('Failed to leave team');
    } finally {
      setLoading(false);
    }
  };
  
  const updateTeam = async (teamUpdates: Partial<Team>) => {
    if (!currentTeam) return;
    
    if (currentUser?.id !== currentTeam.createdBy) {
      toast.error("Only team creators can update team details.");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: teamUpdates.name,
          invite_code: teamUpdates.inviteCode
        })
        .eq('id', currentTeam.id);
      
      if (error) throw error;
      
      // Update state
      const updatedTeam = {
        ...currentTeam,
        name: teamUpdates.name || currentTeam.name,
        inviteCode: teamUpdates.inviteCode || currentTeam.inviteCode
      };
      
      setCurrentTeam(updatedTeam);
      setTeams(prev => prev.map(t => t.id === currentTeam.id ? updatedTeam : t));
      
      toast.success("Team details updated successfully");
    } catch (error) {
      console.error('Error updating team:', error);
      toast.error('Failed to update team');
    } finally {
      setLoading(false);
    }
  };
  
  const removeMember = async (userId: string) => {
    if (!currentTeam) return;
    
    if (currentUser?.id !== currentTeam.createdBy) {
      toast.error("Only team creators can remove members.");
      return;
    }
    
    if (userId === currentUser?.id) {
      toast.error("You cannot remove yourself. Use 'Leave Team' instead.");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', currentTeam.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Update state
      const updatedMembers = currentTeam.members.filter(id => id !== userId);
      setCurrentTeam({ ...currentTeam, members: updatedMembers });
      
      toast.success("Member removed from team");
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    } finally {
      setLoading(false);
    }
  };
  
  const getTeamMembers = () => {
    return currentTeam?.members || [];
  };
  
  const isTeamCreator = () => {
    if (!currentUser || !currentTeam) return false;
    return currentUser.id === currentTeam.createdBy;
  };

  const value = {
    currentTeam,
    teams,
    loading,
    createTeam,
    joinTeam,
    leaveTeam,
    updateTeam,
    removeMember,
    getTeamMembers,
    isTeamCreator
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};
