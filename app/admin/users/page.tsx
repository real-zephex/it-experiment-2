"use client";

import { UserTable } from "@/components/admin/UserTable";

export default function AdminUsersPage() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="display-title text-5xl text-[#daebe3]">User Directory</h2>
        <p className="mt-2 text-sm text-[#daebe3]/40 tracking-[0.1em] uppercase font-bold">Manage user accounts, confirm pending users, and moderate access.</p>
      </div>
      <div className="rounded-[2.5rem] border border-white/5 bg-[#2e3935]/40 p-8 backdrop-blur-sm">
        <UserTable />
      </div>
    </div>
  );
}
