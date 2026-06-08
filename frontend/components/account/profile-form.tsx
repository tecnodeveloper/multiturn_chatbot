"use client";

import { FC, useState, useEffect, ChangeEvent } from "react";
import { PhotoUpload } from "./photo-upload";
import { FormGroup } from "./form-group";
import { useAuth } from "@/context/auth-context";
import { getProfile, updateProfile, uploadAvatar } from "@/db/profiles";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const ProfileForm: FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    avatarUrl: ""
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const profile = await getProfile(user!.id);
      if (profile) {
        setFormData({
          fullName: profile.full_name || "",
          email: user?.email || profile.email || "",
          phone: profile.phone_number || "",
          bio: profile.bio || "",
          avatarUrl: profile.image_url || profile.avatar_url || ""
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const url = await uploadAvatar(file, user.id);
      setFormData(prev => ({ ...prev, avatarUrl: url }));
      toast.success("Photo uploaded!");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        full_name: formData.fullName,
        phone_number: formData.phone,
        bio: formData.bio,
        image_url: formData.avatarUrl,
        updated_at: new Date().toISOString()
      });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-8 w-full max-w-2xl mx-auto border border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
      </div>

      <div>
        <PhotoUpload 
          name={formData.fullName || user?.name || "User"} 
          imageUrl={formData.avatarUrl} 
          onUpload={handleUpload}
          isUploading={uploading}
        />
      </div>

      <div className="flex flex-col gap-5">
        <FormGroup
          label="Full Name"
          value={formData.fullName}
          placeholder="Joe Doe"
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
        <FormGroup
          label="Phone Number"
          type="tel"
          value={formData.phone}
          placeholder="+92000 1234567"
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <FormGroup
          label="Bio"
          isTextArea
          value={formData.bio}
          placeholder="Tell us about yourself..."
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        />
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
        <Button 
          onClick={handleSubmit}
          disabled={saving || uploading}
          className="w-full sm:w-auto bg-green-600 text-white font-semibold hover:bg-green-700 h-12 px-10 transition-all shadow-md active:scale-[0.98]"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
        
        <Link href="/dashboard" className="w-full sm:flex-1">
          <Button variant="outline" className="w-full h-12 border-border text-muted-foreground hover:text-foreground hover:bg-muted/50">
            Cancel & Exit
          </Button>
        </Link>
      </div>
    </div>
  );
};
