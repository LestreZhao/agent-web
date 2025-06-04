import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import "~/styles/globals.css";
import { StagewiseDevToolbar } from "./_components/StagewiseDevToolbar";

export const metadata: Metadata = {
  title: "Fusion",
  description:
    "A community-driven AI automation framework that builds upon the incredible work of the open source community.",
  icons: [{ rel: "icon", url: "/images/fusion-circle.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="min-w-screen flex h-[100vh] max-h-screen flex-col bg-[#f8f8f7]">
        {children}
      </body>
    </html>
  );
}
