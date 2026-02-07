"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="p-6">
          <div className="flex gap-2 mb-6">
            <Button
              variant={mode === "signin" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("signin")}
            >
              Sign In
            </Button>
            <Button
              variant={mode === "signup" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("signup")}
            >
              Sign Up
            </Button>
          </div>

          <div className="flex justify-center">
            {mode === "signin" ? (
              <SignIn 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none",
                  },
                }}
                routing="hash"
              />
            ) : (
              <SignUp 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none",
                  },
                }}
                routing="hash"
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
