import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/lib/ConvexClerkProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { SessionWrapper } from "@/components/wrappers/SessionWrapper";
import { ThemeProvider } from "next-themes";
import { Navbar } from "@/components/navbar";

const displayFont = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
});

const bodyFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Velocity Kicks",
  description: "Streetwear and performance sneaker storefront demo with full CMS controls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} antialiased`}
      >
        <ClerkProvider>
          <ConvexClientProvider>
            <SessionWrapper>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="light"
                  enableSystem
                  disableTransitionOnChange
                >
                <Navbar />
                {children}
              </ThemeProvider>
            </SessionWrapper>
            <Toaster />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
