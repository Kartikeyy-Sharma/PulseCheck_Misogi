
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTeam } from "@/context/TeamContext";
import { toast } from "sonner";
import { Copy } from 'lucide-react';

export const TeamInvite = () => {
  const { currentTeam } = useTeam();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  
  if (!currentTeam) return null;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(currentTeam.inviteCode);
    toast.success("Invite code copied to clipboard");
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    
    setSending(true);
    
    // Simulate sending invite
    setTimeout(() => {
      toast.success(`Invite sent to ${email}`);
      setEmail('');
      setSending(false);
    }, 1000);
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Invite Team Members</CardTitle>
        <CardDescription>
          Share your team invite code or send email invites
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invite-code">Team Invite Code</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="invite-code"
              value={currentTeam.inviteCode}
              readOnly
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              className="flex-shrink-0"
              onClick={handleCopyInvite}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this code with team members you want to invite.
          </p>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <Label htmlFor="invite-email">Send Email Invite</Label>
          <form onSubmit={handleSendInvite} className="flex items-center space-x-2 mt-2">
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button 
              type="submit" 
              disabled={sending}
              className="flex-shrink-0"
            >
              {sending ? "Sending..." : "Send"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamInvite;
