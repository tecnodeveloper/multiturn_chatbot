import { FC } from "react";

export const AccountHeader: FC = () => {
  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
      <p className="text-sm text-gray-500 mt-1">
        Manage your profile and preferences
      </p>
    </div>
  );
};
