"use client";

import { FC, useState, useEffect, ChangeEvent } from "react";
import { PhotoUpload } from "./photo-upload";
import { FormGroup } from "./form-group";
import { useAuth } from "@/context/auth-context";
import { getProfile, updateProfile, uploadAvatar } from "@/db/profiles";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const ProfileForm: FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "Joe Doe",
    email: "email@gmail.com",
    phone: "+923123456789",
    bio: "improving my skills that matters in for real world",
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
          fullName: profile.full_name || "Joe Doe",
          email: profile.email || "email@gmail.com",
          phone: profile.phone_number || "+932123456789",
          bio: profile.bio || "improving my skills that matters in for real world",
          avatarUrl: profile.avatar_url || ""
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
        email: formData.email,
        phone_number: formData.phone,
        bio: formData.bio,
        avatar_url: formData.avatarUrl
      });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8b6f5c]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-8 w-full max-w-2xl mx-auto dark:bg-zinc-900 dark:border dark:border-zinc-800">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6 dark:text-zinc-100">Profile</h2>
        
        <PhotoUpload 
          name={formData.fullName} 
          imageUrl={formData.avatarUrl} 
          onUpload={handleUpload}
          isUploading={uploading}
        />
      </div>

      <div className="flex flex-col gap-4">
        <FormGroup
          label="Full Name"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
        <FormGroup
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <FormGroup
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <FormGroup
          label="Bio"
          isTextArea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
        />
      </div>

      <div className="mt-6">
        <button 
          onClick={handleSubmit}
          disabled={saving || uploading}
          className="bg-[#16a34a] text-white font-medium rounded-md px-4 py-2 hover:bg-green-700 transition-colors w-fit flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};
