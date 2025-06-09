import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import "~/styles/globals.css";
import { StagewiseDevToolbar } from "./_components/StagewiseDevToolbar";

export const metadata: Metadata = {
  title: "Fusion AI",
  description:
    "A community-driven AI automation framework that builds upon the incredible work of the open source community.",
  icons: [{ rel: "icon", url: "/images/fusion-circle.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="min-w-screen flex h-[100vh] max-h-screen max-w-[100vw] flex-col overflow-hidden bg-[#f8f8f7]">
        <main className="w-full flex-1">{children}</main>
        {/* <StagewiseDevToolbar /> */}
        <p className="py-2 text-center text-xs text-gray-500">
          FusionAI 智能体也可能会犯错。请核查重要信息。
        </p>
      </body>
    </html>
  );
}
