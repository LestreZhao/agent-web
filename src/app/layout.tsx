import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import "~/styles/globals.css";

export const metadata: Metadata = {
  title: "FusionAI",
  description:
    "A community-driven AI automation framework that builds upon the incredible work of the open source community.",
  icons: [{ rel: "icon", url: "/images/fusion-circle.png" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="min-w-screen relative flex h-[100vh] max-h-screen max-w-[100vw] flex-col overflow-hidden">
        {/* <div className="absolute inset-0 bg-[url('/images/login-bg.png')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-white/60" /> */}
        <main className="w-full flex-1">{children}</main>
        {/* <StagewiseDevToolbar /> */}
        <p className="py-2 text-center text-xs text-gray-500">
          FusionAI 智能体也可能会犯错。请核查重要信息。
        </p>
      </body>
    </html>
  );
}
