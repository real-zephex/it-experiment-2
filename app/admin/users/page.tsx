"use client";

import { UserTable } from "@/components/admin/UserTable";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Manage user accounts, confirm pending users, and moderate access.
        </p>
      </div>
      <UserTable />
    </div>
  );
}
