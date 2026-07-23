"use client";

import { AccountHeader } from "@/components/account/AccountHeader";
import { ProfileForm } from "@/components/account/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <AccountHeader
        title="Profile"
        description="Keep your contact details and design preferences up to date."
      />

      <div className="rounded-3xl border border-white/10 bg-base/5 p-6 shadow-glow sm:p-8">
        <ProfileForm />
      </div>
    </div>
  );
}
