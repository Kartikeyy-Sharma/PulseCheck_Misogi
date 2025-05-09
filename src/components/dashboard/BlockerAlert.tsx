
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useActivity } from "@/context/ActivityContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

export const BlockerAlert = () => {
  const { blockers, resolveBlocker } = useActivity();
  
  // Filter for active (unresolved) blockers
  const activeBlockers = blockers.filter(b => !b.resolved);
  
  // Check if we should display alert (3+ active blockers)
  const showAlert = activeBlockers.length >= 3;
  
  // Only show most recent blockers
  const recentBlockers = activeBlockers.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3);

  if (activeBlockers.length === 0) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Blockers</CardTitle>
          <CardDescription>No active blockers reported</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            The team is progressing without any reported blockers.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">Blockers</CardTitle>
            <CardDescription>Active issues blocking progress</CardDescription>
          </div>
          <Badge variant="outline" className="bg-red-50">
            {activeBlockers.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showAlert && (
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Team Health Alert</AlertTitle>
            <AlertDescription>
              {activeBlockers.length} active blockers detected. Team progress may be impacted.
            </AlertDescription>
          </Alert>
        )}
        
        {recentBlockers.map(blocker => (
          <div key={blocker.id} className="p-3 border rounded-md bg-muted/30">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{blocker.description}</p>
                <div className="flex gap-1 mt-1">
                  {blocker.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => resolveBlocker(blocker.id)}
              >
                Resolve
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Reported {new Date(blocker.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
        
        {activeBlockers.length > 3 && (
          <p className="text-xs text-muted-foreground text-center">
            + {activeBlockers.length - 3} more active blockers
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockerAlert;
