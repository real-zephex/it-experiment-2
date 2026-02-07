"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";

export default function PendingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-6 space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Account Pending Approval</h1>
          <p className="text-muted-foreground">
            Your account has been created successfully, but it requires approval
            from an administrator before you can access the application.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm">
            An admin will review your account shortly. You will receive an email
            notification once your account has been confirmed.
          </p>
          <p className="text-sm text-muted-foreground">
            Please check back later or contact support if you have any questions.
          </p>
        </div>
        <div className="pt-4">
          <SignOutButton>
            <Button variant="outline" className="w-full">
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      </Card>
    </div>
  );
}

