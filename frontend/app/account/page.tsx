"use client";

import { FC } from "react";
import { AccountHeader } from "@/components/account/header";
import { ProfileForm } from "@/components/account/profile-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const AccountPage: FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-card border-b border-border">
        <div className="flex items-center gap-4 px-8 max-w-[1600px] mx-auto w-full">
          <AccountHeader />
        </div>
      </div>
      
      <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full flex flex-col items-center">
        <ProfileForm />
      </main>
    </div>
  );
};

export default AccountPage;
