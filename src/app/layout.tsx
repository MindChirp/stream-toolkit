import "@/styles/globals.css";

import { type Metadata } from "next";
import { Poppins } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Ultra rizzler overlayprogram",
  description: "Created by Philip's minion",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const poppins = Poppins({
  variable: "--font-poppins",
  weight: "400",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.className}`}>
      <body className="">
        <TRPCReactProvider>
          <HydrateClient>
            <Toaster />
            {children}
          </HydrateClient>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
