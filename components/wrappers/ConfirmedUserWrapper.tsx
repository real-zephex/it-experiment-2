"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

export function ConfirmedUserWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const dbUser = useQuery(
    api.functions.queries.getUserByClerkId,
    user?.id ? { clerk_user_id: user.id } : "skip"
  );

  useEffect(() => {
    if (isLoaded && user) {
      if (dbUser === null) {
        // User not found in database
        router.push("/account-not-found");
      } else if (dbUser && dbUser.status === "pending") {
        // User is pending
        router.push("/pending");
      } else if (dbUser && dbUser.status === "disabled") {
        // User is disabled
        router.push("/pending");
      }
    }
  }, [isLoaded, user, dbUser, router]);

  if (!isLoaded || dbUser === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (dbUser === null) {
    return null; // Redirecting
  }

  if (dbUser.status !== "confirmed") {
    return null; // Redirecting
  }

  return <>{children}</>;
}
