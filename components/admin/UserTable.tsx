"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type UserStatusFilter = "all" | "pending" | "confirmed" | "disabled";

export function UserTable() {
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const data = useQuery(api.functions.queries.listUsers, {
    page: 0,
    page_size: 100,
    status_filter: statusFilter,
  });

  const confirmUser = useMutation(api.functions.adminMutations.confirmUser);
  const deleteUser = useMutation(api.functions.adminMutations.deleteUser);

  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmingUserId, setConfirmingUserId] = useState<string | null>(null);

  const handleConfirmUser = async (clerkUserId: string) => {
    try {
      setConfirmingUserId(clerkUserId);
      await confirmUser({ target_clerk_user_id: clerkUserId });
      toast.success("User confirmed successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm user"
      );
    } finally {
      setConfirmingUserId(null);
    }
  };

  const handleDeleteUser = async (clerkUserId: string) => {
    try {
      setDeletingUserId(clerkUserId);
      await deleteUser({ target_clerk_user_id: clerkUserId });
      toast.success("User deleted successfully");
      setDeletingUserId(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user"
      );
      setDeletingUserId(null);
    }
  };

  if (!data) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  const users = data.users;

  const getStatusBadge = (status: "pending" | "confirmed" | "disabled") => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default">Confirmed</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "disabled":
        return <Badge variant="destructive">Disabled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: "user" | "admin") => {
    return role === "admin" ? (
      <Badge variant="default">Admin</Badge>
    ) : (
      <Badge variant="outline">User</Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "confirmed", "disabled"] as const).map((filter) => (
          <Button
            key={filter}
            variant={statusFilter === filter ? "luxury" : "outline"}
            className={cn(
              "rounded-full px-6 h-10 text-[10px] font-bold uppercase tracking-[0.2em]",
              statusFilter === filter 
                ? "bg-[#99cdd8] text-[#25302d]" 
                : "border-white/5 bg-transparent text-[#daebe3]/40 hover:bg-white/5 hover:text-[#daebe3]"
            )}
            onClick={() => setStatusFilter(filter)}
            size="sm"
          >
            {filter}
          </Button>
        ))}
      </div>

      <div className="rounded-3xl border border-white/5 bg-[#25302d]/40 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5 border-none">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/40 h-14 px-6">Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/40 h-14 px-6">Email</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/40 h-14 px-6">Role</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/40 h-14 px-6">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/40 h-14 px-6">Created</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/40 h-14 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableCell colSpan={6} className="h-40 text-center text-[#daebe3]/20 italic">
                  No users found in directory
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="px-6 py-5 font-bold text-[#daebe3] tracking-tight">{user.name}</TableCell>
                  <TableCell className="px-6 py-5 text-[#daebe3]/60">{user.email}</TableCell>
                  <TableCell className="px-6 py-5">
                    <Badge className={cn(
                      "rounded-full px-3 py-1 text-[8px]",
                      user.role === "admin" ? "bg-[#99cdd8]/10 text-[#99cdd8] border-[#99cdd8]/20" : "bg-white/5 text-[#daebe3]/40 border-white/10"
                    )}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5">
                    <Badge className={cn(
                      "rounded-full px-3 py-1 text-[8px]",
                      user.status === "confirmed" ? "bg-green-500/10 text-green-400 border-green-500/20" : 
                      user.status === "pending" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : 
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-5 text-[#daebe3]/30 text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right space-x-2">
                    {user.status === "pending" && (
                      <Button
                        size="sm"
                        variant="luxury"
                        className="rounded-xl bg-[#99cdd8] text-[#25302d] px-4 h-9"
                        onClick={() => handleConfirmUser(user.clerk_user_id)}
                        disabled={confirmingUserId === user.clerk_user_id}
                      >
                        {confirmingUserId === user.clerk_user_id ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          "Confirm"
                        )}
                      </Button>
                    )}
                    <DeleteConfirmDialog
                      userName={user.name}
                      userEmail={user.email}
                      onConfirm={() => handleDeleteUser(user.clerk_user_id)}
                      isDeleting={deletingUserId === user.clerk_user_id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#daebe3]/20">
        Directory Count: {users.length} / {data.total}
      </div>
    </div>
  );
}
