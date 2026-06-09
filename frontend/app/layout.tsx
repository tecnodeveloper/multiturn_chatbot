import type { Metadata } from "next";
import { ReactNode } from "react";
import { Providers } from "@/components/providers";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "MultiTurn AI - Chatbot using Llama 3",
  description:
    "An intelligent multi-turn conversation interface powered by Llama 3 and multiple AI providers",
  icons: {
    icon: "/img/TabIconMultiturnAI.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
