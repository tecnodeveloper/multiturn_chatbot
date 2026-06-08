import { FC } from "react";

export const AccountHeader: FC = () => {
  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-white">Account Settings</h1>
      <p className="text-sm text-white/80 mt-1">
        Manage your profile and preferences
      </p>
    </div>
  );
};
