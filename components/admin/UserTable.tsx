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

type User = {
  _id: string;
  clerk_user_id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  status: "pending" | "confirmed" | "disabled";
  created_at: number;
  confirmed_at?: number;
};

export function UserTable() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

  const users = data.users as User[];

  const getStatusBadge = (status: string) => {
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

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge variant="default">Admin</Badge>
    ) : (
      <Badge variant="outline">User</Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          onClick={() => setStatusFilter("all")}
          size="sm"
        >
          All
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          onClick={() => setStatusFilter("pending")}
          size="sm"
        >
          Pending
        </Button>
        <Button
          variant={statusFilter === "confirmed" ? "default" : "outline"}
          onClick={() => setStatusFilter("confirmed")}
          size="sm"
        >
          Confirmed
        </Button>
        <Button
          variant={statusFilter === "disabled" ? "default" : "outline"}
          onClick={() => setStatusFilter("disabled")}
          size="sm"
        >
          Disabled
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {user.status === "pending" && (
                      <Button
                        size="sm"
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

      <div className="text-sm text-muted-foreground">
        Showing {users.length} of {data.total} users
      </div>
    </div>
  );
}
