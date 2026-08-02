"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { updateProfile, uploadAvatar, getProfile } from "@/db";
import { Camera, Loader2, ImagePlus, Trash2 } from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onProfileUpdate: () => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  userId,
  onProfileUpdate,
}: ProfileModalProps) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadProfile();
    }
  }, [isOpen, userId]);

  const loadProfile = async () => {
    const profile = await getProfile(userId);
    if (profile) {
      setName(profile.name || "");
      setImageUrl(profile.image_url || "");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadAvatar(file, userId);
      setImageUrl(url);
      await updateProfile(userId, { image_url: url });
      toast.success("Avatar uploaded");
      onProfileUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await updateProfile(userId, { image_url: "" });
      setImageUrl("");
      toast.success("Photo removed");
      onProfileUpdate();
    } catch (error) {
      toast.error("Failed to remove photo");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(userId, { name, image_url: imageUrl });
      toast.success("Profile updated");
      onProfileUpdate();
      onClose();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-border shadow-md">
                <AvatarImage src={imageUrl} className="object-cover" />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <ImagePlus className="h-6 w-6 text-white" />
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Change Photo
              </p>
              {imageUrl && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-destructive hover:bg-destructive/10"
                  onClick={handleRemovePhoto}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>


          <div className="grid gap-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="bg-muted/50"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isUploading}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
