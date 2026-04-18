"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Velocity Kicks</p>
          <h1 className="display-title text-5xl">Access Portal</h1>
        </div>
        <Card className="border-border/70 bg-card/90 p-6 backdrop-blur-md">
          <div className="mb-6 flex gap-2">
            <Button
              variant={mode === "signin" ? "default" : "outline"}
              className="flex-1 rounded-full"
              onClick={() => setMode("signin")}
            >
              Sign In
            </Button>
            <Button
              variant={mode === "signup" ? "default" : "outline"}
              className="flex-1 rounded-full"
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
                    card: "shadow-none bg-transparent",
                  },
                }}
                routing="hash"
              />
            ) : (
              <SignUp 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none bg-transparent",
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
