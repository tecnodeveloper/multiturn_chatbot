"use client";

import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountModal } from "@/components/account/account-modal";

const AccountPage: FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-sans">
      <AccountModal isOpen={isOpen} onClose={handleClose} />
    </div>
  );
};

export default AccountPage;
