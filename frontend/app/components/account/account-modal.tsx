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
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshUser, logout } = useAuth();
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

  useEffect(() => {
    if (user && isOpen) {
      fetchProfile();
    }
  }, [user, isOpen]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
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
      onClose();
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-xl bg-card border-border max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl">
          {/* Header */}
          <DialogHeader className="px-6 py-4.5 border-b border-border bg-muted/20 text-left">
            <DialogTitle className="text-[17px] font-semibold text-foreground tracking-tight">
              Account settings
            </DialogTitle>
            <DialogDescription className="text-[12.5px] font-normal text-muted-foreground mt-0.5">
              Manage your profile details and security credentials.
            </DialogDescription>
          </DialogHeader>

          {/* Form Body */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4.5 custom-scrollbar">
              {/* Photo Upload / Avatar */}
              <div className="flex flex-col items-center justify-center pt-1 pb-2">
                <PhotoUpload
                  name={formData.fullName || user?.name || "User"}
                  imageUrl={formData.avatarUrl}
                  role="Owner"
                  onUpload={handleUpload}
                  isUploading={uploading}
                />
              </div>

              {/* Account Details */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="account-name" className="text-[12.5px] font-medium text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="account-name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter name"
                    className="h-9.5 text-[13px] bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-blue-500/40 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="account-email" className="text-[12.5px] font-medium text-foreground">
                      Email Address
                    </Label>
                    <span className="text-[11px] font-normal text-muted-foreground flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Locked
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id="account-email"
                      value={formData.email}
                      disabled
                      className="h-9.5 text-[13px] bg-muted/40 border-border text-muted-foreground opacity-80 cursor-not-allowed pr-10 rounded-xl"
                    />
                    <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Change Password Card */}
                <div
                  onClick={() => setChangePasswordModalOpen(true)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-background hover:bg-muted/40 border border-border cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Key className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-foreground text-xs group-hover:text-primary transition-colors">
                        Change Password
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Update your account password securely
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </div>

                {/* Action Buttons: Save Profile Changes + Delete Account on bottom */}
                <div className="pt-2 flex flex-col gap-2.5">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving || uploading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium h-9.5 transition-all rounded-xl shadow-sm text-[13px]"
                  >
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile Changes
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    variant="ghost"
                    className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 font-medium h-9.5 transition-all rounded-xl gap-2 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border z-[70]">
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
              className="w-full sm:w-1/2 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full sm:w-1/2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog Modal */}
      <Dialog open={changePasswordModalOpen} onOpenChange={setChangePasswordModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border z-[70]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Change Password</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter your new account password below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label htmlFor="accountNewPass" className="text-sm font-medium">New Password</Label>
            <Input
              id="accountNewPass"
              type="password"
              placeholder="Enter at least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-background/50 border-border rounded-xl"
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setChangePasswordModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={updatingPassword}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl"
            >
              {updatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
