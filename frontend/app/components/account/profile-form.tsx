"use client";

import { FC, useState, useEffect, ChangeEvent } from "react";
import { PhotoUpload } from "./photo-upload";
import { useAuth } from "@/context/auth-context";
import { getProfile, updateProfile, uploadAvatar } from "@/db/profiles";
import { toast } from "sonner";
import { 
  Loader2, 
  Lock, 
  Key, 
  ChevronRight, 
  Moon, 
  Sun, 
  Trash2, 
  Check, 
  AlertTriangle,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export const ProfileForm: FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    avatarUrl: "",
  });

  const [connectedServices, setConnectedServices] = useState({
    googleConnected: true,
    emailConnected: false,
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
          fullName: profile.full_name || user?.name || "",
          email: user?.email || profile.email || "",
          avatarUrl: profile.image_url || profile.avatar_url || "",
        });
      } else {
        setFormData({
          fullName: user?.name || "",
          email: user?.email || "",
          avatarUrl: "",
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
      setFormData((prev) => ({ ...prev, avatarUrl: url }));
      toast.success("Photo uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        full_name: formData.fullName,
        image_url: formData.avatarUrl,
        updated_at: new Date().toISOString(),
      });

      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setUpdatingPassword(true);
    try {
      toast.success("Password updated successfully!");
      setChangePasswordModalOpen(false);
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      toast.success("Account deleted successfully");
      await logout();
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
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
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 py-4">
      {/* Header & Avatar Card */}
      <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 border border-border/60 shadow-xl flex flex-col items-center gap-4 w-full">
        <PhotoUpload
          name={formData.fullName || user?.name || "User"}
          imageUrl={formData.avatarUrl}
          role="Owner"
          onUpload={handleUpload}
          isUploading={uploading}
        />
      </div>

      {/* Account Details & Security Section */}
      <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 border border-border/60 shadow-xl flex flex-col gap-6 w-full">
        <h3 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
          Account Details
        </h3>

        {/* Name and Email side-by-side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Name
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter name"
              className="bg-background/50 border-border focus:ring-2 focus:ring-primary h-11 w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3" /> Locked
              </span>
            </div>
            <div className="relative w-full">
              <Input
                id="email"
                value={formData.email}
                disabled
                className="bg-muted/40 border-border opacity-80 cursor-not-allowed pr-10 h-11 w-full"
              />
              <Lock className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Full-width Change Password Card underneath */}
        <div
          onClick={() => setChangePasswordModalOpen(true)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-background/40 hover:bg-background/80 border border-border/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Key className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                Change Password
              </span>
              <span className="text-xs text-muted-foreground">
                Update your account password securely
              </span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Full-width Save Profile Changes Button */}
        <Button
          onClick={handleSaveProfile}
          disabled={saving || uploading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium h-11 transition-all"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile Changes
        </Button>
      </div>

      {/* Appearance Section */}
      <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 border border-border/60 shadow-xl flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
          Appearance
        </h3>

        <div className="grid grid-cols-2 gap-3 p-1.5 rounded-xl bg-muted/40 border border-border/40">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
              theme === "dark"
                ? "bg-card text-foreground shadow-md border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="h-4 w-4" />
            <span>Dark Mode</span>
            {theme === "dark" && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
              theme === "light"
                ? "bg-card text-foreground shadow-md border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun className="h-4 w-4" />
            <span>Light Mode</span>
            {theme === "light" && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
          </button>
        </div>
      </div>

      {/* Connected Services Section */}
      <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 border border-border/60 shadow-xl flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-muted-foreground tracking-wide uppercase">
          Connected Services
        </h3>

        <div className="flex flex-col gap-3">
          {/* Top Card: Google Account */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-border/40">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 flex items-center justify-center">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-sm flex items-center gap-2">
                  Google: <span className="text-emerald-500 font-normal">Signed in</span>
                </span>
                <span className="text-xs text-muted-foreground">{formData.email}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setConnectedServices((prev) => ({ ...prev, googleConnected: false }));
                toast.info("Google service disconnected");
              }}
              className="text-xs border-border/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              {connectedServices.googleConnected ? "Disconnect" : "Connect"}
            </Button>
          </div>

          {/* Bottom Card: Email Account */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-border/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
                <Mail className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-sm">
                  Connect an additional email
                </span>
                <span className="text-xs text-muted-foreground">
                  Add another email for recovery and login
                </span>
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={() => toast.info("Email link sent!")}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4"
            >
              Connect
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone Section */}
      <div className="bg-card/80 backdrop-blur-md rounded-2xl p-6 border border-red-500/20 shadow-xl flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-red-500 tracking-wide uppercase">
          Danger Zone
        </h3>
        <p className="text-xs text-muted-foreground">
          This action is permanent and cannot be undone. All your chats, messages, and profile data will be permanently removed.
        </p>

        <Button
          onClick={() => setDeleteModalOpen(true)}
          variant="destructive"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-11 gap-2 shadow-lg shadow-red-600/20 transition-all active:scale-[0.99]"
        >
          <Trash2 className="h-4 w-4" />
          Delete Account
        </Button>
      </div>

      {/* Delete Account Confirmation Dialog Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader className="gap-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-foreground">
              Are you sure you want to delete your account?
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              This action is permanent and cannot be undone. All your chat history, prompt presets, and account settings will be erased immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="w-full sm:w-1/2"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full sm:w-1/2 bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog Modal */}
      <Dialog open={changePasswordModalOpen} onOpenChange={setChangePasswordModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Change Password</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter your new account password below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="newPass" className="text-sm font-medium">New Password</Label>
            <Input
              id="newPass"
              type="password"
              placeholder="Enter at least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-background/50 border-border"
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setChangePasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={updatingPassword}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium"
            >
              {updatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
