"use client";

import { FC } from "react";
import { AccountHeader } from "@/components/account/header";
import { ProfileForm } from "@/components/account/profile-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const AccountPage: FC = () => {
  return (
    <div className="min-h-screen bg-[#e8ddd1] flex flex-col">
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center gap-4 px-8 max-w-[1600px] mx-auto w-full">
           <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
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
