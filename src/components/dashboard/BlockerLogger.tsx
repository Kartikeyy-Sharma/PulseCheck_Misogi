
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useActivity } from "@/context/ActivityContext";
import { X } from 'lucide-react';

export const BlockerLogger = () => {
  const { logBlocker } = useActivity();
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const predefinedTags = ['API', 'Frontend', 'Backend', 'DevOps', 'Design', 'Documentation'];

  const handleAddTag = (tag: string) => {
    if (!tag.trim()) return;
    
    // Normalize tag
    const normalizedTag = tag.trim();
    
    // Don't add duplicates
    if (tags.includes(normalizedTag)) return;
    
    setTags([...tags, normalizedTag]);
    setTagInput('');
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!description) return;
    
    setSubmitting(true);
    
    // Log blocker
    logBlocker(description, tags);
    
    // Reset form
    setDescription('');
    setTags([]);
    setSubmitting(false);
  };

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Report a Blocker</CardTitle>
        <CardDescription>Log issues that are blocking your progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Describe what's blocking your work..."
            className="resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {tag} tag</span>
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddTag(tagInput)}
              disabled={!tagInput.trim()}
            >
              Add
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {predefinedTags.map(tag => (
            <Badge
              key={tag}
              variant="outline"
              className="cursor-pointer hover:bg-muted"
              onClick={() => handleAddTag(tag)}
            >
              + {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-pulse-500 hover:bg-pulse-600"
          disabled={!description.trim() || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting..." : "Submit Blocker"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BlockerLogger;
