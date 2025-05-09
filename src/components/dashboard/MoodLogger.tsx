
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActivity } from "@/context/ActivityContext";

export const MoodLogger = () => {
  const { logMood } = useActivity();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Define mood options
  const moodOptions = [
    { value: 'GREAT', emoji: '😁', label: 'Great' },
    { value: 'GOOD', emoji: '🙂', label: 'Good' },
    { value: 'NEUTRAL', emoji: '😐', label: 'Neutral' },
    { value: 'BAD', emoji: '🙁', label: 'Bad' },
    { value: 'AWFUL', emoji: '😖', label: 'Awful' },
  ];

  const handleSubmit = () => {
    if (!selectedMood) return;
    
    setSubmitting(true);
    
    // Log mood
    logMood(selectedMood as any, note || undefined);
    
    // Reset form
    setSelectedMood(null);
    setNote('');
    setSubmitting(false);
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">How are you feeling today?</CardTitle>
        <CardDescription>Share your mood with the team</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          {moodOptions.map(mood => (
            <Button
              key={mood.value}
              variant={selectedMood === mood.value ? "default" : "outline"}
              className={`flex flex-col items-center h-auto px-3 py-2 ${selectedMood === mood.value ? 'bg-pulse-500 hover:bg-pulse-600' : ''}`}
              onClick={() => setSelectedMood(mood.value)}
            >
              <span className="text-2xl mb-1">{mood.emoji}</span>
              <span className="text-xs">{mood.label}</span>
            </Button>
          ))}
        </div>
        
        <Textarea
          placeholder="Add a note (optional)"
          className="resize-none"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-pulse-500 hover:bg-pulse-600"
          disabled={!selectedMood || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Logging..." : "Log Mood"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MoodLogger;
