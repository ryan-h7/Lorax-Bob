'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

interface Avatar {
  id: string;
  name: string;
  emoji?: string;
  imageUrl?: string;
  description: string;
  personality: string;
  isCustom?: boolean;
}

interface CustomAvatarDialogProps {
  onSave: (avatar: Avatar) => void;
  onCancel: () => void;
}

export function CustomAvatarDialog({ onSave, onCancel }: CustomAvatarDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png' && !file.type.startsWith('image/')) {
        alert('Please upload an image file (PNG recommended)');
        return;
      }

      // Check file size (max 500KB to keep localStorage manageable)
      if (file.size > 500 * 1024) {
        alert('Image size should be less than 500KB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a name for your avatar');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description');
      return;
    }
    if (!personality.trim()) {
      alert('Please enter a personality description');
      return;
    }
    if (!imageUrl) {
      alert('Please upload an image');
      return;
    }

    const avatar: Avatar = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      description: description.trim(),
      personality: personality.trim(),
      imageUrl,
      isCustom: true
    };

    onSave(avatar);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create Custom Avatar</CardTitle>
          <CardDescription>
            Upload an image and define your avatar's personality
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Avatar Image</Label>
            <div className="flex flex-col items-center gap-4">
              {imageUrl ? (
                <div className="relative">
                  <img 
                    src={imageUrl} 
                    alt="Avatar preview" 
                    className="w-24 h-24 rounded-full object-cover border-2 border-primary"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={() => setImageUrl(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-full cursor-pointer hover:bg-muted transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-2">Upload Image</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
              <p className="text-xs text-muted-foreground text-center">
                PNG, JPEG, or WebP (max 500KB)
              </p>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="avatar-name">Name</Label>
            <Input
              id="avatar-name"
              placeholder="e.g., Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="avatar-description">Description</Label>
            <Input
              id="avatar-description"
              placeholder="e.g., Friendly and energetic"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Personality */}
          <div className="space-y-2">
            <Label htmlFor="avatar-personality">Personality</Label>
            <Textarea
              id="avatar-personality"
              placeholder="Describe how this avatar should interact with you. What's their style, tone, and approach?"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              rows={4}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">
              {personality.length}/300 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1">
              Create Avatar
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

