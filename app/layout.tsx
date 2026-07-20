import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prooficient™ | Know Whether AI Is Right — And Why",
  description: "Know whether AI is right — and why.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
